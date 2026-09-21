# AquaWatch AI — Citizen Frontend

Citizen-facing UI skeleton for the AquaWatch AI hackathon project (Member 1's
scope only — no backend, database, auth, or AI logic is implemented).

## Stack
Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · lucide-react

## Getting started
```bash
npm install
npm run dev
```
Visit http://localhost:3000. The app expects a backend at the URL in
`NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`) once one exists —
nothing calls it yet.

## Routes
| Route | Page |
|---|---|
| `/` | Landing page. Add `?view=dashboard` to preview the signed-in citizen home (used by "Continue as Citizen" on `/login`) |
| `/login` | Sign in (UI only, no real auth) |
| `/register` | Create account (UI only, no real auth) |
| `/report` | Report a water problem — the core citizen workflow |
| `/my-reports` | List of the citizen's own reports |
| `/reports/[id]` | Report detail + status timeline |
| `/map` | Water Issues Map — Leaflet/OpenStreetMap view of reports, filterable by priority. `?report=AW-1024` centers and opens that report's marker |

## Structure
```
app/                 routes (App Router)
components/citizen/  reusable citizen-only components
  WaterMap.tsx          Leaflet map, client-only (dynamic-imported with ssr:false)
  MapFilters.tsx        priority filter pills for /map
  MapReportPopup.tsx    marker popup content
  MapErrorBoundary.tsx  catches map render failures without crashing the app
lib/citizen-api.ts   typed placeholder API client (NOT wired to a backend)
lib/mock-data.ts     temporary local mock dataset, clearly marked as such
types/report.ts      Category / Priority / ReportStatus / WaterReport types
```

`app/admin/` and `components/admin/` are intentionally not created — that's
Member 4's scope.

## Map dependencies
`leaflet`, `react-leaflet@4` (pinned for React 18 compatibility — v5 requires
React 19) and `@types/leaflet`. Tiles are plain OpenStreetMap raster tiles;
no API key is required. Markers are custom `L.divIcon` colored dots (not the
default Leaflet pin images), which sidesteps the usual broken
`marker-icon.png` path issue under Next.js bundling.

## Connecting the real backend later
Every function in `lib/citizen-api.ts` currently throws with a "not
connected yet" message. Each has a `TODO(backend)` comment naming the
expected endpoint and method — replace the body with a real `fetch()` call
and swap `MOCK_REPORTS` / the mock submit flow in `app/report/page.tsx` for
the real calls. No component APIs need to change.

## Design notes
Deep navy (`ink`) + water teal (`teal`) on a light, near-white background;
status colors (green/amber/orange/red) are reserved for severity/priority
only, everywhere else stays neutral. Headings use Space Grotesk, body text
uses Inter (loaded from Google Fonts in `app/globals.css`).
