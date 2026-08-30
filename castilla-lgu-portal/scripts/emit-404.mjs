// Netlify serves a file named 404.html, at the publish root, with a real 404
// status for any address that has no file of its own. Angular prerenders the
// not-found page to 404/index.html, so this puts a copy where the host looks
// for it.
//
// Without this the site would answer 200 for every wrong address — the state
// F-15 describes — because a client-side router cannot set a status code.
import { copyFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const publishDir = 'dist/castilla-lgu-portal/browser';
const source = join(publishDir, '404', 'index.html');
const target = join(publishDir, '404.html');

try {
  await access(source);
} catch {
  // Fail the build rather than deploy a site whose 404s silently return 200.
  console.error(`emit-404: ${source} is missing — the /404 route did not prerender.`);
  process.exit(1);
}

await copyFile(source, target);
console.log(`emit-404: wrote ${target}`);
