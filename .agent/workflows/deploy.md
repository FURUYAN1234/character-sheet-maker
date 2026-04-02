---
description: Auto-Increment Version and Deploy (Turbo Mode)
---

// turbo-all

1. Run `node scripts/update_version.js` in `c:/Users/sx717/Antigravity/character_sheet`
2. Run `git add .` in `c:/Users/sx717/Antigravity/character_sheet`
3. Run `git commit -m "Bump version and Deploy"` in `c:/Users/sx717/Antigravity/character_sheet`
4. Run `git push origin main` in `c:/Users/sx717/Antigravity/character_sheet`
5. Run `git tag v$(node -p "require('./package.json').version")-alpha` in `c:/Users/sx717/Antigravity/character_sheet`
6. Run `git push origin --tags` in `c:/Users/sx717/Antigravity/character_sheet`
7. Verify the zip download: open browser to `https://github.com/FURUYAN1234/character-sheet-maker/releases` and check.
8. Run `npm run deploy` in `c:/Users/sx717/Antigravity/character_sheet`
9. Run `git log -n 1 origin/gh-pages` in `c:/Users/sx717/Antigravity/character_sheet` to verify.
10. Run `node scripts/generate_release_text.js` in `c:/Users/sx717/Antigravity/character_sheet`
