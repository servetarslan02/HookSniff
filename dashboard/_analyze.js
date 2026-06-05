const fs = require('fs');
const path = require('path');

const pages = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && !['node_modules', '__tests__', '.next', 'api'].includes(f.name)) walk(full);
    else if (f.name === 'page.tsx') {
      const content = fs.readFileSync(full, 'utf8');
      const isClient = content.startsWith("'use client'");
      pages.push({ path: full.replace(/.*\\app\\/, ''), sizeKB: Math.round(fs.statSync(full).size / 1024), client: isClient });
    }
  }
}
walk('src/app');
pages.sort((a, b) => b.sizeKB - a.sizeKB);

const clientPages = pages.filter(p => p.client);
const serverPages = pages.filter(p => !p.client);

console.log('=== CLIENT vs SERVER ===');
console.log(`Client pages: ${clientPages.length}`);
console.log(`Server pages: ${serverPages.length}`);
console.log(`Total pages:  ${pages.length}`);
console.log('');
console.log('=== TOP 20 LARGEST CLIENT PAGES ===');
clientPages.slice(0, 20).forEach(p => console.log(`${p.sizeKB} KB - ${p.path}`));
console.log('');
console.log('=== LARGE SERVER PAGES (could be even smaller) ===');
serverPages.filter(p => p.sizeKB > 5).slice(0, 10).forEach(p => console.log(`${p.sizeKB} KB - ${p.path}`));

// Check which pages import heavy libs directly
console.log('');
console.log('=== HEAVY LIB IMPORTS IN PAGE FILES ===');
const heavyLibs = ['recharts', 'date-fns', 'framer-motion', 'react-syntax-highlighter', 'monaco', '@tanstack/react-table'];
for (const p of pages) {
  const content = fs.readFileSync(path.join('src/app', p.path.replace(/\\/g, '/')), 'utf8');
  for (const lib of heavyLibs) {
    if (content.includes(lib)) {
      console.log(`${p.path} imports ${lib}`);
    }
  }
}

// Check layout files
console.log('');
console.log('=== LAYOUT FILES ===');
function walkLayout(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && !['node_modules', '__tests__', '.next', 'api'].includes(f.name)) walkLayout(full);
    else if (f.name === 'layout.tsx') {
      const size = Math.round(fs.statSync(full).size / 1024);
      if (size > 2) {
        console.log(`${size} KB - ${full.replace(/.*\\app\\/, '')}`);
      }
    }
  }
}
walkLayout('src/app');
