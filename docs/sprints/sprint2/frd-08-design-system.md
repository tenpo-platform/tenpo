# FRD 8: Design System

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FIGMA (Design Source)                     │
│         Colors, Typography, Spacing, Components              │
└─────────────────────┬───────────────────────────────────────┘
                      │ Export (Figma MCP or manual)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              src/tokens/tokens.json                          │
│                 (Source of Truth)                            │
└─────────────────────┬───────────────────────────────────────┘
                      │ Style Dictionary build
                      ▼
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌───────────────────┐    ┌───────────────────┐
│   Web Outputs     │    │  React Native     │
│                   │    │    Outputs        │
│ • CSS variables   │    │                   │
│ • Tailwind config │    │ • JS module       │
│ • WOFF2 fonts     │    │ • OTF fonts       │
└───────────────────┘    └───────────────────┘
```

## File Structure

```
src/
├── tokens/
│   ├── tokens.json           # Source of truth (from Figma)
│   ├── style-dictionary.config.js
│   └── build/                # Generated outputs (git-ignored)
│       ├── css/
│       │   └── variables.css
│       ├── tailwind/
│       │   └── tokens.js
│       └── rn/
│           └── tokens.js
├── fonts/
│   ├── host-grotesk/
│   │   ├── HostGrotesk-Regular.otf
│   │   ├── HostGrotesk-Medium.otf
│   │   ├── HostGrotesk-Bold.otf
│   │   └── ... (other weights)
│   ├── seriously-nostalgic/
│   │   └── SeriouslyNostalgic-Regular.otf
│   └── web/                  # Generated WOFF2 files
│       ├── HostGrotesk-Regular.woff2
│       └── ...
├── icons/
│   ├── svg/                  # Raw SVGs from Streamline
│   │   ├── arrow-left.svg
│   │   ├── check.svg
│   │   └── ...
│   └── components/           # Generated React components
│       ├── ArrowLeft.tsx
│       ├── Check.tsx
│       └── index.ts
├── components/
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       └── index.ts
└── layouts/
    ├── AppShell.tsx
    ├── DashboardLayout.tsx
    ├── MarketingLayout.tsx
    └── AuthLayout.tsx
