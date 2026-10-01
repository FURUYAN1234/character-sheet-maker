import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_OPENAI_TEXT_MODEL, OPENAI_TEXT_MODELS, getTextModelRoute, setOpenAITextModel, setOpenAIApiKey, generateFieldValueOAI, getOpenAITextModelStatus } from './openai.js';

test('catalog defaults to Sol 6.1 and never ascends from selected model', () => {
  assert.equal(DEFAULT_OPENAI_TEXT_MODEL, 'gpt-6.1-sol');
  assert.equal(OPENAI_TEXT_MODELS.length, 11);
  assert.equal(OPENAI_TEXT_MODELS[0].id, 'gpt-6-astra');
  assert.deepEqual(getTextModelRoute('gpt-4.1-nano'), ['gpt-4.1-nano', 'gpt-4o']);
  assert.throws(() => setOpenAITextModel('unknown'));
});
test('real field route uses selected model, compatible parameters and downward fallback', async () => {
  const original = globalThis.fetch; const calls = [];
  setOpenAIApiKey('test-only'); setOpenAITextModel('gpt-5.6-luna');
  globalThis.fetch = async (_, options) => {
    const body = JSON.parse(options.body); calls.push(body);
    return calls.length === 1 ? new Response('{}', {status: 404}) : new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:'名前'}}]}));
  };
  try {
    assert.equal(await generateFieldValueOAI('name','名前',{}), '名前');
    assert.deepEqual(calls.map(c=>c.model), ['gpt-5.6-luna', 'gpt-4.1']);
    assert.equal(calls[0].max_completion_tokens,32768); assert.equal(calls[0].temperature,undefined);
    assert.deepEqual(getOpenAITextModelStatus(), {selected:'gpt-5.6-luna',attempted:['gpt-5.6-luna','gpt-4.1'],adopted:'gpt-4.1'});
    setOpenAITextModel('gpt-4o'); assert.deepEqual(getOpenAITextModelStatus().attempted, []);
    assert.equal(calls[1].max_tokens,4096); assert.equal(calls[1].temperature,.8);
  } finally { globalThis.fetch=original; setOpenAIApiKey(''); setOpenAITextModel(DEFAULT_OPENAI_TEXT_MODEL); }
});
test('incomplete response or authentication failure stops further model charges', async () => {
  const original=globalThis.fetch; setOpenAIApiKey('test-only');
  try {
    for (const failure of ['length','auth']) {
      let calls=0;
      globalThis.fetch=async()=>{calls++; return failure==='auth' ? new Response('{}',{status:401}) : new Response(JSON.stringify({choices:[{finish_reason:'length',message:{content:'partial'}}]}));};
      await assert.rejects(generateFieldValueOAI('name','名前',{})); assert.equal(calls,1);
    }
  } finally { globalThis.fetch=original;setOpenAIApiKey(''); }
});

test('missing completion signal and whitespace are rejected without fallback', async () => {
  const original=globalThis.fetch;setOpenAIApiKey('test-only');
  try { for (const choice of [{message:{content:'partial'}},{finish_reason:'stop',message:{content:'   '}},{finish_reason:'stop',message:{content:[]}}]) {
    let calls=0;globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify({choices:[choice]}));};
    await assert.rejects(generateFieldValueOAI('name','名前',{})); assert.equal(calls,1);
  }} finally {globalThis.fetch=original;setOpenAIApiKey('');}
});
