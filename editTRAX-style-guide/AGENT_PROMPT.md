# Agent Styling Prompt - Visual Design System

You are applying a visual design system to an existing project. Your job is to install CSS styling ONLY. Do not change the tech stack, framework, or functionality of the project.

---

## Critical Rules

1. **DO NOT** change the project's framework (React, Vue, Svelte, Angular, vanilla JS, etc.)
2. **DO NOT** change any functionality or features
3. **DO NOT** restructure components or files
4. **DO NOT** break anything that is currently working
5. **DO** apply CSS classes and design tokens to existing elements
6. **DO** maintain all existing behavior
7. **ONLY** update visual appearance

---

## What You Are Installing

**CSS files only:**
- `design-tokens.css` - Color variables, fonts, spacing, borders
- `components.css` - Visual styling for UI elements
- `animations.css` - Optional animation utilities

**Assets:**
- `fonts/mathias-bold.ttf` - Heading font
- `logos/color_bar.png` - Top color bar image

---

## Installation Process

### Step 1: Copy CSS Files

Copy the CSS files into the project's existing styles directory. Do not replace existing CSS - add alongside it.

### Step 2: Import Design Tokens

Add the design tokens import to the project's main CSS entry point (however the project handles CSS):

```css
/* Import at the top of existing styles */
@import 'design-tokens.css';
@import 'components.css';
```

Or link in HTML if that's how the project works:
```html
<link rel="stylesheet" href="design-tokens.css">
<link rel="stylesheet" href="components.css">
```

### Step 3: Apply Classes to Existing Elements

Map the design system classes to existing elements. Do not restructure - just add classes.

---

## Class Mapping Guide

Apply these classes to existing elements based on what they are:

### Buttons
```
Existing button → add class "btn"
Primary/Submit button → add class "btn btn-primary"
Secondary/Cancel button → add class "btn btn-secondary"
Delete/Danger button → add class "btn btn-danger"
Success/Confirm button → add class "btn btn-green"
Small button → add class "btn-sm"
```

### Form Elements
```
Text input → add class "input"
Select dropdown → add class "select"
Textarea → add class "textarea"
Label → add class "label"
Form field wrapper → add class "form-group"
```

### Cards/Containers
```
Card/Panel/Box → add class "card"
Dark card variant → add class "card card-dark"
Stat/Metric display → add class "stat-card"
```

### Typography
```
Main heading → add class "main-title"
Section heading → uses existing h1-h6 (styled by design-tokens)
Body text → add class "body-copy"
Small text → add class "body-copy-small"
Labels/Captions → add class "label" or appropriate font-ui class
```

### Status Indicators
```
Status dot container → add class "status-indicator"
Online/Success dot → add class "status-dot online"
Offline/Error dot → add class "status-dot offline"
Warning dot → add class "status-dot warning"
```

### Tabs
```
Tab container → add class "tabs"
Individual tab → add class "tab"
Active tab → add class "tab active"
Tab content panel → add class "tab-content"
Active content → add class "tab-content active"
```

### Tables
```
Table element → add class "table"
```

### Modals/Dialogs
```
Modal overlay → add class "modal-overlay"
Modal container → add class "modal"
Modal header → add class "modal-header"
Modal body → add class "modal-body"
Modal footer → add class "modal-footer"
```

### Progress Bars
```
Progress container → add class "progress-bar"
Progress fill → add class "progress-fill"
```

---

## CSS Variables Available

Once design-tokens.css is imported, these variables are available throughout the project:

### Colors
```css
var(--color-black)        /* #000000 - Background */
var(--color-white)        /* #FFFFFF - Text */
var(--color-yellow-75)    /* #E6E9E0 - Primary accent (cream) */
var(--color-yellow-125)   /* #A6752B - Secondary accent (gold) */
var(--accent-long)        /* #10b981 - Success/Green */
var(--accent-short)       /* #ef4444 - Danger/Red */
var(--accent-neutral)     /* #6b7280 - Muted/Disabled */
var(--color-gray-760)     /* #282828 - Borders */
var(--color-gray-darker)  /* #16151a - Dark backgrounds */
```

### Spacing
```css
var(--spacing-1) through var(--spacing-16)
```

### Border Radius
```css
var(--radius-sm)    /* 2px */
var(--radius-md)    /* 4px */
var(--radius-base)  /* 6px */
var(--radius-lg)    /* 8px */
var(--radius-xl)    /* 12px */
```

### Fonts
```css
var(--font-heading)  /* Mathias - for headings */
var(--font-body)     /* Open Sans - for body text */
var(--font-ui)       /* Inter - for UI elements */
```

---

## Header Composition (If Adding New Header)

Only if the project needs a header added (not replacing existing navigation):

The standard header includes:
1. Color bar at top (5px decorative bar)
2. Status indicators showing tech dependency health
3. Product name/logo centered

Status indicators should reflect what technologies the specific SaaS relies on (Firebase, API, Database, etc.) with green/red/yellow dots showing real-time status.

---

## What NOT To Do

- Do not convert a React app to vanilla HTML
- Do not convert a Vue app to React
- Do not remove existing CSS frameworks (Tailwind, Bootstrap, etc.) - layer on top
- Do not change routing or navigation logic
- Do not modify API calls or data fetching
- Do not restructure component hierarchy
- Do not change state management
- Do not modify build configuration
- Do not change how the project handles authentication
- Do not alter database interactions

---

## Framework-Specific Notes

### React/Next.js
- Import CSS in _app.js or layout component
- Apply classes via className prop
- Keep all component logic unchanged

### Vue/Nuxt
- Import CSS in main.js or nuxt.config
- Apply classes via class binding
- Keep all component logic unchanged

### Svelte/SvelteKit
- Import CSS in +layout.svelte or app.css
- Apply classes normally
- Keep all component logic unchanged

### Angular
- Add to styles array in angular.json
- Apply classes via class binding
- Keep all component logic unchanged

### Vanilla JS/HTML
- Link CSS in HTML head
- Add classes to elements
- Keep all JS functionality unchanged

---

## Visual Design Rules

1. **No emojis** - Never use emoji characters in UI
2. **Mobile-first** - Ensure responsive design works on all screen sizes
3. **Dark theme** - Black backgrounds, light text
4. **Accent color** - Cream/yellow (#E6E9E0) for primary accent
5. **Status colors** - Green=online, Red=offline, Yellow=warning

---

## Verification Checklist

After applying styles, verify:

- [ ] All existing functionality still works
- [ ] No JavaScript errors in console
- [ ] No broken layouts
- [ ] Buttons are visually styled
- [ ] Forms are visually styled
- [ ] Cards/containers have consistent styling
- [ ] Typography uses design system fonts
- [ ] Colors match design system
- [ ] Responsive design works on mobile
- [ ] No emojis in UI

---

## Summary

Your job is simple:
1. Add the CSS files to the project
2. Apply CSS classes to existing elements
3. Do not change anything else

The result should be the same working application with updated visual styling.
