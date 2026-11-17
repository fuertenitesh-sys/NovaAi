/* =========================================================================
   NOVA.AI — RIYA AUTONOMOUS ENTERPRISE VOICE & INTELLIGENCE ASSISTANT
   Production-ready, zero-dependency, ultra-reliable voice & chat modal.
   Features:
    - Zero vendor script lockups or broken mic timeouts
    - Instant slide-up sheet on mobile / floating glass card on desktop
    - Authentic studio neural voice audio playback (/audio/support_greeting.mp3)
    - Web Speech API fallback & multi-language voice synthesis
    - Graceful microphone input with zero crash on blocked permissions
    - 100% responsive across mobile, tablet, and desktop screens
   ========================================================================= */

(() => {
  'use strict';

  if (document.getElementById('riya-widget-host')) return;

  const host = document.createElement('div');
  host.id = 'riya-widget-host';
  const shadow = host.attachShadow({ mode: 'open' });

  // Widget Stylesheet
  const style = document.createElement('style');
  style.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :host {
      font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
      z-index: 999999;
      position: relative;
    }

    /* Floating Launcher Button */
    .riya-launcher {
      position: fixed;
      right: 22px;
      bottom: max(22px, env(safe-area-inset-bottom, 22px));
      z-index: 999998;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 16px 6px 6px;
      background: #0f172a;
      color: #ffffff;
      border: 1px solid rgba(59, 130, 246, 0.4);
      border-radius: 999px;
      cursor: pointer;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.4), 0 0 20px rgba(37, 99, 235, 0.25);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
    }
    .riya-launcher:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 14px 30px -5px rgba(15, 23, 42, 0.5), 0 0 25px rgba(37, 99, 235, 0.45);
      border-color: #3b82f6;
    }
    .riya-launcher:active {
      transform: translateY(0) scale(0.98);
    }

    .launcher-avatar-wrap {
      position: relative;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .launcher-avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #2563eb;
      background: #1e293b;
      display: block;
    }
    .launcher-status-dot {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #10b981;
      border: 2px solid #0f172a;
      box-shadow: 0 0 8px #10b981;
    }

    .launcher-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
    }
    .launcher-name-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .launcher-name {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: #ffffff;
    }
    .launcher-pill {
      font-size: 9px;
      font-weight: 700;
      font-family: ui-monospace, monospace;
      color: #60a5fa;
      background: rgba(37, 99, 235, 0.2);
      border: 1px solid rgba(96, 165, 250, 0.3);
      padding: 1px 6px;
      border-radius: 999px;
      letter-spacing: 0.04em;
    }
    .launcher-sub {
      font-size: 11px;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Mini Audio Bars in Launcher */
    .mini-wave {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      height: 10px;
    }
    .mini-wave span {
      width: 2px;
      height: 100%;
      background: #3b82f6;
      border-radius: 1px;
      animation: miniWave 1.2s ease-in-out infinite;
    }
    .mini-wave span:nth-child(2) { animation-delay: 0.2s; }
    .mini-wave span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes miniWave {
      0%, 100% { height: 3px; }
      50% { height: 10px; background: #60a5fa; }
    }

    /* Modal Backdrop (Mobile overlay) */
    .riya-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 999998;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    .riya-backdrop.active {
      opacity: 1;
      pointer-events: auto;
    }

    /* Assistant Modal Window */
    .riya-window {
      position: fixed;
      right: 22px;
      bottom: 85px;
      width: 385px;
      max-width: calc(100vw - 32px);
      height: 590px;
      max-height: calc(100vh - 105px);
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.35), 0 0 30px rgba(37, 99, 235, 0.15);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px) scale(0.96);
      pointer-events: none;
      transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .riya-window.active {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    /* Mobile Sheet Drag Handle */
    .mobile-handle {
      display: none;
      width: 36px;
      height: 4px;
      background: #cbd5e1;
      border-radius: 2px;
      margin: 8px auto 2px;
    }

    /* Window Header */
    .window-header {
      background: #0f172a;
      color: #ffffff;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      position: relative;
    }
    .header-agent {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .header-avatar-wrap {
      position: relative;
      width: 38px;
      height: 38px;
      flex-shrink: 0;
    }
    .header-avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #3b82f6;
    }
    .header-agent-text {
      display: flex;
      flex-direction: column;
    }
    .header-title-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .header-name {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
    }
    .header-live-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 9px;
      font-family: ui-monospace, monospace;
      color: #10b981;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 1px 6px;
      border-radius: 999px;
    }
    .header-badge-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
      animation: pulseDot 1.5s infinite;
    }
    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    .header-role {
      font-size: 11px;
      color: #94a3b8;
    }

    /* Header Controls */
    .header-controls {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .icon-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #cbd5e1;
      cursor: pointer;
      transition: all 0.2s;
    }
    .icon-btn:hover {
      background: rgba(255, 255, 255, 0.18);
      color: #ffffff;
    }
    .icon-btn svg {
      width: 16px;
      height: 16px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
    }

    /* Audio Equalizer Indicator in Header */
    .audio-eq-bars {
      display: none;
      align-items: center;
      gap: 2px;
      height: 14px;
      padding: 0 4px;
      margin-right: 4px;
    }
    .audio-eq-bars.active {
      display: flex;
    }
    .eq-bar {
      width: 2px;
      height: 100%;
      background: #00f2fe;
      border-radius: 1px;
      animation: eqDance 0.8s ease-in-out infinite alternate;
    }
    .eq-bar:nth-child(1) { animation-delay: 0.1s; }
    .eq-bar:nth-child(2) { animation-delay: 0.3s; }
    .eq-bar:nth-child(3) { animation-delay: 0.5s; }
    .eq-bar:nth-child(4) { animation-delay: 0.2s; }
    .eq-bar:nth-child(5) { animation-delay: 0.4s; }
    @keyframes eqDance {
      0% { height: 3px; }
      100% { height: 14px; }
    }

    /* Conversation Message Feed */
    .chat-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f8fafc;
      overscroll-behavior: contain;
    }

    .msg-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .msg-group.assistant {
      align-items: flex-start;
    }
    .msg-group.user {
      align-items: flex-end;
    }

    .msg-sender {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: #64748b;
      margin-left: 4px;
      text-transform: uppercase;
    }

    .msg-bubble {
      max-width: 86%;
      padding: 12px 14px;
      border-radius: 16px;
      font-size: 13.5px;
      line-height: 1.55;
      position: relative;
      word-break: break-word;
    }
    .msg-group.assistant .msg-bubble {
      background: #ffffff;
      color: #1e293b;
      border: 1px solid #e2e8f0;
      border-top-left-radius: 4px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    }
    .msg-group.user .msg-bubble {
      background: #2563eb;
      color: #ffffff;
      border-top-right-radius: 4px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }

    /* Audio Playback Capsule inside assistant message */
    .bubble-audio-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
      padding: 5px 10px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 999px;
      color: #1d4ed8;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .bubble-audio-btn:hover {
      background: #dbeafe;
      border-color: #93c5fd;
    }
    .bubble-audio-btn svg {
      width: 12px;
      height: 12px;
      fill: currentColor;
    }

    /* Quick Action Prompt Chips */
    .quick-chips-box {
      margin-top: 6px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .quick-chips-title {
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #64748b;
      text-transform: uppercase;
      margin-top: 4px;
      margin-bottom: 2px;
    }
    .quick-chip {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 500;
      color: #334155;
      text-align: left;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      transition: all 0.18s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .quick-chip:hover {
      border-color: #2563eb;
      background: #eff6ff;
      color: #1d4ed8;
      transform: translateX(2px);
    }
    .quick-chip-arrow {
      color: #94a3b8;
      font-size: 11px;
    }
    .quick-chip:hover .quick-chip-arrow {
      color: #2563eb;
    }

    /* Inline Tip / Status Notification */
    .inline-notice {
      background: #f1f5f9;
      border-left: 3px solid #3b82f6;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 11.5px;
      color: #475569;
      line-height: 1.45;
      margin-top: 4px;
    }

    /* Typing Indicator */
    .typing-indicator {
      display: none;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      width: fit-content;
      margin-left: 4px;
    }
    .typing-indicator.active {
      display: flex;
    }
    .typing-dot {
      width: 5px;
      height: 5px;
      background: #94a3b8;
      border-radius: 50%;
      animation: typingBounce 1.4s infinite ease-in-out both;
    }
    .typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .typing-dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes typingBounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    /* Window Footer & Input Bar */
    .window-footer {
      background: #ffffff;
      padding: 12px 14px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .input-form {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .chat-input {
      flex: 1;
      height: 42px;
      padding: 0 14px;
      border: 1px solid #cbd5e1;
      border-radius: 999px;
      font-family: inherit;
      font-size: 13.5px;
      color: #0f172a;
      background: #f8fafc;
      outline: none;
      transition: all 0.2s;
    }
    .chat-input:focus {
      border-color: #2563eb;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }
    .chat-input::placeholder {
      color: #94a3b8;
      font-size: 13px;
    }

    .mic-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: #475569;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.2s;
    }
    .mic-btn:hover {
      background: #e2e8f0;
      color: #1e293b;
    }
    .mic-btn.listening {
      background: #fee2e2;
      border-color: #ef4444;
      color: #dc2626;
      animation: pulseMic 1.2s infinite;
    }
    @keyframes pulseMic {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
      50% { transform: scale(1.08); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
    }
    .mic-btn svg {
      width: 17px;
      height: 17px;
      fill: currentColor;
    }

    .send-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #2563eb;
      border: none;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.2s;
      box-shadow: 0 3px 10px rgba(37, 99, 235, 0.35);
    }
    .send-btn:hover {
      background: #1d4ed8;
      transform: scale(1.04);
    }
    .send-btn:active {
      transform: scale(0.96);
    }
    .send-btn svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }

    .footer-sub {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10px;
      color: #94a3b8;
      padding: 0 4px;
    }
    .footer-sub a {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 600;
    }
    .footer-sub a:hover {
      text-decoration: underline;
    }

    /* ══════════════ MOBILE RESPONSIVENESS (<640px) ══════════════ */
    @media (max-width: 640px) {
      .riya-launcher {
        right: 14px;
        bottom: max(14px, env(safe-area-inset-bottom, 14px));
        padding: 5px 12px 5px 5px;
      }
      .launcher-avatar-wrap {
        width: 38px;
        height: 38px;
      }
      .launcher-name {
        font-size: 13px;
      }
      .launcher-sub {
        display: none;
      }

      .riya-window {
        right: 0 !important;
        left: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        height: 84vh !important;
        max-height: 84vh !important;
        border-radius: 24px 24px 0 0 !important;
        box-shadow: 0 -10px 40px rgba(15, 23, 42, 0.45) !important;
        border-bottom: none !important;
      }
      .mobile-handle {
        display: block;
      }
      .window-footer {
        padding-bottom: max(16px, env(safe-area-inset-bottom, 16px));
      }
    }
  `;

  // HTML Structure
  const container = document.createElement('div');
  container.className = 'riya-root';
  container.innerHTML = `
    <!-- Floating Launcher -->
    <button class="riya-launcher" id="riyaLauncher" type="button" aria-label="Talk to Riya AI Assistant">
      <div class="launcher-avatar-wrap">
        <img class="launcher-avatar" src="/assets/nova-avatar.jpg" alt="Riya AI" width="44" height="44" onerror="this.src='/assets/favicon.svg'">
        <span class="launcher-status-dot"></span>
      </div>
      <div class="launcher-info">
        <div class="launcher-name-row">
          <span class="launcher-name">Riya</span>
          <span class="launcher-pill">&lt;200ms</span>
        </div>
        <span class="launcher-sub">
          <span class="mini-wave"><span></span><span></span><span></span></span> Voice Assistant
        </span>
      </div>
    </button>

    <!-- Backdrop for Mobile -->
    <div class="riya-backdrop" id="riyaBackdrop"></div>

    <!-- Assistant Modal Window -->
    <div class="riya-window" id="riyaWindow" role="dialog" aria-modal="true" aria-label="Riya AI Voice & Chat Assistant">
      <div class="mobile-handle"></div>

      <!-- Header -->
      <div class="window-header">
        <div class="header-agent">
          <div class="header-avatar-wrap">
            <img class="header-avatar" src="/assets/nova-avatar.jpg" alt="Riya AI" width="38" height="38" onerror="this.src='/assets/favicon.svg'">
          </div>
          <div class="header-agent-text">
            <div class="header-title-row">
              <span class="header-name">Riya</span>
              <span class="header-live-badge"><span class="header-badge-dot"></span> WEBRTC</span>
            </div>
            <span class="header-role">Nova Enterprise Voice Assistant</span>
          </div>
        </div>

        <div class="header-controls">
          <!-- Animated Voice Wave bars when speaking -->
          <div class="audio-eq-bars" id="audioEqBars" title="Riya Voice Speaking">
            <span class="eq-bar"></span>
            <span class="eq-bar"></span>
            <span class="eq-bar"></span>
            <span class="eq-bar"></span>
            <span class="eq-bar"></span>
          </div>

          <!-- Mute/Unmute audio -->
          <button class="icon-btn" id="audioMuteBtn" type="button" title="Mute/Unmute Riya">
            <svg id="muteIcon" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          </button>

          <!-- Close Window -->
          <button class="icon-btn" id="closeWindowBtn" type="button" title="Close Assistant">
            <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <!-- Chat Feed -->
      <div class="chat-messages" id="chatFeed">
        <!-- Initial Greeting Message -->
        <div class="msg-group assistant">
          <span class="msg-sender">Riya (Nova AI)</span>
          <div class="msg-bubble">
            <p><strong>Hi! I'm Riya</strong>, Nova's Enterprise Voice AI assistant. We build and deploy sub-200ms speech-to-speech agents that speak 100+ languages and integrate directly into your tech stack.</p>
            <button class="bubble-audio-btn" type="button" id="replayGreetingBtn">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> <span>Play Neural Voice (178ms)</span>
            </button>
          </div>
        </div>

        <!-- Quick Interactive Scenarios -->
        <div class="quick-chips-box" id="quickChipsBox">
          <span class="quick-chips-title">Audition Scenarios &amp; Queries:</span>
          <button type="button" class="quick-chip" data-scenario="latency">
            <span>⚡ <strong>Sub-200ms Voice Pipeline</strong></span>
            <span class="quick-chip-arrow">→</span>
          </button>
          <button type="button" class="quick-chip" data-scenario="banking">
            <span>🛡️ <strong>Banking &amp; Fraud Interception</strong></span>
            <span class="quick-chip-arrow">→</span>
          </button>
          <button type="button" class="quick-chip" data-scenario="clinical">
            <span>🏥 <strong>Clinical Intake &amp; HIPAA</strong></span>
            <span class="quick-chip-arrow">→</span>
          </button>
          <button type="button" class="quick-chip" data-scenario="hindi">
            <span>🇮🇳 <strong>Hindi &amp; Hinglish Dialects</strong></span>
            <span class="quick-chip-arrow">→</span>
          </button>
          <button type="button" class="quick-chip" data-scenario="contact">
            <span>📅 <strong>Book Enterprise Architecture Demo</strong></span>
            <span class="quick-chip-arrow">→</span>
          </button>
        </div>

        <!-- Typing Bubble -->
        <div class="typing-indicator" id="typingIndicator">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>

      <!-- Footer & Input Form -->
      <div class="window-footer">
        <form class="input-form" id="chatForm">
          <input class="chat-input" id="chatInput" type="text" placeholder="Ask Riya anything or choose a demo above..." autocomplete="off">
          <button class="mic-btn" id="micBtn" type="button" title="Speak to Riya (Microphone)">
            <svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </button>
          <button class="send-btn" type="submit" title="Send Query">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </form>
        <div class="footer-sub">
          <span>Enterprise Duplex S2S Engine</span>
          <a href="/nova">Explore Studio ⚡</a>
        </div>
      </div>
    </div>
  `;

  shadow.append(style, container);

  if (document.body) {
    document.body.append(host);
  } else {
    document.addEventListener('DOMContentLoaded', () => document.body.append(host));
  }

  // ══════════════ DOM ELEMENTS & STATE ══════════════
  const launcher = shadow.getElementById('riyaLauncher');
  const windowEl = shadow.getElementById('riyaWindow');
  const backdrop = shadow.getElementById('riyaBackdrop');
  const closeBtn = shadow.getElementById('closeWindowBtn');
  const chatFeed = shadow.getElementById('chatFeed');
  const chatForm = shadow.getElementById('chatForm');
  const chatInput = shadow.getElementById('chatInput');
  const micBtn = shadow.getElementById('micBtn');
  const replayGreetingBtn = shadow.getElementById('replayGreetingBtn');
  const audioEqBars = shadow.getElementById('audioEqBars');
  const audioMuteBtn = shadow.getElementById('audioMuteBtn');
  const muteIcon = shadow.getElementById('muteIcon');
  const typingIndicator = shadow.getElementById('typingIndicator');
  const quickChipsBox = shadow.getElementById('quickChipsBox');

  let isMuted = false;
  let isOpen = false;
  let currentAudio = null;
  let speechRec = null;
  let isListening = false;

  // ══════════════ AUDIO CONTROLLER ══════════════
  function playAudio(src, onComplete) {
    stopAudio();
    if (isMuted) {
      if (onComplete) onComplete();
      return;
    }

    try {
      currentAudio = new Audio(src);
      currentAudio.preload = 'auto';

      currentAudio.onplay = () => {
        audioEqBars.classList.add('active');
      };
      currentAudio.onended = () => {
        audioEqBars.classList.remove('active');
        currentAudio = null;
        if (onComplete) onComplete();
      };
      currentAudio.onerror = () => {
        audioEqBars.classList.remove('active');
        currentAudio = null;
        if (onComplete) onComplete();
      };

      const playPromise = currentAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          // Autoplay policy fallback
          audioEqBars.classList.remove('active');
          currentAudio = null;
          if (onComplete) onComplete();
        });
      }
    } catch (e) {
      audioEqBars.classList.remove('active');
      if (onComplete) onComplete();
    }
  }

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    audioEqBars.classList.remove('active');
  }

  // TTS Speech Synthesis Fallback
  function speakText(text, lang = 'en-US', onComplete) {
    stopAudio();
    if (isMuted || !('speechSynthesis' in window)) {
      if (onComplete) onComplete();
      return;
    }

    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      utter.rate = 1.05;
      utter.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferred = voices.find(v => (v.lang.startsWith(lang.slice(0, 2)) && /female|natural|samantha|zira|google/i.test(v.name))) || voices.find(v => v.lang.startsWith(lang.slice(0, 2)));
        if (preferred) utter.voice = preferred;
      }

      utter.onstart = () => audioEqBars.classList.add('active');
      utter.onend = () => {
        audioEqBars.classList.remove('active');
        if (onComplete) onComplete();
      };
      utter.onerror = () => {
        audioEqBars.classList.remove('active');
        if (onComplete) onComplete();
      };

      window.speechSynthesis.speak(utter);
    } catch (e) {
      audioEqBars.classList.remove('active');
      if (onComplete) onComplete();
    }
  }

  // ══════════════ WINDOW OPEN / CLOSE ══════════════
  function openWidget() {
    if (isOpen) return;
    isOpen = true;
    windowEl.classList.add('active');
    backdrop.classList.add('active');
    launcher.style.display = 'none';

    // Play Riya's greeting audio on initial open
    setTimeout(() => {
      playAudio('/audio/support_greeting.mp3');
    }, 200);

    // Scroll chat to bottom
    scrollToBottom();
  }

  function closeWidget() {
    if (!isOpen) return;
    isOpen = false;
    windowEl.classList.remove('active');
    backdrop.classList.remove('active');
    launcher.style.display = 'flex';
    stopAudio();
    stopListening();
  }

  launcher.addEventListener('click', openWidget);
  closeBtn.addEventListener('click', closeWidget);
  backdrop.addEventListener('click', closeWidget);

  // Esc key closes modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeWidget();
  });

  // Replay Greeting button
  replayGreetingBtn.addEventListener('click', () => {
    playAudio('/audio/support_greeting.mp3');
  });

  // Mute / Unmute Toggle
  audioMuteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    if (isMuted) {
      stopAudio();
      audioMuteBtn.title = 'Unmute Riya';
      muteIcon.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';
    } else {
      audioMuteBtn.title = 'Mute Riya';
      muteIcon.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>';
      playAudio('/audio/support_greeting.mp3');
    }
  });

  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatFeed.scrollTop = chatFeed.scrollHeight;
    });
  }

  // ══════════════ CHAT MESSAGING ENGINE ══════════════
  function appendMessage(sender, text, isUser = false, audioSrc = null) {
    const group = document.createElement('div');
    group.className = `msg-group ${isUser ? 'user' : 'assistant'}`;

    let audioButtonHtml = '';
    if (audioSrc) {
      audioButtonHtml = `
        <button class="bubble-audio-btn" type="button">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> <span>Play Voice Audio</span>
        </button>
      `;
    }

    group.innerHTML = `
      <span class="msg-sender">${sender}</span>
      <div class="msg-bubble">
        <p>${text}</p>
        ${audioButtonHtml}
      </div>
    `;

    if (audioSrc) {
      const btn = group.querySelector('.bubble-audio-btn');
      btn.addEventListener('click', () => playAudio(audioSrc));
    }

    // Insert before typing indicator
    chatFeed.insertBefore(group, typingIndicator);
    scrollToBottom();
  }

  function appendNotice(text) {
    const notice = document.createElement('div');
    notice.className = 'inline-notice';
    notice.innerHTML = text;
    chatFeed.insertBefore(notice, typingIndicator);
    scrollToBottom();
  }

  // ══════════════ INTELLIGENT KNOWLEDGE REPOSITORY ══════════════
  const RESPONSES = {
    latency: {
      text: "<strong>Sub-200ms Voice Architecture:</strong> Legacy voice bots chain 3 separate tools (STT ➔ LLM ➔ TTS) adding 1,500ms of lag. Nova streams directly from audio tokens to audio tokens with full-duplex interruption, achieving turn-taking faster than human response speed (178ms).",
      audio: "/audio/support_1.mp3"
    },
    banking: {
      text: "<strong>Banking & Fraud Interception:</strong> In financial services, Nova deploys sub-140ms voice biometrics to prevent account takeovers and synthetic deepfakes with a verified 0.02% false acceptance rate. We protect over $420M in transaction volume.",
      audio: "/audio/banking_greeting.mp3"
    },
    clinical: {
      text: "<strong>Healthcare & Clinical Routing:</strong> Nova provides HIPAA-compliant patient intake, bi-directional EHR/EMR integration (Epic & Cerner), and intelligent symptom triage with 99.4% clinical routing accuracy.",
      audio: "/audio/clinical_greeting.mp3"
    },
    realestate: {
      text: "<strong>PropTech & Luxury Real Estate:</strong> Nova qualifies luxury home buyers, answers floor-plan inquiries in English and Hinglish, and schedules site tours directly into sales agent calendars.",
      audio: "/audio/realestate_greeting.mp3"
    },
    hindi: {
      text: "<strong>नमस्ते! Nova AI 100 से अधिक भाषाओं और बोलियों में स्वाभाविक रूप से बातचीत कर सकता है।</strong> Zero latency, natural emotional prosody, and seamless code-switching between English, Hindi, and regional dialects.",
      speech: "नमस्ते! Nova AI 100 से अधिक भाषाओं और बोलियों में स्वाभाविक रूप से बातचीत कर सकता है।",
      lang: "hi-IN"
    },
    pricing: {
      text: "<strong>Enterprise Pricing:</strong> Nova costs flat <strong>$0.04 per minute</strong> with unlimited concurrent calls. Compared to outsourced human call centers ($14.50/hour), an organization running 15,000 monthly calls saves over <strong>$137,000 annually</strong>.",
      audio: "/audio/support_2.mp3"
    },
    integrations: {
      text: "<strong>Integrations:</strong> Nova connects natively with Salesforce, HubSpot, Zoho CRM, Zendesk, PostgreSQL, Snowflake, Twilio, and REST APIs. Conversations update your CRM records and trigger webhooks in real time.",
      audio: "/audio/support_3.mp3"
    },
    contact: {
      text: "<strong>Schedule Architecture Consultation:</strong> Let's get to work! Opening the enterprise project brief now so you can connect directly with our engineering team.",
      action: () => {
        closeWidget();
        const briefDialog = document.getElementById('brief-dialog');
        if (briefDialog && typeof briefDialog.showModal === 'function') {
          briefDialog.showModal();
        } else {
          const contactSec = document.getElementById('contact');
          if (contactSec) contactSec.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  function answerQuery(query) {
    const q = query.toLowerCase();
    typingIndicator.classList.add('active');
    scrollToBottom();

    setTimeout(() => {
      typingIndicator.classList.remove('active');

      let matched = null;
      if (/latency|speed|fast|sub-200|delay|lag|turn/i.test(q)) {
        matched = RESPONSES.latency;
      } else if (/bank|fraud|fintech|money|security|biometric|deepfake/i.test(q)) {
        matched = RESPONSES.banking;
      } else if (/health|clinic|doctor|patient|hipaa|medical/i.test(q)) {
        matched = RESPONSES.clinical;
      } else if (/real estate|property|estate|tour|leasing/i.test(q)) {
        matched = RESPONSES.realestate;
      } else if (/hindi|hinglish|bhasha|language|dialect/i.test(q)) {
        matched = RESPONSES.hindi;
      } else if (/cost|price|pricing|rate|save|roi|dollar/i.test(q)) {
        matched = RESPONSES.pricing;
      } else if (/integrate|crm|salesforce|hubspot|api|database|webhook/i.test(q)) {
        matched = RESPONSES.integrations;
      } else if (/demo|book|contact|consult|hire|talk|call|meeting/i.test(q)) {
        matched = RESPONSES.contact;
      } else {
        matched = {
          text: `Nova builds enterprise-grade autonomous voice infrastructure with direct speech-to-speech models and sub-200ms latency. You can test live scenarios above or click below to explore the Voice Studio!`,
          audio: '/audio/support_4.mp3'
        };
      }

      appendMessage('Riya (Nova AI)', matched.text, false, matched.audio);

      if (matched.action) {
        matched.action();
      } else if (matched.audio) {
        playAudio(matched.audio);
      } else if (matched.speech) {
        speakText(matched.speech, matched.lang || 'en-US');
      }
    }, 450);
  }

  // Quick Action Chips Handling
  quickChipsBox.addEventListener('click', e => {
    const chip = e.target.closest('.quick-chip');
    if (!chip) return;
    const scenario = chip.dataset.scenario;
    const item = RESPONSES[scenario];
    if (!item) return;

    appendMessage('You', chip.innerText.replace('→', '').trim(), true);
    typingIndicator.classList.add('active');
    scrollToBottom();

    setTimeout(() => {
      typingIndicator.classList.remove('active');
      appendMessage('Riya (Nova AI)', item.text, false, item.audio);
      if (item.action) {
        item.action();
      } else if (item.audio) {
        playAudio(item.audio);
      } else if (item.speech) {
        speakText(item.speech, item.lang || 'en-US');
      }
    }, 400);
  });

  // Chat Form Submit
  chatForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';
    appendMessage('You', text, true);
    answerQuery(text);
  });

  // ══════════════ ROBUST MICROPHONE HANDLING (NO CRASHES) ══════════════
  function stopListening() {
    if (speechRec) {
      try { speechRec.stop(); } catch {}
      speechRec = null;
    }
    isListening = false;
    micBtn.classList.remove('listening');
    micBtn.title = 'Speak to Riya (Microphone)';
  }

  micBtn.addEventListener('click', () => {
    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecAPI) {
      appendNotice('ℹ️ <strong>Speech Recognition not supported</strong> in this browser. You can type your question freely in the box below!');
      chatInput.focus();
      return;
    }

    try {
      speechRec = new SpeechRecAPI();
      speechRec.continuous = false;
      speechRec.interimResults = true;
      speechRec.lang = 'en-US';

      speechRec.onstart = () => {
        isListening = true;
        micBtn.classList.add('listening');
        micBtn.title = 'Listening... Speak now (Click to stop)';
        chatInput.placeholder = 'Listening to your voice...';
      };

      speechRec.onresult = event => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        chatInput.value = transcript;
        if (event.results[0].isFinal) {
          stopListening();
          chatInput.placeholder = 'Ask Riya anything or choose a demo above...';
          const query = transcript.trim();
          if (query) {
            appendMessage('You', query, true);
            answerQuery(query);
            chatInput.value = '';
          }
        }
      };

      speechRec.onerror = event => {
        stopListening();
        chatInput.placeholder = 'Ask Riya anything or choose a demo above...';
        // Graceful error handling - ZERO CRASH, ZERO DEAD END
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          appendNotice('ℹ️ <strong>Microphone permission is blocked</strong>. You can type your query in the input box below anytime!');
        } else if (event.error !== 'no-speech') {
          appendNotice(`ℹ️ <strong>Voice input standby</strong>. Please type your query in the box below!`);
        }
        chatInput.focus();
      };

      speechRec.onend = () => {
        stopListening();
        chatInput.placeholder = 'Ask Riya anything or choose a demo above...';
      };

      speechRec.start();
    } catch (err) {
      stopListening();
      appendNotice('ℹ️ <strong>Microphone unavailable</strong>. Please type your query in the box below!');
      chatInput.focus();
    }
  });

})();
