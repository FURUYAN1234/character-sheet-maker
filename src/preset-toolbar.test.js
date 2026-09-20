import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const appSource = readFileSync(join(import.meta.dirname, 'App.jsx'), 'utf8');

test('preset toolbar has one button row whose meaning changes while character lock is active', () => {
  assert.doesNotMatch(appSource, /theme-toolbar/);
  assert.doesNotMatch(appSource, /THEME_PRESETS\.map/);
  assert.match(appSource, /characterLockSnapshot \? '見た目テーマ（キャラ固定中）' : '代表キャラ'/);
});
