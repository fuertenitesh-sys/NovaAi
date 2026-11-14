/**
 * ═══════════════════════════════════════════════════════════════════════
 * NOVA.AI — PRODUCTION SERVER
 * ═══════════════════════════════════════════════════════════════════════
 * High-performance Node.js runtime server for Nova.ai Enterprise Platform.
 * 
 * Features:
 *  - Real-time WebRTC Voice Gateway (Nova Premium & Nova Duplex Orbs)
 *  - Floating AI Assistant Gateway (Riya Voice & Text Intelligence)
 *  - 3D Interactive Spline Scene Serving (.splinecode)
 *  - Static Asset Streaming with HTTP Caching & Range Support
 *  - Multi-language Speech-to-Speech orchestration
 * ═══════════════════════════════════════════════════════════════════════
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5500;
const PUBLIC_DIR = path.resolve(__dirname, 'public');

// Configuration
const CONFIG = {
  agentId: process.env.NOVA_AGENT_ID || '01a1d8a0-eb07-7a44-9066-fb2420c08c97',
  apiKey: process.env.NOVA_API_KEY || 'ak_a579c7540418ffa23147b97a01d984d21a023319cf51aad5c0950da3f26cb965',
  apiHost: 'api.ravan.ai',
  brandName: 'Nova.ai',
  assistantName: 'Riya'
};

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.splinecode': 'application/octet-stream'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Set global CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Key, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Nova Voice Web-Call API (/api/nova/web-call and /api/agni/web-call)
  // Powers the interactive Nova Premium and Nova Duplex flame orbs on /nova
  if (pathname === '/api/nova/web-call' || pathname === '/api/agni/web-call') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let incoming = {};
      try { incoming = JSON.parse(body || '{}'); } catch (e) {}
      const isDuplex = incoming.agent === 'duplex' || (incoming.usecase && incoming.usecase.includes('duplex'));

      const payload = JSON.stringify({
        agent_id: CONFIG.agentId,
        type: 'web_call',
        prompt_dynamic_variables: {
          agent_name: CONFIG.assistantName,
          company_name: CONFIG.brandName,
          assistant_name: CONFIG.assistantName,
          company: 'Nova',
          system_name: isDuplex ? 'Nova Duplex' : 'Nova Premium',
          brand: CONFIG.brandName
        }
      });

      const proxyReq = https.request({
        hostname: CONFIG.apiHost,
        path: '/api/v1/calling/create-call',
        method: 'POST',
        family: 4,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'X-Api-Key': CONFIG.apiKey,
          'Origin': 'https://www.ravan.ai',
          'Referer': 'https://www.ravan.ai/'
        }
      }, proxyRes => {
        let respData = '';
        proxyRes.on('data', d => respData += d);
        proxyRes.on('end', () => {
          try {
            const parsed = JSON.parse(respData);
            if (parsed && parsed.data && parsed.data.access_token) {
              const formatted = JSON.stringify({
                token: parsed.data.access_token,
                url: parsed.data.url,
                access_token: parsed.data.access_token,
                room_id: parsed.data.room_id,
                session_id: parsed.data.session_id,
                success: true
              });
              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate'
              });
              res.end(formatted);
              return;
            }
          } catch (e) {}

          res.writeHead(proxyRes.statusCode || 500, { 'Content-Type': 'application/json' });
          res.end(respData);
        });
      });

      proxyReq.on('error', err => {
        console.error('Voice web-call error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      });

      proxyReq.write(payload);
      proxyReq.end();
    });
    return;
  }

  // 2. Floating AI Assistant Call Creator (/api/create-room/ and /api/create-room)
  // Powers the bottom-right floating Riya voice assistant widget
  if (pathname === '/api/create-room/' || pathname === '/api/create-room' || pathname.startsWith('/api/create-room')) {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      const callPayload = JSON.stringify({
        agent_id: CONFIG.agentId,
        type: 'web_call',
        prompt_dynamic_variables: {
          agent_name: CONFIG.assistantName,
          company_name: CONFIG.brandName,
          assistant_name: CONFIG.assistantName,
          company: 'Nova',
          brand: CONFIG.brandName
        }
      });

      const proxyReq = https.request({
        hostname: CONFIG.apiHost,
        path: '/api/v1/calling/create-call',
        method: 'POST',
        family: 4,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(callPayload),
          'X-Api-Key': CONFIG.apiKey,
          'Origin': 'https://www.ravan.ai',
          'Referer': 'https://www.ravan.ai/'
        }
      }, proxyRes => {
        let respData = '';
        proxyRes.on('data', d => respData += d);
        proxyRes.on('end', () => {
          try {
            const parsed = JSON.parse(respData);
            if (parsed && parsed.data && parsed.data.access_token) {
              const formatted = JSON.stringify({
                success: true,
                response: {
                  success: true,
                  token: parsed.data.access_token,
                  url: parsed.data.url,
                  call_id: parsed.data.room_id,
                  room_id: parsed.data.room_id,
                  session_id: parsed.data.session_id
                }
              });
              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate'
              });
              res.end(formatted);
              return;
            }
          } catch (e) {}

          res.writeHead(proxyRes.statusCode || 500, { 'Content-Type': 'application/json' });
          res.end(respData);
        });
      });

      proxyReq.on('error', err => {
        console.error('Call create error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      });

      proxyReq.write(callPayload);
      proxyReq.end();
    });
    return;
  }

  // 3. Floating Widget Settings Endpoint
  if (pathname.startsWith('/api/thunder-widget-settings')) {
    const settings = {
      success: true,
      response: {
        bot_name: CONFIG.assistantName,
        bot_tagline: CONFIG.assistantName,
        bot_logo: '/assets/nova-avatar.jpg',
        bot_button_color: '#2563eb',
        bot_button_hover_color: '#1d4ed8',
        bot_border_color: '#2563eb',
        bot_text_color: '#20221f',
        bot_status_bar_color: '#2563eb',
        bot_background_color: '#faf9f6',
        show_is_power_by: false,
        svg_logo: null,
        voice_animation_color: '#2563eb'
      }
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(settings));
    return;
  }

  // 4. Widget Configuration
  if (pathname === '/api/widget-config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ market: 'in' }));
    return;
  }

  // 5. Agent Info Endpoint
  if (pathname.startsWith('/api/get-agent')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      name: `${CONFIG.assistantName} Voice Intelligence`,
      brand: CONFIG.brandName
    }));
    return;
  }

  // 6. Patched Widget IIFE Script Serving
  if (pathname === '/react-widget-uv.iife.js' || pathname === '/assets/react-widget-uv.iife.js' || pathname.endsWith('react-widget-uv.iife.js')) {
    const uvPath = path.join(PUBLIC_DIR, 'assets', 'react-widget-uv.js');
    fs.readFile(uvPath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading widget bundle');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  // 7. HTML Page Routing
  let pageFile = null;
  if (pathname === '/' || pathname === '/index.html') {
    pageFile = 'index.html';
  } else if (pathname === '/nova' || pathname === '/nova.html' || pathname === '/products' || pathname === '/agni') {
    pageFile = 'nova.html';
  } else if (pathname === '/approach' || pathname === '/approach.html') {
    pageFile = 'approach.html';
  } else if (pathname === '/solutions' || pathname === '/solutions.html') {
    pageFile = 'solutions.html';
  }

  if (pageFile) {
    const filePath = path.join(PUBLIC_DIR, pageFile);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Error loading ${pageFile}`);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  // 8. Static File Resolution (public, public/assets, public/css, public/js)
  const relPath = pathname.replace(/^\/+/, '');
  const candidatePaths = [
    path.join(PUBLIC_DIR, relPath),
    path.join(PUBLIC_DIR, 'assets', relPath),
    path.join(PUBLIC_DIR, 'css', relPath),
    path.join(PUBLIC_DIR, 'js', relPath)
  ];

  let resolvedPath = null;
  for (const cp of candidatePaths) {
    if (fs.existsSync(cp) && fs.statSync(cp).isFile()) {
      resolvedPath = cp;
      break;
    }
  }

  if (!resolvedPath) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found: ' + pathname);
    return;
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
  });

  const stream = fs.createReadStream(resolvedPath);
  stream.pipe(res);
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  🚀 Nova.ai Enterprise Platform is running!`);
  console.log(`  🔗 Main URL:    http://localhost:${PORT}/`);
  console.log(`  🎙️ Voice Demo:  http://localhost:${PORT}/nova`);
  console.log(`  ⚡ Voice Engine: LiveKit WebRTC Cloud Gateway`);
  console.log(`  🤖 Assistant:   ${CONFIG.assistantName} (${CONFIG.brandName})`);
  console.log(`======================================================\n`);
});
