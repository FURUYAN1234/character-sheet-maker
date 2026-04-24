# HANDOFF (Character Sheet Maker → Codex)

## Snapshot Date
2026-04-24T10:27:00+09:00

## Current Status
- ✅ **v1.1.3** — 安定稼働中（GitHub Pages デプロイ済み）
- ブランチ: `main`
- 未コミット変更: なし（Working tree clean）
- 直近5コミット:
  - `0fb0959` Update README.md
  - `5d79bf3` Update README to reflect AI tool enhancements
  - `0829b4b` Update README.md
  - `965f517` Update README to reflect new system version
  - `ee86204` Update README for Nano Banana 2 integration

## Architecture & Key Files
| 用途 | ファイル |
|------|----------|
| メインUI | `src/App.jsx` |
| Gemini APIクライアント | `src/` 配下の該当ファイル |
| ビルド設定 | `vite.config.js` (base: GH Pages用設定 — 変更禁止) |

## Rule Enforcement (重要)
- 作業開始前に **必ず** `docs/project_standards.md` と `docs/deploy.md` を読むこと。
- デプロイ先: GitHub Pages のみ（HF Spaces は対象外）
- `vite.config.js` の `base` を推測で変更しない

## Done (前回作業)
- `AGENTS.md`, `docs/project_standards.md`, `docs/deploy.md` の整備完了
- README の AI ツール強化反映

## Remaining Tasks
- 特になし（ユーザーからの新たな指示を待機中）

## Verification State
- GitHub Pages デプロイ済み (v1.1.3)

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
