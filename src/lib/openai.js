/**
 * OpenAI API Client for キャラクターシート鋳造所
 * Dual Engine: ChatGPT テキスト生成 + DALL-E 3 画像生成
 */

// ── メモリ限定APIキー管理（localStorage永続化なし） ──
let currentOpenAIApiKey = "";
export const setOpenAIApiKey = (key) => { currentOpenAIApiKey = key; };
export const getOpenAIApiKey = () => currentOpenAIApiKey;

// ── テキスト生成用モデル ──
const TEXT_MODEL_IDS = [
  "gpt-5.5",
  "gpt-5.5-instant",
  "gpt-5.4",
  "gpt-5.4-mini",
  "gpt-5.4-nano",
  "gpt-4o",
  "gpt-4o-mini"
];

// ── 画像生成用モデル ──
const IMAGE_MODEL_IDS = [
  "gpt-image-2",
  "dall-e-3"
];

/**
 * OpenAI Chat Completions API 共通呼び出し
 */
const callChatCompletion = async (modelId, messages, apiKey, timeout = 60000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: messages,
        temperature: 0.8,
        max_tokens: 4096,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`${response.status} ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    if (!text) throw new Error("Empty response");
    return { text, model: modelId };

  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') throw new Error(`Timeout (${timeout / 1000}s)`);
    throw e;
  }
};

/**
 * 単一フィールドのAI生成 (OpenAI版)
 */
export const generateFieldValueOAI = async (fieldKey, fieldLabel, context, onStatusUpdate) => {
  if (!currentOpenAIApiKey) throw new Error("OpenAI API Key が設定されていません。");

  const contextStr = Object.entries(context)
    .filter(([k, v]) => v && k !== fieldKey)
    .slice(0, 10)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  const prompt = `キャラクターデザイナーとして、以下の既存設定に基づいて「${fieldLabel}」の値を1つだけ生成してください。
既存設定: ${contextStr}
結果はその値のみを返してください（説明不要）。日本語で。`;

  const messages = [{ role: "user", content: prompt }];

  for (const modelId of TEXT_MODEL_IDS) {
    try {
      if (onStatusUpdate) onStatusUpdate(`> [API] ${modelId} と交信開始...`);
      const result = await callChatCompletion(modelId, messages, currentOpenAIApiKey);
      if (onStatusUpdate) onStatusUpdate(`> [API] 生成完了 ✓ (${modelId})`);
      return result.text.trim().replace(/^["「『]|["」』]$/g, '');
    } catch (e) {
      console.warn(`[OpenAI FieldGen] ${modelId} failed:`, e.message);
      if (onStatusUpdate) onStatusUpdate(`> [API] ${modelId} 失敗。バイパス中...`);
    }
  }
  throw new Error("OpenAI テキスト生成: 全モデル失敗。");
};

/**
 * ガチャ用AI一括生成 (OpenAI版)
 */
export const generateGachaTextsOAI = async (context, onStatusUpdate) => {
  if (!currentOpenAIApiKey) throw new Error("OpenAI API Key が設定されていません。");

  const prompt = `プロのキャラクターデザイナーとして、以下の設定に基づいて魅力的なキャラクター情報を日本語で生成してください。

設定: 性別=${context.gender}, 年齢=${context.ageGroup}, 性格=${context.personality}, 話し方=${context.speechStyle}, 世界観=${context.eraStyle}, 役割=${context.archetype || '主人公'}

【厳守事項】
- 「性別（${context.gender}）」と「話し方（${context.speechStyle}）」に極めて忠実な一人称（俺、僕、私、あたし等）および語尾（〜だ、〜よ、〜のじゃ等）を採用すること。
- 男性キャラに女性言葉を使わせたり、その逆の不自然な言葉遣いは絶対に避けること。

以下をJSON形式で生成:
- name: 氏名（世界観に適した名前）
- catchphrase: 口癖（15字以内、「」付き）
- dialogue: 代表的な台詞（30字以内、「」付き）
- likes: 好きな物（短く）
- dislikes: 嫌いな物（短く）
- nickname: 二つ名・異名（4〜8字）

出力はJSONのみとし、Markdownのコードブロックなどは使用しないでください。`;

  const messages = [{ role: "user", content: prompt }];

  for (const modelId of TEXT_MODEL_IDS) {
    let timeoutId = null;
    try {
      if (onStatusUpdate) onStatusUpdate(`> [API] ${modelId} と交信開始...`);
      
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 25000); // 25秒タイムアウト

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentOpenAIApiKey}`
        },
        body: JSON.stringify({
          model: modelId,
          messages: messages,
          temperature: 0.8,
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.choices?.[0]?.message?.content || "";
      if (!text) throw new Error("Empty response content");

      if (onStatusUpdate) onStatusUpdate(`> [API] 生成完了 ✓ (${modelId})`);
      return JSON.parse(text);
    } catch (e) {
      let msg = e.message;
      if (e.name === 'AbortError') msg = "Timeout (25s)";
      console.warn(`[OpenAI GachaGen] ${modelId} failed:`, msg);
      if (onStatusUpdate) onStatusUpdate(`> [API] ${modelId} 失敗。バイパス中...`);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }
  return null;
};

