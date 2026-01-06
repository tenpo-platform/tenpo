# Logo Asset Warnings

Issues discovered during logo import that may need design attention.

## Dimension Problems

### Favicon - Not Square
- **Files affected:** `favicon-chalk.svg`, `favicon-carbon.svg`
- **Current size:** 180x173 (not square)
- **Problem:** Favicons must be square (16x16, 32x32, 48x48, 192x192, 512x512)
- **Impact:** Cannot be used as-is for browser favicons
- **Fix needed:** Regenerate as square from design source

### Icon - Not Square
- **Files affected:** `icon-light.svg`, `icon-dark.svg`
- **Current size:** 535x512
- **Problem:** Slightly non-square ratio
- **Impact:** Minor - SVG scales fine, but could cause alignment issues
- **Fix needed:** Low priority, but ideally should be square

## Recommendations

1. **Regenerate favicons** as proper square dimensions from Figma/design source
2. **Consider providing** standard favicon sizes: 16x16, 32x32, 180x180 (Apple touch), 192x192, 512x512
3. **Icon could be squared** to 512x512 for consistency

## Files Not Imported (By Design)

The following were intentionally skipped during import:
- All `.jpg` files (no transparency support)
- All `.png` files where `.svg` exists (redundant)
- "with box" variants (edge case, adds clutter)
- Profile Picture folder (duplicate of Icon)
- `.DS_Store` files (macOS system files)
