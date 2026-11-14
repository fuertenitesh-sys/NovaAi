/* =========================================================================
   RIYA AI — Autonomous Enterprise Voice Intelligence Assistant
   Powered by Authentic LiveKit Voice Engine (Matching https://www.ravan.ai/)
   Branded 100% for Nova.ai with Cobalt Sapphire Blue theme
   ========================================================================= */

(() => {
  if (document.getElementById('riya-widget-host')) return;

  const host = document.createElement('div');
  host.id = 'riya-widget-host';
  const shadow = host.attachShadow({ mode: 'open' });

  shadow.innerHTML = `<style>
    :host { font-family: 'Manrope', Arial, sans-serif; }
    button {
      position: fixed;
      right: 22px;
      bottom: max(22px, env(safe-area-inset-bottom));
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 0;
      border: 0;
      background: none;
      color: #ffffff;
      font: 600 13px/1.4 'Manrope', Arial, sans-serif;
      cursor: pointer;
      transition: transform 0.25s cubic-bezier(0.2, 0.75, 0.2, 1);
    }
    button:hover { transform: translateY(-3px) scale(1.02); }
    img {
      width: 64px;
      height: 64px;
      object-fit: cover;
      border-radius: 50%;
      box-shadow: 0 4px 18px rgba(37, 99, 235, 0.35), 0 0 0 1px #ded8cd;
      border: 2px solid #2563eb;
      background: #f1eee8;
      transition: box-shadow 0.25s ease, border-color 0.25s ease;
    }
    button:hover img {
      box-shadow: 0 8px 24px rgba(37, 99, 235, 0.5);
    }
    span {
      padding: 8px 18px;
      background: #2563eb; /* Cobalt Sapphire Blue */
      border-radius: 24px;
      line-height: 1.4;
      color: #ffffff;
      font-weight: 700;
      letter-spacing: 0.2px;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
      transition: background 0.2s ease;
    }
    button:hover span { background: #1d4ed8; }
    button:focus-visible { outline: 2px solid #2563eb; outline-offset: 6px; border-radius: 8px; }
    button:disabled { cursor: wait; opacity: 0.8; }
    .mic-help {
      position: fixed;
      right: 22px;
      bottom: 140px;
      z-index: 10001;
      width: min(300px, calc(100vw - 48px));
      box-sizing: border-box;
      background: #faf9f6;
      color: #302e2a;
      border: 1px solid #d8d2c8;
      border-radius: 12px;
      padding: 18px;
      box-shadow: 0 12px 40px rgba(32, 34, 31, 0.2);
      font: 400 14px/1.6 'Manrope', Arial, sans-serif;
    }
    .mic-help[hidden] { display: none; }
    .mic-help strong { display: block; margin-bottom: 6px; font-weight: 600; }
    .mic-help p { margin: 0; }
    @media (max-width: 640px) {
      button { right: 16px; bottom: max(16px, env(safe-area-inset-bottom)); }
    }
  </style>
  <button type="button" aria-label="Talk to Riya">
    <img src="/assets/nova-avatar.jpg" width="64" height="64" alt="Riya AI" decoding="async">
    <span aria-live="polite">Riya</span>
  </button>
  <div class="mic-help" role="status" hidden>
    <strong></strong>
    <p></p>
  </div>`;

  if (document.body) {
    document.body.append(host);
  } else {
    document.addEventListener('DOMContentLoaded', () => document.body.append(host));
  }

  const launcher = shadow.querySelector('button');
  const label = launcher.querySelector('span');
  let preparation, vendorHost, guard, openRequested = false;

  function prepare() {
    if (preparation) return preparation;
    preparation = new Promise(async (resolve, reject) => {
      let market = 'in';
      try {
        const response = await fetch('/api/widget-config', { signal: AbortSignal.timeout(3000) });
        if (response.ok) market = (await response.json()).market;
      } catch {}

      vendorHost = document.createElement('div');
      vendorHost.style.visibility = 'hidden';
      const root = vendorHost.attachShadow({ mode: 'open' });

      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://sidewidget.vercel.app/react-widget-uv.css';

      const widget = document.createElement('react-widget-uv');
      widget.setAttribute('agent_id', '01a1d8a0-eb07-7a44-9066-fb2420c08c97');
      widget.setAttribute('schema', '6af30ad4-a50c-4acc-8996-d5f562b6987f');
      widget.setAttribute('type', 'thunderemotionlite');

      root.append(css, widget);
      shadow.append(vendorHost);

      guard = new MutationObserver(records => {
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (node.nodeType !== 1) continue;
            if ((node.tagName === 'LINK' && node.href?.includes('sidewidget.vercel.app')) ||
                (node.tagName === 'STYLE' && /react-tel-input|react-widget-uv/.test(node.textContent || ''))) {
              root.append(node);
            }
          }
        }
      });
      guard.observe(document.head, { childList: true });
      guard.observe(document.body, { childList: true });

      let observer, script, settled = false;
      const timeout = setTimeout(() => fail(), 15000);

      function fail() {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        observer?.disconnect();
        guard.disconnect();
        vendorHost.remove();
        script?.remove();
        preparation = null;
        reject(new Error('Riya could not load'));
      }

      function styleRiya() {
        const inner = widget.shadowRoot;
        if (!inner) return fail();

        const apply = () => {
          // Inject Cobalt Blue Nova theme
          if (!inner.querySelector('[data-nova-theme]')) {
            const theme = document.createElement('link');
            theme.rel = 'stylesheet';
            theme.href = '/maya-theme.css?v=nova-clean-2026-v2';
            theme.dataset.novaTheme = 'true';
            inner.append(theme);
          }

          // Sanitize text inside widget (replace any occurrences of Maya/Ravan with Riya/Nova)
          const sanitize = (node) => {
            if (node.nodeType === 3) {
              if (/Maya|Ravan/i.test(node.nodeValue)) {
                node.nodeValue = node.nodeValue
                  .replace(/ravan[a]?\s*(dot\s*a\s*i|\.ai|\bai\b)?/gi, 'Nova.ai')
                  .replace(/ravan[a]?/gi, 'Nova')
                  .replace(/maya/gi, 'Riya');
              }
            } else if (node.nodeType === 1) {
              if (node.tagName === 'A' && (/ravan/i.test(node.href || '') || /powered by/i.test(node.textContent || ''))) {
                node.style.display = 'none';
              }
              if (node.tagName === 'IMG') {
                if (node.alt && /Ravan/i.test(node.alt)) {
                  node.alt = 'Nova.ai';
                  node.src = '/assets/nova-logo.svg';
                }
                if (node.src.includes('Untitled_design') || node.src.includes('bot_logo') || node.src.includes('s3.amazonaws.com')) {
                  node.src = '/assets/nova-avatar.jpg';
                }
              }
              for (const child of node.childNodes) sanitize(child);
            }
          };
          sanitize(inner);

          const labels = {
            'lucide-x': 'Close Riya',
            'lucide-minimize2': 'Minimize Riya',
            'lucide-volume2': 'Mute Riya',
            'lucide-volume-x': 'Unmute Riya',
            'lucide-send': 'Send message'
          };
          for (const [icon, name] of Object.entries(labels)) {
            const b = inner.querySelector('.' + icon)?.closest('button');
            if (b && b.getAttribute('aria-label') !== name) b.setAttribute('aria-label', name);
          }

          const button = [...inner.querySelectorAll('button')].find(b => /Riya|Maya|Connected|Talk/i.test(b.textContent.trim()));
          if (button && !settled) {
            settled = true;
            clearTimeout(timeout);
            resolve(button);
          }
        };

        observer = new MutationObserver(apply);
        observer.observe(inner, { childList: true, subtree: true, characterData: true });
        apply();
      }

      if (customElements.get('react-widget-uv')) {
        styleRiya();
      } else {
        window.process = window.process || { env: {} };
        script = document.createElement('script');
        script.src = '/assets/react-widget-uv.js?v=clean-riya-2026-v2'; // Served locally from our patched file
        script.async = true;
        script.addEventListener('load', styleRiya, { once: true });
        script.addEventListener('error', fail, { once: true });
        document.body.append(script);
      }
    });

    return preparation;
  }

  const help = shadow.querySelector('.mic-help');
  let permissionStream, releaseTimer, connectionObserver;

  function releaseMicrophone() {
    clearTimeout(releaseTimer);
    connectionObserver?.disconnect();
    permissionStream?.getTracks().forEach(track => track.stop());
    permissionStream = null;
  }

  function showHelp(error) {
    const name = error?.name;
    const blocked = name === 'NotAllowedError' || name === 'PermissionDeniedError';
    help.querySelector('strong').textContent = blocked
      ? 'Allow microphone access to speak with Riya.'
      : 'Setting up microphone for Riya...';
    help.querySelector('p').textContent = blocked
      ? 'Please allow microphone access in your browser controls to talk with Riya in real time.'
      : 'Checking microphone connection... Please try again.';
    help.hidden = false;
    label.textContent = 'Talk to Riya';
  }

  launcher.addEventListener('click', async () => {
    if (openRequested) return;
    openRequested = true;
    launcher.disabled = true;
    help.hidden = true;
    label.textContent = 'Connecting...';

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new DOMException('Voice requires a supported browser', 'NotSupportedError');
      }
      permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      if (document.hidden) throw new DOMException('Return to tab to start voice', 'AbortError');

      label.textContent = 'Starting Riya...';
      const button = await prepare();
      vendorHost.style.visibility = '';
      launcher.remove();
      button.click();

      const inner = vendorHost.shadowRoot.querySelector('react-widget-uv')?.shadowRoot;
      let mutedInitialGreeting = false;

      const sanitizeAll = () => {
        if (!inner) return;
        inner.querySelectorAll('a, p, span, div').forEach(el => {
          if (/Ravan|Powered by/i.test(el.textContent || '')) {
            if (el.tagName === 'A' || el.closest('a') || /powered by/i.test(el.textContent || '')) {
              (el.closest('a') || el).style.display = 'none';
              (el.closest('a') || el).style.visibility = 'hidden';
            } else {
              el.textContent = el.textContent
                .replace(/ravan[a]?\s*(dot\s*a\s*i|\.ai|\bai\b)?/gi, 'Nova.ai')
                .replace(/ravan[a]?/gi, 'Nova')
                .replace(/maya/gi, 'Riya');
            }
          }
        });
        inner.querySelectorAll('img').forEach(img => {
          if (img.alt && /Ravan/i.test(img.alt)) {
            img.closest('a')?.remove() || img.remove();
          }
          if (img.src && (img.src.includes('Untitled_design') || img.src.includes('bot_logo') || img.src.includes('s3.amazonaws.com'))) {
            img.src = '/assets/nova-avatar.jpg';
          }
        });

        // Ensure clean text in transcript box
        const transcriptBox = inner.querySelector('.transcript-box');
        if (transcriptBox && /Ravan|Maya/i.test(transcriptBox.textContent || '')) {
          const walker = document.createTreeWalker(transcriptBox, NodeFilter.SHOW_TEXT, null, false);
          let n;
          while (n = walker.nextNode()) {
            if (/Ravan|Maya/i.test(n.nodeValue)) {
              n.nodeValue = n.nodeValue
                .replace(/ravan[a]?\s*(dot\s*a\s*i|\.ai|\bai\b)?/gi, 'Nova.ai')
                .replace(/ravan[a]?/gi, 'Nova')
                .replace(/maya/gi, 'Riya');
            }
          }
        }
      };

      if (inner) {
        connectionObserver = new MutationObserver(sanitizeAll);
        connectionObserver.observe(inner, { childList: true, subtree: true, characterData: true });
        inner.addEventListener('click', event => {
          if (event.composedPath().some(node => node.getAttribute?.('aria-label') === 'Close Riya')) {
            releaseMicrophone();
          }
        }, true);
      }

      releaseTimer = setTimeout(releaseMicrophone, 10000);
      sanitizeAll();
    } catch (error) {
      releaseMicrophone();
      openRequested = false;
      launcher.disabled = false;
      showHelp(error);
    }
  });

  window.addEventListener('pagehide', releaseMicrophone);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) releaseMicrophone();
  });
})();
