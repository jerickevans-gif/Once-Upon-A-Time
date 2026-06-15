#!/usr/bin/env python3
"""
Second-pass consolidation: spacing, typography, transition timing, hex colors.

Applies idempotent substring substitutions across all root *.html files +
the two shared stylesheets. Replacements designed to be safe because the
matched strings are property declarations (`gap: 8px`, `font-size: 14px`)
that don't appear in other contexts.

Run twice = no-op.
"""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
TARGETS = sorted(ROOT.glob("*.html")) + [
    ROOT / "once-upon-a-time-assets/styles/design-system.css",
    ROOT / "once-upon-a-time-assets/styles/components.css",
]

# =============================================================================
# SPACING — gap / padding / margin → --s-* tokens
# =============================================================================
PX_TO_TOKEN = {
    "4px":  "var(--s-1)",
    "8px":  "var(--s-2)",
    "10px": "var(--s-10)",
    "12px": "var(--s-3)",
    "16px": "var(--s-4)",
    "24px": "var(--s-5)",
    "28px": "var(--s-28)",
    "32px": "var(--s-6)",
    "48px": "var(--s-7)",
    "64px: var(--s-8)": "var(--s-8)",  # safety no-op marker (not used)
    "64px": "var(--s-8)",
    "96px": "var(--s-9)",
}

SPACING_PROPS_SINGLE = [
    "gap", "row-gap", "column-gap",
    "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
    "padding-inline", "padding-block",
    "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
    "margin-inline", "margin-block",
]


def build_spacing_pairs():
    pairs = []
    for prop in SPACING_PROPS_SINGLE:
        for px, tok in PX_TO_TOKEN.items():
            # with space after colon
            pairs.append((f"{prop}: {px};", f"{prop}: {tok};"))
            pairs.append((f"{prop}: {px} ", f"{prop}: {tok} "))
            pairs.append((f"{prop}: {px}\n", f"{prop}: {tok}\n"))
            # no space
            pairs.append((f"{prop}:{px};", f"{prop}:{tok};"))
            pairs.append((f"{prop}:{px} ", f"{prop}:{tok} "))
    return pairs


# =============================================================================
# TYPOGRAPHY — font-size off-step + canonical step normalization
# =============================================================================
FONT_SIZE_MAP = {
    # Off-step values normalize to nearest canonical
    "11px": "var(--t-micro)",       # 11 → 12 (label-eyebrow context — minor visual lift, big consistency)
    "13px": "var(--t-label)",       # 13 → 14
    "15px": "var(--t-base)",        # 15 → 16
    "22px": "var(--t-subtitle)",    # 22 → 24
    # Canonical step swaps
    "12px": "var(--t-micro)",
    "14px": "var(--t-label)",
    "16px": "var(--t-base)",
    "18px": "var(--t-md)",
    "20px": "var(--t-lg)",
    "24px": "var(--t-subtitle)",
    "28px": "var(--t-h5)",
    "32px": "var(--t-h4)",
    "36px": "var(--t-h3-sm)",
    "40px": "var(--t-h3)",
    "48px": "var(--t-h2)",
    "56px": "var(--t-display)",
    "64px": "var(--t-h1)",
}


def build_font_size_pairs():
    pairs = []
    for px, tok in FONT_SIZE_MAP.items():
        # `font-size: 14px;` (with space)
        pairs.append((f"font-size: {px};", f"font-size: {tok};"))
        pairs.append((f"font-size: {px} ", f"font-size: {tok} "))
        # `font-size:14px;` (no space)
        pairs.append((f"font-size:{px};", f"font-size:{tok};"))
        pairs.append((f"font-size:{px} ", f"font-size:{tok} "))
    return pairs


