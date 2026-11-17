/**
 * ═══════════════════════════════════════════════════════════════════════
 * NOVA.AI — ENTERPRISE MERN STACK SERVER (EXPRESS + NODE + MONGODB)
 * ═══════════════════════════════════════════════════════════════════════
 * Production-ready Express.js backend powering Nova.ai Enterprise Platform.
 * 
 * Stack:
 *  - M (MongoDB): Mongoose ODM for enterprise leads, contact briefs & telemetry
 *  - E (Express.js): High-throughput REST API & WebRTC token proxies
 *  - R (React / Modern UI): Frontend Voice Studio, Dual Flame Orbs, 3D WebGL
 *  - N (Node.js): Asynchronous event-driven runtime
 * ═══════════════════════════════════════════════════════════════════════
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const https = require('https');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const Lead = require('./models/Lead');

const app = express();
const PORT = process.env.PORT || 5500;
const PUBLIC_DIR = path.resolve(__dirname, 'public');

// Global Configuration
const CONFIG = {
  agentId: process.env.NOVA_AGENT_ID || '01a1d8a0-eb07-7a44-9066-fb2420c08c97',
  apiKey: process.env.NOVA_API_KEY || 'ak_a579c7540418ffa23147b97a01d984d21a023319cf51aad5c0950da3f26cb965',
  apiHost: 'api.ravan.ai',
  brandName: 'Nova.ai',
  assistantName: 'Riya',
  mongoUri: process.env.MONGODB_URI || ''
};

// In-memory lead store fallback when MongoDB URI is not configured
const leadsMemoryStore = [];

// 1. Connect MongoDB if URI provided
if (CONFIG.mongoUri) {
  mongoose.connect(CONFIG.mongoUri)
    .then(() => console.log('🍃 [MongoDB] Connected to Cloud Cluster successfully!'))
    .catch(err => console.warn('⚠️ [MongoDB] Connection warning, using fallback store:', err.message));
} else {
  console.log('📦 [MongoDB] Running with in-memory lead store. (Set MONGODB_URI in .env to connect to Atlas)');
}

// 2. Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'X-Api-Key', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Static Asset Serving with High-Performance HTTP Caching
app.use(express.static(PUBLIC_DIR, {
  maxAge: '7d',
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.html') {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else if (['.woff2', '.woff', '.mp3', '.mp4', '.png', '.jpg', '.svg'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    } else if (['.css', '.js'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=86400');
    }
  }
}));

// ═══════════════════════════════════════════════════════════════
// REST API ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * Health Check API
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Nova.ai Enterprise MERN Server',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'IN_MEMORY_FALLBACK'
  });
});

/**
 * Enterprise Demo Request / Contact Brief API
 * Receives form submission from contact.js (#brief-dialog)
 */
app.post('/api/demo-request', async (req, res) => {
  try {
    const { name, email, company, message, context, page, website } = req.body;

    // Honeypot anti-spam check
    if (website) {
      return res.status(200).json({ ok: true });
    }

    // Validation
    if (!name || !email || !company) {
      return res.status(400).json({
        ok: false,
        code: 'validation',
        error: 'Name, work email, and company name are required.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        ok: false,
        code: 'validation',
        error: 'Please provide a valid work email address.'
      });
    }

    const leadData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company.trim(),
      message: (message || '').trim(),
      context: context || 'General Enterprise Inquiry',
      page: page || '/',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      createdAt: new Date()
    };

    let savedId = Date.now().toString();

    // Save to MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      const lead = new Lead(leadData);
      const saved = await lead.save();
      savedId = saved._id;
    } else {
      leadsMemoryStore.unshift({ _id: savedId, ...leadData });
    }

    console.log(`📩 [Lead Received] ${leadData.name} (${leadData.company}) — ${leadData.email}`);

    res.status(200).json({
      ok: true,
      id: savedId,
      message: 'Thank you! Your enterprise deployment brief has been registered.'
    });
  } catch (error) {
    console.error('Error processing demo request:', error);
    res.status(500).json({ ok: false, error: 'Internal server error processing brief.' });
  }
});

