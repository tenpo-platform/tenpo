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

**Note:** Colors have been extracted (see below). Spacing, corner radius, and typography values still need extraction from the frames above.

---

## Extracted Color Tokens

These were extracted from Figma. Use these values in `tailwind.config.ts`.

### Core Palette

| Name | Hex | Tailwind Key | Usage |
|------|-----|--------------|-------|
| Pitch Green | `#043625` | `primary` | **Primary brand color** |
| Midnight | `#0B1E3C` | `midnight` | Dark backgrounds, secondary |
| Obsidian | `#1F1F1F` | `obsidian` | Darkest neutral, text |
| Carbon | `#392F36` | `carbon` | Dark text alternative |
| Sand | `#B1AB9B` | `sand` | Muted accent |
| Steel | `#C0C9D6` | `steel` | Borders, dividers |
| Mist | `#E1DADA` | `mist` | Light backgrounds |
| Vapor | `#D9DDE0` | `vapor` | Light gray |
| Cloud Blue | `#DEEBFF` | `cloud` | Info background |
| Day | `#EBE3C6` | `day` | Warm light accent |
| Chalk | `#EFEEEA` | `chalk` | Off-white |
| Optic White | `#FFFFFF` | `white` | Pure white |
| Page Background | `#F9F7F2` | `background` | Default page bg |

### Status Colors (Light Mode)

| Status | Icon | Text | Background |
|--------|------|------|------------|
| Warning | `#EF6C00` | `#984500` | `#F0ECDD` |
| Success | `#0A7F10` | `#006D06` | `#E6EB8A` |
| Error | `#F000A7` | `#AE0079` | `#F7E2F0` |
| Info | `#0014AE` | `#002C9A` | `#DEEBFF` |

### Status Colors (Dark Mode)

| Status | Icon | Text | Background |
|--------|------|------|------------|
| Warning | `#EF6C00` | `#FF9A47` | `#321B00` |
| Success | `#86EB12` | `#A9FF47` | `#2D3000` |
| Error | `#FF42C5` | `#FF65D1` | `#3B0029` |
| Info | `#15ADFF` | `#65C9FF` | `#001638` |

---

## Fonts

| Font | Role | Weights |
|------|------|---------|
| Host Grotesk | Primary (body, UI, buttons) | 400, 500, 700 |
| Seriously Nostalgic | Accent (headlines, hero text) | TBD — check files |

**Files:** OTF files are in `docs/ds/fonts/`. Copy to `src/fonts/` during setup.

**Warning:** Font licensing is unconfirmed. Build the system, but remind user to verify commercial rights before launch. See `docs/warning.md`.

---

## Implementation Steps

### Phase 1: Tailwind Config with Tokens

Create/update `tailwind.config.ts` with your Figma tokens:

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core palette
        primary: '#043625',      // Pitch Green
        midnight: '#0B1E3C',
        obsidian: '#1F1F1F',
        carbon: '#392F36',
        sand: '#B1AB9B',
        steel: '#C0C9D6',
        mist: '#E1DADA',
        vapor: '#D9DDE0',
        cloud: '#DEEBFF',
        day: '#EBE3C6',
        chalk: '#EFEEEA',
        background: '#F9F7F2',

        // Status colors
        warning: {
          DEFAULT: '#EF6C00',
          text: '#984500',
          bg: '#F0ECDD',
        },
        success: {
          DEFAULT: '#0A7F10',
          text: '#006D06',
          bg: '#E6EB8A',
        },
        error: {
          DEFAULT: '#F000A7',
          text: '#AE0079',
          bg: '#F7E2F0',
        },
        info: {
          DEFAULT: '#0014AE',
          text: '#002C9A',
          bg: '#DEEBFF',
        },
      },
      fontFamily: {
        sans: ['Host Grotesk', 'sans-serif'],
        display: ['Seriously Nostalgic', 'serif'],
      },
      // Add spacing and borderRadius from Figma frames
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

- [ ] Tailwind config has all color tokens from Figma
- [ ] shadcn/ui installed and configured
- [ ] Host Grotesk font loads correctly
- [ ] Button, Input, Card, Badge use your brand colors
- [ ] DataGrid wrapper created and styled to match theme
- [ ] Public pages load < 50kb JS
- [ ] Typography and spacing values extracted from Figma

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
