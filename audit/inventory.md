# Off-Spec Inventory — Once Upon A Time

> Generated 2026-04-30. The source of truth is `inventory.json`; this file is the human-readable view.

The Once Upon A Time site ships **30 distinct features, components, and pages that did not have a corresponding artifact in the original PDF design set**. This list exists so the design team can either (a) bless the existing implementation, (b) write formal specs to retrofit, or (c) make explicit decisions about the Shopify migration scope.

A branded, screenshot-driven version of this same data lives at `/presentation/index.html`.

---

## Importance scale

- **5** — Core to the site functioning. Removing breaks a critical journey.
- **4** — Important and pervasive. Used across many pages.
- **3** — Nice-to-have polish or single-page feature.
- **2** — Tooling, SEO, or developer infrastructure.
- **1** — Minor copy or content placeholder.

---

## Importance 5 — Core

### 1. Site-wide Search · `search.html`
32-entry hand-built index with token-based scoring, exact-phrase boost, all-tokens-must-match filter, matched-term highlighting, and browse-by-section quick links when no query is set. The header magnifying-glass icon-link on every page is the entry point.
*Design ask:* dedicated SERP layout spec, suggested-query chips, recent-search history pattern, branded empty-state illustration.

### 2. Sign-in / Sign-up Modal · `auth-modal.js`, `auth-modal.css`
Self-injecting overlay with role toggle (student / donor), social OAuth buttons (Google, Apple, Email), password visibility toggle, remember-me, forgot-password link, focus trap, ESC-close. Triggered by every Sign-in button via `data-open-signin`.
*Design ask:* error states, OAuth fail recovery, loading state.

### 3. Service Worker + Offline Page · `sw.js`, `offline.html`
Precaches the app shell on first load, stale-while-revalidate for same-origin GETs, navigation requests fall back to `offline.html` when the user is disconnected. Cache version is bumped on every deploy that ships changed assets.
*Design ask:* branded offline copy and illustration.

### 4. Landing Page Hero Carousel · `index.html`
Auto-rotating 4-slide hero with keyboard navigation, dot indicators that meet WCAG target-size minimum (24×24 hit area, 8px visual), and rich slide metadata (eyebrow, title, subtitle, lede, CTA with icon, photo).
*Design ask:* slide-change transitions, autoplay timing, reduced-motion fallback.

### 5. data-mock Interaction Layer · `mock-system.js`
25 distinct `data-mock="feature"` values registered and wired. Each click emits a toast describing the action that *will* happen post-Shopify integration. Lets the site demo end-to-end without real backends.
*Design ask:* progressive replacement plan as backends land.

---

## Importance 4 — Important & pervasive

### 6. Programs Page Chip Filter + Search · `programs.html`
Chip row (All / Dance / Theater / Acting / Gardening) and live keyword search above the program cards. Filters both Open for Enrollment and Coming Soon sections; hides empty sections; shows a Clear-Filters affordance when nothing matches. Reads `?q=` from URL.
*Design ask:* the PDF programs page has no filter UI — needs a formal spec.

### 7. Interactive Class Calendar · `index.html`, `mock-system.js`
Full month-by-month navigation with real schedule data keyed by month-year. Day cells colour-coded by class type (rose / garden / blush) and link to enrollment.
*Design ask:* week view, multi-class days, time-zone behaviour.

### 8. Toast Notification System · `mock-system.js`
Stack-managed toasts with four variants (info / success / warning / mock). Used by every `data-mock` interaction so confirmation feedback is consistent across the entire site.
*Design ask:* explicit variant palette and icon set.

### 9. Generic Confirmation Dialog · `mock-system.js`
Any element with `data-confirm` opens a focus-trapped modal. Used for destructive or stateful actions.
*Design ask:* destructive variant with a red CTA.

### 10. Settings Dropdown Menu · `mock-system.js`
Wraps the gear icon in the header with a dropdown: My Profile, Preferences, Class history, Inbox, Search, Accessibility, Sign out.
*Design ask:* icons per item and section dividers.

### 11. Header Search Icon-Link · all 47 pages
Magnifying-glass icon-button between Contact and Cart on every page header except `programs.html` / `newsletter.html` / `search.html` (where in-page search already exists). Single canonical entry point to `/search.html`.
*Design ask:* mobile equivalent — currently desktop-only.

### 12. Transactional Confirmation Pages · `receipt.html`, `order-confirmation.html`, `waiver.html`, `payment-declined.html`
End-of-journey screens for enrollment, donation, and waiver flows. No PDFs; filled in to complete the user journey end-to-end.
*Design ask:* unified visual treatment for success / failure pattern.

