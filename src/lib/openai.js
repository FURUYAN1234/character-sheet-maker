let currentOpenAIApiKey = "";

export const setOpenAIApiKey = (key) => {
  currentOpenAIApiKey = key;
};

export const getOpenAIApiKey = () => currentOpenAIApiKey;

const TEXT_MODEL_IDS = [
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  "gpt-4o"
];

const OPENAI_IMAGE_MODEL = "gpt-image-2";
const OPENAI_IMAGE_TIMEOUT_MS = 600000;
const OPENAI_IMAGE_TIMEOUT_SECONDS = OPENAI_IMAGE_TIMEOUT_MS / 1000;
const OPENAI_IMAGE_PROMPT_MAX_CHARS = 32000;

const callChatCompletion = async (modelId, messages, apiKey, options = {}) => {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs || 60000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        messages,
        temperature: options.temperature ?? 0.8,
        max_tokens: options.maxTokens ?? 4096,
        ...(options.responseFormat ? { response_format: options.responseFormat } : {})
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(`${response.status} ${data.error?.message || response.statusText}`);
    }

    const text = data.choices?.[0]?.message?.content || "";
    if (!text) throw new Error("Empty response");
    return { text, model: modelId };
  } catch (e) {
    if (e.name === "AbortError") throw new Error(`Timeout (${timeoutMs / 1000}s)`);
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
};

const contextToPromptText = (context, skipKey) => Object.entries(context)
  .filter(([key, value]) => value && key !== skipKey)
  .slice(0, 18)
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n");

export const generateFieldValueOAI = async (fieldKey, fieldLabel, context, onStatusUpdate) => {
  if (!currentOpenAIApiKey) throw new Error("OpenAI API key is not set.");

  const prompt = `You are a professional Japanese character-sheet designer.
Generate exactly one concise Japanese value for the field below.
Return the value only. Do not add explanations, quotes, Markdown, or labels.

Field: ${fieldLabel}
Existing settings:
${contextToPromptText(context, fieldKey)}`;

  const messages = [{ role: "user", content: prompt }];

  for (const modelId of TEXT_MODEL_IDS) {
    try {
      if (onStatusUpdate) onStatusUpdate(`> [API] ${modelId} starting...`);
      const result = await callChatCompletion(modelId, messages, currentOpenAIApiKey);
      if (onStatusUpdate) onStatusUpdate(`> [API] complete (${modelId})`);
      return result.text.trim().replace(/^["「『]|["」』]$/g, "");
    } catch (e) {
      console.warn(`[OpenAI FieldGen] ${modelId} failed:`, e.message);
      if (onStatusUpdate) onStatusUpdate(`> [API] ${modelId} failed. Trying next model...`);
    }
  }

  throw new Error("OpenAI text generation failed for all fallback models.");
};

export const generateGachaTextsOAI = async (context, onStatusUpdate) => {
  if (!currentOpenAIApiKey) throw new Error("OpenAI API key is not set.");

  const prompt = `You are a professional Japanese character-sheet designer.
Generate vivid, coherent character details in Japanese from the settings below.
Respect sex, age group, personality, speech style, era/world style, and archetype.
Return only valid JSON with these string keys:
name, catchphrase, dialogue, likes, dislikes, nickname.

Settings:
${contextToPromptText(context)}`;

  const messages = [{ role: "user", content: prompt }];

  for (const modelId of TEXT_MODEL_IDS) {
    try {
      if (onStatusUpdate) onStatusUpdate(`> [API] ${modelId} starting...`);
      const result = await callChatCompletion(modelId, messages, currentOpenAIApiKey, {
        timeoutMs: 25000,
        responseFormat: { type: "json_object" }
      });
      if (onStatusUpdate) onStatusUpdate(`> [API] complete (${modelId})`);
      return JSON.parse(result.text);
    } catch (e) {
      console.warn(`[OpenAI GachaGen] ${modelId} failed:`, e.message);
      if (onStatusUpdate) onStatusUpdate(`> [API] ${modelId} failed. Trying next model...`);
    }
  }

  return null;
};

export const generateImageOAI = async (prompt, onStatusUpdate) => {
  if (!currentOpenAIApiKey) throw new Error("OpenAI API key is not set.");

  const dallePrompt = `Please generate an illustration of a character perfectly reflecting the settings below.
Make it a masterpiece and highest quality.
Strictly include all elements mentioned in the Character Settings, including hairstyle, clothing, accessories, colors, body type, personality, and mood.
Strictly adhere to the requested art style, layout, and background rules without automatically overriding them.

# Character Settings:
${prompt}`;

  const promptLength = dallePrompt.length;
  if (promptLength > OPENAI_IMAGE_PROMPT_MAX_CHARS) {
    throw new Error(`OpenAI image prompt is too long (${promptLength.toLocaleString()} / ${OPENAI_IMAGE_PROMPT_MAX_CHARS.toLocaleString()} chars). Shorten the prompt and retry.`);
  }
  if (promptLength > OPENAI_IMAGE_PROMPT_MAX_CHARS * 0.9 && onStatusUpdate) {
    onStatusUpdate(`> [image] OpenAI prompt is near the limit (${promptLength.toLocaleString()} / ${OPENAI_IMAGE_PROMPT_MAX_CHARS.toLocaleString()} chars)`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPENAI_IMAGE_TIMEOUT_MS);

  try {
    if (onStatusUpdate) onStatusUpdate(`> [image] ${OPENAI_IMAGE_MODEL} generation started... (2-10 min)`);

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${currentOpenAIApiKey}`
      },
      body: JSON.stringify({
        model: OPENAI_IMAGE_MODEL,
        prompt: dallePrompt,
        n: 1,
        size: "1024x1792",
        quality: "high",
        output_format: "png"
      }),
      signal: controller.signal
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status} ${data.error?.message || response.statusText}`);
    }

    const imgData = data.data?.[0];
    if (!imgData?.b64_json) {
      throw new Error("OpenAI response did not include base64 image data.");
    }

    if (onStatusUpdate) onStatusUpdate(`> [image] generation complete (${OPENAI_IMAGE_MODEL})`);
    return {
      base64Img: imgData.b64_json,
      mimeType: "image/png",
      usedModel: OPENAI_IMAGE_MODEL
    };
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`Timeout (${OPENAI_IMAGE_TIMEOUT_SECONDS}s). The server may be congested; please retry later.`);
    }
    if (/safety|SAFETY|content_policy/i.test(err.message)) {
      throw new Error("OpenAI image generation was blocked by the content policy.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};
