/**
 * ═══════════════════════════════════════════════════════════════
 * NOVA.AI — ENTERPRISE INTERACTIVE FUNCTIONALITY ENGINE
 * Powers:
 * 1. Hero Live Voice Sampler (1-Click Audition, Multi-Lingual, Sine Canvas Waveform)
 * 2. Real-Time Telemetry Jitter & Edge Latency Ping HUD
 * 3. Ambient Cursor Spotlight & Luxury Depth Aura
 * 4. Scroll-Triggered Metric Count-Up Animations
 * 5. Interactive Voice Demo Console (Speech Synthesis, Reactive Equalizer)
 * 6. Live Hardware Microphone Test & LED VU Meter (with graceful simulation fallback)
 * 7. Interactive Enterprise ROI Calculator with Live Sliders & Cost Modeling
 * ═══════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroVoiceSampler();
  initLiveTelemetryJitter();
  initCursorSpotlight();
  initCountUpMetrics();
  initVoiceDemoConsole();
  initMicLatencyTester();
  initEnhancedRoi();
  fixVoiceStudioLinks();
});

// 1. ENSURE ALL VOICE STUDIO BUTTONS OPEN /nova DIRECTLY
function fixVoiceStudioLinks() {
  const isPublicPrefix = window.location.pathname.startsWith('/public');
  if (isPublicPrefix) {
    document.querySelectorAll('a[href^="/"]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href.startsWith('/public') && !href.startsWith('//')) {
        a.setAttribute('href', '/public' + (href === '/' ? '' : href));
      }
    });
  }

  document.querySelectorAll('a[href="#studio"], a.btn-studio, .action-voice-studio').forEach(el => {
    if (el.textContent.toLowerCase().includes('voice studio') || el.classList.contains('primary')) {
      el.setAttribute('href', isPublicPrefix ? '/public/nova' : '/nova');
    }
  });
}

// 2. HERO LIVE VOICE SAMPLER (DIRECT AUDITION IN HERO SECTION)
function initHeroVoiceSampler() {
  const pills = document.querySelectorAll('.sampler-pill');
  const playBtn = document.getElementById('heroSamplerPlayBtn');
  const canvas = document.getElementById('heroSamplerCanvas');
  const caption = document.getElementById('heroSamplerCaption');
  if (!playBtn) return;

  let activeSample = pills[0] ? pills[0].dataset.sample : "Hello! Thanks for connecting with Nova AI. I operate at 178 milliseconds direct speech latency.";
  let activeLang = pills[0] ? pills[0].dataset.lang : "en-US";
  let isAuditioning = false;
  let waveRaf = null;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeSample = pill.dataset.sample;
      activeLang = pill.dataset.lang;
      if (caption) caption.textContent = `"${activeSample}"`;
      if (isAuditioning) {
        stopAudition();
        startAudition();
      }
    });
  });

  function startWave() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.offsetWidth || 300;
    canvas.height = 36;
    let t = 0;

    function draw() {
      if (!isAuditioning) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.strokeStyle = '#dedcd8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        return;
      }
      waveRaf = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.1;

      const mid = canvas.height / 2;
      const bars = 36;
      const step = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const amp = Math.abs(Math.sin(t + i * 0.32)) * 14 + 3;
        const x = i * step;
        ctx.fillStyle = i % 2 === 0 ? '#2563eb' : '#e0531c';
        ctx.fillRect(x + 1, mid - amp / 2, step - 2, amp);
      }
    }
    draw();
  }

  function startAudition() {
    stopAudition();
    isAuditioning = true;
    playBtn.innerHTML = `<span>■ Stop Audition</span>`;
    playBtn.classList.add('playing');
    startWave();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(activeSample);
      u.lang = activeLang;
      u.rate = 1.02;
      u.pitch = 1.02;

      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(v => v.lang.startsWith(activeLang.slice(0, 2)));
      if (match) u.voice = match;

      u.onend = stopAudition;
      u.onerror = stopAudition;

      if (caption) {
        const words = activeSample.split(' ');
        caption.innerHTML = '';
        let wordIdx = 0;
        const interval = setInterval(() => {
          if (!isAuditioning || wordIdx >= words.length) {
            clearInterval(interval);
            return;
          }
          caption.innerHTML = `"${words.slice(0, wordIdx + 1).join(' ')} <span style='color:#2563eb;'>●</span>"`;
          wordIdx++;
        }, Math.max(130, Math.floor((activeSample.length * 36) / words.length)));
      }

      window.speechSynthesis.speak(u);
    } else {
      setTimeout(stopAudition, 5000);
    }
  }

  function stopAudition() {
    isAuditioning = false;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    playBtn.innerHTML = `<svg class="play-svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M8 5v14l11-7z"/></svg> <span>Play Live Voice (178ms)</span>`;
    playBtn.classList.remove('playing');
    if (waveRaf) { cancelAnimationFrame(waveRaf); waveRaf = null; }
    if (caption) caption.textContent = `"${activeSample}"`;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.strokeStyle = '#dedcd8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  playBtn.addEventListener('click', () => {
    if (isAuditioning) stopAudition();
    else startAudition();
  });

  // Draw initial baseline
  if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.offsetWidth || 300;
    canvas.height = 36;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.strokeStyle = '#dedcd8';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

// 3. REAL-TIME TELEMETRY JITTER & EDGE PING HUD
function initLiveTelemetryJitter() {
  const pingEl = document.getElementById('heroLivePing');
  const samplerLat = document.getElementById('samplerLatency');
  if (!pingEl && !samplerLat) return;

  const latencies = [174, 178, 182, 171, 185, 176, 179];
  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % latencies.length;
    const val = latencies[idx] + 'ms';
    if (pingEl) pingEl.textContent = val;
    if (samplerLat) samplerLat.textContent = val;
  }, 2800);
}

// 4. AMBIENT CURSOR SPOTLIGHT AURA
function initCursorSpotlight() {
  let overlay = document.querySelector('.cursor-spotlight-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'cursor-spotlight-overlay';
    document.body.appendChild(overlay);
  }
  window.addEventListener('pointermove', e => {
    document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
  }, { passive: true });
}

// 5. SCROLL-TRIGGERED METRIC COUNT-UP ANIMATIONS
function initCountUpMetrics() {
  const elements = document.querySelectorAll('[data-countup]');
  if (!elements.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const el = entry.target;
      const target = parseFloat(el.dataset.countup);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const start = performance.now();

      function animate(now) {
        const progress = Math.min(1, (now - start) / duration);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = target * ease;
        el.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;
        if (progress < 1) requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
    });
  }, { threshold: 0.2 });

  elements.forEach(el => observer.observe(el));
}

// 6. INTERACTIVE VOICE DEMO CONSOLE (SCENARIOS & SPEECH)
const VOICE_SCENARIOS = {
  support: {
    title: 'Customer Support & Order Resolution',
    badge: '🎧 Customer Support',
    accent: '#2563eb',
    text: "Hello! Thanks for reaching out to Nova Support. I see your package #4928 is out for delivery today with express courier. Would you like me to send a live GPS tracking link to your registered mobile number?",
    latency: '172ms',
    emotion: 'Empathetic & Helpful',
    language: 'English (US)'
  },
  realestate: {
    title: 'Inbound Real Estate Lead Qualification',
    badge: '🏡 Real Estate Concierge',
    accent: '#e0531c',
    text: "Namaste! Welcome to Nova Living. Are you exploring our 3-BHK luxury penthouses in Downtown, or would you like to schedule an exclusive in-person site visit this Saturday with our property specialist?",
    latency: '185ms',
    emotion: 'Polite & Persuasive',
    language: 'English / Hinglish'
  },
  clinical: {
    title: 'Healthcare Appointment Scheduling',
    badge: '📅 Clinical Triage',
    accent: '#10b981',
    text: "Hello! I am Riya, the clinical concierge. Let's get your follow-up appointment scheduled with Dr. Sharma for your routine consultation. Do mornings or late afternoons suit your schedule better?",
    latency: '168ms',
    emotion: 'Warm & Professional',
    language: 'English (UK)'
  },
  banking: {
    title: 'Banking & Instant Fraud Verification',
    badge: '💳 Banking Security',
    accent: '#6366f1',
    text: "Security Alert from Nova Banking. We noticed a charge of $420.00 from an unfamiliar location at 2:15 AM. Was this transaction authorized by you, or would you like me to instantly freeze this card?",
    latency: '148ms',
    emotion: 'Urgent & Reassuring',
    language: 'English (US)'
  }
};

let currentScenarioKey = 'support';
let isSpeaking = false;
let waveAnimFrame = null;

function initVoiceDemoConsole() {
  const scenarioBtns = document.querySelectorAll('.demo-scenario-btn');
  const playBtn = document.getElementById('demoPlayBtn');
  const transcriptEl = document.getElementById('demoTranscriptText');
  const titleEl = document.getElementById('demoScenarioTitle');
  const latencyBadge = document.getElementById('demoLatencyVal');
  const emotionBadge = document.getElementById('demoEmotionVal');
  const canvas = document.getElementById('demoWaveCanvas');

  if (!playBtn || !transcriptEl) return;

  function setScenario(key) {
    currentScenarioKey = key;
    const sc = VOICE_SCENARIOS[key];
    if (!sc) return;

    scenarioBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.scenario === key);
    });

    if (titleEl) titleEl.textContent = sc.title;
    transcriptEl.textContent = sc.text;
    if (latencyBadge) latencyBadge.textContent = sc.latency;
    if (emotionBadge) emotionBadge.textContent = sc.emotion;

    stopSpeech();
  }

  scenarioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setScenario(btn.dataset.scenario);
    });
  });

  playBtn.addEventListener('click', () => {
    if (isSpeaking) {
      stopSpeech();
    } else {
      playSpeech(VOICE_SCENARIOS[currentScenarioKey]);
    }
  });

  function startWaveform() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.offsetWidth || 500;
    canvas.height = 70;
    let step = 0;

    function render() {
      if (!isSpeaking) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.strokeStyle = '#dcdbd8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        return;
      }
      waveAnimFrame = requestAnimationFrame(render);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      step += 0.08;

      const midY = canvas.height / 2;
      const bars = 48;
      const barW = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const h = Math.abs(Math.sin(step + i * 0.28)) * 26 + 4;
        const x = i * barW;
        ctx.fillStyle = i % 2 === 0 ? '#e0531c' : '#2563eb';
        ctx.fillRect(x + 2, midY - h / 2, barW - 4, h);
      }
    }
    render();
  }

  function playSpeech(scenario) {
    stopSpeech();
    isSpeaking = true;
    playBtn.innerHTML = `<span>■ Pause Demo</span>`;
    playBtn.classList.add('playing');
    startWaveform();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(scenario.text);
      utterance.rate = 1.05;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => (v.name.includes('Female') || v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira')) && v.lang.startsWith('en'));
      if (preferred) utterance.voice = preferred;

      utterance.onend = stopSpeech;
      utterance.onerror = stopSpeech;

      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(stopSpeech, 6000);
    }
  }

  function stopSpeech() {
    isSpeaking = false;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (playBtn) {
      playBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> <span>Play Live Voice Demo</span>`;
      playBtn.classList.remove('playing');
    }
    if (waveAnimFrame) {
      cancelAnimationFrame(waveAnimFrame);
      waveAnimFrame = null;
    }
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.strokeStyle = '#dcdbd8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
}

// 7. HARDWARE MIC & EDGE LATENCY TESTER (WITH SIMULATION FALLBACK)
let micStream = null;
let micAudioCtx = null;
let micAnalyser = null;
let micAnimFrame = null;

function initMicLatencyTester() {
  const testMicBtn = document.getElementById('testMicBtn');
  const micStatus = document.getElementById('micTestStatus');
  const micMeterFill = document.getElementById('micMeterFill');
  const pingVal = document.getElementById('edgePingVal');

  if (!testMicBtn) return;

  async function checkEdgePing() {
    const t0 = performance.now();
    try {
      await fetch('/api/widget-config', { cache: 'no-store' });
      const diff = Math.round(performance.now() - t0);
      if (pingVal) pingVal.textContent = diff + 'ms (Edge)';
    } catch {
      if (pingVal) pingVal.textContent = '148ms (Simulated Edge)';
    }
  }
  checkEdgePing();

  testMicBtn.addEventListener('click', async () => {
    if (micStream) {
      micStream.getTracks().forEach(t => t.stop());
      micStream = null;
      if (micAudioCtx) micAudioCtx.close();
      if (micAnimFrame) cancelAnimationFrame(micAnimFrame);
      testMicBtn.textContent = '🎙️ Test Microphone & Edge Latency';
      if (micStatus) micStatus.textContent = 'Microphone standby';
      if (micMeterFill) micMeterFill.style.width = '0%';
      return;
    }

    testMicBtn.textContent = 'Connecting Audio Device...';
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const src = micAudioCtx.createMediaStreamSource(micStream);
      micAnalyser = micAudioCtx.createAnalyser();
      micAnalyser.fftSize = 64;
      src.connect(micAnalyser);

      testMicBtn.textContent = '🔴 Stop Mic Test';
      if (micStatus) micStatus.textContent = '● Microphone Active (Speak into mic)';

      const data = new Uint8Array(micAnalyser.frequencyBinCount);
      function trackVolume() {
        micAnimFrame = requestAnimationFrame(trackVolume);
        micAnalyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / data.length;
        const pct = Math.min(100, Math.round((avg / 128) * 100));
        if (micMeterFill) micMeterFill.style.width = pct + '%';
      }
      trackVolume();
    } catch (err) {
      console.warn('Mic access denied or unavailable, switching to simulated speech test:', err);
      testMicBtn.textContent = '🔴 Stop Simulated Mic';
      if (micStatus) micStatus.textContent = '● Simulated Voice Activity (48kHz Lossless)';
      
      let simStep = 0;
      function simulateMic() {
        micAnimFrame = requestAnimationFrame(simulateMic);
        simStep += 0.08;
        const vol = Math.abs(Math.sin(simStep)) * 70 + Math.random() * 25;
        if (micMeterFill) micMeterFill.style.width = Math.min(100, Math.round(vol)) + '%';
      }
      simulateMic();
      micStream = { getTracks: () => [] }; // Flag as active
    }
  });
}

// 8. ENHANCED ROI CALCULATOR WITH REAL-TIME DYNAMICS
function initEnhancedRoi() {
  const callsSlider = document.getElementById('callsSlider');
  const durationSlider = document.getElementById('durationSlider');
  const callsDisplay = document.getElementById('callsDisplay');
  const durationDisplay = document.getElementById('durationDisplay');
  const savingsDisplay = document.getElementById('savingsDisplay');
  const humanCostDisplay = document.getElementById('humanCostDisplay');
  const novaCostDisplay = document.getElementById('novaCostDisplay');
  const annualSavingsDisplay = document.getElementById('annualSavingsDisplay');

  if (!callsSlider) return;

  function calculate() {
    const calls = parseInt(callsSlider.value, 10);
    const duration = durationSlider ? parseFloat(durationSlider.value) : 3.8;
    const totalMinutes = calls * duration;
    const totalHours = totalMinutes / 60;

    const humanCost = Math.round(totalHours * 14.50);
    const novaCost = Math.round(totalMinutes * 0.04);
    const monthlySavings = Math.max(0, humanCost - novaCost);
    const annualSavings = monthlySavings * 12;

    if (callsDisplay) callsDisplay.textContent = calls.toLocaleString() + ' calls/mo';
    if (durationDisplay) durationDisplay.textContent = duration.toFixed(1) + ' mins';
    if (savingsDisplay) savingsDisplay.textContent = '$' + monthlySavings.toLocaleString();
    if (humanCostDisplay) humanCostDisplay.textContent = '$' + humanCost.toLocaleString();
    if (novaCostDisplay) novaCostDisplay.textContent = '$' + novaCost.toLocaleString();
    if (annualSavingsDisplay) annualSavingsDisplay.textContent = '$' + annualSavings.toLocaleString() + ' / year';
  }

  callsSlider.addEventListener('input', calculate);
  if (durationSlider) durationSlider.addEventListener('input', calculate);
  calculate();
}
