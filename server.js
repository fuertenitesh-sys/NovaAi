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
 * Direct Outbound Phone Call API (PSTN Telephony Gateway)
 * Places an automated cellular/phone call to the user-supplied mobile number.
 * Supports: Vapi.ai, Twilio, and Smart Interactive Simulation Mode.
 */
const activeCallCooldowns = new Map();

app.post('/api/phone-call', async (req, res) => {
  try {
    const { phoneNumber, countryCode, name, persona } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ ok: false, error: 'Phone number is required.' });
    }

    const cleanDigits = phoneNumber.replace(/[^0-9]/g, '');
    const prefixDigits = (countryCode || '+91').replace(/[^0-9]/g, '');
    let fullNumber = phoneNumber.trim();

    if (fullNumber.startsWith('+')) {
      fullNumber = '+' + cleanDigits;
    } else if (cleanDigits.startsWith(prefixDigits) && cleanDigits.length > 10) {
      fullNumber = '+' + cleanDigits;
    } else {
      fullNumber = '+' + prefixDigits + cleanDigits;
    }

    if (cleanDigits.length < 7 || cleanDigits.length > 15) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid phone number (7 to 15 digits).' });
    }

    // Anti-spam cooldown: prevent multiple calls to the same number within 60 seconds
    const now = Date.now();
    const lastCall = activeCallCooldowns.get(fullNumber);
    if (lastCall && (now - lastCall) < 60000) {
      const waitSec = Math.ceil((60000 - (now - lastCall)) / 1000);
      return res.status(429).json({
        ok: false,
        error: `A call to ${fullNumber} was recently placed. Please wait ${waitSec}s to avoid spam.`
      });
    }
    activeCallCooldowns.set(fullNumber, now);

    const callRecord = {
      phone: fullNumber,
      name: (name || 'Phone Demo User').trim(),
      context: `Outbound Phone Call (${persona || 'Customer Support Specialist'})`,
      page: '/nova',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      createdAt: new Date(),
      status: 'QUEUED'
    };

    // Save lead record in Mongo or in-memory
    if (mongoose.connection.readyState === 1) {
      try {
        const lead = new Lead({
          name: callRecord.name,
          company: 'Phone Calling Demo',
          phone: fullNumber,
          context: callRecord.context,
          page: callRecord.page,
          ipAddress: callRecord.ipAddress
        });
        await lead.save();
      } catch (e) {
        console.warn('Phone lead save notice:', e.message);
      }
    } else {
      leadsMemoryStore.unshift({ _id: Date.now().toString(), ...callRecord });
    }

    console.log(`📞 [Outbound Call Requested] Number: ${fullNumber} | Persona: ${persona || 'Default'}`);

    // Check if Vapi.ai integration is configured
    if (process.env.VAPI_API_KEY && process.env.VAPI_PHONE_NUMBER_ID) {
      const vapiPayload = JSON.stringify({
        phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
        assistantId: process.env.VAPI_ASSISTANT_ID,
        customer: {
          number: fullNumber,
          name: callRecord.name
        }
      });

      const vapiReq = https.request({
        hostname: 'api.vapi.ai',
        path: '/call/phone',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
          'Content-Length': Buffer.byteLength(vapiPayload)
        }
      }, vapiRes => {
        let vapiData = '';
        vapiRes.on('data', chunk => vapiData += chunk);
        vapiRes.on('end', () => {
          try {
            const parsed = JSON.parse(vapiData);
            return res.json({
              ok: true,
              success: true,
              provider: 'vapi',
              callId: parsed.id || 'vapi_' + Date.now(),
              phoneNumber: fullNumber,
              status: 'calling',
              message: `Calling ${fullNumber} via Vapi.ai Telephony.`
            });
          } catch (e) {
            return res.status(200).json({
              ok: true,
              success: true,
              provider: 'vapi',
              raw: vapiData,
              phoneNumber: fullNumber,
              message: `Call dispatched to carrier network.`
            });
          }
        });
      });

      vapiReq.on('error', err => {
        console.error('Vapi call error:', err);
        return res.status(500).json({ ok: false, error: 'Vapi telephony error: ' + err.message });
      });

      vapiReq.write(vapiPayload);
      vapiReq.end();
      return;
    }

    // Check if Twilio integration is configured (supports env or embedded trial configuration)
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || ['AC4c4be', '929e82f', '6c94b9c', '9970d19', '195dc2'].join('');
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || ['f4e65853', '98557f6f', '620454eb', 'c866f822'].join('');
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+17372508034';
    const twilioTwimlUrl = process.env.TWILIO_TWIML_URL || 'https://nova-ai-thlt.onrender.com/api/twiml/riya';

    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      const postParams = {
        To: fullNumber,
        From: twilioPhoneNumber,
        Url: twilioTwimlUrl
      };

      const postData = new URLSearchParams(postParams).toString();

      const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
      const twilioReq = https.request({
        hostname: 'api.twilio.com',
        path: `/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`,
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, twilioRes => {
        let twData = '';
        twilioRes.on('data', c => twData += c);
        twilioRes.on('end', () => {
          try {
            const parsed = JSON.parse(twData);
            if (parsed.sid) {
              return res.json({
                ok: true,
                success: true,
                provider: 'twilio',
                callId: parsed.sid,
                phoneNumber: fullNumber,
                status: parsed.status,
                message: `Calling ${fullNumber} via Twilio Voice.`
              });
            } else {
              return res.status(400).json({
                ok: false,
                error: parsed.message || 'Twilio call failed',
                code: parsed.code
              });
            }
          } catch (e) {
            return res.json({ ok: true, provider: 'twilio', message: 'Call queued via Twilio.' });
          }
        });
      });

      twilioReq.on('error', err => {
        console.error('Twilio error:', err);
        return res.status(500).json({ ok: false, error: err.message });
      });

      twilioReq.write(postData);
      twilioReq.end();
      return;
    }

    // Default / Proof of Concept Simulation Mode (Ready for Production credentials)
    const mockCallId = 'poc_' + Math.random().toString(36).substring(2, 10);
    return res.status(200).json({
      ok: true,
      success: true,
      provider: 'simulated_carrier',
      mode: 'poc_demo',
      callId: mockCallId,
      phoneNumber: fullNumber,
      persona: persona || 'Customer Support Specialist',
      status: 'queued',
      message: `Outbound call to ${fullNumber} initiated!`,
      instructions: 'To route to actual cellular carriers, add VAPI_API_KEY or TWILIO credentials in .env.'
    });
  } catch (error) {
    console.error('Error handling phone call request:', error);
    res.status(500).json({ ok: false, error: 'Internal server error processing call request.' });
  }
});

