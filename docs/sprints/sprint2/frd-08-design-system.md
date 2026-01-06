# FRD 8: Design System

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FIGMA (Design Source)                     │
│         Colors, Typography, Spacing, Components              │
└─────────────────────┬───────────────────────────────────────┘
                      │ Extract via Figma MCP
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              tailwind.config.ts                              │
│           (Tokens as Tailwind theme)                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌───────────────────┐    ┌───────────────────┐
│   shadcn/ui       │    │   MUI DataGrid    │
│   Components      │    │   (Admin Only)    │
│                   │    │                   │
│ • Button, Input   │    │ • Roster tables   │
│ • Card, Badge     │    │ • Camp lists      │
│ • Dialog, Form    │    │ • Export/filter   │
│ • All public UI   │    │                   │
└───────────────────┘    └───────────────────┘
```

### Why This Architecture

| Approach | Pros | Cons |
|----------|------|------|
| **All MUI** | One library, feature-rich | 150-200kb JS per page, hard to match Figma |
| **All shadcn** | Fast, customizable | DataGrid is basic (no sort/filter/export) |
| **Hybrid (chosen)** | Best of both: fast public pages + powerful admin tables | Two mental models (minimal) |

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx              # Font setup, providers
│   ├── globals.css             # Tailwind + shadcn CSS variables
│   ├── page.tsx                # Landing (shadcn)
│   ├── camps/                  # Public browse (shadcn)
│   ├── register/               # Registration flow (shadcn)
│   ├── dashboard/              # Parent dashboard (shadcn)
│   └── organizer/              # Admin (shadcn + DataGrid)
├── components/
│   └── ui/                     # shadcn components + DataGrid wrapper
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── data-grid.tsx       # MUI DataGrid styled wrapper
│       └── ...
├── fonts/
│   ├── host-grotesk/
│   │   ├── HostGrotesk-Regular.woff2
│   │   ├── HostGrotesk-Medium.woff2
│   │   └── HostGrotesk-Bold.woff2
│   └── seriously-nostalgic/
│       └── SeriouslyNostalgic.woff2
├── icons/
│   ├── svg/                    # Raw SVGs from Streamline
│   └── components/             # Generated React components (optional)
└── lib/
    └── utils.ts                # cn() helper from shadcn
```

---

## Design Tokens

### Color Palette

Uses **functional names** (shadcn convention) for AI/dev familiarity, with brand aliases.

```typescript
// tailwind.config.ts
const config: Config = {
  theme: {
    extend: {
      colors: {
        // === FUNCTIONAL (primary - use these) ===
        background: '#F9F7F2',
        foreground: '#1F1F1F',

        primary: {
          DEFAULT: '#043625',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#EFEEEA',
          foreground: '#1F1F1F',
        },
        muted: {
          DEFAULT: '#EFEEEA',
          foreground: '#B1AB9B',
        },
        accent: {
          DEFAULT: '#EBE3C6',
          foreground: '#1F1F1F',
        },
        destructive: {
          DEFAULT: '#F000A7',
          foreground: '#FFFFFF',
        },

        border: '#C0C9D6',
        input: '#C0C9D6',
        ring: '#043625',

        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1F1F1F',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#1F1F1F',
        },

        // === STATUS ===
        warning: {
          DEFAULT: '#EF6C00',
          foreground: '#984500',
          muted: '#F0ECDD',
        },
        success: {
          DEFAULT: '#0A7F10',
          foreground: '#006D06',
          muted: '#E6EB8A',
        },
        error: {
          DEFAULT: '#F000A7',
          foreground: '#AE0079',
          muted: '#F7E2F0',
        },
        info: {
          DEFAULT: '#0014AE',
          foreground: '#002C9A',
          muted: '#DEEBFF',
        },

        // === BRAND ALIASES (optional, for Figma reference) ===
        'pitch-green': '#043625',
        'obsidian': '#1F1F1F',
        'chalk': '#EFEEEA',
        'sand': '#B1AB9B',
        'steel': '#C0C9D6',
        'mist': '#E1DADA',
        'vapor': '#D9DDE0',
        'cloud': '#DEEBFF',
        'day': '#EBE3C6',
        'midnight': '#0B1E3C',
        'carbon': '#392F36',
      },
    },
  },
}
```

