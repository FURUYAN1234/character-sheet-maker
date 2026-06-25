import { getApiKey, diagnoseConnection } from "./gemini";

const IMAGE_TIMEOUT_MS = 300000;
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const MODELS_TO_TRY = [
  "gemini-3.1-flash-image"
];

const buildGeminiHeaders = (apiKey) => ({
  "Content-Type": "application/json",
  "x-goog-api-key": apiKey
});

const buildGeminiImageBody = (prompt) => ({
  contents: [{ role: "user", parts: [{ text: prompt }] }],
  generationConfig: {
    responseModalities: ["TEXT", "IMAGE"]
  }
});

const extractGeminiImage = (data, modelId) => {
  const parts = data.candidates?.flatMap(candidate => candidate.content?.parts || []) || [];
  const imagePart = parts
    .filter(part => part.inlineData?.data)
    .sort((a, b) => (b.inlineData.data?.length || 0) - (a.inlineData.data?.length || 0))[0];

  if (!imagePart) {
    const textResponse = parts
      .map(part => part.text)
      .filter(Boolean)
      .join(" ")
      .slice(0, 500);
    const suffix = textResponse ? ` Text response: ${textResponse}` : "";
    throw new Error(`Unexpected format from ${modelId}: missing inlineData.${suffix}`);
  }

  return {
    base64Img: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType || "image/png",
    usedModel: modelId
  };
};

export const generateImage = async (prompt, onStatusUpdate) => {
  const currentApiKey = getApiKey();
  if (!currentApiKey) throw new Error("Gemini API key is not set.");

  let lastError = null;
  const attemptedModels = [];

  for (const modelId of MODELS_TO_TRY) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);

    try {
      console.log(`[ImageGen] Attempting: ${modelId}`);
      attemptedModels.push(modelId);
      if (onStatusUpdate) onStatusUpdate(`> [image] ${modelId} generation started... (2-5 min)`);

      const response = await fetch(
        `${GEMINI_API_BASE}/models/${modelId}:generateContent`,
        {
          method: "POST",
          headers: buildGeminiHeaders(currentApiKey),
          body: JSON.stringify(buildGeminiImageBody(prompt)),
          signal: controller.signal,
        }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.error) {
        throw new Error(`API Error: ${response.status} ${data.error?.message || response.statusText}`);
      }

      const result = extractGeminiImage(data, modelId);
      if (onStatusUpdate) onStatusUpdate(`> [image] generation complete (${modelId})`);
      return result;
    } catch (e) {
      const msg = e.name === "AbortError" ? `Timeout (${IMAGE_TIMEOUT_MS / 1000}s)` : e.message;
      console.warn(`[ImageGen] ${modelId} failed:`, msg);
      lastError = new Error(msg);
      if (onStatusUpdate) onStatusUpdate(`> [image] ${modelId} failed: ${msg.substring(0, 80)}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (onStatusUpdate) onStatusUpdate("> [image] all Gemini image models failed. Running account diagnostics...");
  try {
    const diagnosis = await diagnoseConnection();
    console.error("IMAGE DIAGNOSIS:", diagnosis);
    if (diagnosis.includes("Quota") || diagnosis.includes("429")) {
      throw new Error("Gemini image generation quota was exceeded. Wait and retry later.");
    }
    if (diagnosis.includes("SAFETY") || diagnosis.includes("PROHIBITED")) {
      throw new Error("Gemini image generation was blocked by the safety filter.");
    }
    if (diagnosis.includes("404")) {
      throw new Error("Gemini image generation model is unavailable for this API key.");
    }
    throw new Error(`All Gemini image models failed. ${diagnosis}`);
  } catch (diagErr) {
    throw diagErr || lastError || new Error(`All image generation models failed (${attemptedModels.join(", ")}).`);
  }
};
