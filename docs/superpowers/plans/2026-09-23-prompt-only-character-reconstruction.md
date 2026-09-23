# Prompt-only Character Reconstruction Implementation Plan

> **Execution:** Use the available `executing-plans` skill for normal task-by-task implementation. Sol owns implementation after the user switches to Sol and resumes this task. Steps use checkbox (`- [ ]`) syntax. Do not start another agent or task merely to emulate the switch.

**Goal:** 画像から髪型・顔・服・アクセサリーの再現に効く特徴を抽出し、参照画像を生成APIへ渡さずに使える、優先順位と省略防止条件を持つ自己完結したプロンプトを作る。

**Architecture:** 既存の画像読み込み → 選択中プロバイダーで1回解析という入口を維持し、AIの応答を構造化された観察結果へ変更する。共通の純粋関数で応答を検証し、同一人物として保持する特徴と構図・背景を分けた英語プロンプトへ決定的に変換する。表示・コピー・保存・再生成・PNGメタデータ保存は、既存の同じプロンプト文字列を使う。

**Tech Stack:** 既存の React 19 / Vite 6 / JavaScript ES modules / fetch / Node標準test runner。追加依存なし。

## Global Constraints

- 今回の依頼は実装計画の作成。計画作成時点では製品コード変更・API実行・画像生成は行わない。
- 実装担当はSol。計画は実行を開始する権限、公開権限、API利用回数の承認を代行しない。
- 対象は既存 `character_sheet`。Nano Banana は読み取り専用の設計参考。
- 元画像は解析APIへだけ送る。生成APIはテキストのみ。画像編集API、画像参照、隠れた画像埋め込み、外部キャラ検索を追加しない。
- サンプルのキャラ名・髪型・衣装を製品コードへハードコードしない。
- PNG設計データの正確な復元と、画像からのAI推定を引き続き区別する。
- APIキーは既存のセッション内保持とUI入力を使う。値の読み出し・ログ・保存はしない。
- 初版は既存の操作で常に詳細解析する。「標準／厳密」等の新しい選択UI、モデル選択UI、数値スライダーは追加しない。
- ユーザー追加指示: 再現に必要な情報を収める根拠のない文字数・文章形式の縛りは設けない。2,400文字・1,200トークンを継承せず、計画当初の8,192トークン・28,000文字という固定枠も採用しない。
- commit / push / deploy / note公開 / フルバックアップは、この計画の実装工程に含めない。
- 唯一の作業状況記録は `HANDOFF.md`。この計画のチェック欄を進め、他の台帳に同じ詳細を複製しない。

## 1. 調査済みの現状と変更理由

調査日: 2026-09-23。ローカル `character_sheet` は v1.4.3 / commit `5fa6593`、計画作成前は作業ツリーがクリーン。実装開始時に再確認する。HANDOFFの古い未デプロイ記述だけで公開状態を断定しない。

| 現在の経路 | 確認箇所 | 変更理由・維持すること |
|---|---|---|
| PNG/JPEG表示 → メタデータ復元またはAI推定 | `src/App.jsx` の `restorePromptFromFile` | 既存のrequest IDによる古い応答の破棄、14MB上限、状態表示を保持 |
| 画像から英語プロンプトを生成 | `src/lib/ai-provider.js:64` | 詳細指定はあるが、2,400文字以内という指示。一つのまとまったプロンプトを要求しており、1文・1段落の強制ではない。項目の欠落・優先順位・左右の曖昧さをコードで管理していない |
| OpenAI画像解析 | `src/lib/openai.js:138` | `gpt-4.1-mini` / `detail: high` / 出力上限1,200トークン |
| Gemini画像解析 | `src/lib/gemini.js:150` | `gemini-3.5-flash` / 出力上限1,200トークン |
| 再生成 | `src/App.jsx:204`, `src/lib/openai.js`, `src/lib/imagen.js` | 表示中プロンプトをテキストで送る。元画像を生成に使わない点が今回の要件に合う |
| プロンプトの保存 | `src/lib/png-character-sheet-metadata.js`, `src/lib/prompt-download.js` | 完全な文字列が既に保存されるため、初版に新しいメタデータschemaは不要 |

