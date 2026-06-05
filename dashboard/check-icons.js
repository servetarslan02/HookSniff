const fs = require('fs');
const path = require('path');

// Read exported icons
const iconsFile = fs.readFileSync('src/components/icons.ts', 'utf8');
const exported = [];
const re = /  ([A-Z][a-zA-Z]+),/g;
let m;
while ((m = re.exec(iconsFile)) !== null) {
  exported.push(m[1]);
}
console.log('Exported icons:', exported.length);

// Find used icons
const used = new Set();
function walk(dir) {
  for (const f of fs.readdirSync(dir, {withFileTypes:true})) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && !['node_modules','__tests__','.next'].includes(f.name)) walk(full);
    else if (f.isFile() && /\.(tsx?|jsx?)$/.test(f.name) && !f.name.includes('.test.') && f.name !== 'icons.ts') {
      const content = fs.readFileSync(full, 'utf8');
      for (const icon of exported) {
        if (content.includes(icon)) used.add(icon);
      }
    }
  }
}
walk('src');
console.log('Used icons:', used.size);

const unused = exported.filter(i => !used.has(i));
console.log('Unused icons:', unused.length);
unused.forEach(i => console.log('  -', i));
