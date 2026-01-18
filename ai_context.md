# AI_CONTEXT — icerr.com Static Audit & Arweave Rebuild

## Purpose

This repository exists to **fully audit, mirror, and reconstruct** the website  
**https://icerr.com** as a **100% static website** suitable for **permanent hosting on Arweave**.

This is an **archival reconstruction**, not a redesign or modernization.

---

## Definition of Success

The project is successful only if:

- The site renders identically to icerr.com
- All content is available offline
- No runtime network requests occur
- All data is static
- The site can be uploaded directly to Arweave
- No server, framework, or build step is required

---

## Core Constraints

### Allowed
- HTML
- CSS
- Vanilla JavaScript
- Static JSON data files
- Relative paths only

### Forbidden
- React / Vue / Next / Nuxt / Svelte
- Build tools (Vite, Webpack, Rollup, etc.)
- CDNs
- Live APIs
- Analytics or trackers
- Runtime fetches to external origins

---

## Source of Truth

- The live site **icerr.com** is authoritative
- Layout, copy, visuals, and behavior must be preserved
- Any dynamic behavior must be converted to static equivalents

---

## Hosting Target: Arweave

The final output must:
- Work under immutable hosting
- Use no absolute URLs
- Assume no server-side routing
- Load correctly from any gateway path

---

## Operating Philosophy

- Inspect before acting
- Preserve before modifying
- Mirror before improving
- Staticize rather than refactor

This project prioritizes **accuracy, permanence, and parity**.
