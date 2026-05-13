# Product Requirements Document: Mobile Experience
**Type**: Addendum to PRD_Site_Quality.md
**Version**: 1.0
**Status**: DRAFT
**Created**: 2026-05-13
**Primary Target**: iPhone SE (375px)
**Secondary Targets**: 390px (iPhone 14/15), 360–412px (Android range)

## Executive Summary

The Figma design source of truth contains zero mobile or tablet mockups. Greta Belegu flagged this explicitly. This PRD defines mobile-first responsive behavior for all 51 pages so the site delivers a UX-forward experience on phones — fully linked, fully interactive, on aesthetic parity with the desktop design.

The approach: Figma wireframes for the 10 highest-traffic pages establish the mobile design language, then all 51 pages are built to those patterns.

## Design Principles (Mobile)

1. **Thumb-first**: Primary actions in the bottom 60% of the viewport. No critical CTA above the fold that requires a reach.
2. **One-column everything**: No side-by-side layouts below 540px. Grids collapse to single-column stacks.
3. **Touch targets ≥ 44px**: WCAG recommends 44×44px; we enforce it on every button, link, and interactive element.
4. **Full parity**: Every link, button, form, and interaction on desktop works identically on mobile. No "desktop only" features.
5. **Content-first**: Show the content immediately. Sidebars collapse. Decorative elements shrink or hide. Text stays readable.
6. **Speed**: No layout shift. No horizontal scroll. Images lazy-load. Fonts preloaded.

## Breakpoint System

| Name | Width | Treatment |
|---|---|---|
| **Phone** | ≤ 540px | Single-column, stacked everything, hamburger nav |
| **Tablet** | 541–900px | Two-column where it helps, sidebars start collapsing |
| **Laptop** | 901–1280px | Full desktop grid, sidebars visible |
| **Desktop** | 1281px+ | Maximum content width (1200px), centered |

Primary design target: **375px** (iPhone SE). If it works at 375, it works everywhere.

## Global Mobile Patterns

### Navigation
- Hamburger menu at ≤ 900px (already implemented in `site.js`)
- Full-screen overlay when open: dark scrim, all nav links stacked vertically, 44px+ touch targets
- Logo shrinks to 32px height
- Header height reduces to 56px (from 72px desktop)
- Cart/settings/avatar icons remain visible (no text labels on mobile)

### Typography
- h1: `clamp(32px, 8vw, 64px)` — already responsive
- h2: `clamp(28px, 6vw, 48px)` — already responsive
- Body: stays 16px (comfortable on phone)
- Labels: stays 14px
- Line-height loosens slightly for touch readability

### Cards
- Full-width (100%) on phone
- Stack vertically with 16px gap
- Card images: `aspect-ratio: 16/9` on mobile (vs 4/3 desktop)
- Card actions (bookmark, share) remain visible — icon buttons collapse to icon-only at phone width

### Forms
- All inputs full-width
- Labels above inputs (not beside)
- Error messages below fields
- Submit button full-width, 56px height (large touch target)
- Field groups stack vertically (no side-by-side First/Last name)

### Sidebars
- Collapse to `<details>/<summary>` (already implemented via FEAT-003/004)
- Summary label clearly states what's inside ("Page Sections", "Account Menu")
- Closed by default on phone so main content is immediately visible

### Footer
- Single-column stack
- Social icons in a centered row
- Links as a stacked list with 44px+ touch targets
- "Back to top" affordance at the very bottom

---

## Page-by-Page Mobile Specifications

### Tier 1: Figma Wireframes Required (10 pages)

#### 1. Landing Page (`index.html`)
**Desktop**: Hero card + photo side-by-side → Class schedule + calendar → Featured classes → Who We Are → Donor Spotlight → Support Mission
**Mobile (375px)**:
- Hero: Stack vertically — photo on top (16:9), copy card below. CTA buttons stack vertically. "Explore Programs" = primary (full-width), "Donate" = outline secondary below it.
- Carousel dots: centered below hero, same 24×24 hit areas
- Class Schedule: Calendar above class list (calendar is the discovery tool). Day cells maintain 28×28 minimum. Day labels abbreviate to single letters (M T W T F S S).
- Calendar legend (Open/Filling/Full): horizontal row below grid, wraps if needed
- Featured Classes: Cards stack vertically, full-width. Scroll indicator removed (no horizontal scroll on mobile).
- Who We Are: Image above copy. Features list stacks vertically.
- Donor Spotlight: Stats stack vertically (1 per row). Testimonials stack vertically. Avatar + quote side-by-side preserved (avatar shrinks to 80px).
- Support Mission: Image above copy. CTA buttons stack.
- Newsletter CTA: full-width button

