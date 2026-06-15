# Phase 2 — Dawn foundations adopted

Dawn (Shopify's reference theme) is now used as the architectural reference for `shopify-theme/`. We selectively adopted Dawn patterns rather than dropping a full Dawn theme tree on top of our custom work.

## What changed

### `layout/theme.liquid`
- Adds `<html class="js">` so theme JS can branch on JS-enabled state (Dawn convention)
- Loads `tailwind.css` after the canonical CSS so utility classes can override component-level CSS where needed
- Loads GSAP + ScrollTrigger from CDN behind the `settings.animations_reveal_on_scroll` flag
- Header + footer rendered via `{% sections 'header-group' %}` / `{% sections 'footer-group' %}` (Dawn section-group pattern; lets merchants reorder header/promo-bar within the Customizer)
- Body element gets `template-{{ template }}` and `color-{{ settings.color_scheme }}` classes for scoped overrides

### `sections/header-group.json` + `sections/footer-group.json`
Dawn section-group pattern. Header group composes `promo-bar` + `header` sections in order; footer group renders `footer`. Now merchants can rearrange or hide either component via the Customizer.

### `config/settings_schema.json`
Expanded from 1 panel (Brand) to 6 panels:
- **Brand** — identity, address, contact, favicon
- **Colors** — color scheme select + named brand color pickers backed by our hex tokens
- **Typography** — heading + body font selects, H1 max-size slider
- **Layout** — wrap width + page gutter sliders
- **Animations** — toggle for scroll-reveal (GSAP) animations
- **Social** — Instagram / Facebook / Twitter / YouTube URLs

### `assets/animations.js`
Same GSAP scroll-reveal bootstrap as the static site; only loaded when the merchant enables the Animations toggle.

### New snippets
- `accessibility.liquid` — skip link + screen-reader announcer region
- `icon-arrow-right.liquid` — inline SVG arrow used in CTAs
- `icon-caret.liquid` — inline SVG caret used in disclosure widgets / details

## What we deliberately did NOT do

- We did NOT delete our existing custom theme work (custom sections like `donor-spotlight`, `hero-card`, `header`, `footer`, etc. all stay intact)
- We did NOT pull in Dawn's full e-commerce sections (cart-drawer, featured-product, collection-list, etc.) — OUAT is a nonprofit org, not a product catalog
- We did NOT replace our Phosphor icon font usage with Dawn's per-icon snippet pattern site-wide. Phosphor still works fine; the two new SVG icon snippets are available for cases where merchants want to swap icons in the Customizer

## Next: Phase 3

With this foundation in place, Phase 3 starts porting each of the 51 root HTML pages into Liquid templates. The pilot migration is `index.html` → `templates/index.json` + landing sections.
