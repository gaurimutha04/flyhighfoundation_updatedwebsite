# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the site

No build step. Open any `.html` file directly in a browser, or use a local server:

```
npx serve .
# or
python3 -m http.server
```

## Architecture

Pure static site — HTML + CSS + vanilla JS, no framework, no bundler, no dependencies.

**File roles:**
- `styles.css` — global design tokens and all shared components (header, hero, buttons, footer, modals, scroll-reveal, sticky notes, marquee). Every page imports this.
- `site.js` — shared runtime: mobile nav toggle, scroll-reveal observer, pencil underline, video embed, footer marquee, media modal, and the mission-section confetti. Runs on `DOMContentLoaded`.
- `chalk-cursor.js` — canvas-based chalk drawing effect for the hero on `index.html` only.
- `team.css` / `team.js` — team page only. `team.js` is wrapped in an IIFE and runs immediately (no `DOMContentLoaded` wrapper needed since the script tag is at the bottom of `team.html`).

## Design tokens

All colors, fonts, and layout values live in `:root` in `styles.css`. Always use the CSS variables rather than raw values:

| Token | Value | Use |
|---|---|---|
| `--slate-deep` | `#16313f` | Dark backgrounds, blackboard |
| `--paper` | `#faf7f0` | Light page background |
| `--accent` | `#f0c14b` | Primary yellow accent |
| `--accent-deep` | `#c99a2e` | Accent on light backgrounds (contrast) |
| `--font-display` | Fraunces | Headings, quotes |
| `--font-body` | Inter | Body text |
| `--header-h` | `84px` | Fixed header height; used in `padding-top` calculations |

## Team page data

`team.js` holds the `TEAM` array — the single source of truth for all member data. It drives:
1. The crawlable HTML grid (built by JS into `#team-grid-content`)
2. The scrapbook card modal (each member has a `card` path pointing to `images/team-cards/`)
3. The JSON-LD structured data injected into `<head>`

Each member object: `{ batch, name, role, fact, memory, photo, card }`. Batches are `'Founding Team'`, `'Batch 2'`, `'Batch 3'`.

## Modals

Two modal patterns exist, both using the same `.is-open` / `aria-hidden` toggle approach:
- **Team card modal** (`#team-card-modal`) — in `team.html` + `team.js`, shows the full scrapbook card image.
- **Media modal** (`#media-modal`) — in `index.html` + `site.js`, shows press feature content.

Both close on backdrop click, close button click, or `Escape` key.

## Scroll reveal

Add `data-reveal` to any element and `site.js` will fade/slide it in when it enters the viewport. Use `data-reveal="stagger"` on a container to stagger its direct children.

## Phone-first priority

**~90% of visitors access this site on a phone.** Every feature, layout, and interaction must work well on mobile before desktop. When building anything new:
- Design and test the mobile view first, then adapt for desktop
- Touch targets must be large enough to tap (minimum ~44px)
- Audio must not rely on page-load autoplay — iOS Safari blocks it; always trigger sound on a user gesture (tap/click) on the current page
- Avoid hover-only interactions; anything hover-based needs a tap equivalent
- Test modals, grids, and animations at 375px–430px width (common iPhone sizes)

## Responsive breakpoints

- `980px` — nav collapses to hamburger menu
- `640px` — single-column layouts, reduced padding
