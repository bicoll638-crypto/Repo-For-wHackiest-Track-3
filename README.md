# AURA: Your Voice-First Personal Data Twin
> **Hackathon Track 3: Know Thyself | Team: The Bug Dealers**
> **Members:** Soham Manjunath, Syeda Kulsum, Shreya B R, Saathvik R
> *A proactive, predictive personal intelligence twin for college students. Multi-variable correlation across finances, circadian sleep, attendance, and exam deadlines.*

---

## 🌟 The Core Concept & USP

Most AI student tools are **passive "chat with your PDF" wrappers**—they only speak when spoken to and treat each domain in isolation.

**AURA** is different:
- **Proactive & Predictive:** AURA continuously watches time-series data across scattered student silos (UPI spends, sleep logs, class timetable, study sessions, and exam deadlines).
- **Finds Non-Obvious Cause-and-Effect Loops:** It doesn't just tell you that you're low on money; it proves that **₹1,840 in midnight Zomato orders delayed your sleep to 2:45 AM**, directly causing you to **miss 5 mandatory 8:30 AM lectures** and fall behind on your **Operating Systems Mid-Term prep**.
- **Voice-First Interaction:** Delivers an autonomous **60-second morning briefing** every day and answers prospective **"What-If"** questions with transparent reasoning chains.
- **Privacy-First by Design:** The prototype runs locally with **zero API keys required**, storing data in local SQLite with one-click data erasure. Cloud services are optional via `AURA_MODE=live`.
---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Data Sources ["1. Multimodal Student Inputs"]
        UPI["UPI Spends (Zomato/Swiggy)"]
        Calendar["Academic Timetable & Deadlines"]
        Sleep["Sleep & Biometric Logs"]
        VoiceNote["Spoken / Typed Notes"]
    end

    subgraph Backend ["2. FastAPI Backend Engine (Python 3.11+)"]
        IngestRouter["Ingestion Pipeline (/api/ingest)"]
        RegexParser["Note Regex & Heuristic Extractor"]
        DocExtractor["Multi-modal Document Parser"]
        SQLite[(SQLite Local Database)]
        
        subgraph Correlation ["Correlation & Cause-Effect Engine"]
            DetA["Detector A: Late-Night Spend -> Attendance Drop"]
            DetB["Detector B: Budget Burn -> Depletion Velocity"]
            DetC["Detector C: Sleep Deficit -> Study & Exam Risk"]
        end

        subgraph Adapters ["Abstract Adapter Layer (AURA_MODE=mock|live)"]
            LLMAdapter["LLM Service (Template Engine / Bedrock Claude)"]
            VoiceAdapter["Voice Service (Web Speech API / ElevenLabs)"]
        end
    end

    subgraph Frontend ["3. Next.js 14 Mobile-First Web App (390px Dark Glass)"]
        BriefingPlayer["60s Morning Briefing Player (Animated Waveform)"]
        BudgetRing["Dynamic Radial Budget Ring"]
        InsightCards["Cause -> Effect Insight Cards"]
        WhatIfPanel["What-If Prospective Simulation Lab"]
        VoiceOrb["Floating Ambient Voice Orb"]
    end

    DataSources --> IngestRouter
    IngestRouter --> RegexParser & DocExtractor
    RegexParser & DocExtractor --> SQLite
    SQLite --> Correlation
    Correlation --> DetA & DetB & DetC
    DetA & DetB & DetC --> LLMAdapter
    LLMAdapter --> BriefingPlayer & WhatIfPanel
    VoiceAdapter --> BriefingPlayer & VoiceOrb
