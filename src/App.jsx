// AIキャラクターシートメーカー V1.0 — メインアプリ
// 完全独立アプリ。他アプリとは混ぜない。
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import './App.css';
import { OPTIONS, DEFAULT_FORM_DATA, BACKUP_DATA, SECTIONS, PRESETS } from './lib/options';
import { buildPrompt } from './lib/prompt';
import { generateFieldValueAI, generateGachaTextsAI, generateImageAI, setActiveEngine, getEngineDisplayName, setApiKeys, getActiveEngine } from './lib/ai-provider';
import FieldInput from './components/FieldInput';

const SYSTEM_VERSION = "1.3.8";
const APP_NAME = "AIキャラクターシートメーカー";

// === スマート連携テーブル ===
// 幼児系 → 体型制限
const CHILD_AGES = ['乳幼児（1〜3歳）', '幼児（4〜6歳）', '児童（7〜12歳）'];
const CHILD_BUILDS = ['標準的・バランス重視', '華奢・小柄', '細身（ガリガリ）'];
// 世界観 → 衣装の適合マップ
const ERA_COSTUME_MAP = {
  '現代・都市裏社会': ['ストリート・カジュアル', '特殊戦闘服', 'フォーマルスーツ', '高級モード'],
  '現代・日常・学園': ['ストリート・カジュアル', '学生服', 'ジャージ', 'フォーマルスーツ', 'メイド・執事服'],
  '近未来・サイバーパンク': ['サイバーウェア', '特殊戦闘服', 'ストリート・カジュアル', '近代軍服'],
  '中世ファンタジー': ['西洋鎧', '魔道士ローブ', '伝統和装', '忍者装束', 'ストリート・カジュアル'],
  '和風伝奇・戦国': ['伝統和装', '忍者装束', '西洋鎧'],
  '19世紀スチームパンク': ['フォーマルスーツ', '高級モード', '近代軍服', '特殊戦闘服'],
  '宇宙時代・SF': ['サイバーウェア', '特殊戦闘服', '近代軍服'],
  '終末世界': ['ストリート・カジュアル', '特殊戦闘服', 'ジャージ'],
  '昭和レトロ': ['ストリート・カジュアル', '学生服', 'ジャージ', 'フォーマルスーツ'],
  '古代神話': ['魔道士ローブ', '伝統和装', '西洋鎧'],
  '異世界': ['魔道士ローブ', '西洋鎧', '伝統和装', '忍者装束', 'メイド・執事服', 'サイバーウェア'],
};

