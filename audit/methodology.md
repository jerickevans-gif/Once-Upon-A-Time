# Audit Methodology — How this UX audit was conducted

> A case study in using AI coding agents to accelerate UX audit work, by Jerick Evans (UX Designer, Tech Fleet · Phase 4 · Once Upon A Time).

---

## Operator and surface area

**Operator:** Jerick Evans, UX Designer. My role was to audit the production site against the original PDF design set, surface every gap, decide which gaps mattered, and ship the fixes — before the team migrates the codebase into a Shopify theme.

**Surface area audited:**
- 51 HTML pages
- ~7,000 lines of CSS and JavaScript
- 4 cross-cutting script systems (`mock-system.js`, `auth-modal.js`, `site.js`, `sw.js`)
- 35 reference PDFs in the design source folder
- 30+ third-party social/external link references

A manual click-through against the PDF set on this surface would have taken roughly a week of designer time. With AI agents conducting the survey work in parallel, the same audit fits in an afternoon.

---

## Tools and environment

| Layer | Tool | Why |
|---|---|---|
| AI conductor | Claude Code (Opus 4.7, 1M context) | Full file edit, shell, and image-read capability inside one tool |
| Sub-agents | Explore (read-only) and general-purpose | Parallel survey work without polluting the main context |
| Browser harness | Headless Chrome | Replicable visual verification at multiple viewports (1280, 1440, 375) |
| Bulk transforms | Python + sed | Site-wide find/replace across dozens of files with diff-able output |
| Image optimization | ffmpeg | PNG → JPEG conversion when audit found ~1.4 MB of avoidable weight |
| Source control | Git + GitHub Pages | Every audit finding became a commit, every commit produced a re-deployable URL |

---

## The agent pattern

Claude Code lets you spin up sub-agents for independent research tasks. I used three distinct agent types deliberately based on the task's risk profile:

**Explore (read-only).** Crawls the codebase to answer scoped questions. Used for the four parallel audits: link integrity, header/footer consistency, form/handler wiring, and accessibility. Read-only means bounded blast radius — the agent cannot accidentally write something wrong.

**general-purpose.** Can write code. Used when an audit produced an actionable fix that needed bulk edits across many files (e.g. "update Instagram URL on 47 pages").

**Plan.** Architectural design. Reserved for the bigger structural decisions — for example, consolidating eight footer variants into one canonical block and shipping the canonical-footer sync tool that locks the new pattern in place.

---

## Parallel-audit workflow

For each pass I dispatched **multiple Explore agents at once** with carefully scoped prompts. The audit that produced the inventory in this folder fired four parallel agents in a single round:

1. **Link-integrity audit** — every `href`, `<img src>`, `<script src>`, `<link href>`, CSS `url()` reference. Goal: zero 404s.
2. **Cross-page consistency audit** — header/footer markup drift across 51 files. Goal: identify pages that missed the latest sed pass.
3. **Form / button / data-mock wiring audit** — every `<form>`, every clickable button, every `data-mock` attribute. Goal: zero "click does nothing" buttons.
4. **Accessibility audit** — alt text, form labels, button vs. link semantics, aria-current correctness, heading hierarchy, colour contrast, focus indicators, dialog a11y, skip links. Goal: keep the Lighthouse a11y score at 100.

Each agent returned a 400–500 word findings report. Total wall-clock for the round: about 3 minutes. A traditional QA round on a 51-page site with the same coverage is ~2 days.

---

## How prompts were scoped

Lazy prompts produce shallow agent work. Every agent prompt I wrote:

- **Started with operator context.** What the project is, what state it's in, what's already been ruled out. Without this the agent re-derives priors I already know.
- **Specified the output shape.** "Per finding: `file:line` + one-sentence explanation" beats "discuss accessibility issues." Structured output is composable downstream.
- **Capped output length.** Every prompt ended with "cap report at 500 words" so context costs stay bounded and reports stay scannable.
- **Excluded healthy categories.** "If a class is fine, say so in one line — don't enumerate every link." Signal stays high.
- **Named priority categories.** Listed the specific things to look at (e.g. "Garden chip contrast at 3.68:1 on `.pg-chip--garden`?") so the agent doesn't waste time on a different axis.

---

## Triage loop — three questions per finding

Every audit finding ran through the same filter:

1. **Is it broken in production?** If yes, fix it now. *(Examples: `about.html` newsletter link pointing to `#newsletter`; garden chip at 3.68:1 contrast.)*
2. **Is it consistent across the site?** If no, normalize it. *(Examples: 8 footer variants → 1 canonical; programs nav drift → parity restored.)*
3. **Did the design PDFs cover it?** If no, log it in the inventory with a design note for the team.

The first two categories produce shippable commits. The third produces this audit deliverable.

---

## Verification protocol

Audits are only useful if the fixes actually ship. I verified every change with the same protocol:

- **Headless Chrome screenshots** at 1280×N (desktop), 1440×N (wide desktop), 375×N (iPhone mobile) — before and after.
- **`curl` against the served HTML** to confirm GitHub Pages is shipping what's in the local repo (sometimes diverges due to deploy lag).
- **Hard-refresh in a fresh `--user-data-dir`** to bypass the service-worker cache when the visual state didn't match the source.
- **Re-ran the same audit prompts** after fixes landed, looking for "0 findings" as the success signal.

This last step caught the highest-impact bug of the audit: a JS-injected duplicate search bar that the static-HTML cleanup didn't address. The screenshot showed two search inputs; the served HTML had one; the diff was a runtime injection in `mock-system.js`. Without the re-audit step it would have shipped to production.

---

## Decision criteria for "off-spec"

An item entered the inventory if it satisfied **both**:

1. It exists and ships in production on the live URL.
2. No PDF in `PDF Finals/` shows it directly, OR the PDF shows it ambiguously enough that a designer would draft a fresh component before re-implementation.

Importance ranking (1–5) is judged against blast radius:

- **5 — Core.** Removing breaks a critical journey. (auth modal, search, service worker, hero carousel)
- **4 — Pervasive.** Used across many pages. (toasts, dropdowns, breadcrumbs, dialogs)
- **3 — Polish.** Single-page features and micro-interactions worth a design pass.
- **2 — Tooling.** Sitemap, JSON-LD, footer-sync — invisible but consequential.
- **1 — Copy.** Placeholder text only.

---

## Why this matters for design teams

The traditional UX audit is bounded by how much a designer can click through manually. Coverage gaps hide in long-tail pages — error states, password reset flows, transactional confirmations — and in cross-cutting patterns that only manifest under specific conditions (toasts, modals, cookie banners, offline mode).

With AI agents handling the survey, the designer's role shifts upstream: writing better prompts, ranking findings, and making the calls about what to spec, what to keep, and what to drop. The agent does the click-through; the designer does the design.

This deliverable is the output of that workflow. Total active time: one afternoon. Output: a screenshot-verified, importance-ranked, design-team-ready inventory of every gap between the original spec and what the production site actually ships.
