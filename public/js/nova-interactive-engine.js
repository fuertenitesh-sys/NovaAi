/**
 * ═══════════════════════════════════════════════════════════════
 * NOVA.AI — ENTERPRISE INTERACTIVE FUNCTIONALITY ENGINE (V4 PRO)
 * Powers:
 * 1. Nova Neural Soundstage & Interactive Softphone Dialogue Tree
 * 2. 3D Animated Neural Voice Orb (Multi-Layer Canvas Physics)
 * 3. 48-Band Real-Time Acoustic Spectrogram Visualizer
 * 4. Multi-Turn Interactive Dialogue Simulator with Word-Streaming Speech
 * 5. Dynamic Persona Switcher (Support, Real Estate, Clinical, Banking)
 * 6. Live Acoustic Prosody Sliders (Rate & Inflection Modulator)
 * 7. Live 16-Segment LED VU Meter with Microphone / Simulation Fallback
 * 8. Hero Live Voice Sampler (1-Click Multi-Lingual Audition)
 * 9. Real-Time Telemetry Jitter & Edge Latency Ping HUD
 * 10. Ambient Cursor Spotlight & Scroll-Triggered Metric Count-Up
 * ═══════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', () => {
  initNeuralSoundstage();
  initHeroVoiceSampler();
  initLiveTelemetryJitter();
  initCursorSpotlight();
  initCountUpMetrics();
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

// ═══════════════════════════════════════════════════════════════
// 2. NOVA NEURAL SOUNDSTAGE & INTERACTIVE CALL CONSOLE
// ═══════════════════════════════════════════════════════════════
const SOUNDSTAGE_PERSONAS = {
  support: {
    name: 'Riya',
    roleBadge: 'Customer Operations',
    greetingAudioId: 'support_greeting',
    greeting: "Hello! Thanks for connecting with Nova Support. I see your express delivery #NC-4928 is out for delivery today. How would you like me to assist you?",
    lang: 'en-US',
    rate: 1.05,
    prompts: [
      {
        audioId: 'support_1',
        label: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" class="pill-wave-icon"><path d="M2 10v4M6 6v12M10 3v18M14 7v10M18 5v14M22 10v4"/></svg> "Send live GPS tracking link to my phone"',
        reply: 'Can you send a live GPS tracking link to my phone?',
        response: "Absolutely! I've just sent a direct real-time GPS tracking link to your registered mobile number ending in 4102. You can track the courier vehicle right now."
      },
      {
        audioId: 'support_2',
        label: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" class="pill-wave-icon"><path d="M2 10v4M6 6v12M10 3v18M14 7v10M18 5v14M22 10v4"/></svg> "What if I\'m not home to sign?"',
        reply: 'What happens if I\'m not home to sign for the delivery?',
        response: "No problem at all! Would you like me to authorize a contactless delivery to your porch, or should I reschedule the delivery for tomorrow morning at 10:00 AM?"
      },
      {
        audioId: 'support_3',
        label: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" class="pill-wave-icon"><path d="M2 10v4M6 6v12M10 3v18M14 7v10M18 5v14M22 10v4"/></svg> "Reschedule delivery for tomorrow"',
        reply: 'Can you reschedule the delivery for tomorrow morning?',
        response: "Done! I've rescheduled package #NC-4928 for tomorrow between 9:00 AM and 11:30 AM with your local courier hub. Anything else I can do for you?"
      },
      {
        audioId: 'support_4',
        label: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" class="pill-wave-icon"><path d="M2 10v4M6 6v12M10 3v18M14 7v10M18 5v14M22 10v4"/></svg> "Transfer to human supervisor"',
        reply: 'I need to speak with a human supervisor immediately.',
        response: "I understand completely. I am transferring your context and delivery notes directly to senior operations manager Sarah right now. Estimated hold time is under 15 seconds."
      }
    ]
  },
  realestate: {
    name: 'Riya',
    roleBadge: 'Real Estate Concierge',
    greetingAudioId: 'realestate_greeting',
    greeting: "Namaste! Welcome to Nova Living. Are you exploring our 3-BHK luxury penthouses in Downtown, or would you like to schedule an exclusive in-person site visit this Saturday?",
    lang: 'hi-IN',
    rate: 1.02,
    prompts: [
      {
        audioId: 'realestate_1',
        label: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" class="pill-wave-icon"><path d="M2 10v4M6 6v12M10 3v18M14 7v10M18 5v14M22 10v4"/></svg> "Show 3-BHK penthouse pricing & sizes"',
        reply: 'What is the starting price and square footage of the 3-BHK penthouses?',
        response: "Our 3-BHK skyline penthouses start at 1.85 million dollars with 2,400 square feet of private terrace space and floor-to-ceiling panoramic views. Would you like me to email you the complete floor plan PDF?"
      },
      {
        audioId: 'realestate_2',
        label: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" class="pill-wave-icon"><path d="M2 10v4M6 6v12M10 3v18M14 7v10M18 5v14M22 10v4"/></svg> "Book private site visit for Saturday"',
        reply: 'Can I book an exclusive site visit this Saturday at 2:00 PM?',
        response: "Confirmed! I've reserved a VIP private viewing for Saturday at 2:00 PM with our senior property director. I will WhatsApp your digital entry pass immediately."
      },
      {
        audioId: 'realestate_3',
        label: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" class="pill-wave-icon"><path d="M2 10v4M6 6v12M10 3v18M14 7v10M18 5v14M22 10v4"/></svg> "What are the flexible payment plans?"',
        reply: 'Do you offer flexible construction-linked payment plans?',
        response: "Yes! We offer a 20:80 flexible construction-linked structure with zero EMI until possession. Would you like me to connect you with our financing specialist?"
      },
      {
        audioId: 'realestate_4',
        label: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" class="pill-wave-icon"><path d="M2 10v4M6 6v12M10 3v18M14 7v10M18 5v14M22 10v4"/></svg> "Send brochure on WhatsApp"',
        reply: 'Please send the high-res brochure and amenity deck to my WhatsApp.',
        response: "Sending right away! I've dispatched the 2026 Architectural Brochure and Virtual Reality Walkthrough link to your registered mobile number."
      }
    ]
  },
  clinical: {
    name: 'Dr. Riya',
    roleBadge: 'Clinical Intake Triage',
    greetingAudioId: 'clinical_greeting',
    greeting: "Hello, this is Dr. Riya from Clinical Concierge. Let's get your doctor consultation or prescription triage arranged immediately. How can I assist with your care today?",
    lang: 'en-GB',
    rate: 1.0,
    prompts: [
      {
        audioId: 'clinical_1',
        label: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" class="pill-wave-icon"><path d="M2 10v4M6 6v12M10 3v18M14 7v10M18 5v14M22 10v4"/></svg> "Book routine checkup with Dr. Sharma"',
        reply: 'I need to schedule my annual follow-up consultation with Dr. Sharma.',
        response: "Certainly. Dr. Sharma has open slots this Thursday at 10:15 AM or Friday at 3:30 PM. Which time suits your schedule best?"
      },
      {
        audioId: 'clinical_2',
        label: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" class="pill-wave-icon"><path d="M2 10v4M6 6v12M10 3v18M14 7v10M18 5v14M22 10v4"/></svg> "Urgent prescription refill request"',
        reply: 'Can I request an urgent 30-day refill for my blood pressure medication?',
        response: "I can process that refill immediately with your pharmacy. Is this for Lisinopril 10 milligrams, or your daily inhaler?"
      },
      {
        audioId: 'clinical_3',
        label: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" class="pill-wave-icon"><path d="M2 10v4M6 6v12M10 3v18M14 7v10M18 5v14M22 10v4"/></svg> "Report mild postoperative symptoms"',
        reply: 'I had minor surgery yesterday and am feeling mild nausea.',
        response: "I am logging these symptoms as high priority. A triage nurse is reviewing your vitals and will connect with you in under 90 seconds."
      },
      {
        audioId: 'clinical_4',
        label: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" class="pill-wave-icon"><path d="M2 10v4M6 6v12M10 3v18M14 7v10M18 5v14M22 10v4"/></svg> "Verify insurance pre-authorization"',
        reply: 'Does my BlueCross plan cover the upcoming diagnostic MRI scan?',
        response: "Your insurance coverage with BlueCross BlueShield is active. Your estimated copay for this specialized visit is zero dollars."
      }
    ]
  },
  banking: {
    name: 'Riya',
    roleBadge: 'Fraud Intervention',
    greetingAudioId: 'banking_greeting',
    greeting: "Nova Security Operations. We've detected an uncharacteristic debit attempt of $1,420 from an unfamiliar terminal in London. Did you authorize this transaction?",
    lang: 'en-US',
    rate: 1.05,
    prompts: [
      {
        audioId: 'banking_1',
        label: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" class="pill-wave-icon"><path d="M2 10v4M6 6v12M10 3v18M14 7v10M18 5v14M22 10v4"/></svg> "No, I did NOT authorize this charge!"',
        reply: 'No, I did not make that purchase! Please block it immediately.',
        response: "Understood. I have immediately frozen that terminal authorization and blocked card ending in 8819. Zero funds have been deducted from your account."
      },
      {
        audioId: 'banking_2',
        label: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" class="pill-wave-icon"><path d="M2 10v4M6 6v12M10 3v18M14 7v10M18 5v14M22 10v4"/></svg> "Lock all my credit and debit cards"',
        reply: 'Please lock all active cards on my account right now.',
        response: "I've flagged this transaction for your review in the Nova Mobile app. Your card remains active for authorized merchant transactions."
      },
      {
        audioId: 'banking_3',
        label: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" class="pill-wave-icon"><path d="M2 10v4M6 6v12M10 3v18M14 7v10M18 5v14M22 10v4"/></svg> "Order immediate replacement card"',
        reply: 'Can you dispatch a replacement card with voice biometrics?',
        response: "A replacement debit card with contactless voice biometrics has been dispatched via priority overnight courier to your primary address."
      },
      {
        audioId: 'banking_4',
        label: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" class="pill-wave-icon"><path d="M2 10v4M6 6v12M10 3v18M14 7v10M18 5v14M22 10v4"/></svg> "Confirm voice biometric verification"',
        reply: 'I am speaking to authenticate with my registered voiceprint.',
        response: "Thank you for confirming your voice biometric print. Your security status is verified and all pending holds have been cleared."
      }
    ]
  }
};

let activePersonaKey = 'support';
let soundstageIsSpeaking = false;
let orbAudioLevel = 0;
let soundstageRate = 1.05;
let soundstageProsody = 92;
let soundstageMicStream = null;
let soundstageMicAudioCtx = null;
let soundstageMicAnalyser = null;
let soundstageMicAnimFrame = null;
let soundstageCallSeconds = 28;

function initNeuralSoundstage() {
  const container = document.getElementById('demo-console');
  if (!container) return;

  const orbCanvas = document.getElementById('neuralOrbCanvas');
  const specCanvas = document.getElementById('spectrogramCanvas');
  const feed = document.getElementById('dialogueFeed');
  const pillsGrid = document.getElementById('promptPillsGrid');
  const orbIndicator = document.getElementById('orbIndicator');
  const mainPlayBtn = document.getElementById('mainPlayCallBtn');
  const interruptBtn = document.getElementById('soundstageInterruptBtn');
  const muteBtn = document.getElementById('soundstageMuteBtn');
  const micBtn = document.getElementById('soundstageMicBtn');
  const personaCards = document.querySelectorAll('.persona-card');
  const roleBadge = document.getElementById('currentRoleBadge');
  const callTimer = document.getElementById('callTimer');
  const rateSlider = document.getElementById('rateSlider');
  const prosodySlider = document.getElementById('prosodySlider');
  const rateVal = document.getElementById('rateVal');
  const prosodyVal = document.getElementById('prosodyVal');

  // Call timer running
  setInterval(() => {
    soundstageCallSeconds++;
    const m = Math.floor(soundstageCallSeconds / 60).toString().padStart(2, '0');
    const s = (soundstageCallSeconds % 60).toString().padStart(2, '0');
    if (callTimer) callTimer.textContent = `Active WebRTC Session · ${m}:${s}`;
  }, 1000);

  // 1. 3D Neural Sound Orb Canvas Loop
  if (orbCanvas) {
    const ctx = orbCanvas.getContext('2d');
    let orbStep = 0;
    let orbHover = false;

    orbCanvas.addEventListener('mouseenter', () => orbHover = true);
    orbCanvas.addEventListener('mouseleave', () => orbHover = false);

    function drawOrb() {
      requestAnimationFrame(drawOrb);
      const w = orbCanvas.width;
      const h = orbCanvas.height;
      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      orbStep += soundstageIsSpeaking ? 0.08 : 0.03;
      const targetLevel = soundstageIsSpeaking ? (Math.sin(orbStep * 2.5) * 0.4 + 0.6) : (orbHover ? 0.35 : 0.12);
      orbAudioLevel += (targetLevel - orbAudioLevel) * 0.15;

      // Outer breathing aura
      const baseR = 52 + orbAudioLevel * 22;
      const gradOuter = ctx.createRadialGradient(cx, cy, baseR * 0.4, cx, cy, baseR * 1.5);
      gradOuter.addColorStop(0, 'rgba(0, 242, 254, ' + (0.35 + orbAudioLevel * 0.3) + ')');
      gradOuter.addColorStop(0.5, 'rgba(59, 130, 246, ' + (0.2 + orbAudioLevel * 0.25) + ')');
      gradOuter.addColorStop(1, 'rgba(15, 23, 42, 0)');

      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = gradOuter;
      ctx.fill();

      // Orbital frequency rings
      const rings = 3;
      for (let r = 0; r < rings; r++) {
        const ringR = baseR * (0.85 + r * 0.22);
        const rot = orbStep * (r % 2 === 0 ? 1 : -1) * (0.6 + r * 0.2);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        ctx.beginPath();
        const pts = 36;
        for (let i = 0; i <= pts; i++) {
          const ang = (i / pts) * Math.PI * 2;
          const distMod = Math.sin(ang * 4 + orbStep * 3) * (soundstageIsSpeaking ? 6 : 2);
          const px = Math.cos(ang) * (ringR + distMod);
          const py = Math.sin(ang) * (ringR + distMod);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = r === 0 ? 'rgba(0, 242, 254, 0.7)' : (r === 1 ? 'rgba(99, 102, 241, 0.5)' : 'rgba(224, 83, 28, 0.4)');
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // Luminous Core Sphere
      const gradCore = ctx.createRadialGradient(cx - baseR * 0.3, cy - baseR * 0.3, baseR * 0.1, cx, cy, baseR);
      gradCore.addColorStop(0, '#ffffff');
      gradCore.addColorStop(0.3, '#00f2fe');
      gradCore.addColorStop(0.7, '#2563eb');
      gradCore.addColorStop(1, '#0f172a');

      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 0.75, 0, Math.PI * 2);
      ctx.fillStyle = gradCore;
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 18 + orbAudioLevel * 20;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    drawOrb();
  }

  // 2. 48-Band Acoustic Spectrogram Canvas Loop
  if (specCanvas) {
    const ctx = specCanvas.getContext('2d');
    let specStep = 0;

    function drawSpec() {
      requestAnimationFrame(drawSpec);
      specCanvas.width = specCanvas.parentElement.offsetWidth || 400;
      specCanvas.height = 85;
      const w = specCanvas.width;
      const h = specCanvas.height;
      ctx.clearRect(0, 0, w, h);

      specStep += 0.08;
      const bars = 48;
      const barW = (w / bars) - 2;

      for (let i = 0; i < bars; i++) {
        let amp = 0;
        if (soundstageIsSpeaking) {
          const wave1 = Math.abs(Math.sin(specStep + i * 0.28));
          const wave2 = Math.abs(Math.cos(specStep * 1.4 + i * 0.18));
          amp = (wave1 * 0.6 + wave2 * 0.4) * (h * 0.85) + 6;
        } else {
          // Idle calm harmonic
          amp = Math.abs(Math.sin(specStep * 0.5 + i * 0.2)) * 10 + 3;
        }

        const x = i * (barW + 2) + 1;
        const y = h - amp;

        const grad = ctx.createLinearGradient(0, y, 0, h);
        grad.addColorStop(0, '#00f2fe');
        grad.addColorStop(0.5, '#3b82f6');
        grad.addColorStop(1, 'rgba(59, 130, 246, 0.2)');

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barW, amp);
      }
    }
    drawSpec();
  }

  // 3. Speech Synthesis & Authentic Neural Audio Player (Riya AI)
  let currentAudioObj = null;

  function speakAudioOrText(audioId, text, lang, onEndCallback) {
    stopCurrentSpeech();
    soundstageIsSpeaking = true;
    if (mainPlayBtn) {
      mainPlayBtn.innerHTML = `<span>■ Pause Conversation</span>`;
      mainPlayBtn.classList.add('active');
    }
    if (orbIndicator) {
      orbIndicator.innerHTML = `<span style="color:#00f2fe;">● Nova Neural Voice Active · Streaming Speech</span>`;
    }

    // 1. Play authentic studio neural MP3 file (Crystal-clear Riya female voice)
    if (audioId) {
      const audioUrl = `/audio/${audioId}.mp3`;
      const audio = new Audio(audioUrl);
      currentAudioObj = audio;
      audio.playbackRate = soundstageRate;

      let simOrb = setInterval(() => {
        if (!soundstageIsSpeaking || audio.paused || audio.ended) {
          clearInterval(simOrb);
        } else {
          orbAudioLevel = 0.35 + Math.random() * 0.55;
        }
      }, 50);

      audio.onended = () => {
        clearInterval(simOrb);
        stopCurrentSpeech();
        if (onEndCallback) onEndCallback();
      };

      audio.onerror = () => {
        clearInterval(simOrb);
        console.warn('Audio asset error, falling back to female TTS:', audioUrl);
        currentAudioObj = null;
        fallbackFemaleTTS(text, lang, onEndCallback);
      };

      audio.play().catch(err => {
        clearInterval(simOrb);
        console.warn('Audio playback error, falling back to female TTS:', err);
        currentAudioObj = null;
        fallbackFemaleTTS(text, lang, onEndCallback);
      });
      return;
    }

    fallbackFemaleTTS(text, lang, onEndCallback);
  }

  function fallbackFemaleTTS(text, lang, onEndCallback) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang || 'en-US';
      u.rate = soundstageRate;
      u.pitch = 1.12;

      const voices = window.speechSynthesis.getVoices();
      let match = null;
      if (lang && lang.startsWith('hi')) {
        match = voices.find(v => /swara|neerja|kalpana|heera|priya|riya|geeta|google हिन्दी|hindi/i.test(v.name));
      }
      if (!match) {
        match = voices.find(v => /aria|jenny|zira|samantha|karen|victoria|ava|emma|sonia|natasha|heera|neerja|google us english|female/i.test(v.name));
      }
      if (!match) {
        match = voices.find(v => !/david|mark|george|guy|ravi|prabhat|male/i.test(v.name));
      }
      if (match) u.voice = match;

      u.onend = () => {
        stopCurrentSpeech();
        if (onEndCallback) onEndCallback();
      };
      u.onerror = () => {
        stopCurrentSpeech();
        if (onEndCallback) onEndCallback();
      };

      window.speechSynthesis.speak(u);
    } else {
      setTimeout(() => {
        stopCurrentSpeech();
        if (onEndCallback) onEndCallback();
      }, 4000);
    }
  }

  function stopCurrentSpeech() {
    soundstageIsSpeaking = false;
    orbAudioLevel = 0;
    if (currentAudioObj) {
      try {
        currentAudioObj.pause();
        currentAudioObj.currentTime = 0;
      } catch(e) {}
      currentAudioObj = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (mainPlayBtn) {
      mainPlayBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> <span>Audition Spoken Dialogue</span>`;
      mainPlayBtn.classList.remove('active');
    }
    if (orbIndicator) {
      orbIndicator.innerHTML = `<span>● Agent Standing By · Click a response prompt or mic</span>`;
    }
  }

  // 4. Multi-Turn Interactive Dialogue Engine
  function appendChatBubble(sender, text, isUser = false) {
    if (!feed) return null;
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isUser ? 'user-bubble' : 'agent-bubble'}`;
    bubble.innerHTML = `
      <span class="bubble-sender">${sender}</span>
      <p class="bubble-text">${text}</p>
    `;
    feed.appendChild(bubble);
    feed.scrollTop = feed.scrollHeight;
    return bubble.querySelector('.bubble-text');
  }

  function bindPromptPills(persona) {
    if (!pillsGrid) return;
    pillsGrid.innerHTML = '';
    persona.prompts.forEach(p => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'prompt-pill';
      btn.innerHTML = p.label;
      btn.addEventListener('click', () => {
        // User clicks this option!
        appendChatBubble('YOU (ENTERPRISE USER)', p.reply, true);
        if (orbIndicator) {
          orbIndicator.innerHTML = `<span style="color:#8b5cf6;">⚡ Direct Neural S2S Synthesis (118ms)...</span>`;
        }
        pillsGrid.querySelectorAll('.prompt-pill').forEach(b => b.style.pointerEvents = 'none');

        // Sub-200ms latency simulated turn-taking
        setTimeout(() => {
          const agentTextEl = appendChatBubble(`${persona.name.toUpperCase()} (NOVA AI)`, '');
          pillsGrid.querySelectorAll('.prompt-pill').forEach(b => b.style.pointerEvents = 'auto');

          // Word streaming simulation
          const words = p.response.split(' ');
          let wIdx = 0;
          const streamInterval = setInterval(() => {
            if (wIdx < words.length && soundstageIsSpeaking) {
              agentTextEl.textContent = words.slice(0, wIdx + 1).join(' ');
              feed.scrollTop = feed.scrollHeight;
              wIdx++;
            } else {
              clearInterval(streamInterval);
              agentTextEl.textContent = p.response;
            }
          }, 90);

          speakAudioOrText(p.audioId, p.response, persona.lang);
        }, 140);
      });
      pillsGrid.appendChild(btn);
    });
  }

  // 5. Persona Switcher Logic
  function setPersona(key) {
    activePersonaKey = key;
    const persona = SOUNDSTAGE_PERSONAS[key];
    if (!persona) return;

    personaCards.forEach(c => c.classList.toggle('active', c.dataset.persona === key));
    if (roleBadge) roleBadge.textContent = persona.roleBadge;

    // Reset Dialogue Feed with persona greeting
    if (feed) {
      feed.innerHTML = `
        <div class="chat-bubble agent-bubble">
          <span class="bubble-sender">${persona.name.toUpperCase()} (NOVA AI)</span>
          <p class="bubble-text">"${persona.greeting}"</p>
        </div>
      `;
    }

    bindPromptPills(persona);
    stopCurrentSpeech();
  }

  personaCards.forEach(card => {
    card.addEventListener('click', () => setPersona(card.dataset.persona));
  });

  // Connect Enterprise Bento Cards to Persona Switcher
  document.querySelectorAll('.bento-audition-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const personaKey = btn.dataset.switchPersona || 'support';
      const consoleEl = document.getElementById('demo-console');
      if (consoleEl) {
        consoleEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setTimeout(() => {
        setPersona(personaKey);
        const persona = SOUNDSTAGE_PERSONAS[personaKey];
        if (persona) {
          speakAudioOrText(persona.greetingAudioId, persona.greeting, persona.lang);
        }
      }, 450);
    });
  });

  // 6. Action Controls: Play Button, Interrupt, Mute
  if (mainPlayBtn) {
    mainPlayBtn.addEventListener('click', () => {
      if (soundstageIsSpeaking) {
        stopCurrentSpeech();
      } else {
        const persona = SOUNDSTAGE_PERSONAS[activePersonaKey];
        speakAudioOrText(persona.greetingAudioId, persona.greeting, persona.lang);
      }
    });
  }

  if (interruptBtn) {
    interruptBtn.addEventListener('click', () => {
      if (soundstageIsSpeaking) {
        stopCurrentSpeech();
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        bubble.style.background = 'rgba(239, 68, 68, 0.15)';
        bubble.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        bubble.style.padding = '8px 14px';
        bubble.style.fontSize = '12px';
        bubble.style.color = '#fca5a5';
        bubble.style.textAlign = 'center';
        bubble.textContent = '⚡ Full-Duplex Interruption: Agent paused in 94ms. Listening for user speech.';
        if (feed) {
          feed.appendChild(bubble);
          feed.scrollTop = feed.scrollHeight;
        }
      }
    });
  }

  if (muteBtn) {
    let isMuted = false;
    muteBtn.addEventListener('click', () => {
      isMuted = !isMuted;
      const muteLabel = document.getElementById('muteLabel');
      if (muteLabel) muteLabel.textContent = isMuted ? 'Unmute' : 'Mute';
      muteBtn.style.color = isMuted ? '#ef4444' : '#cbd5e1';
    });
  }

  // 7. Interactive Sliders
  if (rateSlider && rateVal) {
    rateSlider.addEventListener('input', () => {
      soundstageRate = parseFloat(rateSlider.value);
      rateVal.textContent = soundstageRate.toFixed(2) + 'x';
    });
  }

  if (prosodySlider && prosodyVal) {
    prosodySlider.addEventListener('input', () => {
      soundstageProsody = parseInt(prosodySlider.value, 10);
      prosodyVal.textContent = soundstageProsody + '%';
    });
  }

  // 8. Hardware Mic & 16-LED VU Meter
  if (micBtn) {
    const leds = document.querySelectorAll('#vuMeterBar .vu-led');
    const ledStatus = document.getElementById('micLedStatus');

    micBtn.addEventListener('click', async () => {
      if (soundstageMicStream) {
        soundstageMicStream.getTracks().forEach(t => t.stop());
        soundstageMicStream = null;
        if (soundstageMicAudioCtx) soundstageMicAudioCtx.close();
        if (soundstageMicAnimFrame) cancelAnimationFrame(soundstageMicAnimFrame);
        micBtn.classList.remove('active');
        micBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg> <span>Test Mic Input</span>`;
        if (ledStatus) ledStatus.textContent = 'STANDBY';
        leds.forEach(l => l.classList.remove('lit'));
        return;
      }

      micBtn.innerHTML = `<span>Connecting...</span>`;
      try {
        soundstageMicStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        soundstageMicAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const src = soundstageMicAudioCtx.createMediaStreamSource(soundstageMicStream);
        soundstageMicAnalyser = soundstageMicAudioCtx.createAnalyser();
        soundstageMicAnalyser.fftSize = 64;
        src.connect(soundstageMicAnalyser);

        micBtn.classList.add('active');
        micBtn.innerHTML = `<span>🔴 Stop Mic</span>`;
        if (ledStatus) ledStatus.textContent = '● ACTIVE (SPEAK)';

        const data = new Uint8Array(soundstageMicAnalyser.frequencyBinCount);
        function trackVU() {
          soundstageMicAnimFrame = requestAnimationFrame(trackVU);
          soundstageMicAnalyser.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) sum += data[i];
          const avg = sum / data.length;
          const level = Math.min(16, Math.round((avg / 128) * 16));
          leds.forEach((l, idx) => l.classList.toggle('lit', idx < level));
        }
        trackVU();
      } catch {
        // Fallback simulated voice activity
        micBtn.classList.add('active');
        micBtn.innerHTML = `<span>🔴 Stop Simulation</span>`;
        if (ledStatus) ledStatus.textContent = 'SIMULATED (VOICE)';
        let simStep = 0;
        function simVU() {
          soundstageMicAnimFrame = requestAnimationFrame(simVU);
          simStep += 0.1;
          const level = Math.min(16, Math.round(Math.abs(Math.sin(simStep)) * 12 + Math.random() * 4));
          leds.forEach((l, idx) => l.classList.toggle('lit', idx < level));
        }
        simVU();
        soundstageMicStream = { getTracks: () => [] };
      }
    });
  }

  // Initialize initial persona
  setPersona('support');
}

// ═══════════════════════════════════════════════════════════════
// 3. HERO LIVE VOICE SAMPLER (DIRECT AUDITION IN HERO SECTION)
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
// 4. REAL-TIME TELEMETRY JITTER & EDGE PING HUD
// ═══════════════════════════════════════════════════════════════
function initLiveTelemetryJitter() {
  const heroPing = document.getElementById('heroLivePing');
  const soundstagePing = document.getElementById('soundstagePing');
  const samplerLat = document.getElementById('samplerLatency');
  const waterfallTotal = document.getElementById('waterfallTotal');

  const latencies = [168, 174, 182, 166, 178, 172, 185];
  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % latencies.length;
    const val = latencies[idx] + 'ms';
    if (heroPing) heroPing.textContent = val;
    if (soundstagePing) soundstagePing.textContent = val;
    if (samplerLat) samplerLat.textContent = val;
    if (waterfallTotal) waterfallTotal.textContent = `${val} Turn`;
  }, 2800);
}

// ═══════════════════════════════════════════════════════════════
// 5. AMBIENT CURSOR SPOTLIGHT AURA
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
// 6. SCROLL-TRIGGERED METRIC COUNT-UP ANIMATIONS
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
// 7. ENHANCED ROI CALCULATOR WITH REAL-TIME DYNAMICS
// ═══════════════════════════════════════════════════════════════
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
