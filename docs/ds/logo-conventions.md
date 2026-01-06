# Logo Conventions

## Directory Structure

```
/public/images/logo/
├── icon/           # Symbol only ("tp" mark)
├── wordmark/       # Text only ("tenpo")
├── lockup/         # Symbol + wordmark combined
├── app-icon/       # Square app icons (1024x1024 PNG)
└── favicon/        # Browser tab icons
```

## Asset Types

### Icon (`/icon/`)
The "tp" symbol mark. Use for small spaces, avatars, or when brand recognition is established.

| File | Use Case |
|------|----------|
| `icon-light.svg` | Light/white backgrounds |
| `icon-dark.svg` | Dark backgrounds |

### Wordmark (`/wordmark/`)
The "tenpo" text logo. Use when you need the brand name to be readable.

| File | Use Case |
|------|----------|
| `wordmark-light.svg` | Light/white backgrounds |
| `wordmark-dark.svg` | Dark backgrounds |

### Lockup (`/lockup/`)
Symbol + wordmark stacked vertically. Use for splash screens, marketing, social profiles.

| File | Color | Use Case |
|------|-------|----------|
| `lockup-chalk.svg` | Cream/off-white | Dark backgrounds |
| `lockup-carbon.svg` | Dark gray | Light backgrounds |
| `lockup-black.svg` | Pure black | Light backgrounds (high contrast) |
| `lockup-midnight.svg` | Navy/dark blue | Light backgrounds (softer) |

### App Icon (`/app-icon/`)
Square 1024x1024 PNG icons for PWA manifest, app stores, mobile home screens.

| File | Description |
|------|-------------|
| `app-icon-carbon-chalk.png` | Dark background, light icon |
| `app-icon-chalk-carbon.png` | Light background, dark icon |
| `app-icon-black-chalk.png` | Black background, light icon |

### Favicon (`/favicon/`)
Browser tab icons. Note: These are not square in the source files - may need regeneration for actual favicon use.

| File | Use Case |
|------|----------|
| `favicon-chalk.svg` | Dark browser themes |
| `favicon-carbon.svg` | Light browser themes |

## Naming Convention

```
{type}-{variant}.{ext}

type:    icon | wordmark | lockup | app-icon | favicon
variant: light | dark | chalk | carbon | black | midnight
ext:     svg (preferred) | png (when raster required)
```

## Color Reference

| Name | Description | Typical Use |
|------|-------------|-------------|
| Chalk | Cream/off-white (#EFEEEA) | On dark backgrounds |
| Carbon | Dark gray (#392F36) | On light backgrounds |
| Black | Pure black | High contrast on light backgrounds |
| Midnight | Navy/dark blue | Softer alternative to black |

## Usage in Code

```tsx
// SVG import (recommended for icons/logos)
import Image from "next/image";

<Image
  src="/images/logo/icon/icon-light.svg"
  alt="Tenpo"
  width={32}
  height={32}
/>

// Or as background
<div style={{ backgroundImage: "url(/images/logo/lockup/lockup-chalk.svg)" }} />
```

## Notes

- Always use SVG when possible (scales infinitely, smaller file size)
- PNG only for contexts that require raster (app stores, PWA manifest)
- "Light" variants go on light backgrounds, "Dark" variants go on dark backgrounds
- "Chalk" = light colored logo, "Carbon" = dark colored logo
