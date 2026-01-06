# Logo Conventions

## Directory Structure

```
/public/images/logo/
├── icon/           # Symbol only ("10" mark)
├── wordmark/       # Text only ("tenpo")
├── lockup/         # Symbol + wordmark combined
├── app-icon/       # Square app icons (1024x1024 PNG)
└── favicon/        # Browser tab icons
```

## Naming Convention

```
{type}-{color}.{ext}

type:  icon | wordmark | lockup | app-icon | favicon
color: chalk | carbon | black | midnight | obsidian | pitch-green
ext:   svg (preferred) | png (when raster required)
```

## Color Reference

| Color | Hex | Description | Use On |
|-------|-----|-------------|--------|
| Chalk | `#EFEEEA` | Cream/off-white | Dark backgrounds |
| Carbon | `#392F36` | Dark brown-gray | Light backgrounds |
| Black | `#1F1F1F` | Near-black | Light backgrounds (high contrast) |
| Midnight | `#0B1E3C` | Dark navy blue | Light backgrounds |
| Obsidian | `#1F1F1F` | Near-black (same as Black) | Light backgrounds |
| Pitch Green | `#043625` | Dark forest green | Light backgrounds |

## Asset Types

### Icon (`/icon/`)
The "10" symbol mark. Use for small spaces, avatars, or when brand recognition is established.

| File | Color |
|------|-------|
| `icon-chalk.svg` | Cream (for dark backgrounds) |
| `icon-carbon.svg` | Dark gray (for light backgrounds) |
| `icon-midnight.svg` | Navy blue |
| `icon-obsidian.svg` | Near-black |
| `icon-pitch-green.svg` | Forest green |

### Wordmark (`/wordmark/`)
The "tenpo" text logo. Use when you need the brand name to be readable.

| File | Color |
|------|-------|
| `wordmark-chalk.svg` | Cream (for dark backgrounds) |
| `wordmark-carbon.svg` | Dark gray (for light backgrounds) |
| `wordmark-midnight.svg` | Navy blue |
| `wordmark-obsidian.svg` | Near-black |
| `wordmark-pitch-green.svg` | Forest green |

### Lockup (`/lockup/`)
Symbol + wordmark combined. Use for headers, splash screens, marketing, social profiles.

| File | Color |
|------|-------|
| `lockup-chalk.svg` | Cream (for dark backgrounds) |
| `lockup-carbon.svg` | Dark gray (for light backgrounds) |
| `lockup-black.svg` | Pure black |
| `lockup-midnight.svg` | Navy blue |
| `lockup-obsidian.svg` | Near-black |
| `lockup-pitch-green.svg` | Forest green |

### Favicon (`/favicon/`)
Browser tab icons. SVG format scales to any size.

| File | Color |
|------|-------|
| `favicon-chalk.svg` | Cream |
| `favicon-carbon.svg` | Dark gray |
| `favicon-midnight.svg` | Navy blue |
| `favicon-obsidian.svg` | Near-black |
| `favicon-pitch-green.svg` | Forest green |

### App Icon (`/app-icon/`)
Square 1024x1024 PNG icons for PWA manifest, app stores, mobile home screens.

| File | Description |
|------|-------------|
| `app-icon-carbon-chalk.png` | Carbon background, chalk logo |
| `app-icon-chalk-carbon.png` | Chalk background, carbon logo |
| `app-icon-black-chalk.png` | Black background, chalk logo |

**TODO:** Missing app-icon variants for midnight, obsidian, and pitch-green backgrounds.

## Usage in Code

```tsx
import Image from "next/image";

<Image
  src="/images/logo/icon/icon-carbon.svg"
  alt="Tenpo"
  width={32}
  height={32}
/>
```

## Notes

- Always use SVG when possible (scales infinitely, smaller file size)
- PNG only for contexts that require raster (app stores, PWA manifest)
- Chalk variants go on dark backgrounds, all other colors go on light backgrounds
