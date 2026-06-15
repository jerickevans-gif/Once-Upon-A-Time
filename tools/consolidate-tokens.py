#!/usr/bin/env python3
"""
Site-wide consistency consolidation. Applies the audit punch list mechanically:

- Token swaps on page-scoped CSS (radii, hex auth-link colors)
- Inline `<input>` / `<textarea>` style strips that were silently overriding .input
- Undefined .btn--primary / .btn--block fixes in newsletter / donate
- Chevron icon swaps (ph-caret-double-right / ph-caret-right CTA → ph-arrow-right)

Idempotent: each replacement string is unique enough to not double-apply.
Reports a per-file change count when done.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(p for p in ROOT.glob("*.html"))

# ---------------------------------------------------------------------------
# Per-file edits, addressed by exact substring (faster + safer than regex).
# Each entry: filename -> list of (old, new) tuples.
# ---------------------------------------------------------------------------
EDITS = {
    "about.html": [
        ("border-radius: 8px; z-index: 1000",
         "border-radius: var(--radius-sm); z-index: 1000"),
        # hero photo
        ("border-radius: 16px;\n      overflow: hidden;",
         "border-radius: var(--radius-md);\n      overflow: hidden;"),
    ],
    "donate.html": [
        ("border-radius: 8px; z-index: 1000",
         "border-radius: var(--radius-sm); z-index: 1000"),
        # .btn--block usage on the donate page
        ('class="btn btn--block"',
         'class="btn" style="width:100%"'),
    ],
    "newsletter.html": [
        # Two .btn--primary that should be bare .btn
        ('class="btn btn--primary"', 'class="btn"'),
    ],
    "newsletter-article.html": [
        # body img
        ('border-radius: 12px; box-shadow: var(--shadow-sm)',
         'border-radius: var(--radius); box-shadow: var(--shadow-sm)'),
        # "Next Page" CTA uses caret instead of arrow
        ('<i class="ph ph-caret-right" aria-hidden="true"></i>',
         '<i class="ph ph-arrow-right" aria-hidden="true"></i>'),
    ],
    "index.html": [
        # Hero "Learn More" CTA: caret-double-right → arrow-right (matches site-wide CTA convention)
        ('ph-caret-double-right', 'ph-arrow-right'),
    ],
    "programs.html": [
        # Two "View More" CTAs at lines 265/293 — same icon swap
        ('ph-caret-double-right', 'ph-arrow-right'),
    ],
    "login.html": [
        # Auth-page link color drift: #5b6caf → token (rose-700 keeps recognizable link blueish-rose ramp)
        ("color: #5b6caf", "color: var(--rose-700)"),
    ],
    "signup.html": [
        ("color: #5b6caf", "color: var(--rose-700)"),
    ],
    "forgot-password.html": [
        # Strip inline input-style override; .input class is canonical
        (' style="min-height:44px;padding:0 16px;border:1px solid var(--line);border-radius:8px;background:var(--snow);font-size:14px"',
         ''),
    ],
    "reset-password.html": [
        (' style="min-height:44px;padding:0 16px;border:1px solid var(--line);border-radius:8px;background:var(--snow);font-size:14px"',
         ''),
    ],
    "gift-donation.html": [
        (' style="width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:8px;background:var(--snow)"',
         ''),
    ],
    "scholarship.html": [
        (' style="width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:8px;background:var(--snow)"',
         ''),
    ],
}


def apply(path: Path, replacements):
    text = path.read_text()
    original = text
    applied = 0
    for old, new in replacements:
        if old in text:
            text = text.replace(old, new)
            applied += 1
    if applied and text != original:
        path.write_text(text)
    return applied


def main():
    total = 0
    for fname, edits in EDITS.items():
        p = ROOT / fname
        if not p.exists():
            print(f"  MISS  {fname}")
            continue
        n = apply(p, edits)
        total += n
        marker = "OK " if n else "   "
        print(f"  {marker}  {fname}: {n}/{len(edits)} applied")
    print(f"\nTotal substitutions: {total}")


if __name__ == "__main__":
    sys.exit(main())
