# AI Planning Agent

A multi-agent AI application that transforms any problem statement into a structured strategic execution plan. Built with Next.js and powered by Groq (Llama 3.3 70B).

## Live Demo

Deployed on Vercel → https://ai-planning-agent-8l22779im-mirza-ikrams-projects.vercel.app/

---

## What It Does

You type a problem like _"Build a creator marketplace platform"_ and three specialised AI agents work in sequence to produce a full strategic report with four sections, stakeholder analysis, key risks, and success metrics — all editable with AI and exportable to DOCX or PDF.

---

## Agent Architecture

The core of this app is a **3-agent agentic pipeline**. Each agent has one focused job and passes its output to the next.
```
User Input
    │
    ▼
┌─────────────────┐
│  Planner Agent  │  Breaks problem into components,
│  /api/agent/plan│  identifies complexity & timeline
└────────┬────────┘
         │ planData
         ▼
┌──────────────────┐
│  Insight Agent   │  Enriches with stakeholders,
│/api/agent/insight│  risks, market context & metrics
└────────┬─────────┘
         │ insightData
         ▼
┌──────────────────┐
│ Execution Agent  │  Writes the full structured
│/api/agent/execute│  report across 4 sections
└────────┬─────────┘
         │ finalReport
         ▼
  Structured Report UI
```

A single orchestrator route `/api/agent/run` calls all three agents in sequence — the output of each becomes the input of the next.

---

## Features

- **3-Agent Pipeline** — Planner → Insight → Execution, each with a focused prompt
- **Structured Report** — Problem Breakdown, Stakeholders, Solution Approach, Action Plan
- **AI Section Editing** — Edit any section individually with a custom instruction
- **DOCX Export** — Real Word document with proper headings and formatting via `docx` library
- **PDF Export** — Styled HTML report opened in browser print dialog
- **Auto Save** — Reports saved to localStorage, accessible from the home screen
- **Recent Reports** — Reopen any previous report without regenerating

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| AI Provider | Groq API — Llama 3.3 70B |
| Styling | Tailwind CSS + custom CSS variables |
| DOCX Export | `docx` npm library |
| PDF Export | Browser print via styled HTML |
| Storage | localStorage (reports) + sessionStorage (active session) |
| Deployment | Vercel |

---

## Project Structure
```
src/
├── app/
│   ├── page.js                  ← Landing page / input UI
│   ├── report/
│   │   └── page.js              ← Report display + edit UI
│   └── api/
│       ├── agent/
│       │   ├── run/route.js     ← Orchestrator — calls all 3 agents
│       │   ├── plan/route.js    ← Planner Agent
│       │   ├── insight/route.js ← Insight Agent
│       │   ├── execute/route.js ← Execution Agent
│       │   └── edit/route.js    ← AI section editor
│       └── export/
│           └── route.js         ← DOCX + PDF export
├── lib/
│   ├── groq.js                  ← Groq client (shared)
│   ├── storage.js               ← localStorage helpers
│   └── exportHelpers.js         ← DOCX + PDF generation logic
└── types/
    └── report.js                ← JSDoc type definitions
```

---

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/ai-planning-agent.git
cd ai-planning-agent
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:
```bash
GROQ_API_KEY=your_groq_api_key_here
```

Get a free Groq API key at [console.groq.com](https://console.groq.com) — no billing required.

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/agent/run` | POST | Orchestrates the full 3-agent chain |
| `/api/agent/plan` | POST | Planner Agent — breaks down the problem |
| `/api/agent/insight` | POST | Insight Agent — enriches with context |
| `/api/agent/execute` | POST | Execution Agent — writes the report |
| `/api/agent/edit` | POST | Edits a single report section with AI |
| `/api/export` | POST | Generates DOCX or PDF from report data |

---

## Key Design Decisions

**Why 3 separate agents instead of one prompt?**
Each agent has a focused job. Separation makes each output cleaner, easier to debug, and allows the chain to build context progressively. A single monolithic prompt produces weaker results.

**Why Groq + Llama 3.3?**
Groq is completely free with no credit card required. It's also extremely fast — important when making 3 sequential AI calls per report generation.

**Why localStorage for report persistence?**
SessionStorage clears on tab close — fine for the active report. LocalStorage keeps the history of reports so users can revisit without regenerating, which costs API calls.

**Why browser print for PDF instead of a PDF library?**
Libraries like Puppeteer are heavy and complex to deploy on Vercel. Browser print produces clean results with zero added dependencies.

---


## Author

Built by Mirza Ikram (https://github.com/ikrammirza)