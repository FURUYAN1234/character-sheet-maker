// AIキャラクターシートメーカー — プロンプト生成ロジック V2.0
// Gemini / Imagen 向け自然言語プロンプト（SD形式ウェイト記法を完全排除）

// 画風ごとの自然言語スタイル指示
const ART_STYLE_KEYWORDS = {
  '青年漫画（写実・硬派）': 'seinen manga style with heavy inking, detailed crosshatching, gritty realism, thick bold lines, and muscular detail emphasis',
  '少年漫画（王道・アクション）': 'shonen manga style with dynamic action lines, speed lines, bold outlines, exaggerated expressions, and high-energy composition',
  '少女漫画（華麗・繊細）': 'shoujo manga style with decorative screentone flowers, sparkle effects, thin delicate lines, soft dreamy shading, and romantic atmosphere',
  '劇画（重厚・劇的）': 'gekiga style with extreme contrast, dramatic deep shadows, woodcut-like hatching, dark heavy atmosphere, and realistic proportions',
  'アメコミ（力強い陰影）': 'American comics style with bold black shadows, halftone dot shading, superhero-like anatomy, ink splashes, and dynamic poses',
  'ギャグ・コミカル（デフォルメ）': 'chibi / super-deformed comedic style with exaggerated proportions, simple rounded shapes, comedic expressions, and pastel color palette',
  'ケモノ・獣人（フルファー）': 'kemono / furry art style with detailed fur texture, animal-based anatomy, anthropomorphic design, and fluffy appearance',
  '透明感のある繊細なアニメ風': 'clean anime style with cel shading, clean precise lines, soft gradient coloring, transparent watercolor-like feel, and luminous skin rendering',
  '躍動感のあるダイナミックなスタイル': 'dynamic perspective style with dramatic foreshortening, motion blur effects, extreme camera angles, action poses, and wind effects',
  '高密度な実写風': 'photorealistic hyper-detailed style with subsurface scattering, realistic proportions, studio photography lighting, and subtle film grain',
  '90年代のレトロなセル画風': '1990s retro anime cel animation style with retro color palette, hand-painted backgrounds, VHS-era aesthetic, and nostalgic warm tones',
  '80年代風シティポップ': '1980s city pop aesthetic with neon colors, retro-futurism, airbrush-style rendering, and sunset gradient backgrounds',
  'ドット絵・ピクセルアート': 'pixel art / 8-bit style with limited color palette, blocky shapes, dithering patterns, and retro game aesthetic',
  '浮世絵風': 'ukiyo-e Japanese woodblock print style with flat color areas, calligraphic brush lines, and traditional Edo-period art feel',
  '重厚な厚塗り油彩風': 'oil painting style with thick impasto brushstrokes, rich canvas texture, classical chiaroscuro lighting, and deep color layers',
  '鉛筆の質感を残したラフスケッチ': 'pencil sketch style with visible graphite texture, rough hatching, intentionally unfinished look, paper texture, and smudge effects',
  '粘土細工・3Dフィギュア風': '3D rendered clay model / figurine style with smooth surfaces, studio lighting, and plastic-like material shading',
  '精密な工業設計図風': 'technical blueprint style with wireframe overlays, mechanical precision, grid lines, and monochrome blue palette',
};

/**
 * フォームデータからキャラクターシート生成用プロンプトを構築
 * Gemini / Imagen 向け：自然言語のみ使用、SD形式ウェイト記法は使用しない
 */
