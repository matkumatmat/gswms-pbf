const fs = require('fs');
const path = require('path');
const { glob } = require('glob'); // npm install glob

const SOURCE_DIR = path.join(__dirname, 'source');
const OUTPUT_FILE = path.join(SOURCE_DIR, 'bundle.js');

// Abaikan folder yang tidak perlu (clients, tests, dll.)
const IGNORE_PATTERNS = [
  'tests/**', 'debug/**', '_tmp/**', 'backupCode/**',
  'node_modules/**','*.md', '*.json', '*.xlsx', 'dist/**'
];
// const IGNORE_PATTERNS = [
//   'clients/**', 'tests/**', 'debug/**', '_tmp/**', 'backupCode/**',
//   'node_modules/**', '*.html', '*.ts', '*.tsx', '*.md', '*.json', '*.xlsx'
// ];

async function build() {
  const files = await glob('**/*.js', {
    cwd: SOURCE_DIR,
    ignore: IGNORE_PATTERNS,
    absolute: true,
    nodir: true
  });
  console.log(`Found ${files.length} JS files.`);

  let bundle = '';
  for (const file of files) {
    const relative = path.relative(SOURCE_DIR, file);
    const content = fs.readFileSync(file, 'utf8');
    bundle += `\n// ----- ${relative} -----\n${content}\n`;
  }
  fs.writeFileSync(OUTPUT_FILE, bundle);
  console.log(`Bundle written to ${OUTPUT_FILE}`);
}

build().catch(console.error);