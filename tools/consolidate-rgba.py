#!/usr/bin/env python3
"""
Promote brand-tinted rgba() to color-mix() so they track --rose / --garden tokens.

Safe browser support: Safari 16.2+ / Chrome 111+ / Firefox 113+ (2023+).
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]

TARGETS = sorted(ROOT.glob("*.html")) + [
    ROOT / "once-upon-a-time-assets/styles/design-system.css",
    ROOT / "once-upon-a-time-assets/styles/components.css",
]

# Brand → token mapping
BRANDS = {
    (139, 80, 68): "var(--rose)",
    (107, 109, 32): "var(--garden)",
}

# Regex: rgba(r,g,b,.NN) capturing all three components and the alpha
RGBA_RE = re.compile(r"rgba\((\d+),(\d+),(\d+),\.?(\d{1,2})\)")


def to_color_mix(match: re.Match) -> str:
    r, g, b, frac = match.groups()
    rgb = (int(r), int(g), int(b))
    if rgb not in BRANDS:
        return match.group(0)
    pct = int(frac)
    if len(frac) == 1:        # .4 → 40%
        pct *= 10
    return f"color-mix(in srgb, {BRANDS[rgb]} {pct}%, transparent)"


def main():
    total = 0
    for p in TARGETS:
        if not p.exists():
            continue
        text = p.read_text()
        new = RGBA_RE.sub(to_color_mix, text)
        if new != text:
            count = sum(1 for m in RGBA_RE.finditer(text)
                        if (int(m.group(1)), int(m.group(2)), int(m.group(3))) in BRANDS)
            p.write_text(new)
            total += count
            print(f"  OK {p.relative_to(ROOT)}: {count}")
    print(f"\nTotal rgba → color-mix: {total}")


if __name__ == "__main__":
    sys.exit(main())
