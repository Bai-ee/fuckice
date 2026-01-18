(() => {
  function initStack() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }

    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }

    const gsapTestEl = document.getElementById("gsap-test");
    if (window.gsap && gsapTestEl) {
      window.gsap.to(gsapTestEl, {
        opacity: 0.6,
        duration: 0.8,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut"
      });
    }

    const gsapScrollEl = document.getElementById("gsap-scroll-test");
    const scrollTriggerRoot = document.querySelector(".wrapper");
    if (window.gsap && window.ScrollTrigger && gsapScrollEl && scrollTriggerRoot) {
      window.gsap.to(gsapScrollEl, {
        x: 10,
        scrollTrigger: {
          trigger: scrollTriggerRoot,
          start: "top top",
          end: "bottom bottom",
          scrub: true
        }
      });
    }

    const lucideTestIcon = document.getElementById("lucide-test");
    if (window.gsap && lucideTestIcon) {
      window.gsap.set(lucideTestIcon, { rotate: 0 });
    }
  }

  document.addEventListener("DOMContentLoaded", initStack);
})();
