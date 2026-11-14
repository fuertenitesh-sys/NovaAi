# 🌌 Nova.ai — Enterprise AI Platform & Real-Time Voice Intelligence

Nova.ai is an enterprise-grade AI deployment platform featuring ultra-low latency (<300ms) full-duplex Speech-to-Speech (S2S) voice intelligence, interactive 3D WebGL visualizations, dynamic multi-language conversational agent (**Riya**), and modular subpage architecture.

---

## 🏗️ Technology Stack Breakdown

This website is engineered with a modern, high-performance architecture optimized for sub-second voice interactions and 60fps editorial animations.

### 1. Frontend & Presentation Layer
| Technology / Library | Role & Purpose |
| :--- | :--- |
| **Semantic HTML5 & Modern CSS3** | Clean, accessible layouts using CSS Grid, Flexbox, CSS Custom Properties (Design Tokens), and GPU-accelerated transforms. |
| **Spline 3D (WebGL)** | Custom-tuned interactive 3D core sphere visual (`nova-scene.splinecode`) rendered via `@splinetool/viewer` with zero overhead. |
| **HTML5 Canvas 2D API** | Real-time circular audio visualizer frequency rings (`audioRing`), interactive particle meshes, and wireframe scene animations. |
| **IntersectionObserver API** | High-performance lazy-loading of heavy modules and instant viewport reveals without render-blocking delays. |
| **Typography & Fonts** | Locally hosted variable webfonts: `Instrument Serif`, `DM Sans`, `JetBrains Mono`, and `Manrope` (`.woff2`) for rapid initial paint. |

### 2. Real-Time Voice & Audio Engine (Speech-to-Speech)
| Component | Details |
| :--- | :--- |
| **LiveKit WebRTC Cloud Gateway** | Ultra-low latency (<300ms) bidirectional media streaming client (`livekit-client.umd.js`) with WebRTC data channels and adaptive bitrates. |
| **Web Audio API** | Client-side audio processing, dynamic gain analysis (`AnalyserNode`, `AudioContext`), and microphone stream routing. |
| **Voice Assistant (Riya)** | Native multi-language speech-to-speech agent supporting 100+ languages (defaults to English, dynamically mirrors Hindi, Hinglish, Spanish, French, etc. without latency). |
| **Interactive Demos** | Dual-card architecture: **Nova Premium** and **Nova Duplex** with live microphone visualizers, speaking indicators, and clean call state transitions. |
| **White-labeled Widget** | Floating bottom-right AI assistant (`nova-widget.js` + `react-widget-uv.js`) styled in Cobalt Blue (`#2563eb`) with custom Riya avatar. |

### 3. Backend & Runtime Server
| Component | Purpose |
| :--- | :--- |
| **Node.js Native HTTP/HTTPS Runtime** | Zero-dependency high-throughput server (`server.js`) handling static asset streaming, HTTP range requests, MIME types, and CORS headers. |
| **REST & WebSocket Proxies** | Secure token generation for LiveKit sessions (`/api/nova/web-call`, `/api/create-room/`) and dynamic prompt variable injection. |
| **Python FastAPI Microservice (Optional)** | Located in `/backend` (`main.py`) for standalone custom pipelines (Groq LLaMA-3, Deepgram STT, ElevenLabs TTS, or local WebSocket audio). |

---

## 📁 Project Directory Structure

