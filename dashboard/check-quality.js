const fs = require('fs');
const j = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));

// Check for quality issues across all sections
const issues = [];

const checkSection = (obj, prefix) => {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v !== 'string') { if (v && typeof v === 'object') checkSection(v, prefix + k + '.'); continue; }
    
    // Hardcoded URLs that should be configurable
    if (v.includes('hooksniff.vercel.app') && !prefix.includes('docs.') && !prefix.includes('contact.')) {
      issues.push({ type: 'URL', key: prefix + k, val: v.substring(0, 80) });
    }
    
    // Hardcoded emails
    if (v.includes('servetarslan02@gmail.com')) {
      issues.push({ type: 'EMAIL', key: prefix + k, val: v.substring(0, 80) });
    }
    
    // Inconsistent terminology: "webhook" vs "Webhook"
    if (v.match(/^webhook[^s]/) && v.length > 3) {
      issues.push({ type: 'lowercase-start', key: prefix + k, val: v.substring(0, 60) });
    }
    
    // Awkward "Could not" phrasing (should be more user-friendly)
    if (v.startsWith('Could not') && !v.includes('contact')) {
      issues.push({ type: 'awkward', key: prefix + k, val: v.substring(0, 80) });
    }
    
    // Missing period at end of sentences
    if (v.length > 30 && !v.endsWith('.') && !v.endsWith('!') && !v.endsWith('?') && !v.endsWith('…') && !v.endsWith('→') && !v.endsWith(')') && !v.includes('{') && !v.endsWith(':') && !prefix.includes('title') && !prefix.includes('label') && !prefix.includes('placeholder') && !prefix.includes('name') && !k.includes('Title') && !k.includes('Label') && !k.includes('Name') && !k.includes('Btn') && !k.includes('Button')) {
      issues.push({ type: 'no-period', key: prefix + k, val: v.substring(0, 60) });
    }
  }
};

checkSection(j, '');

console.log('=== QUALITY ISSUES ===\n');
const byType = {};
for (const issue of issues) {
  if (!byType[issue.type]) byType[issue.type] = [];
  byType[issue.type].push(issue);
}

for (const [type, items] of Object.entries(byType)) {
  console.log(`--- ${type} (${items.length}) ---`);
  items.slice(0, 10).forEach(i => console.log(`  ${i.key}: ${i.val}`));
  if (items.length > 10) console.log(`  ... and ${items.length - 10} more`);
  console.log();
}

console.log('Total issues:', issues.length);
