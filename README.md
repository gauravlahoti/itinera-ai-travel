# Itinera — AI Travel Planner

> **Bespoke journeys, crafted by AI.** Describe your trip in plain language and receive a complete, day-by-day itinerary with curated activities, dining, logistics, an interactive map, and a smart packing list — all in under 30 seconds.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=google)](https://ai.google.dev)
[![Cloud Run](https://img.shields.io/badge/Cloud_Run-Deployed-34A853?logo=google-cloud)](https://cloud.google.com/run)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tests](https://img.shields.io/badge/Tests-34_passing-brightgreen?logo=vitest)](./src/lib/__tests__)
[![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Google Services](#google-services)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Security](#security)
- [Accessibility](#accessibility)
- [Deployment](#deployment)

---

## Features

| Feature | Description |
|---|---|
| **AI Trip Generation** | Natural-language prompt → structured multi-day itinerary via Gemini 2.5 Flash |
| **Vibe Selection** | 6 travel personas: Foodie, Adventure, Slow Travel, Cultural, Nightlife, Family |
| **Interactive Map** | Leaflet map with colour-coded day routes, teardrop pins, and dashed polylines |
| **Drag-and-Drop** | Reorder activities within any day using `@dnd-kit` |
| **Per-Day Feedback** | Leave comments on specific days; AI regenerates only those days |
| **Immersive Loading** | 10-step animated overlay during generation; 7-step overlay during refinement |
| **Budget Tracker** | Per-category cost breakdown with visual bar charts |
| **Logistics Panel** | Visa info, currency rates, power plugs, local phrases, emergency numbers |
| **PDF Export** | Full itinerary download via jsPDF |
| **Error Handling** | Next.js `error.tsx` boundary + `not-found.tsx` + `ErrorBoundary` component |

---

## Architecture

```
User Prompt
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  Next.js App Router (src/app/)                      │
│                                                     │
│  page.tsx ──── POST /api/generate-trip ────────────►│
│                        │                            │
│                        ▼                            │
│              src/lib/ai/index.ts                    │
│              GoogleGenAI SDK                        │
│              Gemini 2.5 Flash                       │
│              responseSchema (Trip JSON)             │
│                        │                            │
│                        ▼                            │
│              Structured Trip Object                 │
│                        │                            │
│                        ▼                            │
│  Zustand Store ◄── setCurrentTrip()                │
│        │                                            │
│        ▼                                            │
│  /trip/[id]/page.tsx                                │
│  ├── Timeline Tab  (DnD activities + feedback)      │
│  ├── Budget Tab    (cost breakdown)                 │
│  ├── Logistics Tab (visa, phrases, packing)         │
│  └── TripMap       (Leaflet, OpenStreetMap tiles)   │
└─────────────────────────────────────────────────────┘

Refinement Flow:
  User feedback → POST /api/refine-trip → refineTrip() → updated Trip → store
```

### Data Flow

1. **Landing page** (`src/app/page.tsx`) — user enters prompt, selects vibes, submits form
2. **API route** (`/api/generate-trip`) — validates input, calls `generateTrip(prompt, vibes)`
3. **AI layer** (`src/lib/ai/index.ts`) — sends structured prompt to Gemini with a `responseSchema` matching the `Trip` type; receives typed JSON
4. **State** (`src/store/index.ts`) — Zustand stores the `Trip` in memory; router navigates to `/trip/[id]`
5. **Trip page** (`src/app/trip/[id]/page.tsx`) — renders split-pane: timeline + DnD on the left, Leaflet map on the right
6. **Refinement** — per-day feedback submitted to `/api/refine-trip`; only changed days are regenerated

---

## Project Structure

```
itinera/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Landing page — prompt + vibe selection
│   │   ├── layout.tsx                # Root layout — fonts, metadata, skip-nav
│   │   ├── error.tsx                 # Global error boundary (App Router)
│   │   ├── not-found.tsx             # 404 page
│   │   ├── globals.css               # Tailwind base styles
│   │   ├── api/
│   │   │   ├── generate-trip/
│   │   │   │   └── route.ts          # POST — generate a new trip
│   │   │   └── refine-trip/
│   │   │       └── route.ts          # POST — refine existing trip with feedback
│   │   └── trip/[id]/
│   │       └── page.tsx              # Trip detail — timeline, map, budget, logistics
│   │
│   ├── components/
│   │   ├── ErrorBoundary.tsx         # React class-based error boundary
│   │   ├── GeneratingOverlay.tsx     # Immersive loading overlay (generate + refine)
│   │   ├── trip/
│   │   │   ├── TripMap.tsx           # Leaflet map — pins, polylines, fly-to
│   │   │   ├── SortableActivity.tsx  # Drag-and-drop activity card (@dnd-kit)
│   │   │   ├── ActivityDetailPanel.tsx # Slide-in detail panel with alternatives
│   │   │   └── BudgetBar.tsx         # Budget breakdown by category
│   │   └── ui/
│   │       └── button.tsx            # shadcn/ui button primitive
│   │
│   ├── lib/
│   │   ├── ai/
│   │   │   └── index.ts              # Gemini wrapper — generateTrip + refineTrip
│   │   ├── pdf.ts                    # jsPDF export — exportTripToPDF()
│   │   ├── seed.ts                   # DEMO_TRIP — hardcoded Japan trip for offline use
│   │   ├── utils.ts                  # cn() — Tailwind class merge utility
│   │   └── __tests__/
│   │       ├── utils.test.ts         # cn() utility tests
│   │       ├── seed.test.ts          # DEMO_TRIP data integrity tests
│   │       ├── store.test.ts         # Zustand store action tests
│   │       └── ai-schema.test.ts     # Trip schema validation tests
│   │
│   ├── store/
│   │   └── index.ts                  # Zustand store — currentTrip + actions
│   │
│   ├── types/
│   │   └── index.ts                  # TypeScript types — Trip, Day, Activity, etc.
│   │
│   └── test/
│       └── setup.ts                  # Vitest global setup
│
├── .env.example                      # Environment variable template
├── .gitignore                        # Excludes .env*, node_modules, .next
├── cloudbuild.yaml                   # Google Cloud Build pipeline
├── Dockerfile                        # Multi-stage build (deps → builder → runner)
├── next.config.ts                    # Security headers + standalone output
├── vitest.config.ts                  # Test configuration
└── tsconfig.json                     # TypeScript strict mode
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) | Server components, API routes, file-based routing |
| Language | TypeScript 5 (strict) | Type safety across frontend and backend |
| AI | Google Gemini 2.5 Flash via `@google/genai` | Structured JSON trip generation and refinement |
| Styling | Tailwind CSS v4 + shadcn/ui | Utility-first design system |
| Animation | Framer Motion v12 | Page transitions, overlay animations |
| Map | Leaflet + react-leaflet | Interactive map with OpenStreetMap tiles (no API key) |
| State | Zustand v5 | Lightweight client state — trip data + DnD actions |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable | Accessible drag-and-drop activity reordering |
| PDF | jsPDF + jspdf-autotable | Client-side itinerary export |
| Testing | Vitest + @vitest/coverage-v8 | Unit and schema validation tests |
| Deploy | Google Cloud Run + Cloud Build | Containerised, auto-scaling serverless deployment |

---

## Google Services

Itinera is built end-to-end on Google Cloud infrastructure:

| Service | Usage |
|---|---|
| **Gemini 2.5 Flash** | Powers both `generateTrip()` and `refineTrip()` with structured JSON output via `responseSchema` |
| **Google AI Studio** | API key management for local development |
| **Cloud Run** | Serverless container hosting — 0 min instances, scales to 10, 300s timeout |
| **Cloud Build** | CI/CD pipeline defined in `cloudbuild.yaml` — builds Docker image, pushes to Artifact Registry, deploys |
| **Artifact Registry** | Stores versioned Docker images (`us-central1-docker.pkg.dev`) |
| **Secret Manager** | Stores `GOOGLE_API_KEY` as a managed secret; injected into Cloud Run at runtime via `--set-secrets` |

### Gemini Integration Details

```typescript
// Dual-auth: API key for dev, Vertex AI for GCP
const ai = process.env.GOOGLE_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })
  : new GoogleGenAI({ vertexai: true, project, location });

// Structured output — response matches Trip type exactly
await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: prompt,
  config: {
    responseMimeType: "application/json",
    responseSchema: tripSchema,  // enforces type safety at the AI layer
  },
});
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Google AI Studio API key](https://aistudio.google.com/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/gauravlahoti/itinera-ai-travel.git
cd itinera-ai-travel

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local and add your GOOGLE_API_KEY

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — or click **"Or try a demo"** to load the offline Tokyo itinerary without an API key.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_API_KEY` | Yes (local) | Google AI Studio API key for Gemini |
| `GOOGLE_CLOUD_PROJECT` | Vertex AI only | GCP project ID |
| `GOOGLE_CLOUD_LOCATION` | Vertex AI only | GCP region (e.g. `us-central1`) |

> **Security note:** Never commit `.env.local`. It is excluded by `.gitignore`. On Cloud Run, the key is injected from Secret Manager at runtime — it never appears in the container image or source code.

---

## API Reference

### `POST /api/generate-trip`

Generates a new trip itinerary from a natural-language prompt.

**Request body**

```json
{
  "prompt": "7 days in Japan — mix of Tokyo chaos and Kyoto calm",
  "vibes": ["foodie", "cultural"]
}
```

| Field | Type | Constraints |
|---|---|---|
| `prompt` | `string` | Required, max 500 characters |
| `vibes` | `string[]` | Optional; allowed values: `foodie`, `adventure`, `slow`, `cultural`, `nightlife`, `family` |

**Response** — `Trip` object (see [Types](#types))

**Error responses**

| Status | Condition |
|---|---|
| `400` | Missing prompt, empty prompt, or prompt exceeds 500 chars |
| `500` | AI generation failure (message included) |

---

### `POST /api/refine-trip`

Refines specific days of an existing trip based on per-day feedback.

**Request body**

```json
{
  "trip": { /* existing Trip object */ },
  "feedback": {
    "day-1": "Replace the museum with something outdoors",
    "day-3": "I prefer budget-friendly restaurants"
  }
}
```

| Field | Type | Constraints |
|---|---|---|
| `trip` | `Trip` | Required, must have valid `days` array |
| `feedback` | `Record<string, string>` | At least one entry; values trimmed and capped at 500 chars |

**Behaviour:** Days with no feedback are returned unchanged. Only days referenced in `feedback` are regenerated.

**Error responses**

| Status | Condition |
|---|---|
| `400` | Missing trip, invalid trip structure, or no feedback provided |
| `500` | AI refinement failure |

---

## Types

Core types are defined in `src/types/index.ts`:

```typescript
Trip {
  id, title, destination[], startDate, endDate,
  travelers, vibes[], budget, pace,
  days[], logistics, packingList[], collaborators[]
}

Day {
  id, dayNumber, date, city,
  weather { tempC, condition, icon },
  energyScore: "light" | "balanced" | "packed" | "punishing",
  activities[], notes?
}

Activity {
  id, type, name, description, reasoning,
  startTime, durationMin,
  location { lat, lng, address, neighborhood },
  cost { amount, currency, perPerson },
  photos[], tags[]
}
```

---

## Testing

```bash
npm test                 # run all tests once
npm run test:watch       # watch mode
npm run test:coverage    # generate coverage report
```

### Test coverage

| File | What it tests |
|---|---|
| `utils.test.ts` | `cn()` class merge — conflict resolution, falsy values, conditionals |
| `seed.test.ts` | `DEMO_TRIP` data integrity — required fields, structure, budget |
| `store.test.ts` | Zustand store — `setCurrentTrip`, `reorderActivities`, initial state |
| `ai-schema.test.ts` | Trip schema validation — coordinate bounds, enum values, sequential days, packing categories |
| `validation.test.ts` | API input sanitization — prompt length, vibe allowlist, feedback trimming |

**34 tests across 5 files — zero mocks, all real logic.**

---

## Security

| Measure | Implementation |
|---|---|
| **Secret management** | `GOOGLE_API_KEY` stored in Google Secret Manager; never in code or image |
| **HTTP security headers** | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, CSP via `next.config.ts` |
| **Input validation** | Prompt length capped at 500 chars; vibes filtered against allowlist; feedback sanitized and capped per entry |
| **No secrets in repo** | `.gitignore` excludes all `.env*` files; `.env.example` contains only placeholders |
| **Container security** | Docker image runs as non-root user (uid 1001); minimal alpine base image |
| **Dependency hygiene** | No runtime secrets in `package.json`; prod/dev dependencies cleanly separated |

---

## Accessibility

- **Skip navigation** — "Skip to main content" link at top of every page (visible on focus)
- **Semantic HTML** — `<main>`, `<header>`, `<section>`, `<nav>` used throughout
- **ARIA roles** — `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls` on tab navigation
- **ARIA labels** — all icon-only buttons have `aria-label`; feedback textareas have descriptive `aria-label`
- **Toggle state** — vibe selector buttons use `aria-pressed`
- **Error alerts** — error boundaries use `role="alert"` and `aria-live="assertive"`
- **Decorative content** — emoji icons marked `aria-hidden="true"`
- **Focus management** — all interactive elements have visible focus rings (`focus:ring-2`)
- **Keyboard navigation** — full keyboard support via DnD kit's `KeyboardSensor`

---

## Deployment

### Google Cloud Run (production)

```bash
# 1. Store API key in Secret Manager
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create google-ai-api-key --data-file=-

# 2. Grant Cloud Run access to the secret
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
gcloud secrets add-iam-policy-binding google-ai-api-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# 3. Build and deploy via Cloud Build
gcloud builds submit --config cloudbuild.yaml .
```

The Cloud Build pipeline (`cloudbuild.yaml`) automatically:
1. Builds the Docker image (multi-stage: `deps` → `builder` → `runner`)
2. Pushes versioned + `latest` tags to Artifact Registry
3. Deploys to Cloud Run with Secret Manager injection

### Local container test

```bash
docker build -t itinera .
docker run -p 8080:8080 -e GOOGLE_API_KEY=your_key itinera
```

### Cloud Run configuration

| Setting | Value |
|---|---|
| Region | `us-central1` |
| Memory | 1 GiB |
| CPU | 1 vCPU |
| Min instances | 0 (scale to zero) |
| Max instances | 10 |
| Timeout | 300s |
| Port | 8080 |

---

## Scripts

```bash
npm run dev           # Start dev server with Turbopack (http://localhost:3000)
npm run build         # Production build (Next.js standalone output)
npm run start         # Start production server
npm run lint          # ESLint
npm test              # Run Vitest test suite
npm run test:watch    # Vitest in watch mode
npm run test:coverage # Vitest with V8 coverage report
```

---

*Built for the Google Cloud AI Hackathon · Powered by Gemini 2.5 Flash · Deployed on Cloud Run*
