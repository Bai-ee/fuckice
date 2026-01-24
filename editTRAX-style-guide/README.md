# Style Guide - Component Library

A static HTML/CSS/JS style guide capturing the design system from the main application. Use this as a reference when building UI in other repositories.

---

## AI Agent Styling

**For AI agents applying this design system, see [`AGENT_PROMPT.md`](./AGENT_PROMPT.md)**

This file contains instructions for applying visual styles WITHOUT changing functionality:
- Copy CSS files into existing project
- Apply CSS classes to existing elements
- Framework-agnostic (works with React, Vue, Svelte, Angular, vanilla JS)
- Does not break existing functionality
- Does not change tech stack

---

## Design Rules

### NO EMOJIS

**Emojis are strictly forbidden in all UI elements.** This includes:
- Button labels
- Status messages
- Error/success notifications
- Drop zones and upload areas
- Navigation and menus
- Headings and body text
- Placeholder text
- Tooltips and hints

Use text labels, CSS icons, or SVG icons instead. Never use unicode emoji characters or emoji shortcodes.

---

## Structure

```
style-guide/
├── index.html              # Component showcase
├── animations.html         # Animation style guide (GSAP + anime.js)
├── AGENT_PROMPT.md         # AI agent installation instructions
├── css/
│   ├── design-tokens.css   # Core variables (colors, fonts, spacing)
│   ├── components.css      # Reusable component styles
│   └── animations.css      # Animation utilities & states
├── js/
│   ├── main.js             # Interactive component logic
│   └── animations.js       # GSAP + anime.js animation system
├── fonts/
│   └── mathias-bold.ttf    # Custom heading font
├── logos/
│   ├── load.gif            # Header animation (120px)
│   ├── logo.svg            # Vector logo
│   ├── et_new_logo.png     # EditTrax logo
│   ├── et_horizontal.png   # Horizontal logo variant
│   ├── color_bar.png       # Fixed top color bar
│   ├── homepage_bg.png     # Background image
│   └── og_img.jpg          # Social share image
└── README.md
```

## Usage

### View the Style Guide

Open `index.html` in a browser to see all components with their styling.

### Apply to Other Projects

1. **Copy the CSS files** to your project
2. **Copy the fonts folder** to your project
3. **Copy the logos folder** to your project
4. **Import in your HTML/CSS:**

```html
<link rel="stylesheet" href="path/to/design-tokens.css">
<link rel="stylesheet" href="path/to/components.css">
```

---

## Page Layout Composition (MANDATORY)

**All SaaS products using this design system MUST follow this header structure.** The header is the consistent brand element across all products. Content below the header is flexible and determined by each product's requirements.

### Header Requirements

1. **Title**: Always the name of the SaaS product (uses `--color-yellow-75`)
2. **Status Indicators**: Display real-time status of all critical tech dependencies
   - **Green dot** = Service is online/operational
   - **Red dot** = Service is offline/error
   - **Yellow dot** = Service is degraded/warning
3. **Logo**: Animated GIF or static logo above the title
4. **Color Bar**: Fixed 5px bar at the very top of the viewport

### What to Include in Status Indicators

Each SaaS should display indicators for any technology it relies on for real-time functionality:

| Example Tech | When to Show Green | When to Show Red |
|--------------|-------------------|------------------|
| Firebase | Connected, auth working | Connection failed |
| Database | Queries responding | Connection timeout |
| API Server | Endpoints responding | Server unreachable |
| Blockchain | Node connected | Node offline |
| Storage | Upload/download working | Storage unavailable |
| WebSocket | Real-time connected | Connection dropped |

### Standard Structure

