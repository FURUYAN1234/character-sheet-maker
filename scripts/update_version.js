// バージョン自動インクリメントスクリプト
// 使用: node scripts/update_version.js
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

// package.json
const pkgPath = join(root, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const parts = pkg.version.split('.').map(Number);

const oldVersion = pkg.version;

if (parts[2] === 9) {
  parts[1] += 1;
  parts[2] = 0;
} else {
  parts[2] += 1;
}
const newVersion = parts.join('.');
pkg.version = newVersion;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

// src/App.jsx
const appPath = join(root, 'src', 'App.jsx');
let appContent = readFileSync(appPath, 'utf8');
appContent = appContent.replace(/const SYSTEM_VERSION = "[^"]+";/, `const SYSTEM_VERSION = "${newVersion}";`);
writeFileSync(appPath, appContent, 'utf8');

// index.html
const htmlPath = join(root, 'index.html');
let htmlContent = readFileSync(htmlPath, 'utf8');
htmlContent = htmlContent.replace(/<title>[^<]+<\/title>/, `<title>AIキャラクターシートメーカー V${newVersion}</title>`);
writeFileSync(htmlPath, htmlContent, 'utf8');

console.log(`Version updated: ${oldVersion} -> ${newVersion}`);
