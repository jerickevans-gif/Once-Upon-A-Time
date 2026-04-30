/* Shared site behaviors — included on every page once.
   Mobile nav toggle, sticky-header scroll shadow, promo-bar dismiss
   (with localStorage persistence), related carousels, calendar nav,
   newsletter view-mode toggles. Idempotent: safe to load on any page. */

(function () {
  'use strict';

  // ---------- Microsoft Clarity (heatmaps + session replay + analytics) ----------
  //
  // 1. Sign in at https://clarity.microsoft.com (free, no credit card)
  // 2. Create a project for the OUAT site
  // 3. Copy the Project ID from Settings → Setup → Tracking code
  //    (it's an 8–12 char alphanumeric string like "abc123xyz")
  // 4. Paste it below. Clarity will start collecting on the next deploy.
  //
  // Loading is gated on the user's analytics-cookie consent: the script only
  // attaches if `ouat:cookies-acked` === 'all'. If the user declined analytics
  // (or hasn't answered the banner yet), Clarity stays dormant.
  const CLARITY_PROJECT_ID = 'wk101k1149';
  function attachClarity (id) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", id);
  }
  if (CLARITY_PROJECT_ID) {
    let consent = null;
    try { consent = localStorage.getItem('ouat:cookies-acked'); } catch (e) {}
    if (consent === 'all') {
      attachClarity(CLARITY_PROJECT_ID);
    } else {
      // Cross-tab consent change reloads to attach Clarity cleanly.
      window.addEventListener('storage', function (e) {
        if (e.key === 'ouat:cookies-acked' && e.newValue === 'all') location.reload();
      });
      // Same-tab Accept-all click attaches without a reload (deferred to next tick
      // so the banner's own handler writes localStorage first).
      document.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('[data-cookie-accept]')) {
          setTimeout(function () {
            try {
              if (localStorage.getItem('ouat:cookies-acked') === 'all') {
                attachClarity(CLARITY_PROJECT_ID);
              }
            } catch (err) {}
          }, 0);
        }
      });
    }
  }

  // ---------- Mobile nav toggle ----------
  const navToggle = document.querySelector('.nav-toggle');
  const primaryNav = document.getElementById('primary-nav');
  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const open = primaryNav.dataset.open === 'true';
      primaryNav.dataset.open = open ? 'false' : 'true';
      navToggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  }

  // ---------- Sticky-header scroll shadow ----------
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---------- Promo bar dismiss (with localStorage persistence) ----------
  const promo = document.querySelector('.promo-bar');
  if (promo) {
    try {
      if (localStorage.getItem('promo-dismissed-2026') === '1') {
        promo.remove();
      } else {
        const closeBtn = promo.querySelector('.promo-bar__close');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            promo.remove();
            try { localStorage.setItem('promo-dismissed-2026', '1'); } catch (_) {}
          });
        }
      }
    } catch (_) { /* private browsing */ }
  }

  // ---------- Related newsletters carousel arrow ----------
  document.querySelectorAll('.nl-related__arrow').forEach(btn => {
    const grid = btn.closest('.nl-related__viewport')?.querySelector('.nl-related__grid');
    if (!grid) return;
    btn.addEventListener('click', () => grid.scrollBy({ left: 320, behavior: 'smooth' }));
  });

  // ---------- Newsletter view-mode toggles ----------
  const views = document.querySelectorAll('.nl-views button');
  if (views.length) {
    const grid = document.querySelector('.nl-related__grid');
    views.forEach(btn => btn.addEventListener('click', () => {
      views.forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      if (grid) grid.dataset.view = btn.getAttribute('aria-label') || '';
    }));
  }

  // ---------- Bookmark/Share toggle states ----------
  document.querySelectorAll('.nl-card__icons button').forEach(btn => {
    btn.addEventListener('click', () => {
      const pressed = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', pressed ? 'false' : 'true');
      const i = btn.querySelector('.ph');
      if (i && i.classList.contains('ph-bookmark-simple')) {
        i.classList.toggle('ph-bookmark-simple-fill', !pressed);
      }
    });
  });

  // ---------- Programs carousel arrows (about page) ----------
  const programArrows = document.querySelectorAll('.program-arrow');
  programArrows.forEach(btn => {
    const grid = btn.closest('.programs__viewport')?.querySelector('.programs__grid');
    if (!grid) return;
    btn.addEventListener('click', () => {
      const dir = btn.classList.contains('program-arrow--next') ? 1 : -1;
      grid.scrollBy({ left: dir * 320, behavior: 'smooth' });
    });
  });

  // ---------- Coming-soon stubs ----------
  document.querySelectorAll('[data-coming-soon]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      announceStatus(el.getAttribute('data-coming-soon') || 'Coming soon — stay tuned.');
    });
  });

  // ---------- Newsletter subscribe ----------
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    const status = document.getElementById('newsletter-status');
    newsletterForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = newsletterForm.email?.value?.trim() || '';
      const submit = newsletterForm.querySelector('button[type=submit]');
      if (!email || !email.includes('@') || email.length < 5) {
        if (status) {
          status.textContent = 'Please enter a valid email address.';
          status.dataset.state = 'error';
          status.classList.remove('sr-only');
        }
        return;
      }
      if (submit) { submit.setAttribute('aria-busy', 'true'); submit.disabled = true; }
      setTimeout(() => {
        if (status) {
          status.textContent = `Thanks — we'll send updates to ${email}.`;
          status.dataset.state = 'success';
          status.classList.remove('sr-only');
        }
        if (submit) { submit.removeAttribute('aria-busy'); submit.disabled = false; }
        newsletterForm.reset();
      }, 700);
    });
  }

  // ---------- Contact form ----------
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const status = document.getElementById('contact-status');
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(contactForm);
      const first = (data.get('first') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();
      const submit = contactForm.querySelector('button[type=submit]');
      const setStatus = (text, state) => {
        if (!status) return;
        status.textContent = text;
        status.dataset.state = state;
        status.classList.remove('sr-only');
      };
      if (!first) return setStatus('Please enter your first name.', 'error');
      if (!email || !email.includes('@')) return setStatus('Please enter a valid email address.', 'error');
      if (!message || message.length < 8) return setStatus('Please enter a message (at least 8 characters).', 'error');
      if (submit) { submit.setAttribute('aria-busy', 'true'); submit.disabled = true; }
      setTimeout(() => {
        setStatus(`Thanks ${first} — we'll be in touch at ${email} shortly.`, 'success');
        if (submit) { submit.removeAttribute('aria-busy'); submit.disabled = false; }
        contactForm.reset();
      }, 800);
    });
  }

  function announceStatus(text) {
    let region = document.getElementById('site-status');
    if (!region) {
      region = document.createElement('div');
      region.id = 'site-status';
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      region.className = 'sr-only';
      document.body.appendChild(region);
    }
    region.textContent = text;
  }
})();
