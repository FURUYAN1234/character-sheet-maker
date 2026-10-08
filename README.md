# AI Character Sheet Maker / AIキャラクターシートメーカー

> **Source code available; free to use.** Ordinary use, free integration and free provision require no application, prior contact or permission from FURU. You may sell and monetize your own works. External API costs and third-party terms are separate. See Terms & Output Rights below. / **ソースコード公開・利用無料。** 通常利用と無料の組み込み・無料提供に、申請・事前連絡・FURUの許可は不要です。自分の作品は販売・収益化できます。外部API料金と第三者の条件は別です。詳しくは「利用条件・作品の権利」をご確認ください。


![Version](https://img.shields.io/badge/version-1.5.0-4f46e5)
![Framework](https://img.shields.io/badge/framework-React%2019%20%2F%20Vite%206-646cff)
![AI](https://img.shields.io/badge/AI-Gemini%20%2F%20OpenAI-f97316)
![Output](https://img.shields.io/badge/output-1120x1584%20PNG-10b981)

> **A visible-parameter character design tool for manga, story, and AI image workflows.**
> **漫画・物語・AI画像生成のために、キャラクター設計を見えるパラメータへ分解する制作支援ツールです。**
> 
 [!['ChatGPT Image 2026年6月25日 22_19_30'](https://github.com/user-attachments/assets/d850ac7f-aa1c-40cc-a378-b8c6673c726c)](https://youtu.be/pqYVxUUg0Cs?si=27g1I3tO2EuZkOuxJ)

AI Character Sheet Maker creates structured character reference sheets from dozens of editable design axes instead of relying on a single free-form prompt. It is designed to feed downstream systems such as **Super FURU AI 4-koma System**, Story Maker, and manual ChatGPT / Gemini image workflows.

AIキャラクターシートメーカーは、自由入力プロンプトだけに頼らず、多数の編集可能な設計軸からキャラクター参照シートを作るツールです。**Super FURU AI 4-koma System**、Story Maker、ChatGPT / Gemini の画像生成ワークフローへ渡しやすい、構造化されたキャラクター資料を作ることを目的にしています。

> **Demo / 公開版**
> [https://furuyan1234.github.io/character-sheet-maker/](https://furuyan1234.github.io/character-sheet-maker/)

---

## Current Release Line / 現行仕様

The current public line is **v1.5.0**. This version is a browser-based React/Vite app with session-only API keys, dual Gemini/OpenAI routing, A/B comparison, parameter locks, deterministic Japanese profile typesetting for form-driven sheets, automatically named prompt-file downloads, exact `1120x1584` output, and provenance watermarking. It also embeds versioned design JSON in generated PNGs so the exact prompt can be restored later.

現行公開系統は **v1.5.0** です。ブラウザ上で動作する React/Vite アプリで、セッション限定APIキー、Gemini/OpenAIの切り替え、A/B比較、項目ロック、フォーム生成時の日本語プロフィール決定的文字合成、自動命名されるプロンプトファイルの直接ダウンロード、1120x1584の固定出力、来歴ウォーターマークを備えています。生成PNGにはバージョン付き設計JSONも埋め込み、後から正確なプロンプトを復元できます。

| Area / 領域 | Current behavior / 現行挙動 |
|---|---|
| App version / バージョン | `1.5.0`, displayed in the API gate, header, footer, and watermark. |
| API key handling / APIキー | Memory-only. Keys are not written to localStorage, source files, or output images. |
| Gemini text / Geminiテキスト | `gemini-3.5-flash` -> `gemini-2.5-flash` -> `gemini-2.5-pro` -> `gemini-flash-latest` -> `gemini-pro-latest` |
| Gemini image / Gemini画像 | `gemini-nano-banana-2.1` |
| OpenAI text / OpenAIテキスト | 全11モデルから選択（既定 `gpt-6.1-sol`、選択から下位のみ） |
| OpenAI image / OpenAI画像 | `gpt-image-2.5-sunburst` (`xhigh`) -> `gpt-image-2` (`high`) |
| Output canvas / 出力キャンバス | The final PNG is exactly `1120x1584` (`70:99`, the same ratio as A4). The complete provider artwork is fitted below the Japanese profile header without cropping. |
| Image import / 画像読み込み | Generated PNGs contain `furu.character_sheet` schema v1 JSON for exact prompt restoration. PNG and JPG/JPEG images can be dropped or selected; images without this metadata use AI prompt inference. |
| Local port / ローカルポート | `http://127.0.0.1:5176/` with Vite `strictPort: true`. |

---

## Core Concept / 基本コンセプト

Most AI character generation failures come from vague prompts: the same adjectives are reused, anatomy changes from image to image, and the resulting character is hard to carry into manga panels or story scenes. This app turns character design into a visible control surface.

AIキャラクター生成で起きる失敗の多くは、曖昧なプロンプトから始まります。同じ形容詞が何度も使われ、身体・衣装・口調・役割が画像ごとに揺れ、漫画や物語へ持ち込めないキャラクターになります。このアプリは、キャラクター設計を見える操作面へ変換します。

The user edits concrete axes such as body build, face type, costume, role, voice image, action tendency, emotion range, transformation state, and manga-direction metadata. The app then assembles those axes into a provider-specific prompt and renders a normalized character sheet.

ユーザーは、体型、顔立ち、衣装、役割、声質イメージ、得意アクション、感情レンジ、覚醒状態、漫画演出連携情報などを具体的に編集します。アプリはそれらの軸をプロバイダー向けプロンプトへ組み立て、正規化されたキャラクターシートとして出力します。

---

## Workflow / 操作フロー

1. **Select provider / プロバイダー選択**
   Choose Gemini or OpenAI in the API gate and enter the matching API key.

2. **Design the character / キャラクター設計**
   Edit dropdowns, text fields, and textarea fields across the visible sections.

3. **Lock important axes / 重要項目をロック**
   Lock fields that must not change during randomization or AI text generation.

4. **Use presets or full random / プリセット・全体ランダム**
   Apply one of the representative-character presets or run the gacha-style randomizer. Smart linkage keeps combinations coherent. Use **キャラ固定** to preserve the character's identity, then use the same single preset row as appearance themes; **固定解除** returns those buttons to full-character presets.

5. **Generate text details / テキスト詳細生成**
   Let the selected LLM propose names, catchphrases, dialogue, likes, dislikes, nicknames, and similar textual details when needed.

6. **Generate the sheet / シート生成**
   Send the provider-specific prompt to Gemini or OpenAI image generation.

7. **Typeset, normalize, and compare / 文字合成・正規化・比較**
   The app adds the exact profile fields in a Japanese header, fits the complete provider artwork below it without cropping, and applies the version watermark. The final PNG is always 1120x1584 (70:99, the same ratio as A4). A/B mode allows two slots to be compared side by side.

8. **Download or reuse / 保存・再利用**
   Download the current prompt with its automatic character-based filename, download PNG output, or load previous image session thumbnails for comparison. Generated PNGs retain the exact prompt as versioned design data; drop one onto the result region to display that image and restore its prompt without image analysis.

---

## Feature Map / 機能マップ

### 1. API Gate / APIゲート

The app starts locked until the user selects Gemini or OpenAI and enters an API key. The key stays only in memory for the current browser session.

アプリはAPIキー入力前にはロック状態です。Gemini または OpenAI を選び、対応するキーを入力してから制作画面へ進みます。キーは現在のブラウザセッション内のメモリにのみ保持されます。

* Gemini key acquisition link: Google AI Studio.
* OpenAI key acquisition link: OpenAI Platform.
* API switch button returns to the gate without persisting the previous key.
* Reloading the page requires entering the key again.

### 2. Visible Character Axes / 見えるキャラクター設計軸

The current UI organizes fields into nine main sections:

現在のUIは、以下の9セクションに項目を整理しています。

| Section / セクション | Main fields / 主な項目 |
|---|---|
| 1. 生体・身体・精神プロファイル | name, sex, species, age, height, weight, body build, personality, likes, dislikes, catchphrase, dialogue |
| 2. 顔・頭部・メイク詳細 | face type, eye shape, eye color, makeup, hair style, hair color, facial hair, skin type |
| 3. 装飾品・紋様・特殊部位 | glasses, head accessory, earrings, neck accessory, piercings, body art, wings, horns, tail, mechanical arms |
| 4. 衣装・装備・エフェクト | world era, costume, material, outfit condition, fit, weapon, sub weapon, magic effect, aura |
| 5. 画風・レンダリング・陰影 | art style, layout, rendering mode, screentone, pen style, lighting, shadow, color theme |
| 6. ポーズ・表現 | base pose, expression, gaze direction, hand expression |
| 7. ロール・演技設定 | archetype, nickname, organization, voice type, speech style |
| 8. マンガ演出連携 | action tendency, emotion range, direction style, awakening / transformation |
| 9. 自由記述 | free-form extra detail for anything the fixed controls cannot express |

This structure is intentionally dense. The goal is to make character continuity easier to inspect before an image is generated, not to hide design decisions inside a single paragraph.

この構造は意図的に細かくしています。目的は、画像生成前にキャラクターの一貫性を見て確認できるようにすることであり、設計判断を1つの長文プロンプトの中へ隠すことではありません。

### 3. Parameter Locks / パラメータロック

Each editable field can be locked. Locked fields are preserved when the user runs random generation or asks the AI to fill missing text fields.

各編集項目はロックできます。ロックした項目は、全体ランダムやAIによるテキスト補完を実行しても保持されます。

This is especially useful for:

* Keeping a fixed sex/species/age while exploring costume or pose.
* Holding a weapon and action tendency while changing art style.
* Preserving a name, catchphrase, or speech style across multiple visual attempts.
* Comparing two designs with only one or two axes changed.

### 4. Smart Linkage Engine / スマート連携エンジン

Randomization is not purely uniform. The app applies light-weight consistency rules so random characters are less likely to become incoherent.

ランダム生成は完全な無作為ではありません。設定同士が破綻しにくいように、軽量な整合ルールを挟んでいます。

Examples:

* Child age groups are nudged toward smaller body builds.
* Certain species imply suitable body types or special parts.
* Military and cyberpunk worlds can bias weapons or goggles.
* Sex and character type can influence speech style, body build, and voice image.
* Non-combat roles are less likely to receive heavy weapons unless the user locks them.

These are generic linkage rules, not hardcoded examples for one character.

これらは特定キャラ用の一回限りの分岐ではなく、汎用的な連携ルールです。

### 5. Preset Templates / プリセットテンプレート

The app includes ready-to-use starting points:

* Dark fantasy warrior / ダークファンタジー戦士
* School romantic-comedy heroine / 学園ラブコメヒロイン
* Cyberpunk mercenary / サイバーパンク傭兵
* Japanese supernatural swordsman / 和風伝奇の剣客
* Isekai mage / 異世界魔導師
* Retro monster-movie creature / レトロ怪獣映画の怪物

Presets are complete starting characters: they include identity, personality, catchphrase, dialogue, and a themed appearance. Every applied field remains editable. When **キャラ固定** is active, the same one-row buttons change only the non-identity visual/theme fields; **固定解除** restores full-preset behavior.

プリセットは人物像・性格・口癖・台詞・見た目まで含む開始キャラクターであり、適用後もすべての項目を編集できます。**キャラ固定**中は同じ一列のボタンが見た目テーマのみを変更し、**固定解除**で完全なプリセット適用に戻ります。

### 6. A/B Compare Mode / A/B比較モード

A/B mode maintains two independent slots. Each slot can hold its own parameters and generated image.

A/B比較モードでは、2つの独立したスロットを保持します。各スロットはそれぞれ別の設定値と生成画像を持てます。

Typical uses:

* Compare Gemini and OpenAI outputs from similar settings.
* Keep Slot A as the stable design and use Slot B for risky style changes.
* Test whether a character is more readable in 12-panel reference layout or three-view structural layout.
* Compare subtle changes in voice image, action tendency, or facial expression.

### 7. Session History / セッション履歴

Generated images are kept as session thumbnails. Users can reload a previous image into the current slot or delete individual entries.

生成された画像はセッション内のサムネイル履歴として保持されます。過去画像を現在スロットへ戻したり、個別削除したりできます。プロンプトはキャラクター名から自動命名されたUTF-8テキストファイルとして直接ダウンロードできます。

This history is for short-term creative comparison. It is not a long-term database and is not a place to store API keys.

この履歴は短時間の比較用です。長期保存データベースではなく、APIキーを保存する場所でもありません。

### 8. Editable PNG Design Data / PNG設計データの保存・復元

Every newly generated PNG contains an uncompressed PNG `iTXt` chunk under the dedicated key `furu.character_sheet`. The schema v1 JSON stores the exact prompt, character fields, app version, timestamp, and non-secret generation details such as model and canvas size. API keys are never embedded.

新しく生成するPNGには、専用キー `furu.character_sheet` の非圧縮PNG `iTXt` チャンクを埋め込みます。schema v1のJSONには、完全なプロンプト、キャラクター項目、アプリバージョン、生成日時、モデル名・キャンバス寸法などの非機密な生成情報を保存します。APIキーは埋め込みません。

The top toolbar advertises **PNG設計保存・復元 / PNG・JPG解析**. Drop a PNG or JPG/JPEG onto the generated-image region, or focus the region and press Enter to choose a file. The dropped image replaces the displayed result, and a persistent line below it names the loaded file. When a PNG contains app metadata, the exact prompt is restored. A JPEG or a PNG without app metadata is sent to the selected AI provider for an inferred prompt. The line identifies that prompt as an AI estimate, not the original, and shows analysis progress or failure. This API call can incur charges. **クリア** empties only the prompt preview; changing any character field resumes the live prompt.

上部メニューには **PNG設計保存・復元 / PNG・JPG解析** を表示します。PNGまたはJPG/JPEGを生成結果領域へドロップするか、その領域へフォーカスして Enter を押してファイルを選ぶと、表示画像がその画像に切り替わり、結果欄の下にファイル名が残ります。PNGに専用メタデータがあればプロンプトを正確に復元します。JPG/JPEGや設計データのないPNGは選択中のAIへ送って画像を解析し、推定プロンプトを作ります。この場合はAPI使用料が発生する可能性があり、元のプロンプトを完全に再現するものではありません。結果欄には解析中・推定完了・失敗も表示します。**クリア** はプロンプト表示だけを空にし、いずれかのキャラクター項目を変更するとリアルタイム生成へ戻ります。

画面上の「設計プロンプト」欄には、リアルタイム更新・PNGからの復元・AI画像解析のいずれの結果も表示します。「生成結果・画像ドロップ（PNG/JPG）」欄は画像の表示と読み込みを兼ねます。

The top one-line status reports the selected file, analysis progress/model, and final result or failure; the result remains visible until dismissed or replaced. AI analysis separates observable identity from presentation: it records hair structure and endpoints, facial geometry, clothing layers and accessory placement, retains known left/right relationships, and leaves occluded traits unknown. The displayed English prompt puts identity first, then pose/background, then preservation rules. Analysis may use more output tokens than before; a truncated or invalid response fails instead of silently dropping details. Pressing image generation uses the displayed prompt as text only: the imported image is not sent as a generation reference. When the prompt came from a restored or AI-inferred image, the result is a new image without a conflicting Japanese profile header from the current form, and the result panel explicitly says which prompt source was used. Even an exact restored PNG prompt does not guarantee a pixel-identical image; an AI-inferred prompt is an approximation whose visual fidelity must be judged from actual outputs.

上部の1行ステータスには、対象ファイル・解析中のモデル・完了または失敗を表示し、閉じるか別の操作をするまで結果を残します。画像解析では髪型の分け目・毛先位置、顔の形、衣装の内外の重なり、アクセサリーの位置など、見える識別特徴と姿勢・背景を分けて記録します。左右が確かな部分だけを保持し、隠れた部分は推測で補いません。表示する英語プロンプトは人物の同一性を先に、姿勢・背景を次に、保持条件を最後に配置します。解析応答が長くなる場合がありますが、途中で切れた結果や不正な形式は特徴を黙って削らず失敗として表示します。「画像生成」は表示中のプロンプトをテキストとして使う新規生成で、読み込んだ画像自体は参照画像として送られません。復元・AI推定プロンプトから再生成する場合は、現在のフォーム値と矛盾する日本語プロフィール欄を合成せず、プロンプト欄直下と結果欄に出所を表示します。PNGから元プロンプトを正確に復元しても画像の完全一致は保証されず、AI推定プロンプトの再現度は実際の生成画像で確認する必要があります。

Because the prompt and character fields are stored inside the PNG, treat the image as carrying those design details when sharing it with another person or service.

PNG自体にプロンプトとキャラクター項目が含まれるため、他者や外部サービスへ画像を渡す場合は、その設計情報も共有されるものとして扱ってください。

---

## Provider Architecture / プロバイダー構成

### Gemini

Gemini is used for both text assistance and image generation. The text layer uses a fallback chain, while the image layer currently uses `gemini-nano-banana-2.1`.

Geminiはテキスト補助と画像生成の両方に使われます。テキスト層はフォールバックチェーンを使い、画像層は現行では `gemini-nano-banana-2.1` を使用します。

Text fallback:

```text
gemini-3.5-flash
-> gemini-2.5-flash
-> gemini-2.5-pro
-> gemini-flash-latest
-> gemini-pro-latest
```

Image model:

```text
gemini-nano-banana-2.1
```

### OpenAI

OpenAI is used for text assistance and image generation through the current OpenAI API paths.

OpenAIは、現行OpenAI API経路でテキスト補助と画像生成に使われます。

Text fallback:

```text
gpt-6.1-sol (default; Astra is selectable above)
-> gpt-6-sol
-> gpt-5.6-sol
-> gpt-5.6-terra
-> gpt-6-luna
-> gpt-5.6-luna
-> gpt-4.1
-> gpt-4.1-mini
-> gpt-4.1-nano
-> gpt-4o
```

Image fallback:

```text
gpt-image-2.5-sunburst (xhigh)
-> gpt-image-2 (high)
```

### Provider Boundary / プロバイダー境界

The same design data is used for both providers, but provider-specific prompt and API handling live in separate modules. This keeps the UI consistent while allowing each provider path to handle its own model behavior.

同じ設計データを両プロバイダーで使いますが、プロンプトとAPI処理はプロバイダー別モジュールに分けています。UIは共通に保ちつつ、各プロバイダーの挙動に合わせた処理を行うためです。

---

## Output Contract / 出力仕様

Generated images are normalized after the provider returns the image.

プロバイダーから画像が返ったあと、出力画像はアプリ側で正規化されます。

* Artwork area: the complete provider image is contained below the profile header without cropping.
* Final PNG: exactly `1120x1584`.
* Aspect ratio: `70:99`, the same ratio as A4 (`210:297`).
* File type: PNG
* Embedded design data: `furu.character_sheet` schema v1 JSON in an `iTXt` chunk; exact prompt restoration without pixel analysis.
* Profile text: exact Japanese character information is rendered by the app above the illustration.
* Watermark: `Generated by Super FURU AI Character Sheet v1.5.0`
* Watermark position: bottom-right
* Filename pattern: `character_sheet_<timestamp>.png`

The normalization and typesetting steps make downstream use more predictable. A character sheet can be passed to another AI, attached as a visual reference, or read by OCR-oriented manga systems. Text rendered inside the illustration itself can still vary by provider.

正規化によって、後段利用が安定します。任意サイズの画像をそのまま扱うのではなく、別AIへの参照画像、漫画制作のキャラクター資料、OCR前提の資料として扱いやすい縦長シートへそろえます。

---

## Integration With Super FURU / Super FURU連携

This app is part of the same creative tool ecosystem as **Super FURU AI 4-koma System**.

このアプリは **Super FURU AI 4-koma System** と同じ創作ツール群の一部です。

The generated sheet can be used to:

* Provide a stable character reference before four-panel manga generation.
* Preserve visible design decisions that would otherwise be lost inside a prompt.
* Supply manga-direction metadata such as action tendency, emotion range, direction style, and awakening state.
* Help downstream tools distinguish a character's role, voice image, costume, and visual silhouette.

生成シートは、4コマ漫画生成前のキャラクター参照、プロンプト内に埋もれがちな設計判断の保持、得意アクション・感情レンジ・演出傾向・覚醒状態などの漫画演出メタデータの受け渡しに使えます。

---

## Setup & Launch / セットアップと起動

### Public version / 公開版

Use the GitHub Pages build:

```text
https://furuyan1234.github.io/character-sheet-maker/
```

### Local development / ローカル開発

```powershell
npm install
npm run dev
```

The Vite dev server uses:

```text
http://127.0.0.1:5176/
```

The repository also includes:

```text
start_character_sheet_app.bat
```

This launcher is intended for Windows users who want to start the local app without typing the npm command each time.

この起動バッチは、毎回npmコマンドを入力せずにローカルアプリを開きたいWindows利用者向けです。

### Build / ビルド

```powershell
npm run build
```

The production build uses a relative Vite base (`./`) so the app can be deployed to GitHub Pages.

本番ビルドではViteのbaseを `./` にしており、GitHub Pages配布で動作しやすい構成です。

---

## File Structure / ファイル構成

```text
character_sheet/
├─ index.html
├─ package.json
├─ vite.config.js
├─ start_character_sheet_app.bat
├─ src/
│  ├─ App.jsx
│  ├─ App.css
│  ├─ index.css
│  ├─ main.jsx
│  ├─ components/
│  │  ├─ FieldInput.jsx
│  │  └─ NeuralForge.jsx
│  └─ lib/
│     ├─ ai-provider.js
│     ├─ gemini.js
│     ├─ imagen.js
│     ├─ openai.js
│     ├─ options.js
│     └─ prompt.js
├─ scripts/
│  ├─ generate_release_text.js
│  └─ update_version.js
├─ docs/
│  ├─ deploy.md
│  └─ project_standards.md
├─ AGENTS.md
├─ HANDOFF.md
└─ README.md
```

### Important modules / 主要モジュール

| File / ファイル | Role / 役割 |
|---|---|
| `src/App.jsx` | Main UI state, API gate, randomization, locks, A/B slots, history, download, canvas normalization. |
| `src/lib/options.js` | All option lists, sections, default values, backup text data, and presets. |
| `src/lib/prompt.js` | Provider-neutral character prompt construction. |
| `src/lib/gemini.js` | Gemini text model calls and model fallback. |
| `src/lib/imagen.js` | Gemini image generation path. |
| `src/lib/openai.js` | OpenAI text and image generation paths. |
| `src/components/FieldInput.jsx` | Reusable field component with lock and AI-fill controls. |

---

## Security Notes / セキュリティ方針

* API keys are kept in React state only.
* API keys are not stored in localStorage.
* API keys are not written to generated images or metadata.
* The app does not include bundled secret keys.
* Users must enter their own Gemini or OpenAI API key in the UI.
* Browser reload clears the key.
* API requests send the key and necessary text/images directly from the browser to the selected Gemini/OpenAI provider; the app operator does not relay API requests.

APIキーはReact state上にのみ保持され、localStorageやファイルへ保存されません。公開版にも秘密鍵は同梱しません。ユーザー自身がUIへ入力したキーだけで動作し、再読み込みでキーは消去されます。API利用時には、キーと処理に必要な文章・画像をブラウザから選択したGemini／OpenAIへ直接送信します。API通信はアプリ運営者のサーバーを経由しません。

---

## Limitations / 制限事項

* Image quality depends on the selected provider, model availability, quota, and safety filters.
* A/B comparison is session-local and not a project database.
* The app creates visual reference sheets; it does not guarantee legal usability of every generated character in every context.
* The smart linkage rules reduce obvious contradictions, but final character intent still belongs to the user.
* Provider API changes may require model-list updates.

---


## Browser security / ブラウザーの安全対策

This update further strengthens security while preserving the existing creation workflow. / 今回の更新では、既存の制作フローを保ちながらセキュリティをさらに強化しました。

The app limits script execution and API connections with Content Security Policy, disables embedded frames and form submissions, and sends no referrer. Open the app directly in its own tab. API keys remain sensitive while in memory; these protections do not guarantee the absence of every vulnerability. Every deployment checks dependencies, source safeguards and the built policy.

CSPでスクリプト実行・API接続先を制限し、埋め込み表示とフォーム送信を禁止、参照元情報を送信しません。アプリは直接タブで開いてください。メモリー内のAPIキーも機密情報であり、すべての脆弱性がないことを保証するものではありません。毎回のデプロイで依存ライブラリ・ソースの防御・ビルド後の設定を検査します。

## Terms & Output Rights / 利用条件・作品の権利

The governing text is the [FURU Application Terms](LICENSE), revised 2026-10-08. / 正本は [FURU アプリ利用条件](LICENSE)（2026-10-08改定）です。

### Scope and applicability / 対象と適用範囲

These terms apply to the program, bundled prompts and accompanying documentation in versions distributed with or explicitly subject to them, only to material FURU has authority to license. These materials are the Covered Software. Third-party code, models, assets, external services, separately bundled projects and separately licensed parts retain their own terms. Merely being introduced in an article does not make something subject to these terms. / 本条件は、本条件を添付し、または配布元で適用対象として明示した版のプログラム、同梱プロンプト、付属文書のうち、FURUが許諾権限を持つ部分に適用します。以下、これらを「対象ソフトウェア」といいます。第三者のコード、モデル、素材、外部サービス、同梱の別プロジェクト、別のライセンスが明示された部分には、それぞれの条件が適用されます。紹介記事に掲載されていることだけを理由に、本条件の対象になることはありません。

This revision dated October 8, 2026 applies to distributions that include or explicitly identify this revision. It does not apply retroactively to existing release ZIPs or earlier versions. Check the LICENSE and applicable scope of the version you obtained. / 2026年10月8日改定の本条件は、この改定条件を添付または明示した配布版から適用します。既存のリリースZIPや過去版へ遡及適用しません。取得した版に添付されたLICENSEと適用範囲を確認してください。

### Use without application or permission / 申請せずにできること

You may run, copy, examine and modify the Covered Software free of charge for personal, business, internal and commissioned work. Integration into internal-only systems and connections to other tools in your own production process are also allowed. Ordinary use requires no application, prior contact or permission from FURU. / 対象ソフトウェアを、個人利用、業務利用、社内利用、受託制作のために無料で実行、複製、調査、改変できます。社内だけで使用するシステムへの組み込みや、自分の制作工程で他のツールと連携させることもできます。通常利用のための申請、事前連絡、FURUの許可は必要ありません。

Free integration into your own or another party's apps or services, and free provision to third parties, require no application, prior contact or permission from FURU outside the paid provision and bundling cases below. Preserve notices, terms and modification disclosures as described under Free sharing and introductions. Advertising revenue or voluntary donations alone do not count as paid provision. Requiring payment, purchase or membership fees to use the Covered Software or its functions does require prior permission. / 「事前に許可が必要なこと」の有料提供・有料商品への同梱等に該当しない、自社・他社のアプリや第三者向けサービスへの無料の組み込み・無料提供も、申請・事前連絡・FURUの許可は不要です。「無料の共有と解説」の表示・条件保持・改変明示の条件を守ってください。広告収益や任意の寄付があることだけでは有料提供としません。ただし、対象ソフトウェアやその機能の利用条件として料金、購入、会員費等の支払いを求める場合は、「事前に許可が必要なこと」の対象です。

You may publish, sell, monetize through advertising and deliver text, images, comics, videos and other works you create using the Covered Software as a tool. No fee, application, individual permission or credit to FURU is required for these works. External API and service fees, and the licensing or credit obligations of assets, voices and dependencies, remain separate. / 対象ソフトウェアを道具として制作した文章、画像、漫画、動画その他の成果物は、公開、販売、広告収益化、納品に利用できます。これらについて、FURUへの利用料、申請、個別許可、FURUのクレジット表記は必要ありません。外部APIや第三者サービスの料金、素材・音声・依存ソフトウェア等のライセンスやクレジット義務は別途確認してください。

### Uses requiring prior permission / 事前に許可が必要なこと

The following uses require prior permission from FURU. / 次の利用には、FURUの事前の許可が必要です。

- Selling, reselling or distributing the Covered Software or modified versions for a fee. / 対象ソフトウェアやその改変版を販売、転売、有料配布すること。

- Integrating code or functions of the Covered Software into your own or another party's paid products, paid apps or paid services for provision to third parties. Internal-only integration and tool connections within your own production process are outside this restriction. / 対象ソフトウェアのコードや機能を、自社・他社の有料商品、有料アプリ、有料サービスに組み込んで第三者へ提供すること。社内だけで使うシステムへの組み込みと、自分の制作工程でのツール連携は、この制限に含みません。

- Allowing third parties to use the Covered Software's functions through a website, API or other mechanism in exchange for payment. / 対象ソフトウェアの機能を、Webサービス、API、その他の仕組みを通じて第三者が利用できるようにし、その利用に対して料金を受け取ること。

- Providing copies or modified versions of the Covered Software as part of, an appendix to or a benefit of paid information products, teaching materials, courses, memberships or sales packages. Downloads restricted to purchasers, students or members, and benefits described as free, are included. / 対象ソフトウェアの複製や改変版を、有料の情報商材、教材、講座、会員サービス、販売パッケージの一部・付録・特典として提供すること。購入者・受講者・会員に限定したダウンロード提供や、無料の付録・特典という名目の場合も含みます。

Renaming, extracting parts, changing format or switching to download distribution does not avoid these conditions. Restrictions apply only to reproduction, adaptation and other uses of material FURU has rights to. General ideas, production techniques, independently developed implementations and uses permitted by law are not restricted. / 名称の変更、一部の抜き出し、形式の変換、ダウンロード提供への変更によって、この条件を回避することはできません。ただし、制限できる範囲は、FURUが権利を持つ部分の複製・翻案その他の利用に限られます。一般的なアイデア、制作手法、独自に開発した実装まで独占するものではなく、法令上認められる利用も制限しません。

Taking a commission, using the Covered Software yourself as a tool, and selling or delivering the completed work do not require this permission. / 利用者が制作の依頼を受け、自分で対象ソフトウェアを使い、完成した作品を販売・納品する行為には、この許可は必要ありません。

### Permission by email / メールでの問い合わせと許可

For a use requiring prior permission, contact FURU with the app concerned, intended use, recipients and whether payment is involved. / 事前許可が必要な利用を希望する場合は、対象のアプリ、利用方法、提供先、料金の有無を添えてFURUへお問い合わせください。

If FURU replies by email or another recorded method explicitly granting permission and stating its scope, you may use the software within that scope. No paper contract or seal is required. / FURUがメール等の記録の残る方法で、利用を許可する旨と対象範囲を返信した場合、その範囲で利用できます。紙の契約書や押印は必要ありません。

Sending an inquiry, receiving an automatic acknowledgment or receiving no reply does not grant permission. Consult FURU again before going beyond the permitted purpose, provision method or scope. Individually agreed terms take precedence. / 問い合わせの送信、受付の自動返信、返答がないことだけでは、許可を得たことにはなりません。許可された用途、提供形態、対象範囲を超えて利用する場合は、改めてご相談ください。個別に合意した条件がある場合は、その合意を優先します。

### Free sharing and introductions / 無料の共有と解説

Free redistribution, free integration and free provision outside the paid cases above are allowed if copyright notices, these terms and third-party licenses are retained and modifications are identified. Services that do not distribute the software must display these notices and conditions on an information page accessible to users. Do not imply that an unofficial version, product or service is official, endorsed or affiliated with FURU. / 「事前に許可が必要なこと」に該当しない無料再配布、無料の組み込み、無料提供は、著作権表示、本条件、第三者ライセンスを保持し、改変した場合は変更した旨を明示することで認めます。ソフトウェアを配布しないサービスでは、利用者が確認できる説明ページ等にこれらを表示してください。FURUの公式版、公認商品、提携サービスであると誤認させる表示はできません。

Independently authored Web articles, paid note articles, explanations, reviews, introductions and courses, whether paid or free, require no permission, prior contact or fee to FURU when copies or modified versions of the Covered Software are not included in the product. App screenshots and operation videos for introduction or explanation may be included insofar as FURU can authorize them. Ordinary links to distribution pages and lawful quotation are allowed. Check third-party rights in works or assets shown in screenshots and videos separately. / 自分で作成したWeb記事、note等の有料記事、解説、レビュー、紹介記事、講座は、有料・無料を問わず、対象ソフトウェアの複製や改変版を商品に含めなければ、FURUへの許可、事前連絡、FURUへの利用料は不要です。紹介・解説のためにFURUが権利を持つアプリの操作画面や操作動画を掲載すること、公式配布ページへの通常のリンク、法令上認められる引用も認めます。画面や動画に含まれる第三者の作品・素材等の権利は別途確認してください。

### Output rights and third-party terms / 作品の権利と第三者の条件

Using the Covered Software does not cause FURU to acquire rights in your outputs or cause these terms to apply to your outputs. / 対象ソフトウェアを利用したことを理由に、FURUが利用者の成果物の権利を取得したり、本条件を成果物に適用したりすることはありません。

If what you provide as an output includes copies or modifications of the Covered Software itself, these terms still apply to those parts. / ただし、成果物として提供するものに対象ソフトウェアそのものの複製・改変が含まれる場合、その部分には本条件が適用されます。

Whether copyright exists in an output and who owns it depend on law, creative contributions, contracts and other circumstances. FURU does not grant or guarantee clearance of third-party rights or AI service terms. / 成果物に著作権が成立するか、誰に権利が帰属するかは、法令、創作への関与、契約その他の事情によって決まります。FURUは、第三者の権利やAIサービスの条件まで許諾・保証するものではありません。

### Earlier versions and existing permissions / 過去版と既存の許諾

These terms do not revoke or narrow valid prior permissions granted under MIT, Creative Commons or other terms. Where earlier permissions remain valid for earlier versions or inherited parts, those parts may still be used under those earlier terms. / 過去にMIT、Creative Commonsその他の条件で有効に付与された許諾を、本条件によって取り消したり狭めたりすることはありません。過去版や引き継がれた部分について、従前の許諾が有効な場合は、その条件に従って利用できます。

Changes to the terms must identify the affected version and scope. An article or README update alone does not change permissions for a version obtained earlier or individually agreed permissions. / 条件を変更する場合は、対象の版と適用範囲を明示します。記事やREADMEの更新だけで、過去に取得した版の許諾や個別に合意した許可を変更することはありません。

See [previous notices and applicable scope](docs/licenses/previous-notices.md). / [以前の表示と適用範囲](docs/licenses/previous-notices.md)もご確認ください。

### Provision conditions / 提供条件

The Covered Software is provided as is. To the extent permitted by law, operation, fitness for a particular purpose, originality of outputs and non-infringement are not guaranteed. FURU is not liable for damage arising from use except where liability cannot be excluded by law. / 対象ソフトウェアは現状のまま提供します。法令で認められる範囲で、動作、特定目的への適合性、成果物の独自性や第三者権利の非侵害を保証しません。法令上免除できない責任を除き、FURUは利用に起因する損害について責任を負いません。

These are custom source-available terms. Restrictions on productization mean that they are not an open-source license under the OSI definition. / 本条件はソースコードを公開する独自の利用条件です。商品化等に制限があるため、OSIの定義によるオープンソースライセンスではありません。

---

## Changelog / 更新履歴

### v1.5.0 (2026-10-07)

- Gemini text generation and image analysis now omits custom sampling settings and uses model defaults. / Geminiの文章生成・画像解析で、独自のサンプリング設定を送らず、モデル標準設定を使用します。
- Image inputs, JSON output settings, and output limits are preserved. / 画像入力・JSON出力設定・出力上限を維持しています。

### v1.4.9 (2026-10-07)

- Security: CSP and frame protection, dependency updates, and mandatory release checks. / CSP・埋め込み防御・依存更新・公開前検査を追加。

### v1.4.8 (2026-10-07)

- Gemini character images now use Nano Banana 2.1 through the Interactions API. / Geminiキャラクター画像生成をNano Banana 2.1のInteractions APIへ更新しました。

### v1.4.7 (2026-10-04)

- 開始画面で、APIキーのメモリ内保持と再読み込み時の消去、Gemini／OpenAIへの直接API送信を分けて説明しました。API通信はアプリ運営者のサーバーを経由しません。
- Clarified memory-only key handling, clearing on reload, and direct browser requests to Gemini/OpenAI without the app operator acting as an API relay.

### v1.4.6 (2026-10-04)
- [terms] 個人・業務利用と自身の成果物の収益化を認める利用条件に統一。アプリ本体の有料配布等は事前許可制とし、過去の有効な許諾と第三者の条件を維持します。 / Unify free personal/business use and output monetization terms; paid app distribution and services require prior permission, while valid prior grants and third-party terms remain intact.


### v1.4.5

* Image-to-prompt analysis now extracts structured visible identity details for hair, face, outfit layers, and accessories before composing a text-only reconstruction prompt. The prompt panel directly labels exact PNG restoration versus AI inference and warns that inference cannot guarantee the original prompt or image. / 画像から髪・顔・衣装の重なり・装飾品など見える識別特徴を構造化し、テキストのみで再生成するプロンプトへ組み立てます。プロンプト欄直下にPNGの正確な復元とAI推定を区別して表示し、推定から元のプロンプトや画像の一致は保証しないと明示します。

### v1.4.3

* Added editable PNG design metadata, PNG/JPG drop import, exact restoration versus AI prompt inference, and visible analysis status. Regeneration from a restored or inferred prompt is a new text-only generation and no longer stamps unrelated current-form details onto the image. / 編集可能なPNG設計メタデータ、PNG/JPGドロップ読み込み、正確な復元とAI推定の区別、解析状況表示を追加しました。復元・AI推定プロンプトでの再生成はテキストのみから新規に行い、現在フォームの無関係な情報を画像へ重ねません。

### v1.4.2

* Fixed every composed PNG at 1120x1584 (70:99, the same ratio as A4), while keeping the complete provider artwork visible below the Japanese profile header. / 合成後のPNGを1120x1584（70:99、A4と同比率）に固定しました。生成画像は日本語プロフィール欄の下に全体が入るよう、縦横比を保って配置します。

### v1.4.1

* Added six complete representative-character presets with distinct identity, personality, catchphrase, and dialogue. / 氏名・性格・口癖・台詞まで異なる、6種類の完成キャラクタープリセットを追加しました。
* Added character identity locking: the one preset row becomes an appearance-theme selector while fixed, and returns to full-character presets on unlock. / キャラ固定を追加しました。固定中は一列のプリセットが見た目テーマ選択となり、解除で完成キャラプリセットに戻ります。
* Sent speech style, era, and role context to OpenAI random text generation. / OpenAIのランダムテキスト生成へ、話し方・時代・役割を渡すようにしました。

### v1.4.0

* Replaced browser-only prompt history with a direct named UTF-8 `.txt` download, while keeping the prompt controls on one row with Save immediately left of the rightmost Text Copy button. / ブラウザ内だけのプロンプト保存履歴を廃止し、名前付きUTF-8 `.txt` ファイルの直接ダウンロードへ変更しました。プロンプト操作は一行に揃え、右端のテキストCopyの直左に保存を配置しています。
* Removed the misleading saved-prompt history UI and documented the actual file-download behavior. / 誤解を招く保存済みプロンプト履歴UIを削除し、実際のファイルダウンロード動作を文書化しました。

### v1.3.10

### v1.3.9

* Added a deterministic Japanese character-information header after image generation, so names, attributes, catchphrases, dialogue, and role details no longer depend on image-model text rendering. / 画像生成後に日本語のキャラクター情報欄をアプリ側で合成し、氏名・属性・口癖・台詞・役割などを画像モデルの文字描画に頼らず表示します。
* Kept the full normalized 1024x1536 illustration below the header; the final portrait PNG grows vertically to fit the profile. / 1024x1536のイラスト全体を情報欄の下に保持し、最終PNGの高さはプロフィール文字量に合わせて伸ばします。
* Verified one successful image generation each through OpenAI and Gemini. / OpenAIとGeminiで各1回の画像生成成功を確認しました。

### v1.3.8

* Defaulted the API gate to OpenAI and use `gpt-image-2.5-sunburst` at `xhigh` for image generation. / APIゲートの初期選択をOpenAIにし、画像生成は `gpt-image-2.5-sunburst` の `xhigh` を使うようにしました。
* Added one automatic fallback to `gpt-image-2` at `high` for non-policy errors. / ポリシー以外のエラーでは `gpt-image-2` の `high` へ一度だけ自動フォールバックします。
* Content-policy blocks are returned without a second image request. / コンテンツポリシーによる拒否では、二度目の画像リクエストを行いません。

### v1.3.7

* Updated the public title references to align with the current **Super FURU AI 4-koma System** naming.
* Kept API-key handling memory-only.
* Preserved the current dual Gemini/OpenAI architecture.
* Maintained 1024x1536 artwork normalization and version watermarking.

### v1.3.x

* Added A/B comparison slots for side-by-side character design testing.
* Added field locks for safer randomization.
* Added session history thumbnails with reload and delete controls.
* Expanded the Smart Linkage behavior for more coherent random characters.
* Updated Gemini and OpenAI model lists to current provider families.

### v1.2.x

* Added dual-provider support for Gemini and OpenAI.
* Added prompt and image-generation routing modules.
* Added API switch UI and API-key acquisition links.
* Added strict canvas normalization and provenance watermarking.

### v1.0.x

* Initial public character sheet generation workflow.
* Added structured parameter sections, presets, dropdown controls, and prompt builder.

---

## Compliance & Legal Stance / 法的遵守について

This project is a creative support tool. It is not designed to reproduce specific copyrighted characters, brands, artists, or existing works. Users are responsible for the legality and appropriateness of their own inputs, generated outputs, publication, and commercial use.

本プロジェクトは創作支援ツールです。特定の既存キャラクター、ブランド、作家、作品を再現する目的では設計していません。入力内容、生成結果、公開、商用利用の適法性と妥当性はユーザー自身が確認する必要があります。

The software logic is shared for technical and creative experimentation. Prompt structure, documentation, and generated creative workflow ideas should be used in a way that respects applicable laws, platform terms, and third-party rights.

ソフトウェアロジックは技術検証と創作実験のために公開されています。プロンプト構造、ドキュメント、生成ワークフローの利用にあたっては、関連法令、各プラットフォーム規約、第三者の権利を尊重してください。

### Prohibited or discouraged use / 禁止・非推奨用途

* Recreating an existing character, artist style, brand mascot, or protected design in a way that may infringe rights.
* Using generated material to mislead others about authorship, endorsement, or official affiliation.
* Selling the tool, prompts, or outputs as a guaranteed income method or deceptive information product.
* Uploading private, sensitive, or third-party confidential data as prompt material.
* Attempting to bypass provider safety policies.

---

## AI Manga Creative Suite / AIまんが制作エコシステム

This app is one component in a broader AI-assisted manga and story production workflow.

このアプリは、AIを活用した漫画・物語制作ワークフローの一部です。

| Tool / ツール | Role / 役割 | Repository / リポジトリ |
|---|---|---|
| Super FURU AI 4-koma System | AI 4-panel manga generation / AI 4コマ漫画生成 | [nano-banana-pro](https://github.com/FURUYAN1234/nano-banana-pro) |
| Story Maker | Story and plot generation / 物語・プロット生成 | [story-maker](https://github.com/FURUYAN1234/story-maker) |
| AI Character Sheet Maker | Character reference generation / キャラクター資料生成 | [character-sheet-maker](https://github.com/FURUYAN1234/character-sheet-maker) |
| AI Comic Translation Tool | Manga translation and regeneration / 漫画翻訳・再生成 | [comic-translation](https://github.com/FURUYAN1234/comic-translation) |
| 360° AI Panorama Generator | 360-degree background generation / 360度背景生成 | [panoforge](https://github.com/FURUYAN1234/panoforge) |
| AI Voice Comic Maker | Voice comic video generation / フルボイス動画化 | [ai-voice-comic-maker](https://github.com/FURUYAN1234/ai-voice-comic-maker) |

---

## Repository Info / リポジトリ情報

* Owner: [FURUYAN1234](https://github.com/FURUYAN1234)
* App path in Antigravity workspace: `C:\Users\sx717\Antigravity\character_sheet`
* Public app: [https://furuyan1234.github.io/character-sheet-maker/](https://furuyan1234.github.io/character-sheet-maker/)
* Local dev port: `5176`

## OpenAI text model selection / テキストモデル選択

All 11 GPT fallback models are selectable. Astra is first and GPT-6.1 Sol is the default. Field generation and text gacha start at the selected model and fall back only downward. The status retains the attempted/adopted model. Image generation and image-to-prompt analysis keep their dedicated routes.

全11モデルを選択できます。Astraが最上位、GPT-6.1 Solが初期選択です。項目生成とテキストガチャは選択モデルから下位へ切り替え、試行・採用モデルを表示します。画像生成と画像からのプロンプト解析は専用経路を維持します。
