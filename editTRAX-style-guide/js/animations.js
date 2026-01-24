/**
 * ANIMATIONS - GSAP + anime.js Integration
 *
 * This file provides animation utilities using:
 * - GSAP + ScrollTrigger for scroll-based animations with parallax
 * - anime.js for complex sequences and grid animations
 *
 * Required Libraries (load before this file):
 * - gsap.min.js
 * - ScrollTrigger.min.js
 * - anime.min.js
 */


/* ============================================
   CONFIGURATION
   Tweak these values to adjust animation feel
   ============================================ */

const AnimConfig = {
  // Global Settings
  reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,

  // GSAP ScrollTrigger Defaults
  scroll: {
    start: 'top 85%',      // When element top hits 85% of viewport (intro)
    end: 'top -10%',       // When element top exits viewport (outro) - must be well past top
    toggleActions: 'play reverse play reverse', // onEnter, onLeave, onEnterBack, onLeaveBack
    markers: false,        // Set true for debugging
  },

  // Parallax Settings (scrub-based)
  parallax: {
    speed: 0.5,            // Parallax intensity (0-1)
    scrub: 1,              // Smooth scrub (higher = smoother)
  },

  // Fade Up Animation (most common)
  fadeUp: {
    y: 60,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.15,
  },

  // Fade Down Animation
  fadeDown: {
    y: -60,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
  },

  // Fade Left Animation (from right)
  fadeLeft: {
    x: 80,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
  },

  // Fade Right Animation (from left)
  fadeRight: {
    x: -80,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
  },

  // Scale Animation
  scaleUp: {
    scale: 0.85,
    opacity: 0,
    duration: 0.7,
    ease: 'back.out(1.4)',
  },

  // Section content animation
  sectionContent: {
    y: 40,
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out',
    stagger: 0.1,
  },

  // Grid Stagger (anime.js)
  grid: {
    translateY: [40, 0],
    opacity: [0, 1],
    scale: [0.92, 1],
    duration: 600,
    delay: function(el, i) { return i * 100; },
    easing: 'easeOutCubic',
  },

  // Grid Reverse (for scroll out)
  gridReverse: {
    translateY: [0, 40],
    opacity: [1, 0],
    scale: [1, 0.92],
    duration: 400,
    delay: function(el, i, total) { return (total - i - 1) * 60; },
    easing: 'easeInCubic',
  },
};


/* ============================================
   GSAP SCROLL ANIMATIONS
   ============================================ */