```html
<!-- 1. Fixed Color Bar at top (REQUIRED) -->
<img src="logos/color_bar.png" alt="" class="color-bar">

<!-- 2. Particles Background (REQUIRED) -->
<div id="particles-js" class="particles-bg"></div>

<!-- 3. App Header (REQUIRED) -->
<div class="app-header">
  <div class="app-header-inner">

    <!-- Status Row: Tech dependency indicators on both sides -->
    <div class="header-status-row">

      <!-- LEFT: Primary tech dependencies -->
      <div class="header-status-left">
        <div class="status-indicator">
          <span class="status-dot online"></span>
          <span class="status-label">Firebase</span>
        </div>
        <div class="status-indicator">
          <span class="status-dot online"></span>
          <span class="status-label">Database</span>
        </div>
        <!-- Add indicators for each critical dependency -->
      </div>

      <!-- RIGHT: Secondary indicators, metrics, or actions -->
      <div class="header-status-right">
        <div class="status-indicator">
          <span class="status-dot online"></span>
          <span class="status-label">API</span>
        </div>
        <button class="btn btn-small">Refresh</button>
      </div>

    </div>

    <!-- Center: Logo & SaaS Product Name -->
    <div class="logo-container">
      <img src="logos/load.gif" alt="Logo" class="logo-gif">
      <h1 class="main-title">YOUR SAAS NAME</h1>

      <!-- Below header: Product-specific content -->
      <div class="control-stack">
        <!-- Collapsible sections, controls, etc. -->
      </div>
    </div>

  </div>
</div>

<!-- 4. PRODUCT-SPECIFIC CONTENT BELOW -->
<!-- Everything below the header is flexible per product requirements -->
<main class="app-content">
  <!-- Your SaaS product UI goes here -->
</main>
```

### Status Indicator Classes

```html
<!-- Online/Operational (green) -->
<span class="status-dot online"></span>

<!-- Offline/Error (red) -->
<span class="status-dot offline"></span>

<!-- Warning/Degraded (yellow) -->
<span class="status-dot warning"></span>
```

### Dynamic Status Updates (JavaScript)

```javascript
// Update status indicator based on service health
function updateStatus(selector, isOnline) {
  const dot = document.querySelector(selector + ' .status-dot');
  dot.classList.remove('online', 'offline', 'warning');
  dot.classList.add(isOnline ? 'online' : 'offline');
}

// Example: Check Firebase connection
firebase.database().ref('.info/connected').on('value', (snap) => {
  updateStatus('.firebase-status', snap.val() === true);
});
```

### Particles.js Setup

Include at the bottom of your HTML:

```html
<script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
<script>
  particlesJS('particles-js', {
    particles: {
      number: { value: 50, density: { enable: true, value_area: 800 } },
      color: { value: '#E6E9E0' },
      shape: { type: 'circle' },
      opacity: { value: 0.5, random: true },
      size: { value: 2, random: true },
      line_linked: { enable: false },
      move: { enable: true, speed: 1, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false }
    },
    interactivity: { detect_on: 'canvas', events: { onhover: { enable: false }, onclick: { enable: false }, resize: true } },
    retina_detect: true
  });
</script>
```

---

## Components Available

### Layout & Structure
- **Color Bar** - Fixed 5px bar at top of page
- **Particles Background** - Animated starfield (particles.js)
- **Page Layout** - Standard header composition with status indicators
- **Status Indicators** - Online/Offline/Warning dots with labels
- **Usage Indicators** - Storage, Firestore, Bandwidth metrics

### Upload UI
- **Upload Progress Container** - Multi-file upload progress tracking
- **Upload Progress Bar** - Yellow during upload, green on success, red on error
- **Upload Modal** - Full modal with drop zone and progress
- **Drop Zone** - Drag & drop file upload area

### Core Components
- **Buttons** - Primary, Secondary, Green, Bordered, Danger
- **Cards** - Standard, Dark, Bordered, Stat cards
- **Forms** - Inputs, Selects, Textareas, Labels
- **Tables** - Styled tables with hover states
- **Tabs** - Horizontal tab navigation
- **Modals** - Dialog overlays with header/body/footer
- **Progress Bars** - Determinate and indeterminate
- **Collapsible/Accordion** - Expandable sections
- **Badges** - Status indicators
- **Selection Cards** - Folder/item selection UI

---

## Design Tokens

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-black` | `#000000` | Primary background |
| `--color-white` | `#FFFFFF` | Primary text |
| `--color-yellow-75` | `#E6E9E0` | Primary accent (cream) |
| `--color-yellow-125` | `#A6752B` | Secondary accent (gold) |
| `--accent-long` | `#10b981` | Success / Green |
| `--accent-short` | `#ef4444` | Danger / Red |
| `--accent-neutral` | `#6b7280` | Muted / Disabled |
| `--color-gray-760` | `#282828` | Borders / Dividers |
| `--color-gray-darker` | `#16151a` | Header backgrounds |

### Fonts

| Token | Value | Usage |
|-------|-------|-------|
| `--font-heading` | `Mathias` | Headings, display text |
| `--font-body` | `Open Sans` | Body copy |
| `--font-ui` | `Inter` | Labels, buttons, UI elements |

