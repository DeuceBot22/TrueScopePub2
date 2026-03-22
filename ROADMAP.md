# TrueScope Development Roadmap (Updated March 2026)

**Vision**  
TrueScope is a **temporal + geographic investigative knowledge graph** — an "investigative OS" where entities, claims, evidence, and events live on both a timeline **and** a 3D globe. Inspired by the Spatial Intelligence spy satellite simulator, we want real geographic context (one mode is fully globe-based) so investigators can literally "fly over" cases and see relationships in space and time.

No more soul-sucking manual data entry. AI agents will ingest research, extract structured data, and feed the graph automatically.

---

## Current Status (as of March 2026)
- Core data models (Entity, Claim, Evidence, Event) working
- 2D force-graph visualization (react-force-graph-2d)
- Basic inspector + session-only editing
- Backend (Express + Drizzle + PostgreSQL) functional
- Frontend (React + Vite + Tailwind + ShadCN + Zustand)
- **Biggest pains**: No persistence on edits, no real globe, manual data entry is repetitive garbage, UI feels dated

---

## Phase 1 — Stability & Persistence (2-3 days)
**Goal**: Stop losing work. Make the app reliable.
- Persistent entity/claim/evidence/event editing (Zustand → API → DB)
- Fix dev server setup (clear localhost:5000 instructions)
- Basic auth improvements + error handling
- Update PROJECT_STATUS.md after completion

**Milestone**: Everything you create actually saves.

---

## Phase 2 — Globe Visualization + Geographic Mode (Priority #1 — 1 week)
**Goal**: Replace 2D graph with a 3D globe so one mode is fully geographically aware.
- Switch to `react-globe.gl` or `@react-three/fiber` + `three-globe` (or Google 3D Tiles if we want photorealistic later)
- Entities plotted as 3D points with lat/long
- Claims as arcs between locations
- Events as glowing markers with timestamps
- New **Globe Mode** (toggle like the simulator's night-vision/FLIR modes)
- Free-float / Unverified / Verified + **Geographic** mode
- Zoom/pan/rotate like the spy satellite sim

**Tech**: Add `react-globe.gl` + `d3-geo` for projections.

---

## Phase 3 — UI Overhaul (Inspired by Spy Satellite Simulator — 5-7 days)
**Goal**: Make the interface stop sucking.
- Military/polished shader-style modes (dark theme, CRT scan lines optional, high-contrast overlays)
- Floating inspector panel that follows globe clicks
- Context menus on globe nodes
- Real-time feel (smooth animations, particle connections)
- Drag-and-drop evidence + auto-tagging
- Keyboard shortcuts everywhere

**Milestone**: It feels like the spy satellite demo — powerful and fun to use.

---

## Phase 4 — AI Agent Ingestion Layer (Kill the Monotony — 1-2 weeks)
**Goal**: Never manually type entity/claim/event data again.
- Build `script/ingest-agent.ts` + `/api/import` endpoint
- n8n or Manus-style agent that:
  - Watches X/news/RSS for your watchlist entities
  - Uses Grok/Claude to extract structured data (matching our shared/types)
  - Auto-creates entities/claims/events/evidence with confidence scores
  - Posts to your DB + notifies only on high-value hits
- Human review queue for uncertain items
- Daily scheduled runs

**This is the "monotonous shit that sucks ass" killer.**

---

## Phase 5 — Timeline + Intelligence (2 weeks)
- Full interactive timeline (syncs with globe)
- AI pattern detection, relationship suggestions, anomaly alerts
- Cluster detection + path finding on globe
- Evidence weighting & reliability scoring

---

## Phase 6 — Production & Collaboration
- Multiple workspaces / case boards
- Export reports + bounty system hooks
- Team sharing
- Offline mode improvements

---

## Long-Term Vision
TrueScope becomes the **geographic-temporal investigative platform** investigators actually want to live in — globe + timeline + AI agents doing the boring research so you can focus on insight.

---

**Next Immediate Actions (do these today)**
1. Run `npm run dev:client` to get the UI back
2. Commit this new ROADMAP.md
3. Open the repo in Cursor and run the Phase 2 globe prompt (I’ll give you the exact one next)

---

We now have a **clear, prioritized path**. No more vague "what next" stress.

Tell me:
- Do you want me to generate the **exact vibe prompt** for Cursor to add the globe component right now?
- Or start with the AI ingestion agent script first?
- Or anything else before we commit this roadmap?

We’re about to turn TrueScope into something that actually feels like the spy satellite simulator — but for investigations. Let’s go. 🚀
