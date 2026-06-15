#!/usr/bin/env python3
"""
Replace inline-styled wrapper tiles with the new .listing-row / .tile-card classes.

Each substring is unique to its file/use, so replacements are surgical.
"""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]

EDITS = {
    # ----------------------------------------------------------------------
    # partners.html — 16 tiles total (5 + 6 + 5), pillar + rose variants.
    # ----------------------------------------------------------------------
    "partners.html": [
        # pillar tiles (3 rows × variable count)
        (
            '<div style="background:var(--snow);border:1px solid var(--line);border-radius:var(--radius);padding:var(--s-5);text-align:center;font-family:var(--serif);font-size:var(--t-md);color:var(--pillar)">',
            '<div class="tile-card">',
        ),
        # rose tiles
        (
            '<div style="background:var(--snow);border:1px solid var(--line);border-radius:var(--radius);padding:var(--s-5);text-align:center;font-family:var(--serif);font-size:var(--t-base);color:var(--rose-700)">',
            '<div class="tile-card tile-card--rose">',
        ),
    ],
    # ----------------------------------------------------------------------
    # press.html — press-row pattern (5 articles, 3-col grid w/ label).
    # ----------------------------------------------------------------------
    "press.html": [
        (
            '<article style="background:var(--snow);border:1px solid var(--line);border-radius:var(--radius);padding:var(--s-5h) var(--s-5);display:grid;grid-template-columns:120px 1fr auto;gap:var(--s-4h);align-items:center">',
            '<article class="listing-row listing-row--wide">',
        ),
        # outlet brand label
        (
            '<div style="font-size:var(--t-micro);font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--ink-muted)">',
            '<div class="listing-row__label">',
        ),
        # title block (serif/.pillar)
        (
            '<div style="font-family:var(--serif);font-size:var(--t-md);color:var(--pillar);margin-bottom:4px">',
            '<div class="listing-row__title" style="margin-bottom:var(--s-1)">',
        ),
        # date / muted line
        (
            '<div style="font-size:var(--t-label);color:var(--ink-muted)">',
            '<div class="listing-row__meta">',
        ),
    ],
    # ----------------------------------------------------------------------
    # jobs.html — 4 job tiles (.listing-row with custom :grid)
    # ----------------------------------------------------------------------
    "jobs.html": [
        (
            '<article style="background:var(--snow);border:1px solid var(--line);border-radius: var(--radius-md);padding:var(--s-5);display:grid;grid-template-columns:1fr auto;gap:var(--s-4);align-items:center">',
            '<article class="listing-row" style="border-radius:var(--radius-md);padding:var(--s-5);gap:var(--s-4)">',
        ),
        (
            '<h3 style="font-family:var(--serif);font-size:var(--t-subtitle);text-transform:uppercase;margin:0 0 4px;color:var(--pillar)">',
            '<h3 class="listing-row__title" style="font-size:var(--t-subtitle);margin:0 0 var(--s-1)">',
        ),
        (
            '<p style="font-size:var(--t-label);color:var(--ink-muted);margin:0 0 8px">',
            '<p class="listing-row__meta" style="margin:0 0 var(--s-2)">',
        ),
        (
            '<p style="font-size:var(--t-label);line-height:1.55;margin:0">',
            '<p class="listing-row__body" style="margin:0">',
        ),
    ],
    # ----------------------------------------------------------------------
    # volunteer-dashboard.html — 4 shift tiles
    # ----------------------------------------------------------------------
    "volunteer-dashboard.html": [
        (
            '<article style="background:var(--snow);border:1px solid var(--line);border-radius:var(--radius);padding:var(--s-4h) 22px;display:grid;grid-template-columns:1fr auto;gap:var(--s-3);align-items:center">',
            '<article class="listing-row">',
        ),
        (
            '<div style="font-weight:700;font-size:15px">',
            '<div class="listing-row__title" style="font-family:var(--sans);font-size:var(--t-label);text-transform:none;color:var(--ink)">',
        ),
        (
            '<div style="font-size:var(--t-micro);color:var(--ink-muted);margin-top:4px">',
            '<div class="listing-row__meta">',
        ),
        (
            '<div style="font-size:var(--t-label);margin-top:var(--s-1h);line-height:1.5">',
            '<div class="listing-row__body" style="margin-top:var(--s-1h)">',
        ),
    ],
    # ----------------------------------------------------------------------
    # saved-articles.html (JS template)
    # ----------------------------------------------------------------------
    "saved-articles.html": [
        (
            '<article style="background:var(--snow);border:1px solid var(--line);border-radius:var(--radius);padding:var(--s-4h) 22px;margin-bottom:var(--s-3);display:flex;justify-content:space-between;align-items:center;gap:12px">',
            '<article class="listing-row" style="display:flex;justify-content:space-between">',
        ),
        (
            '<div style="font-family:var(--serif);font-size:var(--t-md);text-transform:uppercase">',
            '<div class="listing-row__title" style="margin:0">',
        ),
        (
            '<div style="font-size:var(--t-label);color:var(--ink-muted);margin-top:4px">',
            '<div class="listing-row__meta">',
        ),
    ],
    # ----------------------------------------------------------------------
    # onboarding.html — checklist cards
    # ----------------------------------------------------------------------
    "onboarding.html": [
        (
            'style="display:grid;grid-template-columns:48px 1fr 24px;gap:var(--s-4);align-items:center;padding:var(--s-5);background:var(--snow);border:1px solid var(--line);border-radius:var(--radius);text-decoration:none;color:inherit"',
            'class="listing-row" style="grid-template-columns:48px 1fr 24px;padding:var(--s-5);text-decoration:none;color:inherit"',
        ),
    ],
}


def main():
    total = 0
    for fname, edits in EDITS.items():
        p = ROOT / fname
        if not p.exists():
            print(f"  MISS  {fname}")
            continue
        text = p.read_text()
        orig = text
        n = 0
        for old, new in edits:
            if old in text:
                count = text.count(old)
                n += count
                text = text.replace(old, new)
        if text != orig:
            p.write_text(text)
            total += n
        marker = "OK " if n else "   "
        print(f"  {marker}  {fname}: {n}")
    print(f"\nTotal markup swaps: {total}")


if __name__ == "__main__":
    sys.exit(main())
