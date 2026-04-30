# Contributing

Thanks for helping with the OUAT site. This is a static HTML/CSS/JS demo intended to ship to Shopify in production. The repo is organized so the static demo and the Shopify theme stay in sync.

## Structure

```
Once-Upon-A-Time/
├── *.html                       # 49 standalone pages (static demo)
├── once-upon-a-time-assets/
│   ├── styles/
│   │   ├── design-system.css    # tokens + base layout + responsive
│   │   ├── components.css       # modal, toast, skeleton, dropdown, banner, etc.
│   │   ├── auth-modal.css       # auth modal injected on all pages
│   │   └── auth-modal.html      # the modal markup (paste-ready)
│   ├── auth-modal.js            # opens / switches login ↔ signup
│   ├── site.js                  # nav toggle, sticky header, promo dismiss, forms
│   ├── mock-system.js           # toast, data-mock, bookmarks, share, FAQ,
│   │                            #   cookie banner, settings dropdown,
│   │                            #   confirm modal, header search, dark mode,
│   │                            #   breadcrumbs, lightbox, carousel auto-rotate
│   ├── fonts/                   # Voltra (display serif) + Chivo (body)
│   ├── img/, landing/, about/, portraits/, contact/  # photography
│   ├── logo/, favicon/          # brand
│   └── phosphor/                # icon font (regular weight)
├── emails/                      # 20 transactional email templates (table-based)
├── shopify-theme/               # ready-to-deploy Shopify 2.0 theme
│   ├── assets/                  # CSS + JS + fonts + images (flat per Shopify rule)
│   ├── config/                  # settings_schema, settings_data
│   ├── layout/theme.liquid      # wraps every page
│   ├── locales/en.default.json
│   ├── sections/                # rich-text, hero-card, donor-spotlight, etc.
│   ├── snippets/                # meta-tags, json-ld
│   └── templates/
│       ├── page.{handle}.json   # 18+ page templates wired to sections
│       ├── customers/           # login, register, account, order, addresses
│       └── *.liquid             # search, blog, article, collection, product, list-collections
├── sitemap.xml                  # 20 public URLs
├── robots.txt                   # disallow account/transactional pages
└── .nojekyll                    # GitHub Pages: skip Jekyll processing
```

## How interaction works

Every interactive element does *something* in the static demo:

| Pattern | What it does |
|---|---|
| `data-mock="<feature>"` | Toasts a message explaining the Shopify integration |
| `data-mock-toast="<custom>"` | Override toast message |
| `data-bookmark="<id>"` | Toggles localStorage bookmark + visual state |
| `data-share` | Web Share API or clipboard fallback |
| `data-faq` + `aria-controls` | Accordion toggle (also `<details>` works natively) |
| `data-confirm` + `data-confirm-body` + `data-confirm-cta` + `data-confirm-danger="true"` + `data-confirm-action="mock:foo"` or `data-confirm-action="<url>"` | Spawns confirmation modal |
| `data-theme-toggle` | Switch light/dark mode (persisted) |
| `data-lightbox` | Open image in lightbox overlay |
| `OUAT_toast(msg, {variant: 'info'\|'success'\|'warning'\|'mock', duration: 3500})` | Programmatic toast |
| `OUAT_setFieldError(input, msg)` | Field-level error indicator |
| `OUAT_confirm({title, body, cta, danger, onConfirm})` | Programmatic confirm modal |
| `OUAT_setTheme('light'\|'dark')` | Programmatic theme |
| `OUAT_ls.has/add/remove/toggle(key, val)` | localStorage list helpers |

## Adding a new page

1. Build `<slug>.html` at the repo root, copying the head/header/footer pattern from any existing page.
2. Include `mock-system.js`, `design-system.css`, `components.css`, `auth-modal.css`.
3. Add the URL to `sitemap.xml` (or `robots.txt` if private).
4. Add the Shopify equivalent at `shopify-theme/templates/page.<slug>.json` using existing sections, or write a new section under `shopify-theme/sections/`.
5. If the page should appear in nav, add to the `primary-nav` link list and the footer `Get Involved` / `About` columns.

## Style guide

The site has a live style guide at `/styleguide.html` showing every component and token in use.

## Deploying to Shopify

See `shopify-theme/README.md` — TL;DR:

```sh
cd shopify-theme
shopify theme push --store yourstore.myshopify.com --unpublished
```

Then in Shopify admin:
- **Online Store → Pages**: create pages with handles matching `page.<handle>.json` (about, contact, donate, programs, events, instructors, gallery, donor-wall, impact-report, scholarship, sponsorship, gift-donation, volunteer, press, partners, jobs, board, privacy, terms, accessibility).
- **Online Store → Navigation**: link `main-menu`, `footer`, `footer-secondary`.
- **Settings → Apps**: install Sesami (class booking), ShoppingGives or Givebutter (donations), Klaviyo (email), Judge.me (reviews) as needed.
- **Settings → Checkout**: configure tax-deductible donation receipts.

## Local dev

```sh
cd /path/to/Once-Upon-A-Time
python3 -m http.server 8000
# Open http://localhost:8000/
```

## Accessibility

Target is WCAG 2.1 Level AA. The `/accessibility.html` page documents commitments. See the `prefers-reduced-motion` block in `design-system.css` and skip links on every page.

## Tests

There are no automated tests yet. Smoke checks:

```sh
# 1. Every interactive element responds (no broken anchors)
# Open /styleguide.html and click each component.

# 2. Sitemap URLs are reachable
xmllint --xpath "//*[local-name()='loc']/text()" sitemap.xml \
  | xargs -I{} curl -s -o /dev/null -w "{}: %{http_code}\n" {}

# 3. JSON-LD validates
# Use https://search.google.com/test/rich-results
```

## Contact

Questions? Open an issue or reach `contact@onceuponatime.org`.