```

---

## 📁 Repository Structure

```text
Root/
├── README.md                      # Comprehensive guide, architecture & demo script
├── .env.example                   # Environment variable template
├── run.bat                        # Windows 1-click startup script (concurrent servers)
├── run.sh                         # Linux/macOS bash startup script
├── Makefile                       # Developer shortcuts (make dev, make test, make seed)
├── backend/
│   ├── requirements.txt           # Python dependencies
│   ├── app/
│   │   ├── main.py                # FastAPI app with CORS, health check, lifespan seed
│   │   ├── config.py              # Settings configuration (Pydantic v2 Settings)
│   │   ├── models.py              # SQLModel table definitions (LifeEvent, UserProfile)
│   │   ├── schemas.py             # Pydantic v2 request/response schemas
│   │   ├── db.py                  # SQLite engine & session generator
│   │   ├── seed.py                # 30-day realistic student dataset seeder (Arjun)
│   │   ├── routers/
│   │   │   ├── ingest.py          # POST /api/ingest/file, /text, /voice
│   │   │   ├── events.py          # GET /api/events, POST /api/events
│   │   │   ├── insights.py        # GET /api/insights, GET /api/insights/budget
│   │   │   ├── briefing.py        # GET /api/briefing
│   │   │   ├── whatif.py          # POST /api/whatif
│   │   │   ├── voice.py           # POST /api/voice/synthesize
│   │   │   └── privacy.py         # DELETE /api/privacy/wipe, POST /api/privacy/seed
│   │   ├── services/
│   │   │   ├── briefing.py        # 60s briefing generation logic
│   │   │   ├── whatif.py          # Multi-variable prospective reasoning
│   │   │   ├── ingestion/
│   │   │   │   ├── mock_extractor.py # Document OCR/visual extraction
│   │   │   │   └── note_parser.py    # Regex & heuristic text note parser
│   │   │   ├── correlation/
│   │   │   │   ├── engine.py         # Multi-detector orchestrator
│   │   │   │   └── detectors/
│   │   │   │       ├── late_night_spend.py  # Detector A (Late spend -> Missed class)
│   │   │   │       ├── budget_burn.py       # Detector B (Depletion projection)
│   │   │   │       └── sleep_attendance.py  # Detector C (Sleep deficit -> Exam risk)
│   │   │   ├── llm/
│   │   │   │   ├── base.py           # Abstract Base Class for LLM
│   │   │   │   ├── template_llm.py   # High-fidelity mock template LLM
│   │   │   │   └── bedrock_llm.py    # AWS Bedrock Claude adapter stub
│   │   │   └── voice/
│   │   │       ├── base.py           # Abstract Base Class for Voice
│   │   │       ├── mock.py           # Client-side Web Speech fallback
│   │   │       └── elevenlabs.py     # Live ElevenLabs TTS adapter
│   │   └── fixtures/
│   │       └── demo_events.json      # 64 realistic 30-day student events
│   └── tests/
│       ├── test_detectors.py         # Detector pure-function unit tests
│       ├── test_whatif.py            # What-If reasoning engine tests
│       └── test_api_endpoints.py     # FastAPI TestClient endpoint integration tests
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── next.config.mjs
    └── src/
        ├── app/
        │   ├── layout.tsx            # Root mobile container (390px, dark theme)
        │   ├── globals.css           # Tailwind + glassmorphism + waveform styling
        │   ├── page.tsx              # Home dashboard (Briefing, Budget Ring, Top Insights)
        │   ├── upload/page.tsx       # Document upload dropzone & note ingestion
        │   ├── timeline/page.tsx     # Unified 30-day multi-variable timeline feed
        │   ├── insights/page.tsx     # Cross-domain cause-and-effect deep dive
        │   └── whatif/page.tsx       # Prospective What-If simulation laboratory
        ├── components/
        │   ├── Navbar.tsx            # Header with persona & privacy badge
        │   ├── BottomNav.tsx         # Mobile tab bar with active glow
        │   ├── BriefingPlayer.tsx    # Big briefing button with animated audio waveform
        │   ├── BudgetRing.tsx        # Radial SVG budget ring with burn rate warning
        │   ├── VoiceOrb.tsx          # Floating pulsing microphone orb for voice query
        │   ├── UploadDropzone.tsx    # File drag-and-drop & instant note extractor
        │   ├── TimelineFeed.tsx      # Unified feed with event filters & status chips
        │   ├── InsightCard.tsx       # Cause -> Effect chain with evidence events
        │   ├── WhatIfPanel.tsx       # Risk gauge (0-100) & transparent reasoning
        │   └── PrivacyBadge.tsx      # Local privacy modal with 1-click data wipe
        ├── hooks/
        │   ├── useAudioPlayer.ts     # SpeechSynthesis Web Speech TTS controller
        │   └── useVoice.ts           # SpeechRecognition Web Speech STT controller
        └── lib/
            ├── api.ts                # Type-safe API client for backend
            └── types.ts              # Shared TypeScript interfaces
