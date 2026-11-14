import test from 'node:test';
import assert from 'node:assert/strict';
import { characterImageBlob } from './image-download.js';

test('image download retains every original byte, including embedded metadata', async () => {
  const bytes = Buffer.from([137, 80, 78, 71, 0, 255, 128, 0, 120, 84, 88, 116]);
  const blob = characterImageBlob(`data:image/png;base64,${bytes.toString('base64')}`);
  assert.equal(blob.type, 'image/png');
  assert.deepEqual(Buffer.from(await blob.arrayBuffer()), bytes);
});

test('invalid or non-image download inputs are rejected', () => {
  for (const value of ['', 'https://example.test/image.png', 'data:text/html;base64,eA==', 'data:image/png;base64,!!!']) {
    assert.throws(() => characterImageBlob(value));
  }
});