### Color Mapping Reference

| Functional Name | Brand Name | Hex | Usage |
|-----------------|------------|-----|-------|
| `background` | Bleached Sand | #F9F7F2 | Page backgrounds |
| `foreground` | Obsidian | #1F1F1F | Primary text |
| `primary` | Pitch Green | #043625 | Buttons, links, accents |
| `secondary` | Chalk | #EFEEEA | Secondary buttons |
| `muted` | Chalk | #EFEEEA | Subtle backgrounds |
| `muted-foreground` | Sand | #B1AB9B | Subtle text |
| `accent` | Day | #EBE3C6 | Highlights |
| `destructive` | Error | #F000A7 | Delete, errors (magenta) |
| `border` | Steel | #C0C9D6 | Borders, dividers |
| `card` | White | #FFFFFF | Card backgrounds |

### Spacing Scale

Mapped to Tailwind conventions so `p-4` = 16px as expected.

```typescript
// tailwind.config.ts - spacing (extends Tailwind defaults)
spacing: {
  '0': '0px',
  '1': '4px',
  '2': '8px',    // Figma Spacing 1
  '3': '12px',
  '4': '16px',   // Figma Spacing 2
  '5': '20px',
  '6': '24px',   // Figma Spacing 3
  '8': '32px',   // Figma Spacing 4
  '10': '40px',  // Figma Spacing 5
  '12': '48px',  // Figma Spacing 6
  '14': '56px',  // Figma Spacing 7
  '16': '64px',  // Figma Spacing 8
}
```

| Figma Token | Tailwind Key | Value |
|-------------|--------------|-------|
| Spacing 1 | `2` | 8px |
| Spacing 2 | `4` | 16px |
| Spacing 3 | `6` | 24px |
| Spacing 4 | `8` | 32px |
| Spacing 5 | `10` | 40px |
| Spacing 6 | `12` | 48px |
| Spacing 7 | `14` | 56px |
| Spacing 8 | `16` | 64px |

### Corner Radius

```typescript
// tailwind.config.ts - borderRadius
borderRadius: {
  'none': '0px',
  'sm': '12px',   // Small
  'md': '24px',   // Medium
  'lg': '32px',   // Large
  'full': '9999px',
}
```

Note: These are larger than typical (intentional brand choice for rounded, soft aesthetic).

### Typography Scale (Host Grotesk)

| Style | Size | Line Height | Letter Spacing | Weight |
|-------|------|-------------|----------------|--------|
| h1 | 96px | — | — | 400 |
| h2 | 60px | — | — | 400 |
| h3 | 48px | — | — | 400 |
| h4 | 34px | — | — | 400 |
| h5 | 24px | — | — | 400 |
| h6 | 20px | 160% | 0.15px | 500 |
| subtitle1 | 16px | — | — | 400 |
| subtitle2 | 14px | — | — | 400 |
| body1 | 16px | — | — | 400 |
| body2 | 14px | 143% | 0.17px | 400 |
| caption | 12px | 166% | 0.4px | 400 |
| overline | 12px | — | — | 400 |

### Typography Scale (Seriously Nostalgic)

| Style | Size | Usage |
|-------|------|-------|
| h1 | 96px | Hero headlines |
| h2 | 60px | Section headlines |

*Used sparingly for brand moments and display text.*

### Figma Token Frames

| Token Type | Node ID | Status |
|------------|---------|--------|
| App Colors | `105:1268` | Extracted |
| Warning Colors | `113:3720` | Extracted |
| Success Colors | `113:3768` | Extracted |
| Info Colors | `113:3816` | Extracted |
| Advice Colors | `113:3864` | Extracted |
| Spacing | `105:1808` | Extracted |
| Corner Radius | `105:1786` | Extracted |
| Typography (Host Grotesk) | `105:1536` | Extracted |
| Typography (Seriously Nostalgic) | `105:1614` | Extracted |

