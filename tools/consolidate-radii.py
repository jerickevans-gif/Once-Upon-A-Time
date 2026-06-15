#!/usr/bin/env python3
"""
Pass 2 of consolidation: per-page raw-px → token swaps for radii.

Two strategies:
1. SAFE_INLINE: substring replacements for inline-style attributes (`border-radius:12px`,
   no space). Applied across all root HTML files.
2. PER_FILE: targeted page-scoped CSS replacements per file (`border-radius: 12px`,
   with space) where the audit identified a single owner.
"""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]

# Substring swaps applied across every root *.html. Inline-style attribute syntax
# (no space after colon). These were all manually verified to be inline-only.
SAFE_INLINE = [
    ("border-radius:8px",   "border-radius:var(--radius-sm)"),
    ("border-radius:10px",  "border-radius:var(--radius-sm)"),
    ("border-radius:12px",  "border-radius:var(--radius)"),
    ("border-radius:14px",  "border-radius:var(--radius-md)"),
    ("border-radius:16px",  "border-radius:var(--radius-md)"),
    ("border-radius:999px", "border-radius:var(--radius-pill)"),
]

# Per-file replacements for page-scoped CSS (with space).
PER_FILE = {
    "donate.html": [
        # .donation mobile override
        (".donation { padding: 40px 0 48px; border-radius: 16px; }",
         ".donation { padding: 40px 0 48px; border-radius: var(--radius-md); }"),
    ],
    "enrollment.html": [
        # .pay-option border
        ("border: 1.5px solid var(--line); border-radius: 12px;\n      padding: 16px 18px;",
         "border: 1.5px solid var(--line); border-radius: var(--radius-sm);\n      padding: 16px 18px;"),
        # .child-pick
        ("border: 1.5px solid var(--line); border-radius: 12px;",
         "border: 1.5px solid var(--line); border-radius: var(--radius-sm);"),
        # inner card 12 with padding 14
        ("border-radius: 12px; padding: 14px;",
         "border-radius: var(--radius-sm); padding: 14px;"),
        # checkbox 6→4
        ("border-radius: 6px; cursor: pointer; accent-color",
         "border-radius: 4px; cursor: pointer; accent-color"),
    ],
    "newsletter-article.html": [
        (".article-hero img {\n      width: 100%; aspect-ratio: 16/9; object-fit: cover;\n      border-radius: 16px; overflow: hidden;",
         ".article-hero img {\n      width: 100%; aspect-ratio: 16/9; object-fit: cover;\n      border-radius: var(--radius-md); overflow: hidden;"),
    ],
    "payment.html": [
        ("border-radius: 6px; overflow: hidden;",
         "border-radius: var(--radius-sm); overflow: hidden;"),
        # .pay-method card block
        ("padding: 18px 22px; border-radius: 12px;",
         "padding: 18px 22px; border-radius: var(--radius-sm);"),
        # submit button
        ("border: 0; border-radius: 12px;",
         "border: 0; border-radius: var(--radius-sm);"),
    ],
    "preferences.html": [
        ("border-radius: 6px; cursor: pointer; accent-color",
         "border-radius: 4px; cursor: pointer; accent-color"),
    ],
    "login.html": [
        (".auth-back:hover, .auth-close:hover { background: rgba(0,0,0,.04); border-radius: 6px; }",
         ".auth-back:hover, .auth-close:hover { background: rgba(0,0,0,.04); border-radius: var(--radius-sm); }"),
    ],
    "signup.html": [
        (".auth-back:hover, .auth-close:hover { background: rgba(0,0,0,.04); border-radius: 6px; }",
         ".auth-back:hover, .auth-close:hover { background: rgba(0,0,0,.04); border-radius: var(--radius-sm); }"),
    ],
}


def apply(text, pairs):
    applied = 0
    for old, new in pairs:
        if old in text:
            count = text.count(old)
            text = text.replace(old, new)
            applied += count
    return text, applied


def main():
    files = sorted(p for p in ROOT.glob("*.html"))
    total = 0
    print("Pass 2A — inline-style swaps (border-radius:Npx)")
    for p in files:
        text = p.read_text()
        new, n = apply(text, SAFE_INLINE)
        if n:
            p.write_text(new)
            total += n
            print(f"  OK   {p.name}: {n}")
    print(f"\nPass 2B — per-file CSS swaps")
    for fname, edits in PER_FILE.items():
        p = ROOT / fname
        if not p.exists():
            print(f"  MISS {fname}")
            continue
        text = p.read_text()
        new, n = apply(text, edits)
        if n:
            p.write_text(new)
            total += n
        marker = "OK " if n else "   "
        print(f"  {marker}  {fname}: {n}/{len(edits)}")
    print(f"\nTotal substitutions: {total}")


if __name__ == "__main__":
    sys.exit(main())
