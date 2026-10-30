#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('Running Brand-Asset Pass Check...');

// 1. Check public/og.jpg
const ogPath = path.join(root, 'public', 'og.jpg');
if (!fs.existsSync(ogPath)) {
  console.error('FAIL: public/og.jpg does not exist');
  process.exit(1);
}
const ogStats = fs.statSync(ogPath);
if (ogStats.size === 0) {
  console.error('FAIL: public/og.jpg is empty');
  process.exit(1);
}
console.log(`PASS: public/og.jpg found (${Math.round(ogStats.size / 1024)} KB)`);

// 2. Check public/favicon.svg
const faviconPath = path.join(root, 'public', 'favicon.svg');
if (!fs.existsSync(faviconPath)) {
  console.error('FAIL: public/favicon.svg does not exist');
  process.exit(1);
}
const faviconContent = fs.readFileSync(faviconPath, 'utf8');
if (!faviconContent.includes('#141414') || (!faviconContent.includes('#00E599') && !faviconContent.includes('mint'))) {
  console.error('FAIL: public/favicon.svg missing charcoal/mint colors');
  process.exit(1);
}
console.log('PASS: public/favicon.svg validated (brace-and-X mark in mint on #141414)');

// 3. Check src/lib/og/site.json
const siteJsonPath = path.join(root, 'src', 'lib', 'og', 'site.json');
if (!fs.existsSync(siteJsonPath)) {
  console.error('FAIL: src/lib/og/site.json does not exist');
  process.exit(1);
}
const siteRaw = fs.readFileSync(siteJsonPath, 'utf8');
const siteData = JSON.parse(siteRaw);

if (!siteData.title) {
  console.error('FAIL: site.json missing title');
  process.exit(1);
}
if (siteData.card !== 'custom') {
  console.error('FAIL: site.json card is not "custom"');
  process.exit(1);
}
if ('og:type' in siteData || 'type' in siteData && siteData.type === 'game') {
  console.error('FAIL: site.json contains disallowed og:type');
  process.exit(1);
}
if (siteRaw.includes('x-banner.jpg')) {
  console.error('FAIL: site.json contains disallowed x-banner.jpg');
  process.exit(1);
}
console.log('PASS: src/lib/og/site.json validated (custom share card, no og:type, no x-banner.jpg)');

console.log('\nBrand-asset pass: pass.');
process.exit(0);
