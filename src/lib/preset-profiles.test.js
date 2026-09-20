import assert from 'node:assert/strict';
import test from 'node:test';
import { PRESETS } from './options.js';

const PROFILE_FIELDS = ['name', 'catchphrase', 'dialogue', 'likes', 'dislikes', 'nickname', 'organization'];

test('every representative character preset includes its own complete profile', () => {
  for (const preset of PRESETS) {
    for (const field of PROFILE_FIELDS) {
      assert.ok(
        preset.data[field],
        `${preset.name} must define ${field} instead of inheriting the default character`,
      );
    }
  }
});

test('representative character presets do not share their dialogue or catchphrase', () => {
  for (const field of ['catchphrase', 'dialogue']) {
    const values = PRESETS.map((preset) => preset.data[field]);
    assert.equal(new Set(values).size, values.length, `${field} must distinguish presets`);
  }
});
