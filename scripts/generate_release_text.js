// リリーステキスト生成スクリプト
// デプロイワークフロー最終ステップで実行
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const v = pkg.version;

console.log('=== Release Tag Title (copy below) ===');
console.log('```');
console.log(`v${v} Alpha / AI Character Sheet Maker / AIキャラクターシートメーカー`);
console.log('```');
console.log('');
console.log('=== Release Body (copy below) ===');
console.log('```');
console.log(`## AI Character Sheet Maker v${v} Alpha`);
console.log('');
console.log('### What\'s New / 更新内容');
console.log('- AI-powered character sheet generation with Gemini API');
console.log('- 10 configurable parameter categories (45+ fields)');
console.log('- 3-mode input: Select / Free text / AI generate');
console.log('- Smart linkages: Gender↔Beard, Age↔Build, Era↔Costume');
console.log('- Nano Banana Pro OCR integration fields');
console.log('- 18 dramatically different art styles');
console.log('- A/B comparison mode');
console.log('- Session-only API key (no persistent storage)');
console.log('');
console.log(`## AIキャラクターシートメーカー v${v} Alpha`);
console.log('');
console.log('### 更新内容');
console.log('- Gemini API によるAIキャラクターシート生成');
console.log('- 10カテゴリ・45以上のパラメータ設定');
console.log('- 3モード入力：選択 / 自由入力 / AI生成');
console.log('- スマート連携：性別↔髭、年齢↔体型、世界観↔衣装');
console.log('- Nano Banana Pro OCR連携フィールド');
console.log('- 18種の劇的に異なる画風');
console.log('- A/B比較モード');
console.log('- セッション限定APIキー（永続化なし）');
console.log('```');