```

## Token Structure

### tokens.json Schema

```json
{
  "color": {
    "brand": {
      "primary": { "value": "{color.green.500}" },
      "secondary": { "value": "{color.gray.900}" }
    },
    "background": {
      "primary": { "value": "#ffffff" },
      "secondary": { "value": "{color.gray.50}" },
      "tertiary": { "value": "{color.gray.100}" }
    },
    "text": {
      "primary": { "value": "{color.gray.900}" },
      "secondary": { "value": "{color.gray.600}" },
      "tertiary": { "value": "{color.gray.400}" },
      "inverse": { "value": "#ffffff" }
    },
    "border": {
      "default": { "value": "{color.gray.200}" },
      "focus": { "value": "{color.brand.primary}" }
    },
    "status": {
      "success": { "value": "{color.green.500}" },
      "error": { "value": "{color.red.500}" },
      "warning": { "value": "{color.amber.500}" },
      "info": { "value": "{color.blue.500}" }
    },
    "green": {
      "50": { "value": "#f0fdf4" },
      "100": { "value": "#dcfce7" },
      "200": { "value": "#bbf7d0" },
      "300": { "value": "#86efac" },
      "400": { "value": "#4ade80" },
      "500": { "value": "#22c55e" },
      "600": { "value": "#16a34a" },
      "700": { "value": "#15803d" },
      "800": { "value": "#166534" },
      "900": { "value": "#14532d" }
    },
    "gray": {
      "50": { "value": "#f9fafb" },
      "100": { "value": "#f3f4f6" },
      "200": { "value": "#e5e7eb" },
      "300": { "value": "#d1d5db" },
      "400": { "value": "#9ca3af" },
      "500": { "value": "#6b7280" },
      "600": { "value": "#4b5563" },
      "700": { "value": "#374151" },
      "800": { "value": "#1f2937" },
      "900": { "value": "#111827" }
    },
    "red": {
      "500": { "value": "#ef4444" },
      "600": { "value": "#dc2626" }
    },
    "amber": {
      "500": { "value": "#f59e0b" }
    },
    "blue": {
      "500": { "value": "#3b82f6" }
    }
  },
  "typography": {
    "fontFamily": {
      "sans": { "value": "Host Grotesk, system-ui, sans-serif" },
      "display": { "value": "Seriously Nostalgic, Host Grotesk, sans-serif" }
    },
    "fontSize": {
      "xs": { "value": "0.75rem" },
      "sm": { "value": "0.875rem" },
      "base": { "value": "1rem" },
      "lg": { "value": "1.125rem" },
      "xl": { "value": "1.25rem" },
      "2xl": { "value": "1.5rem" },
      "3xl": { "value": "1.875rem" },
      "4xl": { "value": "2.25rem" },
      "5xl": { "value": "3rem" }
    },
    "fontWeight": {
      "normal": { "value": "400" },
      "medium": { "value": "500" },
      "semibold": { "value": "600" },
      "bold": { "value": "700" }
    },
    "lineHeight": {
      "tight": { "value": "1.25" },
      "normal": { "value": "1.5" },
      "relaxed": { "value": "1.75" }
    }
  },
  "spacing": {
    "0": { "value": "0" },
    "1": { "value": "0.25rem" },
    "2": { "value": "0.5rem" },
    "3": { "value": "0.75rem" },
    "4": { "value": "1rem" },
    "5": { "value": "1.25rem" },
    "6": { "value": "1.5rem" },
    "8": { "value": "2rem" },
    "10": { "value": "2.5rem" },
    "12": { "value": "3rem" },
    "16": { "value": "4rem" },
    "20": { "value": "5rem" },
    "24": { "value": "6rem" }
  },
  "borderRadius": {
    "none": { "value": "0" },
    "sm": { "value": "0.25rem" },
    "md": { "value": "0.375rem" },
    "lg": { "value": "0.5rem" },
    "xl": { "value": "0.75rem" },
    "2xl": { "value": "1rem" },
    "full": { "value": "9999px" }
  },
  "shadow": {
    "sm": { "value": "0 1px 2px 0 rgb(0 0 0 / 0.05)" },
    "md": { "value": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" },
    "lg": { "value": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" },
    "xl": { "value": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }
  }
}
```

**Note:** The values above are placeholders. Actual values will be extracted from Figma via MCP.

## Style Dictionary Configuration

```javascript
// src/tokens/style-dictionary.config.js

module.exports = {
  source: ['src/tokens/tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'src/tokens/build/css/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables',
        options: {
          selector: ':root'
        }
      }]
    },
    tailwind: {
      transformGroup: 'js',
      buildPath: 'src/tokens/build/tailwind/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/es6'
      }]
    },
    reactNative: {
      transformGroup: 'react-native',
      buildPath: 'src/tokens/build/rn/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/es6'
      }]
    }
  }
};
```

## Build Commands

```json
// package.json scripts

{
  "scripts": {
    "tokens:build": "style-dictionary build --config src/tokens/style-dictionary.config.js",
    "tokens:clean": "rm -rf src/tokens/build",
    "fonts:convert": "node scripts/convert-fonts.js",
    "icons:generate": "svgr src/icons/svg --out-dir src/icons/components --typescript"
  }
}
```

## Fonts

### Font Roles

| Font | Usage | Weights Needed |
|------|-------|----------------|
| Host Grotesk | Body text, UI elements, buttons, forms | Regular (400), Medium (500), Semibold (600), Bold (700) |
| Seriously Nostalgic | Headlines, hero text, brand moments | Regular (400) |

### Web Implementation

```css
/* src/app/globals.css */

