import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_FORM_DATA, OPTIONS } from './options.js';
import { buildPrompt } from './prompt.js';
import { ART_STYLE_BUNDLES, ART_STYLE_SETTINGS, chooseArtStyle, describeArtStyleOptions, resolveArtStyleProfile } from './art-style.js';

test('rendering instructions include shadow contrast and defer to explicit user art direction', () => {
  const prompt = buildPrompt({
    ...DEFAULT_FORM_DATA,
    shadowIntensity: '影なしフラットな描写',
    details: 'この人物は青いインク一色の木版画で描く。',
  });
  assert.ok(prompt.includes('Shadows: 影なしフラットな描写'));
  assert.ok(prompt.includes('この人物は青いインク一色の木版画で描く。'));
  assert.match(prompt, /explicit art direction in Additional user details takes priority/i);
});

test('automatic selection avoids the current style and the last style across A/B slots', () => {
  const first = chooseArtStyle(DEFAULT_FORM_DATA, {}, null, () => 0);
  const second = chooseArtStyle(DEFAULT_FORM_DATA, {}, first.artStyle, () => 0);
  const third = chooseArtStyle({ ...DEFAULT_FORM_DATA, ...second }, {}, first.artStyle, () => 0);
  assert.equal(new Set([first.artStyle, second.artStyle, third.artStyle]).size, 3);
  assert.notEqual(first.artStyle, DEFAULT_FORM_DATA.artStyle);
  const prompt = buildPrompt({ ...DEFAULT_FORM_DATA, ...third });
  assert.ok(prompt.includes(`Line Art: ${third.penStyle}`));
  assert.ok(prompt.includes(`Rendering: ${third.renderingMode}`));
  assert.ok(prompt.includes(`Shadows: ${third.shadowIntensity}`));
});

test('automatic style respects locks, existing identity and explicit MCP values', () => {
  const base = { ...DEFAULT_FORM_DATA, name: '既存人物', noseShape: '丸い鼻先' };
  const auto = resolveArtStyleProfile(base, { artStyle: 'おまかせ', toneStyle: '砂目トーン' }, { penStyle: true }, null, () => 0);
  assert.notEqual(auto.artStyle, base.artStyle);
  assert.equal(auto.penStyle, base.penStyle);
  assert.equal(auto.toneStyle, '砂目トーン');
  assert.equal(auto.name, base.name);
  assert.equal(auto.noseShape, base.noseShape);
  assert.deepEqual(resolveArtStyleProfile(base, { artStyle: 'おまかせ' }, { artStyle: true }), base);
  const explicit = '薄い青一色で描いた木版画';
  assert.equal(resolveArtStyleProfile(base, { artStyle: explicit }, {}).artStyle, explicit);
  assert.equal(resolveArtStyleProfile(base, { name: '別名' }, {}).artStyle, base.artStyle);
});

test('every listed MCP style is a complete bundle made of editable form values', () => {
  assert.equal(describeArtStyleOptions().automaticValue, 'おまかせ');
  assert.deepEqual(describeArtStyleOptions().choices, ART_STYLE_BUNDLES);
  for (const bundle of ART_STYLE_BUNDLES) {
    assert.deepEqual(Object.keys(bundle).sort(), [...ART_STYLE_SETTINGS].sort());
    for (const [key, value] of Object.entries(bundle)) assert.ok(OPTIONS[key].includes(value), key);
  }
});
