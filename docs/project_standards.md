# PROJECT RULES: character-sheet-maker

## Project Overview
キャラクター設定やシートをAI（Gemini等）を用いて補助・生成・管理するツール。

## Architecture Guardrails (絶対防衛ライン)
AI（Codex等）の過剰な最適化によるシステム破壊を絶対に防ぐこと。以下のロジックは、冗長・特殊・長すぎるように見えても、推測で削除・短縮・単純化してはいけない。

### 1. API特有のエラーハンドリング
- Gemini API 等の `429 Too Many Requests` 回避や、意図的な `wait loop`, `retry` 処理を勝手に削らないこと。

### 2. プロンプトの物理強制力
- AI出力のブレ（不要なマークダウン装飾、JSONフォーマット崩れ）を防ぐための強固なプロンプト制約を指定している場合、削らないこと。

## Forbidden Files / Settings (変更禁止)
- バージョン情報等（`APP_VERSION`）は `package.json` と連動させておく。
- API Key などの機密情報をフロントエンドコードにハードコードしないこと。
