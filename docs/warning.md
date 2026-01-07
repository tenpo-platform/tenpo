## Font Licensing Risk

Confirm commercial web and mobile app usage rights for Seriously Nostalgic and Host Grotesk fonts before launch — designer-provided fonts may not include proper licenses.

## Dimension Problems

- **Favicon (180x173):** Not square — must be regenerated as square (16x16, 32x32, 192x192, 512x512) from Figma
- **Icon (535x512):** Slightly off — low priority, but ideally square at 512x512

## Bundle Size Target Not Met

PRD target of < 50 KB not achievable — React 19 + Next.js 16 App Router baseline is ~116 KB gzipped before any app code.

**Recommendation:** Revise target to < 150 KB for public pages. The design system is not the problem — shadcn tree-shakes well.