Nano Banana の `getCharacterAnalysisPrompt()` は、毛先の身体上の到達位置、前髪、結び方、シルエット、内巻き／外ハネ等の観察項目が参考になる。一方で「結っている＝Long Hair」「姫カットから後ろ髪を推測」「白黒の灰色から髪色を推測」や `(hair:1.5)` の数値タグを、そのまま新経路へ移植しない。新経路では可視の証拠と自然言語の保持指示を使う。

現時点で実証されているのは上記のコード上の制約。文字数上限が今回の髪型不一致の唯一の原因とは未確認。解析モデルの見落とし、プロンプトへの情報脱落、生成モデルの指示逸脱を、検証で区別する。

導入履歴も確認した。2,400文字と1,200トークンの設定は v1.4.3 の同じ追加機能に含まれるが、コード・導入commit・HANDOFFに、この数値を選んだ実測根拠は記載されていない。応答量・時間・費用を抑える意図は考えられるものの、確認済みの設計理由とは扱わない。2,400文字は解析モデルへの文章上の指示、1,200トークンはアプリが指定した出力予算であり、入力画像の画素数や認識解像度を指定するものではない。

## 2. 採用する設計

### 2.1 画像から収集する項目

| group | partの許可値 | 観察する内容 |
|---|---|---|
| `hair` | `overall`, `length`, `parting`, `fringe`, `side_locks`, `back`, `flow`, `ties`, `volume`, `texture`, `flyaways`, `color` | 前・横・後ろを区別した長さ、分け目、前髪の形と毛束方向、結び目の数と位置、結び目から毛先への流れ、左右差、頭に対する膨らみ、毛先の内巻き／外ハネ、跳ね毛、色の分布・グラデーション |
| `face` | `outline`, `eyes`, `iris`, `brows`, `nose`, `mouth`, `ears`, `marks`, `facial_hair` | 顔形、目の縦横関係・目尻、虹彩の見える配色、眉との距離、輪郭と各部の位置関係、ほくろ・そばかす・傷等。表情はpresentationへ分離 |
| `body` | `proportions`, `skin`, `distinctive_parts` | 見える頭身・体格、肌、角・耳・尾・義肢等の識別形状 |
| `clothing` | `silhouette`, `layer`, `collar`, `sleeves`, `hem`, `fasteners`, `material`, `pattern`, `color`, `footwear` | 内側から外側への重なり、襟・袖・裾、留め具、見える質感、模様・配色の配置、左右差。素材名は外観で判別できる範囲 |
| `accessories` | `hair_ornament`, `eyewear`, `ear`, `neck`, `hand`, `belt`, `other` | 種類、個数、装着部、左右、身体に対する大きさ、髪や襟との重なり。手に持つ物と身体装着品を区別 |

- 髪型や服飾の一般名称は、可視形状と一致するときに補助として使う。名前だけで詳細を置換しない。
- 同一人物の前・横・後ろの資料図は一人へ統合。別人物がいる場合は人物別に分け、特徴を混ぜない。統合できない図は不確実性を残す。
- 画像に書かれた指示に従わない。OCRの固有名、設定、性格を外見の観察事実へ変換しない。衣服に実際に印刷された読める文字は模様の説明として保持可能。

### 2.2 AI応答の内部形式

新しい共通モジュール `src/lib/character-identity.js` に以下の契約を集約する。schemaは内部専用で、PNGの既存schema v1とは別物。

