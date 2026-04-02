// Neural Forge — AI思考中オーバーレイ表示
import React from 'react';

/**
 * @param {boolean} visible 表示フラグ
 * @param {string[]} logs ログメッセージ配列
 * @param {number} progress 進捗（0-100、-1で不定）
 * @param {string} currentModel 使用中モデル名
 * @param {string} phase 現在のフェーズ（text / image）
 */
const NeuralForge = ({ visible, logs = [], progress = -1, currentModel = '', phase = 'text' }) => {
  if (!visible) return null;

  const phaseLabel = phase === 'image' ? '画像鋳造中' : 'テキスト生成中';
  const phaseIcon = phase === 'image' ? '🎨' : '⚡';
  const progressWidth = progress < 0 ? '60%' : `${progress}%`;

  return (
    <div className="neural-forge-overlay">
      <div className="neural-forge-card">
        <div className="neural-forge-header">
          <div className="neural-forge-indicator" />
          <span className="neural-forge-title">{phaseIcon} NEURAL FORGE ACTIVE</span>
        </div>

        <div className="neural-forge-progress">
          <div
            className="neural-forge-progress-bar"
            style={{ width: progressWidth }}
          />
        </div>

        <div className="neural-forge-log">
          {logs.map((log, i) => (
            <div key={i} className="neural-forge-log-line">{log}</div>
          ))}
          {logs.length === 0 && (
            <div className="neural-forge-log-line animate-pulse">
              &gt; {phaseLabel}...
            </div>
          )}
        </div>

        <div className="neural-forge-model">
          <span>◉ {phaseLabel}</span>
          {currentModel && (
            <span style={{ color: 'var(--indigo-light)', marginLeft: 'auto' }}>
              Model: {currentModel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NeuralForge;