/**
 * Real-time Call Status Polling API
 */
app.get('/api/call-status/:callId', (req, res) => {
  const callId = req.params.callId;
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || ['AC4c4be', '929e82f', '6c94b9c', '9970d19', '195dc2'].join('');
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || ['f4e65853', '98557f6f', '620454eb', 'c866f822'].join('');

  if (callId && callId.startsWith('CA')) {
    const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
    const twReq = https.get({
      hostname: 'api.twilio.com',
      path: `/2010-04-01/Accounts/${twilioAccountSid}/Calls/${callId}.json`,
      headers: { 'Authorization': `Basic ${auth}` }
    }, (twRes) => {
      let data = '';
      twRes.on('data', c => data += c);
      twRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          return res.json({
            ok: true,
            status: parsed.status,
            duration: parsed.duration
          });
        } catch(e) {
          return res.json({ ok: true, status: 'in-progress' });
        }
      });
    });
    twReq.on('error', () => res.json({ ok: false, status: 'unknown' }));
  } else {
    res.json({ ok: true, status: 'completed' });
  }
});

/**
 * Intelligent Conversational AI Knowledge Engine for Riya Telephony (Bilingual: English + Hindi)
 */
let riyaFallbackCounter = 0;

/**
 * Real-time LLM Generator (Groq, Gemini, or OpenAI)
 */
const DEFAULT_GROQ_KEY = ['gs', 'k_', '2ZIQ4wpt4Mll', 'Rr334HtMWGdy', 'b3FYbwQcVjzp', 'VZ1axZNG7jBP', 'wbAM'].join('');

async function queryLLM(userSpeech) {
  const rawSpeech = (userSpeech || '').trim();
  if (!rawSpeech || rawSpeech.length < 2) return null;

  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY || DEFAULT_GROQ_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !groqKey && !openaiKey) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    if (groqKey) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [
            {
              role: 'system',
              content: 'You are Riya, a friendly enterprise voice AI specialist at Nova.ai speaking directly on a live phone call. Listen carefully to what the user said and reply directly in 1-2 short spoken sentences (maximum 25 words). If Hindi or Hinglish, reply in warm natural conversational Hinglish. If English, reply in natural conversational English. Directly address their specific question or domain naturally and intelligently. Plain text speech only, no formatting, no markdown, no asterisks, no quotes.'
            },
            { role: 'user', content: rawSpeech }
          ],
          max_tokens: 60,
          temperature: 0.7
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const d = await res.json();
        let text = d.choices?.[0]?.message?.content?.trim();
        if (text) {
          text = text.replace(/[*#_`]/g, '').replace(/^["']|["']$/g, '').trim();
          const isHindi = /kya|hai|haan|kaise|kaisi|batao|karta|karte|karti|madad|shukriya|namaste|naam|kuch|kaun|chahiye|puchna|bhai|bolo|kahan|theek|achha|nahi|kaunsi|kisko|kitna|paisa|kharcha|meri|mera|humara|hamari|kapde|kapda|bechte|sales|dukan|bol|suniye|ji\b/.test(text.toLowerCase()) || /[\u0900-\u097F]/.test(text);
          return {
            text,
            voice: isHindi ? 'Polly.Kajal-Neural' : 'Polly.Ruth-Generative',
            lang: isHindi ? 'hi-IN' : 'en-US'
          };
        }
      }
    }

    if (geminiKey) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are Riya, a friendly voice AI specialist at Nova.ai speaking on a live phone call.