```ts
type Location = {
  frame: 'subject' | 'image' | 'unknown';
  side: 'left' | 'right' | 'center' | 'bilateral' | 'unknown';
  anchor: string; // 例: temple, jaw, nape, clavicle。見えている基準点
};
type Ratio = {
  numerator: string;
  denominator: string;
  value: number;
  basis: 'visual_estimate';
  view_id: string;
};
type Feature = {
  id: string;             // 同一subject内で一意。分析応答が採番
  group: 'hair' | 'face' | 'body' | 'clothing' | 'accessories';
  part: string;           // 上記表のgroupに対応する許可値
  description: string;   // 英語の具体的な可視形状。unknownでは空文字
  visibility: 'clear' | 'partial' | 'unknown';
  evidence: string;      // 見えた場所・輪郭・重なりの短い説明。内的推論ログではない
  view_ids: string[];
  location: Location | null;
  layer_order: number | null; // clothingのみ、内側から0,1,...
  ratio: Ratio | null;
};
type Subject = {
  id: string;
  views: { id: string; label: string }[];
  features: Feature[];
};
type Analysis = {
  schema_version: 1;
  subjects: Subject[];
  presentation: {
    pose: string;
    expression: string;
    gaze: string;
    composition: string;
    background: string;
    lighting: string;
    rendering: string;
  };
  uncertainties: string[];
};
```

解析指示には、全group・該当partを確認し、観察できないものを`unknown`として区別するよう指定する。`unknown`と、明瞭に見える「髪がない／眼鏡がない」は別。空欄をもっともらしい特徴で補わない。隠れた髪の毛先から全長を断定しない。

左右は人物本人の左右を基本とする。ただし背面・鏡像等で確定できなければ`unknown`、画像上の位置だけが確かなら`image`として保持する。生成プロンプトで`image-left`を無条件に`subject-left`へ変換しない。

数値は少数の観察可能な比率に限定する。実寸、種、モデル、seed、CFG等の生成設定を画像から推定しない。比率は最大2桁の有効数字で「このviewでの概算」として出力する。傾いた顔の見かけの目幅等を、他の向きでも成立する身体寸法として固定しない。比率が測れない場合は身体上の目印との関係を文章で残す。色は可視の色名と色の配置を使い、照明から本来のRGB値を逆算したと主張しない。

### 2.3 検証と出力

共通モジュールの公開関数:

```ts
export declare const CHARACTER_ANALYSIS_INSTRUCTION: string;
export declare function parseCharacterAnalysis(rawText: string): Analysis;
export declare function compileCharacterPrompt(analysis: Analysis): string;
```

上記はインターフェース定義であり、実装ファイルは既存と同じJavaScriptにする。各関数の責務は次のとおり確定している。

