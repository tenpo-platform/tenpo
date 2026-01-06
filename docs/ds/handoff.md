# Design System Handoff

You are implementing a design system for Tenpo. This document tells you exactly what to do.

---

## TL;DR

**Goal:** Create a fast, premium design system using shadcn/ui + Tailwind, with MUI DataGrid only for complex admin tables.

**Stack:**
- **Primary:** shadcn/ui + Tailwind CSS 4 (95% of the app)
- **Surgical:** @mui/x-data-grid (admin tables only)
- **Tokens:** Figma → Tailwind config
- **Fonts:** Host Grotesk (primary), Seriously Nostalgic (accent)

**Why this approach:**
- Public pages load fast (~30-50kb JS) → premium "Airbnb" feel
- Full design control → matches Figma exactly
- Admin gets best-in-class DataGrid when needed
- One primary mental model (shadcn/Tailwind)

---

## Project Context

### What is Tenpo?
A camp registration marketplace:
- **Parents:** Discover and register kids for sports camps (public side)
- **Coaches/Organizers:** Manage camps, view registrations, export data (admin side)
- Multi-tenant: organizations own camps, parents own player profiles

### Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.1.1, React 19.2.3 |
| Components | shadcn/ui (primary), MUI X DataGrid (admin tables) |
| Styling | Tailwind CSS 4 |
| Database | Supabase (Postgres + Auth) |
| Monitoring | Sentry |

