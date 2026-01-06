# Icons

Tenpo uses icons from Streamline HQ. This folder contains SVG source files and optionally generated React components.

## Directory Structure

```
src/icons/
├── svg/           # Raw SVG files from Streamline
├── components/    # Generated React components (via SVGR)
└── README.md
```

## Workflow

### 1. Export from Streamline

1. Open Streamline HQ Desktop App
2. Find the icon you need
3. Export as SVG with these settings:
   - Size: 24x24 (default)
   - Stroke width: 1.5 (matches our design)
   - Color: currentColor (allows CSS styling)
4. Save to `src/icons/svg/`

### 2. Naming Convention

Use kebab-case for files, matching Streamline names:

| Streamline Name | File Name | Component Name |
|-----------------|-----------|----------------|
| Arrow Left | `arrow-left.svg` | `ArrowLeft` |
| Check Circle | `check-circle.svg` | `CheckCircle` |
| Calendar | `calendar.svg` | `Calendar` |
| User | `user.svg` | `User` |

### 3. Generate React Components

After adding new SVGs, run:

```bash
yarn icons:generate
```

This:
1. Creates TypeScript React components in `src/icons/components/`
2. Auto-generates `index.ts` with all exports

### 4. Usage

**Option A: Use generated components (recommended)**

```tsx
import { ArrowLeft, CheckCircle } from '@/icons/components'

function MyComponent() {
  return (
    <button>
      <ArrowLeft className="size-4" />
      Back
    </button>
  )
}
```

**Option B: Import SVG directly**

```tsx
import ArrowLeft from '@/icons/svg/arrow-left.svg'

// With next/image
import Image from 'next/image'
<Image src={ArrowLeft} alt="" width={24} height={24} />
```

## Icon Guidelines

### Sizing

| Context | Class | Size |
|---------|-------|------|
| Buttons (default) | `size-4` | 16px |
| Buttons (large) | `size-5` | 20px |
| Standalone | `size-6` | 24px |
| Large display | `size-8` | 32px |

### Colors

Icons inherit `currentColor` by default. Use text color utilities:

```tsx
<CheckCircle className="size-4 text-success" />
<AlertCircle className="size-4 text-warning" />
<XCircle className="size-4 text-error" />
<InfoCircle className="size-4 text-info" />
```

### Accessibility

- Decorative icons: `aria-hidden="true"` (default in generated components)
- Meaningful icons: Add `aria-label` or accompanying text

```tsx
// Decorative (has text label)
<button>
  <ArrowLeft aria-hidden="true" className="size-4" />
  Back
</button>

// Meaningful (icon-only button)
<button aria-label="Go back">
  <ArrowLeft className="size-4" />
</button>
```

## Troubleshooting

**Icons not showing color?**
- Ensure SVG uses `currentColor` not hardcoded colors
- Check that the parent has a text color set

**Components not generating?**
- Run `yarn icons:generate`
- Check that SVGs are valid XML
- Ensure file names are kebab-case

**TypeScript errors?**
- Regenerate components after adding new SVGs
- Check `src/icons/components/index.ts` exports
