// AIキャラクターシートメーカー — プロンプト生成ロジック V1.1
// 画風指示を最上部に配置し、スタイル固有キーワードで絵柄を劇的に変える

// 画風ごとの固有スタイルキーワード（重み大 → 絵柄の変化が劇的に）
const ART_STYLE_KEYWORDS = {
  '青年漫画（写実・硬派）': '(seinen_manga:4.5), (heavy_inking:3.8), (detailed_crosshatching:3.5), (gritty_realism:3.2), (muscular_detail:2.8), (thick_bold_lines:3.0)',
  '少年漫画（王道・アクション）': '(shonen_manga:4.5), (dynamic_action_lines:3.8), (speed_lines:3.5), (bold_outlines:3.0), (exaggerated_expressions:2.8), (high_energy_composition:3.0)',
  '少女漫画（華麗・繊細）': '(shoujo_manga:4.5), (screentone_flowers:3.8), (sparkle_effects:3.5), (thin_delicate_lines:3.2), (soft_dreamy_shading:3.0), (romantic_atmosphere:2.8)',
  '劇画（重厚・劇的）': '(gekiga:4.5), (extreme_contrast:3.8), (dramatic_shadows:3.5), (woodcut_hatching:3.2), (dark_heavy_atmosphere:3.0), (realistic_proportions:2.8)',
  'アメコミ（力強い陰影）': '(american_comics:4.5), (bold_black_shadows:3.8), (halftone_dots:3.5), (superhero_anatomy:3.2), (ink_splash:3.0), (dynamic_pose:2.8)',
  'ギャグ・コミカル（デフォルメ）': '(chibi:4.5), (super_deformed:4.0), (comedic_expressions:3.8), (exaggerated_proportions:3.5), (simple_rounded_shapes:3.0), (pastel_colors:2.5)',
  'ケモノ・獣人（フルファー）': '(kemono:4.5), (furry_art:4.0), (detailed_fur_texture:3.8), (animal_anatomy:3.5), (anthro_design:3.0), (fluffy:2.8)',
  '透明感のある繊細なアニメ風': '(anime_style:4.5), (cel_shading:3.8), (clean_lines:3.5), (soft_gradient_coloring:3.2), (transparent_watercolor_feel:3.0), (luminous_skin:2.5)',
  '躍動感のあるダイナミックなスタイル': '(dynamic_perspective:4.5), (foreshortening:3.8), (motion_blur:3.5), (extreme_angle:3.2), (action_pose:3.0), (wind_effects:2.8)',
  '高密度な実写風': '(photorealistic:4.5), (hyper_detailed:4.0), (subsurface_scattering:3.5), (realistic_proportions:3.2), (studio_photography:3.0), (film_grain:2.0)',
  '90年代のレトロなセル画風': '(90s_anime:4.5), (cel_animation:4.0), (retro_color_palette:3.8), (hand_painted_background:3.5), (VHS_aesthetic:2.5), (nostalgic_tone:2.8)',
  '80年代風シティポップ': '(80s_aesthetic:4.5), (city_pop:4.0), (neon_colors:3.8), (retro_futurism:3.5), (airbrush_style:3.2), (sunset_gradient:3.0)',
  'ドット絵・ピクセルアート': '(pixel_art:5.0), (8bit:4.5), (limited_color_palette:4.0), (blocky_shapes:3.8), (dithering:3.0), (retro_game_aesthetic:3.2)',
  '浮世絵風': '(ukiyo_e:5.0), (woodblock_print:4.5), (flat_color_areas:4.0), (calligraphic_lines:3.8), (traditional_japanese_art:3.5), (edo_period:3.0)',
  '重厚な厚塗り油彩風': '(oil_painting:5.0), (impasto:4.5), (thick_brushstrokes:4.0), (rich_texture:3.8), (classical_art:3.5), (chiaroscuro:3.2)',
  '鉛筆の質感を残したラフスケッチ': '(pencil_sketch:5.0), (graphite:4.5), (rough_hatching:4.0), (unfinished_look:3.8), (paper_texture:3.5), (smudge_effect:3.0)',
  '粘土細工・3Dフィギュア風': '(3d_render:5.0), (clay_model:4.5), (figurine:4.0), (smooth_surface:3.8), (studio_lighting:3.5), (plastic_material:3.0)',
  '精密な工業設計図風': '(blueprint:5.0), (technical_drawing:4.5), (wireframe:4.0), (mechanical_precision:3.8), (grid_lines:3.5), (monochrome_blue:3.0)',
};

/**
 * フォームデータからキャラクターシート生成用プロンプトを構築
 */
