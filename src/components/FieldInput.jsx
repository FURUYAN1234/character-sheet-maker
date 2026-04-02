// 3モード入力コンポーネント（選択 / 自由入力 / AI生成）+ ロック + クリアボタン
// Story Maker準拠: AI生成結果は手入力欄に表示され、ユーザーが編集可能
import React, { useState } from 'react';

const FieldInput = ({
  fieldKey, label, value, options, type = 'select',
  colorAccent, locked, onChange, onToggleLock, onAiGenerate, isGenerating
}) => {
  const hasOptions = options && options.length > 0;
  // テキスト系 or オプションなし → デフォルトはテキストモード
  const defaultMode = (type === 'text' || type === 'textarea' || !hasOptions) ? 'text' : 'select';
  const [mode, setMode] = useState(defaultMode);

  const handleChange = (e) => {
    if (!locked) onChange(fieldKey, e.target.value);
  };

  // クリアボタン（×）— Story Maker準拠
  const handleClear = () => {
    if (!locked) onChange(fieldKey, '');
  };

  // AI生成ボタン押下 → AI実行 → 結果が手入力欄に入る → modeをtextに切替
  const handleAiClick = async () => {
    if (locked || isGenerating) return;
    // AI生成を実行（親から結果がvalueに反映される）
    await onAiGenerate(fieldKey, label);
    // 結果をテキストモードで表示（ユーザーが編集可能）
    setMode('text');
  };

  const labelClass = `field-label${colorAccent ? ` accent-${colorAccent}` : ''}`;

  return (
    <div className="field-container">
      <div className="field-label-row">
        <span className={labelClass}>{label}</span>
        <div className="field-controls">
          {/* モード切替ボタン */}
          {hasOptions && (
            <button
              className={`field-mode-btn${mode === 'select' ? ' active' : ''}`}
              onClick={() => setMode('select')}
              title="選択モード"
            >📋</button>
          )}
          <button
            className={`field-mode-btn${mode === 'text' ? ' active' : ''}`}
            onClick={() => setMode('text')}
            title="自由入力モード"
          >✏️</button>
          <button
            className={`field-mode-btn${mode === 'ai' ? ' active' : ''}`}
            onClick={handleAiClick}
            disabled={isGenerating || locked}
            title="AI自動生成（結果は入力欄に表示）"
            style={isGenerating ? { opacity: 0.5 } : {}}
          >{isGenerating ? '⏳' : '🎲'}</button>
          {/* ロックボタン */}
          <button
            className={`field-lock-btn${locked ? ' locked' : ''}`}
            onClick={() => onToggleLock(fieldKey)}
            title={locked ? 'ロック解除' : 'ランダム時にロック'}
          >{locked ? '🔒' : '🔓'}</button>
        </div>
      </div>

      {/* 選択モード */}
      {mode === 'select' && hasOptions && (
        <select
          value={value}
          onChange={handleChange}
          disabled={locked}
          style={locked ? { opacity: 0.5 } : {}}
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )}

      {/* テキスト入力モード（AI生成結果もここに表示） */}
      {(mode === 'text' || mode === 'ai') && type !== 'textarea' && (
        <div className="field-text-wrap">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            disabled={locked}
            placeholder={`${label}を入力...`}
            style={locked ? { opacity: 0.5 } : {}}
          />
          {value && !locked && (
            <button className="field-clear-btn" onClick={handleClear} title="クリア">✕</button>
          )}
        </div>
      )}

      {/* テキストエリア入力 */}
      {(mode === 'text' || mode === 'ai') && type === 'textarea' && (
        <div className="field-text-wrap">
          <textarea
            value={value}
            onChange={handleChange}
            disabled={locked}
            rows={3}
            placeholder={`${label}を入力...`}
            style={locked ? { opacity: 0.5 } : {}}
          />
          {value && !locked && (
            <button className="field-clear-btn field-clear-btn-area" onClick={handleClear} title="クリア">✕</button>
          )}
        </div>
      )}
    </div>
  );
};

export default FieldInput;
