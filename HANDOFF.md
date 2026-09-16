# HANDOFF

This file is public-repository safe. Do not include API keys, private credentials, billing data, private tokens, personal local paths, or unreleased account details.

## Last Updated
2026-09-16

## Last Agent
Codex

## App Root
`C:\Users\sx717\Antigravity\character_sheet`

## Current Goal
Change the default OpenAI image route to GPT-Image-2.5 Sunburst at xhigh quality; preserve the explicitly selected Gemini / Nano Banana route.

## 2026-09-16 v1.3.8 GPT-Image-2.5 Sunburst

- OpenAI image generation uses `gpt-image-2.5-sunburst` at `xhigh` first.
- Non-policy errors retry once with `gpt-image-2` at `high`; content-policy blocks do not retry.
- The API gate starts with OpenAI selected, while Gemini-key input retains the existing Nano Banana route.
- Pending release steps: build, GitHub Pages deployment, public-page verification, note update, and full backup.

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

Deploy/tag/release are next. No backup was requested.

## Notes For Next Agent

- Do not ask the user to paste API keys into chat.
- Official local port is `5176`.
- Deploy target is GitHub Pages via `npm run deploy`; Hugging Face is not applicable.
