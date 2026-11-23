import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_FORM_DATA, OPTIONS } from './options.js';
import { buildPrompt } from './prompt.js';
import { FACE_AUTO, FACE_PARTS, FACE_PRESETS, applyFacePreset, randomFace } from './face-design.js';
import { lockCharacterIdentity } from './preset-actions.js';

test('face geometry and custom asymmetry take priority over generic gender and age cues', () => {
  const prompt = buildPrompt({
    ...DEFAULT_FORM_DATA,
    sex: '女性',
    ageGroup: '壮年（40〜55歳）',
    faceOutline: '横幅のある丸顔',
    jawShape: '短く丸い顎',
    browShape: '太い直線眉',
    noseShape: '幅広で丸い鼻先',
    mouthShape: '幅が狭く下唇が厚い口',
    faceDetails: '左眉が右より高い。鼻の上だけにそばかす。',
  });
  for (const value of ['横幅のある丸顔', '短く丸い顎', '太い直線眉', '幅広で丸い鼻先', '幅が狭く下唇が厚い口', '左眉が右より高い。鼻の上だけにそばかす。']) {
    assert.ok(prompt.includes(value), value);
  }
  assert.match(prompt, /same facial anatomy across all views/i);
  assert.doesNotMatch(prompt, /soft graceful anatomy|delicate features/i);
});

test('blank and automatic face fields produce no literal anatomy instructions', () => {
  const prompt = buildPrompt({
    ...DEFAULT_FORM_DATA,
    faceType: '',
    eyeShape: '',
    eyeColor: '',
    faceOutline: 'おまかせ',
    jawShape: '   ',
    faceDetails: '',
  });
  assert.doesNotMatch(prompt, /おまかせ|undefined|Face: +face shape/);
  assert.doesNotMatch(prompt, /^Face outline:|^Jaw and chin:/m);
});

test('facial proportions and body silhouette stay independently specified in the image prompt', () => {
  const faceAndBody = {
    eyeSpacing: '目と目の間がかなり広い',
    philtrumLength: '鼻の下から上唇までが長い',
    shoulderWidth: '腰幅より明らかに広い肩',
    torsoLegRatio: '胴が長く脚が短い',
    standingPosture: '背中を少し丸め、膝を軽く曲げる',
  };
  for (const key of Object.keys(faceAndBody)) assert.ok(Object.hasOwn(DEFAULT_FORM_DATA, key), key);
  const prompt = buildPrompt({ ...DEFAULT_FORM_DATA, ...faceAndBody, eyeShape: '小さな丸目' });
  for (const value of Object.values(faceAndBody)) assert.ok(prompt.includes(value), value);
  assert.match(prompt, /apply it to standing views/i);
  assert.match(prompt, /preserve the shoulder width and torso-to-leg proportions/i);
});

test('face presets apply only editable preset fields, using values available in the form', () => {
  for (const preset of FACE_PRESETS) {
    const changes = applyFacePreset(preset, { noseShape: true });
    assert.equal(changes.faceType, FACE_AUTO);
    assert.equal(changes.noseShape, undefined);
    assert.equal(changes.hairStyle, undefined);
    for (const [key, value] of Object.entries(changes)) assert.ok(OPTIONS[key].includes(value), key);
  }
});

test('face-only randomization changes unlocked anatomy and respects the whole-character lock', () => {
  const current = { ...DEFAULT_FORM_DATA, ...FACE_PRESETS[0].data };
  const changes = randomFace(current, { faceOutline: true }, OPTIONS.eyeShape, () => 0);
  assert.equal(changes.faceOutline, undefined);
  assert.notEqual(changes.eyeShape, current.eyeShape);
  assert.notEqual(changes.jawShape, current.jawShape);
  assert.deepEqual(Object.keys(changes).sort(), ['browShape', 'eyeShape', 'eyeSpacing', 'faceType', 'jawShape', 'mouthShape', 'noseShape', 'philtrumLength']);
  const { lockedFields } = lockCharacterIdentity({});
  for (const { key } of FACE_PARTS) assert.equal(lockedFields[key], true);
  assert.deepEqual(randomFace(current, lockedFields, OPTIONS.eyeShape), {});
});
