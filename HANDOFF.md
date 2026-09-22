# HANDOFF

This file is public-repository safe. Do not include API keys, private credentials, billing data, private tokens, personal local paths, or unreleased account details.

## Last Updated
2026-09-23

## Last Agent
Codex

## App Root
`C:\Users\sx717\Antigravity\character_sheet`

## Current Goal
The current v1.4.3 release candidate turns generated PNGs into re-editable character files: it embeds a versioned design-prompt payload and restores it from a result-area drop or keyboard file selection. Dropped PNG and JPG/JPEG images become the displayed image. PNGs with app metadata restore the exact prompt; JPEGs and PNGs without metadata are sent to the selected AI provider to infer a prompt, with a visible message distinguishing an estimate from exact restoration. The manual save-name field is removed, prompt clearing is available, and the top menu names the feature. Recreating from a restored or AI-inferred prompt no longer applies unrelated current-form profile data over the image. User authorized the official v1.4.3 release and public-note update on 2026-09-23; full backup remains outside scope.

## 2026-09-23 Public Note Update

- After action-time user approval, updated https://note.com/happy_duck780/n/neccbebd7d957 with a bold `2026/09/23 開発版（公開アプリ未反映）` history entry describing PNG design-data storage, PNG/JPG import, exact PNG restoration versus AI estimation, and the top-line progress/result display. The note explains API cost and that prompt-only regeneration does not use the imported image as a visual reference.
- Kept the public article title/version at v1.4.2 because the local feature has not been deployed. Public readback confirmed the new copy, existing v1.4.2 release link and live-app link, YouTube embed, and article images. The editor's article content was appended inside the existing history paragraph without replacing earlier rich content.

## 2026-09-23 PNG/JPEG Import Correction

- The result area and file picker now accept PNG and JPG/JPEG. Import inspects file bytes rather than the filename or claimed MIME type; PNG keeps exact embedded-data restoration, while JPEG displays immediately and follows the existing AI inference path.
- Gemini vision requests now carry the detected JPEG MIME type instead of rejecting non-PNG images. The UI and README distinguish PNG-only metadata storage from PNG/JPG import and analysis.
- Focused regression tests cover JPEG import, unsupported image errors, both providers' JPEG request MIME types, and the picker/UI labels. A synthetic JPEG visibly replaced the image in the in-app browser. A development hot reload initially reset the provider module's in-memory key while the app remained unlocked; the app now restores the already-entered, session-only key from React state before API actions, without reading, logging, or storing it elsewhere. After this correction, a single live JPEG vision request succeeded through `gpt-4.1-mini` and returned a detailed prompt matching the test image's brown hair, green clothing, yellow center panel, and pale blue background. Full Node suite 35/35, production build, optional lint, and `git diff --check` passed. Synthetic `scratch/` artifacts were removed.

## 2026-09-23 Detailed Image Analysis And Status Follow-Up

- Confirmed that both the main `画像生成` and lower `再生成` buttons pass the displayed prompt to text-to-image generation. The imported image is not a reference input; the composited profile header still reads the current form. Neither exact prompt restoration nor AI inference promises image identity.
- The inference instruction now requests fine visible details of the face, eyes, hair, clothing layers, materials, props, pose, camera angle, lighting, and rendering, while prohibiting invented or hidden traits. OpenAI's inference output budget was increased to allow that detail.
- Image-analysis progress and completion/failure now use the top one-line status with the file name, and the final status no longer auto-hides. The persistent result-panel notice remains. In-app browser proof showed the synthetic JPEG, file-specific `gpt-4.1-mini` progress with elapsed time, a returned detailed prompt, `AI推定` labeling, and the persistent top-line completion message.

## 2026-09-23 Editable PNG Prompt Metadata

