# Skill-Bridge Career Navigator

**Candidate Name:** Zaid  
**Scenario Chosen:** #2 — Skill-Bridge Career Navigator  
**Estimated Time Spent:** ~6 hours  
**Video Demo:** _[YouTube link here]_

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- A Google Gemini API key ([get one free](https://aistudio.google.com/apikey))

### Run Commands
```bash
cd skill-bridge/client
npm install --legacy-peer-deps

# Add your Gemini API key
# Edit src/environments/environment.ts → geminiApiKey: 'YOUR_KEY'

ng serve
# Open http://localhost:4200
```

### Test Commands
```bash
cd skill-bridge/client
npx ng test --no-watch --browsers=ChromeHeadless
# 29 specs, 0 failures
```

---

## AI Disclosure

- **Did you use an AI assistant?** Yes — GitHub Copilot for code generation, debugging, and boilerplate scaffolding.
- **How did you verify the suggestions?** Every suggestion was reviewed for correctness against Angular 20 APIs, Gemini SDK docs, and Tailwind v4 syntax. AI-generated data structures were manually validated against the TypeScript interfaces. All AI outputs in the app itself are validated/sanitized before rendering (URL whitelisting, score clamping, section backfill).
- **One example of a suggestion rejected or changed:** Copilot initially suggested a single Gemini API call for the Resume Scorer that combined analysis + Google Search grounding in one prompt. The model consistently skipped searching and hallucinated course URLs and LinkedIn profiles. I rejected this and split it into two separate calls — one for analysis (no search) and one dedicated to searching (with `googleSearch` tool) — which forced the model to actually use the search tool and return real URLs.

---

## Tradeoffs & Prioritization

### What did you cut to stay within the time limit?
- **No backend** — All logic runs client-side. The Gemini API key lives in the Angular environment file. Acceptable for a demo, not for production.
- **No user accounts / auth** — Profile is stored in localStorage only.
- **No real LinkedIn data** — Career Path Explorer uses 49+ hand-crafted mock profiles instead of real scraped data.
- **No PDF resume upload** — Only plain-text resume paste is supported.
- **No cover letter generator or resume rewriter** — Identified as future features but cut for time.
- **Removed Compare and Interview tabs** — Scoped down to 4 core features: Profile, Dashboard, Career Paths, Resume Scorer.

### What would you build next if you had more time?
- Backend API proxy (Cloudflare Worker / Vercel Edge Function) to hold the API key server-side and cache AI responses
- User accounts with a real database instead of localStorage
- PDF resume upload with parsing
- AI resume rewriter that rephrases bullet points to match job description language
- Cover letter generator from profile + job description
- Progress tracking — mark skills as "learned" and track improvement over time
- Export gap analysis as PDF

### Known limitations
- **API key in client bundle** — visible in browser DevTools. Production would need a backend proxy.
- **localStorage ~5MB limit** — large resumes or many analyses could hit this.
- **Google Search grounding quality varies** — some searches return fewer results; LinkedIn profile results depend on public profile availability.
- **Mock career path data is static** — doesn't reflect real market trends.
- **No offline support** — AI features require internet connectivity. Non-AI features (dashboard, career paths) work offline after initial load.

---

## Overview

Skill-Bridge addresses the "skills gap" problem — students and early-career professionals struggle to map their current abilities to the specific requirements of job postings. The platform:

1. Parses a user's resume using AI to extract skills and employment history
2. Compares their profile against role requirements to surface gaps
3. Shows how real professionals reached the same target role
4. Scores their resume against specific job descriptions with AI-powered feedback
5. Recommends real courses and real people to connect with via Google Search grounding

### Target Audience

| Persona | Pain Point | How Skill-Bridge Helps |
|---|---|---|
| **Recent Graduates** | "Job posts ask for things I've never heard of" | Prioritized skill gaps with free course recommendations |
| **Career Switchers** | "What from my background transfers to tech?" | Shows which existing skills already apply and the shortest path forward |
| **Self-Taught Developers** | "I've built projects but don't know what I'm missing" | Matches skills against real job requirements and discovers blind spots |

---

## Features

### 1. AI-Powered Resume Parser (`/profile`)
- User pastes resume as text → Gemini extracts skills (mapped to known skill IDs with proficiency levels) and full employment history
- Falls back to keyword-based extraction if no API key is configured
- Resume text is persisted in localStorage for reuse in Resume Scorer

### 2. Gap Analysis Dashboard (`/dashboard`)
- Compares user skills against target role requirements
- Match percentage score, radar chart visualization
- Skills split into **Matched**, **Must-Have** (missing), and **Recommended** (missing)
- Weighted by how frequently each skill appears in real job descriptions

### 3. Career Path Explorer (`/paths`)
- Select a dream role and optionally a target company
- Flow diagram showing how 49+ professionals reached that role: Education → Previous Employment → Target Role
- Top 4 most common nodes per layer, aggregate insights (avg years, common certs, % with no degree)

### 4. AI Resume Scorer (`/resume-scorer`)
- Auto-loads resume from profile (no re-entry)
- User pastes a job description → Gemini analyzes in two calls:
  - **Call 1 (analysis):** Score (0-100), matched/missing keywords, 4 section breakdowns, prioritized tips
  - **Call 2 (search with Google grounding):** Real courses with verified URLs, real LinkedIn people & recruiters at the target company
- All AI responses validated: URL whitelisting, score clamping, section backfill

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Angular 20 (standalone components) | Signal-based reactivity, lazy-loaded routes, no NgModules |
| **Language** | TypeScript (strict mode) | Type safety for data models and AI response parsing |
| **Styling** | Tailwind CSS 4 | Utility-first, dark mode, no custom CSS |
| **Charts** | Chart.js + ng2-charts | Radar chart on dashboard |
| **AI** | Google Gemini (`@google/genai` SDK) | `gemini-3-flash-preview` + Google Search grounding |
| **State** | Angular Signals + localStorage | No external state library needed |
| **Testing** | Karma + Jasmine | Angular's built-in test runner |
| **Build** | Angular CLI + esbuild | Fast builds, tree-shaking |

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Angular App                        │
│                                                      │
│  ┌─────────┐  ┌───────────┐  ┌──────────┐  ┌──────┐│
│  │ Landing  │  │  Profile   │  │Dashboard │  │Paths ││
│  │  Page    │  │   Page     │  │  Page    │  │ Page ││
│  └─────────┘  └─────┬──────┘  └────┬─────┘  └──┬───┘│
│                      │              │            │    │
│               ┌──────▼──────┐ ┌─────▼─────┐     │    │
│               │  Profile    │ │    Gap     │     │    │
│               │  Service    │ │  Analysis  │     │    │
│               │ (signals +  │ │  Service   │     │    │
│               │ localStorage│ └────────────┘     │    │
│               └──────┬──────┘                    │    │
│                      │                           │    │
│               ┌──────▼──────┐          ┌─────────▼──┐│
│               │   Gemini    │          │   Mock     ││
│               │   Service   │          │  Profiles  ││
│               │ (AI calls)  │          │   Data     ││
│               └──────┬──────┘          └────────────┘│
│                      │                               │
└──────────────────────┼───────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  Gemini API    │
              │ + Google Search│
              └────────────────┘
```

### Data Flow
1. **Profile Creation**: Resume → `GeminiService.parseResume()` → AI extracts skills & employment → `ProfileService` stores in signals + localStorage
2. **Gap Analysis**: Skills + target role → `GapAnalysisService` compares against role requirements → Dashboard renders gaps
3. **Career Paths**: Role selection → filters mock profiles → aggregates into flow nodes → SVG flow diagram
4. **Resume Scoring**: Stored resume + job description → `GeminiService.analyzeResume()` (Call 1: analysis, Call 2: search) → renders results

---

## Testing

### Test Suites

| Suite | Tests | Covers |
|---|---|---|
| `ProfileService` | 15 | Skill CRUD, employment, resume text, localStorage persistence, reset |
| `GapAnalysisService` | 10 | Role selection, gap computation, 100% match, sorting, radar data |
| `GeminiService` | 4 | Service creation, unconfigured guards, error handling |
| **Total** | **29** | |

### Happy Path Tests
- Profile initializes empty, skills can be added/removed/updated, target role can be set
- Gap analysis returns correct matched/missing skills, 100% match when all skills present
- Must-have gaps are sorted by frequency descending
- Radar data has correct shape when role is selected
- Resume text persists across the profile

### Edge Case Tests
- Duplicate skills are rejected (keeps original proficiency)
- Removing/updating a non-existent skill is a no-op
- Invalid role ID returns null analysis and null radar data
- Corrupted localStorage returns empty defaults
- Partial localStorage data fills in missing fields with defaults
- Empty resume text is handled gracefully
- Gemini methods throw clear errors when no API key is configured

### Run
```bash
npx ng test --no-watch --browsers=ChromeHeadless
# TOTAL: 29 SUCCESS
```

---

## AI Integration

### Two-Call Architecture for Resume Scoring

| Call | Model | Search | Purpose |
|---|---|---|---|
| Resume Parsing | `gemini-3-flash-preview` | No | Extract skills + employment from resume |
| Scoring (analysis) | `gemini-3-flash-preview` | No | Score, keywords, sections, tips |
| Scoring (search) | `gemini-3-flash-preview` | `googleSearch` | Real courses, real LinkedIn people/recruiters |

**Why two calls?** A single combined prompt caused the model to skip searching and hallucinate URLs. Splitting forces the search call to actually use the Google Search tool.

### Fallback Behavior
- No API key → resume parsing falls back to keyword matching, Resume Scorer shows setup notice
- Search call fails → analysis still renders, courses/people arrays are empty
- All AI responses are validated before rendering (URL whitelisting, score clamping, deduplication)

---

## Project Structure

```
src/app/
├── components/              # Shared UI (navbar, radar-chart, skill-tag, etc.)
├── data/                    # Mock data (50+ skills, 7 roles, 49+ profiles)
├── models/types.ts          # All TypeScript interfaces
├── pages/                   # Lazy-loaded route components
│   ├── landing/             # Home page
│   ├── profile/             # Resume paste + AI parse + skill entry
│   ├── dashboard/           # Gap analysis + radar chart
│   ├── paths/               # Career path flow diagram
│   └── resume-scorer/       # AI resume scorer
├── services/
│   ├── profile.service.ts   # User state (signals + localStorage)
│   ├── gap-analysis.service.ts  # Skill gap computation
│   └── gemini.service.ts    # Gemini AI integration
└── app.routes.ts            # Route definitions
```

---

## Design Decisions

| Decision | Why | Tradeoff |
|---|---|---|
| **Client-side only** | Zero infra cost, instant setup, data on user's machine | API key exposed in bundle |
| **Mock profiles** | No API costs, no legal issues, predictable demo data | Static, doesn't reflect real trends |
| **Two-call AI** | Search call actually triggers Google Search | Doubles API cost and latency |
| **Angular Signals** | Zero deps for state, simpler than NgRx | No time-travel debugging |
| **Tailwind (no component lib)** | Full design control, smaller bundle | More verbose templates |
| **Permanent dark mode** | Simpler, consistent demos, dev audience preference | Some users prefer light mode |
