# Data → Frox Component Mapping

Purpose: pick the best Frox-derived pane/card for every dataset we have, so wiring the homepage/state views is straightforward.

## Core Data Sources
- Rapid response contacts: `data/locations.json` (per-state contacts) + `data/states.json` (states with coverage)
- Incidents: `data/index.json` (605 deduped; fields: activity_type, confidence, verification, source, state, city, reported_at, description) + per-day `data/incidents/YYYY-MM-DD.json` + per-state `data/states/STATE.json`
- Sources registry: `data/sources.json`
- Readiness summary/gaps: `DATA_READINESS_REPORT.md`

## Component Fits

- **State selector + map**
  - Data: `data/states.json`, `data/locations.json`, `data/index.json`
  - Component: Existing US SVG + select (replace ChartGeo canvas)

- **KPI Stat Cards (dashboard.html / analytics-dashboard-1.html)**
  - Data: counts from `data/index.json` (incidents total, latest_reported_at, sources array length); per-state slices for selected state.

- **Badge Chips (ui-badges.html)**
  - Data: `verification`, `activity_type`, `source` fields in incidents; source status from `data/sources.json.access.status`.

- **Filter Toolbar (dashboard-analytics.html)**
  - Data: filter dimensions from incident fields (`state`, `activity_type`, `verification`, `source`, `reported_at` range).

- **Tabs (components.html)**
  - Data: none (structure); use to switch between “Incidents” and “Contacts”.

- **Incidents Table (transactions.html / datatable.html)**
  - Data: incidents rows (`reported_at`, `city`, `state`, `activity_type`, `verification`, `confidence`, `source`).

- **Activity Feed / Timeline (activity.html)**
  - Data: recent incidents per selected state, sorted by `reported_at` + short `description`.

- **Mini Bar/Progress Charts (finance-dashboard.html)**
  - Data: distribution of `verification` and `activity_type` per state (counts, percentages).

- **Doughnut/Pie (visitChart/revenueChart pattern)**
  - Data: quick share of `activity_type` or `verification` for selected state.

- **Contact Cards (cards.html / crm-customer-details.html)**
  - Data: `data/locations.json` → `name`, `service_area`, `phone`, `links`, `notes` per state.

- **Info Callouts / Alerts (ui-alerts.html)**
  - Data: Known gaps from `DATA_READINESS_REPORT.md` (e.g., “Padlet unavailable”, “No incidents for this state”).

- **Empty State Block (empty.html pattern)**
  - Data: Conditional when a state has no incidents or contacts.

- **Source Health Cards (cards.html)**
  - Data: `data/sources.json` → `name`, `tier`, `access.status`, `coverage`, `verification`, `notes`.

- **Download/CTA Tiles (widgets.html)**
  - Data: static links to `data/index.json`, daily/state partitions, `data/raw/*`, `data/normalized/*`; regen command `python3 scripts/build_data.py`.

- **Definition Accordion (components.html)**
  - Data: explanatory text for confidence scoring, verification levels, dedup rules (from `DATA_READINESS_REPORT.md`).

## Default Wiring for Homepage
- Left: State select + US SVG (existing component).
- Right: KPI stat cards (overall + selected state), badge strip for source/verification mix.
- Tabs: “Incidents” (filters + table + mini chart + feed) / “Contacts” (cards grid + alert).
- Footer strip: Source health cards + download/CTA tiles.
