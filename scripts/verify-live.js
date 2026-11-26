const https = require('https');

async function fetchUrl(url, options = {}) {
  const start = Date.now();
  return new Promise((resolve) => {
    const req = https.request(url, options, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        resolve({
          url,
          status: res.statusCode,
          duration: Date.now() - start,
          headers: res.headers,
          body: buffer.toString('utf8'),
          raw: buffer
        });
      });
    });
    req.on('error', (err) => {
      resolve({ url, error: err.message, duration: Date.now() - start });
    });
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function run() {
  console.log('--- STARTING LIVE AUDIT ON https://nova-ai-thlt.onrender.com ---');

  // 1. Pages
  const pages = ['/', '/nova', '/solutions', '/approach', '/architecture', '/roi', '/team', '/privacy'];
  console.log('\n1. Testing Page Routes:');
  for (const p of pages) {
    const res = await fetchUrl('https://nova-ai-thlt.onrender.com' + p);
    console.log(`  [${res.status}] ${p} (${res.duration}ms) - Cache: ${res.headers['cache-control'] || 'none'}`);
  }

  // 2. Widget JS UTF-8 check
  console.log('\n2. Testing nova-widget.js integrity:');
  const widgetRes = await fetchUrl('https://nova-ai-thlt.onrender.com/nova-widget.js');
  const isUtf16BOM = widgetRes.raw[0] === 0xff && widgetRes.raw[1] === 0xfe;
  console.log(`  Status: ${widgetRes.status}, Size: ${widgetRes.raw.length} bytes, Duration: ${widgetRes.duration}ms`);
  console.log(`  Has UTF-16 BOM: ${isUtf16BOM} (Should be false)`);
  console.log(`  First 30 characters: "${widgetRes.body.slice(0, 30).replace(/\r?\n/g, ' ')}"`);

  // 3. Check for dead video reference in HTML
  console.log('\n3. Checking for dead assets in homepage HTML:');
  const homeRes = await fetchUrl('https://nova-ai-thlt.onrender.com/');
  const hasDeadVideo = homeRes.body.includes('industry-excerpt.mp4');
  console.log(`  Contains industry-excerpt.mp4: ${hasDeadVideo} (Should be false)`);

  // 4. API Endpoints
  console.log('\n4. Testing API endpoints:');
  const apis = ['/api/widget-config', '/api/thunder-widget-settings', '/api/get-agent'];
  for (const a of apis) {
    const res = await fetchUrl('https://nova-ai-thlt.onrender.com' + a);
    console.log(`  [${res.status}] ${a} (${res.duration}ms) - Cache: ${res.headers['cache-control'] || 'none'}`);
  }

  console.log('\n--- AUDIT COMPLETE ---');
}

run();
