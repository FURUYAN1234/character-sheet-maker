// AIキャラクターシートメーカー V1.0 — メインアプリ
// 完全独立アプリ。他アプリとは混ぜない。
import React, { useState, useMemo, useCallback, useRef } from 'react';
import './App.css';
import { OPTIONS, DEFAULT_FORM_DATA, BACKUP_DATA, SECTIONS, PRESETS } from './lib/options';
import { buildPrompt } from './lib/prompt';
import { setApiKey, getApiKey, generateFieldValue, generateGachaTexts } from './lib/gemini';
import { generateImage } from './lib/imagen';
import FieldInput from './components/FieldInput';

const SYSTEM_VERSION = "1.0.10";
const APP_NAME = "AIキャラクターシートメーカー";

// === スマート連携テーブル ===
// 性別 → 髭: 女性系は髭なし
const FEMALE_GENDERS = ['女性', '少女', '老女', 'ケモノ（メス）'];
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
  const [isUnlocked, setIsUnlocked] = useState(false);

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
    if (key.length > 10) { setApiKey(key); setIsUnlocked(true); }
  };

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
    return new Promise((resolve) => {
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

        // 元画像をアスペクト比を維持して中央にフィット
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
      const result = await generateImage(generatedPrompt, (s) => showStatus(s));
      const rawSrc = `data:image/png;base64,${result.base64Img}`;
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
      const value = await generateFieldValue(fieldKey, fieldLabel, currentFormData, (s) => showStatus(s));
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
    // 連携1: 性別 ↔ 髭（女性系は髭なし）
    if (!lockedFields.facialHair && FEMALE_GENDERS.includes(newData.gender)) {
      newData.facialHair = '髭なし';
    }
    // 連携2: 年齢 ↔ 体型（幼児系は小柄な体型に制限）
    if (!lockedFields.bodyBuild && CHILD_AGES.includes(newData.ageGroup)) {
      newData.bodyBuild = getRandom(CHILD_BUILDS);
      newData.muscleType = '筋肉強調なし';
    }
    // 連携3: 世界観 ↔ 衣装（同系統から選出）
    if (!lockedFields.costume) {
      const compatibleCostumes = ERA_COSTUME_MAP[newData.eraStyle];
      if (compatibleCostumes) {
        newData.costume = getRandom(compatibleCostumes);
      }
    }

    // Step 3: AIでテキスト系を生成
    showStatus('🤖 AIが名前・台詞を生成中...');
    const aiResult = await generateGachaTexts(newData, (s) => showStatus(s));

    const genderKey = (newData.gender.includes('男') || newData.gender.includes('オス') || newData.gender.includes('巨漢'))
      ? 'maleNames'
      : (newData.gender.includes('女') || newData.gender.includes('少女') || newData.gender.includes('老女') || newData.gender.includes('メス'))
        ? 'femaleNames' : 'neutralNames';

    if (!lockedFields.name) newData.name = aiResult?.name || getRandom(BACKUP_DATA[genderKey]);
    if (!lockedFields.catchphrase) newData.catchphrase = aiResult?.catchphrase || getRandom(BACKUP_DATA.phrases);
    if (!lockedFields.dialogue) newData.dialogue = aiResult?.dialogue || getRandom(BACKUP_DATA.dialogues);
    if (!lockedFields.likes) newData.likes = aiResult?.likes || getRandom(BACKUP_DATA.likes);
    if (!lockedFields.dislikes) newData.dislikes = aiResult?.dislikes || getRandom(BACKUP_DATA.dislikes);
    if (!lockedFields.nickname) newData.nickname = aiResult?.nickname || getRandom(BACKUP_DATA.nicknames);

    if (compareMode && activeSlot === 'B') { setSlotBData(newData); }
    else { setFormData(newData); if (compareMode) setSlotAData(newData); }
    setTextModel(aiResult ? 'AI' : 'バックアップ');
    showStatus('✅ 全項目ランダム完了！「画像生成」ボタンで画像を生成できます。', true);
    setIsGenerating(false);
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

  const displayImage = compareMode
    ? (activeSlot === 'B' ? slotBImage : (slotAImage || generatedImage))
    : generatedImage;

  const isWorking = isGenerating || isImageGenerating || fieldGenerating !== null;

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
            <input type="password" className="api-gate-input" placeholder="Gemini API キーを入力..."
              value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApiKeySubmit()} />
            <button className="api-gate-btn" onClick={handleApiKeySubmit}>🔓 起動する</button>
            <p className="api-gate-note">※ APIキーはセッション限定（ブラウザに保存されません）<br/>Google AI Studio: ai.google.dev から取得</p>
          </div>
        </div>
      )}

      <div className={!isUnlocked ? 'app-locked' : ''}>
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
          </div>
        </header>

        {/* ステータス（生成中は持続表示） */}
        {statusMessage && (
          <div className="inline-status">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage('')}>✕</button>
          </div>
        )}

        {/* ツールバー: プリセット + A/B比較トグル + 全展開/折りたたみ */}
        <div className="toolbar-row">
          <div className="preset-bar">
            {PRESETS.map(p => (
              <button key={p.name} className="preset-chip" onClick={() => applyPreset(p)}>
                {p.icon} {p.name}
              </button>
            ))}
          </div>
          <div className="toolbar-right"></div>
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
                <button className="btn-copy" onClick={copyPrompt}>{copied ? '✓ コピー済' : '📋 コピー'}</button>
              </div>
              <div className="prompt-content"><pre className="prompt-text">{generatedPrompt}</pre></div>
              <div className="status-bar">
                <div className="status-item"><span style={{ color: 'var(--emerald)' }}>●</span> 同期正常</div>
                <div className="status-item"><span style={{ color: 'var(--rose)' }}>●</span> {currentFormData.gender}</div>
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
                {isImageGenerating && <span className="animate-pulse" style={{ fontSize: '0.7rem', color: 'var(--amber)' }}>◉ 画像鋳造中...</span>}
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