const ScrollAnimations = {
  /**
   * Initialize all scroll animations
   */
  init() {
    if (AnimConfig.reduceMotion) {
      console.log('Reduced motion preference detected. Animations disabled.');
      this.showAllElements();
      return;
    }

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger not loaded. Falling back to CSS.');
      return;
    }

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Set default ease
    gsap.defaults({ ease: 'power3.out' });

    // Initialize different animation types
    this.initFadeUp();
    this.initFadeDown();
    this.initFadeLeft();
    this.initFadeRight();
    this.initScaleUp();
    this.initSections();
    this.initParallax();
    this.initScrollProgress();

    // Refresh on load (for dynamic content)
    ScrollTrigger.refresh();
  },

  /**
   * Fade Up animations with parallax feel
   */
  initFadeUp() {
    const elements = document.querySelectorAll('[data-anim="fade-up"]');
    elements.forEach(el => {
      // Set initial state
      gsap.set(el, {
        opacity: 0,
        y: AnimConfig.fadeUp.y
      });

      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: AnimConfig.fadeUp.duration,
        ease: AnimConfig.fadeUp.ease,
        scrollTrigger: {
          trigger: el,
          start: AnimConfig.scroll.start,
          end: AnimConfig.scroll.end,
          toggleActions: AnimConfig.scroll.toggleActions,
          markers: AnimConfig.scroll.markers,
        }
      });
    });
  },

  /**
   * Fade Down animations
   */
  initFadeDown() {
    const elements = document.querySelectorAll('[data-anim="fade-down"]');
    elements.forEach(el => {
      gsap.set(el, {
        opacity: 0,
        y: AnimConfig.fadeDown.y
      });

      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: AnimConfig.fadeDown.duration,
        ease: AnimConfig.fadeDown.ease,
        scrollTrigger: {
          trigger: el,
          start: AnimConfig.scroll.start,
          end: AnimConfig.scroll.end,
          toggleActions: AnimConfig.scroll.toggleActions,
        }
      });
    });
  },

  /**
   * Fade Left animations
   */
  initFadeLeft() {
    const elements = document.querySelectorAll('[data-anim="fade-left"]');
    elements.forEach(el => {
      gsap.set(el, {
        opacity: 0,
        x: AnimConfig.fadeLeft.x
      });

      gsap.to(el, {
        opacity: 1,
        x: 0,
        duration: AnimConfig.fadeLeft.duration,
        ease: AnimConfig.fadeLeft.ease,
        scrollTrigger: {
          trigger: el,
          start: AnimConfig.scroll.start,
          end: AnimConfig.scroll.end,
          toggleActions: AnimConfig.scroll.toggleActions,
        }
      });
    });
  },

  /**
   * Fade Right animations
   */
  initFadeRight() {
    const elements = document.querySelectorAll('[data-anim="fade-right"]');
    elements.forEach(el => {
      gsap.set(el, {
        opacity: 0,
        x: AnimConfig.fadeRight.x
      });

      gsap.to(el, {
        opacity: 1,
        x: 0,
        duration: AnimConfig.fadeRight.duration,
        ease: AnimConfig.fadeRight.ease,
        scrollTrigger: {
          trigger: el,
          start: AnimConfig.scroll.start,
          end: AnimConfig.scroll.end,
          toggleActions: AnimConfig.scroll.toggleActions,
        }
      });
    });
  },

  /**
   * Scale Up animations
   */
  initScaleUp() {
    const elements = document.querySelectorAll('[data-anim="scale-up"]');
    elements.forEach(el => {
      gsap.set(el, {
        opacity: 0,
        scale: AnimConfig.scaleUp.scale
      });

      gsap.to(el, {
        opacity: 1,
        scale: 1,
        duration: AnimConfig.scaleUp.duration,
        ease: AnimConfig.scaleUp.ease,
        scrollTrigger: {
          trigger: el,
          start: AnimConfig.scroll.start,
          end: AnimConfig.scroll.end,
          toggleActions: AnimConfig.scroll.toggleActions,
        }
      });
    });
  },

  /**
   * Initialize section animations (header + content follow)
   */
  initSections() {
    const sections = document.querySelectorAll('.section');

    sections.forEach(section => {
      // Get all direct children that should animate
      const children = section.querySelectorAll('.section-title, .component-label, .component-row, .demo-row, .demo-form, .demo-table, .demo-cards, .stat-cards-row, .folder-cards-grid, .color-grid, .status-demo-row, .code-block, .config-table, .card, .tabs, .table, .collapsible, .progress-container, .upload-progress-container, p.body-copy, p.body-copy-small, .demo-grid, .logo-grid, .drop-zone');

      // Skip items that have their own grid animation
      const nonGridChildren = Array.from(children).filter(child => {
        return !child.hasAttribute('data-anim-grid') && !child.closest('[data-anim-grid]');
      });

      if (nonGridChildren.length === 0) return;

      // Set initial state for all children
      gsap.set(nonGridChildren, {
        opacity: 0,
        y: AnimConfig.sectionContent.y,
      });

      // Create staggered animation
      gsap.to(nonGridChildren, {
        opacity: 1,
        y: 0,
        duration: AnimConfig.sectionContent.duration,
        ease: AnimConfig.sectionContent.ease,
        stagger: AnimConfig.sectionContent.stagger,
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          end: 'top -15%',  // Content must scroll well past top before outro
          toggleActions: 'play reverse play reverse',
        }
      });
    });
  },

  /**
   * Parallax effect on scroll (subtle movement)
   */
  initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || AnimConfig.parallax.speed;

      gsap.to(el, {
        y: () => -100 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: AnimConfig.parallax.scrub,
        }
      });
    });

    // Add subtle parallax to all sections for depth
    const sections = document.querySelectorAll('.section');
    sections.forEach((section, i) => {
      // Alternate parallax direction for visual interest
      const direction = i % 2 === 0 ? 1 : -1;

      gsap.to(section, {
        y: () => 30 * direction * AnimConfig.parallax.speed,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: AnimConfig.parallax.scrub * 2,
        }
      });
    });
  },

  /**
   * Scroll progress bar
   */
  initScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;

    gsap.to(progressBar, {
      width: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      }
    });
  },

  /**
   * Show all elements (for reduced motion)
   */
  showAllElements() {
    const elements = document.querySelectorAll('[data-anim], [data-anim-grid] > *, .section *');
    elements.forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  },

  /**
   * Refresh ScrollTrigger (call after dynamic content loads)
   */
  refresh() {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }
};


