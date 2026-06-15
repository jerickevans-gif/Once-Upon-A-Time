#!/usr/bin/env python3
"""Migrate root *.html pages to Shopify Liquid sections + templates.

For each page:
  1. Extract <style>...</style> from <head>
  2. Extract everything inside <main>...</main>
  3. Write shopify-theme/sections/main-{slug}.liquid containing both
     (style first, then markup, then a minimal {% schema %})
  4. Write/update shopify-theme/templates/page.{slug}.json (or index.json)
     to render that section under the canonical key "main"

Skip:
  - 500.html / offline.html / maintenance.html (Shopify has built-in error pages)
  - enrollment.html / receipt.html (already use minimal layouts; flag as todo)
  - Anything that already lacks <main>

Idempotent: re-running rewrites the section + template.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path("/Users/eigenhitchens/Design-Projects/once-upon-a-time")
SECTIONS_DIR = ROOT / "shopify-theme" / "sections"
TEMPLATES_DIR = ROOT / "shopify-theme" / "templates"

SKIP_PAGES = {
    "500.html",
    "offline.html",
    "maintenance.html",
    "404.html",
}

# Pages where the theme should render a minimal layout (no shared header/footer).
MINIMAL_LAYOUT_PAGES = {
    "enrollment.html",
    "receipt.html",
    "login.html",
    "signup.html",
    "forgot-password.html",
    "reset-password.html",
    "onboarding.html",
    "payment.html",
    "payment-declined.html",
    "order-confirmation.html",
    "unsubscribe.html",
}

# Index gets a special template name.
INDEX_PAGES = {"index.html"}


def slug_from_filename(name: str) -> str:
    return name.removesuffix(".html")


def extract_main(html: str) -> str:
    """Return the inner HTML of the first <main> tag, or None."""
    m = re.search(r"<main[^>]*>(.*?)</main>", html, re.S | re.I)
    if not m:
        return None
    return m.group(1).strip()


def extract_styles(html: str) -> str:
    """Return concatenated <style>...</style> blocks from <head>, or empty string."""
    head_m = re.search(r"<head>(.*?)</head>", html, re.S | re.I)
    if not head_m:
        return ""
    head = head_m.group(1)
    styles = re.findall(r"<style[^>]*>(.*?)</style>", head, re.S | re.I)
    if not styles:
        return ""
    body = "\n".join(s.strip() for s in styles if s.strip())
    return f"<style>\n{body}\n</style>" if body else ""


def liquid_safe(html: str) -> str:
    """Escape Liquid's '{{', '}}', '{%', '%}' tokens that should be literal in our markup.

    Our static HTML uses bare `{{` only in JSON-LD scripts; nothing else. We
    Liquid-escape those so the section file compiles."""
    # Replace bare braces in JSON-LD blocks etc.
    # Use {% raw %} ... {% endraw %} wrapper around any <script type="application/ld+json"> block.
    def wrap_jsonld(m):
        inner = m.group(1)
        return f"<script type=\"application/ld+json\">{{% raw %}}{inner}{{% endraw %}}</script>"

    html = re.sub(
        r'<script type="application/ld\+json">(.*?)</script>',
        wrap_jsonld,
        html,
        flags=re.S,
    )
    return html


def write_section(slug: str, styles: str, markup: str) -> Path:
    name = f"main-{slug}.liquid"
    path = SECTIONS_DIR / name
    body = []
    if styles:
        body.append(styles)
    body.append(markup)
    body_text = "\n\n".join(body)

    section = (
        body_text
        + "\n\n{% schema %}\n"
        + json.dumps(
            {
                "name": slug.replace("-", " ").title() + " — Main",
                "tag": "section",
                "settings": [],
            },
            indent=2,
        )
        + "\n{% endschema %}\n"
    )
    path.write_text(section, encoding="utf-8")
    return path


def write_template_json(slug: str, section_name: str, is_index: bool) -> Path:
    if is_index:
        name = "index.json"
    else:
        name = f"page.{slug}.json"
    path = TEMPLATES_DIR / name
    data = {
        "sections": {
            "main": {"type": section_name, "settings": {}},
        },
        "order": ["main"],
    }
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    return path


def main() -> int:
    updated = []
    skipped = []
    minimal = []
    for path in sorted(ROOT.glob("*.html")):
        name = path.name
        if name in SKIP_PAGES:
            skipped.append((name, "built-in Shopify error/offline page"))
            continue
        slug = slug_from_filename(name)
        html = path.read_text(encoding="utf-8")
        main_html = extract_main(html)
        if not main_html:
            skipped.append((name, "no <main> tag"))
            continue
        styles = extract_styles(html)
        markup = liquid_safe(main_html)

        section_name = f"main-{slug}"
        section_path = write_section(slug, styles, markup)
        is_index = name in INDEX_PAGES
        template_path = write_template_json(slug, section_name, is_index)
        is_minimal = name in MINIMAL_LAYOUT_PAGES
        if is_minimal:
            minimal.append(name)
        updated.append((name, section_path.name, template_path.name))

    print(f"Migrated {len(updated)} page(s).")
    for name, sec, tpl in updated:
        flag = " [minimal layout — TODO: override layout]" if name in MINIMAL_LAYOUT_PAGES else ""
        print(f"  {name:30s} -> sections/{sec:38s}  templates/{tpl}{flag}")
    if skipped:
        print(f"\nSkipped {len(skipped)} page(s):")
        for name, why in skipped:
            print(f"  {name:30s} ({why})")
    if minimal:
        print(f"\n{len(minimal)} page(s) flagged as MINIMAL_LAYOUT (need a layout/page.layout.liquid)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