### 13. Account Dashboard Pages · `profile.html`, `preferences.html`, `class-history.html`, `inbox.html`, `inbox-message.html`, `saved-articles.html`, `read-later.html`
Logged-in surface for managing profile, notification preferences, saved content, message threads, class history. Some have partial PDF coverage; most do not.
*Design ask:* dedicated account-area design pass.

---

## Importance 3 — Polish

### 14. Bookmark Toggle · `mock-system.js`
`data-bookmark` toggles localStorage state, swaps the icon between hollow and filled, emits a toast. Used on program cards, articles, instructor profiles. Persistent across sessions.
*Design ask:* formalise icon set.

### 15. Share Button · `mock-system.js`
`data-share` uses Web Share API on mobile, falls back to copy-to-clipboard on desktop. Used on every program card.
*Design ask:* copy-success toast wording.

### 16. Cookie Consent Banner · `mock-system.js`
Auto-injected on first visit, persists acknowledgement to localStorage. Decline / Accept all actions with Learn-more link.
*Design ask:* legal team to provide final wording; categorised consent (analytics vs essential) is implied but not specced.

### 17. Auto-Injected Breadcrumbs · `mock-system.js`
15-route map auto-injects breadcrumb HTML at the top of detail and transactional pages.
*Design ask:* more branded chevron, expand-on-hover for long paths.

### 18. Skip-to-Main Link · every page
First focusable element on every page jumps to `#main`. WCAG 2.1 bypass-blocks compliance.
*Design ask:* possibly a more visible treatment for low-vision users.

### 19. FAQ Accordion · `contact.html`, `mock-system.js`
`data-faq` buttons toggle `aria-expanded` on adjacent panels.
*Design ask:* expand/collapse transition.

### 20. Gallery Lightbox · `gallery.html`, `mock-system.js`
Click any `data-lightbox` tile to open a full-bleed overlay with the underlying CSS background-image. ESC-to-close, click-outside-to-close.
*Design ask:* prev/next navigation, swipe support, image caption treatment.

### 21. Skeleton Loaders · `mock-system.js`
List pages with `data-skeleton-list` show shimmering placeholder cards for ~600ms before the real content reveals.
*Design ask:* explicit token for skeleton bg / highlight colour.

### 22. Error / Maintenance / Offline Pages · `500.html`, `maintenance.html`, `offline.html`
Branded fallback pages for server errors, scheduled downtime, and offline navigations. Each carries the canonical header + footer.
*Design ask:* copy and illustration are placeholders; tone needs a brand voice pass.

### 23. Dismissable Promo Bar · multiple pages
Top-of-page strip announcing happening-now and next-class. Dismissal persists via localStorage so it does not nag returning visitors.
*Design ask:* CMS-driven content for production.

### 24. Dark Mode Toggle · `mock-system.js`, `components.css`
Setting in the gear menu writes `ouat:theme`; `.theme-dark` class restyles surfaces.
*Design ask:* full dark-palette token table.

### 25. Inline Form Validation · `site.js`, `mock-system.js`
Newsletter and contact forms check empty / email-shaped values; `OUAT_setFieldError` adds `.is-error` and emits a sibling `.field-error` message.
*Design ask:* inline help, success state, submit-pending spinner.

### 26. Support / Donation Variants · `scholarship.html`, `sponsorship.html`, `gift-donation.html`, `donor-wall.html`, `impact-report.html`
Donation flow has multiple entry points beyond the single `donate.html` in the PDF set.
*Design ask:* strategic decision — distinct pages or single multi-step flow?

### 27. People & Recruitment Pages · `instructor.html`, `instructors.html`, `board.html`, `jobs.html`, `press.html`, `partners.html`
Roster and recruiting surface — instructor list and bios, board, open jobs, press kit, partners.
*Design ask:* content model (bio fields, social links, role tags) for Shopify metaobjects.

---

## Importance 2 — Tooling & SEO

### 28. Schema.org JSON-LD · `index.html`, `contact.html`, `programs.html`
Organization, ContactPage, and Course types embedded so Google can render rich results.

### 29. sitemap.xml · `sitemap.xml`
26 priority URLs with change-frequency hints. Should be automated post-Shopify.

### 30. Canonical Footer + Sync Tool · `tools/sync-footer.py`, all 47 pages
Eight footer variants collapsed to one canonical block; the tool keeps it in lock-step until Shopify migration replaces it with a Liquid section.

---

## How to use this for the Shopify migration

For each item flag one of:

- ✅ **Keep** — Liquid port, no design change
- ✏️ **Spec** — design team writes a Figma component before Shopify rebuild
- 🚮 **Drop** — the feature was a stopgap and is no longer needed
- 🔁 **Replace** — Shopify-native equivalent exists (e.g. Search & Discovery for the in-house search)

Once each item has an owner and a verdict, the inventory becomes the migration's checklist.