- Added PNG `iTXt` metadata under the dedicated `furu.character_sheet` key with `schema_version: 1`, app/version identity, exact prompt text, character fields, generation context, and creation time. API keys are never included.
- Generated outputs receive the metadata after deterministic sheet compositing. Re-embedding replaces the prior app payload instead of duplicating it.
- The generated-result region now accepts PNG drop and Enter-key file selection. It restores only valid Character Sheet Maker metadata and does not guess prompts from ordinary images.
- Removed the manual prompt-save filename field. Prompt text downloads use the character name automatically; a dedicated clear button resets only the current prompt and any subsequent form change resumes live prompt generation.
- Added the `PNG設計保存・復元` top-menu badge and an always-visible drop/keyboard hint. Narrow-screen layout was corrected so the menu and three prompt actions fit without horizontal overflow.
- Verification: full Node suite 24/24 passed; `npm run lint --if-present`, production build, and `git diff --check` passed (only Git line-ending notices).
- Live proof: one OpenAI generation completed through `gpt-image-2.5-sunburst`; the final PNG measured 1120x1584 and contained both an `iTXt` chunk and the dedicated metadata key. Real browser file selection restored an exact Japanese test prompt; changing a form field then returned to the live prompt. Desktop and narrow-screen UI were reviewed with no browser warnings or errors.
- Public note article/editor was inspected without changing it. The proposed update will explicitly state that this is a development-preview feature and is not yet reflected in the public v1.4.2 app. Publication remains pending action-time user confirmation.

## 2026-09-23 Drop-Image And AI-Inference Follow-Up

- Corrected the result-area import so a dropped/selected PNG replaces the displayed image, including the active comparison slot. A persistent line shows the filename and whether the prompt was restored, inferred, or could not be updated; the top toolbar now reads `PNG設計保存・復元 / AI解析`.
- PNGs without app metadata trigger one vision-text request to the selected provider when its API key is ready. OpenAI uses `gpt-4.1-mini`; Gemini uses `gemini-3.5-flash`. The image is shown immediately while analysis proceeds. The inferred prompt is explicitly labeled as an estimate, and failure/missing-key/oversize states are shown without claiming restoration.
- A single live OpenAI vision request on a synthetic local character PNG returned a description of the pictured black-haired, red-outfit character on a blue background. The browser showed `AI推定`, the inferred prompt, and a persistent confirmation. A second, visually different metadata PNG switched the image to a brown-haired, green-outfit character and restored its exact embedded prompt without an AI call.
- The visible headings now identify the prompt panel as `設計プロンプト` with real-time/PNG/AI sources and the result panel as `生成結果・PNGドロップ（復元／AI解析）`. Both labels were checked in the in-app browser.
- API payload tests use dummy keys and mocked fetch for both providers. The full Node suite passed 27/27, `npm run lint --if-present` and the production build passed, and the temporary `scratch/` verification artifacts were removed. The public note should describe this corrected behavior and mark the local feature as not yet deployed.

## 2026-09-22 v1.4.2 A4-Ratio Output

- Changed the shared post-generation compositor to emit an exact 1120x1584 PNG for both OpenAI and Gemini paths.
- The complete provider image is contained below the deterministic Japanese profile header without cropping or aspect-ratio distortion.
- Focused renderer test passed RED then GREEN. The full Node suite passed 18/18, and the production build passed.
- A live OpenAI generation completed through `gpt-image-2.5-sunburst`. Browser measurement confirmed a PNG data URL at exactly 1120x1584; visual inspection confirmed readable profile text, uncropped artwork with preserved proportions, and the v1.4.2 watermark.
- Pending: official v1.4.2 release transaction and public note update/readback.

## 2026-09-16 v1.3.9 Character Profile Typesetting

