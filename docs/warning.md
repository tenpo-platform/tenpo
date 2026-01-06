## Font Licensing Risk

Confirm commercial web and mobile app usage rights for Seriously Nostalgic and Host Grotesk fonts before launch — designer-provided fonts may not include proper licenses.

## Dimension Problems

- **Favicon (180x173):** Not square — must be regenerated as square (16x16, 32x32, 192x192, 512x512) from Figma
- **Icon (535x512):** Slightly off — low priority, but ideally square at 512x512

## Bundle Size Target Not Met

**Status:** The PRD target of < 50 KB JS for public pages is NOT achievable with current stack.

### Actual Bundle Sizes (Gzipped)

| Route | Size | Original Target |
|-------|------|-----------------|
| `/` (landing) | ~126 KB | < 40 KB |
| `/ds` (demo) | ~241 KB | N/A |

### Root Cause

The baseline framework overhead alone is **~116 KB gzipped**:

| Component | Gzipped |
|-----------|---------|
| React 19 + Next.js 16 | ~68 KB |
| Next.js App Router runtime | ~39 KB |
| Turbopack + app glue | ~9 KB |

This is **before any application code**.

### Contributing Factors

1. **Next.js 16 + React 19** — Larger than previous versions
2. **App Router** — Inherently heavier than Pages Router (~30-40% more)
3. **Sentry integration** — Adds telemetry/tracing code
4. **Turbopack** — Different chunking strategy than Webpack

### Recommendations

1. **Update targets** — Revise to < 150 KB for public pages (realistic for modern Next.js)
2. **The design system is NOT the problem** — shadcn components are lightweight and tree-shake well
3. **If bundle size is critical:**
   - Remove Sentry from public pages (lazy-load for logged-in users only)
   - Consider Pages Router for marketing pages
   - Use `next/dynamic` for heavy components

### Notes

- The `/ds` demo page loads ALL 30 components — not representative of real pages
- Production pages with 3-5 components will be much smaller
- Polyfills (~38 KB) only load in older browsers
