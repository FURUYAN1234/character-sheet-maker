# HANDOFF

This file is public-repository safe. Do not include API keys, private credentials, billing data, private tokens, personal local paths, or unreleased account details.

## Last Updated
2026-06-19 17:55

## Last Agent
Codex

## App Root
`C:\Users\sx717\Antigravity\character_sheet`

## Current Goal
Fallback Chain compatibility update and deployment for v1.3.7.

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

Deploy/tag/release are next. No backup was requested.

## Notes For Next Agent

- Do not ask the user to paste API keys into chat.
- Official local port is `5176`.
- Deploy target is GitHub Pages via `npm run deploy`; Hugging Face is not applicable.
