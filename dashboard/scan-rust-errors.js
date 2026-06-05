const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir, {withFileTypes:true})) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && !['target','vendor','node_modules'].includes(f.name)) walk(full, files);
    else if (f.isFile() && f.name.endsWith('.rs')) files.push(full);
  }
  return files;
}

const files = walk('api/src');
const issues = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const rel = file;
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) continue;
    
    // Find BadRequest messages
    const m = line.match(/AppError::BadRequest\(\s*"([^"]+)"/);
    if (m) {
      const msg = m[1];
      if (msg.length > 10) {
        issues.push({ file: rel, line: i+1, msg: msg.substring(0, 70), type: 'BadRequest' });
      }
    }
  }
}

console.log('Rust BadRequest messages: ' + issues.length);
issues.slice(0, 20).forEach(i => console.log('  ' + i.file.split('/').pop() + ':' + i.line + ' -> ' + i.msg));
if (issues.length > 20) console.log('  ... and ' + (issues.length - 20) + ' more');
