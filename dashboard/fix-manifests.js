#!/usr/bin/env node
/**
 * Post-build fix: ensure page_client-reference-manifest.js exists for all
 * route-group root pages referenced in .nft.json files.
 *
 * Next.js 15 + App Router route groups (e.g. (dashboard)) don't generate
 * page_client-reference-manifest.js for the route group root page.
 * Vercel's NFT tracing step expects it → build fails with ENOENT.
 *
 * This script scans .nft.json files, checks which ones reference
 * page_client-reference-manifest.js, and creates empty placeholders
 * where they're missing.
 */

const fs = require('fs');
const path = require('path');

const NEXT_DIR = path.join(__dirname, '.next', 'server');

function findNftFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findNftFiles(full));
    } else if (entry.name === 'page.js.nft.json') {
      results.push(full);
    }
  }
  return results;
}

let fixed = 0;

for (const nftPath of findNftFiles(NEXT_DIR)) {
  try {
    const nft = JSON.parse(fs.readFileSync(nftPath, 'utf8'));
    const files = nft.fileList || nft.files || [];
    const needsManifest = files.some(f => f.includes('page_client-reference-manifest'));
    if (!needsManifest) continue;

    const manifestPath = path.join(path.dirname(nftPath), 'page_client-reference-manifest.js');
    if (fs.existsSync(manifestPath)) continue;

    // Create empty placeholder manifest
    fs.writeFileSync(manifestPath, '{};\n');
    fixed++;
    console.log(`✅ Created: ${path.relative(process.cwd(), manifestPath)}`);
  } catch (e) {
    console.warn(`⚠️ Error processing ${nftPath}: ${e.message}`);
  }
}

if (fixed > 0) {
  console.log(`\n🎉 Fixed ${fixed} missing manifest(s)`);
} else {
  console.log('✅ All manifests present');
}
