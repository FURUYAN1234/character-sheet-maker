# Deploy Rules: character_sheet

共通手順の正本は `C:\Users\sx717\Antigravity\docs\unified_release_completion.md`、契約は `scripts\release-apps.json` の `character_sheet`、実行入口は `scripts\publish_app_release.ps1` である。

- GitHub Pages、GitHub Release、GitHub source ZIP由来の `C:\character_sheet-main`、最終公開検証を共通レシートで完遂する。
- Hugging Faceは対象外。
- 共通preflightとfresh production buildを必須とする。追加のapp validationが必要になった場合は専用transactionを作らず、契約の `validationCommands` に追加する。
- フルバックアップは別の明示操作であり、自動開始しない。

```powershell
powershell -ExecutionPolicy Bypass -File ..\scripts\publish_app_release.ps1 -App character_sheet -NotesPath <absolute-vX.Y.Z.md> -ReleaseTitle "Character Sheet Maker vX.Y.Z"
```