@font-face {
  font-family: 'Host Grotesk';
  src: url('/fonts/web/HostGrotesk-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Host Grotesk';
  src: url('/fonts/web/HostGrotesk-Medium.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Host Grotesk';
  src: url('/fonts/web/HostGrotesk-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Seriously Nostalgic';
  src: url('/fonts/web/SeriouslyNostalgic-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

### React Native Implementation

```javascript
// Link fonts in react-native.config.js (when RN project exists)

module.exports = {
  assets: ['./src/fonts/host-grotesk', './src/fonts/seriously-nostalgic'],
};
```

## Icons

### Workflow

1. **Source:** Streamline HQ Desktop App (Pro account)
2. **Export:** Download needed icons as SVG to `src/icons/svg/`
3. **Generate:** Run `npm run icons:generate` to create React components
4. **Use:** Import from `src/icons/components`

### Naming Convention

| Streamline Name | File Name | Component Name |
|-----------------|-----------|----------------|
| Arrow Left | `arrow-left.svg` | `ArrowLeft` |
| Check Circle | `check-circle.svg` | `CheckCircle` |
| Menu Hamburger | `menu-hamburger.svg` | `MenuHamburger` |

### Icon Component Props

```typescript
interface IconProps {
  size?: number | string;  // Default: 24
  color?: string;          // Default: currentColor
  className?: string;
}

// Usage
<ArrowLeft size={20} color="var(--color-text-primary)" />
```

## Base Components

### Button

```typescript
// src/components/ui/Button.tsx

interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  fullWidth?: boolean;
}

// Variant styles (using CSS variables from tokens)
const variants = {
  primary: 'bg-[var(--color-brand-primary)] text-white hover:opacity-90',
  secondary: 'bg-white border border-[var(--color-border-default)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)]',
  ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)]',
  danger: 'bg-[var(--color-status-error)] text-white hover:opacity-90',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};
```

### Input

```typescript
// src/components/ui/Input.tsx

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

// States
// Default: border-[var(--color-border-default)]
// Focus: border-[var(--color-border-focus)] ring-2 ring-[var(--color-brand-primary)]/20
// Error: border-[var(--color-status-error)]
// Disabled: bg-[var(--color-background-tertiary)] cursor-not-allowed
```

### Card

```typescript
// src/components/ui/Card.tsx

interface CardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

// Base: bg-white rounded-lg border border-[var(--color-border-default)] shadow-sm
// Hover (if interactive): hover:shadow-md hover:border-[var(--color-brand-primary)] transition-all cursor-pointer
```

### Badge

```typescript
// src/components/ui/Badge.tsx

interface BadgeProps {
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

const variants = {
  default: 'bg-[var(--color-background-tertiary)] text-[var(--color-text-secondary)]',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};
```

## Layout Components

### AppShell

```typescript
// src/layouts/AppShell.tsx

interface AppShellProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
}

// Structure
<div className="min-h-screen flex flex-col">
  {header}
  <div className="flex flex-1">
    {sidebar}
    <main className="flex-1">{children}</main>
  </div>
  {footer}
</div>
```

### DashboardLayout

```typescript
// For authenticated routes: /organizer/*, /dashboard/*

// Features:
// - Collapsible sidebar with navigation
// - Header with user menu
// - Breadcrumbs
// - Max-width content area
```

### MarketingLayout

```typescript
// For public routes: /, /camps, /camps/[id]

// Features:
// - Top navigation bar
// - Full-width hero sections
// - Footer with links
```

### AuthLayout

```typescript
// For auth routes: /login, /signup, /forgot-password

// Features:
// - Centered card
// - Logo above card
// - Minimal chrome
// - Optional background pattern/image
```

## Tailwind Integration

```typescript
// tailwind.config.ts

import type { Config } from 'tailwindcss';
import tokens from './src/tokens/build/tailwind/tokens';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: tokens.color,
      fontFamily: {
        sans: [tokens.typography.fontFamily.sans],
        display: [tokens.typography.fontFamily.display],
      },
      fontSize: tokens.typography.fontSize,
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.shadow,
    },
  },
  plugins: [],
};

export default config;
```

## Maintenance Workflow

### Updating Tokens

1. Update design in Figma
2. Export tokens via Figma MCP or plugin
3. Replace `src/tokens/tokens.json`
4. Run `npm run tokens:build`
5. Verify changes in app
6. Commit all changes

### Adding Icons

1. Open Streamline HQ desktop app
2. Find icon, download as SVG
3. Save to `src/icons/svg/` with kebab-case name
4. Run `npm run icons:generate`
5. Import and use new component

### Adding Font Weights

1. Add OTF file to appropriate `src/fonts/` subfolder
2. Run `npm run fonts:convert` to generate WOFF2
3. Add `@font-face` rule to `globals.css`
4. Update tokens.json if needed

## Dependencies

```json
{
  "devDependencies": {
    "style-dictionary": "^3.9.0",
    "@svgr/cli": "^8.1.0"
  }
}
```

## Verification Checklist

- [ ] tokens.json populated with values from Figma
- [ ] Style Dictionary builds without errors
- [ ] CSS variables available in browser dev tools
- [ ] Fonts loading correctly (no FOUT/FOIT issues)
- [ ] All icon SVGs converted to components
- [ ] Button renders all variants correctly
- [ ] Input shows all states (default, focus, error, disabled)
- [ ] Card hover effect works
- [ ] Badge variants display correctly
- [ ] DashboardLayout renders with sidebar
- [ ] MarketingLayout renders with header/footer
- [ ] AuthLayout centers content correctly
