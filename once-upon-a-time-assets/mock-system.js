/* ==========================================================================
   mock-system.js — Shared interaction layer for the static demo site.

   Adds a toast helper, click-wires `data-mock` buttons (backend-required
   actions), and provides simple localStorage helpers used by bookmarks,
   read state, dismissals, etc.

   Include this script on every page (already added via Edit pass).
   ========================================================================== */
(function () {
  'use strict';

  // --------------------------- Toast container --------------------------- //
  function ensureToastContainer () {
    let el = document.getElementById('toast-stack');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'toast-stack';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.style.cssText =
      'position:fixed;bottom:20px;right:20px;z-index:1000;display:flex;flex-direction:column;gap:8px;pointer-events:none';
    document.body.appendChild(el);
    return el;
  }

  function toast (msg, opts) {
    opts = opts || {};
    const variant = opts.variant || 'info'; // info | success | warning | mock
    const stack = ensureToastContainer();
    const t = document.createElement('div');
    const bg =
      variant === 'success' ? '#3b6b2c'
      : variant === 'warning' ? '#a14638'
      : variant === 'mock' ? '#4C2F3B'
      : '#262422';
    t.style.cssText = `
      background:${bg};color:#fff;padding:12px 18px;border-radius:8px;
      font-family:var(--sans),system-ui,sans-serif;font-size:14px;line-height:1.4;
      box-shadow:0 8px 24px rgba(0,0,0,.20);max-width:340px;
      pointer-events:auto;cursor:pointer;
      transition:opacity .25s ease,transform .25s ease;
      opacity:0;transform:translateY(8px)`;
    t.textContent = msg;
    t.addEventListener('click', () => dismiss());
    stack.appendChild(t);
    requestAnimationFrame(() => {
      t.style.opacity = '1';
      t.style.transform = 'translateY(0)';
    });
    const ttl = opts.duration || 3500;
    const timer = setTimeout(dismiss, ttl);
    function dismiss () {
      clearTimeout(timer);
      t.style.opacity = '0';
      t.style.transform = 'translateY(8px)';
      setTimeout(() => t.remove(), 280);
    }
    return { dismiss };
  }
  window.OUAT_toast = toast;

  // ---------------------- Focus trap (modals, lightbox) ---------------------- //
  // Captures the previously focused element, focuses the first focusable inside
  // `container`, wraps Tab/Shift-Tab inside, and restores focus on detach().
  function trapFocus (container, opts) {
    opts = opts || {};
    const previouslyFocused = document.activeElement;
    const focusableSel = [
      'a[href]', 'button:not([disabled])', 'textarea:not([disabled])',
      'input:not([disabled])', 'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])', 'details > summary'
    ].join(',');

    function getNodes () {
      return Array.from(container.querySelectorAll(focusableSel))
        .filter(el => el.offsetParent !== null || el === document.activeElement);
    }
    // Initial focus
    const initial = opts.initial && container.querySelector(opts.initial);
    const nodes = getNodes();
    (initial || nodes[0] || container).focus();

    function onKey (e) {
      if (e.key !== 'Tab') return;
      const live = getNodes();
      if (live.length === 0) { e.preventDefault(); return; }
      const first = live[0], last = live[live.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !container.contains(active))) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && (active === last || !container.contains(active))) {
        e.preventDefault(); first.focus();
      }
    }
    document.addEventListener('keydown', onKey, true);
    return function detach () {
      document.removeEventListener('keydown', onKey, true);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }
  window.OUAT_trapFocus = trapFocus;

  // ---------------------- Service worker registration ---------------------- //
  // Registers a project-relative service worker so the same code works under
  // both GitHub Pages (/Once-Upon-A-Time/) and a custom Shopify-hosted root.
  if ('serviceWorker' in navigator) {
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (isSecure) {
      window.addEventListener('load', () => {
        // Walk back from the current document URL to find sw.js at the same level
        const swUrl = new URL('sw.js', location.href.replace(/\/[^/]*$/, '/')).toString();
        navigator.serviceWorker.register(swUrl, { scope: './' }).catch(() => { /* ignore */ });
      });
    }
  }

  // ----- localStorage helpers used by bookmark/dismiss/read state ----- //
  const ls = {
    has (key, val) {
      try {
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(arr) && arr.indexOf(val) !== -1;
      } catch { return false; }
    },
    add (key, val) {
      try {
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        if (Array.isArray(arr) && arr.indexOf(val) === -1) {
          arr.push(val);
          localStorage.setItem(key, JSON.stringify(arr));
        }
      } catch { /* ignore */ }
    },
    remove (key, val) {
      try {
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        const i = arr.indexOf(val);
        if (i !== -1) {
          arr.splice(i, 1);
          localStorage.setItem(key, JSON.stringify(arr));
        }
      } catch { /* ignore */ }
    },
    toggle (key, val) {
      if (ls.has(key, val)) { ls.remove(key, val); return false; }
      ls.add(key, val); return true;
    },
  };
  window.OUAT_ls = ls;

  // -------------------- Generic data-mock click wire -------------------- //
  // Buttons/links with data-mock="<feature>" trigger a toast describing
  // what the backend would do. Optional data-mock-toast="custom message".
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-mock]');
    if (!el) return;
    e.preventDefault();
    const feature = el.dataset.mock;
    const customMsg = el.dataset.mockToast;
    const map = {
      'add-to-cart':       'Added to cart — Shopify will track inventory and totals when deployed.',
      'enroll':            'Enrollment routed to Shopify checkout in production.',
      'cart':              'Cart drawer opens via Shopify in production.',
      'checkout':          'Stripe / Shopify Payments handles checkout in production.',
      'login-google':      'Google OAuth runs through Shopify customer accounts in production.',
      'login-apple':       'Sign in with Apple runs through Shopify customer accounts in production.',
      'login-email':       'Magic-link email is sent via Shopify or Klaviyo in production.',
      'change-email':      'Backend email-change flow runs through Shopify customer API.',
      'change-password':   'Backend password-change flow runs through Shopify customer API.',
      'enable-2fa':        '2-step verification is configured on Shopify customer accounts.',
      'add-payment':       'Shopify saved-card setup launches Stripe SetupIntent in production.',
      'delete-account':    'Account deletion runs through Shopify GDPR endpoint in production.',
      'add-profile':       'Child profile create form opens — backend persists via Shopify metaobject.',
      'remove-profile':    'Child profile delete confirms + Shopify metaobject mutation.',
      'load-more':         'Loads next 3 child profiles from Shopify metaobjects in production.',
      'cancel-program':    'Cancellation flow + refund runs through Shopify orders API.',
      'report-issue':      'Routes to support via Shopify Inbox in production.',
      'view-receipt':      'Opens printable Shopify order receipt in production.',
      'newsletter-signup': 'Email subscribed via Klaviyo / Mailchimp in production.',
      'reserve-spot':      'Class reservation routes to Shopify checkout in production.',
      'register-now':      'Registration routes to Shopify checkout in production.',
      'subscribe':         'Subscription created via Shopify Subscriptions in production.',
      'admin-newsletter':  'Admin newsletter editor opens via Shopify in production.',
      'archive-message':   'Message archived via Shopify Inbox in production.',
      'reply-message':     'Reply composer opens. Routes via Shopify Inbox in production.',
      'forward-message':   'Forward composer opens. Routes via Shopify Inbox in production.',
      'download':          'Download begins. Generated server-side via Shopify in production.',
      'download-pdf':      'PDF download is generated server-side via Shopify in production.',
      'external-press':    'Opens the external press article in a new tab in production.',
      'filter-date':       'Date-range picker opens. Hooked to Shopify article publish_at in production.',
      'newsletter-more':   'More-actions menu (export, archive, settings) opens here in production.',
      'reset-password':    'Magic-link reset email is sent via Shopify customer accounts in production.',
      'rsvp':              'RSVP recorded via Shopify customer metaobject in production.',
      'signup-shift':      'Volunteer shift sign-up runs through Shopify metaobject in production.',
      'waitlist':          'Added to waitlist — notified by Shopify automation when a spot opens.',
      'view-newsletter':   'Opens the standalone newsletter article page in production.',
    };
    const message = customMsg || map[feature] || 'This action runs through Shopify in production.';
    toast(message, { variant: 'mock' });
  });

  // ------------------------- Share helper ------------------------- //
  // [data-share] uses the Web Share API when available, falls back to copy.
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-share]');
    if (!el) return;
    e.preventDefault();
    const url = el.dataset.shareUrl || window.location.href;
    const title = el.dataset.shareTitle || document.title;
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => toast('Link copied to clipboard', { variant: 'success' }))
        .catch(() => toast('Could not copy link', { variant: 'warning' }));
    } else {
      toast(url, { variant: 'info', duration: 6000 });
    }
  });

  // -------------------- Bookmark toggle (data-bookmark) -------------------- //
  // Adds an "is-bookmarked" class and toggles persistent state by id.
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-bookmark]');
    if (!el) return;
    e.preventDefault();
    const id = el.dataset.bookmark;
    const on = ls.toggle('ouat:bookmarks', id);
    el.classList.toggle('is-bookmarked', on);
    el.setAttribute('aria-pressed', on ? 'true' : 'false');
    toast(on ? 'Saved to your bookmarks' : 'Removed from bookmarks',
          { variant: on ? 'success' : 'info', duration: 1800 });
  });

  // Restore bookmark state on load
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-bookmark]').forEach(el => {
      if (ls.has('ouat:bookmarks', el.dataset.bookmark)) {
        el.classList.add('is-bookmarked');
        el.setAttribute('aria-pressed', 'true');
      }
    });
  });

  // -------------------- Sign-in launcher (data-open-signin) -------------------- //
  // The Sign-in button in the header uses data-open-signin. Route it to login.html.
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-open-signin]');
    if (!el) return;
    e.preventDefault();
    window.location.href = 'login.html';
  });

  // -------------------- Confirmation modal (data-confirm) -------------------- //
  // Usage: <button data-confirm="<title>" data-confirm-body="<msg>" data-confirm-action="<url-or-mock>" data-confirm-cta="Delete">Delete</button>
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-confirm]');
    if (!el) return;
    e.preventDefault();
    const title = el.dataset.confirm;
    const body = el.dataset.confirmBody || 'This action cannot be undone.';
    const cta = el.dataset.confirmCta || 'Confirm';
    const danger = el.dataset.confirmDanger === 'true';
    const action = el.dataset.confirmAction || '';
    showConfirm({ title, body, cta, danger, onConfirm: () => {
      if (action.startsWith('mock:')) {
        toast(el.dataset.confirmToast || 'Confirmed. Routes to Shopify in production.', { variant: 'mock' });
      } else if (action) {
        window.location.href = action;
      } else {
        toast('Confirmed.', { variant: 'success' });
      }
    }});
  });
  function showConfirm ({ title, body, cta, danger, onConfirm }) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal ${danger ? 'modal--danger' : ''}" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 class="modal__title" id="confirm-title">${title}</h2>
        <p class="modal__body">${body}</p>
        <div class="modal__actions">
          <button class="btn btn--ghost" data-cancel>Cancel</button>
          <button class="btn ${danger ? 'btn-confirm' : ''}" data-ok>${cta}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const dialog = overlay.querySelector('.modal');
    const detachTrap = trapFocus(dialog, { initial: '[data-ok]' });
    const close = () => { detachTrap(); overlay.remove(); };
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
      if (e.target.matches('[data-cancel]')) close();
      if (e.target.matches('[data-ok]')) { close(); onConfirm(); }
    });
    document.addEventListener('keydown', function esc (ev) {
      if (ev.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });
  }
  window.OUAT_confirm = (opts) => showConfirm(opts);

  // -------------------- Header search injection -------------------- //
  // Adds a search input + dropdown to the .header-actions on every page.
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.header-actions').forEach(actions => {
      if (actions.querySelector('[data-header-search]')) return;
      const wrap = document.createElement('form');
      wrap.action = 'search.html';
      wrap.method = 'get';
      wrap.role = 'search';
      wrap.setAttribute('data-header-search', '');
      wrap.style.cssText = 'flex:0 0 auto;display:none;align-items:center;gap:6px;background:var(--snow);border:1px solid var(--line);border-radius:8px;padding:4px 10px;margin-right:8px';
      wrap.innerHTML = `
        <i class="ph ph-magnifying-glass" style="color:var(--ink-muted);font-size:14px"></i>
        <input type="search" name="q" placeholder="Search" aria-label="Search the site" style="border:0;background:transparent;outline:0;font-size:13px;width:140px">`;
      actions.insertBefore(wrap, actions.firstChild);
      // Show only on wide enough viewports
      const mq = window.matchMedia('(min-width: 1024px)');
      const apply = () => { wrap.style.display = mq.matches ? 'inline-flex' : 'none'; };
      apply(); mq.addEventListener('change', apply);
    });
  });

  // -------------------- Form error helper -------------------- //
  // Mark inputs with .is-error and emit a .field-error sibling.
  window.OUAT_setFieldError = function (input, msg) {
    if (!input) return;
    input.classList.add('is-error');
    let err = input.parentElement.querySelector('.field-error');
    if (!err) {
      err = document.createElement('div');
      err.className = 'field-error';
      input.parentElement.appendChild(err);
    }
    err.textContent = msg;
    input.addEventListener('input', () => {
      input.classList.remove('is-error');
      err.remove();
    }, { once: true });
  };

  // -------------------- Cookie banner (auto-injected) -------------------- //
  document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('ouat:cookies-acked')) return;
    if (document.querySelector('.cookie-banner')) return;
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = `
      <div class="cookie-banner__text">
        We use a small number of essential cookies and an optional analytics cookie. You can change your mind any time. <a href="privacy.html">Learn more</a>.
      </div>
      <div class="cookie-banner__actions">
        <button type="button" class="btn-decline" data-cookie-decline>Decline</button>
        <button type="button" class="btn-accept" data-cookie-accept>Accept all</button>
      </div>`;
    document.body.appendChild(banner);
    banner.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cookie-accept], [data-cookie-decline]');
      if (!btn) return;
      localStorage.setItem('ouat:cookies-acked',
        btn.dataset.cookieAccept !== undefined ? 'all' : 'essential');
      banner.remove();
    });
  });

  // -------------------- Settings dropdown (header gear) -------------------- //
  // Replace bare gear link with a dropdown trigger if present.
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a.icon-btn--icon-only[aria-label="Settings"]').forEach(gear => {
      // Wrap in dropdown if not already
      if (gear.parentElement.classList.contains('dropdown')) return;
      const wrap = document.createElement('div');
      wrap.className = 'dropdown';
      gear.parentNode.insertBefore(wrap, gear);
      wrap.appendChild(gear);
      gear.removeAttribute('href');
      gear.setAttribute('role', 'button');
      gear.setAttribute('aria-haspopup', 'menu');
      gear.setAttribute('tabindex', '0');
      gear.style.cursor = 'pointer';
      const menu = document.createElement('div');
      menu.className = 'dropdown__menu';
      menu.setAttribute('role', 'menu');
      menu.innerHTML = `
        <div class="dropdown__label">Account</div>
        <a class="dropdown__item" href="profile.html"><i class="ph ph-user-circle"></i> My Profile</a>
        <a class="dropdown__item" href="preferences.html"><i class="ph ph-sliders-horizontal"></i> Preferences</a>
        <a class="dropdown__item" href="class-history.html"><i class="ph ph-book-open"></i> Class history</a>
        <a class="dropdown__item" href="inbox.html"><i class="ph ph-envelope"></i> Inbox</a>
        <div class="dropdown__sep"></div>
        <div class="dropdown__label">Site</div>
        <a class="dropdown__item" href="search.html"><i class="ph ph-magnifying-glass"></i> Search</a>
        <a class="dropdown__item" href="accessibility.html"><i class="ph ph-eye"></i> Accessibility</a>
        <button class="dropdown__item" type="button" data-mock="logout" data-mock-toast="Sign out via Shopify customer accounts in production."><i class="ph ph-sign-out"></i> Sign out</button>`;
      wrap.appendChild(menu);
      gear.addEventListener('click', (e) => {
        e.preventDefault();
        wrap.classList.toggle('is-open');
      });
      document.addEventListener('click', (e) => {
        if (!wrap.contains(e.target)) wrap.classList.remove('is-open');
      });
    });
  });

  // -------------------- Dark mode -------------------- //
  // Toggle persists in localStorage. Add `dark` class to <html>.
  function applyTheme (mode) {
    document.documentElement.classList.toggle('theme-dark', mode === 'dark');
  }
  const savedTheme = localStorage.getItem('ouat:theme');
  if (savedTheme) applyTheme(savedTheme);

  window.OUAT_setTheme = (mode) => {
    localStorage.setItem('ouat:theme', mode);
    applyTheme(mode);
  };

  // Hook into [data-theme-toggle] click
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-theme-toggle]');
    if (!el) return;
    const cur = localStorage.getItem('ouat:theme') === 'dark' ? 'dark' : 'light';
    window.OUAT_setTheme(cur === 'dark' ? 'light' : 'dark');
    if (window.OUAT_toast) window.OUAT_toast(`Switched to ${cur === 'dark' ? 'light' : 'dark'} mode`, { variant: 'info', duration: 1400 });
  });

  // -------------------- Breadcrumbs (auto-injected on detail pages) -------------------- //
  document.addEventListener('DOMContentLoaded', () => {
    const main = document.getElementById('main');
    if (!main) return;
    if (document.querySelector('.breadcrumbs')) return;
    const path = window.location.pathname.replace(/^.*\//, '').replace('.html', '');
    const map = {
      'newsletter-article': [['index.html', 'Home'], ['newsletter.html', 'Newsletter'], [null, 'Article']],
      'instructor':         [['index.html', 'Home'], ['instructors.html', 'Instructors'], [null, 'Profile']],
      'enrollment':         [['index.html', 'Home'], ['programs.html', 'Programs'], [null, 'Enrollment']],
      'receipt':            [['index.html', 'Home'], ['class-history.html', 'Class History'], [null, 'Receipt']],
      'inbox-message':      [['index.html', 'Home'], ['inbox.html', 'Inbox'], [null, 'Message']],
      'order-confirmation': [['index.html', 'Home'], [null, 'Order confirmed']],
      'waiver':             [['index.html', 'Home'], ['enrollment.html', 'Enrollment'], [null, 'Waiver']],
      'gift-donation':      [['index.html', 'Home'], ['donate.html', 'Donate'], [null, 'In honor or memory']],
      'scholarship':        [['index.html', 'Home'], ['programs.html', 'Programs'], [null, 'Scholarship']],
      'sponsorship':        [['index.html', 'Home'], ['donate.html', 'Donate'], [null, 'Corporate Sponsorship']],
      'impact-report':      [['index.html', 'Home'], ['donate.html', 'Donate'], [null, 'Impact Report']],
      'donor-wall':         [['index.html', 'Home'], ['donate.html', 'Donate'], [null, 'Donor Wall']],
      'volunteer-dashboard':[['index.html', 'Home'], [null, 'Volunteer']],
      'gallery':            [['index.html', 'Home'], ['about.html', 'About'], [null, 'Gallery']],
      'events':             [['index.html', 'Home'], [null, 'Events']],
      'instructors':        [['index.html', 'Home'], ['about.html', 'About'], [null, 'Instructors']],
      'programs':           [['index.html', 'Home'], [null, 'Programs']],
    };
    const crumbs = map[path];
    if (!crumbs) return;
    const nav = document.createElement('nav');
    nav.className = 'breadcrumbs';
    nav.setAttribute('aria-label', 'Breadcrumb');
    nav.innerHTML = '<ol>' + crumbs.map(([href, label], i) => {
      const sep = i < crumbs.length - 1 ? '<span class="breadcrumbs__sep">›</span>' : '';
      return '<li>' + (href ? `<a href="${href}">${label}</a>` : `<span aria-current="page">${label}</span>`) + sep + '</li>';
    }).join('') + '</ol>';
    main.insertBefore(nav, main.firstChild);

    // Inject matching BreadcrumbList JSON-LD for SEO
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map(([href, label], i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: label,
        ...(href ? { item: 'https://jerickevans-gif.github.io/Once-Upon-A-Time/' + href } : {}),
      }))
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(ld);
    document.head.appendChild(script);
  });

  // -------------------- Skeleton entrance for [data-skeleton-list] -------------------- //
  // Hides the real list, shows skeletons for ~600ms, then reveals.
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-skeleton-list]').forEach(list => {
      const items = Array.from(list.children);
      const count = parseInt(list.dataset.skeletonList, 10) || items.length || 6;
      // Build skeleton cards
      const skel = document.createElement('div');
      skel.style.cssText = list.getAttribute('style') || '';
      skel.className = list.className;
      for (let i = 0; i < count; i++) {
        const card = document.createElement('div');
        card.style.cssText = 'background:var(--snow);border:1px solid var(--line);border-radius:14px;overflow:hidden';
        card.innerHTML = '<div class="skeleton skeleton--block" style="height:160px;border-radius:0"></div><div style="padding:18px"><div class="skeleton skeleton--title" style="margin-bottom:10px"></div><div class="skeleton skeleton--text"></div><div class="skeleton skeleton--text" style="width:60%"></div></div>';
        skel.appendChild(card);
      }
      list.style.display = 'none';
      list.parentNode.insertBefore(skel, list);
      setTimeout(() => {
        skel.remove();
        list.style.display = '';
      }, 600);
    });
  });

  // -------------------- Calendar grid full navigation (index) -------------------- //
  document.addEventListener('DOMContentLoaded', () => {
    const calGrid = document.querySelector('.calendar__grid');
    const calLabel = document.querySelector('[data-cal-label]');
    if (!calGrid || !calLabel) return;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    // Real schedule: keyed by `${year}-${month}` (0-indexed month). Each entry
    // is { day: { kind: 'rose'|'garden'|'blush', label, href } }. `rose` = class,
    // `garden` = drop-in workshop, `blush` = event/showcase.
    const SCHEDULE = {
      '2026-0': {
        2:  { kind: 'rose',   label: 'Beginner Ballet — Tue 5pm',     href: 'private-lessons.html' },
        4:  { kind: 'garden', label: 'Garden Co-op — Thu 4pm',         href: 'programs.html#garden' },
        6:  { kind: 'rose',   label: 'Jazz Class — Thu 4pm',           href: 'enrollment.html?class=jazz-winter-2026' },
        9:  { kind: 'rose',   label: 'Beginner Ballet — Tue 5pm',     href: 'private-lessons.html' },
        11: { kind: 'garden', label: 'Garden Co-op — Thu 4pm',         href: 'programs.html#garden' },
        13: { kind: 'rose',   label: 'Jazz Class — Thu 4pm',           href: 'enrollment.html?class=jazz-winter-2026' },
        17: { kind: 'rose',   label: 'Storytime Showcase — Sat 11am', href: 'events.html' },
        20: { kind: 'garden', label: 'Garden Co-op — Thu 4pm',         href: 'programs.html#garden' },
        25: { kind: 'blush',  label: 'Winter Showcase — Sun 2pm',     href: 'events.html' },
        27: { kind: 'blush',  label: 'Family Open House — Tue 6pm',   href: 'events.html' },
        31: { kind: 'blush',  label: 'Donor Reception — Sat 7pm',     href: 'donate.html' }
      },
      '2026-1': {
        3:  { kind: 'rose',   label: 'Beginner Ballet — Tue 5pm',     href: 'private-lessons.html' },
        5:  { kind: 'rose',   label: 'Jazz Class — Thu 4pm',           href: 'enrollment.html?class=jazz-winter-2026' },
        10: { kind: 'rose',   label: 'Beginner Ballet — Tue 5pm',     href: 'private-lessons.html' },
        12: { kind: 'rose',   label: 'Jazz Class — Thu 4pm',           href: 'enrollment.html?class=jazz-winter-2026' },
        14: { kind: 'blush',  label: 'Valentine’s Family Mixer', href: 'events.html' },
        17: { kind: 'rose',   label: 'Beginner Ballet — Tue 5pm',     href: 'private-lessons.html' },
        21: { kind: 'garden', label: 'Garden Co-op — Sat 10am',        href: 'programs.html#garden' },
        24: { kind: 'rose',   label: 'Beginner Ballet — Tue 5pm',     href: 'private-lessons.html' },
        28: { kind: 'blush',  label: 'Spring Reg Opens — Sat 9am',    href: 'enrollment.html' }
      },
      '2026-2': {
        3:  { kind: 'rose',   label: 'Beginner Ballet — Tue 5pm',     href: 'private-lessons.html' },
        5:  { kind: 'rose',   label: 'Ceramics Studio — Thu 4pm',     href: 'enrollment.html?class=ceramics-spring-2026' },
        15: { kind: 'blush',  label: 'Botanical Garden Field Trip',   href: 'events.html' },
        21: { kind: 'garden', label: 'Garden Co-op — Sat 10am',        href: 'programs.html#garden' },
        28: { kind: 'blush',  label: 'Spring Showcase — Sat 2pm',     href: 'events.html' }
      }
    };

    let cur = { m: 0, y: 2026 };

    function tooltip () {
      let t = document.getElementById('ouat-cal-tip');
      if (!t) {
        t = document.createElement('div');
        t.id = 'ouat-cal-tip';
        t.style.cssText = 'position:fixed;z-index:1100;background:var(--ink);color:var(--snow);padding:6px 10px;border-radius:6px;font-size:12px;font-weight:500;pointer-events:none;opacity:0;transition:opacity .15s;max-width:240px;box-shadow:0 6px 20px rgba(0,0,0,.18);';
        document.body.appendChild(t);
      }
      return t;
    }
    function showTip (target, text) {
      const t = tooltip();
      t.textContent = text;
      const r = target.getBoundingClientRect();
      t.style.left = `${Math.round(r.left + r.width / 2 - t.offsetWidth / 2 + (t.offsetWidth ? 0 : 30))}px`;
      t.style.top = `${Math.round(r.top - 36)}px`;
      t.style.opacity = '1';
      // re-position once textContent set
      requestAnimationFrame(() => {
        t.style.left = `${Math.round(r.left + r.width / 2 - t.offsetWidth / 2)}px`;
      });
    }
    function hideTip () { const t = tooltip(); t.style.opacity = '0'; }

    function rebuild () {
      calLabel.innerHTML = months[cur.m] + '&nbsp;' + cur.y;
      const firstDay = new Date(cur.y, cur.m, 1).getDay();
      const daysInMonth = new Date(cur.y, cur.m + 1, 0).getDate();
      const dows = Array.from(calGrid.querySelectorAll('.calendar__dow'));
      calGrid.innerHTML = '';
      dows.forEach(d => calGrid.appendChild(d));
      for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement('span');
        blank.className = 'calendar__day calendar__day--blank';
        blank.style.opacity = '0';
        calGrid.appendChild(blank);
      }
      const monthSchedule = SCHEDULE[`${cur.y}-${cur.m}`] || {};
      for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement('span');
        cell.className = 'calendar__day';
        cell.textContent = d;
        const ev = monthSchedule[d];
        if (ev) {
          cell.classList.add('calendar__day--' + ev.kind);
          cell.setAttribute('role', 'link');
          cell.setAttribute('tabindex', '0');
          cell.dataset.evHref = ev.href;
          cell.dataset.evLabel = ev.label;
          cell.setAttribute('aria-label', `${months[cur.m]} ${d} — ${ev.label}`);
          cell.style.cursor = 'pointer';
          cell.addEventListener('mouseenter', () => showTip(cell, ev.label));
          cell.addEventListener('mouseleave', hideTip);
          cell.addEventListener('focus', () => showTip(cell, ev.label));
          cell.addEventListener('blur', hideTip);
          cell.addEventListener('click', () => { window.location.href = ev.href; });
          cell.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.location.href = ev.href; }
          });
        }
        calGrid.appendChild(cell);
      }
    }
    rebuild();  // ensure first render uses real schedule even when markup ships static
    document.querySelector('[data-cal-prev]')?.addEventListener('click', () => {
      cur.m--; if (cur.m < 0) { cur.m = 11; cur.y--; }
      rebuild();
    });
    document.querySelector('[data-cal-next]')?.addEventListener('click', () => {
      cur.m++; if (cur.m > 11) { cur.m = 0; cur.y++; }
      rebuild();
    });
  });

  // -------------------- Hero carousel auto-rotate -------------------- //
  // index.html owns its own carousel logic (slides + content swap). This
  // fallback only kicks in if a page has dots but no inline implementation.
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-hero]')) return;  // owned by page
    const dots = document.querySelectorAll('.hero__dots span[role="button"]');
    if (dots.length < 2) return;
    let i = 0;
    setInterval(() => {
      i = (i + 1) % dots.length;
      dots.forEach(d => d.removeAttribute('aria-current'));
      dots[i].setAttribute('aria-current', 'true');
    }, 6000);
  });

  // -------------------- Lightbox (data-lightbox) -------------------- //
  // Auto-wires gallery thumbs to a lightbox overlay. Each thumb provides
  // its bg-image via inline style; we extract and render full-size.
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-lightbox]');
    if (!el) return;
    e.preventDefault();
    const bg = el.style.backgroundImage || getComputedStyle(el).backgroundImage;
    const m = bg.match(/url\(["']?([^"')]+)["']?\)/);
    if (!m) return;
    const src = m[m.length - 1] === ')' ? m[1] : m[m.length - 1];
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.85);
      display:grid;place-items:center;padding:24px;
      animation:lightbox-fade .25s ease`;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image preview');
    overlay.innerHTML = `
      <button type="button" aria-label="Close lightbox" data-close
        style="position:absolute;top:24px;right:24px;background:rgba(255,255,255,.1);border:0;color:#fff;width:44px;height:44px;border-radius:50%;cursor:pointer;font-size:18px;display:inline-flex;align-items:center;justify-content:center"><i class="ph ph-x"></i></button>
      <img src="${src}" style="max-width:100%;max-height:90vh;border-radius:8px;box-shadow:0 16px 48px rgba(0,0,0,.5)" alt="">`;
    document.body.appendChild(overlay);
    const detachTrap = trapFocus(overlay, { initial: '[data-close]' });
    const close = () => { detachTrap(); overlay.remove(); };
    overlay.addEventListener('click', (ev) => {
      if (ev.target === overlay || ev.target.closest('[data-close]')) close();
    });
    document.addEventListener('keydown', function esc (ev) {
      if (ev.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });
  });

  // -------------------- FAQ accordion (data-faq) -------------------- //
  // <button data-faq aria-expanded="false" aria-controls="answer-id">
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-faq]');
    if (!el) return;
    const id = el.getAttribute('aria-controls');
    const panel = id ? document.getElementById(id) : el.nextElementSibling;
    if (!panel) return;
    const open = el.getAttribute('aria-expanded') === 'true';
    el.setAttribute('aria-expanded', open ? 'false' : 'true');
    panel.hidden = open;
  });
})();