- Moved character information out of model-rendered copy and into a deterministic app-rendered Japanese header above the illustration.
- Preserved the complete 1024x1536 artwork; final PNG width is 1024px and height grows to fit the header.
- OpenAI `gpt-image-2.5-sunburst` and Gemini `gemini-3.1-flash-image` each completed one live generation and displayed the header. The initial OpenAI request reported a generic `Failed to fetch`; a subsequent OpenAI run succeeded.
- Visual review confirmed the profile information appeared. The Gemini illustration still included unintended English dialogue and the face read more androgynous than requested; provider artwork compliance is not guaranteed by the typesetting change.
- Focused renderer tests: 3/3 passed. Production build: passed.
- Official v1.3.9 release/deploy completed. Public release: https://github.com/FURUYAN1234/character-sheet-maker/releases/tag/v1.3.9; live app: https://furuyan1234.github.io/character-sheet-maker/.
- The requested note article was published at https://note.com/happy_duck780/n/neccbebd7d957. Public readback confirmed the v1.3.9 title and update entry, its description of deterministic Japanese profile compositing, and the v1.3.9 GitHub Release link. Existing audio, YouTube, image, and note-card embeds remain visible in the public article.

## 2026-09-16 v1.3.8 GPT-Image-2.5 Sunburst

- OpenAI image generation uses `gpt-image-2.5-sunburst` at `xhigh` first.
- Non-policy errors retry once with `gpt-image-2` at `high`; content-policy blocks do not retry.
- The API gate starts with OpenAI selected, while Gemini-key input retains the existing Nano Banana route.
- Completed: production build, GitHub Pages deployment, public-page verification, GitHub Release v1.3.8, note update, and full backup.

## 2026-09-16 GPT-Image-2.5 Sunburst Default

- The API gate now starts with OpenAI selected, while entering a Gemini key still explicitly selects the existing Gemini / Nano Banana route.
- OpenAI image generation calls `gpt-image-2.5-sunburst` with `quality: "xhigh"`, then falls back to `gpt-image-2` with `quality: "high"` for non-policy errors.
- No deployment was performed in this change.

## 2026-06-19 v1.3.7 Fallback Chain Compatibility

- Gemini image generation now uses the current Nano Banana 2 `gemini-3.1-flash-image` REST flow with `responseModalities: ["TEXT", "IMAGE"]`.
- Legacy Gemini image preview rollback names were removed from the runtime image chain.
- OpenAI image generation now matches current `gpt-image-2` behavior: `1024x1792`, `high`, `output_format: "png"`, 600-second timeout, and a 32,000-character prompt guard.
- Image MIME metadata is preserved before canvas watermarking.
- `src/lib/openai.js` was rebuilt with the same exported API because the previous file contained syntax-breaking mojibake strings.
- Version identity was bumped to `1.3.7` in `package.json`, `package-lock.json`, `src/App.jsx`, `index.html`, and `README.md`.
- Release helper text files were refreshed for v1.3.7.

## Verification

- `node --check src/lib/gemini.js`
- `node --check src/lib/imagen.js`
- `node --check src/lib/openai.js`
- `node --check src/lib/ai-provider.js`
- `node --check src/lib/prompt.js`
- `npm run build`
- `npm run lint --if-present`
- Local HTTP 200 on `http://127.0.0.1:5176/`
- In-app browser displayed `AIキャラクターシートメーカー V1.3.7`.
- User-entered Gemini key enabled `🎲 全項目ランダム`.
- Random generation completed with updated fields and status `TXT: AI`.
- Gemini image generation completed through `gemini-3.1-flash-image`; the UI displayed a generated PNG character sheet, enabled the download button, showed status `IMG: gemini-3.1-flash-image`, and the image dimensions were `1024x1536`.

## Deploy Status

v1.3.9 is published on GitHub Pages and as a public GitHub Release. The note article is updated and publicly verified. No full backup was requested for v1.3.9.

## Notes For Next Agent

- Do not ask the user to paste API keys into chat.
- Official local port is `5176`.
- Deploy target is GitHub Pages via `npm run deploy`; latest live release: https://furuyan1234.github.io/character-sheet-maker/.
- GitHub release: https://github.com/FURUYAN1234/character-sheet-maker/releases/tag/v1.3.9