### Border Radius

| Token | Value |
|-------|-------|
| `--radius-sm` | `2px` |
| `--radius-md` | `4px` |
| `--radius-base` | `6px` |
| `--radius-lg` | `8px` |
| `--radius-xl` | `12px` |

### Border Widths

| Token | Value |
|-------|-------|
| `--border-1` | `1px` |
| `--border-2` | `2px` |

---

## Upload Progress UI

The upload progress UI uses specific styling:

```html
<div class="upload-progress-container">
  <div class="upload-progress-header">
    <span class="upload-progress-title">Uploading Files...</span>
    <span class="upload-progress-summary">2 / 4</span>
  </div>
  <div class="upload-file-list">
    <div class="upload-file-item">
      <div class="upload-file-info">
        <span class="upload-file-name">filename.mp4</span>
        <span class="upload-file-percent">67%</span>
      </div>
      <div class="upload-progress-bar">
        <div class="upload-progress-fill" style="width: 67%;"></div>
      </div>
      <div class="upload-file-status">Uploading...</div>
    </div>
  </div>
</div>
```

### Progress Bar States

- **Uploading**: Yellow fill (`--color-yellow-75`)
- **Success**: Add class `.success` for green fill
- **Error**: Add class `.error` for red fill

---

## Key Styling Patterns

### Gradients

```css
/* Dark button gradient */
background: radial-gradient(
  ellipse at center,
  rgba(45, 45, 50, 1) 0%,
  rgba(35, 35, 40, 0.9) 80%,
  rgba(26, 26, 30, 0.85) 100%
), #1a1a1a;
```

### Inset Shadows

```css
box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3),
            inset 0 0 15px rgba(0, 0, 0, 0.15);
```

### Backdrop Blur

```css
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
```

### Uppercase Labels

```css
font-size: 0.75rem;
letter-spacing: 0.08em;
text-transform: uppercase;
```

---

---

## Animation System (GSAP + anime.js)

The style guide includes a comprehensive animation system. See `animations.html` for live examples.

### Required Libraries

```html
<!-- GSAP + ScrollTrigger -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>

<!-- anime.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>

<!-- Animation System -->
<link rel="stylesheet" href="css/animations.css">
<script src="js/animations.js"></script>
```

### Scroll Animations (GSAP)

Add `data-anim` attribute to any element:

```html
<div data-anim="fade-up">Fades up on scroll</div>
<div data-anim="fade-down">Fades down on scroll</div>
<div data-anim="fade-left">Slides from right</div>
<div data-anim="fade-right">Slides from left</div>
<div data-anim="scale-up">Scales up on scroll</div>
```

All animations reverse when scrolling back up.

### Grid Animations (anime.js)

Add `data-anim-grid` to grid containers for staggered animations:

```html
<div class="grid" data-anim-grid>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <!-- Items animate in sequence, reverse on scroll out -->
</div>
```

### Programmatic Animations

```javascript
// Grid animations
GridAnimations.animateIn('.my-grid');
GridAnimations.animateOut('.my-grid');

// Sequence animations
SequenceAnimations.pulse('.element');      // Attention pulse
SequenceAnimations.shake('.element');      // Error shake
SequenceAnimations.countUp('.num', 1234);  // Animated counter
SequenceAnimations.staggerList('.items');  // Staggered list

// Page transitions
PageTransitions.fadeOut(() => loadNewPage());
PageTransitions.fadeIn();
```

### CSS Hover Utilities

```html
<div class="hover-lift">Lifts on hover with shadow</div>
<div class="hover-scale">Scales up on hover</div>
<div class="hover-glow">Glows on hover</div>
```

### Configurable Values

Edit `js/animations.js` to adjust timing:

```javascript
const AnimConfig = {
  scroll: {
    start: 'top 85%',    // When animation triggers
    end: 'top 20%',      // When animation reverses
  },
  fadeUp: {
    from: { opacity: 0, y: 40 },
    duration: 0.6,
    ease: 'power2.out',
  },
  grid: {
    delay: (el, i) => i * 80,  // Stagger delay
    duration: 500,
  }
};
```

---

## Workflow

1. **Request a new component**: Describe what you need
2. **Review in style guide**: Component gets built here first
3. **Approve**: Once approved, use as reference for other repos
4. **Implement**: Copy the relevant CSS classes to target project
