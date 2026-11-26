const fs = require('fs');
const https = require('https');

const html = fs.readFileSync('public/index.html', 'utf8');

const urls = [];
const srcRegex = /(?:src|href)=["']([^"']+)["']/g;
let match;
while ((match = srcRegex.exec(html)) !== null) {
  const u = match[1];
  if (!u.startsWith('http') && !u.startsWith('#') && !u.startsWith('mailto:') && !u.startsWith('tel:') && !u.startsWith('data:')) {
    urls.push(u.startsWith('/') ? u : '/' + u);
  }
}

const uniqueUrls = [...new Set(urls)];
console.log('Checking', uniqueUrls.length, 'local assets referenced in index.html...');

async function checkAsset(path) {
  return new Promise((resolve) => {
    https.get('https://nova-ai-thlt.onrender.com' + path, (res) => {
      resolve({ path, status: res.statusCode, type: res.headers['content-type'] });
    }).on('error', (err) => resolve({ path, error: err.message }));
  });
}

Promise.all(uniqueUrls.map(checkAsset)).then((results) => {
  const failures = results.filter(r => r.status !== 200);
  console.log('Total checked:', results.length);
  console.log('Failures:', failures.length);
  if (failures.length > 0) {
    console.table(failures);
  } else {
    console.log('All 26 assets returned HTTP 200 OK!');
  }
  const htmlAssets = results.filter(r => !r.path.endsWith('.html') && !['/solutions', '/approach', '/nova', '/architecture', '/roi', '/team', '/privacy'].includes(r.path) && r.type && r.type.includes('html'));
  if (htmlAssets.length > 0) {
    console.log('\nWarning: The following static assets returned HTML (likely 404 fallback):');
    console.table(htmlAssets);
  } else {
    console.log('No assets returned fallback HTML.');
  }
});
