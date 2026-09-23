import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { setOpenAIApiKey } from './openai.js';
import { setApiKey as setGeminiApiKey } from './gemini.js';

const IMAGE = 'data:image/png;base64,aGVsbG8=';
const analysis = {
  schema_version: 1,
  subjects: [{ id: 'c1', views: [{ id: 'front', label: 'front view' }], features: [
    { id: 'hair', group: 'hair', part: 'fringe', description: 'Split fringe sweeps toward the right temple.', visibility: 'clear', evidence: 'Strands visible above eyes.', view_ids: ['front'], location: { frame: 'subject', side: 'right', anchor: 'temple' }, layer_order: null, ratio: null },
    { id: 'coat', group: 'clothing', part: 'layer', description: 'A blue cropped coat.', visibility: 'clear', evidence: 'Hem visible at waist.', view_ids: ['front'], location: null, layer_order: 1, ratio: null },
  ] }],
  presentation: { pose: '', expression: '', gaze: '', composition: '', background: '', lighting: '', rendering: '' },
  uncertainties: [],
};

test('selected OpenAI and Gemini vision routes compile complete text-only identity prompt', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
  const originalFetch = globalThis.fetch;
  const requests = [];
  try {
    const router = await server.ssrLoadModule('/src/lib/ai-provider.js');
    router.setApiKeys('test-only', 'test-only');
    globalThis.fetch = async (url, options) => {
      requests.push({ url, body: JSON.parse(options.body) });
      const result = String(url).includes('openai.com')
        ? { choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(analysis) } }] }
        : { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(analysis) }] } }] };
      return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };
    for (const engine of ['openai', 'gemini']) {
      router.setActiveEngine(engine);
      const result = await router.inferPromptFromImageAI(IMAGE);
      assert.match(result.prompt, /^CHARACTER IDENTITY/);
      assert.match(result.prompt, /Split fringe sweeps toward the right temple/);
      assert.match(result.prompt, /blue cropped coat/);
      assert.doesNotMatch(result.prompt, /2400 characters|see attached image/i);
    }
    assert.equal(requests.length, 2);
    assert.equal(requests[0].body.max_tokens, 32768);
    assert.equal(requests[1].body.generationConfig.maxOutputTokens, 65536);
    assert.match(requests[0].body.messages[0].content[0].text, /JSON object/);
    assert.equal(requests[0].body.messages[0].content[1].image_url.url, IMAGE);
    assert.equal(requests[1].body.contents[0].parts[1].inline_data.data, 'aGVsbG8=');
  } finally {
    globalThis.fetch = originalFetch;
    setOpenAIApiKey('');
    setGeminiApiKey('');
    await server.close();
  }
});

test('truncated vision output fails instead of becoming a partial prompt', async () => {
  const originalFetch = globalThis.fetch;
  setOpenAIApiKey('test-only');
  setGeminiApiKey('test-only');
  try {
    globalThis.fetch = async () => new Response(JSON.stringify({ choices: [{ finish_reason: 'length', message: { content: JSON.stringify(analysis) } }] }), { status: 200 });
    const { inferPromptFromImageOAI } = await import('./openai.js');
    await assert.rejects(inferPromptFromImageOAI(IMAGE, 'Return JSON', null, { requireComplete: true }), /トークン上限/);
    globalThis.fetch = async () => new Response(JSON.stringify({ candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: JSON.stringify(analysis) }] } }] }), { status: 200 });
    const { inferPromptFromImage } = await import('./gemini.js');
    await assert.rejects(inferPromptFromImage(IMAGE, 'Return JSON', null, { requireComplete: true }), /トークン上限/);
  } finally {
    globalThis.fetch = originalFetch;
    setOpenAIApiKey('');
    setGeminiApiKey('');
  }
});
