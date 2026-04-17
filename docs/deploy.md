# Deploy Rules: character-sheet-maker

## Deploy Targets
- GitHub Pages

## Deploy Commands
```bash
npm run build
npm run deploy
```

## Platform-Specific Guardrails
- このプロジェクトは標準的な GitHub Pages を利用してデプロイする。
- ❌ 他プロジェクト（例: Nano Banana Pro）にあるような Hugging Face Spaces 向けのスクリプト（`deploy:hf` 等）を実行したり、`.git` 保護ルールを流用したりしてはならない。

## Protected Settings
- `vite.config.js` の `base` は GitHub Pages 用の設定がなされているため推測で触らない。

## Not Applicable
- Hugging Face Spaces
- Vercel / Netlify / Cloudflare Pages / Firebase Hosting
