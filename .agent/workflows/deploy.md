---
description: Auto-Increment Version and Deploy (Turbo Mode)
---

// turbo-all

1. Run `node scripts/update_version.js` in `c:/Users/sx717/Antigravity/character_sheet`
2. Run `git add .` in `c:/Users/sx717/Antigravity/character_sheet`
3. Run `git commit -m "Bump version and Deploy"` in `c:/Users/sx717/Antigravity/character_sheet`
4. Run `git push origin main` in `c:/Users/sx717/Antigravity/character_sheet`
5. Run `git tag v$(node -p "require('./package.json').version")` in `c:/Users/sx717/Antigravity/character_sheet`
6. Run `git push origin --tags` in `c:/Users/sx717/Antigravity/character_sheet`
7. Verify the zip download: open browser to `https://github.com/FURUYAN1234/character-sheet-maker/releases` and check.
8. Run `npm run deploy` in `c:/Users/sx717/Antigravity/character_sheet`
9. Run `git log -n 1 origin/gh-pages` in `c:/Users/sx717/Antigravity/character_sheet` to verify.
10. Run `node scripts/generate_release_text.js` in `c:/Users/sx717/Antigravity/character_sheet`
11. Run `Invoke-WebRequest -Uri "https://github.com/FURUYAN1234/character-sheet-maker/archive/refs/heads/main.zip" -OutFile "$env:TEMP\character-sheet-main.zip"` in `c:/Users/sx717/Antigravity/character_sheet`
12. Run `Remove-Item -Recurse -Force "$env:TEMP\character-sheet-extract" -ErrorAction SilentlyContinue` in `c:/Users/sx717/Antigravity/character_sheet`
13. Run `Expand-Archive -Path "$env:TEMP\character-sheet-main.zip" -DestinationPath "$env:TEMP\character-sheet-extract" -Force` in `c:/Users/sx717/Antigravity/character_sheet`
14. Run `Remove-Item -Recurse -Force C:\character-sheet-maker-main -ErrorAction SilentlyContinue` in `c:/Users/sx717/Antigravity/character_sheet`
15. Run `Move-Item -Path "$env:TEMP\character-sheet-extract\character-sheet-maker-main" -Destination "C:\character-sheet-maker-main" -Force` in `c:/Users/sx717/Antigravity/character_sheet`
16. Run `Remove-Item -Force "$env:TEMP\character-sheet-main.zip"` in `c:/Users/sx717/Antigravity/character_sheet`
17. Run `Remove-Item -Recurse -Force "$env:TEMP\character-sheet-extract"` in `c:/Users/sx717/Antigravity/character_sheet`