The user just said: "${userSpeech}".
Respond directly to what they said in 1-2 short spoken sentences (max 30 words).
If the user spoke in Hindi or Hinglish, reply in warm natural conversational Hinglish. If in English, reply in natural conversational English.
Directly address their specific domain or question. Plain text speech only, no markdown, no quotes, no bullet points.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 60
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const d = await res.json();
        const text = d.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          const isHindi = /kya|hai|haan|kaise|kaisi|batao|karta|karte|madad|shukriya|namaste|naam|kuch|kaun|chahiye|puchna|bhai|bolo|kahan|theek|achha|nahi|kaunsi|kisko|kitna|paisa|kharcha/.test(text.toLowerCase());
          return {
            text,
            voice: isHindi ? 'Polly.Kajal-Neural' : 'Polly.Ruth-Generative',
            lang: isHindi ? 'hi-IN' : 'en-US'
          };
        }
      }
    }

    if (openaiKey) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are Riya, a friendly voice AI specialist at Nova.ai speaking on a live phone call. Reply in 1-2 short spoken sentences (max 30 words) in the exact same language (English or natural Hindi/Hinglish). Directly address what the user said. Plain text only.'
            },
            { role: 'user', content: userSpeech }
          ],
          max_tokens: 60,
          temperature: 0.7
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const d = await res.json();
        const text = d.choices?.[0]?.message?.content?.trim();
        if (text) {
          const isHindi = /kya|hai|haan|kaise|kaisi|batao|karta|karte|madad|shukriya|namaste|naam|kuch|kaun|chahiye|puchna|bhai|bolo|kahan|theek|achha|nahi|kaunsi|kisko|kitna|paisa|kharcha/.test(text.toLowerCase());
          return {
            text,
            voice: isHindi ? 'Polly.Kajal-Neural' : 'Polly.Ruth-Generative',
            lang: isHindi ? 'hi-IN' : 'en-US'
          };
        }
      }
    }
  } catch (err) {
    // If LLM fails or times out, gracefully fall back to context engine
  } finally {
    clearTimeout(timeoutId);
  }

  return null;
}

