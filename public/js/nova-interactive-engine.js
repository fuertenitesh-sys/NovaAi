/**
 * ═══════════════════════════════════════════════════════════════
 * NOVA.AI — ENTERPRISE INTERACTIVE FUNCTIONALITY ENGINE
 * Powers:
 * 1. 1-Click Interactive Voice Demo with Live Audio Speech & Real-Time Waveform
 * 2. Live Hardware Microphone Test & Edge Network Latency Meter
 * 3. Dynamic Dialogue & Scenario Switcher (Support, Real Estate, Health, Banking)
 * 4. Interactive Enterprise ROI Calculator with Duration & Savings Projections
 * ═══════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', () => {
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
    // If it's a primary CTA meant to launch the studio, direct to /nova
    if (el.textContent.toLowerCase().includes('voice studio') || el.classList.contains('primary')) {
      el.setAttribute('href', isPublicPrefix ? '/public/nova' : '/nova');
    }
  });
}

// 2. INTERACTIVE VOICE DEMO CONSOLE (1-Click Speech + Live Waveform + Transcript)
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

  // Animated Waveform Canvas
  function startWaveform() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.offsetWidth || 500;
    canvas.height = 70;
    let step = 0;

    function render() {
      if (!isSpeaking) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw idle subtle flatline with pulse
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

      utterance.onend = () => {
        stopSpeech();
      };
      utterance.onerror = () => {
        stopSpeech();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback timer if speech synthesis is blocked
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

// 3. HARDWARE MIC & EDGE LATENCY TESTER
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

  // Measure real edge ping to Cloudflare Pages edge API
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
      // Stop mic
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
      console.warn('Mic access denied or unavailable:', err);
      testMicBtn.textContent = '🎙️ Test Microphone & Edge Latency';
      if (micStatus) micStatus.textContent = 'Mic permission needed in browser';
    }
  });
}

// 4. ENHANCED ROI CALCULATOR WITH DURATION & ANNUAL PROJECTIONS
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

    // Human cost: $14.50/hr
    const humanCost = Math.round(totalHours * 14.50);
    // Nova cost: $0.04/min
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
