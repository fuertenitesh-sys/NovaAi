const fs = require('fs');
const path = require('path');

const filePath = path.join('C:/Users/Nitesh singh/OneDrive/Desktop/NovaAi/public/index.html');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Find enterprise section start/end line indices (0-indexed)
let startLine = -1, endLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (startLine === -1 && lines[i].includes('ENTERPRISE DOMAINS')) startLine = i;
  if (startLine !== -1 && endLine === -1 && i > startLine && lines[i].trim() === '</section>') {
    endLine = i;
    break;
  }
}

console.log(`Replacing lines ${startLine + 1}–${endLine + 1}`);

const newSection = `  <!-- ═══════════ ENTERPRISE SECTORS — DARK EDITORIAL GRID ═══════════ -->
  <section class="ent-dark-section" id="clients" aria-labelledby="clients-title">
    <div class="ent-dark-container">

      <!-- Header -->
      <div class="ent-dark-header">
        <div class="ent-dark-eyebrow">
          <span class="ent-live-dot"></span>
          <span class="ent-eyebrow-text">ENTERPRISE DEPLOYMENT MATRIX</span>
          <span class="ent-eyebrow-sep">|</span>
          <span class="ent-eyebrow-sub">MISSION-CRITICAL SECTORS</span>
        </div>
        <h2 class="ent-dark-title" id="clients-title">
          Institutional-Grade Voice AI.<br>
          <em class="ent-title-em">Hardened for Every Sector.</em>
        </h2>
        <p class="ent-dark-desc">
          Domain-specific neural models with zero-day CRM &amp; EHR connectors — pre-configured for global enterprises handling millions of voice interactions.
        </p>
        <div class="ent-compliance-strip">
          <span class="ent-badge">SOC-2 Type II</span>
          <span class="ent-badge">HIPAA</span>
          <span class="ent-badge">PCI-DSS L1</span>
          <span class="ent-badge">GDPR</span>
          <span class="ent-badge ent-badge-live"><span class="ent-pulse"></span> &lt;140ms SLA</span>
          <span class="ent-badge">14.8M+ Turns / Mo</span>
        </div>
      </div>

      <!-- 6-Card Dark Bento Grid -->
      <div class="ent-grid">

        <!-- 1. Banking & Fintech -->
        <article class="ent-card ent-card--fintech">
          <div class="ent-card-glow"></div>
          <div class="ent-card-inner">
            <div class="ent-card-head">
              <div class="ent-icon ent-icon--fintech">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div class="ent-tags">
                <span class="ent-tag">FIDO2</span>
                <span class="ent-tag">PCI-DSS L1</span>
              </div>
            </div>
            <div class="ent-card-body">
              <span class="ent-sector">Banking &amp; Fintech</span>
              <h3 class="ent-card-title">Voice Biometrics &amp; Real-Time Fraud Interception</h3>
              <p class="ent-card-copy">Sub-140ms voiceprint auth neutralizes deepfake cloning and account takeover. Autonomous dispute adjudication across multi-currency workflows.</p>
            </div>
            <div class="ent-card-foot">
              <div class="ent-metrics">
                <div class="ent-metric"><span class="ent-metric-val">$420M+</span><span class="ent-metric-key">Flow Protected</span></div>
                <div class="ent-metric-sep"></div>
                <div class="ent-metric"><span class="ent-metric-val">0.02%</span><span class="ent-metric-key">False Accept Rate</span></div>
              </div>
              <button class="ent-cta" data-switch-persona="banking">
                Audition Agent <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </article>

        <!-- 2. Healthcare -->
        <article class="ent-card ent-card--health">
          <div class="ent-card-glow"></div>
          <div class="ent-card-inner">
            <div class="ent-card-head">
              <div class="ent-icon ent-icon--health">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div class="ent-tags">
                <span class="ent-tag ent-tag--green">HIPAA READY</span>
                <span class="ent-tag">EPIC / CERNER</span>
              </div>
            </div>
            <div class="ent-card-body">
              <span class="ent-sector">Healthcare &amp; Clinical Networks</span>
              <h3 class="ent-card-title">HIPAA Patient Intake &amp; Intelligent Clinical Routing</h3>
              <p class="ent-card-copy">Bi-directional triage via EHR systems. Validates insurance eligibility and coordinates post-discharge care — zero clinician burnout.</p>
            </div>
            <div class="ent-card-foot">
              <div class="ent-metrics">
                <div class="ent-metric"><span class="ent-metric-val">99.4%</span><span class="ent-metric-key">Triage Accuracy</span></div>
                <div class="ent-metric-sep"></div>
                <div class="ent-metric"><span class="ent-metric-val">0 min</span><span class="ent-metric-key">Queue Wait Drop</span></div>
              </div>
              <button class="ent-cta" data-switch-persona="clinical">
                Audition Agent <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </article>

        <!-- 3. Real Estate -->
        <article class="ent-card ent-card--estate">
          <div class="ent-card-glow"></div>
          <div class="ent-card-inner">
            <div class="ent-card-head">
              <div class="ent-icon ent-icon--estate">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div class="ent-tags">
                <span class="ent-tag">MULTI-DIALECT</span>
                <span class="ent-tag">CALENDAR SYNC</span>
              </div>
            </div>
            <div class="ent-card-body">
              <span class="ent-sector">PropTech &amp; Luxury Real Estate</span>
              <h3 class="ent-card-title">Conversational Leasing &amp; Automated Property Tours</h3>
              <p class="ent-card-copy">Pre-qualifies high-value buyers in English &amp; Hinglish, answers floor plan specs at sub-200ms, books site visits directly into CRM calendars.</p>
            </div>
            <div class="ent-card-foot">
              <div class="ent-metrics">
                <div class="ent-metric"><span class="ent-metric-val">4.2x</span><span class="ent-metric-key">Tour Conversion</span></div>
                <div class="ent-metric-sep"></div>
                <div class="ent-metric"><span class="ent-metric-val">&lt;30s</span><span class="ent-metric-key">First Lead Contact</span></div>
              </div>
              <button class="ent-cta" data-switch-persona="realestate">
                Audition Agent <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </article>

        <!-- 4. Logistics -->
        <article class="ent-card ent-card--logistics">
          <div class="ent-card-glow"></div>
          <div class="ent-card-inner">
            <div class="ent-card-head">
              <div class="ent-icon ent-icon--logistics">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <div class="ent-tags">
                <span class="ent-tag">TMS WEBHOOKS</span>
                <span class="ent-tag">WEBRTC DISPATCH</span>
              </div>
            </div>
            <div class="ent-card-body">
              <span class="ent-sector">Logistics &amp; Freight Operations</span>
              <h3 class="ent-card-title">Voice Fleet Dispatch &amp; Real-Time Exception Routing</h3>
              <p class="ent-card-copy">Hands-free telemetry for freight drivers. Routes exceptions, issues ETA updates, and dispatches GPS tracking via SMS &amp; WhatsApp instantly.</p>
            </div>
            <div class="ent-card-foot">
              <div class="ent-metrics">
                <div class="ent-metric"><span class="ent-metric-val">88%</span><span class="ent-metric-key">Auto Dispatch Rate</span></div>
                <div class="ent-metric-sep"></div>
                <div class="ent-metric"><span class="ent-metric-val">180ms</span><span class="ent-metric-key">Voice Turn Latency</span></div>
              </div>
              <button class="ent-cta" data-switch-persona="support">
                Audition Agent <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </article>

        <!-- 5. E-Commerce -->
        <article class="ent-card ent-card--retail">
          <div class="ent-card-glow"></div>
          <div class="ent-card-inner">
            <div class="ent-card-head">
              <div class="ent-icon ent-icon--retail">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <div class="ent-tags">
                <span class="ent-tag">SHOPIFY + SAP ERP</span>
                <span class="ent-tag">WHATSAPP API</span>
              </div>
            </div>
            <div class="ent-card-body">
              <span class="ent-sector">E-Commerce &amp; Omnichannel Retail</span>
              <h3 class="ent-card-title">Sub-200ms Order Triage &amp; Automated Returns</h3>
              <p class="ent-card-copy">Replaces chatbot delays with human-speed voice empathy. Authenticates accounts, checks multi-warehouse inventory, generates return labels live on call.</p>
            </div>
            <div class="ent-card-foot">
              <div class="ent-metrics">
                <div class="ent-metric"><span class="ent-metric-val">82%</span><span class="ent-metric-key">First-Call Resolution</span></div>
                <div class="ent-metric-sep"></div>
                <div class="ent-metric"><span class="ent-metric-val">4.9/5.0</span><span class="ent-metric-key">Verified CSAT</span></div>
              </div>
              <button class="ent-cta" data-switch-persona="support">
                Audition Agent <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </article>

        <!-- 6. SaaS / Cloud -->
        <article class="ent-card ent-card--saas">
          <div class="ent-card-glow"></div>
          <div class="ent-card-inner">
            <div class="ent-card-head">
              <div class="ent-icon ent-icon--saas">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
                  <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
                </svg>
              </div>
              <div class="ent-tags">
                <span class="ent-tag">PAGERDUTY</span>
                <span class="ent-tag">&lt;45s MTTR</span>
              </div>
            </div>
            <div class="ent-card-body">
              <span class="ent-sector">Enterprise Cloud &amp; SaaS</span>
              <h3 class="ent-card-title">24/7 Autonomous Tier-1 Diagnostics &amp; Escalation</h3>
              <p class="ent-card-copy">Voice-driven technical triage. Guides developers through auth errors, parses stack traces live, hot-transfers unresolved incidents to on-call engineers.</p>
            </div>
            <div class="ent-card-foot">
              <div class="ent-metrics">
                <div class="ent-metric"><span class="ent-metric-val">76%</span><span class="ent-metric-key">Tier-1 Deflection</span></div>
                <div class="ent-metric-sep"></div>
                <div class="ent-metric"><span class="ent-metric-val">&lt;45s</span><span class="ent-metric-key">Mean Triage Time</span></div>
              </div>
              <button class="ent-cta" data-switch-persona="support">
                Audition Agent <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </article>

      </div><!-- /ent-grid -->
    </div><!-- /ent-dark-container -->
  </section>`;

// Replace lines startLine through endLine (0-indexed)
const before = lines.slice(0, startLine);
const after = lines.slice(endLine + 1);
const newContent = [...before, newSection, ...after].join('\n');

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Done! Enterprise section replaced successfully.');
