# Palette Options Demo Page

## Overview

A static demo page showing a camp detail view with three swappable color palettes. Located at `/palette-options`.

## Purpose

1. **Visual Preview** - Shows what the actual Tenpo camp listing page would look like
2. **Palette Comparison** - Allows toggling between 3 color schemes to evaluate which works best for the brand

## The Three Palettes

| Palette | Primary | Accent | Accent-2 | Header Logo | Footer Logo |
|---------|---------|--------|----------|-------------|-------------|
| **Pitch Green** (default) | `#043625` Pitch Green | `#0B1E3C` Midnight | `#392F36` Carbon | wordmark-chalk | wordmark-pitch-green |
| **Midnight** | `#0B1E3C` Midnight | `#043625` Pitch Green | `#392F36` Carbon | wordmark-chalk | wordmark-midnight |
| **Carbon** | `#392F36` Carbon | `#043625` Pitch Green | `#0B1E3C` Midnight | wordmark-chalk | wordmark-carbon |

## Color Distribution

Colors are distributed throughout the page to showcase all three palette colors:

### Primary Color Usage
- Main CTA buttons (Register Now)
- Sport type badge
- Section titles: "About This Camp", "Daily Schedule", "Policies", "Reviews"
- Quick stats icon (Calendar, Location)
- Head coach role label
- Price display

### Accent Color Usage
- Verified badge
- Academy rating badge
- Section titles: "Location", "FAQ"
- Quick stats icon (Clock)
- Schedule time labels (alternating)
- Safety checkmarks
- Similar camps sport badges (alternating)

### Accent-2 Color Usage
- Difficulty badge ("Intermediate")
- Academy avatar background
- Section titles: "What's Included", "Similar Camps"
- Quick stats icon (Users)
- Schedule time labels (alternating)
- Assistant coach role label
- Similar camps sport badges (alternating)
- Map placeholder icon

## Page Structure

```
Palette Toggle Bar (sticky)
Header (wordmark logo, nav, search, login/signup)
Breadcrumb
Hero Section (Unsplash image gallery with thumbnails)
Two-Column Layout:
  Left: Quick Stats, Description, Schedule, Location, Included, Policies
  Right (sticky): Booking Card, Academy Info, Coaches, Safety
Reviews Section (ratings, distribution, cards with helpful buttons)
FAQ Accordion
Similar Camps Carousel (with Unsplash images)
Footer (wordmark logo)
Back-to-Top Button
Mobile Sticky Action Bar
```

## Interactive Elements (All Static/Client-Only)

- **Palette toggle** - Switches colors and logos instantly
- **Image gallery** - Click thumbnails to swap main image (real Unsplash photos)
- **Save button** - Toggles heart icon state
- **Helpful counters** - Increment on click
- **Accordion** - FAQ expand/collapse
- **Carousel** - Horizontal scroll with arrow buttons
- **Back-to-top** - Appears after 500px scroll

## Technical Implementation

### Color Theming

Colors are passed via CSS custom properties set as inline styles on the root container:

```tsx
const themeStyles = {
  "--theme-primary": palette.primary,
  "--theme-primary-foreground": palette.primaryForeground,
  // ...
} as React.CSSProperties
```

Components use inline `style` props for dynamic colors:

```tsx
style={{ backgroundColor: palette.primary }}
```

### State Management

All state is local React state. No backend calls. On page refresh, everything resets to defaults.

## What Was Changed

### Files Modified

1. **`next.config.ts`** - Added Unsplash to `images.remotePatterns` for external images

### Files Created

1. `src/app/palette-options/page.tsx` - The demo page (~1100 lines)
2. `docs/palette-options-demo.md` - This documentation

### UI Components

No UI components were modified.

### Packages

No packages were installed.

## Images

All images use Unsplash URLs:
- Hero gallery: 5 soccer/sports camp images
- Similar camps: 4 different camp activity images
- Coach avatars: 2 professional headshots

## Known Limitations

- Map is a placeholder div (not an actual map integration)
- No actual booking/registration flow
- Mobile sticky bar may overlap content on very short viewports
- External Unsplash images require network access

## Usage

```bash
# Dev server
yarn dev

# Navigate to
http://localhost:3000/palette-options
```

Use the toggle bar at the top to switch between palettes and see how the entire page adapts.

## Recommendations

After reviewing all three palettes:

1. **Pitch Green Primary** - Strongest brand identity, most distinctive, best contrast
2. **Midnight Primary** - Professional, corporate feel, slightly less energetic
3. **Carbon Primary** - Softer, warmer tone, more neutral

The default Pitch Green aligns best with the established brand identity and provides the most visual differentiation from competitors.