### Brand
- Personality: Professional, cool, trustworthy
- Reference: "Airbnb meets Nike" — premium UX with athletic edge
- Primary brand color: **Pitch Green (#043625)**

---

## Architecture: The Hybrid Approach

```
┌─────────────────────────────────────────────────────────┐
│                    Tenpo App                            │
├─────────────────────────────────────────────────────────┤
│  95% shadcn/ui + Tailwind                               │
│  ├── All public pages (/, /camps, /camps/[id])          │
│  ├── Registration flow (/register)                      │
│  ├── Parent dashboard (/dashboard)                      │
│  ├── All forms, cards, buttons, inputs, dialogs         │
│  ├── Simple tables                                      │
│  └── Most of coach dashboard                            │
├─────────────────────────────────────────────────────────┤
│  5% MUI (imported surgically)                           │
│  ├── DataGrid (registration rosters)                    │
│  ├── DataGrid (camp management lists)                   │
│  └── Maybe: DateRangePicker if needed                   │
└─────────────────────────────────────────────────────────┘
```

### Why Not All MUI?
- MUI adds ~150-200kb JS to every page
- Harder to match custom Figma designs
- Emotion (MUI's CSS-in-JS) + Tailwind = two styling systems
- You only need MUI for DataGrid — don't pay for what you don't use

### Why Not All shadcn?
- shadcn's Table is basic (no built-in sort, filter, pagination, export)
- For heavy admin features, MUI DataGrid is best-in-class
- Coaches need: sorting, filtering, row selection, CSV export

### The Sweet Spot
shadcn for everything, MUI DataGrid surgically for admin tables. Public pages never load MUI.

---

## Figma Access

**File:** `https://www.figma.com/design/EC9yypYtK3uUucw7gT9hY9/Tenpo`

Use Figma MCP with `fileKey: EC9yypYtK3uUucw7gT9hY9`

### Token Frames (use these node IDs)

| Token Type | Node ID | URL |
|------------|---------|-----|
| App Colors | `105:1268` | `?node-id=105-1268` |
| Warning Colors | `113:3720` | `?node-id=113-3720` |
| Success Colors | `113:3768` | `?node-id=113-3768` |
| Info Colors | `113:3816` | `?node-id=113-3816` |
| Advice Colors | `113:3864` | `?node-id=113-3864` |
| Spacing | `105:1808` | `?node-id=105-1808` |
| Corner Radius | `105:1786` | `?node-id=105-1786` |
| Typography (Host Grotesk) | `105:1536` | `?node-id=105-1536` |
| Typography (Seriously Nostalgic) | `105:1614` | `?node-id=105-1614` |

**Status:** All tokens extracted (colors, spacing, corner radius, typography).

---

## Color Tokens

Uses **functional names** (shadcn convention) for AI/dev familiarity, with brand aliases for Figma reference.

### Functional Colors (Use These)

| Functional | Hex | Usage |
|------------|-----|-------|
| `background` | #F9F7F2 | Page backgrounds |
| `foreground` | #1F1F1F | Primary text |
| `primary` | #043625 | Buttons, links, brand accents |
| `primary-foreground` | #FFFFFF | Text on primary |
| `secondary` | #EFEEEA | Secondary buttons |
| `secondary-foreground` | #1F1F1F | Text on secondary |
| `muted` | #EFEEEA | Subtle backgrounds |
| `muted-foreground` | #B1AB9B | Subtle text, placeholders |
| `accent` | #EBE3C6 | Highlights, hover states |
| `accent-foreground` | #1F1F1F | Text on accent |
| `destructive` | #F000A7 | Delete, errors (magenta) |
| `destructive-foreground` | #FFFFFF | Text on destructive |
| `border` | #C0C9D6 | Borders, dividers |
| `input` | #C0C9D6 | Input borders |
| `ring` | #043625 | Focus rings |
| `card` | #FFFFFF | Card backgrounds |
| `card-foreground` | #1F1F1F | Text on cards |

### Brand Aliases (For Figma Reference)

| Brand Name | Hex | Maps To |
|------------|-----|---------|
| Pitch Green | #043625 | `primary` |
| Obsidian | #1F1F1F | `foreground` |
| Chalk | #EFEEEA | `muted` |
| Sand | #B1AB9B | `muted-foreground` |
| Steel | #C0C9D6 | `border` |
| Mist | #E1DADA | — |
| Vapor | #D9DDE0 | — |
| Cloud Blue | #DEEBFF | `info-muted` |
| Day | #EBE3C6 | `accent` |
| Midnight | #0B1E3C | (dark mode) |
| Carbon | #392F36 | — |
| Bleached Sand | #F9F7F2 | `background` |

### Status Colors

| Status | Default | Foreground | Muted |
|--------|---------|------------|-------|
| `warning` | #EF6C00 | #984500 | #F0ECDD |
| `success` | #0A7F10 | #006D06 | #E6EB8A |
| `error` | #F000A7 | #AE0079 | #F7E2F0 |
| `info` | #0014AE | #002C9A | #DEEBFF |

### Dark Mode Status (Future)

| Status | Default | Foreground | Muted |
|--------|---------|------------|-------|
| `warning` | #EF6C00 | #FF9A47 | #321B00 |
| `success` | #86EB12 | #A9FF47 | #2D3000 |
| `error` | #FF42C5 | #FF65D1 | #3B0029 |
| `info` | #15ADFF | #65C9FF | #001638 |

---

## Spacing Scale

Mapped to Tailwind conventions so `p-4` = 16px as expected.

| Figma Token | Tailwind Key | Value | Usage |
|-------------|--------------|-------|-------|
| — | `0` | 0px | None |
| — | `1` | 4px | Tiny gaps |
| Spacing 1 | `2` | 8px | `p-2`, `gap-2` |
| — | `3` | 12px | — |
| Spacing 2 | `4` | 16px | `p-4`, `gap-4` |
| — | `5` | 20px | — |
| Spacing 3 | `6` | 24px | `p-6`, `gap-6` |
| Spacing 4 | `8` | 32px | `p-8`, `gap-8` |
| Spacing 5 | `10` | 40px | `p-10`, `gap-10` |
| Spacing 6 | `12` | 48px | `p-12`, `gap-12` |
| Spacing 7 | `14` | 56px | `p-14`, `gap-14` |
| Spacing 8 | `16` | 64px | `p-16`, `gap-16` |

---

## Corner Radius

| Name | Tailwind Key | Value |
|------|--------------|-------|
| None | `none` | 0px |
| Small | `sm` | 12px |
| Medium | `md` | 24px |
| Large | `lg` | 32px |
| Full | `full` | 9999px |

Note: Larger than typical — intentional brand choice for rounded, soft aesthetic.

---

## Typography Scale (Host Grotesk)

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

## Typography Scale (Seriously Nostalgic)

| Style | Size | Usage |
|-------|------|-------|
| h1 | 96px | Hero headlines |
| h2 | 60px | Section headlines |

*Used sparingly for brand moments and display text.*

---

## Fonts

| Font | Role | Weights |
|------|------|---------|
| Host Grotesk | Primary (body, UI, buttons) | 400, 500, 700 |
| Seriously Nostalgic | Accent (headlines, hero text) | 400 |

**Files:** OTF files are in `docs/ds/fonts/`. Copy to `src/fonts/` during setup.

**Warning:** Font licensing is unconfirmed. Build the system, but remind user to verify commercial rights before launch. See `docs/warning.md`.

---

## Implementation Steps

### Phase 1: Tailwind Config with Tokens

Create/update `tailwind.config.ts` with functional color names:

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // === FUNCTIONAL (use these) ===
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

        // === BRAND ALIASES (for Figma reference) ===
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
      fontFamily: {
        sans: ['Host Grotesk', 'sans-serif'],
        display: ['Seriously Nostalgic', 'serif'],
      },
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
      },
      borderRadius: {
        'none': '0px',
        'sm': '12px',
        'md': '24px',
        'lg': '32px',
        'full': '9999px',
      },
      fontSize: {
        'h1': ['96px', { lineHeight: '1' }],
        'h2': ['60px', { lineHeight: '1' }],
        'h3': ['48px', { lineHeight: '1' }],
        'h4': ['34px', { lineHeight: '1' }],
        'h5': ['24px', { lineHeight: '1' }],
        'h6': ['20px', { lineHeight: '1.6', letterSpacing: '0.15px' }],
        'subtitle1': ['16px', { lineHeight: '1.5' }],
        'subtitle2': ['14px', { lineHeight: '1.5' }],
        'body1': ['16px', { lineHeight: '1.5' }],
        'body2': ['14px', { lineHeight: '1.43', letterSpacing: '0.17px' }],
        'caption': ['12px', { lineHeight: '1.66', letterSpacing: '0.4px' }],
        'overline': ['12px', { lineHeight: '1.5' }],
      },
    },
  },
  plugins: [],
}

