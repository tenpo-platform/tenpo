# Icons

## Workflow

1. **Source:** Streamline HQ Desktop App (Pro account)
2. **Export:** Download as SVG to `svg/`
3. **Use:** Import directly in components

## Naming Convention

| Streamline Name | File Name |
|-----------------|-----------|
| Arrow Left | `arrow-left.svg` |
| Check Circle | `check-circle.svg` |

## Usage

```tsx
import ArrowLeft from '@/icons/svg/arrow-left.svg'

// Or use next/image for optimization
import Image from 'next/image'
import arrowLeft from '@/icons/svg/arrow-left.svg'

<Image src={arrowLeft} alt="Arrow left" />
```

## Optional: Generate React Components

```bash
yarn add -D @svgr/cli
npx svgr svg --out-dir components --typescript
```
