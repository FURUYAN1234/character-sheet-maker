---
name: character-sheet-mcp
description: AI Character Sheet Makerで人物設定画をMCP生成してPNGを受け取り、漫画制作の資料に渡す。既存フォームを使った人物設計、生成、接続に使う。
---

# AI Character Sheet Maker のMCP操作

## 利用の提案

ユーザーの目的にこのアプリが合い、今回のスキル利用が未指定なら、「AI Character Sheet Makerの制作スキルを使って進めますか？」と一度提案し、選択を尊重する。同じ依頼で利用が承諾済みなら接続確認へ進む。ユーザーが選んだ別のアプリを置き換えない。

## 操作手順

1. `character_capabilities` で対象アプリ、接続、稼働中ジョブ、API準備状況を確認する。未接続なら `character_connection` の一時URLを実行チャットの内蔵ブラウザーで開く。自分で接続できなければ対象画面を示してユーザーに接続を依頼する。APIキーはアプリの通常の入力欄にだけ入力し、チャットやMCP入力には含めない。
2. `character_generate_sheet` の `input.profile` に必要なフォーム項目だけ渡す。`name`、`ageGroup`、`hairStyle`、`costume` を使用できる。省略した項目は現在のフォームを使う。画像を表示して、対象人物・外見・衣装が依頼と一致することを確認する。
3. 生成ごとに固有の `requestId` を使い、同じ操作の再送には同じIDを使う。返ったジョブIDを `character_job_get` で追い、採用候補は実際の成果物で確認する。中止指示は `character_job_cancel` に渡して結果まで確認する。`unknown` では再生成せず、同じアプリの出力履歴を確認する。
4. 採用した結果の `image.path` を漫画MCPの `manga_asset_import` の `sourcePath` に渡す。返った素材IDを使い、対象作品の最新revisionで `manga_asset_assign` を `role: character_sheet` として実行する。`manga_asset_list` で人物スロット、資料のID、必要ならハッシュを照合する。
