# Data Readiness Report

Generated at: 2026-01-18T00:29:42.946808+00:00

## Coverage Snapshot
- Incidents (deduplicated): 605
- Incidents by source: Stop ICE 106, Ojo Obrero (Siembra NC) 692
- States represented: 18
- Latest reported timestamp: 2026-11-15T16:45:00+00:00

## Sources & Access Notes
- People Over Papers (Padlet): 404 at board URL in this snapshot; no raw incidents captured.
- ICE In My Area: public site loads but Firebase RTDB requires AppCheck token; REST access blocked.
- Stop ICE: public map feed parsed from XML-like <map_data> blocks.
- ICE Tea Watch: SSL expired and Vercel deployment not found; source unavailable.
- DeportationTracker.live: Firestore stats document captured (context only; no incident feed exposed).
- Local Networks: Ojo Obrero (Siembra NC) Supabase markers captured; ICIRR and WAISN have no public alert feed in this snapshot.
- ICEwatch archive (IDP): page indicates archive inactive since June 2025; no live data.
- TRAC Immigration: quickfacts tables captured for context (FOIA-based; not incident-level).

## Normalization & Scoring
- Canonical schema applied to incident sources only (Stop ICE + Ojo Obrero).
- Confidence scoring uses tiered base values with modifiers for evidence, corroboration, vague language, and rumor flags.
- Verification levels inferred from source metadata (e.g., moderation status or unconfirmed flags).

## Deduplication
- Incidents merged if time overlap <= 2 hours, distance <= 1 km, and description similarity >= 0.75.
- Merged incidents receive a corroboration boost and a combined source string.

## Static Outputs
- Raw snapshots: `data/raw/`
- Normalized per-source: `data/normalized/`
- Deduplicated index: `data/index.json`
- Daily partitions: `data/incidents/YYYY-MM-DD.json`
- State partitions: `data/states/STATE.json`

## Known Gaps
- No Padlet, ICE In My Area, or ICE Tea Watch incidents due to access restrictions/unavailability.
- DeportationTracker and TRAC provide statistics only (contextual, not incident-level).
- Some city/state fields may be blank when source addresses are not parseable.

## Regeneration
Run:
```
python3 scripts/build_data.py
```
