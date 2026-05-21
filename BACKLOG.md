# Figma-Derived Backlog (from 587 designer comments + design sweep)

Source: Figma file `bokvZctMF14l6mfaen3g3g` — comment threads + annotation pins, mined and matched to repo pages. Most directives are already satisfied in the build; this tracks what remained.

## ✅ Done
- **No special characters in CTA buttons** (UXW directive — Bran Cespedes, comments `1764977306` / `1764968318`). Converted 13 literal `→` glyphs to the decorative `ph-arrow-right` icon and removed `!` from "Register now!" across jobs, press, instructors, inbox-message, newsletter-article, onboarding, seasonal-camps, private-lessons. Consistent with the site's existing icon-CTA pattern.

## ✅ Resolved decision
- **Hero CTA: "Enroll Now" (final).** Namira's UX research (comment `1759566405`) suggested "Explore Programs," but the finalized UXW copy specifies **"Enroll Now"** and that's the source of truth. Decision (2026-05-21): keep "Enroll Now." Closed — no change to the site.

## ✅ Accessibility pass (axe-core WCAG 2.1 AA audit, Playwright)
~70 violations across 10 pages → 0 on real content (2 remaining are WCAG-exempt: Discover card-brand logo color, disabled submit button).
- Footer headings (styled as h4, markup uses h3 → dark on rose) → snow; footer link/address/legal opacity raised to ≥4.5:1 (legal links via sync-footer.py).
- badge-status--danger → danger-900; donate/payment pills + hero-chip + global-impact text → dark/brighter; newsletter is-muted opacity removed.
- ARIA roles: programs/inbox filter chips → role=group; newsletter restored as a valid tablist (4 tabs only, display:contents) with tab ids; carousel track tabindex=0.
- Verified 0 overflow / 0 JS errors across 49 pages × 3 viewports.

## ✅ Done (earlier pass)
- **Runtime text-size ("Aa") control** (a11y, Figma node `1926:34498`). Added `OUAT_setFontScale` (page-zoom based, persisted in `ouat:fontscale`, applied site-wide on load) + a "Text size" Default/A+/A++ control in a new "Accessibility & Display" section on preferences.html — which also now surfaces the **dark-mode toggle** (previously only reachable from the styleguide).
- **Modal close-X → 46×46** (clears the 44×44 touch-target the comment flagged).
- **Badge/chip outlines** — verified already compliant (all `.badge-status--*` and `.chip` carry borders).

## Already satisfied in the build (verified, no action)
- Garden gradient + form-field WCAG AA contrast (garden 50–900 ramp, label/input colors).
- Corner-radius standardization (radius tokens), footer-flush layout, section padding, tel: links.
- Donate page "backer count" framing; newsletter-article body left-aligned; class-history "Cancel program" clarity.
- Leadership content on about/board/instructors; registration "closed" state; finalized copy across landing/about/programs.

## Audit residuals (documented, low priority)
- **Dark `theme-color` meta variant** — add `<meta name="theme-color" content="#262422" media="(prefers-color-scheme: dark)">` to each page head. Skipped: 44-file churn with no head-sync script. (color-scheme CSS already ties native UI to the theme.)
- **Styleguide inline handlers** (5 `onclick`/`onsubmit` demos) — on the noindex internal component gallery; left as-is.
- **`shopify-theme/templates/page.volunteer.json`** — has real intro copy but no static `volunteer.html` equivalent (only `volunteer-dashboard.html`). Either add a public volunteer page or remove this template — needs a product decision.
