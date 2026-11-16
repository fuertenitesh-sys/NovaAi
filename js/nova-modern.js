/**
 * ═══════════════════════════════════════════════════════════════════════
 * NOVA.AI — INTERACTIVE VOICE INTELLIGENCE ENGINE & UI CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroWaveform();
  initVoiceStudio();
  initRoiCalculator();
  initPersonaTabs();
});

// 1. HERO REAL-TIME AUDIO WAVEFORM CANVAS
function initHeroWaveform() {
  const canvas = document.getElementById('heroWaveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  let mouseX = -1000, mouseY = -1000;
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }, { passive: true });

  let step = 0;
  function render() {
    requestAnimationFrame(render);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    step += 0.025;

    // Draw multi-frequency cyan & indigo flowing waves with mouse reactivity
    const waves = [
      { color: 'rgba(0, 242, 254, 0.32)', amp: 38, freq: 0.008, speed: 1.2 },
      { color: 'rgba(99, 102, 241, 0.35)', amp: 26, freq: 0.012, speed: -1.0 },
      { color: 'rgba(37, 99, 235, 0.22)', amp: 48, freq: 0.005, speed: 0.8 }
    ];

    waves.forEach(w => {
      ctx.beginPath();
      ctx.moveTo(0, midY);
      for (let x = 0; x < width; x += 4) {
        const dist = Math.abs(x - mouseX);
        const mouseEffect = Math.max(0, 1 - dist / 180) * 35;
        const y = midY + (Math.sin(x * w.freq + step * w.speed) * (w.amp + mouseEffect)) * Math.sin(x / width * Math.PI);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = w.color;
      ctx.lineWidth = 2.2;
      ctx.stroke();
    });
  }
  render();
}

// 2. LIVE VOICE STUDIO (DUAL ORBS WITH LIVEKIT & AUDIO VISUALIZER)
function initVoiceStudio() {
  setupCard('CardPremium', { usecase: 'nova_premium_landing_demo' });
  setupCard('CardDuplex', { agent: 'duplex', usecase: 'nova_duplex_landing_demo' });
}

let activeRoom = null;
let currentPersona = 'Customer Support Specialist';

function setupCard(suffix, extraPayload) {
  const card = document.getElementById('studio' + suffix);
  if (!card) return;

  const orb = card.querySelector('.orb-wrapper');
  const canvas = card.querySelector('.orb-canvas-ring');
  const stateLabel = card.querySelector('.call-state-label');
  const endBtn = card.querySelector('.btn-end-call');
  const muteBtn = card.querySelector('.btn-mute-toggle');

  let room = null;
  let isConnecting = false;
  let isConnected = false;
  let audioCtx = null;
  let analyser = null;
  let animId = null;
  let isMuted = false;

  async function startCall() {
    if (isConnecting || isConnected) return;

    // Hangup any other active card
    if (activeRoom && activeRoom.hangup) {
      activeRoom.hangup();
    }

    isConnecting = true;
    stateLabel.textContent = 'Connecting to Nova AI...';

    try {
      // 1. Fetch token from serverless endpoint
      const payload = Object.assign({
        persona: currentPersona,
        path: '/nova'
      }, extraPayload);

      const res = await fetch('/api/nova/web-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.token || !data.url) throw new Error(data.error || 'Failed to initialize session');

      // 2. Connect LiveKit
      if (!window.LivekitClient) {
        throw new Error('LiveKit WebRTC client not loaded');
      }

      room = new window.LivekitClient.Room({
        adaptiveStream: true,
        dynacast: true
      });

      room.on(window.LivekitClient.RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === 'audio') {
          const el = track.attach();
          document.body.appendChild(el);
          startAudioVisualizer(track, canvas);
        }
      });

      room.on(window.LivekitClient.RoomEvent.Disconnected, () => {
        hangup();
      });

      await room.connect(data.url, data.token);

      try {
        await room.localParticipant.setMicrophoneEnabled(true);
      } catch (e) {
        console.warn('Microphone permission needed:', e);
      }

      isConnected = true;
      isConnecting = false;
      card.classList.add('connected');
      stateLabel.textContent = 'Speaking with Riya...';

      activeRoom = { hangup };
    } catch (err) {
      console.error('Session error:', err);
      isConnecting = false;
      stateLabel.textContent = 'Connection failed. Tap to retry.';
      setTimeout(() => {
        if (!isConnected) stateLabel.textContent = 'Tap to Talk';
      }, 3000);
    }
  }

  function hangup() {
    if (room) {
      room.disconnect();
      room = null;
    }
    stopAudioVisualizer();
    isConnected = false;
    isConnecting = false;
    card.classList.remove('connected');
    stateLabel.textContent = 'Tap to Talk';
    if (activeRoom && activeRoom.hangup === hangup) {
      activeRoom = null;
    }
  }

  function startAudioVisualizer(audioTrack, canvasEl) {
    if (!canvasEl) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const stream = new MediaStream([audioTrack.mediaStreamTrack]);
      const src = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      src.connect(analyser);

      const ctx = canvasEl.getContext('2d');
      const bufLen = analyser.frequencyBinCount;
      const dataArr = new Uint8Array(bufLen);

      canvasEl.width = 190;
      canvasEl.height = 190;
      const cx = 95, cy = 95, radius = 75;

      function draw() {
        animId = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArr);
        ctx.clearRect(0, 0, 190, 190);

        for (let i = 0; i < bufLen; i++) {
          const angle = (i / bufLen) * Math.PI * 2 - Math.PI / 2;
          const val = dataArr[i] / 255;
          const barH = val * 18 + 2;

          const x1 = cx + Math.cos(angle) * radius;
          const y1 = cy + Math.sin(angle) * radius;
          const x2 = cx + Math.cos(angle) * (radius + barH);
          const y2 = cy + Math.sin(angle) * (radius + barH);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(0, 242, 254, ${0.4 + val * 0.6})`;
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }
      draw();
    } catch (e) {
      console.warn('Audio visualizer error:', e);
    }
  }

  function stopAudioVisualizer() {
    if (animId) cancelAnimationFrame(animId);
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
    }
  }

  if (orb) orb.addEventListener('click', () => {
    if (!isConnected && !isConnecting) startCall();
  });

  if (endBtn) endBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hangup();
  });

  if (muteBtn) muteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!room) return;
    isMuted = !isMuted;
    room.localParticipant.setMicrophoneEnabled(!isMuted);
    muteBtn.style.opacity = isMuted ? '0.4' : '1';
    stateLabel.textContent = isMuted ? 'Muted' : 'Speaking with Riya...';
  });
}

// 3. PERSONA TABS
function initPersonaTabs() {
  const tabs = document.querySelectorAll('.studio-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentPersona = tab.dataset.persona || tab.textContent.trim();
    });
  });
}

// 4. INTERACTIVE ROI CALCULATOR
function initRoiCalculator() {
  const slider = document.getElementById('callsSlider');
  const callsDisplay = document.getElementById('callsDisplay');
  const savingsDisplay = document.getElementById('savingsDisplay');
  const humanCostDisplay = document.getElementById('humanCostDisplay');
  const novaCostDisplay = document.getElementById('novaCostDisplay');
  const hoursSavedDisplay = document.getElementById('hoursSavedDisplay');

  if (!slider) return;

  function update() {
    const calls = parseInt(slider.value, 10);
    const avgDurationMins = 3.8;
    const totalMins = calls * avgDurationMins;
    const totalHours = totalMins / 60;

    // Human call center avg cost: $14.50/hour
    const humanCost = Math.round(totalHours * 14.50);
    // Nova AI cost: $0.04/minute
    const novaCost = Math.round(totalMins * 0.04);
    const savings = Math.max(0, humanCost - novaCost);

    if (callsDisplay) callsDisplay.textContent = calls.toLocaleString() + ' calls/mo';
    if (savingsDisplay) savingsDisplay.textContent = '$' + savings.toLocaleString();
    if (humanCostDisplay) humanCostDisplay.textContent = '$' + humanCost.toLocaleString();
    if (novaCostDisplay) novaCostDisplay.textContent = '$' + novaCost.toLocaleString();
    if (hoursSavedDisplay) hoursSavedDisplay.textContent = Math.round(totalHours).toLocaleString() + ' hrs';
  }

  slider.addEventListener('input', update);
  update();
}
