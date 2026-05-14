const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const SOURCE_DIR = path.join(__dirname, 'source');
const OUTPUT_FILE = path.join(SOURCE_DIR, 'codebase.md');

const IGNORE_PATTERNS = [
  'tests/**', 'debug/**', '_tmp/**', 'backupCode/**',
  'node_modules/**', '*.md', '*.json', '*.xlsx', 'dist/**'
];

async function build() {
    const files = await glob('**/*.{js,ts,tsx}', {
    cwd: SOURCE_DIR,
    ignore: IGNORE_PATTERNS,
    absolute: true,
    nodir: true
    });

  console.log(`Found ${files.length} JS files.`);

  let bundle = '';
  for (const file of files) {
    // extra safety: cek beneran file (bukan direktori)
    let stat;
    try {
      stat = fs.statSync(file);
    } catch (err) {
      console.warn(`Skip ${file} - ${err.message}`);
      continue;
    }
    if (!stat.isFile()) {
      console.warn(`Skip ${file} - not a regular file`);
      continue;
    }

    const relative = path.relative(SOURCE_DIR, file);
    const content = fs.readFileSync(file, 'utf8');
    bundle += `\n// ----- ${relative} -----\n${content}\n`;
  }

  fs.writeFileSync(OUTPUT_FILE, bundle);
  console.log(`✅ Bundle written to ${OUTPUT_FILE}`);
}

build().catch(console.error);