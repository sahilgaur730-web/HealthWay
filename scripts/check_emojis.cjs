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
    } else {
      results.push(full);
    }
  });
  return results;
}

// Regex for unicode emojis
// Matches emoji presentation, pictographs, transport, symbols, flags, etc.
const emojiRegex = /(\p{Extended_Pictographic}|\p{Emoji_Presentation})/gu;

const files = walk('./src');
let totalEmojiCount = 0;
const found = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = emojiRegex.exec(content)) !== null) {
    // Exclude basic numbers, hashes, asterisks that might match broad emoji props if any
    const code = m[0].codePointAt(0);
    // Standard emoji range starts at 0x1F000 or specific symbols like 0x2600-0x27BF
    if (code > 127 && (code >= 0x1F300 || (code >= 0x2600 && code <= 0x27BF) || code >= 0x1F600)) {
      totalEmojiCount++;
      found.push({ file: f, emoji: m[0], codePoint: 'U+' + code.toString(16).toUpperCase() });
    }
  }
});

console.log('Total emojis found:', totalEmojiCount);
if (totalEmojiCount > 0) {
  console.log(found);
}
