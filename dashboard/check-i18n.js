const j = JSON.parse(require('fs').readFileSync('src/messages/en.json', 'utf8'));
const issues = [];

const checkObj = (obj, prefix) => {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') {
      // Keys with spaces
      if (k.includes(' ')) issues.push(prefix + k + ' → key has space');
      // Keys with special chars that look like display text
      if (k.includes('/') && !k.includes('..')) issues.push(prefix + k + ' → key has slash');
      // Duplicate key=value
      if (k === v && k.length > 2) issues.push(prefix + k + ' → key equals value');
      // Emoji at start of value
      if (/^[\u{1F300}-\u{1F9FF}]/u.test(v)) issues.push(prefix + k + ' → emoji: ' + v.substring(0, 40));
    } else if (typeof v === 'object' && v !== null) {
      checkObj(v, prefix + k + '.');
    }
  }
};
checkObj(j, '');
issues.forEach(i => console.log(i));
console.log('\nTotal issues: ' + issues.length);