/* ============================================
   ANIME.JS GRID ANIMATIONS
   ============================================ */

const GridAnimations = {
  activeAnimations: new Map(),

  /**
   * Animate grid items in
   * @param {string|Element} selector - Grid container selector or element
   * @param {Object} customConfig - Override default config
   */
  animateIn(selector, customConfig = {}) {
    if (AnimConfig.reduceMotion) return;

    const container = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!container || typeof anime === 'undefined') return;

    // Cancel any running animation on this container
    if (this.activeAnimations.has(container)) {
      this.activeAnimations.get(container).pause();
    }

    const items = container.children;
    const config = { ...AnimConfig.grid, ...customConfig };

    // Set initial state
    Array.from(items).forEach(item => {
      item.style.opacity = '0';
      item.style.transform = `translateY(${config.translateY[0]}px) scale(${config.scale[0]})`;
    });

    const anim = anime({
      targets: items,
      translateY: config.translateY,
      opacity: config.opacity,
      scale: config.scale,
      duration: config.duration,
      delay: config.delay,
      easing: config.easing,
      complete: () => {
        container.classList.add('anim-complete');
        this.activeAnimations.delete(container);
      }
    });

    this.activeAnimations.set(container, anim);
  },

  /**
   * Animate grid items out
   * @param {string|Element} selector - Grid container selector or element
   * @param {Object} customConfig - Override default config
   */
  animateOut(selector, customConfig = {}) {
    if (AnimConfig.reduceMotion) return;

    const container = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!container || typeof anime === 'undefined') return;

    // Cancel any running animation
    if (this.activeAnimations.has(container)) {
      this.activeAnimations.get(container).pause();
    }

    const items = container.children;
    const config = { ...AnimConfig.gridReverse, ...customConfig };

    container.classList.remove('anim-complete');

    const anim = anime({
      targets: items,
      translateY: config.translateY,
      opacity: config.opacity,
      scale: config.scale,
      duration: config.duration,
      delay: config.delay,
      easing: config.easing,
      complete: () => {
        this.activeAnimations.delete(container);
      }
    });

    this.activeAnimations.set(container, anim);
  },

  /**
   * Setup scroll-triggered grid animation
   * @param {string} selector - Grid container selector
   */
  initScrollGrid(selector) {
    if (AnimConfig.reduceMotion) {
      // Show all grid items if reduced motion
      document.querySelectorAll(selector).forEach(grid => {
        Array.from(grid.children).forEach(item => {
          item.style.opacity = '1';
          item.style.transform = 'none';
        });
      });
      return;
    }

    if (typeof gsap === 'undefined') return;

    const grids = document.querySelectorAll(selector);

    grids.forEach(grid => {
      // Set initial state
      const items = grid.children;
      Array.from(items).forEach(item => {
        item.style.opacity = '0';
        item.style.transform = `translateY(${AnimConfig.grid.translateY[0]}px) scale(${AnimConfig.grid.scale[0]})`;
      });

      let hasAnimatedIn = false;

      // Create ScrollTrigger
      ScrollTrigger.create({
        trigger: grid,
        start: 'top 85%',
        end: 'top -20%',  // Grid must scroll well past top before outro
        onEnter: () => {
          this.animateIn(grid);
          hasAnimatedIn = true;
        },
        onLeave: () => {
          if (hasAnimatedIn) {
            this.animateOut(grid);
          }
        },
        onEnterBack: () => {
          this.animateIn(grid);
        },
        onLeaveBack: () => {
          this.animateOut(grid);
        },
      });
    });
  }
};


/* ============================================
   ANIME.JS SEQUENCE ANIMATIONS
   For complex multi-step animations
   ============================================ */