export const buildPrompt = (formData) => {
  const d = formData;
  const finalName = d.name || '名無しの被験体';

  // === 画風キーワード（最上位優先度 — ここでスタイルが決まる） ===
  const styleKw = ART_STYLE_KEYWORDS[d.artStyle] || `(${d.artStyle}:4.0)`;

  // 性別ウェイト
  const genderWeight = (d.gender.includes('男') || d.gender.includes('オス') || d.gender.includes('巨漢'))
    ? `(ULTRA-MASCULINE:3.8), (MALE focus:2.8), (strong_anatomy:2.2), (NO_FEMININITY:4.5), (rugged_manly_features:2.2)`
    : (d.gender.includes('女') || d.gender.includes('少女') || d.gender.includes('老女') || d.gender.includes('メス'))
      ? `(ULTRA-FEMININE:3.8), (FEMALE focus:2.8), (soft_graceful_anatomy:2.2), (delicate_features:1.8)`
      : `(ANDROGYNOUS:2.2), (gender_neutral_features:2.0)`;

  // 背景制御
  const bgControl = d.backgroundMode === '純白背景（デフォルト）'
    ? `(plain pure white background:4.8), (isolated on white:4.2), (NO black border:5.0), (NO frame:5.0), (seamless white background:3.5).`
    : d.backgroundMode === 'グラデーション背景'
      ? `(gradient background:3.5), (soft tone gradient:3.0), (NO black border:5.0).`
      : d.backgroundMode === '世界観準拠の背景'
        ? `(${d.eraStyle} themed background:3.5), (atmospheric environment:3.0), (${d.atmosphere}:2.5)${d.weatherTime !== '指定なし' ? `, (${d.weatherTime}:2.0)` : ''}.`
        : `(${d.backgroundMode}:3.5), (NO black border:5.0).`;

  // レイアウト
  const layoutInstruction = d.layoutType.includes('三面図')
    ? `[レイアウト：三面図] (full_body_standing_poses:3.2). 水平整列：正面、真横、背面。`
    : d.layoutType.includes('12分割') || d.layoutType.includes('グリッド')
      ? `[レイアウト：12分割グリッド] 3x4 layout. 1段目：スペック、2-3段目：表情集、4段目：全身三面図。`
      : `[レイアウト：カスタム] ${d.layoutType}`;

  // OCR連携フィールド（Nano Banana Proが読み取る追加情報）
  const ocrExtras = [];
  if (d.actionTendency && d.actionTendency !== 'なし') ocrExtras.push(`■アクション：${d.actionTendency}`);
  if (d.emotionRange) ocrExtras.push(`■感情幅：${d.emotionRange}`);
  if (d.directionStyle) ocrExtras.push(`■演出：${d.directionStyle}`);
  if (d.awakening && d.awakening !== 'なし') ocrExtras.push(`■覚醒：${d.awakening}`);
  const ocrBlock = ocrExtras.length > 0 ? '\n  ' + ocrExtras.join('\n  ') : '';

  return `
# 【キャラクターシート設計：V1.1】

【絶対遵守の出力要件】
- 画像アスペクト比：A4縦サイズ（portrait / 3:4 または 9:16 ベースの縦長）を厳守。横長や正方形式は禁止。
- 背景設定：純白（#FFFFFF）の無地背景限定。風景・背景描写は禁止。
- 着色スタイル：画風・プロンプトの指定（カラー・モノクロ等）に原則従う。白黒の強制はなし。

[0. アートスタイル最優先指令 — この指示が全体の画風を支配する]
- ${styleKw}
- 線画：(linework:3.5): ${d.penStyle}.
- 階調：(${d.renderingMode}:3.0). ${d.toneStyle !== 'トーンなし' ? `トーン: (${d.toneStyle}:2.5).` : ''}
- 光源：(${d.lighting}:3.0). 影: (${d.shadowIntensity}:2.8). 配色：(${d.colorTheme}:2.5).

[1. データ刻印 ＆ 背景制御]
- ${bgControl}
- 画像上部：「太字の黒色日本語タイポグラフィ」で以下を直接描画。
  ■氏名：${finalName}${d.nickname ? ` 【${d.nickname}】` : ''}
  ■属性：${d.gender} / ${d.ageGroup} / ${d.ethnicity}
  ■身体：${d.height} / ${d.weight} / ${d.bodyBuild}(${d.muscleType})
  ■精神：${d.personality} / 好き：${d.likes} / 嫌い：${d.dislikes}
  ■言動：口癖：${d.catchphrase} / 台詞：${d.dialogue}
  ${d.archetype ? `■役割：${d.archetype}` : ''}${d.organization ? ` / 所属：${d.organization}` : ''}${ocrBlock}

[2. 生体・造形構造]
- 性別基盤：${genderWeight} (${d.ageGroup}:2.5).
- 肉体：(${d.bodyBuild}:2.5), (${d.muscleType}:2.0). 肌質: (${d.skinType}:2.2). 紋様: ${d.bodyArt}.
- 頭部：(${d.faceType}:2.5), (${d.eyeShape}:2.5), 瞳色: (${d.eyeColor}:2.2), 髭: ${d.facialHair}, メイク: ${d.makeup}.
- 髪：(${d.hairStyle}:2.5) (${d.hairColor}:2.5). 特殊部位: ${d.subhumanPart}.

[3. 装飾・衣装・装備]
- 世界観：(${d.eraStyle}:2.8).
- 衣装：(${d.costume}:2.8), 状態: ${d.outfitCondition}, 着こなし: ${d.outfitFit}, 素材: (${d.material}:2.2).
- 装飾：眼鏡: ${d.glassesStyle}, 頭部: ${d.headAccessory}, 耳: ${d.earAccessory}, 首: ${d.neckAccessory}, ピアス: ${d.facePiercing}.
- 武装：メイン: (${d.weapon}:2.5), サブ: ${d.subWeapon}, 小物: ${d.accessory}.
- 演出：(${d.magicEffect}:2.8), (${d.auraColor}:2.5).

[4. ポーズ ＆ 表現]
- ベースポーズ：(${d.basePose}:3.2).
- 表情：(${d.expressionSet}:3.0).
- 視線：(${d.gazeDirection}:2.5). 手の表現：(${d.handExpression}:2.5).
${d.voiceType ? `- 声質イメージ：${d.voiceType}. 話し方：${d.speechStyle}.` : ''}

${layoutInstruction}
${d.details ? `\n[追加詳細] ${d.details}.` : ''}

[5. 厳守ルール]
- (キャラクター一貫性：5.0)：全図で同一性を完璧に維持。
- (ノイズ排除)：余計な枠線・グリッド・記号を排除。
`.trim();
};
