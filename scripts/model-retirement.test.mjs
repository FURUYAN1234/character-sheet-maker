import test from 'node:test';
import assert from 'node:assert/strict';
import {inferPromptFromImageOAI,setOpenAIApiKey} from '../src/lib/openai.js';

test('image-to-prompt uses maintained lightweight vision and rejects incomplete results',async()=>{
 const original=globalThis.fetch;const calls=[];
 globalThis.fetch=async(_url,options)=>{calls.push(JSON.parse(options.body));return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:'服装・髪型を保持した解析'}}]}));};
 try{
  setOpenAIApiKey('test-only');
  const result=await inferPromptFromImageOAI('data:image/png;base64,AA==','観察する');
  assert.equal(result.model,'gpt-6-luna');
  assert.equal(calls[0].max_completion_tokens,32768);
  assert.ok(!('temperature' in calls[0]) && !('max_tokens' in calls[0]));
  globalThis.fetch=async()=>new Response(JSON.stringify({choices:[{finish_reason:'length',message:{content:'途中'}}]}));
  await assert.rejects(()=>inferPromptFromImageOAI('data:image/png;base64,AA==','観察'),/トークン上限/);
 }finally{setOpenAIApiKey('');globalThis.fetch=original;}
});
