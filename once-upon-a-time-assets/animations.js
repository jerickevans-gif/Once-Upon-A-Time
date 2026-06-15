/* Once Upon A Time — GSAP animation bootstrap.
   Loaded via CDN (gsap + ScrollTrigger) since the static site has no bundler.
   The Shopify theme will swap to the npm-installed gsap when the build pipeline lands.

   Activate animations by adding data attributes to markup:
     data-anim="fade-up"      — fade in + slide up on scroll
     data-anim="fade-in"      — fade in (no movement)
     data-anim="scale-in"     — scale 0.95 -> 1 + fade
     data-anim-delay="0.2"    — stagger delay in seconds
     data-anim-stagger        — apply animation to direct children, staggered

   Respects prefers-reduced-motion automatically. */

(function () {
  'use strict';
  if (typeof window === 'undefined') return;

  function init() {
    var prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduce || !window.gsap) {
      // Skip animations entirely — element starts in final state via CSS.
      document.querySelectorAll('[data-anim]').forEach(function (el) {
        el.style.opacity = '';
        el.style.transform = '';
      });
      return;
    }

    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    var defaultTriggerOpts = {
      start: 'top 85%',
      toggleActions: 'play none none none',
    };

    var presets = {
      'fade-up':  { from: { opacity: 0, y: 30 }, to: { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' } },
      'fade-in':  { from: { opacity: 0 },          to: { opacity: 1, duration: 0.5, ease: 'power1.out' } },
      'scale-in': { from: { opacity: 0, scale: 0.95 }, to: { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' } },
      'slide-left':  { from: { opacity: 0, x: -30 }, to: { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' } },
      'slide-right': { from: { opacity: 0, x:  30 }, to: { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' } },
    };

    function animate(el, presetName, delay) {
      var p = presets[presetName] || presets['fade-up'];
      gsap.set(el, p.from);
      var tween = Object.assign({}, p.to, { delay: delay || 0 });
      if (window.ScrollTrigger) {
        gsap.to(el, Object.assign(tween, { scrollTrigger: Object.assign({ trigger: el }, defaultTriggerOpts) }));
      } else {
        gsap.to(el, tween);
      }
    }

    document.querySelectorAll('[data-anim]').forEach(function (el) {
      var name = el.getAttribute('data-anim');
      var delay = parseFloat(el.getAttribute('data-anim-delay') || '0');
      var stagger = el.hasAttribute('data-anim-stagger');

      if (stagger) {
        var children = Array.from(el.children);
        children.forEach(function (child, i) {
          animate(child, name, delay + i * 0.08);
        });
      } else {
        animate(el, name, delay);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
