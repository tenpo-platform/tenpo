#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Generates index.ts for icon components after SVGR runs
 */
const fs = require('fs')
const path = require('path')

const componentsDir = path.join(__dirname, '../src/icons/components')

// Get all .tsx files (excluding index.ts)
const files = fs.readdirSync(componentsDir)
  .filter(f => f.endsWith('.tsx') && f !== 'index.tsx')
  .sort()

if (files.length === 0) {
  console.log('No icon components found')
  process.exit(0)
}

// Generate export lines
const exportLines = files.map(file => {
  const name = file.replace('.tsx', '')
  return `export { default as ${name} } from './${name}'`
})

const content = `// Auto-generated - do not edit manually
// Run \`yarn icons:generate\` to regenerate

${exportLines.join('\n')}
`

fs.writeFileSync(path.join(componentsDir, 'index.ts'), content)
console.log(`Generated index.ts with ${files.length} icon(s): ${files.map(f => f.replace('.tsx', '')).join(', ')}`)
