# Once Upon A Time — Shopify Theme

A custom Shopify 2.0 theme built from the Once Upon A Time static site, ready to deploy to a Shopify store.

## Theme structure

```
shopify-theme/
├── assets/                 # All CSS, JS, fonts, images, icons (flat — Shopify convention)
│   ├── design-system.css   # Voltra/Chivo tokens, layout, typography, buttons
│   ├── auth-modal.css/.js  # Sign-in/sign-up modal (self-injecting)
│   ├── phosphor.css        # Icon stylesheet (font-face is in theme.liquid)
│   ├── site.js             # Mobile nav, sticky header, promo dismiss, form handlers
│   ├── Voltra-Normal.ttf   # Display serif
│   ├── Chivo-Variable.ttf  # Body sans
│   ├── Chivo-Italic-Variable.ttf
│   ├── Phosphor.woff2/.woff/.ttf  # Icon font (regular weight)
│   ├── logo-*.png          # Brand marks
│   ├── landing-*.jpg       # Hero / section photos
│   └── portrait-*.png      # Person headshots (testimonials, instructors)
├── config/
│   ├── settings_schema.json    # Theme editor controls (brand name, address, contact)
│   └── settings_data.json
├── layout/
│   └── theme.liquid        # Wraps every page (head, header, footer, font @font-face)
├── locales/
│   └── en.default.json
├── sections/
│   ├── header.liquid           # Top nav with cart, settings, avatar, sign-in
│   ├── footer.liquid           # 4-col footer with link blocks
│   ├── promo-bar.liquid        # Dismissable announcement bar (with localStorage)
│   ├── hero-card.liquid        # Landing hero (white card on rose-100)
│   ├── donor-spotlight.liquid  # Skyline-bg band with stats + testimonials
│   ├── feature-grid.liquid     # 3-up icon + title + body grid
│   ├── rich-text.liquid        # Generic eyebrow + heading + body
│   ├── contact-form.liquid     # Hero rhombus + form using {% form 'contact' %}
│   └── page-content.liquid     # Default page wrap that renders {{ page.content }}
├── snippets/
│   ├── meta-tags.liquid    # Open Graph + Twitter Card tags
│   └── json-ld.liquid      # NGO / Organization structured data
└── templates/
    ├── index.json          # Homepage section composition (hero + who + donor + mission)
    ├── page.json           # Default page (uses page-content section)
    ├── page.about.json     # About page (vision + values)
    ├── page.contact.json   # Contact page (full form section)
    ├── 404.liquid          # Not-found
    ├── cart.liquid         # Cart drawer/page
    └── customers/login.liquid
```

## Deploy in 3 minutes

### Option A — Shopify CLI (recommended)

```sh
# Install once
brew install shopify-cli

# From the shopify-theme/ folder
cd shopify-theme

# Connect to a store (will open browser to authenticate)
shopify theme dev --store yourstore.myshopify.com

# Or push directly to a development theme
shopify theme push --store yourstore.myshopify.com --unpublished
```

The CLI will validate the theme and watch for changes during `theme dev`.

### Option B — Drag-and-drop in admin

1. ZIP the contents of `shopify-theme/`:
   ```sh
   cd shopify-theme && zip -r ../once-upon-a-time-theme.zip .
   ```
2. In Shopify admin → **Online Store → Themes → Add theme → Upload zip file**
3. Customize content in **Theme editor** (the `index.json` template gives you a fully composed homepage you can rearrange)

## Post-deploy admin steps

In Shopify admin:

1. **Online Store → Pages** — Create pages with these handles so the templates auto-route:
   - Handle `about` → uses `templates/page.about.json`
   - Handle `contact` → uses `templates/page.contact.json`
   - Handle `donate` → uses `templates/page.donate.json` (create from page.about.json template)
   - Handle `newsletter` → uses `templates/page.newsletter.json` (create as needed)

2. **Online Store → Navigation** — Create:
   - `main-menu` (used by header) — links: About Us → /pages/about, Programs → /collections/programs, Donation → /pages/donate, Newsletter → /pages/newsletter, Contact → /pages/contact
   - `footer` (used by footer About column)
   - `footer-secondary` (used by footer Get Involved column)

3. **Online Store → Themes → Customize** — Adjust:
   - Brand settings (legal name, address, contact phone/email)
   - Footer social URLs (YouTube, Facebook, Twitter, Instagram)
   - Promo bar copy
   - Homepage section composition

4. **Settings → Checkout** — Add donation product or wire to a donations app (e.g. ShoppingGives, Round Up Donations, etc.). For class signup, use product variants with date options or install Sesami / BookThatApp.

## What's wired vs what needs Shopify-specific work

✅ Already wired:
- All CSS/JS from the static site
- Voltra + Chivo + Phosphor fonts via `{{ 'name.ttf' | asset_url }}` in theme.liquid
- Mobile nav toggle, sticky header, promo dismiss, form validation in site.js
- SEO meta + OpenGraph + Twitter + JSON-LD via snippets
- Logged-in/out customer states in header (`{% if customer %}`)
- Cart count badge using `{{ cart.item_count }}`
- Contact form using Shopify's built-in `{% form 'contact' %}`
- Login template using `{% form 'customer_login' %}`

⚠️ Needs Shopify-specific implementation when ready:
- **Donations** — currently the donate.html is static. In Shopify: either use a Donations app, or create products at price points ($25, $50, $100, custom) — donate.html template can be turned into a product collection page.
- **Class signup / camp registration** — convert programs (Seasonal Camps, Private Lessons) to Shopify products. The seasonal-camps.html / private-lessons.html templates become `templates/product.seasonal-camps.json` etc.
- **Newsletter article** — the newsletter dashboard currently shows a hardcoded "Once Upon A Time" article. In Shopify, create a Blog called "Newsletter" and use `templates/blog.newsletter.json` + `templates/article.liquid`. The newsletter dashboard then iterates `blog.articles`.
- **User profile / preferences / class history** — convert to Shopify customer account templates: `templates/customers/account.liquid`, `templates/customers/order.liquid`. Class history maps to order history.

## Source

The static-site source for this theme is at: https://github.com/jerickevans-gif/Once-Upon-A-Time
