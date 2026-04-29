# Once Upon A Time

Static marketing site for **Once Upon A Time, Inc.** — a nonprofit arts education organization for children offering programs in dance, music, theater, and visual art.

## Pages

- `index.html` — Landing
- `about.html` — Vision, mission, leadership, programs
- `contact.html` — Contact form + FAQs
- `donate.html` — Donation flow + impact stories
- `newsletter.html` — Newsletter dashboard
- `seasonal-camps.html` — Program detail (Seasonal Camps)
- `profile.html`, `preferences.html`, `class-history.html` — Account pages

## Stack

- Plain HTML + CSS, no build step
- Shared design system at `once-upon-a-time-assets/styles/design-system.css`
- Voltra (serif) + Chivo (sans) self-hosted
- [Phosphor Icons 2.1](https://phosphoricons.com) via unpkg CDN
- Sign-in / sign-up modal at `once-upon-a-time-assets/styles/auth-modal.{css,js}` (self-injecting; trigger with `data-open-signin` / `data-open-signup` on any button)

## Design tokens

| Token | Value |
| --- | --- |
| Rose | `#8B5044` |
| Garden | `#6B6D20` |
| Pillar | `#4C2F3B` |
| Sky | `#E2F6FE` |
| Blush | `#E5AA9C` |
| Beginning | `#FFF5EE` |
| Snow | `#FFFCFA` |
| Black 900 | `#262422` |

## Local preview

```sh
open index.html
```

Or serve with a local HTTP server (recommended for relative paths):

```sh
python3 -m http.server 8080
# visit http://localhost:8080
```
