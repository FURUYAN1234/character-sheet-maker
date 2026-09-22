import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CHARACTER_SHEET_METADATA_KEYWORD,
  createCharacterSheetMetadata,
  embedCharacterSheetMetadata,
  extractCharacterSheetMetadata,
  importCharacterSheetImage,
} from './png-character-sheet-metadata.js';

const ONE_PIXEL_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nKsAAAAASUVORK5CYII=';

test('character sheet metadata survives a PNG embed and extract round trip', async () => {
  const metadata = createCharacterSheetMetadata({
    appVersion: '1.4.2',
    prompt: '日本語の設計プロンプト\nsecond line',
    character: { name: 'アカリ', glasses: false },
    generation: { model: 'test-model', width: 1120, height: 1584 },
    createdAt: '2026-09-23T04:21:00+09:00',
  });

  const embedded = embedCharacterSheetMetadata(ONE_PIXEL_PNG, metadata);
  const restored = await extractCharacterSheetMetadata(embedded);

  assert.equal(CHARACTER_SHEET_METADATA_KEYWORD, 'furu.character_sheet');
  assert.deepEqual(restored, {
    schema: 'furu.character_sheet',
    schema_version: 1,
    app: 'Character Sheet Maker',
    app_version: '1.4.2',
    prompt: '日本語の設計プロンプト\nsecond line',
    character: { name: 'アカリ', glasses: false },
    generation: { model: 'test-model', width: 1120, height: 1584 },
    created_at: '2026-09-23T04:21:00+09:00',
  });
});

test('re-embedding replaces the previous Character Sheet Maker metadata', async () => {
  const first = embedCharacterSheetMetadata(ONE_PIXEL_PNG, createCharacterSheetMetadata({
    appVersion: '1.4.2',
    prompt: 'first prompt',
  }));
  const second = embedCharacterSheetMetadata(first, createCharacterSheetMetadata({
    appVersion: '1.4.2',
    prompt: 'second prompt',
  }));

  const restored = await extractCharacterSheetMetadata(second);
  const embeddedBinary = atob(second.split(',')[1]);
  assert.equal(restored.prompt, 'second prompt');
  assert.equal(embeddedBinary.split('iTXt').length - 1, 1);
});

test('a normal PNG without app metadata is rejected instead of guessing a prompt', async () => {
  await assert.rejects(
    () => extractCharacterSheetMetadata(ONE_PIXEL_PNG),
    /設計データがありません/,
  );
});

test('import keeps the dropped image and reads its prompt when available', async () => {
  const prompt = '復元する設計プロンプト';
  const embedded = embedCharacterSheetMetadata(ONE_PIXEL_PNG, createCharacterSheetMetadata({ prompt }));
  const imported = await importCharacterSheetImage(new Uint8Array(Buffer.from(embedded.split(',')[1], 'base64')));

  assert.equal(imported.imageDataUrl, embedded);
  assert.equal(imported.metadata.prompt, prompt);

  const plain = await importCharacterSheetImage(ONE_PIXEL_PNG);
  assert.equal(plain.imageDataUrl, ONE_PIXEL_PNG);
  assert.equal(plain.metadata, null);
});

test('JPEG import keeps the image for AI analysis without inventing embedded metadata', async () => {
  const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 2, 0xff, 0xd9]);
  const imported = await importCharacterSheetImage({
    name: 'older-character.jpg',
    type: 'image/jpeg',
    arrayBuffer: async () => jpegBytes.buffer,
  });

  assert.equal(imported.imageDataUrl, `data:image/jpeg;base64,${Buffer.from(jpegBytes).toString('base64')}`);
  assert.equal(imported.metadata, null);
});

test('image bytes determine the format even when the file name or MIME type is misleading', async () => {
  const prompt = 'PNG内の元プロンプト';
  const embedded = embedCharacterSheetMetadata(ONE_PIXEL_PNG, createCharacterSheetMetadata({ prompt }));
  const pngBytes = Buffer.from(embedded.split(',')[1], 'base64');
  const imported = await importCharacterSheetImage({
    name: 'renamed.jpg',
    type: 'image/jpeg',
    arrayBuffer: async () => pngBytes.buffer.slice(pngBytes.byteOffset, pngBytes.byteOffset + pngBytes.byteLength),
  });

  assert.equal(imported.imageDataUrl, embedded);
  assert.equal(imported.metadata.prompt, prompt);
});

test('invalid image input is rejected with the supported formats', async () => {
  await assert.rejects(
    () => importCharacterSheetImage(new TextEncoder().encode('not an image')),
    /PNGまたはJPEG画像/,
  );
});

test('non-PNG input is rejected with a clear message', async () => {
  await assert.rejects(
    () => extractCharacterSheetMetadata(new TextEncoder().encode('not a png')),
    /PNG画像/,
  );
});