#### 2. About Page (`about.html`)
**Mobile**:
- Vision & Mission: Image above copy. h1 scales down.
- Values grid: 1 column (was 3). Value quotes visible on mobile (already implemented).
- Founder Legacy: centered text block, full-width.
- Leadership: cards stack vertically. Photos full-width.
- Current Program: Cards stack vertically. Carousel arrows move to top-right corner above cards.
- Expanding Platform: Image above copy.
- Success Stories: Testimonials stack vertically. Avatar + text side-by-side on each.
- Where Your Donation Goes: Image above copy.
- Stay Connected: Buttons stack vertically.

#### 3. Programs Page (`programs.html`)
**Mobile**:
- Hero: Image above copy, full-width. "Register now!" button full-width.
- Filter chips: horizontal scroll strip (already implemented via FEAT-003).
- Program cards: Full-width, stacked. Capacity pills visible.
- "Coming Soon" cards: same full-width stack.
- Growing CTA: centered text, button full-width.
- Testimonials: stack vertically.
- Empty state: centered, full-width "Clear filters" button.

#### 4. Contact Page (`contact.html`)
**Mobile**:
- Hero: hide the rhombus shape. Show a simple rose-100 background with the h1 centered.
- Phone hero: full-width tap-to-call block. Largest element on the page.
- Contact info: stacked list below phone.
- Form: below contact info. Full-width inputs. Error summary at top of form.
- FAQ: accordion, full-width. Smooth scroll on expand.

#### 5. Donate Page (`donate.html`)
**Mobile**:
- Hero: gradient background only (no side image). Copy centered.
- Amount selector: 2×3 grid (was inline row). Impact lines visible below each.
- Custom amount input: full-width.
- Impact cards: stack vertically. Backer counts visible.
- Donation form: full-width fields.

#### 6. Newsletter Dashboard (`newsletter.html`)
**Mobile**:
- Title: scales down via clamp.
- Tabs: horizontal scroll strip (already implemented).
- Newsletter feature card: full-width, image on top.
- Article grid: single-column stack.
- Article cards: full-width. Copy truncated to 3 lines (already implemented).
- Search: full-width input.
- Empty state: centered, full-width.

#### 7. Newsletter Article (`newsletter-article.html`)
**Mobile**:
- Article body: full-width, comfortable reading width.
- Share/Save/Print buttons: horizontal row, icon + text (already implemented).
- Blockquotes: full-width with tinted background (already implemented).
- Related articles grid: single-column stack.

#### 8. Enrollment Flow (`enrollment.html`)
**Mobile**:
- Stepper: labels hidden (already implemented at ≤540px), dots only.
- Form steps: full-width fields. Stack all groups vertically.
- Review step: stacked summary cards.
- Submit button: full-width, sticky at bottom of viewport.

#### 9. Seasonal Camps (`seasonal-camps.html`)
**Mobile**:
- Hero band: reduced height (240px vs 380px).
- Quick Facts strip: wraps to 2×2 grid (already in spec).
- Sidebar: collapsed `<details>` (already implemented).
- Content sections: full-width.
- Instructor grid: 1 column (was 2). Photos aspect-ratio: 16/9.
- Map: full-width.
- FAQ: accordion with smooth scroll (already implemented).

#### 10. Profile (`profile.html`)
**Mobile**:
- Sidebar: collapsed `<details>` "Account Menu" (already implemented).
- Account info: full-width fields.
- Child cards: full-width, stacked. Edit/Remove buttons visible.
- Security rows: full-width.
- 2FA status: visible.

### Tier 2: Pattern-Driven (15 pages)

These pages follow the patterns established by Tier 1. No individual wireframes needed — apply the same mobile rules.

