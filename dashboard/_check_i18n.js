const fs = require('fs');
const path = require('path');

function findFiles(dir, ext) {
  let results = [];
  try {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name);
      if (f.isDirectory() && !f.name.includes('node_modules') && !f.name.includes('.next'))
        results = results.concat(findFiles(p, ext));
      else if (f.name.endsWith(ext)) results.push(p);
    }
  } catch {}
  return results;
}

const files = [...findFiles('src/app/[locale]', '.tsx'), ...findFiles('src/components', '.tsx'), ...findFiles('src/hooks', '.ts')];
const namespaces = new Set();
const re = /useTranslations\(\s*['"]([^'"]+)['"]\s*\)/g;

for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = re.exec(c)) !== null) namespaces.add(m[1]);
}

const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));
const tr = JSON.parse(fs.readFileSync('src/messages/tr.json', 'utf8'));

const missing = [];
for (const ns of [...namespaces].sort()) {
  if (!en[ns]) missing.push(ns + ' (missing in EN)');
  if (!tr[ns]) missing.push(ns + ' (missing in TR)');
}

console.log('Total namespaces used:', namespaces.size);
if (missing.length === 0) {
  console.log('All i18n namespaces exist in both EN and TR');
} else {
  console.log('Missing i18n namespaces:');
  missing.forEach(m => console.log('  -', m));
}

// Also check for t() calls with keys that might not exist
const keyRe = /t\(\s*['"]([a-zA-Z][a-zA-Z0-9.]+)['"]/g;
const usedKeys = new Set();
for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = keyRe.exec(c)) !== null) usedKeys.add(m[1]);
}
console.log('\nTotal t() keys used:', usedKeys.size);
