import test from 'node:test';
import assert from 'node:assert/strict';

import { applyRandomProfileText } from './profile-randomizer.js';

const backupData = {
  femaleNames: ['前回の名前', '新しい名前'],
  femalePhrases: ['前回の口癖', '新しい口癖'],
  femaleDialogues: ['前回の台詞', '新しい台詞'],
  likes: ['前回の好き', '新しい好き'],
  dislikes: ['前回の嫌い', '新しい嫌い'],
  nicknames: ['前回の異名', '新しい異名'],
};

test('unlocked profile text never keeps an identical AI response from the previous random run', () => {
  const current = {
    sex: '女性',
    name: '前回の名前',
    catchphrase: '前回の口癖',
    dialogue: '前回の台詞',
    likes: '前回の好き',
    dislikes: '前回の嫌い',
    nickname: '前回の異名',
  };

  const result = applyRandomProfileText({
    current,
    generated: {
      name: '前回の名前',
      catchphrase: '前回の口癖',
      dialogue: '前回の台詞',
      likes: '前回の好き',
      dislikes: '前回の嫌い',
      nickname: '前回の異名',
    },
    lockedFields: {},
    backupData,
    random: () => 0,
  });

  assert.deepEqual(
    ['name', 'catchphrase', 'dialogue', 'likes', 'dislikes', 'nickname'].map((key) => result[key]),
    ['新しい名前', '新しい口癖', '新しい台詞', '新しい好き', '新しい嫌い', '新しい異名'],
  );
});

test('locked profile fields remain unchanged while the other fields are diversified', () => {
  const result = applyRandomProfileText({
    current: {
      sex: '女性',
      name: '固定の名前',
      catchphrase: '前回の口癖',
      dialogue: '前回の台詞',
      likes: '前回の好き',
      dislikes: '前回の嫌い',
      nickname: '前回の異名',
    },
    generated: null,
    lockedFields: { name: true },
    backupData,
    random: () => 0,
  });

  assert.equal(result.name, '固定の名前');
  assert.equal(result.catchphrase, '新しい口癖');
  assert.equal(result.dialogue, '新しい台詞');
});

test('malformed non-text AI values fall back without stopping randomization', () => {
  const result = applyRandomProfileText({
    current: { sex: '女性', name: '前回の名前' },
    generated: { name: 42 },
    lockedFields: {},
    backupData,
    random: () => 0,
  });

  assert.equal(result.name, '新しい名前');
});

test('AI text that differs only by surrounding quotes is treated as the previous profile text', () => {
  const result = applyRandomProfileText({
    current: { sex: '女性', catchphrase: '「前回の口癖」' },
    generated: { catchphrase: '前回の口癖' },
    lockedFields: {},
    backupData,
    random: () => 0,
  });

  assert.equal(result.catchphrase, '新しい口癖');
});
