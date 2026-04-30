/* Shared site behaviors — included on every page once.
   Mobile nav toggle, sticky-header scroll shadow, promo-bar dismiss
   (with localStorage persistence), related carousels, calendar nav,
   newsletter view-mode toggles. Idempotent: safe to load on any page. */

(function () {
  'use strict';

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
