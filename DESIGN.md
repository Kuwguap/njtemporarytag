# NJ Temporary Tag — Design System Summary

## Overview

A distinctive, non-generic visual identity for a temporary vehicle tag e-commerce site. Editorial, trustworthy, and conversion-focused.

---

## Typography

| Role    | Font           | Usage                          |
|---------|----------------|--------------------------------|
| Display | **Syne**       | Headlines, CTAs, nav, branding |
| Body    | **Source Sans 3** | Body copy, labels, descriptions |

- **Syne** (400–800): Strong, geometric display font. Used for impact headlines and key UI.
- **Source Sans 3** (400–700): Legible, friendly body text with excellent readability.
- Font features: `ss01`, `ss02`, `cv01`, `cv02` for refined glyphs.

---

## Color Palette

| Token   | Hex       | Usage                                |
|---------|-----------|--------------------------------------|
| **ink-950** | `#0a0a09` | Dark backgrounds, hero sections      |
| **ink-900** | `#141412` | Secondary dark                       |
| **ink-800** | `#1c1b18` | Body text                             |
| **ink-600** | `#45433c` | Muted text                            |
| **ink-200** | `#d4d1c4` | Borders, dividers                     |
| **ink-100** | `#f5f3eb` | Light backgrounds                    |
| **ink-50**  | `#faf9f5` | Soft whites, cards                   |
| **amber**   | `#c4953a` | Primary accent, CTAs, highlights      |
| **amber-light** | `#e4b75d` | Hover states                     |
| **amber-dark**  | `#8b6a23` | Badges, labels                    |
| **mint** | `#4a9b7f` | Optional secondary accent            |

No generic teal/purple gradients. Warm amber against warm neutrals for an automotive, premium feel.

---

## Spacing & Layout

- **Section padding:** `py-16` mobile, `py-20` sm, `py-24` lg; `px-4` → `px-6` → `px-8`
- **Container narrow:** `max-w-5xl` for content-focused sections (hero, FAQ, pricing)
- **Container wide:** `max-w-7xl` for grids and full-width layouts
- **Border radius:** `rounded-2xl` / `rounded-3xl` for cards and buttons
- **Touch targets:** Minimum 44×44px for buttons (mobile-first)

---

## Components

### Buttons

- **Primary (`btn-primary`):** Amber bg, ink-950 text. Hover: scale 1.02, lighter amber.
- **Secondary (`btn-secondary`):** Border outline, transparent bg. Hover: amber border/text. Use on light backgrounds.
- **Secondary Dark (`btn-secondary-dark`):** Light border and text for dark backgrounds. Hover: amber border/text.
- Min height/width 44px for accessibility.

### Cards

- White or ink-50 bg, ink-200 borders
- Hover: border-amber/40, subtle shadow
- Rounded-3xl

### Trust Elements

- Icons + text in a horizontal strip
- Amber icons for consistency
- Full-width, centered layout

### FAQ Accordion

- One open at a time
- Chevron rotation for state
- Smooth expand/collapse

---

## Motion

- **Transitions:** 200–300ms for hover states
- **Focus:** 2px amber outline with offset
- **Animations:** Optional fade-up for hero (0.6s ease-out)
- **Performance:** No heavy animations; CSS-only transitions preferred.

---

## Mobile-First & Performance

- Responsive breakpoints: sm (640px), md (768px), lg (1024px)
- Images: `loading="lazy"`, `decoding="async"` on below-fold content
- Fonts: Preconnect to Google Fonts; `font-display: swap`
- Minimal JS: No heavy animation libraries

---

## Section Hierarchy (Landing)

1. Trust bar (strip)
2. Hero (dark, amber accent)
3. Benefits (6-card grid)
4. Delivery options (2 cards)
5. Stats (3 metrics, dark bg)
6. How It Works (3 steps)
7. Testimonials (3 cards)
8. Pricing (single card)
9. Services grid (dynamic)
10. FAQ (accordion)
11. Final CTA (dark strip)
12. Footer (4 columns)

---

## Distinctive Choices

- **No generic gradients** — solid colors, subtle radial glow in hero only
- **Editorial hierarchy** — strong headlines, generous whitespace
- **Warm palette** — amber + ink instead of cold teals
- **Bold typography** — Syne for strong brand presence
- **Touch-first** — adequate spacing and tap targets on mobile
