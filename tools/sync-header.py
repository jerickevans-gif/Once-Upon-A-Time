#!/usr/bin/env python3
"""Sync the canonical site header across every *.html file at the repo root.

Usage:
    python3 tools/sync-header.py          # apply changes
    python3 tools/sync-header.py --check  # dry-run, exit 1 if any file would change

Edit the HEADER constant below to update the canonical block, then run with
no flags. Pages without a `<header class="site-header">` are skipped.

The script preserves each page's `aria-current="page"` annotation by re-adding
it to the matching primary-nav link based on the source HTML filename.

When the site moves to Shopify the canonical block should migrate to a
Liquid section (sections/header.liquid) and this script can be retired.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Canonical header — Figma "Final Designs | AI Prototype | P4S3" Desktop Navbar (2748:44946).
# Stacked serif wordmark + giant pill search + cart/settings/dark-avatar cluster.
HEADER = '''<header class="site-header" role="banner">
    <div class="wrap site-header__inner">
      <button class="nav-toggle" type="button" aria-controls="primary-nav" aria-expanded="false" aria-label="Toggle navigation menu">
        <i class="ph ph-list" aria-hidden="true"></i>
      </button>
      <a href="index.html" class="brand brand--stacked" aria-label="Once Upon A Time, home">
        <span class="brand__line">Once</span>
        <span class="brand__line">Upon</span>
        <span class="brand__line">A Time</span>
      </a>
      <form class="site-search" role="search" action="search.html" method="get">
        <label class="sr-only" for="site-search-input">Search the site</label>
        <input id="site-search-input" name="q" type="search" class="site-search__input" placeholder="Search" autocomplete="off">
        <i class="ph ph-magnifying-glass site-search__icon" aria-hidden="true"></i>
      </form>
      <nav class="primary-nav" id="primary-nav" aria-label="Primary">
        <a href="about.html">About Us</a>
        <a href="programs.html">Programs</a>
        <a href="donate.html">Donation</a>
        <a href="newsletter.html">Newsletter</a>
        <a href="contact.html">Contact</a>
      </nav>
      <div class="header-actions">
        <button class="icon-btn icon-btn--cart" type="button" aria-label="Cart, 9 items" data-mock="cart">
          <i class="ph ph-shopping-cart-simple" aria-hidden="true"></i>
          <span class="badge" aria-hidden="true">9</span>
          <span>Cart</span>
          <i class="ph ph-arrow-right" aria-hidden="true"></i>
        </button>
        <a href="preferences.html" class="icon-btn icon-btn--icon-only" aria-label="Settings"><i class="ph ph-gear" aria-hidden="true"></i></a>
        <a href="profile.html" class="avatar avatar--dark" aria-label="Account, 9 notifications">
          <i class="ph ph-user" aria-hidden="true"></i>
          <span class="badge" aria-hidden="true">9</span>
        </a>
      </div>
    </div>
  </header>'''

HEADER_PATTERN = re.compile(r'<header class="site-header"[^>]*>.*?</header>', re.S)

# Map root filename → primary-nav href that should carry aria-current="page".
ARIA_CURRENT_MAP = {
    'about.html': 'about.html',
    'programs.html': 'programs.html',
    'private-lessons.html': 'programs.html',
    'seasonal-camps.html': 'programs.html',
    'instructor.html': 'programs.html',
    'instructors.html': 'programs.html',
    'donate.html': 'donate.html',
    'gift-donation.html': 'donate.html',
    'sponsorship.html': 'donate.html',
    'scholarship.html': 'donate.html',
    'donor-wall.html': 'donate.html',
    'impact-report.html': 'donate.html',
    'newsletter.html': 'newsletter.html',
    'newsletter-article.html': 'newsletter.html',
    'contact.html': 'contact.html',
}


def apply_aria_current(html: str, filename: str) -> str:
    href = ARIA_CURRENT_MAP.get(filename)
    if not href:
        return html
    # Add aria-current="page" to the matching link inside the freshly injected
    # primary-nav block (only inside the header we just stamped).
    pattern = re.compile(
        r'(<nav class="primary-nav"[^>]*>)(.*?)(</nav>)', re.S)
    m = pattern.search(html)
    if not m:
        return html
    nav = m.group(2)
    nav_new = re.sub(
        rf'(<a href="{re.escape(href)}")',
        r'\1 aria-current="page"',
        nav, count=1,
    )
    return html[:m.start(2)] + nav_new + html[m.end(2):]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('--check', action='store_true',
                    help='Dry-run; exit 1 if any file would change.')
    args = ap.parse_args()

    changed: list[str] = []
    skipped: list[str] = []

    for path in sorted(ROOT.glob('*.html')):
        original = path.read_text(encoding='utf-8')
        if not HEADER_PATTERN.search(original):
            skipped.append(path.name)
            continue
        replaced = HEADER_PATTERN.sub(HEADER, original, count=1)
        replaced = apply_aria_current(replaced, path.name)
        if replaced != original:
            changed.append(path.name)
            if not args.check:
                path.write_text(replaced, encoding='utf-8')

    print(f'{len(changed)} file(s) {"would change" if args.check else "updated"}')
    for f in changed:
        print(f'  - {f}')
    if skipped:
        print(f'{len(skipped)} file(s) skipped (no <header class="site-header">)')
        for f in skipped:
            print(f'  - {f}')

    return 1 if args.check and changed else 0


if __name__ == '__main__':
    sys.exit(main())
