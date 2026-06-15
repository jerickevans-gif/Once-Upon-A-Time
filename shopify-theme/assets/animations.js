/* Once Upon A Time — GSAP scroll-reveal bootstrap (Shopify theme copy).
   Mirror of /once-upon-a-time-assets/animations.js. When the build pipeline
   lands, this becomes an npm import of gsap + ScrollTrigger and gets tree-shaken
   into the theme bundle. For now it expects window.gsap + window.ScrollTrigger
   (loaded via theme.liquid CDN <script> tags). */

(function () {
  'use strict';
  if (typeof window === 'undefined') return;

  function init() {
    var prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduce || !window.gsap) {
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
      'fade-up':     { from: { opacity: 0, y: 30 },          to: { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' } },
      'fade-in':     { from: { opacity: 0 },                  to: { opacity: 1, duration: 0.5, ease: 'power1.out' } },
      'scale-in':    { from: { opacity: 0, scale: 0.95 },     to: { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' } },
      'slide-left':  { from: { opacity: 0, x: -30 },          to: { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' } },
      'slide-right': { from: { opacity: 0, x: 30 },           to: { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' } },
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
        Array.from(el.children).forEach(function (child, i) {
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
