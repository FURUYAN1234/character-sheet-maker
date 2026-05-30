# Deploy Rules & Full Protocol: character-sheet-maker

CodexおよびAntigravityがデプロイ作業を行う際の完全な手順書（フルプロトコル）です。

## 1. Deploy Targets & Environment
- **Deploy Target**: GitHub Pages (gh-pages)
- **Protected Settings**: `vite.config.js` の `base` は GitHub Pages 用です。推測で触らないこと。
- **Not Applicable**: Hugging Face Spaces, Vercel, Netlify

## 2. Version Bump Targets (バージョン更新対象ファイル)
以下のファイルのバージョン番号 (`vX.Y.Z`) を全て一致させること。
1. `package.json` (`"version": "X.Y.Z"`)
2. `src/App.jsx` (`const SYSTEM_VERSION = "X.Y.Z"`)
3. `index.html` (`<title>` タグ内のバージョン)
4. `README.md` (バッジ表記やChangeLog等)

## 3. Pre-Deploy Audit (監査ルール)
デプロイ前に以下のチェックを必ず行うこと。
- **ゴミファイル**: `.py` 等の一時検証スクリプト、テンプレートの残骸が存在しないか。
- **個人情報/ローカルパス**: `C:\Users\...` などのパス、個人名、メールアドレスが含まれていないか。
- **公開禁止の固有名詞 (NG Words)**: 他プロジェクト名（`Nano Banana Pro`, `remotion_video_2` 等）が混入していないか。
- **機密情報**: APIキー（Gemini/OpenAI/HF等）がソースコードに直書きされていないか。

## 4. Build & Deploy Commands
```bash
npm run build
npm run deploy
```
※ `npm run deploy` 実行後、リモートの `gh-pages` ブランチに反映されるまで1〜2分待機すること。

## 5. Post-Deploy Verification (デプロイ後の確認)
- リモート反映確認コマンド: `git fetch origin gh-pages && git show origin/gh-pages:index.html`
- ライブ確認URL: `https://sx7170c.github.io/character_sheet/?v=TIMESTAMP` (ブラウザキャッシュ回避用パラメータを付与して確認)

## 6. Commit, Tag & Push Rules
- コミットメッセージ: `vX.Y.Z: 変更概要`
- タグ名ルール: `vX.Y.Z` (例: `v1.3.6`)
- タグ作成コマンド: `git tag -a vX.Y.Z -m "vX.Y.Z: 変更概要 / Feature summary"` (日本語と英語の併記)
- プッシュ: `git push origin main` および `git push origin vX.Y.Z`

## 7. GitHub Release (リリース作成)
※ Codex側で `gh auth status` が invalid の場合は、このステップをスキップし、Antigravityに引き継ぐこと。
- タイトルテンプレート: `vX.Y.Z: Feature Name / 機能名`
- 本文テンプレート: 
  ```markdown
  ## What's New / 更新内容
  - (Eng) Detail 1 / (Jpn) 詳細1
  - (Eng) Detail 2 / (Jpn) 詳細2
  ```
- コマンド: `gh release create vX.Y.Z --title "タイトル" --notes "本文"`

## 8. ZIP Extraction (バックアップ展開先ルール)
※ GitHub Release が作成された場合のみ実行。
- ダウンロード: `gh release download vX.Y.Z --archive zip --output $env:TEMP\character_sheet-vX.Y.Z.zip`
- 展開先 (命名規則): `C:\character_sheet-main` (既存フォルダがあれば削除して置き換え)

## 9. Full Workspace Backup (全体バックアップ手順)
※ 個別アプリのデプロイごとではなく、ワークスペース全体のバックアップが必要な場合。
- 実行コマンド: `powershell -ExecutionPolicy Bypass -File C:\Users\sx717\Antigravity\scripts\backup_full.ps1`
- または、提供されている `backup_launch.bat` を起動すること。

## 10. Rollback Procedure (失敗時の復旧手順)
- GitHub Pages の Actions が止まった/反映されない場合: 空コミットでビルドを再トリガーする。
  `git commit --allow-empty -m "Trigger Build"`
- 緊急時のみ（distの完全再構築）: `gh-pages` をローカルで削除・再生成して force push。通常は行わないこと。
