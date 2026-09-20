import assert from 'node:assert/strict';
import test from 'node:test';
import { buildGachaContextText } from './openai.js';

test('OpenAI gacha context explicitly includes character-defining fields beyond the first object keys', () => {
  const context = buildGachaContextText({
    name: '前回の名前',
    sex: '女性',
    ageGroup: '高校生世代（16〜18歳）',
    personality: '勝気・負けず嫌い',
    speechStyle: 'お嬢様言葉',
    eraStyle: '現代・日常・学園',
    archetype: 'ヒロイン',
    artStyle: '少女漫画（華麗・繊細）',
  });

  assert.match(context, /speechStyle: お嬢様言葉/);
  assert.match(context, /eraStyle: 現代・日常・学園/);
  assert.match(context, /archetype: ヒロイン/);
  assert.match(context, /artStyle: 少女漫画（華麗・繊細）/);
  assert.doesNotMatch(context, /name: 前回の名前/);
});
