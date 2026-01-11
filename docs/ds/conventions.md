# Tenpo Design System Conventions

This document defines the design conventions extracted from Figma. All implementations must follow these specifications.

---

## Buttons

### Variants

| Variant | Light Mode | Dark Mode |
|---------|------------|-----------|
| **Primary** | `bg-primary text-primary-foreground` | `bg-primary text-primary-foreground` |
| **Secondary** | `border-secondary bg-secondary/50` (Day, outlined + 50% fill) | Dark gray bg, light text |
| **Tertiary** | `border-tertiary bg-tertiary/50` (Cloud Blue, outlined + 50% fill) | Dark bg, lighter border, light text |
| **Text Only (Ghost)** | `text-primary` (Pitch Green, no background) | `text-primary` (no background) |
| **Icon Only** | Same as above variants, square aspect | Same as above variants |

### Button Colors

| Variant | Border | Background | Hex Values |
|---------|--------|------------|------------|
| **Primary** | None | `bg-primary` (solid) | Pitch Green `#043625` |
| **Secondary** | `border-secondary` (full) | `bg-secondary/50` (50% opacity) | Day `#EBE3C6` |
| **Tertiary** | `border-tertiary` (full) | `bg-tertiary/50` (50% opacity) | Cloud Blue `#DEEBFF` |

### Sizes

| Size | Usage |
|------|-------|
| **Default** | Standard buttons |
| **Small** | Compact UI, secondary actions |

### Shape

- **All buttons are pill-shaped** (`rounded-full`)
- No square or slightly rounded buttons

### Icons

- Optional arrow icons on start and end (← text →)
- Icon Start = Hide/Show
- Icon End = Hide/Show
- When hidden, button shows text only

### Interactions

| State | Primary/Ghost | Secondary/Tertiary |
|-------|---------------|-------------------|
| **Hover** | `hover:opacity-90` | `hover:bg-secondary` / `hover:bg-tertiary` (50% → 100%) |
| **Keyboard Focus** | `focus-visible:ring-ring` (orange stroke) | Same |
| **Disabled** | `disabled:opacity-50 disabled:pointer-events-none` | Same |

### Button Pairing in Dialogs

- **Cancel**: Uses `variant="secondary"` (cream bg)
- **Continue/Confirm**: Uses `variant="default"` (primary green bg)
- Cancel always on left, Primary action on right

---

## Corner Radius

| Token | Value | Tailwind Class |
|-------|-------|----------------|
| **Small** | 12px | `rounded-sm` |
| **Medium** | 24px | `rounded-md` |
| **Large** | 32px | `rounded-lg` |
| **Extra Large** | 36px | `rounded-xl` |
| **2X Large** | 40px | `rounded-2xl` |
| **Full** | 9999px | `rounded-full` |

Note: These are intentionally larger than typical designs for a soft, rounded aesthetic.

---

## Spacing

8px base unit with 8 levels:

| Token | Value | Tailwind Class |
|-------|-------|----------------|
| Spacing 1 | 8px | `p-2`, `m-2`, `gap-2` |
| Spacing 2 | 16px | `p-4`, `m-4`, `gap-4` |
| Spacing 3 | 24px | `p-6`, `m-6`, `gap-6` |
| Spacing 4 | 32px | `p-8`, `m-8`, `gap-8` |
| Spacing 5 | 40px | `p-10`, `m-10`, `gap-10` |
| Spacing 6 | 48px | `p-12`, `m-12`, `gap-12` |
| Spacing 7 | 56px | `p-14`, `m-14`, `gap-14` |
| Spacing 8 | 64px | `p-16`, `m-16`, `gap-16` |

Use spacing tokens for all padding, margins, and gaps.

---

## Typography

### Host Grotesk (Primary Font)

| Style | Class | Usage |
|-------|-------|-------|
| h1 | `text-h1` | Hero headlines |
| h2 | `text-h2` | Section headlines |
| h3 | `text-h3` | Sub-section headlines |
| h4 | `text-h4` | Card titles, dialogs |
| h5 | `text-h5` | Small titles |
| h6 | `text-h6` | Labels, emphasis |
| subtitle1 | `text-subtitle1` | Subtitles |
| subtitle2 | `text-subtitle2` | Small subtitles |
| body1 | `text-body1` | Body text |
| body2 | `text-body2` | Secondary body text |
| caption | `text-caption` | Labels, metadata |
| overline | `text-overline` | Uppercase labels |

Kerning and leading are coded into each style.

### Seriously Nostalgic (Display Font)

| Style | Class | Usage |
|-------|-------|-------|
| h1 | `font-display text-h1` | Hero headlines, brand moments |
| h2 | `font-display text-h2` | Section headlines, brand moments |

Use sparingly for personality and brand expression.

---

## Alerts

### Structure

```
┌─────────────────────────────────────┐
│ [Icon]  {Title}                     │
│         {Description} (80% opacity) │
└─────────────────────────────────────┘
```

- Icon on left, vertically centered
- Title in foreground color
- Description at 80% opacity (`/80` modifier)
- No visible border
- Rounded corners (`rounded-lg`)

