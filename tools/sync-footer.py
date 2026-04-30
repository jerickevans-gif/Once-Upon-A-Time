#!/usr/bin/env python3
"""Sync the canonical site footer across every *.html file at the repo root.

Usage:
    python3 tools/sync-footer.py          # apply changes
    python3 tools/sync-footer.py --check  # dry-run, exit 1 if any file would change

Edit the FOOTER constant below to update the canonical block, then run with
no flags. Auth/checkout pages without a `<footer class="site-footer">` are
skipped automatically.

When the site moves to Shopify the canonical block should migrate to a
Liquid section (e.g. sections/footer.liquid) and this script can be retired.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

FOOTER = '''<footer class="site-footer" role="contentinfo">
    <div class="wrap">
      <div class="footer__grid">
        <div class="footer__brand-block"><div class="footer-brand"><img src="once-upon-a-time-assets/logo/full-icon.png" alt="" loading="lazy"></div></div>
        <div><h3>About</h3><ul><li><a href="about.html">About</a></li><li><a href="programs.html">Programs</a></li></ul></div>
        <div><h3>Events</h3><ul><li><a href="events.html">Events</a></li><li><a href="donate.html">Support Us</a></li></ul></div>
        <div class="footer__address-block">
          <a class="footer__address" href="https://maps.app.goo.gl/d8kfjpDiRvw9ZKt47" target="_blank" rel="noopener" aria-label="Open studio location in Google Maps">87-61 111th St, Richmond Hill<br>NY 11418, United States</a>
          <div class="footer__socials">
            <a href="https://youtube.com/@onceuponatime" aria-label="YouTube" target="_blank" rel="noopener"><i class="ph ph-youtube-logo"></i></a>
            <a href="https://www.facebook.com/onceuponatimeinc/" aria-label="Facebook" target="_blank" rel="noopener"><i class="ph ph-facebook-logo"></i></a>
            <a href="https://twitter.com/onceuponatime" aria-label="Twitter" target="_blank" rel="noopener"><i class="ph ph-twitter-logo"></i></a>
            <a href="https://www.instagram.com/onceuponatimeinc/" aria-label="Instagram" target="_blank" rel="noopener"><i class="ph ph-instagram-logo"></i></a>
            <a href="mailto:contact@onceuponatime.org" aria-label="Email"><i class="ph ph-envelope"></i></a>
          </div>
          <div style="margin-top:14px;font-size:12px;opacity:.7"><a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a> · <a href="accessibility.html">Accessibility</a></div>
        </div>
      </div>
      <div class="site-footer__bottom">Once Upon A Time Inc. &copy; 202X. All rights reserved. Nonprofit legal disclaimer and tax ID.</div>
    </div>
  </footer>'''

FOOTER_PATTERN = re.compile(r'<footer class="site-footer"[^>]*>.*?</footer>', re.S)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('--check', action='store_true',
                    help='Dry-run; exit 1 if any file would change.')
    args = ap.parse_args()

    changed: list[str] = []
    skipped: list[str] = []

    for path in sorted(ROOT.glob('*.html')):
        original = path.read_text(encoding='utf-8')
        if not FOOTER_PATTERN.search(original):
            skipped.append(path.name)
            continue
        replaced = FOOTER_PATTERN.sub(FOOTER, original, count=1)
        if replaced != original:
            changed.append(path.name)
            if not args.check:
                path.write_text(replaced, encoding='utf-8')

    print(f'{len(changed)} file(s) {"would change" if args.check else "updated"}')
    for f in changed:
        print(f'  - {f}')
    if skipped:
        print(f'{len(skipped)} file(s) skipped (no <footer class="site-footer">)')
        for f in skipped:
            print(f'  - {f}')

    return 1 if args.check and changed else 0


if __name__ == '__main__':
    sys.exit(main())
