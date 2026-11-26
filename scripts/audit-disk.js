const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('public/index.html', 'utf8');

const urls = [];
const srcRegex = /(?:src|href)=["']([^"']+)["']/g;
let match;
while ((match = srcRegex.exec(html)) !== null) {
  const u = match[1];
  if (!u.startsWith('http') && !u.startsWith('#') && !u.startsWith('mailto:') && !u.startsWith('tel:') && !u.startsWith('data:')) {
    urls.push(u.split('?')[0]);
  }
}

const uniqueUrls = [...new Set(urls)];
console.log('Auditing', uniqueUrls.length, 'local assets referenced in index.html...');

const missing = [];
for (const u of uniqueUrls) {
  if (['/solutions', '/approach', '/nova', '/architecture', '/roi', '/team', '/privacy', '/', ''].includes(u)) continue;
  const rel = u.startsWith('/') ? u.slice(1) : u;
  const inPublic = fs.existsSync(path.join('public', rel));
  const inRoot = fs.existsSync(rel);
  if (!inPublic && !inRoot) {
    missing.push(u);
  }
}

console.log('Missing assets on disk:', missing);
if (missing.length === 0) {
  console.log('PERFECT: Every single asset referenced in index.html exists on disk!');
}
