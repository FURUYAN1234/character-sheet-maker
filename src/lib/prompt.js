// AIキャラクターシートメーカー — プロンプト生成ロジック V2.0
// Gemini / Imagen / DALL-E 向け自然言語プロンプト（SD形式ウェイト記法を完全排除）

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
 * Gemini / Imagen / DALL-E 向け：自然言語のみ使用、SD形式ウェイト記法は使用しない
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

  // 年齢ベースの視覚的補強（AIが年齢を無視しないよう具体的な外見描写を追加）
  let ageVisualDesc = '';
  if (d.ageGroup.includes('乳幼児') || d.ageGroup.includes('幼児')) {
    ageVisualDesc = 'Draw as a very young toddler/infant with a round baby face, chubby cheeks, stubby limbs, and large head-to-body ratio.';
  } else if (d.ageGroup.includes('児童')) {
    ageVisualDesc = 'Draw as a child with youthful round face, small body frame, and innocent features.';
  } else if (d.ageGroup.includes('老人')) {
    ageVisualDesc = 'CRITICAL: Draw as a clearly elderly person aged 71+. Must have deep wrinkles on face and hands, sagging skin, age spots, visibly aged and weathered appearance. Do NOT draw as young.';
  } else if (d.ageGroup.includes('熟年')) {
    ageVisualDesc = 'Draw as a mature middle-aged to older person (56-70) with visible age lines, crow\'s feet, slightly sagging features.';
  } else if (d.ageGroup.includes('壮年')) {
    ageVisualDesc = 'Draw as a mature adult (40-55) with slight age lines and mature features.';
  }

  // 体型ベースの視覚的補強
  let bodyVisualDesc = '';
  if (d.bodyBuild.includes('小太り') || d.bodyBuild.includes('肉感的')) {
    bodyVisualDesc = 'IMPORTANT: Body must appear visibly plump and round with soft belly, thick arms, and full rounded figure. Do NOT draw as slim or slender.';
  } else if (d.bodyBuild.includes('超巨漢') || d.bodyBuild.includes('大柄')) {
    bodyVisualDesc = 'IMPORTANT: Body must be extremely large, massive, and heavy-set with broad frame and thick limbs.';
  } else if (d.bodyBuild.includes('華奢') || d.bodyBuild.includes('細身')) {
    bodyVisualDesc = 'Body should appear delicately thin with narrow shoulders and slender limbs.';
  }

  // 背景制御 — キャラクターシートはOCR連携のため常に白背景を強制
  const bgControl = 'Background MUST be plain pure white (#FFFFFF). No scenery, no gradients, no textures, no borders, no frames. The character is isolated on a completely seamless white background. This is non-negotiable.';

  // レイアウトの強力な指示
  let layoutInstruction;
  let layoutMainConcept = "";
  if (d.layoutType.includes('三面図')) {
    layoutMainConcept = "Three-view character design sheet (Front, Side, Back).";
    layoutInstruction = 'CRITICAL LAYOUT: You MUST draw exactly THREE full-body standing poses of the same character side-by-side (Front view, Side profile view, and Back view). Do NOT use a grid format. Do NOT add floating heads or extra facial expressions. ONLY the three full-body views.';
  } else if (d.layoutType.includes('12分割') || d.layoutType.includes('グリッド')) {
    layoutMainConcept = "12-Panel Grid character design sheet with facial expressions.";
    layoutInstruction = 'CRITICAL LAYOUT: You MUST arrange the sheet as a dense multi-panel grid (e.g., 3x4 grid). Include multiple close-up panels showing various facial expressions, and smaller panels for full-body poses. The image must look like a collection of many panels.';
  } else {
    layoutMainConcept = `${d.layoutType} character design sheet.`;
    layoutInstruction = `CRITICAL LAYOUT: ${d.layoutType}`;
  }

  const infoLines = [
    `■氏名：${finalName}${d.nickname ? ` 【${d.nickname}】` : ''}`,
    `■属性：${d.sex} / ${d.species} / ${d.ageGroup} / ${d.ethnicity}`,
    `■身体：${d.height} / ${d.weight} / ${d.bodyBuild}(${d.muscleType})`,
    `■精神：${d.personality}`,
    `■好き：${d.likes}`,
    `■嫌い：${d.dislikes}`,
    `■口癖：${d.catchphrase}`,
    `■台詞：${d.dialogue}`,
  ];
  if (d.archetype) infoLines.push(`■役割：${d.archetype}`);
  if (d.organization) infoLines.push(`■所属：${d.organization}`);
  if (d.actionTendency && d.actionTendency !== 'なし') infoLines.push(`■アクション：${d.actionTendency}`);
  if (d.emotionRange) infoLines.push(`■感情幅：${d.emotionRange}`);
  if (d.directionStyle) infoLines.push(`■演出：${d.directionStyle}`);
  if (d.awakening && d.awakening !== 'なし') infoLines.push(`■覚醒：${d.awakening}`);

  const characterInfoBlock = infoLines.map(line => `  ${line}`).join('\n');

  return `
An elaborate and professional character design sheet.
OVERALL LAYOUT: ${layoutMainConcept}
ART STYLE TO ENFORCE: ${styleKw}
Line Art: ${d.penStyle}. Rendering: ${d.renderingMode}. ${d.toneStyle !== 'トーンなし' ? `Screentone: ${d.toneStyle}.` : ''} Lighting: ${d.lighting}. Color theme: ${d.colorTheme}.

## 1. LAYOUT INSTRUCTIONS (ABSOLUTE PRIORITY)
${layoutInstruction}

## 2. ART STYLE INSTRUCTIONS (CRITICAL)
You MUST strictly follow the requested art style: [ ${styleKw} ].
Do not use a generic anime style unless requested. The visual aesthetics, shading, and linework must perfectly match the requested style.

## 3. CHARACTER INFORMATION
Name and text to render at the top in Japanese:
${characterInfoBlock}

## 4. CHARACTER APPEARANCE
Gender: ${genderDesc}
Age group: ${d.ageGroup}. ${ageVisualDesc}
Body build: ${d.bodyBuild} with ${d.muscleType}. ${bodyVisualDesc}
Face: ${d.faceType} face shape, ${d.eyeShape} eyes, ${d.eyeColor} color.
Hair: ${d.hairStyle}, ${d.hairColor} color.
Skin: ${d.skinType}.
Additional body features: ${d.subhumanPart}, ${d.bodyArt}.
${d.facialHair !== '髭なし' ? `Facial hair: ${d.facialHair}.` : ''}

## 5. OUTFIT & EQUIPMENT
Base costume: ${d.costume} (${d.eraStyle} era setting).
Outfit fit: ${d.outfitFit}, Material: ${d.material}, Condition: ${d.outfitCondition}.
Weapon: ${d.weapon}. Sub-weapon: ${d.subWeapon}.
Accessories: Head: ${d.headAccessory}, Face/Glasses: ${d.glassesStyle}, Neck: ${d.neckAccessory}, Ear: ${d.earAccessory}, Piercing: ${d.facePiercing}, Other: ${d.accessory}.
Visual effects: ${d.magicEffect}, Aura: ${d.auraColor}. Makeup: ${d.makeup}.

## 6. POSE, EXPRESSION & MANNERISM
Base pose: ${d.basePose}.
Facial expression: ${d.expressionSet}.
Gaze direction: ${d.gazeDirection}. Hand expression: ${d.handExpression}.
${d.voiceType ? `Voice image: ${d.voiceType}. Speech mannerism: ${d.speechStyle}.` : ''}

## 7. BACKGROUND & STRICT RULES
- ${bgControl}
- Image aspect ratio: Portrait A4 (3:4 or 9:16 vertical). Landscape or square is strictly forbidden.
- DO NOT render any technical parameters, tags, weight numbers, or metadata as visible text in the image.
- Character Consistency: If multiple views are shown, they MUST be the exact same character with identical clothing and proportions.
- No visual noise, no plastic skin, no unwanted text or numbers. Keep shading clean.
${d.details ? `- Additional user details: ${d.details}` : ''}
`.trim();
};
