import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('API keys are not persisted in browser storage APIs', () => {
  const sources = [
    'src/App.jsx',
    'src/lib/ai-provider.js',
    'src/lib/gemini.js',
    'src/lib/imagen.js',
    'src/lib/openai.js',
  ].map(read).join('\n');

  const storageCallPattern =
    /\b(?:window\.)?(?:localStorage|sessionStorage)\s*\.|\bindexedDB\s*\.|\bdocument\.cookie\s*=|\bcaches\s*\./;
  assert.equal(storageCallPattern.test(sources), false, 'API key code must not call browser persistence APIs');
});

test('API key input suppresses browser form restoration and password-manager autofill', () => {
  const app = read('src/App.jsx');

  assert.match(app, /ref=\{apiInputRef\}/);
  assert.match(app, /name="character-sheet-runtime-api-key"/);
  assert.match(app, /autoComplete="new-password"/);
  assert.match(app, /data-lpignore="true"/);
  assert.match(app, /data-1p-ignore="true"/);
  assert.match(app, /data-bwignore="true"/);
});

test('Gemini API key is sent in headers, not embedded in request URLs', () => {
  const geminiSources = [read('src/lib/gemini.js'), read('src/lib/imagen.js')].join('\n');

  assert.equal(/\?key=/.test(geminiSources), false, 'Gemini request URLs must not embed API keys in query strings');
  assert.match(geminiSources, /x-goog-api-key/);
});

test('API gate copy does not claim provider API calls are never external', () => {
  const app = read('src/App.jsx');

  assert.equal(/外部送信一切なし/.test(app), false, 'API copy must not claim provider API calls are never external');
  assert.match(app, /Gemini\/OpenAI/);
});
