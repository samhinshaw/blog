import { access } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = 'dist';
const expected = [
  '/',
  '/about/',
  '/projects/',
  '/blog/',
  '/tags/',
  '/blog/automatically-update-rstudio/',
  '/blog/installing-node-js-on-linux/',
  '/blog/ligature-support-in-monospace-fonts/',
  '/blog/wrapping-template-literals-in-vs-code/',
  '/blog/lazy-loading-r-packages-in-shiny/',
  '/blog/designing-rudaux/',
  '/blog/using-rudaux/',
];

let ok = true;
for (const url of expected) {
  try {
    await access(join(DIST, url, 'index.html'));
    console.log(`OK   ${url}`);
  } catch {
    console.log(`MISS ${url}`);
    ok = false;
  }
}
if (!ok) {
  console.error('\nURL check FAILED');
  process.exit(1);
}
console.log('\nAll expected URLs present.');
