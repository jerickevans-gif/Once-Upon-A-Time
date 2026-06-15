#!/usr/bin/env python3
"""Final radius/pill consolidation — page-scoped CSS values where SAFE_INLINE missed."""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]

SWAPS = [
    # 999px pills (with space; inline already covered by SAFE_INLINE)
    ("border-radius: 999px", "border-radius: var(--radius-pill)"),
    # 8px radii in page-scoped CSS, sweep
    ("border-radius: 8px",   "border-radius: var(--radius-sm)"),
]

PER_FILE = {
    "enrollment.html": [
        # .panel 16px → radius-md
        ("border-radius: 16px; padding: 32px;",
         "border-radius: var(--radius-md); padding: var(--s-6);"),
    ],
    "programs.html": [
        # .pg-card__photo 12px → radius
        (".pg-card__photo { aspect-ratio: 16/9; border-radius: 12px;",
         ".pg-card__photo { aspect-ratio: 16/9; border-radius: var(--radius);"),
    ],
}

# Files to skip the global SWAPS pass entirely (avoid regressing Figma-spec values)
SKIP_GLOBAL = {"contact.html"}  # 32px corner radius is deliberate Figma spec


def main():
    files = sorted(p for p in ROOT.glob("*.html"))
    total = 0
    print("Final pass — pills + 8px swaps in page-scoped CSS")
    for p in files:
        if p.name in SKIP_GLOBAL:
            continue
        text = p.read_text()
        n = 0
        for old, new in SWAPS:
            if old in text:
                n += text.count(old)
                text = text.replace(old, new)
        if n:
            p.write_text(text)
            total += n
            print(f"  OK   {p.name}: {n}")
    print("\nPer-file fixes")
    for fname, edits in PER_FILE.items():
        p = ROOT / fname
        text = p.read_text()
        applied = 0
        for old, new in edits:
            if old in text:
                applied += 1
                text = text.replace(old, new)
        if applied:
            p.write_text(text)
            total += applied
        print(f"  {'OK ' if applied else '   '}  {fname}: {applied}/{len(edits)}")
    print(f"\nTotal: {total}")


if __name__ == "__main__":
    sys.exit(main())