const SequenceAnimations = {
  /**
   * Staggered list animation
   * @param {string} selector - List items selector
   * @param {number} delay - Delay between items in ms
   */
  staggerList(selector, delay = 100) {
    if (AnimConfig.reduceMotion || typeof anime === 'undefined') return;

    anime({
      targets: selector,
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 500,
      delay: anime.stagger(delay),
      easing: 'easeOutCubic',
    });
  },

  /**
   * Typewriter effect
   * @param {string} selector - Element selector
   * @param {number} speed - Characters per second
   */
  typewriter(selector, speed = 50) {
    const element = document.querySelector(selector);
    if (!element) return;

    const text = element.textContent;
    element.textContent = '';
    element.style.visibility = 'visible';

    let i = 0;
    const type = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, 1000 / speed);
      }
    };
    type();
  },

  /**
   * Number counter animation
   * @param {string} selector - Element selector
   * @param {number} target - Target number
   * @param {number} duration - Duration in ms
   */
  countUp(selector, target, duration = 2000) {
    if (typeof anime === 'undefined') return;

    const element = document.querySelector(selector);
    if (!element) return;

    const obj = { value: 0 };
    anime({
      targets: obj,
      value: target,
      duration: duration,
      easing: 'easeOutExpo',
      round: 1,
      update: () => {
        element.textContent = obj.value.toLocaleString();
      }
    });
  },

  /**
   * Pulse attention animation
   * @param {string} selector - Element selector
   */
  pulse(selector) {
    if (typeof anime === 'undefined') return;

    anime({
      targets: selector,
      scale: [1, 1.05, 1],
      duration: 400,
      easing: 'easeInOutCubic',
    });
  },

  /**
   * Shake error animation
   * @param {string} selector - Element selector
   */
  shake(selector) {
    if (typeof anime === 'undefined') return;

    anime({
      targets: selector,
      translateX: [0, -10, 10, -8, 8, -4, 4, 0],
      duration: 500,
      easing: 'easeInOutCubic',
    });
  },
};


/* ============================================
   PAGE TRANSITION ANIMATIONS
   ============================================ */

const PageTransitions = {
  /**
   * Fade out current page content
   * @param {Function} callback - Function to call after fade out
   */
  fadeOut(callback) {
    if (typeof gsap === 'undefined') {
      if (callback) callback();
      return;
    }

    gsap.to('main, .style-guide-container, .animation-guide-container', {
      opacity: 0,
      y: -30,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: callback
    });
  },

  /**
   * Fade in new page content
   */
  fadeIn() {
    if (typeof gsap === 'undefined') return;

    gsap.fromTo('main, .style-guide-container, .animation-guide-container',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
    );
  }
};


/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

const AnimUtils = {
  /**
   * Kill all ScrollTrigger instances (cleanup)
   */
  killAll() {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.getAll().forEach(st => st.kill());
    }
  },

  /**
   * Batch animate elements with GSAP
   * @param {string} selector - Elements selector
   * @param {Object} fromVars - From state
   * @param {Object} toVars - To state
   */
  batchAnimate(selector, fromVars, toVars) {
    if (typeof gsap === 'undefined') return;

    ScrollTrigger.batch(selector, {
      start: AnimConfig.scroll.start,
      end: AnimConfig.scroll.end,
      onEnter: batch => gsap.fromTo(batch, fromVars, { ...toVars, stagger: 0.1, overwrite: true }),
      onLeave: batch => gsap.to(batch, { ...fromVars, stagger: 0.05, overwrite: true }),
      onEnterBack: batch => gsap.to(batch, { ...toVars, stagger: 0.1, overwrite: true }),
      onLeaveBack: batch => gsap.to(batch, { ...fromVars, stagger: 0.05, overwrite: true }),
    });
  },

  /**
   * Smooth scroll to element
   * @param {string} selector - Target element selector
   * @param {number} offset - Offset from top in pixels
   */
  scrollTo(selector, offset = 0) {
    if (typeof gsap === 'undefined') return;

    gsap.to(window, {
      duration: 1,
      scrollTo: { y: selector, offsetY: offset },
      ease: 'power3.inOut'
    });
  }
};


/* ============================================
   INITIALIZATION
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure DOM is fully ready
  requestAnimationFrame(() => {
    // Initialize scroll animations
    ScrollAnimations.init();

    // Initialize scroll-triggered grids
    GridAnimations.initScrollGrid('[data-anim-grid]');

    console.log('Animation system initialized');
  });
});


/* ============================================
   EXPORTS (for module usage)
   ============================================ */

// Make available globally
window.AnimConfig = AnimConfig;
window.ScrollAnimations = ScrollAnimations;
window.GridAnimations = GridAnimations;
window.SequenceAnimations = SequenceAnimations;
window.PageTransitions = PageTransitions;
window.AnimUtils = AnimUtils;
