# PUBG Mobile Shop UI Style Guide

## Purpose
This document captures the visual system derived from [generated-page.html](/D:/Project%20Code%20Kiem%20Tien/shop%20acc%20pubgm/generated-page.html). Any future AI or developer should use this as the source of truth when extending the storefront.

## Design Intent
- Build a high-energy gaming storefront with bold shapes, dramatic contrast, and playful motion.
- Keep the interface commercial and readable, but never generic or minimalist.
- Make the page feel like a premium "battle-ready" catalog rather than a plain e-commerce grid.

## Core Visual DNA
- Angular cards, skewed wrappers, clipped corners, layered blocks.
- Hard shadows instead of soft floating SaaS shadows.
- High-contrast color blocking with black, off-white, red, and military-accent greens/yellows.
- Decorative stripes, radial glow fields, halftone-like textures, and oversized background labels.
- Typography should feel assertive and game-like, with loud headings and clean readable body copy.

## Palette

### Primary Colors
- `#101317` for deep base backgrounds.
- `#181d22` for secondary dark surfaces.
- `#f4efe6` for light panels and contrast blocks.
- `#d4352f` for main action color.
- `#ffcc33` for alert or promo highlights.
- `#7dd35c` for PUBG-inspired accent moments.

### Support Colors
- `#8b949e` for muted text.
- `#252b33` for borders and separators on dark surfaces.
- `#ffffff` for strong text on dark blocks.
- `#0c0f12` for the darkest edges and hard-shadow layers.

## Typography
- Headings: use a condensed, punchy display face.
- Body: use a neutral sans that stays readable in dense product grids.
- Suggested stack for implementation:
  - Heading: `Bebas Neue`
  - Body/UI: `Barlow`
- Headings should be uppercase or near-uppercase in major hero and section labels.
- Use tight tracking on display headlines and medium/strong weight on labels.

## Shape Language
- Prefer skewed wrappers, clipped corners, slanted CTA plates, and offset backing layers.
- Rectangles should rarely be perfectly calm. Add at least one of:
  - rotation
  - skew
  - clipped edge
  - offset shadow plate
- Keep shapes intentional. Too many random rotations reduce trust.

## Layout Rules
- The page should feel stacked like editorial panels, not flat sections.
- Alternate between dark sections and light contrast bands.
- Use strong section intros with badge + headline + short supporting paragraph.
- Product rows should feel like inventory selection inside a game hub.

## Motion Rules
- Motion should be short and punchy: `180ms` to `280ms`.
- Hover states can translate, rotate slightly, or change border/background color.
- Avoid floaty scale-heavy animations that make the shop feel cheap.
- Respect `prefers-reduced-motion`.

## Texture And Effects
- Use subtle grid, radial glow, halftone, and scanline-inspired overlays.
- Use hard shadows like `6px 6px 0` or `8px 8px 0`, not soft blur-only cards.
- Use large background words sparingly for atmosphere.

## Components

### Navbar
- Floating or visually separated from the background.
- Logo should feel stamped, sharp, and bold.
- Menu items should read like action tabs, not plain text links.

### Hero
- Needs one dominant headline, one supporting paragraph, one primary CTA, one secondary CTA.
- Pair text block with a highly stylized showcase panel on desktop.
- Include quick trust metrics or inventory stats near the fold.

### Product Cards
- Use bold rank or tag chips such as `HOT`, `MYTHIC`, `UC BONUS`, `LIMITED`.
- Show key account data clearly:
  - level
  - skins
  - outfits
  - upgrade guns
  - price
- CTA should feel transactional and energetic, not generic.

### Section Headers
- Use a small badge line first.
- Follow with a large headline and a short 1 to 2 sentence description.
- Optional accent underline or rotated label block is encouraged.

## Content Tone
- Competitive, premium, energetic.
- Avoid childish slang overload.
- Use short, punchy lines that sound like a curated gaming marketplace.
- Good phrasing themes:
  - ready to deploy
  - rare loadout
  - ranked-ready inventory
  - handpicked account vault
  - battle-proven collection

## Anti-Patterns
- Do not switch to generic startup gradients and glassmorphism.
- Do not use purple-heavy cyberpunk styling unless a later page explicitly needs it.
- Do not use rounded, soft, friendly SaaS cards as the dominant pattern.
- Do not bury price and product stats.
- Do not let decoration overpower readability.

## Homepage Section Order
1. Header / navigation
2. Hero
3. Featured accounts
4. Explore all accounts
5. Closing CTA / trust strip

## Responsive Notes
- Mobile should keep the same attitude, but simplify the angular complexity.
- Large hero art can collapse into stacked stat cards.
- Product cards should remain scan-friendly at small widths.

## Implementation Notes
- Centralize colors and spacing as CSS variables in global styles.
- Keep reusable utility classes for:
  - panel backing layers
  - clipped cards
  - badge pills
  - hard shadows
  - textured overlays
- New pages should reuse the same variables and component language instead of inventing a new theme.
