# Once Upon A Time

Static marketing + account site for **Once Upon A Time, Inc.** — a nonprofit arts education organization for children in Queens, NY (dance, music, theater, visual art).

This repo ships two things:
1. A 49-page **static demo** that GitHub Pages serves at <https://jerickevans-gif.github.io/Once-Upon-A-Time/>.
2. A **Shopify 2.0 theme** at `shopify-theme/` ready to deploy when production goes live.

Every interactive element on the demo does *something* — real link, real handler, persisted localStorage state, mailto, or a `data-mock` toast that explains the Shopify integration in production.

## Pages (49)

**Public marketing**
- `index.html` — Landing (hero card, today's classes, calendar, donor spotlight)
- `about.html` — Vision, mission, founder, leadership, programs, success stories
- `programs.html` — Filterable program collection
- `seasonal-camps.html`, `private-lessons.html` — Program detail
- `events.html` — Upcoming showcases & fundraisers
- `instructors.html`, `instructor.html` — Team list + URL-driven detail
- `gallery.html` — Photo grid with lightbox
- `donor-wall.html` — Tiered donor recognition
- `impact-report.html` — 2025 annual report
- `partners.html`, `press.html`, `jobs.html`, `board.html` — Org pages
- `donate.html`, `gift-donation.html` — Donation flows
- `scholarship.html`, `sponsorship.html` — Financial-aid + corporate giving
- `volunteer-dashboard.html` — Open shifts + impact
- `contact.html` — Form + FAQ + map
- `newsletter.html`, `newsletter-article.html`, `saved-articles.html`, `read-later.html`

**Auth + account**
- `login.html`, `signup.html`, `forgot-password.html`, `reset-password.html`
- `profile.html`, `preferences.html`, `class-history.html`, `inbox.html`, `inbox-message.html`
- `enrollment.html` — 4-step booking, `waiver.html` — printable agreement

**Transactional + utility**
- `cart.html`, `payment.html`, `payment-declined.html`, `order-confirmation.html`, `receipt.html`
- `search.html` — site-wide search
- `onboarding.html` — first-time welcome
- `unsubscribe.html`
- `privacy.html`, `terms.html`, `accessibility.html`

**Operational**
- `404.html`, `500.html`, `maintenance.html`, `offline.html`
- `styleguide.html` — live design-system reference

## Email templates (20)

`emails/*.html` — table-based, inline-styled, ready for Klaviyo / Shopify Email:

`donation-thanks`, `class-confirm`, `class-reminder`, `welcome`, `password-reset`, `event-rsvp`, `class-cancellation`, `refund-confirmation`, `unsubscribe-confirmation`, `monthly-receipt`, `scholarship-received`, `scholarship-decision`, `sponsorship-thanks`, `gift-notification`, `volunteer-shift-confirm`, `account-deleted`, `password-changed`, `security-new-device`, `email-change-verify`, `abandoned-cart`.

## Shopify theme (`shopify-theme/`)

Ready-to-deploy Shopify 2.0 theme:
- 18 `templates/page.{handle}.json` for the public pages
- 5 `templates/customers/*.liquid` (login, register, account, order, addresses, reset_password)
- `templates/search.liquid`, `blog.liquid`, `article.liquid`, `collection.liquid`, `product.liquid`, `list-collections.liquid`
- 9 sections in `sections/` (header, footer, promo-bar, hero-card, donor-spotlight, feature-grid, rich-text, contact-form, page-content)
- `config/settings_schema.json` for theme-editor brand controls
- All assets (CSS, JS, fonts, images, icons) flat under `assets/`

See `shopify-theme/README.md` for the deploy steps.

## Stack

- Plain HTML + CSS + vanilla JS — no build step
- **Voltra** (display serif) + **Chivo** (body sans) self-hosted with `<link rel="preload">` font hints
- **Phosphor Icons 2.1** self-hosted (regular weight)
- `mock-system.js` provides toast, cookie banner, settings dropdown, confirm modal, header search, dark-mode toggle, breadcrumb auto-injection, lightbox, calendar grid nav, hero carousel auto-rotate, skeleton loaders, FAQ accordion, bookmark localStorage, share via Web Share API.
- `auth-modal.js` self-injects on any page with `data-open-signin` / `data-open-signup` triggers.

## Design tokens

| Token | Value |
| --- | --- |
| `--rose` | `#8B5044` |
| `--rose-700` | `#6E3F36` |
| `--rose-300` | `#C99A8E` |
| `--rose-100` | `#F2DDD5` |
| `--rose-50` | `#FAEEE9` |
| `--garden` | `#6B6D20` |
| `--garden-700` | `#4D4F18` |
| `--blush` | `#E5AA9C` |
| `--pillar` | `#4C2F3B` |
| `--beginning` | `#FFF5EE` |
| `--snow` | `#FFFCFA` |
| `--ink` | `#262422` |

Dark-mode palette ships with `.theme-dark` class on `<html>` (toggled via `[data-theme-toggle]` and `OUAT_setTheme()`).

## Interaction conventions

| Pattern | What it does |
|---|---|
| `data-mock="<feature>"` | Toasts a Shopify-integration explainer |
| `data-bookmark="<id>"` | Toggles localStorage bookmark + visual state |
| `data-share` | Web Share API or clipboard fallback |
| `data-faq aria-controls="<id>"` | Accordion (also native `<details>` works) |
| `data-confirm`, `data-confirm-body`, `data-confirm-cta`, `data-confirm-danger`, `data-confirm-action` | Confirmation modal |
| `data-theme-toggle` | Light / dark switch |
| `data-lightbox` | Open image in lightbox overlay |
| `data-skeleton-list="N"` | Show N skeleton cards for 600ms |
| `data-cal-prev` / `data-cal-next` / `data-cal-label` | Wire a calendar widget |

## Local preview

```sh
python3 -m http.server 8000
# Open http://localhost:8000/
```

## Live

<https://jerickevans-gif.github.io/Once-Upon-A-Time/>

## Contributing

See `CONTRIBUTING.md`.
