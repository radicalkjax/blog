import { readFileSync, mkdirSync, rmSync, cpSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parse } from 'yaml';

const decks = parse(readFileSync('_data/presentations.yml', 'utf8'));
const base = (process.env.SITE_BASEURL || '').replace(/\/$/, '');
if (base && !/^\/[a-zA-Z0-9/_-]+$/.test(base)) throw new Error('Invalid SITE_BASEURL');
const slugs = new Set();
const reserved = new Set(['layouts', 'styles', 'svgfiles', 'assets', 'components', 'setup', 'public']);
for (const { slug, title, description } of decks) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slugs.has(slug) || reserved.has(slug)) throw new Error(`Invalid or duplicate deck slug: ${slug}`);
  slugs.add(slug);
  const output = resolve('.slides-dist', slug);
  const destination = resolve('projects/presentations', slug);
  rmSync(output, { recursive: true, force: true });
  const result = spawnSync(resolve('node_modules/.bin/slidev'), [
    'build', `projects/presentations/${slug}.md`, '--base', `${base}/projects/presentations/${slug}/`,
    '--out', output, '--without-notes',
  ], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(destination, { recursive: true });
  cpSync(output, destination, { recursive: true });
  // Slidev preloads raw HTML image paths as well as Vite's bundled URLs.
  cpSync(resolve('projects/presentations/svgfiles'), resolve(destination, 'svgfiles'), { recursive: true });
  cpSync(resolve('projects/presentations/assets'), resolve(destination, 'assets'), { recursive: true });
  // Jekyll treats this as a static directory; rebuild slides before Jekyll.
  writeFileSync(resolve(destination, '.nojekyll'), '');
  // The catalog opens a blog page; its iframe loads the standalone Slidev app.
  const deckUrl = `${base}/projects/presentations/${slug}/`;
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  writeFileSync(resolve(destination, 'view.html'), `---
layout: default
title: ${JSON.stringify(title)}
page_css:
  - /assets/css/connections.css
  - /assets/css/pages/presentations.css
page_js:
  - /assets/js/pages/presentations.js
---
<div class="connections-container"><section class="connections-section">
  <a class="presentation-back" href="${base}/projects/presentations.html">← All presentations</a>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <div class="presentation-container"><iframe class="presentation-frame" src="${deckUrl}" title="${escapeHtml(title)}" allow="fullscreen; screen-wake-lock" allowfullscreen></iframe></div>
  <p class="u-note">Click the slides, then use the arrow keys to navigate.</p>
  <div class="presentation-actions">
    <button type="button" data-presentation-fullscreen>Fullscreen</button>
    <a href="${deckUrl}" target="_blank" rel="noopener">Open slides ↗</a>
    <a href="https://github.com/radicalkjax/blog/blob/main/projects/presentations/${slug}.md" target="_blank" rel="noopener">View source ↗</a>
  </div>
  <p role="status" data-presentation-status></p>
</section></div>
`);
}
