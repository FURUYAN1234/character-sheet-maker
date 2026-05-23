# HANDOFF (Character Sheet Maker → Codex)

## Snapshot Date
2026-05-23T20:39:00+09:00

## Current Status
- ✅ **v1.2.7** — OpenAIモデル最適化の適用完了（ローカルビルド検証済み）
- ブランチ: `main`
- 未コミット変更: あり（`openai.js`, `App.jsx`, `package.json`, `index.html`, `README.md` の変更）

## Architecture & Key Files
| 用途 | ファイル |
|------|----------|
| メインUI | `src/App.jsx` |
| Gemini APIクライアント | `src/lib/gemini.js` |
| OpenAI APIクライアント | `src/lib/openai.js` |
| 画像生成クライアント | `src/lib/imagen.js` |
| ビルド設定 | `vite.config.js` (base: GH Pages用設定 — 変更禁止) |

## Rule Enforcement (重要)
- 作業開始前に **必ず** `docs/project_standards.md` と `docs/deploy.md` を読むこと。
- デプロイ先: GitHub Pages のみ（HF Spaces は対象外）
- `vite.config.js` の `base` を推測で変更しない

## Done (今回作業)
- **OpenAI テキスト生成モデルの最新化 (提案A)**: `gpt-4.1`系列の新モデルおよびフォールバック順序（`gpt-4.1` -> `gpt-4.1-mini` -> `gpt-4.1-nano` -> `gpt-4o`）を `src/lib/openai.js` に実装。
- **バージョン同期**: 各ファイルのバージョンを `1.2.7` に同期（`package.json`, `src/App.jsx`, `index.html`, `README.md`）。
- **ローカルビルド検証**: `npm run build` にてビルドエラーがないことを確認。

## Remaining Tasks
- コミットとプッシュ（またはユーザー指示によるデプロイの実行）。

## Verification State
- ローカルビルド確認済み。

## Risks
なし

## Notes
- ルートに `extracted_v12_source.jsx`, `release_notes.txt`, `tmp_*.json` 等の一時ファイルが散在。クリーンアップ推奨だが、ユーザー確認なしに削除しないこと。

## Entry Points for Codex
1. `AGENTS.md` → 全体ルール
2. `docs/project_standards.md` → コード規約・禁止事項
3. `docs/deploy.md` → デプロイ手順

## Suggested First Command
```bash
git pull origin main
```

---

## Root App Protection Rule

This workspace root app is an active product app and must not be treated as a scratchpad, disposable shell, or temporary target for unrelated UI experiments.

### Protected Existing App
- `C:\Users\sx717\OneDrive\Documents\Codex_App\character-sheet-maker`

### Protected Files
- `src/App.jsx`
- `src/App.css`
- `src/index.css`
- `src/lib/`
- `public/`
- `README.md`
- `package.json`
- `package-lock.json`
- `vite.config.js`
- `dist/`

### Mandatory Interpretation
- Requests for a separate app, clone-like UI, prototype, experiment, mock, or public-safe rewrite must be implemented in a new subfolder.
- Do not satisfy those requests by replacing the current app.
- If the target app is not explicit, do not edit anything until the target is clarified.

### Build / Deploy Guardrail
- Do not run `npm run build`, `npm run deploy`, or any command that rewrites `dist/` unless the current root app is explicitly the intended target.

### Multi-Agent / Multi-PC Guardrail
- These protection rules apply equally in Codex and Antigravity.
- Opening the correct folder is required but not sufficient; agents must still respect the protected-file and separate-subfolder rules above.