/**
 * Admin: Get All Captured Enterprise Leads
 */
app.get('/api/leads', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const leads = await Lead.find().sort({ createdAt: -1 }).limit(50);
      return res.json({ success: true, count: leads.length, leads });
    }
    res.json({ success: true, count: leadsMemoryStore.length, leads: leadsMemoryStore });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Nova Voice Web-Call API (LiveKit Cloud Gateway)
 */
const handleVoiceCall = (req, res) => {
  const incoming = req.body || {};
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
          return res.json({
            token: parsed.data.access_token,
            url: parsed.data.url,
            access_token: parsed.data.access_token,
            room_id: parsed.data.room_id,
            session_id: parsed.data.session_id,
            success: true
          });
        }
      } catch (e) {}

      res.status(proxyRes.statusCode || 500).send(respData);
    });
  });

  proxyReq.on('error', err => {
    console.error('Voice web-call error:', err);
    res.status(500).json({ error: err.message });
  });

  proxyReq.write(payload);
  proxyReq.end();
};

app.post('/api/nova/web-call', handleVoiceCall);
app.post('/api/agni/web-call', handleVoiceCall);

/**
 * Floating Riya Voice Assistant Call Creator (/api/create-room and subpaths)
 */
const handleCreateRoom = (req, res) => {
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
          return res.json({
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
        }
      } catch (e) {}

      res.status(proxyRes.statusCode || 500).send(respData);
    });
  });

  proxyReq.on('error', err => {
    console.error('Call create error:', err);
    res.status(500).json({ error: err.message });
  });

  proxyReq.write(callPayload);
  proxyReq.end();
};

app.use('/api/create-room', handleCreateRoom);

/**
 * Floating Riya Widget Settings API (supports all subpaths e.g. /:schema/:agentId)
 */
const handleWidgetSettings = (req, res) => {
  res.json({
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
  });
};

app.use('/api/thunder-widget-settings', handleWidgetSettings);

app.get('/api/widget-config', (req, res) => {
  res.json({ market: 'in' });
});

/**
 * Agent Info API (supports all subpaths e.g. /:agentId)
 */
const handleGetAgent = (req, res) => {
  res.json({
    success: true,
    name: `${CONFIG.assistantName} Voice Intelligence`,
    brand: CONFIG.brandName
  });
};

app.use('/api/get-agent', handleGetAgent);

// ═══════════════════════════════════════════════════════════════
// PAGE ROUTING
// ═══════════════════════════════════════════════════════════════
const servePage = page => (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, page));
};

app.get(['/', '/index.html'], servePage('index.html'));
app.get(['/nova', '/nova.html', '/products', '/agni'], servePage('nova.html'));
app.get(['/solutions', '/solutions.html'], servePage('solutions.html'));
app.get(['/approach', '/approach.html'], servePage('approach.html'));
app.get(['/architecture', '/architecture.html'], servePage('architecture.html'));
app.get(['/roi', '/roi.html'], servePage('roi.html'));
app.get(['/team', '/team.html'], servePage('team.html'));
app.get(['/privacy', '/privacy.html'], servePage('privacy.html'));

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  🚀 Nova.ai Enterprise MERN Stack Server Running!`);
  console.log(`  🔗 Main URL:    http://localhost:${PORT}/`);
  console.log(`  🎙️ Voice Demo:  http://localhost:${PORT}/nova`);
  console.log(`  ⚡ Voice Engine: LiveKit WebRTC Cloud Gateway`);
  console.log(`  🤖 Assistant:   ${CONFIG.assistantName} (${CONFIG.brandName})`);
  console.log(`  🍃 Database:    MongoDB / Mongoose ready`);
  console.log(`======================================================\n`);
});
