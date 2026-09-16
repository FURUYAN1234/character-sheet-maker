# HANDOFF

This file is public-repository safe. Do not include API keys, private credentials, billing data, private tokens, personal local paths, or unreleased account details.

## Last Updated
2026-09-16

## Last Agent
Codex

## App Root
`C:\Users\sx717\Antigravity\character_sheet`

## Current Goal
v1.3.9 adds a deterministic Japanese profile header after image generation while preserving the complete normalized illustration. OpenAI and Gemini each completed one live image generation with the header visible; the official release/deploy and requested public note update are complete.

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
