# Once Upon A Time — UX Audit

> **Auditor:** Jerick Evans, UX Designer
> **Cohort:** Tech Fleet · Phase 4 design process for Once Upon A Time
> **Date:** April 2026

This folder catalogues everything in the production site that **was implemented without a corresponding PDF design**. The goal is to give the design team a clear picture of where the implementation crossed the boundary of the original spec, so they can:

1. Bless the existing implementation as-is
2. Draft formal specs to retrofit
3. Make explicit decisions about what carries into the Shopify migration

---

## Files in this folder

| File | What it is |
|---|---|
| `README.md` | This overview |
| `inventory.json` | Machine-readable list of every "off-spec" item — the source of truth |
| `inventory.md` | Same content as JSON but human-readable, grouped by importance |

A branded, screenshot-driven version of the same data lives in `/presentation/index.html` — open it in a browser to walk through it the way you'd present to designers.

---

## How to read the importance scale

| Score | Meaning |
|---|---|
| **5** | Core to the site functioning — removing it breaks a critical journey |
| **4** | Important and pervasive — used across many pages |
| **3** | Nice-to-have polish or single-page feature |
| **2** | Tooling, SEO, or developer infrastructure |
| **1** | Minor copy or content placeholder |

---

## Headline numbers

- **30 distinct items** catalogued across 8 categories
- **5 items at importance 5** (search, auth modal, service worker, hero carousel, plus the data-mock interaction layer that powers all click feedback)
- **0 items broken** — everything in the inventory ships and works in production
- The PDF set covered roughly **35 of the site's 51 pages** at the start; the remaining 16 (account, transactional, error, recruiting, support variants) were filled in along the way

---

## How to use this for the Shopify migration

For each item flag one of:

- ✅ **Keep** — Liquid port, no design change
- ✏️ **Spec** — design team writes a Figma component before Shopify rebuild
- 🚮 **Drop** — the feature was a stopgap and is no longer needed
- 🔁 **Replace** — Shopify-native equivalent exists (e.g. Search & Discovery for the in-house search)

Once each item has an owner and a verdict, the inventory becomes the migration's checklist.
