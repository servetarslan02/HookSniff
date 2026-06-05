/**
 * Batch-fix all test files that use render() from @testing-library/react
 * to use renderWithProviders() from test-utils instead.
 * 
 * This adds QueryClientProvider wrapping without changing any test logic.
 */
const fs = require('fs');
const path = require('path');

const testsDir = path.join(__dirname, 'src', '__tests__');
const testUtilsRelPath = './test-utils';

const files = fs.readdirSync(testsDir).filter(f => f.endsWith('.test.tsx'));

let fixedCount = 0;
let skippedCount = 0;

for (const file of files) {
  const filePath = path.join(testsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Skip if already uses renderWithProviders
  if (content.includes('renderWithProviders')) {
    console.log(`SKIP (already fixed): ${file}`);
    skippedCount++;
    continue;
  }
  
  // Skip if doesn't import render from @testing-library/react
  if (!content.includes("from '@testing-library/react'") || !content.includes('render')) {
    console.log(`SKIP (no render): ${file}`);
    skippedCount++;
    continue;
  }
  
  // Check if file uses render() calls (not just importing it)
  const renderCallRegex = /\brender\s*\(/g;
  if (!renderCallRegex.test(content)) {
    console.log(`SKIP (no render calls): ${file}`);
    skippedCount++;
    continue;
  }
  
  // Strategy: Add import for renderWithProviders, then replace render() calls
  // But we need to be careful not to replace things like "rerender" or "renderToString"
  
  // 1. Add import after the @testing-library/react import line
  const importLine = `import { renderWithProviders } from '${testUtilsRelPath}';`;
  
  // Find the @testing-library/react import and add our import after it
  const importRegex = /(import\s*\{[^}]*\}\s*from\s*'@testing\/library\/react';)/;
  if (importRegex.test(content)) {
    content = content.replace(importRegex, `$1\n${importLine}`);
  } else {
    // Add at top after first import
    content = importLine + '\n' + content;
  }
  
  // 2. Replace standalone render( calls with renderWithProviders(
  // Match "render(" but not "rerender(", "renderToString(", etc.
  // We need to be careful: render can be called as:
  //   render(<Component />)
  //   const { getByText } = render(<Component />)
  //   render(ui, { wrapper: ... })
  
  // Replace: at start of statement or after = or after (
  content = content.replace(/(?<=[=({,\n\s])render\(/g, 'renderWithProviders(');
  // Also handle cases where render is at the start of a line
  content = content.replace(/^render\(/gm, 'renderWithProviders(');
  
  // Handle destructured render: "const { render, ... } = ..." - we don't want to change this
  // But we already added the import, so the original import still has render
  // The render from @testing-library/react is still available but unused - that's fine
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`FIXED: ${file}`);
  fixedCount++;
}

console.log(`\nDone: ${fixedCount} fixed, ${skippedCount} skipped`);