/**
 * DALL-E 3 による画像生成
 */
export const generateImageOAI = async (prompt, onStatusUpdate) => {
  if (!currentOpenAIApiKey) throw new Error("OpenAI API Key が設定されていません。");

  // DALL-E 3 向けの高画質化・フォーマットメタ指示を追加
  const dallePrompt = `Please generate an illustration of a character perfectly reflecting the settings below.
Make it a masterpiece, highest quality, and highly detailed anime style.
Strictly include all elements mentioned in the "Character Settings" (hairstyle, clothing, accessories, colors, etc.) without missing any details.
Automatically generate a background that fits the character's attributes and world setting.

# Character Settings:
${prompt}`;

  let lastError = null;

  for (const modelId of IMAGE_MODEL_IDS) {
    let timeoutId = null;
    try {
      if (onStatusUpdate) onStatusUpdate(`> [画像] ${modelId} で鋳造開始... (2〜5分)`);
      
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 300000); // 300秒

      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentOpenAIApiKey}`
        },
        body: JSON.stringify({
          model: modelId,
          prompt: dallePrompt,
          n: 1,
          size: "1024x1792", // 縦長
          quality: "high"
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const imgData = data.data?.[0];
      if (!imgData) {
        throw new Error("APIレスポンスに画像データが含まれていませんでした。");
      }

      let base64Img = imgData.b64_json;
      if (!base64Img && imgData.url) {
        if (onStatusUpdate) onStatusUpdate(`> [画像] URLから画像をダウンロード中...`);
        const imgRes = await fetch(imgData.url);
        if (!imgRes.ok) {
          throw new Error(`画像URLの取得に失敗しました: ${imgRes.statusText}`);
        }
        const arrayBuffer = await imgRes.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        base64Img = btoa(binary);
      }

      if (base64Img) {
        if (onStatusUpdate) onStatusUpdate(`> [画像] 鋳造完了 ✓ (${modelId})`);
        return { base64Img, usedModel: modelId };
      }
      
      throw new Error("APIレスポンスに有効な画像データ（base64またはURL）が含まれていませんでした。");
    } catch (err) {
      let msg = err.message;
      if (err.name === 'AbortError') msg = "Timeout (300s)";
      console.warn(`[ImageGen] ${modelId} failed:`, msg);
      lastError = err;
      
      if (msg.includes("safety") || msg.includes("SAFETY") || msg.includes("content_policy")) {
        throw new Error("【コンテンツ制限】安全フィルターにより画像生成がブロックされました。");
      }
      if (onStatusUpdate) onStatusUpdate(`> [画像] ${modelId} 失敗。次のモデルへ...`);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  throw new Error(`画像生成エラー: ${lastError?.message || "全モデル失敗"}`);
};
