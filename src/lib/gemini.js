/**
 * Gemini API Client for キャラクターシート鋳造所
 * Nano Banana Pro最新版のZenith Protocolを踏襲（順序・名称完全一致）
 * ※ このアプリ専用。Nano Banana Proとは完全独立。
 */

// テキストのみリクエスト用: Next-Gen優先（Nano Banana Pro最新版準拠）
const TEXT_MODEL_IDS = [
  "gemini-3-flash-preview",           // Primary: Next-Gen
  "gemini-2.5-pro",                   // Backup 1: 高品質・安定
  "gemini-2.5-flash",                 // Backup 2: 高速
  "gemini-2.5-flash-lite",            // Fallback 1: 軽量安定
  "gemini-3.1-flash-lite-preview"     // Fallback 2: Next-Gen Lite Preview
];

// メモリ限定APIキー管理（セキュリティ要件: localStorage永続化なし）
let currentApiKey = "";

export const setApiKey = (key) => { currentApiKey = key; };
export const getApiKey = () => currentApiKey;

/**
 * 診断機能: このAPIキーで利用可能なモデル一覧を取得
 */
export const diagnoseConnection = async () => {
  if (!currentApiKey) return "API Key not set.";
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${currentApiKey}`);
    const data = await response.json();
    if (data.error) return `API Error: ${data.error.message}`;
    if (!data.models) return "No models returned by API.";
    const relevantModels = data.models
      .map(m => m.name.replace("models/", ""))
      .filter(name => name.includes("gemini") || name.includes("imagen"));
    return `Available Models: ${relevantModels.join(", ")}`;
  } catch (e) {
    return `Diagnostic Failed: ${e.message}`;
  }
};

/**
 * テキスト生成（Zenith Protocol フォールバック付き）
 * @param {string} prompt プロンプト
 * @param {function} onStatusUpdate ステータス更新コールバック
 * @param {object} options 追加オプション（responseMimeType, responseSchema等）
 * @returns {{ text: string, model: string }}
 */
export const callGeminiText = async (prompt, onStatusUpdate, options = {}) => {
  if (!currentApiKey) throw new Error("API Key が設定されていません。");

  for (const modelId of TEXT_MODEL_IDS) {
    try {
      if (onStatusUpdate) onStatusUpdate(`> [API] ${modelId} と交信開始...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 4096,
          ...(options.responseMimeType && { responseMimeType: options.responseMimeType }),
          ...(options.responseSchema && { responseSchema: options.responseSchema }),
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ]
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${currentApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      const data = await response.json();

      if (data.error) {
        throw new Error(`${data.error.message} (Code: ${data.error.code})`);
      }

      const candidates = data.candidates || [];
      if (!candidates.length) {
        if (onStatusUpdate) onStatusUpdate(`> [API] モデル応答なし。次のモデルへバイパス...`);
        throw new Error("No response candidates");
      }

      const text = candidates[0]?.content?.parts?.[0]?.text || "";
      if (!text) {
        if (onStatusUpdate) onStatusUpdate(`> [API] 空レスポンス。次のモデルへバイパス...`);
        throw new Error("Empty response text");
      }

      if (onStatusUpdate) onStatusUpdate(`> [API] 生成完了 ✓ (${modelId})`);
      return { text, model: modelId };

    } catch (err) {
      let msg = err.message;
      if (err.name === 'AbortError') msg = "Timeout (60s)";
      console.warn(`[Gemini] ${modelId} failed:`, msg);
      if (onStatusUpdate) {
        if (msg.includes("429") || msg.includes("Quota")) {
          onStatusUpdate(`> [API] 回数制限検知。次のモデルへ...`);
        } else {
          onStatusUpdate(`> [API] ${modelId} 失敗。バイパス中...`);
        }
      }
    }
  }

  // 全モデル失敗: 診断実行
  if (onStatusUpdate) onStatusUpdate("> [API] 全モデル通信失敗。診断を実行中...");
  const diagnosis = await diagnoseConnection();
  console.error("DIAGNOSIS:", diagnosis);

  let errorMsg = `全モデル接続失敗: ${diagnosis}`;
  if (diagnosis.includes("Quota") || diagnosis.includes("429")) {
    errorMsg = "【API制限】使用回数の上限に達しました。しばらく待ってから再試行してください。";
  } else if (diagnosis.includes("404")) {
    errorMsg = "【モデル未検出】使用可能なモデルが見つかりません。APIキーを確認してください。";
  }
  throw new Error(errorMsg);
};

/**
 * 単一フィールドのAI生成
 * @param {string} fieldKey フィールド名
 * @param {string} fieldLabel フィールドラベル
 * @param {object} context 他フィールドのコンテキスト
 * @returns {string} 生成結果
 */
export const generateFieldValue = async (fieldKey, fieldLabel, context, onStatusUpdate) => {
  const contextStr = Object.entries(context)
    .filter(([k, v]) => v && k !== fieldKey)
    .slice(0, 10)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  const prompt = `キャラクターデザイナーとして、以下の既存設定に基づいて「${fieldLabel}」の値を1つだけ生成してください。
既存設定: ${contextStr}
結果はその値のみを返してください（説明不要）。日本語で。`;

  const result = await callGeminiText(prompt, onStatusUpdate);
  return result.text.trim().replace(/^["「『]|["」』]$/g, '');
};

/**
 * ガチャ用AI一括生成
 * @param {object} context 固定フィールドのコンテキスト
 * @returns {{ name, catchphrase, dialogue, likes, dislikes, nickname }}
 */
export const generateGachaTexts = async (context, onStatusUpdate) => {
  const prompt = `プロのキャラクターデザイナーとして、以下の設定に基づいて魅力的なキャラクター情報を日本語で生成してください。
設定: 性別=${context.gender}, 性格=${context.personality}, 世界観=${context.eraStyle}, 画風=${context.artStyle}, 役割=${context.archetype || '主人公'}
以下をJSON形式で生成:
- name: 氏名（世界観に適した名前）
- catchphrase: 口癖（15字以内、「」付き）
- dialogue: 代表的な台詞（30字以内、「」付き）
- likes: 好きな物（短く）
- dislikes: 嫌いな物（短く）
- nickname: 二つ名・異名（4〜8字）`;

  try {
    const result = await callGeminiText(prompt, onStatusUpdate, {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          catchphrase: { type: "STRING" },
          dialogue: { type: "STRING" },
          likes: { type: "STRING" },
          dislikes: { type: "STRING" },
          nickname: { type: "STRING" },
        }
      }
    });
    return JSON.parse(result.text);
  } catch {
    return null;
  }
};
