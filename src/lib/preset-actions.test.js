import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyThemePreset,
  lockCharacterIdentity,
  releaseCharacterIdentity,
} from './preset-actions.js';

test('theme preset changes unlocked presentation fields and preserves locked identity fields', () => {
  const result = applyThemePreset(
    { name: '朝比奈 ひより', hairColor: '茶髪', eraStyle: '現代・日常・学園', costume: '学生服', artStyle: '少女漫画' },
    { hairColor: '銀髪', eraStyle: '近未来・サイバーパンク', costume: 'サイバーウェア', artStyle: '実写風' },
    { hairColor: true },
  );

  assert.deepEqual(result, {
    name: '朝比奈 ひより',
    hairColor: '茶髪',
    eraStyle: '近未来・サイバーパンク',
    costume: 'サイバーウェア',
    artStyle: '実写風',
  });
});

test('releasing character identity keeps locks that existed before the bulk lock', () => {
  const locked = lockCharacterIdentity({ weapon: true, name: true });
  const released = releaseCharacterIdentity(locked.lockedFields, locked.newlyLocked);

  assert.equal(released.weapon, true);
  assert.equal(released.name, true);
  assert.equal(released.hairColor, false);
});