```
NovaAi/
├── server.js              # Primary Node.js production server & API gateway
├── package.json           # Node.js project manifest & scripts
├── .env.example           # Environment configuration template
├── start.bat              # 1-Click launcher script for Windows
├── README.md              # Project documentation & tech stack breakdown
│
├── public/                # Frontend Application
│   ├── index.html         # Homepage (Enterprise AI Platform & Deployment)
│   ├── nova.html          # Voice Platform (Live Orbs, 3D Spline, Pricing, Benchmarks)
│   ├── approach.html      # Enterprise Methodology & Engineering Approach
│   ├── solutions.html     # Custom Industry & Enterprise Solutions
│   │
│   ├── css/               # Modular CSS Design System
│   │   ├── style.css      # Core design tokens, typography, dark/light themes
│   │   ├── homepage.css   # Hero layout, editorial story grids
│   │   ├── refinement.css # Architectural borders and accents
│   │   ├── brand.css      # Cobalt Blue branding & typography rules
│   │   ├── pages.css      # Common subpage layout
│   │   ├── approach.css   # Approach page specific styling
│   │   ├── solutions.css  # Solutions page specific styling
│   │   ├── contact.css    # Interactive contact drawer & forms
│   │   ├── icons.css      # Vector icon definitions
│   │   └── clients.css    # Enterprise client marquee
│   │
│   ├── js/                # Client JavaScript Architecture
│   │   ├── app.js             # Global application lifecycle
│   │   ├── homepage.js        # Interactive showcase tabs & metrics
│   │   ├── scene.js           # Interactive 3D wireframe canvas
│   │   ├── navigation.js      # Responsive navigation header
│   │   ├── film.js            # Video film controller
│   │   ├── brand.js           # Brand interactions & state
│   │   ├── contact.js         # Contact modal handler
│   │   ├── adoption-weave.js  # Interactive adoption graph
│   │   ├── pages.js           # Subpage transition coordinator
│   │   ├── page-scenes.js     # Scene runner coordinator
│   │   ├── approach-system.js # Architecture step engine
│   │   ├── formation-story.js # Multi-step visual story engine
│   │   ├── work-sculpture.js  # Dynamic 3D sculpture renderer
│   │   ├── team-assembly.js   # Enterprise team hierarchy viewer
│   │   └── nova-widget.js     # Floating Riya AI voice widget connector
│   │
│   └── assets/            # High-Performance Binary Assets
│       ├── favicon.svg            # Nova official brand favicon
│       ├── nova-logo.svg          # Official Nova vector logo
│       ├── nova-avatar.jpg        # Riya AI assistant profile avatar
│       ├── nova-avatar-2.jpg      # Alternate high-res avatar
│       ├── nova-scene.splinecode  # Interactive 3D Spline scene
│       ├── livekit-client.umd.js  # LiveKit WebRTC client bundle
│       ├── react-widget-uv.js     # Patched unbranded floating widget
│       ├── architecture.svg       # Architecture diagram
│       ├── industry-poster.jpg    # Video presentation poster
│       ├── manrope-*.woff2        # Locally cached brand fonts
│       ├── clients/               # Client partner SVG assets
│       └── vendor/                # Vendor graphics
│
└── backend/               # Optional Python Microservice
    ├── main.py            # FastAPI WebSocket voice streaming server
    ├── requirements.txt   # Python dependencies (FastAPI, Groq, httpx)
    └── .env.example       # Python service environment variables
```

---

## 🚀 How to Run Nova.ai

### Method 1: One-Click Startup (Windows)
Simply double-click the **`start.bat`** file in the root directory.

### Method 2: Command Line (Node.js)
Open terminal in the project directory:
```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Start the server
npm start
```

### Method 3: Accessing the Application
Once started, open your web browser:
- **Homepage:** [http://localhost:5500/](http://localhost:5500/)
- **Voice Platform (Nova Demo):** [http://localhost:5500/nova](http://localhost:5500/nova)
- **Approach:** [http://localhost:5500/approach](http://localhost:5500/approach)
- **Solutions:** [http://localhost:5500/solutions](http://localhost:5500/solutions)

---

## 🎙️ Voice Assistant Capabilities (Riya)
- **Identity:** Riya, Autonomous Voice Intelligence for Nova.ai.
- **Default Language:** English (warm, professional, natural enterprise tone).
- **Multi-Language Intelligence:** Instant language mirroring for 100+ languages (Hindi, Hinglish, Spanish, French, German, etc.).
- **Interruption Support:** Full-duplex speech-to-speech enables callers to interrupt naturally while Riya is speaking.
- **No Third-Party Branding:** Zero references to legacy brands or watermarks.
