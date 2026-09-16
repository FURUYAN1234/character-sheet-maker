import assert from 'node:assert/strict';
import test from 'node:test';
import * as promptModule from './prompt.js';

const formData = {
  name: '名無しの被験体',
  nickname: '',
  sex: '女性',
  species: '人間',
  ageGroup: '高校生世代（16〜18歳）',
  ethnicity: '日本・東アジア系',
  height: '175cm',
  weight: '70kg',
  bodyBuild: '標準的・バランス重視',
  muscleType: '筋肉強調なし',
  personality: '勝気・負けず嫌い',
  likes: 'バイク・機械整備',
  dislikes: '馴れ合い・集団行動',
  catchphrase: '俺がやる。それだけだ',
  dialogue: '……退け。死にたくなければな',
  archetype: 'ヒロイン',
  actionTendency: 'なし',
  emotionRange: 'バランス型（幅広い表現）',
  directionStyle: 'ダイナミック・見開き向き',
  awakening: 'なし',
  artStyle: '少女漫画（華麗・繊細）',
  faceType: '精悍でシャープ',
  eyeShape: '鋭い三白眼',
  eyeColor: '漆黒',
  hairStyle: '無造作ショート',
  hairColor: '黒髪',
  skinType: '日焼けした健康的な肌',
  subhumanPart: '特殊部位なし',
  bodyArt: '紋様なし',
  facialHair: '髭なし',
  layoutType: '12分割グリッド（感情・多角図）',
  penStyle: 'Gペン（強弱のある鋭い線）',
  renderingMode: 'フルカラー（標準）',
  toneStyle: 'トーンなし',
  lighting: 'ドラマチックな逆光',
  colorTheme: 'モノトーン ＆ 差し色',
  makeup: 'メイクなし',
  costume: '学生服',
  eraStyle: '現代・日常・学園',
  outfitFit: 'きっちり着こなしている',
  material: 'デニム ＆ レザー',
  outfitCondition: '新品同様（清潔）',
  weapon: '武器なし',
  subWeapon: 'サブ武器なし',
  headAccessory: '頭部装飾なし',
  glassesStyle: '眼鏡なし',
  neckAccessory: '首飾りなし',
  earAccessory: '耳飾りなし',
  facePiercing: 'ピアスなし',
  accessory: 'シルバーアクセサリー',
  magicEffect: '魔法効果なし',
  auraColor: 'オーラなし',
  expressionSet: '照れ・赤面',
  basePose: 'ニュートラル立ちポーズ',
  gazeDirection: 'カメラ目線',
  handExpression: '自然体',
  voiceType: '低く渋い',
  speechStyle: '寡黙（最小限）',
  organization: '',
};

const rendererModule = await import('./character-sheet-renderer.js').catch(() => ({}));

test('character profile entries are the same data source for prompt and image text', () => {
  assert.equal(typeof promptModule.buildCharacterInfoEntries, 'function');
  const entries = promptModule.buildCharacterInfoEntries(formData);

  assert.deepEqual(entries.slice(0, 4), [
    { label: '氏名', value: '名無しの被験体' },
    { label: '属性', value: '女性 / 人間 / 高校生世代（16〜18歳） / 日本・東アジア系' },
    { label: '身体', value: '175cm / 70kg / 標準的・バランス重視(筋肉強調なし)' },
    { label: '精神', value: '勝気・負けず嫌い' },
  ]);
  assert.ok(entries.some(({ label, value }) => label === '役割' && value === 'ヒロイン'));
  assert.ok(entries.some(({ label }) => label === '感情幅'));
  assert.ok(!entries.some(({ label }) => label === 'アクション'));
});

test('image prompt leaves visible lettering to deterministic app typesetting', () => {
  const prompt = promptModule.buildPrompt(formData);

  assert.match(prompt, /application will typeset the exact profile data after image generation/i);
  assert.match(prompt, /do not draw any text in the illustration/i);
  assert.match(prompt, /■氏名：名無しの被験体/);
});

test('character sheet compositor adds a readable profile header and preserves the full artwork', async () => {
  assert.equal(typeof rendererModule.composeCharacterSheet, 'function');

  const drawnText = [];
  const drawImageCalls = [];
  let outputCanvas;
  const context = {
    measureText: (value) => {
      const fontSize = Number(context.font?.match(/(\d+)px/)?.[1] || 10);
      return { width: Array.from(value).length * fontSize };
    },
    fillRect() {},
    fillText: (value) => drawnText.push({ value, font: context.font }),
    drawImage: (...args) => drawImageCalls.push(args),
    strokeText() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
  };
  const originalImage = globalThis.Image;
  const originalDocument = globalThis.document;

  class FakeImage {
    naturalWidth = 1024;
    naturalHeight = 1536;

    set src(value) {
      this._src = value;
      queueMicrotask(() => this.onload?.());
    }
  }

  Object.defineProperty(globalThis, 'Image', { configurable: true, writable: true, value: FakeImage });
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    writable: true,
    value: {
      createElement: (tagName) => {
        assert.equal(tagName, 'canvas');
        outputCanvas = {
          width: 0,
          height: 0,
          getContext: () => context,
          toDataURL: () => 'data:image/png;base64,composited',
        };
        return outputCanvas;
      },
    },
  });

  try {
    const result = await rendererModule.composeCharacterSheet('data:image/png;base64,source', formData);

    assert.equal(result, 'data:image/png;base64,composited');
    assert.equal(outputCanvas.width, 1024);
    assert.ok(outputCanvas.height > 1536);
    assert.ok(drawnText.some(({ value }) => value === '名無しの被験体'));
    assert.ok(drawnText.some(({ value }) => value === '■台詞'));
    assert.ok(drawnText.some(({ value }) => value === '……退け。死にたくなければな'));
    assert.equal(drawImageCalls.length, 1);
    assert.equal(drawImageCalls[0][1], 0);
    assert.ok(drawImageCalls[0][2] > 0);
    assert.equal(drawImageCalls[0][4], 1536);

    const defaultHeight = outputCanvas.height;
    const longDialogue = '機械整備の知識を活かして仲間を守り抜く。'.repeat(12);
    await rendererModule.composeCharacterSheet('data:image/png;base64,source', {
      ...formData,
      dialogue: longDialogue,
    });
    assert.ok(outputCanvas.height > defaultHeight);
    const valueOperations = drawnText.filter(({ font }) => font === '16px "Yu Gothic UI", Meiryo, sans-serif');
    assert.ok(valueOperations.map(({ value }) => value).join('').includes(longDialogue));
    assert.ok(valueOperations.every(({ value }) => context.measureText(value).width <= 347));
  } finally {
    if (originalImage === undefined) delete globalThis.Image;
    else Object.defineProperty(globalThis, 'Image', { configurable: true, writable: true, value: originalImage });
    if (originalDocument === undefined) delete globalThis.document;
    else Object.defineProperty(globalThis, 'document', { configurable: true, writable: true, value: originalDocument });
  }
});
