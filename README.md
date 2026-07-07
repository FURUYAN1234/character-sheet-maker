# AI Character Sheet Maker / AIキャラクターシートメーカー

![Version](https://img.shields.io/badge/version-1.3.7-4f46e5)
![Framework](https://img.shields.io/badge/framework-React%2019%20%2F%20Vite%206-646cff)
![AI](https://img.shields.io/badge/AI-Gemini%20%2F%20OpenAI-f97316)
![Output](https://img.shields.io/badge/output-1024x1536%20PNG-10b981)

> **A visible-parameter character design tool for manga, story, and AI image workflows.**
> **漫画・物語・AI画像生成のために、キャラクター設計を見えるパラメータへ分解する制作支援ツールです。**

AI Character Sheet Maker creates structured character reference sheets from dozens of editable design axes instead of relying on a single free-form prompt. It is designed to feed downstream systems such as **Super FURU AI 4-koma System**, Story Maker, and manual ChatGPT / Gemini image workflows.

AIキャラクターシートメーカーは、自由入力プロンプトだけに頼らず、多数の編集可能な設計軸からキャラクター参照シートを作るツールです。**Super FURU AI 4-koma System**、Story Maker、ChatGPT / Gemini の画像生成ワークフローへ渡しやすい、構造化されたキャラクター資料を作ることを目的にしています。

> **Demo / 公開版**
> [https://furuyan1234.github.io/character-sheet-maker/](https://furuyan1234.github.io/character-sheet-maker/)

---

## Current Release Line / 現行仕様

The current public line is **v1.3.7**. This version is a browser-based React/Vite app with a strict session-only API-key boundary, dual Gemini/OpenAI routing, A/B comparison, parameter locks, 1024x1536 canvas normalization, and provenance watermarking.

現行公開系統は **v1.3.7** です。ブラウザ上で動作する React/Vite アプリで、セッション限定APIキー、Gemini/OpenAIの切り替え、A/B比較、項目ロック、1024x1536キャンバス正規化、来歴ウォーターマークを備えています。

| Area / 領域 | Current behavior / 現行挙動 |
|---|---|
| App version / バージョン | `1.3.7`, displayed in the API gate, header, footer, and watermark. |
| API key handling / APIキー | Memory-only. Keys are not written to localStorage, source files, or output images. |
| Gemini text / Geminiテキスト | `gemini-3.5-flash` -> `gemini-2.5-flash` -> `gemini-2.5-pro` -> `gemini-flash-latest` -> `gemini-pro-latest` |
| Gemini image / Gemini画像 | `gemini-3.1-flash-image` |
| OpenAI text / OpenAIテキスト | `gpt-4.1` -> `gpt-4.1-mini` -> `gpt-4.1-nano` -> `gpt-4o` |
| OpenAI image / OpenAI画像 | `gpt-image-2` |
| Output canvas / 出力キャンバス | Normalized to `1024x1536` portrait PNG after generation. |
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
   Apply a preset or run the gacha-style randomizer. Smart linkage keeps combinations coherent.

5. **Generate text details / テキスト詳細生成**
   Let the selected LLM propose names, catchphrases, dialogue, likes, dislikes, nicknames, and similar textual details when needed.

6. **Generate the sheet / シート生成**
   Send the provider-specific prompt to Gemini or OpenAI image generation.

7. **Normalize and compare / 正規化と比較**
   The generated image is placed on a 1024x1536 portrait canvas with a version watermark. A/B mode allows two slots to be compared side by side.

8. **Download or reuse / 保存・再利用**
   Download PNG output or load previous session history thumbnails for further comparison.

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

Presets are starting templates only. Every applied field remains editable.

プリセットは開始点であり、適用後もすべての項目を編集できます。

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

生成された画像はセッション内のサムネイル履歴として保持されます。過去画像を現在スロットへ戻したり、個別削除したりできます。

This history is for short-term creative comparison. It is not a long-term database and is not a place to store API keys.

この履歴は短時間の比較用です。長期保存データベースではなく、APIキーを保存する場所でもありません。

---

## Provider Architecture / プロバイダー構成

### Gemini

Gemini is used for both text assistance and image generation. The text layer uses a fallback chain, while the image layer currently uses `gemini-3.1-flash-image`.

Geminiはテキスト補助と画像生成の両方に使われます。テキスト層はフォールバックチェーンを使い、画像層は現行では `gemini-3.1-flash-image` を使用します。

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
gemini-3.1-flash-image
```

### OpenAI

OpenAI is used for text assistance and image generation through the current OpenAI API paths.

OpenAIは、現行OpenAI API経路でテキスト補助と画像生成に使われます。

Text fallback:

```text
gpt-4.1
-> gpt-4.1-mini
-> gpt-4.1-nano
-> gpt-4o
```

Image model:

```text
gpt-image-2
```

### Provider Boundary / プロバイダー境界

The same design data is used for both providers, but provider-specific prompt and API handling live in separate modules. This keeps the UI consistent while allowing each provider path to handle its own model behavior.

同じ設計データを両プロバイダーで使いますが、プロンプトとAPI処理はプロバイダー別モジュールに分けています。UIは共通に保ちつつ、各プロバイダーの挙動に合わせた処理を行うためです。

---

## Output Contract / 出力仕様

Generated images are normalized after the provider returns the image.

プロバイダーから画像が返ったあと、出力画像はアプリ側で正規化されます。

* Target canvas: `1024x1536`
* Aspect ratio: portrait `2:3`
* File type: PNG
* Watermark: `Generated by Super FURU AI Character Sheet v1.3.7`
* Watermark position: bottom-right
* Filename pattern: `character_sheet_<timestamp>.png`

The normalization step makes downstream use more predictable. A character sheet can be passed to another AI, attached as a visual reference, or read by OCR-oriented manga systems without dealing with arbitrary provider output dimensions.

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

APIキーはReact state上にのみ保持され、localStorageやファイルへ保存されません。公開版にも秘密鍵は同梱しません。ユーザー自身がUIへ入力したキーだけで動作します。

---

## Limitations / 制限事項

* Image quality depends on the selected provider, model availability, quota, and safety filters.
* A/B comparison is session-local and not a project database.
* The app creates visual reference sheets; it does not guarantee legal usability of every generated character in every context.
* The smart linkage rules reduce obvious contradictions, but final character intent still belongs to the user.
* Provider API changes may require model-list updates.

---

## Changelog / 更新履歴

### v1.3.7

* Updated the public title references to align with the current **Super FURU AI 4-koma System** naming.
* Kept API-key handling memory-only.
* Preserved the current dual Gemini/OpenAI architecture.
* Maintained 1024x1536 output normalization and version watermarking.

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

## License & Rights / ライセンスと権利

This repository has historically used a hybrid stance:

* Software implementation: MIT-style sharing where applicable.
* Prompt structure, documentation, and creative methodology: non-commercial sharing stance aligned with CC BY-NC-SA-style use.

このリポジトリは歴史的に、ソフトウェア実装部分はMIT系の共有、プロンプト構造・ドキュメント・創作方法論はCC BY-NC-SA系の非商用共有に近い立場で扱っています。

Generated outputs are not automatically owned by the developer merely because this app was used. However, the developer does not guarantee that every generated output is legally safe, publishable, or commercially usable. Users remain responsible for checking rights and provider terms.

このアプリを使ったことだけを理由に、生成物の権利が開発者へ自動的に帰属するわけではありません。ただし、すべての生成物が法的に安全・公開可能・商用利用可能であることを保証するものでもありません。権利確認とプロバイダー規約の確認はユーザー責任です。

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