- パーサー: 応答全体または応答全体を囲む単一のJSONコードフェンスだけを受け付ける。説明文から都合のよいJSON部分を切り出さない。schema version、型、group/part、列挙値、一意ID、view参照、有限の正のratio、clothing以外のlayer_order禁止を検証する。
- 位置の`frame: unknown`には`side: unknown`だけを許可する。layer_orderは非負整数。subject/view/featureのIDは該当スコープ内で重複不可。featureのpartはgroupと一致させる。
- 観察できたfeatureは空でないdescription/evidence/view_idsを必要とする。unknownは空description・ratio=nullとする。全subjectに可視のfeatureが一つもない応答は失敗。空欄や欠けたgroupは「不明」であり、別キャラの既定値で埋めない。
- 応答全体や各項目へ独自の文字数枠を設けない。description/evidenceには具体的な観察だけを記述し、同じ形容詞の繰り返しを省く。文字数を減らすために固有の特徴を削除しない。余分なJSONキーは生成プロンプトへ流さない。
- 重複は同じsubject/group/part/location/view_ids/descriptionの完全一致だけ統合する。違う装飾品や似た毛束を近似文字列一致で消さない。
- 同じ部位に矛盾する観察がある場合は、モデルへJSON返却前の整合確認を指示する。コードのschema検査は意味・画像上の正しさを保証しない。コードだけで一般的な意味矛盾が解決したと報告しない。
- 出力順: `CHARACTER IDENTITY`（人物ごと、hair→face→body→clothing→accessories）→ `PRESENTATION` → `PRESERVATION RULES`。
- 顔の表情・目線・ポーズはpresentation、輪郭・目の形・髪・衣装シルエットはidentityへ置く。衣装はlayer_order昇順。各特徴の場所・左右・比率を自然言語で同じ行に組み込む。
- 保持指示は「記述された髪型の分け目・毛束・結び位置・長さ・輪郭を保つ」「指定された衣装の層・装飾品を省略しない」「本人左右が判明している非対称を反転しない」。入力にない禁止対象を作らない。
- 背景・ポーズは元画像を初期の希望として記録し、同一性より低い優先順位にする。初期生成で無作為に変化させる指示にはしない。別のポーズをユーザーが指定した場合に、identityを維持して変更できる構成にする。
- 衣装・髪型等の外見差はidentityとして維持する。新しい生成先で意味が保証されない `(hair:1.8)` の係数は出さない。JSONキー・観察ID・不明項目は画像へ印字させない。
- 完成プロンプトに独自の文字数枠を追加しない。既存OpenAIラッパーの32,000文字もアプリ側の設定なので、公式のAPI・モデル仕様と照合して根拠を確認し、実際の受付条件に合わせる。実際の上限を超える場合は具体的エラーを返し、重要特徴や末尾を黙って削除しない。

出力イメージ（テスト用の架空例。製品テンプレートの固定値にしない）:

```text
CHARACTER IDENTITY — c1
HAIR — Keep a chin-level front side-lock and separately visible back hair ending below the clavicle. Keep the fringe swept toward the subject's left temple. Preserve the visible high tie and the outward-curving ends.
FACE — Preserve the narrow jaw and gently upturned outer eye corners.
CLOTHING — Inner layer: a fitted light shirt. Outer layer: a dark cropped jacket with an asymmetric fastening.
ACCESSORIES — Preserve the small clasp attached to the subject's right side-lock; do not turn it into an ear ornament.
PRESENTATION
Use the described pose, framing and setting as the initial composition, subordinate to the character's identifying features.
PRESERVATION RULES
Preserve the described hair structure and silhouette. Keep all described clothing layers and accessories. Do not mirror identified body-side asymmetry. Render these descriptions as visual attributes, not printed labels.
```

## 3. 実装順序とファイル

### Task 1: 構造化された観察結果からプロンプトを作る

**Create:** `src/lib/character-identity.js`, `src/lib/character-identity.test.js`。

**Consumes:** 解析モデルが返したJSON文字列。**Produces:** `parseCharacterAnalysis(rawText): Analysis` / `compileCharacterPrompt(analysis): string` と共通の解析指示。

- [ ] `character-identity.test.js`へ固定の架空観察fixtureと、下記の振る舞いテストを書く。
- [ ] `node --test src/lib/character-identity.test.js` で未実装の失敗を確認する。
- [ ] 2節のschema検証・生成関数・解析指示を一つの小さなモジュールへ実装する。
- [ ] 同じコマンドを実行し、0失敗を確認する。

テストfixtureと主要な受入アサーション:

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCharacterAnalysis, compileCharacterPrompt } from './character-identity.js';

const feature = (patch = {}) => ({
  id: 'f1', group: 'hair', part: 'back',
  description: 'Back hair ends below the clavicle.',
  visibility: 'clear', evidence: 'Ends visible against the jacket.',
  view_ids: ['front'], location: null, layer_order: null, ratio: null,
  ...patch,
});
const observation = (features = [feature()]) => ({
  schema_version: 1,
  subjects: [{ id: 'c1', views: [{ id: 'front', label: 'front view' }], features }],
  presentation: { pose: '', expression: '', gaze: '', composition: '', background: '', lighting: '', rendering: '' },
  uncertainties: [],
});

