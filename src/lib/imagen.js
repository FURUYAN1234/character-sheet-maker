/**
 * 画像生成 API Client for キャラクターシート鋳造所
 * Nano Banana Pro最新版のIMGEN Zenith Protocolを踏襲（順序・名称完全一致）
 * ※ このアプリ専用。Nano Banana Proとは完全独立。
 */
import { getApiKey, diagnoseConnection } from "./gemini";

// 画像生成モデル順序（Nano Banana Pro最新版準拠）
const MODELS_TO_TRY = [
  "gemini-3.1-flash-image-preview",  // Nano Banana 2 NEXT GEN (Native Visual/Text Rendering)
  "imagen-4.0-generate-001",         // Nano Banana 2 Primary
  "imagen-4.0-fast-generate-001",    // Nano Banana 2 Fast
  "imagen-3.0-generate-001",         // Fallback (legacy insurance)
  "imagen-3.0-fast-generate-001"     // Fallback (legacy insurance)
];

/**
 * 画像生成（Zenith Protocol フォールバック付き）
 * Geminiモデルは generateContent + responseModalities: ["IMAGE"]
 * Imagenモデルは predict エンドポイント
 * @param {string} prompt 画像生成用プロンプト
 * @param {function} onStatusUpdate ステータス更新コールバック
 * @returns {{ base64Img: string, usedModel: string }}
 */
export const generateImage = async (prompt, onStatusUpdate) => {
  const currentApiKey = getApiKey();
  if (!currentApiKey) throw new Error("API Key が設定されていません。");

  let lastError = null;
  const attemptedModels = [];

  for (const modelId of MODELS_TO_TRY) {
    try {
      console.log(`[ImageGen] Attempting: ${modelId}`);
      attemptedModels.push(modelId);
      if (onStatusUpdate) onStatusUpdate(`> [画像] ${modelId} で鋳造開始...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120秒タイムアウト

      let response, data;

      if (modelId.startsWith("gemini")) {
        // Geminiマルチモーダル画像生成
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${currentApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: { responseModalities: ["IMAGE"] }
            }),
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);
        data = await response.json();

        if (data.error) throw new Error(`${data.error.message} (Code: ${data.error.code})`);

        if (data.candidates?.[0]?.content?.parts) {
          const imagePart = data.candidates[0].content.parts.find(p => p.inlineData);
          if (imagePart?.inlineData?.data) {
            if (onStatusUpdate) onStatusUpdate(`> [画像] 鋳造完了 ✓ (${modelId})`);
            return { base64Img: imagePart.inlineData.data, usedModel: modelId };
          }
        }
        throw new Error(`Unexpected format from ${modelId}: missing inlineData`);

      } else {
        // Imagen APIエンドポイント（predict）
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${currentApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              instances: [{ prompt }],
              parameters: {
                sampleCount: 1,
                aspectRatio: "2:3", // キャラクターシート用縦長比率
                personGeneration: "allow_adult"
              }
            }),
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);
        data = await response.json();

        if (data.error) throw new Error(`${data.error.message} (Code: ${data.error.code})`);

        if (data.predictions?.[0]?.bytesBase64Encoded) {
          if (onStatusUpdate) onStatusUpdate(`> [画像] 鋳造完了 ✓ (${modelId})`);
          return { base64Img: data.predictions[0].bytesBase64Encoded, usedModel: modelId };
        }
        if (data.predictions?.[0] && typeof data.predictions[0] === 'string') {
          if (onStatusUpdate) onStatusUpdate(`> [画像] 鋳造完了 ✓ (${modelId})`);
          return { base64Img: data.predictions[0], usedModel: modelId };
        }
        throw new Error(`Unexpected format from ${modelId}`);
      }
    } catch (e) {
      let msg = e.message;
      if (e.name === 'AbortError') msg = "Timeout (120s)";
      console.warn(`[ImageGen] ${modelId} failed:`, msg);
      lastError = new Error(msg);
      if (onStatusUpdate) onStatusUpdate(`> [画像] ${modelId} 失敗: ${msg.substring(0, 60)}`);
    }
  }

  // 全モデル失敗: 診断
  if (onStatusUpdate) onStatusUpdate("> [画像] 全モデル失敗。アカウント診断中...");
  try {
    const diagnosis = await diagnoseConnection();
    console.error("IMAGE DIAGNOSIS:", diagnosis);
    let errorMsg = `画像生成全モデルエラー。\n${diagnosis}`;
    if (diagnosis.includes("Quota") || diagnosis.includes("429")) {
      errorMsg = "【API制限】画像生成の使用回数上限に達しました。";
    } else if (diagnosis.includes("SAFETY") || diagnosis.includes("PROHIBITED")) {
      errorMsg = "【コンテンツ制限】安全フィルターにより画像生成がブロックされました。";
    } else if (diagnosis.includes("404")) {
      errorMsg = "【モデル未検出】画像生成可能なモデルが利用できません。";
    }
    throw new Error(errorMsg);
  } catch (diagErr) {
    if (diagErr.message.includes("API制限") || diagErr.message.includes("コンテンツ制限") || diagErr.message.includes("モデル未検出")) {
      throw diagErr;
    }
    throw lastError || new Error(`全画像モデル失敗 (${attemptedModels.join(", ")})`);
  }
};