# =============================================================================
# TRANSITIONS — duration .15s/.2s/.25s/.3s → --dur-*
# =============================================================================
DURATION_PAIRS = [
    # Most common — bare " .15s ease" pattern. Replace BOTH duration + ease atomically
    # to canonical "var(--dur-1) var(--ease)".
    (" .15s ease", " var(--dur-1) var(--ease)"),
    (" 0.15s ease", " var(--dur-1) var(--ease)"),
    (" .2s ease", " var(--dur-1) var(--ease)"),
    (" 0.2s ease", " var(--dur-1) var(--ease)"),
    (" .25s ease", " var(--dur-2) var(--ease)"),
    (" 0.25s ease", " var(--dur-2) var(--ease)"),
    (" .3s ease", " var(--dur-2) var(--ease)"),
    (" 0.3s ease", " var(--dur-2) var(--ease)"),
    (" .35s ease", " var(--dur-2) var(--ease)"),
    # With explicit cubic-bezier .4-.2-.1 (Tailwind default) — re-tokenize
    (" .15s cubic-bezier(.4,0,.2,1)", " var(--dur-1) var(--ease)"),
    (" .3s cubic-bezier(.4,0,.2,1)", " var(--dur-2) var(--ease)"),
]


# =============================================================================
# HEX COLORS — drift → tokens
# =============================================================================
HEX_PAIRS = [
    # about.html + donate.html warm cream over hero
    ("#f6e7d4", "var(--beginning)"),
    ("#f0e3c9", "var(--beginning)"),
    ("#f4ecd8", "var(--beginning)"),
    ("#f7eedc", "var(--beginning)"),
    ("#f0d8bb", "var(--beginning)"),
    ("#f4e6d3", "var(--beginning)"),
    # about.html .values__inner border + .program-card__tag dot
    ("border: 1px solid #e6cfb8", "border: 1px solid var(--line)"),
    ("background: #b6e7a3", "background: var(--garden-300)"),
    # donate.html .impact-card fallbacks
    ("background-color: #5d6f4e", "background-color: var(--garden-700)"),
    ("background-color: #8b3a2e", "background-color: var(--rose-700)"),
    # donate.html hero overlay border
    ("border: 1px solid #d9c4ad", "border: 1px solid var(--rose-300)"),
    # unsubscribe.html garden-100 fallback (token always defined)
    ("var(--garden-100, #e8efd5)", "var(--garden-100)"),
    # newsletter.html rose-600 sampling note
    ("background: #735041", "background: var(--rose-600)"),
]


def main():
    spacing_pairs = build_spacing_pairs()
    font_pairs = build_font_size_pairs()
    duration_pairs = DURATION_PAIRS
    hex_pairs = HEX_PAIRS

    spacing_total = font_total = dur_total = hex_total = 0

    for p in TARGETS:
        if not p.exists():
            continue
        text = p.read_text()
        orig = text
        # Apply spacing
        sp = 0
        for old, new in spacing_pairs:
            if old in text:
                sp += text.count(old)
                text = text.replace(old, new)
        spacing_total += sp
        # Apply typography
        fp = 0
        for old, new in font_pairs:
            if old in text:
                fp += text.count(old)
                text = text.replace(old, new)
        font_total += fp
        # Apply transitions
        dp = 0
        for old, new in duration_pairs:
            if old in text:
                dp += text.count(old)
                text = text.replace(old, new)
        dur_total += dp
        # Apply hex
        hp = 0
        for old, new in hex_pairs:
            if old in text:
                hp += text.count(old)
                text = text.replace(old, new)
        hex_total += hp

        if text != orig:
            p.write_text(text)
            n = sp + fp + dp + hp
            print(f"  OK {p.relative_to(ROOT)}: spacing={sp} font={fp} dur={dp} hex={hp} (total={n})")

    print(f"\nTOTAL — spacing:{spacing_total}  font-size:{font_total}  duration:{dur_total}  hex:{hex_total}")
    print(f"GRAND TOTAL: {spacing_total + font_total + dur_total + hex_total}")


if __name__ == "__main__":
    sys.exit(main())