```

---

## ⚡ Quickstart: Run Everything Locally in 60 Seconds

> **Zero API Keys Required.** Everything runs out-of-the-box in `mock` mode with browser Web Speech API.

### Option A: 1-Click Startup (Windows)
Double-click `run.bat` or run:
```cmd
run.bat
```

### Option B: 1-Click Startup (Linux / macOS)
```bash
chmod +x run.sh
./run.sh
```

### Option C: Manual Setup

1. **Start Backend (FastAPI):**
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\pip install -r requirements.txt
venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# On Linux/macOS:
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

2. **Start Frontend (Next.js 14):**
```bash
cd frontend
npm install
npm run dev
```

3. **Open in Browser:**
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000) (Mobile view at 390px recommended!)
- **Backend Swagger API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🧪 Testing & Verification

Run the full backend test suite (unit + integration):
```bash
cd backend
# Windows:
$env:PYTHONPATH="."; venv\Scripts\python -m pytest -v
# Linux/macOS:
PYTHONPATH=. venv/bin/pytest -v
```
**What the tests cover:**
- `test_detectors.py`: Verifies pure-function detectors for late-night spend chain, budget burn projection, and sleep deficit.
- `test_whatif.py`: Verifies transparent reasoning and risk score calculations for multiple student scenarios.
- `test_api_endpoints.py`: Tests all 9 HTTP endpoints (health, events, insights, budget, briefing, whatif, file ingestion, text ingestion, privacy wipe & re-seed).

---

## 🎭 What's Mocked vs. Live

AURA uses an **Abstract Base Class Adapter Pattern** controlled via the environment variable `AURA_MODE=mock|live` (default: `mock`):

| Component | Mock Mode (`AURA_MODE=mock`, default) | Live Mode (`AURA_MODE=live`) |
| :--- | :--- | :--- |
| **LLM Reasoning & Script** | `TemplateLLMService`: template engine that parses intent with regex/keywords, evaluates real student events from SQLite, and produces transparent reasoning chains. | `BedrockLLMService`: adapter stub for AWS Bedrock (Claude). *Integration in progress.* |
| **Speech Output (TTS)** | Browser Web Speech API (`SpeechSynthesis`): zero latency, free, runs client-side. | `ElevenLabsVoiceService`: generates studio-quality audio when `ELEVENLABS_API_KEY` is set. |
| **Speech Input (STT)** | Browser Web Speech API (`SpeechRecognition`, `en-IN`). | *Planned:* ElevenLabs Speech-to-Text via backend. |
| **Document Ingestion** | `mock_extractor.py`: simulates OCR on uploaded files and returns realistic parsed events with confidence scores. | *Planned:* real OCR via AWS Lambda + Bedrock vision. |
| **Natural Language Notes** | `note_parser.py`: regex/heuristic extractor mapping phrases like `"Spent 120 on snacks after late lab"` to typed events. | *Planned:* LLM structured outputs. |

---

## 🔒 Privacy

> The prototype runs fully local for demo reliability. The adapter layer is built so AWS (S3 / Lambda / Bedrock) and ElevenLabs plug in with `AURA_MODE=live`. In a cloud deployment, uploads would go to encrypted per-user S3 storage.

- **Local-First in the Prototype:** All UPI details, attendance records, and sleep logs reside on the user's device in SQLite (`backend/aura.db`).
- **No Third-Party Telemetry:** Speech recognition and speech synthesis execute via the client-side W3C Web Speech API inside the browser.
- **One-Click Erase:** Full compliance with the "Right to be Forgotten" via `DELETE /api/privacy/wipe`.

---

## 🏆 Hackathon Alignment (Track 3: Know Thyself)

AURA directly addresses the core hackathon themes:
1. **Self-Understanding:** Connects disparate biological, financial, and academic indicators that students typically view in silos.
2. **Proactive Intervention:** Surfaces predictive warnings *days in advance* before attendance breaches or bank overdrafts occur.
3. **Voice-First Accessibility:** Hands-free 60-second morning briefing designed for sleepy college mornings.
