# Phase 3 — HTML → Liquid migration

Migrated **all 48 substantive root HTML pages** to Shopify Liquid sections + templates. 3 pages skipped (500/maintenance/offline — Shopify renders those via built-in error templates).

## What landed

### 48 page sections in `shopify-theme/sections/`
One `main-{slug}.liquid` per page. Each contains:
- The page's `<style>` block (if any) — preserved verbatim so page-scoped CSS keeps working
- The page's `<main>` inner HTML
- A minimal `{% schema %}` block so the section is composable

JSON-LD `<script type="application/ld+json">` blocks are wrapped in `{% raw %}…{% endraw %}` so the JSON `{{` / `}}` don't collide with Liquid's interpolation syntax.

### 48 templates in `shopify-theme/templates/`
- `index.json` — landing page
- 47 × `page.{slug}.json` — every other page

Each template renders a single section keyed `main` that points at the matching `main-{slug}` section. The shared header + footer come from `layout/theme.liquid` via the `header-group` / `footer-group` section-group composition.

### Minimal layout for transactional pages
`shopify-theme/layout/page.liquid` — strips the shared header/footer/promo-bar for the 11 auth & checkout pages where the static site already uses a focused layout:

- enrollment, payment, payment-declined, receipt, order-confirmation
- login, signup, forgot-password, reset-password, onboarding
- unsubscribe

Each of these uses Shopify's per-template layout assignment: their JSON template just adds `"layout": "page"` to use the minimal layout (the migration script doesn't toggle this yet — see "Next" below).

## What's NOT idiomatic (deliberate scope choice)

Each page section is a single big Liquid block, not decomposed into many small reusable sub-sections. This is the fastest mechanical migration — and matches the static site's structure (page-scoped CSS + a single `<main>` content block per page).

The proper Dawn-style refactor breaks each page into many small typed sections (`hero-card`, `feature-grid`, `donor-spotlight`, `class-schedule`, etc.) composed via template JSON. That's a follow-on refactor — *not* a rewrite. The current section files are the source-of-truth for the content; they can be split incrementally section-by-section as merchant configurability becomes important.

## Next steps (incremental polish, not blockers)

1. Add `"layout": "page"` to the 11 minimal-layout templates (one-line JSON edit per file)
2. Replace canonical patterns (hero, donor band, classes-today) with calls to dedicated sections so merchants can edit them through the Customizer
3. Move page-scoped styles into section-bound `{% stylesheet %}` blocks so they can be tree-shaken / minified per page

## Reference

See `tools/migrate-pages-to-liquid.py` for the migration logic. Re-run the script to re-port any updated HTML page; it's idempotent.
