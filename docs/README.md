# radicalkjax.com — Documentation

The personal "business card" site and blog of Kali Jackson. It's an English-only
[Jekyll](https://jekyllrb.com/) site hosted on GitHub Pages with a cyberpunk /
hacker aesthetic (deep purple `#6d105a`, DM Mono everywhere).

For the visual language — colors, type, spacing, components — see
[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).

## Running locally

Requires Ruby (see `.ruby-version`) and Bundler.

```bash
git clone https://github.com/radicalkjax/blog.git
cd blog
bundle install
bundle exec jekyll serve   # http://localhost:4000
```

Jekyll rebuilds and live-reloads on save. `npm start` runs the same serve command
bound to `0.0.0.0:4000`.

### Linting / formatting

Node tooling is dev-only (no test suite, no git hooks):

```bash
npm run lint      # eslint assets/js + stylelint assets/css (both --fix)
npm run format    # prettier across js/css/md/yml/json
npm run build     # bundle exec jekyll build
```

## Deployment

Pushing to `main` triggers `.github/workflows/pages.yml`, which builds the site
with `JEKYLL_ENV=production` and deploys it to GitHub Pages. The custom domain is
set via the `CNAME` file. `.github/workflows/ci.yml` build-tests every push and
pull request. No manual deploy step.

## Repository layout

```
blog/
├── index.html              # homepage
├── offline.html            # PWA offline fallback
├── _config.yml             # Jekyll config
├── _layouts/               # default.html, post.html
├── _includes/              # somafm-player.html, structured-data.html
├── _posts/                 # blog posts (YYYY-MM-DD-title.md)
├── pages/                  # about, art, blog, connections, projects,
│                           #   subscribe, thank-you
├── projects/               # rocket-pup, caliphoria, malwarEvangelist,
│                           #   presentations
├── art/                    # photos, other-things
├── about/                  # trans-journey.html (scrollytelling)
├── assets/
│   ├── css/                # global stylesheets + pages/ (per-page)
│   │                       #   + mermaid-/scrollytelling- modules
│   └── js/                 # global scripts + pages/ (per-page)
│                           #   + mermaid/ print/ scrollytelling/ modules
├── feed.xml, sitemap.xml, robots.txt, manifest.json, service-worker.js
└── docs/                   # this folder (excluded from the build)
```

## Content

- **Blog posts** live in `_posts/` as `YYYY-MM-DD-title.md` with `layout: post`
  and a `tags` list in front matter.
- **Pages, projects, and art** are HTML + Liquid using `layout: default`.
- **Per-page CSS/JS** is opt-in: list files in the `page_css` and `page_js`
  front-matter arrays and the matching `assets/css/pages/` and
  `assets/js/pages/` files load only on that page.
- Heavier features (Mermaid diagrams, MathJax, print/PDF, the trans-journey
  scrollytelling) load as ES-module bundles from their `assets/js/<feature>/`
  subfolders.
