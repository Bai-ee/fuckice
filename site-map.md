# ICERR UI Site Map (ASCII)

Purpose: master blueprint (no styling applied yet) showing where every available dataset will surface across the site. Use as a checklist for future Frox-derived UI work.

## Data Inventory (current snapshot)
- Rapid response directory: `data/locations.json` (per-state contacts + links), `data/states.json` (states with coverage).
- Incident intelligence: `data/index.json` (605 deduped incidents, 18 states, latest 2026-11-15), daily partitions `data/incidents/YYYY-MM-DD.json`, state partitions `data/states/STATE.json`.
- Source registry + access notes: `data/sources.json`.
- Raw captures: `data/raw/*` (people_over_papers, stop_ice, icetea_watch, local_networks, trac_context, deportationtracker).
- Normalized per-source: `data/normalized/*`.
- Readiness summary: `DATA_READINESS_REPORT.md`.
- Build script: `scripts/build_data.py` (regenerates all data files).

## Data Readiness Report (full content mapped to UX)
- Coverage snapshot: 605 deduped incidents; source split Stop ICE 106, Ojo Obrero (Siembra NC) 692; 18 states; latest reported 2026-11-15T16:45:00Z.
- Sources & access notes (surface as status badges on /sources):
  - People Over Papers (Padlet): 404 board; no raw incidents.
  - ICE In My Area: Firebase RTDB blocked (AppCheck required).
  - Stop ICE: OK; XML-like `<map_data>` feed parsed.
  - ICE Tea Watch: SSL expired; Vercel deployment missing.
  - DeportationTracker.live: Firestore stats only; no incident feed.
  - Local Networks: Ojo Obrero markers captured; ICIRR/WAISN no public alert feed.
  - ICEwatch archive: inactive since June 2025; no live data.
  - TRAC Immigration: FOIA quickfacts tables only (context).
- Normalization & scoring (show in data docs):
  - Canonical schema for Stop ICE + Ojo Obrero.
  - Confidence scoring: tiered bases + evidence/corroboration/vague/rumor modifiers.
  - Verification inferred from source metadata (moderation/unconfirmed flags).
- Deduplication rules (visualize as info pill on incidents dashboard):
  - Merge if time overlap <= 2 hours, distance <= 1 km, description similarity >= 0.75.
  - Merged incidents get corroboration boost + combined source string.
- Static outputs (link cards on /data):
  - Raw snapshots `data/raw/`
  - Normalized per-source `data/normalized/`
  - Deduped index `data/index.json`
  - Daily partitions `data/incidents/YYYY-MM-DD.json`
  - State partitions `data/states/STATE.json`
- Known gaps (callout banner on /sources):
  - No Padlet, ICE In My Area, or ICE Tea Watch incidents (access/unavailable).
  - DeportationTracker & TRAC provide stats only.
  - Some city/state fields blank when addresses not parseable.
- Regeneration (CTA card on /data): `python3 scripts/build_data.py`

## Site Tree (what exists vs. what will be built)
```
/ (index.html)
├─ Header (title + theme toggle)
├─ Intro copy + contact email
├─ State picker (select fed by data/states.json)
├─ US map (SVG, per-state click/hover)
└─ Rapid Response cards (fed by data/locations.json; hidden until state chosen)

/incidents (new)
├─ Overview KPIs (counts from data/index.json)
├─ Timeline/heatmap (latest_reported_at + reported_at series)
├─ Incident table (activity_type, verification, confidence, state)
└─ Source filter chips (source field)

/states/:code (new, one per state)
├─ State hero (name, totals from data/states/{CODE}.json or data/index.json filtered)
├─ Rapid Response contacts (slice of data/locations.json)
├─ Recent incidents (state subset of data/index.json or state file)
└─ Status badges (verification mix, confidence distribution)

/sources (new)
├─ Source status board (data/sources.json)
├─ Access/health notes (data/sources.json.access + DATA_READINESS_REPORT.md gaps)
└─ Raw snapshot links (data/raw/*)

/data (new)
├─ Download cards (index.json, per-day partitions, per-state partitions)
├─ Normalization notes (data/normalized/*)
└─ Regeneration CTA (scripts/build_data.py)
```

## Page Layout Blueprints (ASCII)

### Home / Rapid Response Directory (index.html - exists)
```
[HEADER] ICERR — theme toggle (dark/light)
------------------------------------------------------------
[INTRO] mission text + submission email
------------------------------------------------------------
[STATE SELECT] (options from data/states.json)
[US MAP SVG] (click/hover states; disabled if no locations)
------------------------------------------------------------
[STATE HEADER] State name | [chip: X Locations]
[LOCATIONS GRID]
  [Card] Org | Service Area | Phone | Links[] | Notes
  ...
------------------------------------------------------------
[TECH CHECKS (hidden)] GSAP / Lucide / Three.js readiness
```

### Incident Intelligence (new)
```
[HEADER] Incident Intelligence | [Date range] [State] [Type] [Verification] [Source] filters
------------------------------------------------------------
[KPI ROW] Total Incidents | States Covered | Latest Reported | Sources Used
[TREND PANEL] Reported_at timeline or heatmap
[MAP/TAGS] State badges colored by count/confidence
------------------------------------------------------------
[TABLE] (from data/index.json or per-day files)
  ID | Reported At | State | City | Type | Verification | Confidence | Source
  ...
[PAGINATION] based on data/incidents/YYYY-MM-DD.json slices
```

### State Detail (new)
```
[HEADER] {State Name} | {Total incidents} | {Latest report date}
------------------------------------------------------------
[LEFT COLUMN] Rapid Response Contacts (from data/locations.json slice)
[RIGHT COLUMN] Incident KPIs (counts, verification mix, confidence)
------------------------------------------------------------
[INCIDENT LIST] recent incidents for state (from data/states/{CODE}.json)
[MAP SLOT] small state map or badge stack
```

### Source Health & Data Library (new)
```
[HEADER] Data Sources & Health
------------------------------------------------------------
[SOURCE CARDS] (data/sources.json)
  Name | Tier | Access status | Coverage | Verification | Notes
[GAPS] Known gaps from DATA_READINESS_REPORT.md
------------------------------------------------------------
[DOWNLOADS] index.json | per-day | per-state | normalized | raw
[REGEN CTA] command: python3 scripts/build_data.py
```

## Notes
- No new styling/framework implied; layouts are structural targets for future Frox-based components.
- Every box above ties to an existing dataset so we can build incrementally without changing the data contract.