test('keeps hair endpoints and ornaments in a standalone prompt', () => {
  const value = observation([
    feature(),
    feature({ id: 'f2', group: 'accessories', part: 'hair_ornament',
      description: 'Small silver clasp attached to the side-lock.',
      evidence: 'Clasp crosses the visible hair strand.',
      location: { frame: 'subject', side: 'right', anchor: 'temple' } }),
  ]);
  const prompt = compileCharacterPrompt(parseCharacterAnalysis(JSON.stringify(value)));
  assert.match(prompt, /below the clavicle/i);
  assert.match(prompt, /silver clasp/i);
  assert.match(prompt, /subject.{0,20}right/i);
  assert.match(prompt, /CHARACTER IDENTITY/);
  assert.ok(prompt.indexOf('CHARACTER IDENTITY') < prompt.indexOf('PRESENTATION'));
  assert.doesNotMatch(prompt, /see (?:the )?(?:attached|reference) image/i);
});

test('unknown hidden back hair never becomes an invented hairstyle', () => {
  const value = observation([
    feature({ part: 'fringe', description: 'Blunt fringe above the eyebrows.' }),
    feature({ id: 'hidden', description: '', visibility: 'unknown', evidence: 'Back is occluded.' }),
  ]);
  const prompt = compileCharacterPrompt(parseCharacterAnalysis(JSON.stringify(value)));
  assert.match(prompt, /Blunt fringe/);
  assert.doesNotMatch(prompt, /below the clavicle|waist-length|ponytail/i);
});

