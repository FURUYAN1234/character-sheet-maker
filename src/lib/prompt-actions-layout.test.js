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

test('prompt controls use automatic naming and keep clear, save, and copy together', () => {
  assert.match(
    appSource,
    /className="btn-clear-prompt"[\s\S]*?className="btn-save-prompt"[\s\S]*?className="btn-copy"/,
  );
  assert.doesNotMatch(appSource, /className="prompt-save-name"|保存名（任意）/);
});

test('save control is a direct text-file download link', () => {
  assert.match(
    appSource,
    /<a[\s\S]*?className="btn-save-prompt"[\s\S]*?href=\{createPromptDownloadUrl\(generatedPrompt\)\}[\s\S]*?download=\{promptFileName\}/,
  );
  assert.doesNotMatch(appSource, /保存済みプロンプト|savedPrompts/);
});

test('the generated-image region exposes image import and prompt restore or AI analysis', () => {
  assert.match(appSource, /className="feature-badge"[\s\S]*?PNG設計保存・復元/);
  assert.match(appSource, /onDrop=\{handlePromptImageDrop\}/);
  assert.match(appSource, /onDragOver=\{handlePromptImageDragOver\}/);
  assert.match(appSource, /onPaste=\{handlePromptImagePaste\}/);
  assert.match(appSource, /onKeyDown=\{handlePromptImageKeyDown\}/);
  assert.match(appSource, /PNG\/JPGをドロップ/);
  assert.match(appSource, /accept="image\/png,image\/jpeg,\.png,\.jpg,\.jpeg"/);
  assert.match(appSource, /embedCharacterSheetMetadata\([\s\S]*?createCharacterSheetMetadata\(/);
  assert.match(appSource, /importCharacterSheetImage\(file\)/);
  assert.match(appSource, /inferPromptFromImageAI\(imageDataUrl/);
  assert.match(appSource, /読み込み画像: \{importedImageNotice\.name\}/);
});

test('image-analysis progress and outcome remain visible in the top status line', () => {
  assert.match(appSource, /className="inline-status" role="status" aria-live="polite"/);
  assert.match(appSource, /showStatus\(`🔍 \$\{file\.name\}: AI解析中/);
  assert.match(appSource, /showStatus\(`🔍 \$\{file\.name\}: \$\{status\}`\)/);
  assert.match(appSource, /showStatus\(`✅ \$\{file\.name\} をAI解析し、推定プロンプトを作成しました（\$\{result\.model\}）`\)/);
  assert.match(appSource, /showStatus\(`❌ \$\{file\.name\} のAI解析に失敗しました:/);
});

test('inferred prompt source remains visible after image regeneration', () => {
  assert.match(appSource, /const \[promptOverrideSource, setPromptOverrideSource\] = useState\(null\)/);
  assert.match(appSource, /setPromptOverride\(metadata\.prompt\);\s*setPromptOverrideSource\('restored'\)/);
  assert.match(appSource, /setPromptOverride\(result\.prompt\);\s*setPromptOverrideSource\('inferred'\)/);
  assert.match(appSource, /promptOverrideSource === 'inferred' \? 'AI推定' : 'PNGから復元'/);
  const generationHandler = appSource.split('const handleImageGenerate = async () => {')[1]
    .split('// ===')[0];
  assert.doesNotMatch(generationHandler, /setPromptOverrideSource\(null\)/);
});

test('imported prompt explains its provenance directly below the prompt', () => {
  assert.match(appSource, /className="prompt-content"[\s\S]*?className="prompt-origin-note"[\s\S]*?className="status-bar"/);
  assert.match(appSource, /promptOverrideSource === 'restored'[\s\S]*?このプロンプトは、読み込んだPNG内の設計データから復元しました/);
  assert.match(appSource, /promptOverrideSource === 'inferred'[\s\S]*?このプロンプトは、読み込んだ画像をAIが解析して推定したものです/);
  assert.match(appSource, /元のプロンプトではなく、同じ画像の再現も保証しません/);
  assert.match(appStyles, /\.prompt-origin-note\s*\{/);
});

test('regeneration from an imported prompt does not stamp unrelated form details on the image', () => {
  const generationHandler = appSource.split('const handleImageGenerate = async () => {')[1]
    .split('// ===')[0];
  assert.match(generationHandler, /generateImageAI\(generatedPrompt,/);
  assert.match(generationHandler, /promptOverride !== null[\s\S]*?\? rawSrc\s*:\s*await composeCharacterSheet\(rawSrc, currentFormData, SYSTEM_VERSION\)/);
  assert.match(generationHandler, /character: promptOverride !== null \? \{\} : currentFormData/);
  assert.match(appSource, /この画像はAI推定プロンプトから新規生成しました/);
});

test('a retained in-memory API key is restored before image analysis after development reloads', () => {
  assert.match(appSource, /const restoreApiSession = \(\) => \{[\s\S]*?setApiKeys\(selectedEngine === 'gemini'/);
  assert.match(appSource, /if \(!restoreApiSession\(\)\) \{[\s\S]*?AI解析にはAPIキー/);
  assert.match(appSource, /const handleImageGenerate = async \(\) => \{[\s\S]*?restoreApiSession\(\)/);
});

test('prompt and menu controls collapse without horizontal overflow on narrow screens', () => {
  assert.match(appStyles, /grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(
    appStyles,
    /@media\s*\(max-width:\s*600px\)[\s\S]*?\.prompt-header\s*{[^}]*flex-wrap:\s*wrap;/,
  );
  assert.match(
    appStyles,
    /@media\s*\(max-width:\s*600px\)[\s\S]*?\.prompt-actions\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/,
  );
});