const App = () => {
  // === API認証 ===
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedEngine, setSelectedEngine] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const apiInputRef = useRef(null);



  // === フォームデータ ===
  const [formData, setFormData] = useState({ ...DEFAULT_FORM_DATA });
  const [lockedFields, setLockedFields] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({});
  const [copied, setCopied] = useState(false);

  // === 生成状態（APIは明示操作のみ） ===
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [fieldGenerating, setFieldGenerating] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  // === 画像結果 ===
  const [generatedImage, setGeneratedImage] = useState(null);
  const [imageModel, setImageModel] = useState('');
  const [textModel, setTextModel] = useState('');
  const [imageError, setImageError] = useState('');

  // === 生成履歴 ===
  const [history, setHistory] = useState([]);

  // === A/B比較モード ===
  const [compareMode, setCompareMode] = useState(false);
  const [activeSlot, setActiveSlot] = useState('A');
  const [slotAData, setSlotAData] = useState(null);
  const [slotBData, setSlotBData] = useState(null);
  const [slotAImage, setSlotAImage] = useState(null);
  const [slotBImage, setSlotBImage] = useState(null);

  // === API認証 ===
  const handleApiKeySubmit = () => {
    const key = apiKeyInput.trim();
    if (selectedEngine === 'gemini' && key.length > 10) {
      setApiKeys(key, '');
      setActiveEngine('gemini');
      setIsUnlocked(true);
    } else if (selectedEngine === 'openai' && key.length > 10) {
      setApiKeys('', key);
      setActiveEngine('openai');
      setIsUnlocked(true);
    } else {
      alert("APIキーが正しく認識できませんでした。Gemini (AIza...) または OpenAI (sk-...) の正しいキーを入力してください。");
    }
  };

  const handleApiKeyChange = (e) => {
    const val = e.target.value;
    setApiKeyInput(val);
    const trimmed = val.trim();
    if (trimmed.startsWith('sk-')) setSelectedEngine('openai');
    else if (trimmed.startsWith('AIza')) setSelectedEngine('gemini');
    else setSelectedEngine(null);
  };

  useEffect(() => {
    setApiKeys('', '');
    setActiveEngine('gemini');
    setApiKeyInput('');
    setSelectedEngine(null);
    setIsUnlocked(false);

    const clearRestoredInput = () => {
      if (apiInputRef.current) {
        apiInputRef.current.value = '';
      }
    };

    clearRestoredInput();
    const immediateTimer = window.setTimeout(clearRestoredInput, 0);
    const autofillTimer = window.setTimeout(clearRestoredInput, 300);

    return () => {
      window.clearTimeout(immediateTimer);
      window.clearTimeout(autofillTimer);
    };
  }, []);



  // === 現在のフォームデータ ===
  const getCurrentData = () => {
    if (!compareMode) return formData;
    if (activeSlot === 'B') return slotBData || { ...formData };
    return slotAData || formData;
  };
  const currentFormData = getCurrentData();

  // === フォームデータ更新 ===
  const updateField = useCallback((key, value) => {
    if (compareMode && activeSlot === 'B') {
      setSlotBData(prev => ({ ...(prev || { ...formData }), [key]: value }));
    } else if (compareMode && activeSlot === 'A') {
      setSlotAData(prev => ({ ...(prev || { ...formData }), [key]: value }));
      setFormData(prev => ({ ...prev, [key]: value }));
    } else {
      setFormData(prev => ({ ...prev, [key]: value }));
    }
  }, [activeSlot, compareMode, formData]);

  const toggleLock = useCallback((key) => {
    setLockedFields(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // === セクション折りたたみ ===
  const toggleSection = useCallback((sectionId) => {
    setCollapsedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }, []);
  const expandAll = () => setCollapsedSections({});
  const collapseAll = () => {
    const all = {};
    SECTIONS.forEach(s => { all[s.id] = true; });
    setCollapsedSections(all);
  };

  // === プロンプト（APIは叩かない） ===
  const generatedPrompt = useMemo(() => buildPrompt(currentFormData), [currentFormData]);

  // === ステータス表示 ===
  const statusTimerRef = useRef(null);
  const showStatus = (msg, autoHide = false) => {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    setStatusMessage(msg);
    if (autoHide) {
      statusTimerRef.current = setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  // === キャンバス正規化 + ウォーターマーク焼き込み ===
  // Nano Banana Pro準拠: 統一キャンバスサイズ + 右下にシンプルテキスト
  const TARGET_WIDTH = 1024;
  const TARGET_HEIGHT = 1536; // 2:3 縦長（キャラクターシート標準）

  const applyWatermark = (base64DataUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // キャンバスを統一サイズに正規化
        const canvas = document.createElement('canvas');
        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;
        const ctx = canvas.getContext('2d');

        // 白で塗りつぶし（背景）
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 元画像をアスペクト比を維持して中央にフィット（全体表示・余白あり）
        const scale = Math.min(
          canvas.width / img.naturalWidth,
          canvas.height / img.naturalHeight
        );
        const drawW = img.naturalWidth * scale;
        const drawH = img.naturalHeight * scale;
        const offsetX = (canvas.width - drawW) / 2;
        const offsetY = (canvas.height - drawH) / 2;
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

        // ウォーターマーク（Nano Banana Pro準拠 — 小さめ・くっきり）
        const watermarkText = `Generated by Super FURU AI Character Sheet v${SYSTEM_VERSION}`;
        const fontSize = 14;
        const margin = 8;
        ctx.font = `${fontSize}px 'Segoe UI', 'Arial', sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        // 背景との視認性: 黒テキスト + 軽い白縁取り
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.strokeText(watermarkText, canvas.width - margin, canvas.height - margin);
        ctx.fillStyle = 'rgba(40, 40, 40, 0.9)';
        ctx.fillText(watermarkText, canvas.width - margin, canvas.height - margin);

        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('生成画像の読み込みに失敗しました。'));
      img.src = base64DataUrl;
    });
  };

  // === 画像生成（明示的ボタンのみ） ===
  const handleImageGenerate = async () => {
    if (isImageGenerating || !isUnlocked) return;
    setIsImageGenerating(true);
    setImageError('');
    showStatus('🎨 画像生成中...');
    try {
      const result = await generateImageAI(generatedPrompt, (s) => showStatus(s));
      const rawSrc = `data:${result.mimeType || 'image/png'};base64,${result.base64Img}`;
      // ウォーターマーク焼き込み
      const imgSrc = await applyWatermark(rawSrc);
      if (compareMode && activeSlot === 'B') { setSlotBImage(imgSrc); }
      else { setGeneratedImage(imgSrc); if (compareMode) setSlotAImage(imgSrc); }
      setImageModel(result.usedModel);
      setHistory(prev => [...prev, { image: imgSrc, model: result.usedModel, timestamp: Date.now() }]);
      showStatus(`✅ 画像生成完了 (${result.usedModel})`, true);
    } catch (err) {
      setImageError(err.message);
      showStatus(`❌ ${err.message}`, true);
    } finally { setIsImageGenerating(false); }
  };

  // === 単一フィールドAI生成 ===
  const handleFieldAiGenerate = async (fieldKey, fieldLabel) => {
    if (!isUnlocked) return;
    setFieldGenerating(fieldKey);
    showStatus(`🎲 ${fieldLabel} をAI生成中...`);
    try {
      const value = await generateFieldValueAI(fieldKey, fieldLabel, currentFormData, (s) => showStatus(s));
      updateField(fieldKey, value);
      showStatus(`✅ ${fieldLabel}: ${value}`, true);
    } catch (err) {
      showStatus(`❌ ${fieldLabel}の生成失敗: ${err.message}`, true);
    } finally { setFieldGenerating(null); }
  };

  // === 全項目ランダム（スマート連携付き） ===
  const handleFullRandom = async () => {
    if (!isUnlocked) return;
    setIsGenerating(true);
    showStatus('🎲 全項目ランダム生成中...');
    try {
      const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
      const newData = { ...currentFormData };

    // Step 1: 全選択肢フィールドをランダム化
    SECTIONS.forEach(section => {
      section.fields.forEach(field => {
        if (lockedFields[field.key]) return;
        const opts = OPTIONS[field.key];
        if (opts && opts.length > 0) {
          newData[field.key] = getRandom(opts);
        }
      });
    });

    // Step 2: スマート連携（ランダム性を尊重しつつ矛盾だけ防ぐ）
    const currentSex = newData.sex;
    
    // 連携1: 性別ベースの口調・外見・性格の相関
    if (currentSex === '男性') {
      if (!lockedFields.speechStyle && Math.random() < 0.7) newData.speechStyle = getRandom(['標準的（男性寄り）', '乱暴・荒い', '古風・武家言葉', '寡黙（最小限）', '敬語と暴言の混在']);
      if (!lockedFields.bodyBuild && Math.random() < 0.7) newData.bodyBuild = getRandom(['鍛え上げられたアスリート型', '圧倒的な筋肉質', '標準的・バランス重視', '細身（ガリガリ）']);
      if (!lockedFields.voiceType && Math.random() < 0.8) newData.voiceType = getRandom(['低く渋い', 'ハスキー', '堂々とした']);
    } else if (currentSex === '女性') {
      if (!lockedFields.speechStyle && Math.random() < 0.7) newData.speechStyle = getRandom(['標準的（女性寄り）', '丁寧語', 'お嬢様言葉', '早口']);
      if (!lockedFields.bodyBuild && Math.random() < 0.7) newData.bodyBuild = getRandom(['しなやかなモデル体格', '華奢・小柄', '標準的・バランス重視', '小太り・肉感的']);
      if (!lockedFields.voiceType && Math.random() < 0.8) newData.voiceType = getRandom(['高く透明', '甲高い', '囁くような']);
      if (!lockedFields.facialHair) newData.facialHair = '髭なし';
    } else if (currentSex === '無性' || currentSex === '回答なし') {
      if (!lockedFields.speechStyle && Math.random() < 0.6) newData.speechStyle = getRandom(['中性的', '丁寧語', '寡黙（最小限）']);
      if (!lockedFields.bodyBuild && Math.random() < 0.6) newData.bodyBuild = getRandom(['しなやかなモデル体格', '細身（ガリガリ）', '標準的・バランス重視']);
      if (!lockedFields.voiceType && Math.random() < 0.6) newData.voiceType = getRandom(['高く透明', 'ハスキー', '囁くような', '機械的・無感情']);
      if (!lockedFields.facialHair && Math.random() < 0.8) newData.facialHair = '髭なし';
    }

    // 連携2: 年齢 ↔ 体型（幼児系は小柄な体型に制限）
    if (!lockedFields.bodyBuild && CHILD_AGES.includes(newData.ageGroup)) {
      newData.bodyBuild = getRandom(CHILD_BUILDS);
      newData.muscleType = '筋肉強調なし';
    }

    // 連携3: 世界観 ↔ 衣装・武器・エフェクト
    if (newData.eraStyle === '現代・日常・学園') {
      if (!lockedFields.weapon && Math.random() < 0.8) newData.weapon = '武器なし';
      if (!lockedFields.magicEffect) newData.magicEffect = '魔法効果なし';
      if (!lockedFields.auraColor) newData.auraColor = 'オーラなし';
    } else if (newData.eraStyle === '近未来・サイバーパンク') {
      if (!lockedFields.weapon && Math.random() < 0.6) newData.weapon = getRandom(['自動小銃', 'タクティカルナイフ']);
      if (!lockedFields.glassesStyle && Math.random() < 0.5) newData.glassesStyle = 'サイバーゴーグル';
    }
    if (!lockedFields.costume) {
      const compatibleCostumes = ERA_COSTUME_MAP[newData.eraStyle];
      if (compatibleCostumes) newData.costume = getRandom(compatibleCostumes);
    }

    // 連携4: 種族 ↔ 出身・部位・体格
    if (newData.species === 'エルフ') {
      if (!lockedFields.ethnicity) newData.ethnicity = 'エルフ・幻想種';
      if (!lockedFields.bodyBuild && Math.random() < 0.7) newData.bodyBuild = getRandom(['しなやかなモデル体格', '細身（ガリガリ）']);
    } else if (newData.species === 'ドワーフ') {
      if (!lockedFields.ethnicity) newData.ethnicity = 'ドワーフ・剛健種';
      if (!lockedFields.bodyBuild && Math.random() < 0.7) newData.bodyBuild = getRandom(['鍛え上げられたアスリート型', '圧倒的な筋肉質', '小太り・肉感的']);
    } else if (newData.species === '獣人' || newData.species === 'ケモノ') {
      if (!lockedFields.ethnicity) newData.ethnicity = '獣人・ケモノ種';
      if (!lockedFields.subhumanPart) newData.subhumanPart = '獣の耳と尻尾';
    } else if (newData.species === 'サイボーグ' || newData.species === 'アンドロイド') {
      if (!lockedFields.ethnicity) newData.ethnicity = 'サイバーパンク改造種';
      if (!lockedFields.muscleType && Math.random() < 0.5) newData.muscleType = '硬質な人工筋肉';
      // アンドロイド/サイボーグに有機的な特殊部位（悪魔の翼等）が付かないよう制限
      if (!lockedFields.subhumanPart) newData.subhumanPart = getRandom(['特殊部位なし', '背中の機械アーム', '特殊部位なし']);
    } else if (newData.species === '悪魔・魔族') {
      if (!lockedFields.subhumanPart && Math.random() < 0.7) newData.subhumanPart = getRandom(['悪魔の翼', '側頭部の角', '龍の鱗と尾']);
      if (!lockedFields.auraColor && Math.random() < 0.7) newData.auraColor = getRandom(['不気味な紫煙', '深淵の暗黒']);
    } else {
      // 人間などの汎用種族の場合、エルフやドワーフ等の専用出身を弾く
      if (!lockedFields.ethnicity && ['エルフ・幻想種', 'ドワーフ・剛健種', '獣人・ケモノ種', 'サイバーパンク改造種'].includes(newData.ethnicity)) {
        newData.ethnicity = getRandom(['日本・東アジア系', '欧米・コーカソイド系', 'ラテン・ヒスパニック系', 'アフリカ・黒人系統', '中東・アラブ系', '南アジア・インド系', '北欧・バイキング系', '多国籍・混血']);
      }
    }

    // 連携5: 武器 ↔ アクション傾向
    if (!lockedFields.actionTendency) {
      if (newData.weapon === '日本刀') newData.actionTendency = '剣術・刀技';
      else if (['巨大な大剣', '巨大な斧', 'ナックル'].includes(newData.weapon)) newData.actionTendency = '巨大武器・力任せ';
      else if (newData.weapon === '自動小銃') newData.actionTendency = '銃撃戦・射撃';
      else if (newData.weapon === '魔導杖') newData.actionTendency = '魔法詠唱・術式';
      else if (newData.weapon === '武器なし' && Math.random() < 0.5) newData.actionTendency = '近接格闘・体術';
    }

    // 連携6: 性格 ↔ 表情・目つき
    if (!lockedFields.expressionSet) {
      if (newData.personality === '冷静沈着・冷酷') newData.expressionSet = getRandom(['デフォルト（無表情）', '冷徹な目つき']);
      else if (newData.personality === '熱血・直情的') newData.expressionSet = getRandom(['激怒', '不敵な笑み']);
      else if (newData.personality === '臆病・ヘタレ') newData.expressionSet = getRandom(['恐怖', '悲しみ・涙']);
      else if (newData.personality === '快楽主義・狂気') newData.expressionSet = getRandom(['狂気の笑顔', '不敵な笑み']);
    }
    if (!lockedFields.eyeShape) {
      if (newData.personality === '冷静沈着・冷酷') newData.eyeShape = getRandom(['鋭い三白眼', '冷徹な細目']);
      else if (newData.personality === '慈愛・平和主義') newData.eyeShape = '優しいタレ目';
    }

    // 連携7: 身長と体重の算出（BMIベース・年齢種族連動）
    if (!lockedFields.height || !lockedFields.weight) {
      let minH = 160, maxH = 180;
      if (CHILD_AGES.includes(newData.ageGroup)) {
        if (newData.ageGroup.includes('乳幼児')) { minH = 80; maxH = 100; }
        else if (newData.ageGroup.includes('幼児')) { minH = 100; maxH = 120; }
        else if (newData.ageGroup.includes('児童')) { minH = 120; maxH = 145; }
      } else if (newData.ageGroup.includes('少年') || newData.ageGroup.includes('少女')) {
        minH = 145; maxH = 165;
      } else {
        if (newData.sex === '男性') { minH = 165; maxH = 195; }
        else if (newData.sex === '女性') { minH = 150; maxH = 175; }
        else { minH = 155; maxH = 185; }
      }
      if (newData.species === 'ドワーフ') { minH = 110; maxH = 140; }
      if (newData.species === 'エルフ' || newData.species === '吸血鬼') { minH += 5; maxH += 5; }

      let finalH = 170; // 計算用フォールバック
      if (!lockedFields.height) {
        finalH = Math.floor(Math.random() * (maxH - minH + 1) + minH);
        const snappedH = Math.round(finalH / 5) * 5;
        newData.height = `${snappedH}cm`;
      } else {
        finalH = parseInt(newData.height) || 170;
      }

      if (!lockedFields.weight) {
        const hM = finalH / 100;
        let targetBmi = 22;
        if (newData.bodyBuild.includes('細身') || newData.bodyBuild.includes('華奢')) targetBmi = 18;
        else if (newData.bodyBuild.includes('アスリート')) targetBmi = 24;
        else if (newData.bodyBuild.includes('圧倒的な筋肉質')) targetBmi = 28;
        else if (newData.bodyBuild.includes('小太り')) targetBmi = 26;
        else if (newData.bodyBuild.includes('大柄') || newData.bodyBuild.includes('超巨漢') || newData.bodyBuild.includes('重厚な機械化')) targetBmi = 35;

        const variance = 0.9 + (Math.random() * 0.2); // ±10%のブレ
        const w = Math.round(targetBmi * hM * hM * variance);
        const snappedW = Math.round(w / 5) * 5;
        newData.weight = `${snappedW}kg`;
      }
    }

    // Step 3: AIでテキスト系を生成
    showStatus('🤖 AIが名前・台詞を生成中...');
    const aiResult = await generateGachaTextsAI(newData, (s) => showStatus(s));

    const genderKey = (newData.sex === '男性')
      ? 'male'
      : (newData.sex === '女性')
        ? 'female' : 'neutral';

    if (!lockedFields.name) newData.name = aiResult?.name || getRandom(BACKUP_DATA[`${genderKey}Names`]);
    if (!lockedFields.catchphrase) newData.catchphrase = aiResult?.catchphrase || getRandom(BACKUP_DATA[`${genderKey}Phrases`]);
    if (!lockedFields.dialogue) newData.dialogue = aiResult?.dialogue || getRandom(BACKUP_DATA[`${genderKey}Dialogues`]);
    if (!lockedFields.likes) newData.likes = aiResult?.likes || getRandom(BACKUP_DATA.likes);
    if (!lockedFields.dislikes) newData.dislikes = aiResult?.dislikes || getRandom(BACKUP_DATA.dislikes);
    if (!lockedFields.nickname) newData.nickname = aiResult?.nickname || getRandom(BACKUP_DATA.nicknames);

    if (compareMode && activeSlot === 'B') { setSlotBData(newData); }
    else { setFormData(newData); if (compareMode) setSlotAData(newData); }
      setTextModel(aiResult ? 'AI' : 'バックアップ');
      showStatus('✅ 全項目ランダム完了！「画像生成」ボタンで画像を生成できます。', true);
    } catch (err) {
      showStatus(`❌ 全項目ランダム生成失敗: ${err.message}`, true);
    } finally {
      setIsGenerating(false);
    }
  };

  // === プリセット ===
  const applyPreset = (preset) => {
    const newData = { ...DEFAULT_FORM_DATA, ...preset.data };
    if (compareMode && activeSlot === 'B') { setSlotBData(newData); }
    else { setFormData(newData); if (compareMode) setSlotAData(newData); }
    showStatus(`📦 プリセット「${preset.name}」を適用`, true);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadImage = () => {
    if (!displayImage) return;
    // ウォーターマークは既に焼き込み済み、そのままダウンロード
    const link = document.createElement('a');
    link.href = displayImage;
    link.download = `character_sheet_${Date.now()}.png`;
    link.click();
  };

  // === 履歴 ===
  const loadHistory = (idx) => {
    const item = history[idx];
    if (compareMode && activeSlot === 'B') { setSlotBImage(item.image); }
    else { setGeneratedImage(item.image); if (compareMode) setSlotAImage(item.image); }
    setImageModel(item.model);
  };
  const deleteHistory = (idx) => setHistory(prev => prev.filter((_, i) => i !== idx));
  const clearHistory = () => setHistory([]);

  // === A/B ===
  const switchToSlotA = () => setActiveSlot('A');
  const switchToSlotB = () => { setActiveSlot('B'); if (!slotBData) setSlotBData({ ...formData }); };
  const toggleCompare = () => {
    setCompareMode(prev => {
      if (!prev && !slotBData) setSlotBData({ ...formData });
      return !prev;
    });
  };

  const handleReset = () => {
    setFormData({ ...DEFAULT_FORM_DATA }); setSlotAData(null); setSlotBData(null);
    setSlotAImage(null); setSlotBImage(null); setGeneratedImage(null);
    setImageModel(''); setTextModel(''); setImageError('');
    showStatus('🔄 全リセット完了', true);
  };

  const handleApiSwitch = () => {
    setApiKeyInput('');
    setSelectedEngine(null);
    setApiKeys('', '');
    setActiveEngine('gemini');
    setIsUnlocked(false);
  };

  const displayImage = compareMode
    ? (activeSlot === 'B' ? slotBImage : (slotAImage || generatedImage))
    : generatedImage;

  const isWorking = isGenerating || isImageGenerating || fieldGenerating !== null;

  useEffect(() => {
    let timer;
    if (isWorking) {
      timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(timer);
  }, [isWorking]);

  // === レンダリング ===
  return (
    <div className="app-container">
      {/* APIゲート */}
      {!isUnlocked && (
        <div className="api-gate">
          <div className="api-gate-card">
            <div className="api-gate-icon">⚒️</div>
            <h1 className="api-gate-title">{APP_NAME}</h1>
            <p className="api-gate-sub">V{SYSTEM_VERSION} — AI Character Sheet Maker</p>
            
            <div className="engine-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: 'center' }}>
              <button 
                className={`compare-tab ${selectedEngine === 'gemini' ? 'active-a' : ''}`}
                onClick={() => setSelectedEngine('gemini')}
                style={{ flex: 1 }}
              >
                Gemini Engine
              </button>
              <button 
                className={`compare-tab ${selectedEngine === 'openai' ? 'active-b' : ''}`}
                onClick={() => setSelectedEngine('openai')}
                style={{ flex: 1 }}
              >
                OpenAI Engine
              </button>
            </div>

            <input ref={apiInputRef} type="password" name="character-sheet-runtime-api-key"
              autoComplete="new-password" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              data-lpignore="true" data-1p-ignore="true" data-bwignore="true"
              className="api-gate-input" placeholder="APIキーを入力すると自動判別します"
              value={apiKeyInput} onChange={handleApiKeyChange}
              onKeyDown={(e) => e.key === 'Enter' && handleApiKeySubmit()} />
            
            <button className="api-gate-btn" onClick={handleApiKeySubmit} disabled={!selectedEngine}>
              {selectedEngine ? `🔓 ${selectedEngine === 'gemini' ? 'Gemini' : 'OpenAI'} エンジンで起動` : '🔓 APIキーを入力してください'}
            </button>
            <div className="api-gate-links">
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">🔑 Gemini APIキー取得</a>
              <span className="api-gate-links-sep">|</span>
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">🔑 OpenAI APIキー取得</a>
            </div>
            <p className="api-gate-note">※ APIキーはセッション限定（ブラウザに保存されません）<br/>※ キーはメモリ内のみ保持・ページを閉じると消去・Gemini/OpenAI API呼び出し以外には送信しません</p>
          </div>
        </div>
      )}

      <div className={!isUnlocked ? 'app-locked' : ''}>
          <div className="sticky-top-area">
          {/* ヘッダー */}
          <header className="app-header">
            <div className="header-brand">
              <div className="header-icon">⚒️</div>
              <div>
                <h1 className="header-title">{APP_NAME} <span>V{SYSTEM_VERSION}</span></h1>
                <p className="header-subtitle">AI Character Sheet Maker</p>
              </div>
            </div>
            <div className="header-actions">
              <button className="btn-gacha" onClick={handleFullRandom} disabled={isWorking || !isUnlocked}>
                {isGenerating ? '⏳ 生成中...' : '🎲 全項目ランダム'}
              </button>
              <button className="btn-generate" onClick={handleImageGenerate} disabled={isWorking || !isUnlocked}>
                {isImageGenerating ? '⏳ 画像生成中...' : '🎨 画像生成'}
              </button>
              <button className="btn-icon-only" onClick={handleReset} title="全リセット">↺</button>
              <button className="btn-api-switch" onClick={handleApiSwitch} title="API切替">
                🔄 API切替
              </button>
            </div>
          </header>

          {/* ステータス（生成中は持続表示） */}
          {statusMessage && (
            <div className="inline-status">
              <span>{statusMessage} {isWorking ? `[${elapsedTime}s]` : ''}</span>
              <button onClick={() => setStatusMessage('')}>✕</button>
            </div>
          )}

          {/* ツールバー: プリセット + エンジン表示 */}
          <div className="toolbar-row">
            <div className="preset-bar">
              {PRESETS.map(p => (
                <button key={p.name} className="preset-chip" onClick={() => applyPreset(p)}>
                  {p.icon} {p.name}
                </button>
              ))}
            </div>
            <div className="toolbar-right">
              <span className="engine-badge">
                {getActiveEngine() === 'openai' ? '🤖 ChatGPT' : '✨ Gemini'}
              </span>
            </div>
          </div>
        </div>

        {/* メイングリッド */}
        <div className="main-grid">
          {/* 左側：設定パネル */}
          <div className={`form-panel${isWorking ? ' form-working' : ''}`}>
            <div className="form-panel-header-ctrl" style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
               <button className="btn-section-ctrl" onClick={expandAll} style={{flex: 1}}>📂 全展開</button>
               <button className="btn-section-ctrl" onClick={collapseAll} style={{flex: 1}}>📁 全折りたたみ</button>
            </div>
            {SECTIONS.map(section => (
              <div key={section.id} style={{ marginBottom: '1rem' }}>
                <div className="section-header" data-color={section.color} onClick={() => toggleSection(section.id)}>
                  {section.label}
                  <span className={`section-collapse-icon${collapsedSections[section.id] ? '' : ' open'}`}>▶</span>
                </div>
                {!collapsedSections[section.id] && (
                  <div className="section-fields">
                    {section.fields.map(field => (
                      <FieldInput
                        key={field.key} fieldKey={field.key} label={field.label}
                        value={currentFormData[field.key] || ''} options={OPTIONS[field.key]}
                        type={field.type || 'select'} colorAccent={field.colorAccent}
                        locked={!!lockedFields[field.key]} onChange={updateField}
                        onToggleLock={toggleLock} onAiGenerate={handleFieldAiGenerate}
                        isGenerating={fieldGenerating === field.key}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 右側 */}
          <div className="right-column">
            {/* プロンプト */}
            <div className="prompt-panel">
              <div className="prompt-header">
                <div className="prompt-title-group">
                  <div className="prompt-icon-box">⚡</div>
                  <div>
                    <p className="prompt-title">リアルタイム設計プロンプト</p>
                    <p className="prompt-subtitle">パラメータ変更で即時更新（API呼び出しなし）</p>
                  </div>
                </div>
                <div className="prompt-actions">
                  <button className="btn-copy" onClick={copyPrompt}>{copied ? '✓ コピー済' : '📋 設定テキストをコピー'}</button>
                </div>
              </div>
              <div className="prompt-content"><pre className="prompt-text">{generatedPrompt}</pre></div>
              <div className="status-bar">
                <div className="status-item"><span style={{ color: 'var(--emerald)' }}>●</span> 同期正常</div>
                <div className="status-item"><span style={{ color: 'var(--rose)' }}>●</span> {currentFormData.sex} / {currentFormData.species}</div>
                {textModel && <div className="status-item"><span style={{ color: 'var(--cyan)' }}>●</span> TXT: {textModel}</div>}
                {imageModel && <div className="status-item"><span style={{ color: 'var(--amber)' }}>●</span> IMG: {imageModel}</div>}
              </div>
            </div>

            {/* 画像スクロールエリア */}
            <div className="image-scroll-area">
              {/* 画像パネル */}
              <div className="image-panel">
                <div className="image-panel-header">
                <p className="image-panel-title">🎨 生成結果</p>
                {isImageGenerating && <span className="animate-pulse" style={{ fontSize: '0.7rem', color: 'var(--amber)' }}>◉ 画像鋳造中... ({elapsedTime}s)</span>}
              </div>
              {/* A/B比較タブ（画像パネル直下に配置） */}
              {compareMode && (
                <div className="compare-tabs-container" style={{ margin: '0 0 8px 0' }}>
                  <div className="compare-tabs">
                    <button className={`compare-tab${activeSlot === 'A' ? ' active-a' : ''}`} onClick={switchToSlotA}>
                      🅰️ スロットA{activeSlot === 'A' ? '（表示中）' : ''}
                    </button>
                    <button className={`compare-tab${activeSlot === 'B' ? ' active-b' : ''}`} onClick={switchToSlotB}>
                      🅱️ スロットB{activeSlot === 'B' ? '（表示中）' : ''}
                    </button>
                  </div>
                </div>
              )}
              {compareMode ? (
                <div className="compare-mode">
                  <div className={`compare-slot${activeSlot === 'A' ? ' active' : ''}`} onClick={switchToSlotA}>
                    <span className="compare-slot-label">A</span>
                    <div className="image-result">
                      {(slotAImage || generatedImage) ? <img src={slotAImage || generatedImage} alt="A" /> : <div className="image-placeholder">スロットA</div>}
                    </div>
                  </div>
                  <div className={`compare-slot${activeSlot === 'B' ? ' active' : ''}`} onClick={switchToSlotB}>
                    <span className="compare-slot-label" style={{ background: 'var(--rose)' }}>B</span>
                    <div className="image-result">
                      {slotBImage ? <img src={slotBImage} alt="B" /> : <div className="image-placeholder">スロットB</div>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="image-result">
                  {displayImage ? <img src={displayImage} alt="生成結果" />
                    : imageError ? <div className="image-placeholder" style={{ color: 'var(--rose)' }}>⚠️ {imageError}</div>
                    : <div className="image-placeholder">「🎨 画像生成」ボタンを押すと画像が生成されます</div>}
                </div>
              )}
              <div className="image-actions">
                <button className="btn-download" onClick={downloadImage} disabled={!displayImage}>📥 ダウンロード</button>
                <button className="btn-regen" onClick={handleImageGenerate} disabled={isWorking || !isUnlocked}>🔄 {compareMode ? `スロット${activeSlot} 再生成` : '再生成'}</button>
                <button className={`btn-compare-toggle${compareMode ? ' active' : ''}`} onClick={toggleCompare}>
                  {compareMode ? '🔀 A/B比較 ON' : '🔀 A/B比較'}
                </button>
              </div>
            </div>

            {/* 履歴 */}
            {history.length > 0 && (
              <div className="history-panel">
                <div className="history-header">
                  <p className="history-title">📜 生成履歴 ({history.length})</p>
                  <button className="btn-history-clear" onClick={clearHistory}>🗑️ 全削除</button>
                </div>
                <div className="history-grid">
                  {history.map((item, idx) => (
                    <div key={idx} className="history-thumb-wrap">
                      <div className="history-thumb" onClick={() => loadHistory(idx)}><img src={item.image} alt={`#${idx+1}`} /></div>
                      <button className="history-delete-btn" onClick={() => deleteHistory(idx)}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
        <footer className="app-footer"><p>{APP_NAME} V{SYSTEM_VERSION} © 2026</p></footer>
      </div>
    </div>
  );
};

export default App;
