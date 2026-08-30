// Runs after `ng build`, over the prerendered output.
//
// Two jobs, both of which exist so that a fact about the site cannot drift
// away from the site itself.
//
// 1. 404.html — Netlify serves a file of that name, at the publish root, with
//    a real 404 status for any address that has no file of its own. Angular
//    prerenders the not-found page to 404/index.html; this puts a copy where
//    the host looks. Without it every wrong address answers 200, which is the
//    state F-15 describes, because a client-side router cannot set a status.
//
// 2. sitemap.xml — derived by walking the HTML that was actually emitted,
//    rather than from a hand-kept list. A hand-kept list can name a page that
//    no longer exists or miss one that does; this one cannot. URLs carry the
//    trailing slash Netlify canonicalises to, so a crawler reaches 200
//    directly instead of a 301 on every entry.
import { copyFile, access, readdir, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const publishDir = 'dist/castilla-lgu-portal/browser';
const origin = 'https://castilla-ebpco.online';

// ---- 404.html -------------------------------------------------------------
const notFoundSource = join(publishDir, '404', 'index.html');
try {
  await access(notFoundSource);
} catch {
  console.error(`postbuild: ${notFoundSource} is missing — the /404 route did not prerender.`);
  process.exit(1);
}
await copyFile(notFoundSource, join(publishDir, '404.html'));
console.log('postbuild: wrote 404.html');

// ---- sitemap.xml ----------------------------------------------------------
async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name === 'index.html') yield full;
  }
}

const routes = [];
for await (const file of htmlFiles(publishDir)) {
  const dirPath = relative(publishDir, file).split(sep).slice(0, -1).join('/');
  if (dirPath === '404') continue; // never advertise the not-found page
  routes.push(dirPath ? `/${dirPath}/` : '/');
}
routes.sort();

const changefreq = (route) => (route === '/' || route === '/announcements/' ? 'weekly' : 'monthly');
const body = routes
  .map((r) => `  <url>\n    <loc>${origin}${r}</loc>\n    <changefreq>${changefreq(r)}</changefreq>\n  </url>`)
  .join('\n');

await writeFile(
  join(publishDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
);
console.log(`postbuild: wrote sitemap.xml with ${routes.length} urls`);
