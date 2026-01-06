# PRD 9: Design System

## Problem Statement

Tenpo is building a camp registration platform that needs to:
1. Feel premium and trustworthy ("Airbnb meets Nike")
2. Stand apart from dated sports tech competitors (TeamSnap, etc.)
3. Scale from web to React Native mobile app within 6 months

Without a design system, we risk:
- Inconsistent visual experience across screens
- Slower development as devs make ad-hoc design decisions
- Duplicate work when building the mobile app
- Brand dilution as the product grows

## Vision

Parents and camp organizers should feel like they're using a modern, premium product from the first click. The design system ensures every screen, button, and interaction reinforces that Tenpo is professional, cool, and trustworthy.

## Solution: Hybrid Approach

**Stack:**
- **Primary (95%):** shadcn/ui + Tailwind CSS 4
- **Surgical (5%):** @mui/x-data-grid (admin tables only)
- **Tokens:** Figma → Tailwind config
- **Fonts:** Host Grotesk (primary), Seriously Nostalgic (accent)

**Why this approach:**
- Public pages load fast (~30-50kb JS) → premium feel
- Full design control → matches Figma exactly
- Admin gets best-in-class DataGrid when needed
- One primary mental model (shadcn/Tailwind)

## Success Criteria

1. **Consistency** — Any two screens in Tenpo feel like they belong to the same product
2. **Speed** — Developers can build new features using existing tokens and components without design input
3. **Performance** — Public pages load < 50kb JS
4. **Cross-platform ready** — When we start React Native, we use the same design tokens (colors, fonts, spacing) without recreating them
5. **Maintainability** — Design changes propagate from Figma to Tailwind config to all components

## Scope (Sprint 2)

### In Scope
- **Tailwind Config:** All color, typography, spacing, border radius tokens from Figma
- **shadcn/ui Setup:** Initialize and customize to match brand
- **Fonts:** Host Grotesk (primary), Seriously Nostalgic (accent) — local font setup
- **Base Components:** Button, Input, Card, Badge, Alert, Dialog, Table, Tabs, Form, Toast (via shadcn)
- **MUI DataGrid Wrapper:** Styled wrapper for admin tables only
- **Icon Workflow:** Streamline HQ desktop app → SVG export → codebase

### Out of Scope (Future)
- Animation tokens
- Dark mode
- Component documentation site (Storybook)
- React Native implementation

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Tenpo App                                │
├─────────────────────────────────────────────────────────────┤
│  95% shadcn/ui + Tailwind                                   │
│  ├── All public pages (/, /camps, /camps/[id])              │
│  ├── Registration flow (/register)                          │
│  ├── Parent dashboard (/dashboard)                          │
│  ├── All forms, cards, buttons, inputs, dialogs             │
│  ├── Simple tables                                          │
│  └── Most of coach dashboard                                │
├─────────────────────────────────────────────────────────────┤
│  5% MUI (imported surgically)                               │
│  ├── DataGrid (registration rosters)                        │
│  ├── DataGrid (camp management lists)                       │
│  └── Maybe: DateRangePicker if needed                       │
└─────────────────────────────────────────────────────────────┘
```

## User Stories

**As a developer**, I want to use predefined color tokens so I don't have to guess hex values or ask for design input.

**As a developer**, I want shadcn components with standard variants so I can build forms quickly.

**As a developer**, I want MUI DataGrid available for complex admin tables with sorting, filtering, and export.

**As a future mobile developer**, I want to import the same color and typography values so the iOS app matches the web.

**As a product owner**, I want to change the primary brand color in one place and have it update everywhere.

## Brand Guidelines

| Attribute | Direction |
|-----------|-----------|
| Personality | Professional, cool, trustworthy |
| Reference | "Airbnb meets Nike" — premium UX with athletic edge |
| Primary Color | Pitch Green (#043625) |
| Typography | Host Grotesk for most UI; Seriously Nostalgic used sparingly for personality |
| Differentiation | Modern and polished vs. dated sports tech competitors |

## Bundle Size Expectations

| Route | Components Used | JS Size |
|-------|-----------------|---------|
| `/` (landing) | shadcn only | ~30-40kb |
| `/camps` (browse) | shadcn only | ~35-45kb |
| `/camps/[id]` (detail) | shadcn only | ~35-45kb |
| `/register` (checkout) | shadcn only | ~40-50kb |
| `/dashboard` (parent) | shadcn only | ~40-50kb |
| `/organizer/*` (admin) | shadcn + DataGrid | ~100-120kb |

## Dependencies

- Figma design file (source of truth for token values)
- Font files: Seriously Nostalgic (OTF), Host Grotesk (OTF)
- Streamline HQ Pro account (icons)

## Open Questions

1. Font licensing — confirm commercial web + mobile rights before launch
2. Shadow/elevation tokens — no Figma frame provided yet

## Stakeholders

| Role | Person | Responsibility |
|------|--------|----------------|
| Decision maker | You | Approves all DS changes |
| Maintainers | You + dev team | Updates tokens and components |

---

## Completion Status (Sprint 2)

### In Scope Items

| Item | Status | Notes |
|------|--------|-------|
| **Tailwind Config:** All tokens from Figma | ✅ Done | Colors, spacing, radius, typography in `globals.css` |
| **shadcn/ui Setup:** Initialize and customize | ✅ Done | 30 components installed and themed |
| **Fonts:** Host Grotesk + Seriously Nostalgic | ✅ Done | Local fonts in `src/fonts/`, configured in `layout.tsx` |
| **Base Components:** Button, Input, Card, etc. | ✅ Done | All requested components plus extras |
| **MUI DataGrid Wrapper:** Styled wrapper | ⏳ Deferred | Will implement when admin routes are built |
| **Icon Workflow:** Streamline → SVG → codebase | ✅ Done | SVGR pipeline with 100+ icons |

### Bonus Deliverables
- ✅ Design system demo page at `/ds` with all components
- ✅ Form validation integration (React Hook Form + Zod)
- ✅ Calendar component with DS styling
- ✅ Toast/Sonner notifications configured