export const buildPrompt = (formData) => {
  const d = formData;
  const finalName = d.name || '名無しの被験体';

  // === 画風キーワード（自然言語） ===
  const styleKw = ART_STYLE_KEYWORDS[d.artStyle] || d.artStyle;

  // 性別の自然言語指示
  const genderDesc = (d.sex === '男性')
    ? 'Depict as unmistakably masculine with strong rugged features. Absolutely no feminine traits.'
    : (d.sex === '女性')
      ? 'Depict as clearly feminine with soft graceful anatomy and delicate features.'
      : 'Depict with androgynous gender-neutral features.';

  // 背景制御 — キャラクターシートはOCR連携のため常に白背景を強制
  const bgControl = 'Background MUST be plain pure white (#FFFFFF). No scenery, no gradients, no textures, no borders, no frames. The character is isolated on a completely seamless white background. This is non-negotiable.';

  // レイアウト
  let layoutInstruction;
  if (d.layoutType.includes('三面図')) {
    layoutInstruction = '[Layout: Three-View Sheet] Show the character in three full-body standing poses arranged horizontally: Front view, Side profile view, and Back view. Label each view clearly as "Front", "Profile", "Back".';
  } else if (d.layoutType.includes('12分割') || d.layoutType.includes('グリッド')) {
    layoutInstruction = '[Layout: 12-Panel Grid] Arrange in a 3x4 grid. Row 1: character specs/stats. Rows 2-3: facial expression collection. Row 4: full-body three-view (front, side, back).';
  } else {
    layoutInstruction = `[Layout: Custom] ${d.layoutType}`;
  }

  // OCR連携フィールド
  const ocrExtras = [];
  if (d.actionTendency && d.actionTendency !== 'なし') ocrExtras.push(`■アクション：${d.actionTendency}`);
  if (d.emotionRange) ocrExtras.push(`■感情幅：${d.emotionRange}`);
  if (d.directionStyle) ocrExtras.push(`■演出：${d.directionStyle}`);
  if (d.awakening && d.awakening !== 'なし') ocrExtras.push(`■覚醒：${d.awakening}`);
  const ocrBlock = ocrExtras.length > 0 ? '\n  ' + ocrExtras.join('\n  ') : '';

  return `
# Character Design Sheet V2.0

## CRITICAL OUTPUT REQUIREMENTS
- Image aspect ratio: Portrait A4 (3:4 or 9:16 vertical). Landscape or square is strictly forbidden.
- Coloring: Follow the specified art style (color or monochrome as appropriate).
- DO NOT render any technical parameters, tags, weight numbers, or metadata as visible text in the image.
- Only render the character info block (name, attributes etc.) as visible Japanese text in the upper area.

## 1. ART STYLE (Highest Priority — This defines the entire visual look)
Art style: ${styleKw}.
Line art: ${d.penStyle} style lines.
Rendering: ${d.renderingMode}.${d.toneStyle !== 'トーンなし' ? ` Screentone: ${d.toneStyle}.` : ''}
Lighting: ${d.lighting}. Shadow intensity: ${d.shadowIntensity}. Color theme: ${d.colorTheme}.

## 2. BACKGROUND
${bgControl}

## 3. CHARACTER INFO (Render as bold black Japanese text at the top of the image)
Display the following information as styled Japanese typography at the top of the sheet:
  ■氏名：${finalName}${d.nickname ? ` 【${d.nickname}】` : ''}
  ■属性：${d.sex} / ${d.species} / ${d.ageGroup} / ${d.ethnicity}
  ■身体：${d.height} / ${d.weight} / ${d.bodyBuild}(${d.muscleType})
  ■精神：${d.personality} / 好き：${d.likes} / 嫌い：${d.dislikes}
  ■言動：口癖：${d.catchphrase} / 台詞：${d.dialogue}
  ${d.archetype ? `■役割：${d.archetype}` : ''}${d.organization ? ` / 所属：${d.organization}` : ''}${ocrBlock}

## 4. CHARACTER BODY & FEATURES (Critical details)
${genderDesc} Age group: ${d.ageGroup}.
Special body parts: ${d.subhumanPart}. Body markings/tattoos: ${d.bodyArt}.
Body build: ${d.bodyBuild} with ${d.muscleType}. Skin texture: ${d.skinType}.
Hair: ${d.hairStyle} in ${d.hairColor} color.
Face: ${d.faceType} face shape with ${d.eyeShape} eyes. Eye color: ${d.eyeColor}.
${d.facialHair !== '髭なし' ? `Facial hair: ${d.facialHair}.` : ''}

## 5. OUTFIT, EQUIPMENT & ACCESSORIES
Primary weapon: ${d.weapon}. Base costume: ${d.costume}. Setting/era: ${d.eraStyle}.
Visual effects: ${d.magicEffect}, aura color: ${d.auraColor}. Outfit condition: ${d.outfitCondition}.
Accessories: glasses: ${d.glassesStyle}, headwear: ${d.headAccessory}, sub-weapon: ${d.subWeapon}.
Minor details: ear accessory: ${d.earAccessory}, necklace: ${d.neckAccessory}, piercing: ${d.facePiercing}, other: ${d.accessory}.
Makeup: ${d.makeup}. Outfit fit: ${d.outfitFit}. Material: ${d.material}.

## 6. POSE & EXPRESSION
Base pose: ${d.basePose}.
Facial expression: ${d.expressionSet}.
Gaze direction: ${d.gazeDirection}. Hand expression: ${d.handExpression}.
${d.voiceType ? `Voice image: ${d.voiceType}. Speech mannerism: ${d.speechStyle}.` : ''}

## 7. LAYOUT
${layoutInstruction}
${d.details ? `\n## 8. ADDITIONAL DETAILS\n${d.details}.` : ''}

## STRICT RULES
- Character consistency: All views must depict the exact same character with identical features.
- No extra borders, grid lines, or stray marks.
- Do NOT write any English tags, parameter values, or weight numbers anywhere in the image.
`.trim();
};
