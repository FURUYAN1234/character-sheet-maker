# AIキャラクターシートメーカー / AI Character Sheet Maker

**V1.0.0 Alpha** — Gemini API を使ったAIキャラクターシート自動生成ツール

> **Nano Banana Pro 連携対応** — 生成されたキャラクターシートをNano Banana ProのOCRで読み取り、マンガ制作の幅を広げることができます。

---

## 🚀 クイックスタート / Quick Start

### Windows（推奨）
1. [Releases](https://github.com/FURUYAN1234/character-sheet-maker/releases) から最新版Zipをダウンロード
2. 解凍して `start_app.bat` をダブルクリック
3. ブラウザが自動で開きます

### 手動起動
```bash
npm install
npm run dev
```

### 必要環境
- **Node.js** 18以上
- **Gemini API キー** ([Google AI Studio](https://ai.google.dev) から取得)

---

## 🔑 APIキーについて / About API Key

- APIキーは**セッション限定**（メモリ内保持のみ）
- **ブラウザには保存されません**（localStorage不使用）
- ページをリロードするとAPIキーの再入力が必要です

---

## 🎨 主な機能 / Features

### キャラクター設計
- **10カテゴリ・45以上のパラメータ**を設定可能
- **3モード入力**: 選択（プルダウン） / 自由入力 / AI自動生成
- **パラメータロック**: ランダム生成時に特定項目を固定
- **プリセットテンプレート**: 6種の即座に使えるキャラクター設定

### スマート連携
- **性別 ↔ 髭**: 女性系キャラクターは自動で「髭なし」
- **年齢 ↔ 体型**: 幼児系は小柄な体型に制限
- **世界観 ↔ 衣装**: 世界観に適合する衣装から選出

### 18種の画風
画風パラメータが**生成結果に劇的に反映**されます：

| 画風 | スタイル |
|:--|:--|
| 青年漫画 | 写実・硬派・重厚な陰影 |
| 少年漫画 | アクションライン・大胆な構図 |
| 少女漫画 | 花・輝き・繊細な線画 |
| 劇画 | 極端なコントラスト・木版画風 |
| アメコミ | ハーフトーン・超人的人体 |
| ピクセルアート | 8bit・限定カラーパレット |
| 浮世絵風 | 木版画・平面的な色彩 |
| 油彩風 | インパスト・厚塗り |
| ...他10種 | |

### Nano Banana Pro 連携
キャラクターシートに**OCR読み取り用の追加情報**を埋め込みます：
- **得意アクション** — 戦闘スタイル
- **感情レンジ** — 表情の振り幅
- **演出傾向** — マンガのコマ割りに影響
- **変身・覚醒** — 変身要素の有無

### その他の機能
- **A/B比較モード** — 2つの設定を同時に比較
- **リアルタイムプロンプト表示** — パラメータ変更で即座に更新
- **生成履歴** — セッション中の生成結果を保存・削除
- **画像ダウンロード** — PNG形式で保存

---

## 🔧 技術スタック / Tech Stack

- **フレームワーク**: Vite + React
- **CSS**: Vanilla CSS（Tailwind不使用）
- **AI**: Google Gemini API（テキスト + 画像生成）
- **API管理**: Zenith Protocol（自動フォールバック）

### Zenith Protocol（AIモデル自動切替）
APIエラー時に自動的に別モデルへフォールバック：

**テキスト生成**:
1. gemini-2.5-flash-preview → 2. gemini-2.0-flash → 3. gemini-1.5-flash → ...

**画像生成**:
1. gemini-2.0-flash-exp（マルチモーダル） → 2. imagen-3.0-generate-002 → ...

---

## 📁 ディレクトリ構造

```
character_sheet/
├── index.html           # エントリーHTML
├── start_app.bat        # Windows起動バッチ
├── package.json         # 依存関係
├── vite.config.js       # Vite設定
├── src/
│   ├── main.jsx         # Reactエントリー
│   ├── App.jsx          # メインアプリ
│   ├── App.css          # コンポーネントCSS
│   ├── index.css        # グローバルCSS
│   ├── components/
│   │   ├── FieldInput.jsx   # 3モード入力コンポーネント
│   │   └── NeuralForge.jsx  # AI思考表示
│   └── lib/
│       ├── gemini.js    # テキスト生成（Zenith Protocol）
│       ├── imagen.js    # 画像生成（Zenith Protocol）
│       ├── options.js   # 全選択肢・初期値・プリセット
│       └── prompt.js    # プロンプト構築ロジック
└── scripts/
    ├── update_version.js          # バージョン自動更新
    └── generate_release_text.js   # リリースノート生成
```

---

## 📋 バージョン履歴 / Changelog

### V1.0.0 Alpha (2026-04-02)
- 🆕 初回リリース
- 10カテゴリ・45以上のパラメータ設定
- 18種の画風（固有スタイルキーワード付き）
- 3モード入力（選択/自由入力/AI生成）
- スマート連携（性別↔髭、年齢↔体型、世界観↔衣装）
- Nano Banana Pro OCR連携フィールド
- A/B比較モード
- Zenith Protocol（AIモデル自動フォールバック）
- セッション限定APIキー管理

---

## ⚠️ 注意事項 / Notes

- このツールはGemini APIキーが必要です（無料枠あり）
- 生成される画像のクオリティはAPIのモデルバージョンに依存します
- **Nano Banana Pro** とは独立したアプリケーションです（コードベースは分離）

---

## 📜 ライセンス / License

MIT License © 2026
