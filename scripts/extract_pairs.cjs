const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('./src');
const pairs = new Map(); // en -> mr

// 1. Ternaries: lang === 'mr' ? 'MR' : 'EN'
const regexTernary = /lang === 'mr'\s*\?\s*(['"`])([\s\S]*?)\1\s*:\s*(['"`])([\s\S]*?)\3/g;

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = regexTernary.exec(content)) !== null) {
    const mr = match[2].trim();
    const en = match[4].trim();
    if (mr && en && mr.length < 150 && en.length < 150 && !mr.includes('\n') && !en.includes('\n')) {
      pairs.set(en, mr);
    }
  }

  // 2. Objects with mr/en properties
  const objRegexes = [
    /labelMr:\s*(['"`])([\s\S]*?)\1\s*,\s*labelEn:\s*(['"`])([\s\S]*?)\3/g,
    /titleMr:\s*(['"`])([\s\S]*?)\1\s*,\s*titleEn:\s*(['"`])([\s\S]*?)\3/g,
    /nameMr:\s*(['"`])([\s\S]*?)\1\s*,\s*nameEn:\s*(['"`])([\s\S]*?)\3/g,
    /descMr:\s*(['"`])([\s\S]*?)\1\s*,\s*descEn:\s*(['"`])([\s\S]*?)\3/g,
  ];

  objRegexes.forEach(r => {
    let m;
    while ((m = r.exec(content)) !== null) {
      const mr = m[2].trim();
      const en = m[4].trim();
      if (mr && en && mr.length < 150 && en.length < 150 && !mr.includes('\n') && !en.includes('\n')) {
        pairs.set(en, mr);
      }
    }
  });
});

console.log('Total unique English -> Marathi mappings:', pairs.size);
const out = [];
for (const [en, mr] of pairs.entries()) {
  out.push({ en, mr });
}
fs.writeFileSync('./scripts/pairs.json', JSON.stringify(out, null, 2));