test('rejects unsupported structure rather than returning raw AI prose', () => {
  assert.throws(() => parseCharacterAnalysis('A pretty character with long hair.'));
  assert.throws(() => parseCharacterAnalysis(JSON.stringify({ ...observation(), schema_version: 2 })));
  assert.throws(() => parseCharacterAnalysis(JSON.stringify(observation([feature({ ratio: { value: -1 } })]))));
});
```

同じファイルに追加する必須ケース: 内外の衣装が逆順に返ってもlayer_orderで整列／人物間の髪と眼鏡の混線なし／不明な左右を本人左右へ変換しない／完全重複だけ除く／view参照不正／空の応答／部分JSON／長文の固有特徴も欠落させない／比率の概算表記と丸め／上限エラーを装って特徴を切り捨てない。髪のない頭、短い結び髪、帽子で隠れた後頭部もfixtureに含める。

### Task 2: 既存の両API解析と接続する

**Modify:** `src/lib/ai-provider.js`, `src/lib/openai.js`, `src/lib/gemini.js`, `src/lib/image-prompt-inference.test.js`。

**Create:** `src/lib/character-identity-provider.test.js`（Vite SSR経由で拡張子なしimportを含む既存routerを読み込み、fetchだけをモックする統合テスト）。

**Interfaces:** 既存の `inferPromptFromImageAI(imageDataUrl, onStatusUpdate)` は `{ prompt, model }` を返す契約を維持。下位2関数に任意の第4引数 `options = {}` を追加し、`requireComplete`を受ける。既存3引数呼び出しも可能にする。API出力予算はプロバイダー側で各モデルの仕様に合わせて設定する。

- [ ] モックAPIへ構造化JSONを返させ、routerを通った生成文に髪・顔・衣装・装飾品が残るテストを両プロバイダー分追加する。
- [ ] `node --test src/lib/image-prompt-inference.test.js src/lib/character-identity-provider.test.js` の失敗を確認する。
- [ ] router内の解析指示を共通常数へ差し替え、応答をparse→compileする。下記の接続形を使う。
- [ ] 実装時に使用中の解析モデルの公式資料で最大出力とリクエスト条件を確認する。1,200というアプリ独自の小さい枠を外し、各モデルが対応する十分な最大出力枠をAPI側に設定し、根拠URL・確認日を実装記録へ残す。API既定値に任せる場合も、その既定値で必要な構造化応答を収容できるか確認する。「最大枠を設定＝毎回全量を出す」指示にはしない。新しい全モデル共通の固定値へ置換しない。
- [ ] 既存の60秒タイムアウトはエラーを検知する仕組みとして維持し、出力量拡大後の実測で不足が確認された場合に調整する。タイムアウト回避のために特徴量を減らさない。
- [ ] OpenAIは既存 `callChatCompletion` へ `requireComplete` を渡した場合だけ `finish_reason === 'length'` をエラー化。Geminiも `finishReason === 'MAX_TOKENS'` をエラー化。拒否・空応答・HTTPエラーは既存の失敗経路へ渡す。
- [ ] 同じ重点テストを再実行する。

```js
// ai-provider.js の既存exportの内部。下位関数名は既存importを使う。
const infer = activeEngine === 'openai' ? inferPromptFromImageOAI : geminiInferPrompt;
const result = await infer(imageDataUrl, CHARACTER_ANALYSIS_INSTRUCTION, onStatusUpdate, {
  requireComplete: true,
});
const analysis = parseCharacterAnalysis(result.prompt);
return { prompt: compileCharacterPrompt(analysis), model: result.model };
```

JSONは既存テキスト応答に要求してアプリ側で検証する。未確認のAPI固有schema機能を前提にしない。JSON失敗時に文章へ黙って戻すfallbackや、自動の追加課金リクエストは作らない。失敗時は既存UIへ具体的理由を返す。

OpenAI `detail: high`、PNG/JPEGのMIME、画像上限、選択プロバイダー、認証経路を保持する。解析モデルは最初の比較では現行の `gpt-4.1-mini` / `gemini-3.5-flash` を固定し、設計変更とモデル変更の効果を混ぜない。Solは実装担当モデルであり、アプリの解析モデルをSolへ置き換える意味ではない。

### Task 3: 再生成までの一貫性と互換性を確認する

**Modify tests:** `src/lib/image-prompt-inference.test.js`, `src/lib/prompt-actions-layout.test.js`。既存PNGメタデータ・ダウンロードのテストへ構造化由来の長いプロンプトのround-tripケースを追加。

**Production:** 原則 `src/App.jsx`, `src/lib/imagen.js`, `src/lib/png-character-sheet-metadata.js`, `src/lib/prompt-download.js` の動作変更は不要。`src/lib/openai.js` の既存プロンプト上限は公式受付条件との照合対象。実際に統合を妨げる同経路の不具合が確認された場合に限り、最小修正と対応テストを追加する。

- [ ] 「解析は画像を受け取る／生成は完成プロンプトだけを受け取る」をfetchの実リクエストbodyで検証する。OpenAIは `/v1/images/generations`、Gemini画像生成はtext partだけで、画像・image_url・inline_data・inlineDataを持たないこと。
- [ ] 完成プロンプト全体が表示・copy/download・再生成body・PNG復元を通過しても欠けないことを確認する。文字数が長い場合にUIだけ短縮しない。
- [ ] 正確なPNGメタデータがある場合は推定呼び出し0回、既存promptをそのまま復元。旧schema v1の読み込みも維持する。
- [ ] 推定失敗、新画像の読み込み中に前画像の応答が到着、フォーム変更・clear・provider変更・reset時の古い応答破棄を確認する。
- [ ] 推定プロンプトの再生成で無関係なフォームのプロフィールを合成しない既存挙動を維持する。
- [ ] ユーザーへ見せるのはコピーして使える構造化済みの英語プロンプト。内部JSONの保存UIや追加画面は作らない。

### Task 4: 文書とローカル検証を仕上げる

**Modify:** `README.md` の画像読み込み・推定・再生成説明、`HANDOFF.md` の本件記録。

- [ ] READMEへ、観察項目、同一性の優先順位、未知項目を推測しないこと、text-only生成、解析出力量増加、実画像の再現性は別途検証が必要なことを反映する。完全一致や最高性能を保証しない。
- [ ] アプリ直下で `node --test src/lib/*.test.js` を実行。重点テストも全て含まれ0失敗。
- [ ] `npm.cmd run lint --if-present`、`npm.cmd run build`、`git diff --check` を実行。lint script未定義を「lintが実行・合格した」と記録しない。
- [ ] UI確認は既存ローカルサーバーを再利用し、必要なら `npm.cmd run dev -- --host 127.0.0.1 --port 5176`。Codex内蔵ブラウザで長文の読みやすさ、コピー／保存、推定中／失敗／完了表示を確認する。モックでの画面確認は明記し、API成功と呼ばない。
- [ ] HANDOFFへ変更ファイル、実行したチェック、未実施の実画像評価、次の操作を短く記録する。版上げ・公開は後続の明示依頼時に扱う。

## 4. 再現度を評価する方法（実装テストとは別）

目的は「JSONが生成された」ではなく、元画像の識別特徴が画像→観察→プロンプト→新規画像で残ったかを評価すること。下記は実API利用が承認された時の実施計画であり、今回の計画作成で実行しない。

1. 最初の対象はユーザーが再現しにくいと感じたキャラ画像1枚。複雑な前髪、結び位置、左右差、衣装の層、髪留めが確認できる画像を優先する。一般化の評価には後で異なる髪型の画像を追加する。
2. 生成前に元画像を目視し、識別に必要な観察項目を短いチェック表へ記録する。見えないものは評価対象外。生成結果を見てから採点基準を変えない。
3. 同じ入力・解析プロバイダー・解析モデルで、旧文章型と新構造化型を比較する。公平な新規比較は解析2回＋画像生成2回が必要。旧条件の保存済み結果を流用するときは、モデル・入力・生成条件・プロンプトが一致する証拠を残す。
4. 生成モデル・品質・サイズは一致させる。両方とも元画像を生成APIへ渡さない。seed固定が使えない経路では固定したと称さない。
5. 最初の1組は予備評価。継続的な改善を主張するには、別画像・複数生成で追試が必要。実施枚数・費用はその段階のユーザー指定に従う。計画を理由に自動で追加生成しない。

評価表の列は `特徴 | 元画像の観察 | 解析結果 | 完成プロンプト | 生成画像 | 判定`。判定は `一致 / 部分一致 / 不一致 / 確認不能`。髪だけ良くなって顔や衣装が崩れた場合は全体改善と報告しない。

特に髪は、前髪の分割、分け目、結び目数・高さ、側頭部の毛束、毛先到達点、内巻き／外ハネ、左右差、色分布を一つずつ確認する。アクセサリーは種類だけでなく装着場所と重なりまで確認する。

不一致の切り分け:

- 解析結果に特徴がない／間違う → 解析指示・可視性・解析モデルの問題。
- 解析結果にはあるが完成プロンプトから落ちる → 検証・変換コードの問題。
- 完成プロンプトには正しくあるが生成画像が違う → 生成側の追従性の問題。プロンプト配置と優先順位の調整候補。

モデル知識は観察の補助であり、見えない情報の正解表ではない。現行解析モデルで細部の見落としが残った場合は、公式資料で画像入力・提供状況・料金を確認して上位モデル比較を次の独立実験にする。「8,192トークン化したので最高峰」とは評価しない。

## 5. Solへの開始指示

この計画のTask 1→2→3→4を順に実装する。最初に最新 `AGENTS.md` / `HANDOFF.md` / `docs/project_standards.md` とGit差分を確認する。実装を進める際は既存のフォーム生成、PNG復元、キー保持、画像生成APIを保護する。ローカル機能完成と実画像再現度の確認を別々に報告し、実API未実施なら再現度改善は未検証と明記する。

計画作成時点の状態: **実装未着手、実API比較未実施**。計画と引き継ぎ参照だけを保存した。
