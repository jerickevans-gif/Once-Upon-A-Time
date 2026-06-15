# Once Upon A Time — Tooling Setup (Phase 1)

This repo now has the foundation for a Shopify Dawn theme with Tailwind + Prettier + GSAP. The existing static HTML site continues to work unchanged while you adopt the tooling.

## What's in place after this commit

| File | Purpose |
|---|---|
| `package.json` | npm dependencies + build scripts |
| `tailwind.config.js` | Tailwind config mirroring brand tokens exactly |
| `.prettierrc.js` | Prettier config with `@shopify/prettier-plugin-liquid` |
| `.prettierignore` | Skip vendored / generated CSS |
| `src/tailwind.css` | Tailwind source (compiled to `assets/styles/tailwind.css`) |
| `once-upon-a-time-assets/animations.js` | GSAP scroll-reveal bootstrap |

## One-time install

```bash
cd /Users/eigenhitchens/Design-Projects/once-upon-a-time
npm install
```

This pulls:
- `tailwindcss` + `@tailwindcss/forms` + `@tailwindcss/typography` + `autoprefixer` + `postcss`
- `@shopify/prettier-plugin-liquid` + `prettier`
- `gsap`

## Daily commands

```bash
# Watch Tailwind during development (static site)
npm run css:watch

# Watch Tailwind for the Shopify theme
npm run theme:css:watch

# Compile + minify both surfaces (production)
npm run build

# Format every theme + HTML + JSON file
npm run format

# Just check formatting without writing
npm run format:check

# Shopify dev (requires Shopify CLI installed)
npm run theme:dev
```

## Using GSAP animations

Add data attributes to any element:

```html
<section data-anim="fade-up">…</section>
<div data-anim="scale-in" data-anim-delay="0.2">…</div>
<ul data-anim="fade-in" data-anim-stagger>…</ul>
```

Available presets: `fade-up`, `fade-in`, `scale-in`, `slide-left`, `slide-right`.

GSAP + ScrollTrigger should be loaded once per page via CDN (until the build pipeline lands):

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="once-upon-a-time-assets/animations.js" defer></script>
```

`prefers-reduced-motion` is honored automatically.

## Using Tailwind alongside existing CSS

Tailwind doesn't replace `design-system.css` or `components.css` — it layers on top. Brand tokens are mirrored:

| Existing CSS var | Tailwind class |
|---|---|
| `var(--rose)` | `bg-rose` / `text-rose` |
| `var(--rose-100)` | `bg-rose-100` |
| `var(--rose-700)` | `bg-rose-700` |
| `var(--button-primary)` | `bg-button-primary` |
| `var(--garden)` | `bg-garden` |
| `var(--beginning)` | `bg-beginning` |
| `var(--snow)` | `bg-snow` |
| `var(--radius-sm)` 8px | `rounded-sm` |
| `var(--radius)` 12px | `rounded` |
| `var(--radius-md)` 16px | `rounded-md` |
| `var(--radius-lg)` 20px | `rounded-lg` |
| `var(--radius-xl)` 32px | `rounded-xl` |
| Newsletter v2_dropshadow | `shadow-card` |

Convenience component classes (use as drop-in replacements):
- `.ouat-btn` (canonical Woody Brown button)
- `.ouat-btn--rose` / `--garden` / `--outline` / `--tonal`
- `.ouat-tag` (Figma static chip)
- `.ouat-card-hover` (newsletter v2_dropshadow on hover)

## What's NOT in this phase (deferred to next sessions)

- **Phase 2** — Dawn theme base merge: pull Dawn, port custom sections to Dawn snippet structure
- **Phase 3** — 51 root HTML pages → Liquid templates (will be done page-by-page)
- **Phase 4** — Replace ad-hoc CSS animations with GSAP timelines for hero, carousel, scroll reveals

Each is its own discrete chunk of work and worth committing incrementally so we can review the diff at each step.
