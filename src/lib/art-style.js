export const AUTOMATIC_ART_STYLE = 'おまかせ';

export const ART_STYLE_SETTINGS = [
  'artStyle', 'penStyle', 'renderingMode', 'toneStyle', 'shadowIntensity', 'lighting', 'colorTheme',
];

export const ART_STYLE_BUNDLES = [
  {
    artStyle: '青年漫画（写実・硬派）', penStyle: 'Gペン（強弱のある鋭い線）',
    renderingMode: 'モノクロ2階調', toneStyle: '標準網トーン', shadowIntensity: '標準的なコントラスト',
    lighting: 'ドラマチックな逆光', colorTheme: 'モノトーン（差し色なし）',
  },
  {
    artStyle: '少女漫画（華麗・繊細）', penStyle: '丸ペン（繊細な線）',
    renderingMode: 'フルカラー（標準）', toneStyle: 'トーンなし', shadowIntensity: '柔らかい拡散影',
    lighting: '神々しい光', colorTheme: 'パステル（柔和）',
  },
  {
    artStyle: '劇画（重厚・劇的）', penStyle: '筆ペン（和風・力強い）',
    renderingMode: 'モノクロ2階調', toneStyle: 'スクラッチ・ハッチング', shadowIntensity: '極めて深い影（ノワール）',
    lighting: 'コントラストの強い影', colorTheme: 'モノトーン（差し色なし）',
  },
  {
    artStyle: '90年代のレトロなセル画風', penStyle: 'ミリペン（均一な線）',
    renderingMode: 'セル塗り（影の境界が明瞭）', toneStyle: 'トーンなし', shadowIntensity: '標準的なコントラスト',
    lighting: 'スタジオ撮影風', colorTheme: '暖色中心（情熱）',
  },
  {
    artStyle: '高密度な実写風', penStyle: '輪郭線なし',
    renderingMode: '写実的な階調（自然なグラデーション）', toneStyle: 'トーンなし', shadowIntensity: '柔らかい拡散影',
    lighting: 'スタジオ撮影風', colorTheme: '自然な色彩',
  },
  {
    artStyle: '浮世絵風', penStyle: '筆ペン（和風・力強い）',
    renderingMode: '平塗り（色面を重ねる）', toneStyle: 'トーンなし', shadowIntensity: '影なしフラットな描写',
    lighting: '均一な光', colorTheme: '赤と白（和風）',
  },
  {
    artStyle: '重厚な厚塗り油彩風', penStyle: '輪郭線なし',
    renderingMode: '厚塗り（絵具と筆跡の質感）', toneStyle: 'トーンなし', shadowIntensity: '極めて深い影（ノワール）',
    lighting: 'コントラストの強い影', colorTheme: '暖色中心（情熱）',
  },
  {
    artStyle: '鉛筆の質感を残したラフスケッチ', penStyle: '鉛筆',
    renderingMode: 'グレースケール', toneStyle: '万線トーン', shadowIntensity: '柔らかい拡散影',
    lighting: '均一な光', colorTheme: 'モノトーン（差し色なし）',
  },
];

const unlockedArtStyle = (bundle, lockedFields) => Object.fromEntries(
  Object.entries(bundle).filter(([key]) => !lockedFields[key]),
);

export function chooseArtStyle(current, lockedFields, lastStyle, random = Math.random) {
  if (lockedFields.artStyle) return {};
  const candidates = ART_STYLE_BUNDLES.filter(({ artStyle }) => artStyle !== current.artStyle && artStyle !== lastStyle);
  return unlockedArtStyle(candidates[Math.floor(random() * candidates.length)], lockedFields);
}

export function resolveArtStyleProfile(current, profile, lockedFields, lastStyle, random = Math.random) {
  const { artStyle, ...fields } = profile;
  if (artStyle === AUTOMATIC_ART_STYLE) {
    return { ...current, ...chooseArtStyle(current, lockedFields, lastStyle, random), ...fields };
  }
  return { ...current, ...profile };
}

export function describeArtStyleOptions() {
  return {
    automaticValue: AUTOMATIC_ART_STYLE,
    choices: ART_STYLE_BUNDLES,
    guidance: [
      'Use the user’s explicit art direction for profile.artStyle. A free-form style description is supported.',
      'When the user delegates the choice, pass profile.artStyle = おまかせ. Omit it to keep the current style.',
      'If the intended art direction is unclear and matters to the result, offer a few relevant choices or ask the user for a custom style before generating.',
    ],
  };
}
