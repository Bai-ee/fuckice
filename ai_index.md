# AI_INDEX — Execution Plan & Verification Checklist

This file defines the **mandatory execution order** and **verification gates**.
All phases must pass verification before proceeding.

---

## PHASE 1 — Site Audit

### Tasks
- Download raw HTML exactly as served
- Determine whether content is server-rendered or JS-rendered
- Identify all JS and CSS assets
- Detect frameworks or build artifacts
- Enumerate all third-party dependencies
- Detect dynamic behavior and API calls

### Verification Checklist
- [ ] Raw HTML saved and reviewed
- [ ] Framework scan completed (React/Vue/etc.)
- [ ] All JS files identified
- [ ] All CSS files identified
- [ ] All images and fonts identified
- [ ] Dynamic behavior documented
- [ ] Audit summary written

❌ Do not proceed if rendering method is unclear

---

## PHASE 2 — Static Data Capture

### Tasks
- Identify all runtime data sources
- Capture live responses
- Store data as static JSON
- Rewrite JS to load local data only

### Verification Checklist
- [ ] No JS fetches external URLs
- [ ] All dynamic data stored locally
- [ ] JS references local `/data` files only
- [ ] Page content loads without internet

❌ Do not proceed if any runtime API calls remain

---

## PHASE 3 — Asset Localization

### Tasks
- Download all first-party assets
- Download required third-party assets
- Remove analytics and trackers
- Rewrite absolute URLs to relative paths
- Self-host fonts

### Verification Checklist
- [ ] No external CSS links
- [ ] No external JS links
- [ ] Fonts load locally
- [ ] All asset paths are relative
- [ ] No CDN references remain

❌ Do not proceed if DevTools shows outbound requests

---

## PHASE 4 — Static Reconstruction

### Tasks
- Reassemble site using static files only
- Preserve original structure and behavior
- Ensure navigation works without JS routing

### Verification Checklist
- [ ] index.html renders correctly
- [ ] All links resolve to static files
- [ ] No console errors
- [ ] No history API dependency
- [ ] Layout matches original

❌ Do not proceed if navigation relies on SPA behavior

---

## PHASE 5 — Local Validation

### Tasks
- Serve via a basic static server
- Test desktop and mobile layouts
- Verify offline functionality

### Verification Checklist
- [ ] Site runs via local HTTP server
- [ ] Visual parity confirmed
- [ ] Typography parity confirmed
- [ ] Responsive behavior confirmed
- [ ] Works with network disabled

❌ Do not proceed if file:// is required

---

## PHASE 6 — Arweave Readiness

### Tasks
- Ensure immutable-safe structure
- Remove environment assumptions
- Finalize upload directory

### Verification Checklist
- [ ] No absolute URLs
- [ ] No root-domain assumptions
- [ ] No build artifacts
- [ ] Static directory only
- [ ] Ready for direct Arweave upload

---

## FINAL DELIVERABLES

Must produce:
1. Static site directory
2. Technical summary explaining:
   - What was dynamic
   - How it was staticized
   - Any unavoidable limitations
3. Confirmation of Arweave compatibility

---

## NON-NEGOTIABLE RULES

- Do not redesign
- Do not optimize
- Do not modernize
- Do not speculate
- Do not skip verification

Archive-grade accuracy is the goal.