### Alert Types

| Type | Background | Icon | Text |
|------|------------|------|------|
| **Warning** | `bg-warning-muted` | `text-warning` | `text-warning-foreground` |
| **Success** | `bg-success-muted` | `text-success` | `text-success-foreground` |
| **Error** | `bg-error-muted` | `text-error` | `text-error-foreground` |
| **Info** | `bg-info-muted` | `text-info` | `text-info-foreground` |

### Description Opacity

```tsx
<p className="text-warning-foreground/80">Description text</p>
```

### Alert Icons

| Type | Icon |
|------|------|
| Warning | Triangle with exclamation |
| Success | Circle with checkmark |
| Error | Circle with exclamation |
| Info | Circle with "i" |

---

## Dialogs / Modals

### Structure

- Title (`text-h4` or `text-h5`)
- Description text (`text-muted-foreground`)
- Action buttons aligned right
- Optional decorative curved line background

### Button Arrangement

```
                    [Cancel]  [Continue]
```

- Cancel: `<Button variant="secondary">`
- Continue: `<Button>` (default/primary)
- Gap between buttons: `gap-3`

### Variants

| Variant | Usage |
|---------|-------|
| **Compact** | Floating confirmations, tooltips |
| **Full** | Modal dialogs, forms |

---

## Color Usage

### Functional Colors (Use These)

| Token | CSS Variable | Usage |
|-------|--------------|-------|
| Background | `bg-background` | Page backgrounds |
| Foreground | `text-foreground` | Primary text |
| Primary | `bg-primary` | Primary buttons, links, accents |
| Primary Foreground | `text-primary-foreground` | Text on primary |
| Secondary | `bg-secondary` / `bg-secondary/50` | Secondary buttons (Day - cream/yellow) |
| Secondary Foreground | `text-secondary-foreground` | Text on secondary |
| Tertiary | `bg-tertiary` / `bg-tertiary/50` | Tertiary buttons (Cloud Blue) |
| Tertiary Foreground | `text-tertiary-foreground` | Text on tertiary |
| Muted | `bg-muted` | Subtle backgrounds |
| Muted Foreground | `text-muted-foreground` | Subtle text |
| Accent | `bg-accent` | Highlights |
| Destructive | `bg-destructive` | Delete, errors |
| Border | `border-border` | Borders, dividers |
| Ring | `ring-ring` | Focus rings (orange) |
| Card | `bg-card` | Card backgrounds |

### Status Colors

| Status | Main | Foreground | Muted Background |
|--------|------|------------|------------------|
| Warning | `text-warning` | `text-warning-foreground` | `bg-warning-muted` |
| Success | `text-success` | `text-success-foreground` | `bg-success-muted` |
| Error | `text-error` | `text-error-foreground` | `bg-error-muted` |
| Info | `text-info` | `text-info-foreground` | `bg-info-muted` |

### Brand Aliases (Optional)

Available for direct brand reference:
- `bg-pitch-green`, `bg-obsidian`, `bg-chalk`, `bg-sand`
- `bg-steel`, `bg-mist`, `bg-vapor`, `bg-cloud`
- `bg-day`, `bg-midnight`, `bg-carbon`

---

## General Conventions

### Do

- Use pill-shaped buttons (`rounded-full`)
- Use `hover:opacity-90` on primary/ghost buttons
- Use `hover:bg-*` (50% → 100%) on secondary/tertiary buttons
- Use `ring-ring` for focus states (orange)
- Use `variant="secondary"` for Cancel buttons
- Use spacing tokens (Tailwind 2, 4, 6, 8...)
- Use muted backgrounds for alerts (`bg-*-muted`)
- Use `/80` opacity modifier for descriptions

### Don't

- Don't use square or slightly rounded buttons
- Don't hardcode hex values (use CSS variables)
- Don't use `variant="tertiary"` for Cancel in dialogs
- Don't use arbitrary spacing values
- Don't use heavy borders on alerts
- Don't make alert descriptions full opacity

---

## Dark Mode (Future)

Dark mode variants exist in Figma but are out of scope for Sprint 2. Key differences:

- Background becomes dark
- Text becomes light
- Primary button stays green
- Secondary becomes darker gray
- Alerts use darker, richer background colors

---

## Implementation Checklist

- [ ] Buttons use `rounded-full`
- [ ] Primary/ghost hover uses `hover:opacity-90`
- [ ] Secondary/tertiary hover uses `hover:bg-*` (50% → 100%)
- [ ] Secondary uses Day color (`border-secondary bg-secondary/50`)
- [ ] Tertiary uses Cloud Blue color (`border-tertiary bg-tertiary/50`)
- [ ] Focus ring uses `ring-ring` (orange)
- [ ] Cancel buttons use `variant="secondary"`
- [ ] Spacing uses Tailwind tokens (2, 4, 6, 8...)
- [ ] Alert descriptions use `/80` opacity
- [ ] Corner radius: `rounded-sm`, `rounded-md`, `rounded-lg`
- [ ] Typography uses `text-h1` through `text-caption`
- [ ] No hardcoded hex values in components
