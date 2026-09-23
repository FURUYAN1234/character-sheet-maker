/**
 * AI Provider Router for キャラクターシート鋳造所
 * Dual Engine 抽象化レイヤー
 */

import { generateFieldValue as geminiGenerateField, generateGachaTexts as geminiGenerateGacha, inferPromptFromImage as geminiInferPrompt, setApiKey as setGeminiApiKey, getApiKey as getGeminiApiKey } from './gemini';
import { generateImage as geminiGenerateImage } from './imagen';
import { generateFieldValueOAI, generateGachaTextsOAI, generateImageOAI, inferPromptFromImageOAI, setOpenAIApiKey, getOpenAIApiKey } from './openai';
import { CHARACTER_ANALYSIS_INSTRUCTION, parseCharacterAnalysis, compileCharacterPrompt } from './character-identity';

// 個別APIキー取得をre-export
export { getGeminiApiKey, getOpenAIApiKey };

// 'gemini' | 'openai'
let activeEngine = 'gemini';

/**
 * アクティブエンジンを設定
 */
export const setActiveEngine = (engine) => {
  if (engine !== 'gemini' && engine !== 'openai') {
    console.warn(`[AI Provider] Unknown engine "${engine}". Defaulting to "gemini".`);
    activeEngine = 'gemini';
    return;
  }
  activeEngine = engine;
  console.log(`[AI Provider] Engine switched to: ${engine.toUpperCase()}`);
};

export const getActiveEngine = () => activeEngine;

export const getEngineDisplayName = () => {
  return activeEngine === 'openai' ? 'ChatGPT (OpenAI)' : 'Gemini (Google)';
};

// --- API Keys ---
export const setApiKeys = (geminiKey, openAIKey) => {
  setGeminiApiKey(geminiKey);
  setOpenAIApiKey(openAIKey);
};

// --- Router Functions ---

export const generateFieldValueAI = async (...args) => {
  if (activeEngine === 'openai') {
    return generateFieldValueOAI(...args);
  }
  return geminiGenerateField(...args);
};

export const generateGachaTextsAI = async (...args) => {
  if (activeEngine === 'openai') {
    return generateGachaTextsOAI(...args);
  }
  return geminiGenerateGacha(...args);
};

export const generateImageAI = async (...args) => {
  if (activeEngine === 'openai') {
    return generateImageOAI(...args);
  }
  return geminiGenerateImage(...args);
};

export const inferPromptFromImageAI = async (imageDataUrl, onStatusUpdate) => {
  const infer = activeEngine === 'openai' ? inferPromptFromImageOAI : geminiInferPrompt;
  const result = await infer(imageDataUrl, CHARACTER_ANALYSIS_INSTRUCTION, onStatusUpdate, { requireComplete: true });
  const analysis = parseCharacterAnalysis(result.prompt);
  return { prompt: compileCharacterPrompt(analysis), model: result.model };
};
