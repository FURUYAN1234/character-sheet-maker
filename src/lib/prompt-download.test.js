import test from 'node:test';
import assert from 'node:assert/strict';

import { createPromptDownloadUrl, createPromptFileName } from './prompt-download.js';

test('prompt download uses a safe text filename', () => {
  assert.equal(createPromptFileName('ガルーナ'), 'ガルーナ_prompt.txt');
  assert.equal(createPromptFileName('A/B:C*D?'), 'A_B_C_D_prompt.txt');
  assert.equal(createPromptFileName('   '), 'character_prompt.txt');
});

test('prompt download URL contains the exact UTF-8 prompt text', () => {
  const prompt = '日本語のプロンプト\nsecond line\n' + 'distinctive lock and clasp '.repeat(300);
  const url = createPromptDownloadUrl(prompt);

  assert.match(url, /^data:text\/plain;charset=utf-8,/);
  assert.equal(decodeURIComponent(url.split(',')[1]), `\uFEFF${prompt}`);
});
