import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const sourceDirectory = dirname(fileURLToPath(import.meta.url));
const appStyles = readFileSync(join(sourceDirectory, '..', 'App.css'), 'utf8');
const appSource = readFileSync(join(sourceDirectory, '..', 'App.jsx'), 'utf8');

test('prompt controls stay on one right-aligned row', () => {
  assert.match(
    appStyles,
    /\.prompt-header\s*{(?=[^}]*flex-wrap:\s*nowrap;)[^}]*}/s,
  );
  assert.match(
    appStyles,
    /\.prompt-actions\s*{(?=[^}]*margin-left:\s*auto;)(?=[^}]*flex-wrap:\s*nowrap;)(?=[^}]*justify-content:\s*flex-end;)[^}]*}/s,
  );
});

test('save is immediately left of the rightmost text copy button', () => {
  assert.match(
    appSource,
    /className="prompt-save-name"[\s\S]*?className="btn-save-prompt"[\s\S]*?className="btn-copy"/,
  );
});

test('save control is a direct text-file download link', () => {
  assert.match(
    appSource,
    /<a[\s\S]*?className="btn-save-prompt"[\s\S]*?href=\{createPromptDownloadUrl\(generatedPrompt\)\}[\s\S]*?download=\{promptFileName\}/,
  );
  assert.doesNotMatch(appSource, /保存済みプロンプト|savedPrompts/);
});
