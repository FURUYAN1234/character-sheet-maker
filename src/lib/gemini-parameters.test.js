import test from 'node:test';
import assert from 'node:assert/strict';
import {callGeminiText,inferPromptFromImage,setApiKey} from './gemini.js';

test('current Gemini fallback visits only supported stable text models', async () => {
  const expected=['gemini-3.8-flash','gemini-3.6-flash','gemini-3.5-flash-lite','gemini-3.1-flash-lite'];
  const saved=globalThis.fetch, attempted=[];
  setApiKey('test-only');
  globalThis.fetch=async(url)=>{
    attempted.push(String(url).match(/models\/([^:]+):/)[1]);
    return attempted.length<expected.length
      ? new Response(JSON.stringify({error:{message:'model unavailable'}}),{status:404})
      : new Response(JSON.stringify({candidates:[{content:{parts:[{text:'profile'}]}}]}));
  };
  try {
    const output=await callGeminiText('profile');
    assert.deepEqual(attempted,expected);
    assert.equal(output.model,expected.at(-1));
  } finally {globalThis.fetch=saved;setApiKey('');}
});

test('Gemini text and image analysis preserve payloads and use default generation parameters',async()=>{
  const saved=globalThis.fetch,calls=[];
  setApiKey('test-only');
  globalThis.fetch=async(url,init)=>{calls.push(JSON.parse(init.body));return new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:'description'}]}}]}));};
  try {
    await callGeminiText('profile',()=>{},{responseMimeType:'application/json'});
    await inferPromptFromImage('data:image/jpeg;base64,aGVsbG8=','describe');
    assert.equal(calls.length,2);
    assert.equal(calls[0].generationConfig.responseMimeType,'application/json');
    assert.equal(calls[1].contents[0].parts[1].inline_data.mime_type,'image/jpeg');
    for(const body of calls){
      for(const field of ['temperature','topP','topK','thinkingBudget'])assert.equal(Object.hasOwn(body.generationConfig,field),false,field);
      assert.ok(body.generationConfig.maxOutputTokens>0);
    }
  } finally {globalThis.fetch=saved;setApiKey('');}
});