---

## Fonts

### Font Roles

| Font | Usage | Weights |
|------|-------|---------|
| Host Grotesk | Body text, UI elements, buttons, forms | 400, 500, 700 |
| Seriously Nostalgic | Headlines, hero text, brand moments | TBD |

### Implementation

```typescript
// src/app/layout.tsx
import localFont from 'next/font/local'

const hostGrotesk = localFont({
  src: [
    { path: '../fonts/host-grotesk/HostGrotesk-Regular.woff2', weight: '400' },
    { path: '../fonts/host-grotesk/HostGrotesk-Medium.woff2', weight: '500' },
    { path: '../fonts/host-grotesk/HostGrotesk-Bold.woff2', weight: '700' },
  ],
  variable: '--font-sans',
})

const seriouslyNostalgic = localFont({
  src: '../fonts/seriously-nostalgic/SeriouslyNostalgic.woff2',
  variable: '--font-display',
})

export default function RootLayout({ children }) {
  return (
    <html className={`${hostGrotesk.variable} ${seriouslyNostalgic.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

### Font Files

Source: `docs/ds/fonts/` (OTF files)
Target: `src/fonts/` (WOFF2 files after conversion)

**Warning:** Font licensing unconfirmed. See `docs/warning.md`.

---

## shadcn/ui Setup

### Installation

```bash
npx shadcn@latest init
```

Configuration choices:
- TypeScript: Yes
- Style: Default
- Base color: Slate (overridden with tokens)
- CSS variables: Yes

### Components to Add

```bash
npx shadcn@latest add button input card badge alert dialog table tabs form toast dropdown-menu avatar separator select textarea
```

### Theme Customization

```css
/* src/app/globals.css */
@layer base {
  :root {
    --background: 39 33% 96%;        /* #F9F7F2 */
    --foreground: 0 0% 12%;          /* #1F1F1F */
    --primary: 160 89% 11%;          /* #043625 */
    --primary-foreground: 0 0% 100%;
    /* Map all tokens to CSS variables */
  }
}
```

---

## MUI DataGrid (Admin Only)

### Installation

```bash
npm install @mui/x-data-grid @mui/material @emotion/react @emotion/styled
```

### Styled Wrapper

```typescript
// src/components/ui/data-grid.tsx
'use client'

import { DataGrid as MuiDataGrid, DataGridProps } from '@mui/x-data-grid'

export function DataGrid(props: DataGridProps) {
  return (
    <MuiDataGrid
      {...props}
      sx={{
        border: 'none',
        fontFamily: 'var(--font-sans)',
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: '#F9F7F2',
          color: '#1F1F1F',
          fontWeight: 500,
        },
        '& .MuiDataGrid-row:hover': {
          backgroundColor: '#EFEEEA',
        },
        '& .MuiDataGrid-cell': {
          borderColor: '#E1DADA',
        },
        '& .MuiCheckbox-root': {
          color: '#043625',
        },
        ...props.sx,
      }}
    />
  )
}
```

### Usage (Admin Routes Only)

```typescript
// src/app/organizer/camps/[id]/roster/page.tsx
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataGrid } from '@/components/ui/data-grid'

export default function RosterPage() {
  return (
    <Card>
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-xl font-medium">Registrations</h1>
        <Button>Export CSV</Button>
      </div>
      <DataGrid
        rows={registrations}
        columns={columns}
        pageSizeOptions={[10, 25, 50]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Card>
  )
}
```

---

## Icons

### Workflow

1. **Source:** Streamline HQ Desktop App (Pro account)
2. **Export:** Download as SVG to `src/icons/svg/`
3. **Use:** Import directly or generate components with SVGR

### Naming Convention

| Streamline Name | File Name | Component Name |
|-----------------|-----------|----------------|
| Arrow Left | `arrow-left.svg` | `ArrowLeft` |
| Check Circle | `check-circle.svg` | `CheckCircle` |

### Optional: Generate Components

```bash
npm install -D @svgr/cli
npx svgr src/icons/svg --out-dir src/icons/components --typescript
```

---

## Repository Strategy

**Current:** Design system lives in the main Tenpo repo.

**When React Native starts (~6 months):** Convert to monorepo:

```
tenpo/
├── apps/
│   ├── web/              # Current Next.js app
│   └── mobile/           # React Native app
├── packages/
│   ├── tokens/           # Shared design tokens
│   ├── ui-web/           # Web components
│   └── ui-native/        # RN components
└── turbo.json
```

**Migration path:**
1. Install Turborepo: `npx turbo init`
2. Move current app to `apps/web/`
3. Extract tokens to `packages/tokens/`
4. Create `apps/mobile/` for RN

---

## Bundle Size Targets

| Route | Components | Target JS |
|-------|------------|-----------|
| `/` (landing) | shadcn only | < 40kb |
| `/camps` (browse) | shadcn only | < 45kb |
| `/register` (checkout) | shadcn only | < 50kb |
| `/dashboard` (parent) | shadcn only | < 50kb |
| `/organizer/*` (admin) | shadcn + DataGrid | < 120kb |

Public pages never load MUI. Next.js handles lazy loading for admin routes.

---

## Implementation Checklist

### Phase 1: Foundation
- [x] Configure `tailwind.config.ts` with all tokens (colors, spacing, radius, typography) — *Using Tailwind CSS 4 `@theme inline` in globals.css*
- [x] Set up shadcn/ui with `npx shadcn@latest init`
- [x] Copy font files to `src/fonts/` — *Using TTF/OTF (variable font), WOFF2 conversion optional*
- [x] Configure fonts in `layout.tsx`
- [x] Update `globals.css` with CSS variables

### Phase 2: Components
- [x] Add shadcn components (button, input, card, badge, etc.) — *30 components installed*
- [x] Customize component styles to match Figma — *Button has custom variants (tertiary, ghost, link)*
- [ ] Create MUI DataGrid wrapper — *Deferred until admin routes are built*

### Phase 3: Verification
- [x] All color tokens match Figma
- [x] Spacing scale works (8px increments)
- [x] Border radius matches (12, 24, 32px)
- [x] Typography scale renders correctly — *12 styles as utilities in globals.css*
- [x] Fonts load without FOUT/FOIT — *Using display: "swap"*
- [x] Button, Input, Card render correctly
- [ ] DataGrid wrapper matches theme — *Deferred*
- [ ] Public pages < 50kb JS — *Not yet verified*

### Bonus: Completed Beyond Spec
- [x] Icon system with SVGR pipeline (`yarn icons:generate`)
- [x] 100+ Streamline icons as React components
- [x] Design system demo page at `/ds`
- [x] Form validation integration (React Hook Form + Zod)

### Token Extraction Status

| Token | Status |
|-------|--------|
| Colors | Complete |
| Spacing | Complete (8px increments: 8-64px) |
| Corner Radius | Complete (12, 24, 32px) |
| Typography | Complete (12 styles) |
| Shadows | Pending (no Figma frame) |

---

## Dependencies

```json
{
  "dependencies": {
    "@mui/x-data-grid": "^7.x",
    "@mui/material": "^6.x",
    "@emotion/react": "^11.x",
    "@emotion/styled": "^11.x"
  },
  "devDependencies": {
    "@svgr/cli": "^8.x"
  }
}
```

Note: shadcn/ui components are copied into the codebase, not installed as a dependency.

---

## Notes

- Error colors are pink/magenta (#F000A7), not red — intentional brand choice
- Tailwind CSS 4 syntax differs from v3 — check docs if issues arise
- React 19 is in use — be aware of pattern changes
- Font licensing needs verification before launch
