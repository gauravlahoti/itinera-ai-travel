# Itinera — AI Travel Planner

Bespoke, AI-generated itineraries in seconds. Describe your trip in plain language, pick your vibes, and Itinera crafts a day-by-day plan complete with activities, dining, logistics, packing list, and an interactive map.

**Built with:** Next.js 15 · React 19 · Gemini 2.5 Flash · Leaflet · Framer Motion · Zustand · Tailwind CSS v4

---

## Features

- **Natural-language trip generation** — describe any trip and get a structured, multi-day itinerary
- **Vibe selection** — Foodie, Adventure, Slow Travel, Cultural, Nightlife, Family
- **Interactive map** — colour-coded day routes, clickable pins, activity detail panel
- **Drag-and-drop reordering** — rearrange activities within any day
- **Per-day feedback & AI refinement** — leave comments on specific days and regenerate only those days
- **Budget tracker** — per-category cost breakdown
- **Logistics panel** — visa, currency, power plugs, local phrases, emergency numbers, packing list
- **PDF export** — download the full itinerary
- **Immersive loading screen** — step-by-step overlay for both generation and refinement

## Getting Started

1. **Clone the repo**

```bash
git clone https://github.com/gauravlahoti/itinera-ai-travel.git
cd itinera-ai-travel
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your [Google AI Studio API key](https://aistudio.google.com/apikey):

```
GOOGLE_API_KEY=your_key_here
```

4. **Run the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Google Cloud Run)

The app ships with a multi-stage Dockerfile and a Cloud Build pipeline.

```bash
# Store your API key in Secret Manager
gcloud secrets create google-ai-api-key --data-file=<(echo -n "YOUR_KEY")

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding google-ai-api-key \
  --member="serviceAccount:$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Build & deploy
gcloud builds submit --config cloudbuild.yaml .
```

## Project Structure

```
src/
  app/
    page.tsx                  # Landing page — prompt + vibe selection
    trip/[id]/page.tsx        # Trip detail — timeline, map, budget, logistics
    api/
      generate-trip/route.ts  # POST /api/generate-trip
      refine-trip/route.ts    # POST /api/refine-trip
  components/
    GeneratingOverlay.tsx     # Immersive loading overlay (generate + refine modes)
    trip/
      TripMap.tsx             # Leaflet map with day routes and pins
      SortableActivity.tsx    # Drag-and-drop activity card
      ActivityDetailPanel.tsx # Slide-in detail panel
      BudgetBar.tsx           # Budget breakdown
  lib/
    ai/index.ts               # Gemini 2.5 Flash — generateTrip + refineTrip
    pdf.ts                    # jsPDF export
    seed.ts                   # Demo trip data
  store/index.ts              # Zustand store
  types/index.ts              # Trip, Day, Activity types
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| AI | Google Gemini 2.5 Flash via `@google/genai` |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animations | Framer Motion v12 |
| Map | Leaflet + react-leaflet (OpenStreetMap tiles) |
| State | Zustand v5 |
| DnD | @dnd-kit/core + @dnd-kit/sortable |
| PDF | jsPDF |
| Deploy | Google Cloud Run + Cloud Build |

---

*Itinera — Bespoke Journeys, Crafted by AI*
