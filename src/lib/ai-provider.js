/**
 * AI Provider Router for キャラクターシート鋳造所
 * Dual Engine 抽象化レイヤー
 */

import { generateFieldValue as geminiGenerateField, generateGachaTexts as geminiGenerateGacha, setApiKey as setGeminiApiKey, getApiKey as getGeminiApiKey } from './gemini';
import { generateImage as geminiGenerateImage } from './imagen';
import { generateFieldValueOAI, generateGachaTextsOAI, generateImageOAI, setOpenAIApiKey, getOpenAIApiKey } from './openai';

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
