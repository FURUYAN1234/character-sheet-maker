import test from 'node:test';
import assert from 'node:assert/strict';
import {generateImageOAI,setOpenAIApiKey} from './openai.js';
test('image errors preserve the provider cause without a retired model request', async t => {
  setOpenAIApiKey('test-only'); t.after(()=>setOpenAIApiKey(''));
  for (const status of [404,429,500]) {
    const requests=[];
    const send=t.mock.method(globalThis,'fetch',async (_url,init)=>{
      requests.push(JSON.parse(init.body));
      return new Response(JSON.stringify({error:{message:'provider unavailable'}}),{status});
    });
    await assert.rejects(generateImageOAI('original character'),/provider unavailable/);
    assert.equal(requests.length,1);
    assert.equal(requests[0].model,'gpt-image-2.6-sunburst');
    send.mock.restore();
  }
});
