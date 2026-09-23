import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCharacterAnalysis, compileCharacterPrompt } from './character-identity.js';

const feature = (patch = {}) => ({
  id: 'f1', group: 'hair', part: 'back', description: 'Back hair ends below the clavicle.',
  visibility: 'clear', evidence: 'Ends visible against the jacket.', view_ids: ['front'],
  location: null, layer_order: null, ratio: null, ...patch,
});
const observation = (features = [feature()]) => ({
  schema_version: 1,
  subjects: [{ id: 'c1', views: [{ id: 'front', label: 'front view' }], features }],
  presentation: { pose: '', expression: '', gaze: '', composition: '', background: '', lighting: '', rendering: '' },
  uncertainties: [],
});
const compile = (value) => compileCharacterPrompt(parseCharacterAnalysis(JSON.stringify(value)));

test('preserves visible hair endpoints, accessory placement, and presentation priority', () => {
  const result = compile(observation([
    feature(),
    feature({ id: 'f2', group: 'accessories', part: 'hair_ornament', description: 'A small silver clasp crosses the side-lock.', evidence: 'Visible at the temple.', location: { frame: 'subject', side: 'right', anchor: 'temple' } }),
  ]));
  assert.match(result, /below the clavicle/);
  assert.match(result, /silver clasp/);
  assert.match(result, /subject.right/i);
  assert.ok(result.indexOf('CHARACTER IDENTITY') < result.indexOf('PRESENTATION'));
  assert.ok(result.indexOf('PRESENTATION') < result.indexOf('PRESERVATION RULES'));
  assert.doesNotMatch(result, /see (?:the )?(?:attached|reference) image/i);
});

test('does not invent hidden back hair or subject-side from image-side', () => {
  const result = compile(observation([
    feature({ part: 'fringe', description: 'Blunt fringe above eyebrows.' }),
    feature({ id: 'hidden', description: '', visibility: 'unknown', evidence: 'Back occluded.' }),
    feature({ id: 'image-side', group: 'accessories', part: 'hair_ornament', description: 'A visible ribbon.', evidence: 'At image edge.', location: { frame: 'image', side: 'left', anchor: 'temple' } }),
  ]));
  assert.match(result, /Blunt fringe/);
  assert.match(result, /image.left/i);
  assert.doesNotMatch(result, /below the clavicle|waist.length|ponytail|subject.left/i);
});

test('sorts clothes inside to outside and keeps different subjects separate', () => {
  const value = observation([
    feature({ id: 'outer', group: 'clothing', part: 'layer', description: 'Blue coat.', evidence: 'Over shirt.', layer_order: 1 }),
    feature({ id: 'inner', group: 'clothing', part: 'layer', description: 'White shirt.', evidence: 'At neckline.', layer_order: 0 }),
  ]);
  value.subjects.push({ id: 'c2', views: [{ id: 'side', label: 'side view' }], features: [feature({ id: 'glasses', group: 'accessories', part: 'eyewear', description: 'Square glasses.', evidence: 'On face.', view_ids: ['side'] })] });
  const result = compile(value);
  assert.ok(result.indexOf('White shirt') < result.indexOf('Blue coat'));
  assert.ok(result.indexOf('CHARACTER IDENTITY — c2') < result.indexOf('Square glasses'));
  assert.ok(result.indexOf('Blue coat') < result.indexOf('CHARACTER IDENTITY — c2'));
});

test('keeps long distinctive detail and only exact duplicates collapse', () => {
  const long = 'Specific interleaved curls and clips '.repeat(120);
  const result = compile(observation([
    feature({ description: long }), feature({ id: 'duplicate', description: long }),
    feature({ id: 'different', description: `${long} with an extra curl.` }),
  ]));
  assert.equal(result.split(long).length - 1, 2);
});

test('prints measured ratio as a view-bound estimate', () => {
  const result = compile(observation([feature({ ratio: { numerator: 'visible side-lock', denominator: 'face height', value: 0.376, basis: 'visual_estimate', view_id: 'front' } })]));
  assert.match(result, /~0\.38/);
  assert.match(result, /front view/i);
});

test('rejects prose, partial JSON, unsupported fields and structural contradictions', () => {
  assert.throws(() => parseCharacterAnalysis('A beautiful character.'));
  assert.throws(() => parseCharacterAnalysis(`${JSON.stringify(observation())} trailing`));
  assert.throws(() => compile({ ...observation(), schema_version: 2 }));
  assert.throws(() => compile(observation([feature({ ratio: { value: -1 } })])));
  assert.throws(() => compile(observation([feature({ view_ids: ['missing'] })])));
  assert.throws(() => compile(observation([feature({ layer_order: 0 })])));
  assert.throws(() => compile(observation([feature({ location: { frame: 'unknown', side: 'left', anchor: '' } })])));
  assert.throws(() => compile(observation([feature({ visibility: 'unknown', description: 'hidden hair' })])));
  assert.throws(() => compile(observation([feature({ visibility: 'unknown', description: '' })])));
});

test('accepts one enclosing JSON fence but not explanatory prose', () => {
  assert.match(compileCharacterPrompt(parseCharacterAnalysis('```json\n' + JSON.stringify(observation()) + '\n```')), /clavicle/);
  assert.throws(() => parseCharacterAnalysis(`Here it is:\n${JSON.stringify(observation())}`));
});