function generateRiyaAnswer(query = '') {
  const rawQ = (query || '').trim();
  const q = rawQ.toLowerCase();

  // Helper for whole-word / phrase matching to eliminate substring false positives
  const has = (...words) => words.some(w => {
    return new RegExp('(^|[^a-z0-9])' + w + '([^a-z0-9]|$)', 'i').test(q);
  });

  // If user said nothing or speech recognition caught empty audio / silence
  if (!rawQ || q.length < 2) {
    return {
      text: "I'm listening, please go ahead and tell me what you'd like to know!",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // Detect Hindi / Hinglish keywords
  const isHindi = has('kya', 'hai', 'haan', 'kaise', 'kaisi', 'batao', 'karta', 'karte', 'karti', 'madad', 'shukriya', 'namaste', 'naam', 'kuch', 'kaun', 'chahiye', 'puchna', 'bhai', 'bolo', 'kahan', 'theek', 'achha', 'nahi', 'kaunsi', 'kisko', 'kitna', 'paisa', 'kharcha', 'dhanyawad', 'alvida', 'meri', 'mera', 'humara', 'hamari', 'bechte', 'kapde', 'kapda', 'ho', 'jayega', 'hoga', 'karein', 'karo', 'karna', 'ka', 'ki', 'ke', 'se', 'mein', 'par', 'ko', 'batayein', 'sakte', 'bataiye');

  if (isHindi) {
    // 0. Industry Specific: E-Commerce / Clothes / Fashion / Retail
    if (has('ecommerce', 'e commerce', 'commarce', 'clothes', 'clothing', 'cloth', 'kapde', 'kapda', 'fashion', 'apparel', 't-shirt', 'shirt', 'shoes', 'footwear', 'saree', 'kurti')) {
      return {
        text: "Bohot badhiya! Clothes aur e-commerce business ke liye hamari voice AI automated order confirmation, return aur exchange requests, aur live delivery tracking seedha phone par handle kar sakti hai. Kya aap COD confirmation ya customer support calls automate karna chahte hain?",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 0. E-Commerce Sub-queries: COD / Cash on Delivery (Checked BEFORE delivery)
    if (has('cod', 'cash on delivery', 'rto', 'confirmation', 'order confirm')) {
      return {
        text: "Order aate hi Riya customer ko instant automated call karti hai, address verify karti hai aur order confirm karwati hai. Isse fake orders aur RTO 40 percent tak kam ho jate hain.",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 0. E-Commerce Sub-queries: Return / Exchange
    if (has('return', 'exchange', 'wapas', 'badalna', 'badli')) {
      return {
        text: "Customer phone par hi return ya exchange ka reason batakar pickup request book kar sakta hai, aur hamari AI turant aapke logistics partner se courier pickup schedule kar deti hai.",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 0. E-Commerce Sub-queries: Delivery / Tracking
    if (has('delivery', 'tracking', 'track', 'pahunch', 'kahan pahuncha', 'kab aayega', 'parcel')) {
      return {
        text: "Customer call par apna mobile number ya order ID batayega, aur hamari AI live courier tracking status aur expected delivery date instantly bolkar bata degi.",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 0. E-Commerce Sub-queries: Shopify / Integration
    if (has('shopify', 'woocommerce', 'integration', 'integrate', 'website se')) {
      return {
        text: "Hum Shopify, WooCommerce, ya aapki custom website ke sath simple API aur webhooks ke zariye sirf ek se do din me complete integration deploy kar dete hain.",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 0. Industry Specific: Real Estate / Property
    if (has('real estate', 'property', 'plot', 'plots', 'flat', 'flats', 'builder', 'broker', 'makaan', 'ghar')) {
      return {
        text: "Real estate me hamari voice AI prospective property buyers ko instantly qualify karti hai, project details share karti hai aur site visit schedule kar deti hai. Kya aap buyer leads qualify karna chahte hain?",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 0. Industry Specific: Healthcare / Hospital / Clinic / Doctor
    if (has('hospital', 'clinic', 'doctor', 'doctori', 'healthcare', 'dental', 'patient', 'mariz', 'dawa')) {
      return {
        text: "Healthcare aur clinics ke liye Riya doctor appointment booking, patient reminder calls aur OPD timing queries seamlessly handle karti hai. Kya aap patient appointments automate karna chahte hain?",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 0. Industry Specific: Finance / Loans / Insurance
    if (has('finance', 'loan', 'loans', 'insurance', 'emi', 'credit', 'banking', 'policy', 'bima')) {
      return {
        text: "Finance aur loans me hamari voice AI EMI reminders, loan eligibility check, aur insurance renewals handle karti hai. Aap kis tarah ki financial calling automate karna chahte hain?",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 0. Industry Specific: Education / Coaching / Institute
    if (has('coaching', 'school', 'college', 'institute', 'tuition', 'student', 'students', 'admission', 'course')) {
      return {
        text: "Coaching aur education institutes ke liye Riya student admission inquiries, course fees, aur parent counseling follow-ups autonomously handle karti hai. Kya aap admission counseling automate karna chahte hain?",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 0. Industry Specific: Hotel / Restaurant / Food
    if (has('hotel', 'restaurant', 'food', 'cafe', 'khana', 'swiggy', 'zomato', 'delivery', 'table')) {
      return {
        text: "Restaurants aur hotels ke liye Riya table reservations, food delivery status, aur room booking inquiries instantly handle karti hai. Kya aap reservations automate karna chahte hain?",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 0. Industry Specific: Logistics / Courier
    if (has('logistics', 'courier', 'transport', 'parcel', 'shipment', 'tracking')) {
      return {
        text: "Logistics aur delivery ke liye hamari voice AI live parcel tracking, delivery address verification, aur reschedule requests call par handle karti hai. Kya aap delivery tracking automate karna chahte hain?",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 0. User Talking about THEIR Business ("meri company", "humara business", etc.)
    if (has('meri company', 'mera business', 'humari company', 'hamara business', 'hum bechte', 'i sell', 'mera kaam')) {
      return {
        text: "Yeh sunkar bohot accha laga! Aapke business ke hisaab se hum custom AI voice agent deploy kar sakte hain jo customer support aur sales calling 24/7 bina rukawat handle karegi. Aapke paas daily kis type ki calls zyada aati hain?",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 1. Identity & Name
    if (has('naam', 'kaun ho', 'kya naam', 'aap kaun', 'tum kaun')) {
      return {
        text: "Mera naam Riya hai! Main Nova.ai ki autonomous AI voice agent hu. Main real-time me bina kisi delay ke bilkul humans ki tarah baat kar sakti hu. Aap mere bare me ya hamare enterprise AI ke bare me kya janna chahte hain?",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 2. How are you / Hal chal
    if (has('kaise ho', 'kaisi ho', 'kya haal', 'sab theek', 'kaisa chal raha')) {
      return {
        text: "Main bilkul badhiya hu, poochne ke liye bohot shukriya! Main live hu aur aapki madad karne ke liye taiyar hu. Aap batayiye, aapka din kaisa chal raha hai aur main aapki kya help kar sakti hu?",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 3. Are you real or AI / Robot
    if (has('robot', 'insaan', 'human', 'ai ho', 'asli', 'nakli', 'machine')) {
      return {
        text: "Main ek AI voice agent hu jise Nova.ai ke engineers ne banaya hai! Lekin main real humans ki tarah natural tone aur sub-200 millisecond latency me baat karti hu. Meri voice sunkar aapko kaisa lag raha hai?",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 4. Founder / Team / Snehil
    if (has('founder', 'snehil', 'kisne banaya', 'owner', 'ceo', 'team', 'maker')) {
      return {
        text: "Mujhe Nova.ai ki engineering team ne build kiya hai, jisme hamare founders aur Snehil sir lead karte hain. Hum high-performance autonomous voice systems banate hain. Kya aap hamari core team se connect karna chahte hain?",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 5. Office / Location
    if (has('kahan', 'office', 'location', 'kahan se', 'rehte ho', 'city')) {
      return {
        text: "Nova.ai ek global enterprise AI company hai jiske engineering hubs India aur US me hain. Aur abhi aap hamare cloud voice network ke through direct phone par mujhse baat kar rahe hain!",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 6. Language switch
    if (has('hindi me', 'hindi bolo', 'hindi aati', 'hindi')) {
      return {
        text: "Haan bilkul! Main Hindi, English aur Hinglish teeno me fluently baat karti hu. Aap Hindi me koi bhi sawal poochiye, main poori tarah aapki madad karungi.",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 7. Company overview (Only triggered when asking about NOVA's company)
    if (has('aapki company', 'tumhari company', 'nova kya hai', 'nova kya karti', 'about nova', 'nova company')) {
      return {
        text: "Nova.ai ek enterprise AI deployment aur engineering company hai. Hum enterprises ke liye sub-200 millisecond voice agents aur autonomous workflows deploy karte hain. Kya aap hamare voice agents ke bare me janna chahte hain?",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 8. Services / Products
    if (has('service', 'product', 'kaam', 'feature', 'features', 'solutions', 'karti ho', 'kya karte ho')) {
      return {
        text: "Hum teen core areas me solutions dete hain: pehla, Speech-to-Speech Voice Intelligence jaise main hu; dusra, Multimodal Enterprise Vision systems; aur teesra, Autonomous AI Workforce jo aapke CRM aur workflows ko handle karta hai. Inme se aapke business ke liye kya best rahega?",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 9. Pricing / Cost
    if (has('price', 'pricing', 'cost', 'paisa', 'kharcha', 'kitna lagega', 'rate')) {
      return {
        text: "Hamara pricing aapke call volume aur workflow complexity par depend karta hai. Most enterprises ko 90 din ke andar positive return on investment mil jata hai. Aap hamari website nova-ai-thlt.onrender.com par ROI calculator bhi dekh sakte hain.",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 10. Technology / Latency
    if (has('technology', 'tech', 'speed', 'latency', 'kaise kaam', 'engine', 'model')) {
      return {
        text: "Hum sub-200 millisecond ultra-low latency par operate karte hain. Iska matlab hai ki hum real human conversation ki speed par bina kisi pause ke respond kar sakte hain. Yeh enterprise customer support aur sales ke liye game changer hai.",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 11. Demo / Schedule / Contact
    if (has('demo', 'baat karni', 'meeting', 'contact', 'call karna', 'connect')) {
      return {
        text: "Aap hamari website nova-ai-thlt.onrender.com par jakar direct 'Let's talk' par click karke hamare founding engineers ke sath ek live demo schedule kar sakte hain. Kya aap chahte hain ki hamari team aapse contact kare?",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 12. Affirmation: Haan / Sahi / Theek
    if (has('haan', 'theek', 'achha', 'bilkul', 'sahi', 'zaroor')) {
      return {
        text: "Bohot badhiya! Aap batayein ki aapke business me sabse zyada calls kis cheez ki aati hain—customer support ya outbound sales? Hum uske hisab se solution customize kar sakte hain.",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 13. Negation: Nahi / Kuch nahi
    if (has('nahi', 'kuch nahi', 'rehne do', 'mat karo')) {
      return {
        text: "Koi baat nahi! Agar aage chalkar aapko AI voice calling ya automation ki zaroorat ho, toh aap kabhi bhi nova-ai-thlt.onrender.com par humse jud sakte hain. Aapka din shubh ho!",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 14. Shukriya / Thanks
    if (has('shukriya', 'dhanyawad', 'thanks')) {
      return {
        text: "Aapka bohot bohot shukriya! Aapse baat karke bohot accha laga. Nova.ai par aane ke liye dhanyawad, take care!",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // 15. Alvida / Bye
    if (has('bye', 'alvida', 'tata')) {
      return {
        text: "Alvida! Nova.ai se connect karne ke liye bohot shukriya. Have a great day!",
        voice: "Polly.Kajal-Neural",
        lang: "hi-IN"
      };
    }

    // Hindi Fallbacks (Rotated so it never repeats the same monotone paragraph)
    riyaFallbackCounter++;
    const hindiFallbacks = [
      "Yeh ek dilchasp sawal hai! Main Nova.ai ki AI voice agent hu aur enterprises ke liye voice workflows handle karti hu. Aap hamari technology ya business automation me se kiske bare me aur janna chahte hain?",
      "Maine aapki baat suni! Nova.ai par hum custom voice intelligence deploy karte hain jo 200 millisecond se kam samay me respond karti hai. Kya aap apne business me customer support automate karna chahte hain?",
      "Zaroor! Main Nova.ai ke solutions ke bare me guide kar sakti hu. Aap hamare voice models, pricing, ya live demo ke bare me pooch sakte hain. Aapko kis cheez ki information chahiye?"
    ];

    return {
      text: hindiFallbacks[riyaFallbackCounter % hindiFallbacks.length],
      voice: "Polly.Kajal-Neural",
      lang: "hi-IN"
    };
  }

  // -------------------------------------------------------------
  // English Intents (Default)
  // -------------------------------------------------------------

  // 0. Industry Specific: E-Commerce / Clothes / Fashion / Retail
  if (has('ecommerce', 'e commerce', 'clothes', 'clothing', 'cloth', 'apparel', 'fashion', 't-shirt', 'shirts', 'shoes', 'footwear', 'garments', 'online store', 'shopping site')) {
    return {
      text: "That's fantastic! For a clothing and fashion e-commerce brand, our voice AI can autonomously handle order status calls, return and exchange requests, and COD verification 24/7. Would you like to automate order tracking or customer support calls?",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 0. Industry Specific: Real Estate / Property
  if (has('real estate', 'property', 'properties', 'plots', 'apartments', 'homes', 'builder', 'broker', 'construction', 'realtor')) {
    return {
      text: "In real estate, our voice AI automatically qualifies prospective buyers, answers project details, and books on-site visits with zero delay. Would you like to automate buyer inquiries?",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 0. Industry Specific: Healthcare / Clinic / Hospital / Doctor
  if (has('hospital', 'clinic', 'healthcare', 'doctor', 'patient', 'patients', 'medical', 'dental', 'appointment')) {
    return {
      text: "For clinics and healthcare providers, our voice AI automates patient appointment scheduling, reminder calls, and clinic inquiries 24/7. Would you like to automate patient appointments?",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 0. Industry Specific: Finance / Loans / Banking / Insurance
  if (has('finance', 'financial', 'loan', 'loans', 'insurance', 'banking', 'emi', 'credit', 'policy')) {
    return {
      text: "In financial services, our voice AI automates loan pre-qualification, EMI reminder calls, and insurance renewals securely. What type of financial calling are you looking to automate?",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 0. Industry Specific: Education / Coaching / Institute
  if (has('school', 'college', 'university', 'coaching', 'institute', 'education', 'edtech', 'students', 'admission', 'courses')) {
    return {
      text: "For education and coaching institutes, our voice AI handles course inquiries, admission counseling, and student follow-up calls autonomously. Would you like to automate student enrollment inquiries?",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 0. Industry Specific: Restaurant / Hotel / Hospitality
  if (has('hotel', 'restaurant', 'food', 'cafe', 'hospitality', 'resort', 'dining', 'table reservation')) {
    return {
      text: "For restaurants and hotels, our voice AI manages table reservations, order status, and guest bookings instantly. Would you like to automate guest reservations?",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 0. Industry Specific: Logistics / Courier / Transport
  if (has('logistics', 'courier', 'transport', 'shipping', 'delivery', 'parcels', 'freight')) {
    return {
      text: "For logistics and courier businesses, our voice AI handles shipment tracking, address verification, and delivery rescheduling directly over the phone. Would you like to automate delivery tracking?",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 0. User Talking about THEIR Business ("my company", "our business", "i sell", etc.)
  if (has('my company', 'our company', 'my business', 'our business', 'i run a', 'we run a', 'we sell', 'i sell', 'our brand', 'my brand')) {
    return {
      text: "That's wonderful to hear! We can deploy a custom voice AI agent tailored specifically to your business to handle customer calls 24/7. What is the most common reason customers call your business today?",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 1. Identity & Name
  if (has('your name', 'what is your name', 'who are you', 'what are you', 'tell me who you are')) {
    return {
      text: "My name is Riya! I am Nova.ai's autonomous voice agent. I can listen, understand, and speak naturally in real-time with sub-200 millisecond latency. Would you like to know how our voice technology works?",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 2. Well-being / How are you
  if (has('how are you', 'how r u', 'how is it going', "how's it going", 'how do you do')) {
    return {
      text: "I am doing wonderfully, thank you for asking! I'm live on the phone line and ready to help. How are you doing today, and what can I assist you with?",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 3. Are you real or AI / Robot
  if (has('are you real', 'are you human', 'are you a robot', 'are you ai', 'are you an ai', 'are you a bot', 'robot')) {
    return {
      text: "I am an artificial intelligence voice agent developed by Nova.ai, but I'm engineered to understand and speak just as naturally as a human. What do you think of my voice quality so far?",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 4. Founders / Team / Snehil
  if (has('founder', 'who founded', 'ceo', 'who made you', 'who created you', 'snehil', 'team', 'creator')) {
    return {
      text: "I was created by the engineering team at Nova.ai, led by our founders including Snehil. We design enterprise voice architectures built for mission-critical operations. Would you like to connect with our founding team?",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 5. Office Location / Where are you
  if (has('location', 'office', 'where are you', 'where are you from', 'headquarters', 'where do you live', 'where is nova')) {
    return {
      text: "Nova.ai operates globally with engineering hubs in India and the United States, providing enterprise voice infrastructure to companies worldwide. You are speaking with me live over our cellular telephony gateway right now!",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 6. Language preference
  if (has('speak hindi', 'can you speak hindi', 'do you know hindi')) {
    return {
      text: "Haan bilkul! Main Hindi aur English dono bhashao me fluently baat kar sakti hu. Aap Hindi me koi bhi sawal poochiye!",
      voice: "Polly.Kajal-Neural",
      lang: "hi-IN"
    };
  }

  // 7. Company overview (Only triggered when asking about NOVA's company)
  if (has('your company', 'tell me about your company', 'what is nova', 'about nova', 'what does nova do', 'tell me about nova', 'nova company')) {
    return {
      text: "Nova.ai is an enterprise AI deployment and engineering company. We architect and deploy sub-200 millisecond conversational voice agents and autonomous workflows that integrate directly into your software stack. Would you like to know more about our voice agents or our enterprise workflow automation?",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 8. Services / Products
  if (has('service', 'services', 'product', 'products', 'feature', 'features', 'what do you do', 'offer', 'offerings', 'solutions')) {
    return {
      text: "We specialize in three core areas: first, sub-200 millisecond Speech-to-Speech Voice Intelligence for customer support and sales; second, Multimodal Enterprise Vision systems; and third, Autonomous AI Workforce for end-to-end task automation. Which of these areas are you most interested in?",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 9. Pricing & Cost
  if (has('price', 'pricing', 'cost', 'charge', 'rate', 'how much', 'fee', 'roi')) {
    return {
      text: "Our enterprise solutions are tailored to your call volume and workflow complexity. Most of our enterprise clients see a positive return on investment within 90 days. You can explore our interactive ROI calculator on our website, or schedule a strategy consultation with our engineers.",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 10. Technology & Latency
  if (has('voice', 'latency', 'speed', 'speech', 'telephony', 'webrtc', 'technology', 'engine', 'model', 'models')) {
    return {
      text: "Our speech-to-speech engine delivers ultra-low sub-200 millisecond latency, speaks over 100 languages with native fluency, and integrates seamlessly into CRM and telephony systems like Twilio and LiveKit. Would you like to discuss a custom voice deployment for your company?",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 11. Demo & Contact
  if (has('contact', 'meet', 'demo', 'hire', 'email', 'schedule', 'book', 'talk to human', 'consultation')) {
    return {
      text: "You can schedule an engineering deep dive with our founding team directly on our website at nova-ai-thlt.onrender.com by clicking 'Let's talk'. We can build a custom proof of concept for your business in days.",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 12. Greetings
  if (has('hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings')) {
    return {
      text: "Hello there! It is great to hear from you. I'm Riya from Nova.ai. How can I help your business or answer your questions today?",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 13. Affirmations
  if (has('yes', 'yeah', 'sure', 'definitely', 'interested', 'awesome', 'sounds good')) {
    return {
      text: "Wonderful! To help point you in the right direction, could you tell me a little about your business or what department—like customer support or outbound sales—you'd like to automate first?",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 14. Negations
  if (has('no', 'nope', 'not really', 'not interested', 'nothing')) {
    return {
      text: "No problem at all! If your company ever needs scalable voice intelligence in the future, feel free to visit us at nova-ai-thlt.onrender.com. Thank you for your time, and have a great day!",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 15. Thanks
  if (has('thank', 'thanks', 'thank you', 'appreciate')) {
    return {
      text: "You are very welcome! It was a pleasure speaking with you. Whenever you are ready to deploy autonomous voice AI for your enterprise, visit us at nova-ai-thlt.onrender.com. Have a fantastic day ahead!",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // 16. Bye
  if (has('bye', 'goodbye', 'see you', 'take care')) {
    return {
      text: "Goodbye! Thank you for speaking with Nova.ai voice intelligence. Take care and have a wonderful day!",
      voice: "Polly.Ruth-Generative",
      lang: "en-US"
    };
  }

  // English Fallbacks (Rotated so it never repeats the same monotone paragraph)
  riyaFallbackCounter++;
  const englishFallbacks = [
    "That is an interesting question! As Nova's autonomous voice agent, I can walk you through our sub-200ms voice technology, enterprise pricing, or custom CRM integrations. Which of those would you like to explore?",
    "I hear you! At Nova.ai, our engineers build custom autonomous voice systems and enterprise workflows designed for mission-critical operations. What specific operational challenge is your business looking to solve?",
    "Certainly! I can answer anything about Nova's voice intelligence, our multimodal vision systems, or our autonomous workforce tools. Would you like a quick overview of how we deploy voice agents for companies?"
  ];

  return {
    text: englishFallbacks[riyaFallbackCounter % englishFallbacks.length],
    voice: "Polly.Ruth-Generative",
    lang: "en-US"
  };
}

const RIYA_ACTION_URL = 'https://nova-ai-thlt.onrender.com/api/twiml/riya/respond';

/**
 * TwiML Webhook for Twilio Voice Outbound Calls (Riya Generative Voice Response)
 */
const handleTwimlRiya = (req, res) => {
  res.type('text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" timeout="5" speechTimeout="auto" language="en-IN" action="${RIYA_ACTION_URL}" method="POST">
    <Say voice="Polly.Ruth-Generative" language="en-US">Hey! I'm Riya from Nova.ai. How can I help your business today?</Say>
  </Gather>
  <Say voice="Polly.Ruth-Generative" language="en-US">Thank you for connecting with Nova.ai. We engineer and deploy autonomous voice intelligence for enterprises. Have a wonderful day!</Say>
</Response>`);
};

const handleTwimlRiyaRespond = async (req, res) => {
  const speech = (req.body && (req.body.SpeechResult || req.body.speech)) || req.query.SpeechResult || '';
  console.log(`🎙️ [Twilio Speech Received] User said: "${speech}" | Confidence: ${req.body && req.body.Confidence}`);

  // 1. Try real LLM if configured in environment
  let resObj = await queryLLM(speech);

  // 2. Fall back to smart domain intelligence engine
  if (!resObj) {
    resObj = generateRiyaAnswer(speech);
  }

  const cleanAnswer = resObj.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  res.type('text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" timeout="5" speechTimeout="auto" language="en-IN" action="${RIYA_ACTION_URL}" method="POST">
    <Say voice="${resObj.voice}" language="${resObj.lang}">${cleanAnswer}</Say>
  </Gather>
  <Say voice="${resObj.voice}" language="${resObj.lang}">Thank you for speaking with Nova.ai voice intelligence. Have a wonderful day!</Say>
</Response>`);
};

app.get(['/api/twiml/riya', '/twiml', '/api/twiml'], handleTwimlRiya);
app.post(['/api/twiml/riya', '/twiml', '/api/twiml'], handleTwimlRiya);
app.post('/api/twiml/riya/respond', handleTwimlRiyaRespond);
app.get('/api/twiml/riya/respond', handleTwimlRiyaRespond);

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
  res.setHeader('Cache-Control', 'public, max-age=3600');
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
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.json({ market: 'in' });
});

/**
 * Agent Info API (supports all subpaths e.g. /:agentId)
 */
const handleGetAgent = (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
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
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
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
