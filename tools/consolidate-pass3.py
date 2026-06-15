#!/usr/bin/env python3
"""
Pass 3: off-scale spacing values → newly-defined half-step tokens.
6 → --s-1h, 14 → --s-3h, 18 → --s-4h, 20 → --s-5h, 22 → --s-5q,
56 → --s-6h, 80 → --s-7h.

Substring-safe — these only match `gap/padding/margin: Npx` declarations.
"""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
TARGETS = sorted(ROOT.glob("*.html")) + [
    ROOT / "once-upon-a-time-assets/styles/design-system.css",
    ROOT / "once-upon-a-time-assets/styles/components.css",
]

PX_TO_TOKEN = {
    "6px":  "var(--s-1h)",
    "14px": "var(--s-3h)",
    "18px": "var(--s-4h)",
    "20px": "var(--s-5h)",
    "22px": "var(--s-5q)",
    "56px": "var(--s-6h)",
    "80px": "var(--s-7h)",
}

SPACING_PROPS = [
    "gap", "row-gap", "column-gap",
    "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
    "padding-inline", "padding-block",
    "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
    "margin-inline", "margin-block",
]


def build_pairs():
    pairs = []
    for prop in SPACING_PROPS:
        for px, tok in PX_TO_TOKEN.items():
            pairs.append((f"{prop}: {px};", f"{prop}: {tok};"))
            pairs.append((f"{prop}: {px} ", f"{prop}: {tok} "))
            pairs.append((f"{prop}: {px}\n", f"{prop}: {tok}\n"))
            pairs.append((f"{prop}:{px};", f"{prop}:{tok};"))
            pairs.append((f"{prop}:{px} ", f"{prop}:{tok} "))
    return pairs


def main():
    pairs = build_pairs()
    total = 0
    for p in TARGETS:
        if not p.exists():
            continue
        text = p.read_text()
        orig = text
        n = 0
        for old, new in pairs:
            if old in text:
                n += text.count(old)
                text = text.replace(old, new)
        if n:
            p.write_text(text)
            total += n
            print(f"  OK {p.relative_to(ROOT)}: {n}")
    print(f"\nTOTAL: {total}")


if __name__ == "__main__":
    sys.exit(main())