| Page | Key Mobile Treatment |
|---|---|
| `private-lessons.html` | Same as seasonal-camps (sidebar collapse, quick-facts, instructor stack) |
| `preferences.html` | Same as profile (sidebar collapse, toggle rows full-width) |
| `class-history.html` | Card grid → single-column stack. Status badges visible. |
| `payment.html` | Form fields full-width. Country first. PayPal CTA visible. Impact statement visible. |
| `login.html` | Centered card. Social buttons stack vertically. Full-width inputs. |
| `signup.html` | Same as login. Name fields stack (already implemented). Confirmation state responsive. |
| `search.html` | Full-width search input. Results single-column. Empty state centered. |
| `inbox.html` | Message list full-width. Sidebar collapsed. |
| `inbox-message.html` | Message body full-width. Reply button visible. |
| `saved-articles.html` | Card grid → single-column stack. |
| `read-later.html` | Same as saved-articles. |
| `instructor.html` | Profile card full-width. Bio readable. |
| `instructors.html` | Grid → single-column. Cards full-width. |
| `board.html` | Same as instructors. |
| `events.html` | Event cards single-column. Calendar widget responsive. |

### Tier 3: Mechanical (26 pages)

These pages are content-focused or transactional. They use the global patterns and need minimal custom mobile work.

| Category | Pages | Treatment |
|---|---|---|
| **Support/Donation** | scholarship, sponsorship, gift-donation, donor-wall, impact-report, volunteer-dashboard | Content stacks. CTAs full-width. Tables scroll horizontally if needed. |
| **People** | jobs, press, partners | Content stacks. Cards full-width. |
| **Legal** | privacy, terms, accessibility | Long-form text. Already readable at 375px. |
| **Transactional** | receipt, order-confirmation, waiver, payment-declined | Centered content. Status icons visible. CTAs full-width. |
| **Auth** | forgot-password, reset-password, onboarding | Centered card forms. Full-width inputs. |
| **Error/Utility** | 500, offline, maintenance, unsubscribe | Centered content. CTA visible. |
| **Dev** | styleguide | Responsive grid already. Not customer-facing. |
| **Gallery** | gallery | Image grid collapses to 2-column then 1-column. |

---

## CSS Implementation Strategy

### New mobile-specific CSS (add to `design-system.css`)

```css
/* Mobile overrides at 375px primary target */
@media (max-width: 540px) {
  /* Header */
  .site-header__inner { min-height: 56px; padding: var(--s-2) 0; }
  .brand img { height: 32px; }
  
  /* Typography — ensure readability */
  .body-xl { font-size: var(--t-lg); }
  
  /* Grid collapse */
  .hero__grid,
  .who__grid,
  .talk,
  .vision__grid,
  .donation-goes__grid,
  .pd-locations,
  .pd-instructors { grid-template-columns: 1fr !important; }
  
  /* Card mobile treatment */
  .program-card,
  .class-card,
  .nl-card,
  .member-card,
  .offer-card { width: 100%; }
  
  /* Buttons stack */
  .hero__actions,
  .btn-group { flex-direction: column; }
  .hero__actions .btn,
  .btn-group .btn { width: 100%; }
  
  /* Forms full-width */
  .form-row { grid-template-columns: 1fr !important; }
  .input, .textarea, .select { font-size: 16px; } /* prevents iOS zoom */
  
  /* Footer stack */
  .footer__grid { grid-template-columns: 1fr !important; gap: var(--s-5); }
}
```

### Testing Matrix

| Device | Width | Must pass |
|---|---|---|
| iPhone SE | 375px | Primary — all pages, all interactions |
| iPhone 14 | 390px | Secondary — spot check |
| Pixel 7 | 412px | Android check |
| iPad Mini | 768px | Tablet — sidebar behavior |

### Verification

Every page must pass at 375px:
- [ ] No horizontal scroll
- [ ] All touch targets ≥ 44px
- [ ] All text readable (≥ 16px body)
- [ ] All links/buttons functional
- [ ] All forms submittable
- [ ] All modals accessible (focus trap works)
- [ ] Navigation opens/closes correctly
- [ ] Footer visible at bottom
- [ ] No content cut off or overlapping

## Success Criteria

- [ ] Figma wireframes for 10 Tier 1 pages reviewed by design team
- [ ] All 51 pages pass responsive verification at 375px
- [ ] Every interaction on desktop works identically on mobile
- [ ] Lighthouse mobile score 90+ on all Tier 1 pages
- [ ] No "desktop only" features remain

## Dependencies

- FEAT-001 (tokens) — COMPLETE
- FEAT-003 (responsive polish, sidebar collapse) — ~85% COMPLETE
- Figma Design System alignment — COMPLETE
- Design team review of Tier 1 wireframes — REQUIRED before build

## Approval

**Document Status**: DRAFT — pending design team review of wireframes
