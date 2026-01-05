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

## Success Criteria

1. **Consistency** — Any two screens in Tenpo feel like they belong to the same product
2. **Speed** — Developers can build new features using existing tokens and components without design input
3. **Cross-platform ready** — When we start React Native, we use the same design tokens (colors, fonts, spacing) without recreating them
4. **Maintainability** — Design changes propagate from one source file to all platforms

## Scope (Sprint 2)

### In Scope
- Design tokens: colors, typography, spacing, border radius, shadows
- Token build pipeline: JSON source → web + React Native outputs
- Font files: Host Grotesk (primary), Seriously Nostalgic (accent)
- Icon workflow: Streamline HQ desktop app → SVG export → codebase
- Base UI components: Button, Input, Card, Badge
- Layout components: AppShell, DashboardLayout, MarketingLayout, AuthLayout

### Out of Scope (Future)
- Complex components (tables, modals, date pickers)
- Animation tokens
- Dark mode
- Component documentation site (Storybook)

## User Stories

**As a developer**, I want to use predefined color tokens so I don't have to guess hex values or ask for design input.

**As a developer**, I want a button component with standard variants so I can build forms quickly.

**As a future mobile developer**, I want to import the same color and typography values so the iOS app matches the web.

**As a product owner**, I want to change the primary brand color in one place and have it update everywhere.

## Brand Guidelines

| Attribute | Direction |
|-----------|-----------|
| Personality | Professional, cool, trustworthy |
| Reference | "Airbnb meets Nike" — premium UX with athletic edge |
| Typography | Host Grotesk for most UI; Seriously Nostalgic used sparingly for personality |
| Differentiation | Modern and polished vs. dated sports tech competitors |

## Dependencies

- Figma design file (source of truth for token values)
- Font files: Seriously Nostalgic (OTF), Host Grotesk (OTF)
- Streamline HQ Pro account (icons)

## Open Questions

1. Font licensing — confirm commercial web + mobile rights before launch
2. Specific icon set — TBD as features are built

## Stakeholders

| Role | Person | Responsibility |
|------|--------|----------------|
| Decision maker | You | Approves all DS changes |
| Maintainers | You + dev team | Updates tokens and components |
