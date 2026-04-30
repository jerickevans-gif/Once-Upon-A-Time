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