export default config
```

### Phase 2: shadcn/ui Setup

```bash
npx shadcn@latest init
```

Choose:
- TypeScript: Yes
- Style: Default
- Base color: Slate (you'll override with your tokens)
- CSS variables: Yes

Then add components:

```bash
npx shadcn@latest add button input card badge alert dialog table tabs form toast
```

### Phase 3: Customize shadcn Theme

Update `src/app/globals.css` to use your tokens:

```css
@layer base {
  :root {
    --background: 39 33% 96%;        /* #F9F7F2 */
    --foreground: 0 0% 12%;          /* #1F1F1F */
    --primary: 160 89% 11%;          /* #043625 */
    --primary-foreground: 0 0% 100%;
    /* Map all your colors to CSS variables */
  }
}
```

### Phase 4: Font Setup

1. Copy OTF files from `docs/ds/fonts/` to `src/fonts/`
2. Convert to WOFF2 (use `fonttools` or online converter)
3. Configure in Next.js:

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

### Phase 5: MUI DataGrid (Admin Only)

Install only what you need:

```bash
npm install @mui/x-data-grid @mui/material @emotion/react @emotion/styled
```

Create a styled DataGrid wrapper that matches your theme:

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
        '& .MuiDataGrid-toolbarContainer': {
          padding: '8px 16px',
        },
        ...props.sx,
      }}
    />
  )
}
```

Use it only in admin routes:

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
│   └── seriously-nostalgic/
└── lib/
    └── utils.ts                # cn() helper from shadcn
```

---

## Bundle Size Expectations

| Route | Components Used | JS Size |
|-------|-----------------|---------|
| `/` (landing) | shadcn only | ~30-40kb |
| `/camps` (browse) | shadcn only | ~35-45kb |
| `/camps/[id]` (detail) | shadcn only | ~35-45kb |
| `/register` (checkout) | shadcn only | ~40-50kb |
| `/dashboard` (parent) | shadcn only | ~40-50kb |
| `/organizer/*` (admin) | shadcn + DataGrid | ~100-120kb |

Public pages stay fast. Admin loads DataGrid lazily (Next.js handles this).

---

## Commands

```bash
# Add a shadcn component
npx shadcn@latest add [component]

# Available components you'll likely need:
npx shadcn@latest add button input card badge alert dialog
npx shadcn@latest add table tabs form select textarea
npx shadcn@latest add dropdown-menu avatar toast separator
```

---

## Questions to Ask User

1. "Any specific components you want styled first?"
2. "Do you need shadow/elevation tokens?" (no Figma frame provided yet)

---

## Success Criteria

- [x] All design tokens extracted from Figma (colors, spacing, radius, typography)
- [x] Tailwind config has all tokens — *Via `@theme inline` in globals.css (Tailwind CSS 4)*
- [x] shadcn/ui installed and configured — *30 components*
- [x] Host Grotesk font loads correctly — *Variable font with display: swap*
- [x] Button, Input, Card, Badge use your brand colors — *All themed*
- [ ] DataGrid wrapper created and styled to match theme — *Deferred until admin routes*
- [ ] Public pages load < 50kb JS — *Not yet verified*

### Bonus Completed
- [x] Seriously Nostalgic accent font configured
- [x] Icon system with SVGR pipeline (100+ Streamline icons)
- [x] Design system demo page at `/ds`
- [x] Form validation (React Hook Form + Zod)
- [x] Calendar, Slider, Command palette components
- [x] Toast notifications (Sonner)

---

## Notes

- Error colors in Figma are pink/magenta, not red. Intentional brand choice.
- "Info" frame in Figma is labeled "information", "Advice" is the blue one. Map: Advice → Info
- Tailwind CSS 4 config differs slightly from v3 — check docs if issues arise
- React 19 is in use — be aware of any pattern changes

---

## Files to Reference

- `docs/sprints/sprint2/prd-09-design-system.md` — Business context
- `docs/sprints/sprint2/frd-08-design-system.md` — Original spec (outdated, was MUI-focused)
- `docs/warning.md` — Font licensing reminder

---

Build something that feels like "Airbnb meets Nike."
