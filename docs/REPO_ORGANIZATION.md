# Repository Organization Guide

## Date: September 1, 2025

## Overview
This document describes the organized structure of the Jekyll blog repository following modern Jekyll best practices.

## Directory Structure

```
blog/
├── _config/            # Deployment and server configurations
│   ├── _headers       # Security headers for web server
│   ├── nginx.conf     # Nginx configuration example
│   └── vercel.json    # Vercel deployment config
├── _data/             # Data files for Jekyll (multi-language support)
├── _feeds/            # Alternative feed formats
│   ├── atom.xml      # Atom feed
│   └── feed.json     # JSON feed
├── _i18n/             # Internationalization files
├── _includes/         # Reusable HTML partials
├── _layouts/          # Page layouts
├── _plugins/          # Jekyll plugins
├── _posts/            # Blog posts (YYYY-MM-DD-title.md format)
├── _sass/             # SCSS/Sass files
├── _tests/            # Test scripts and debugging tools
├── about/             # About section pages
├── art/               # Art portfolio pages
├── assets/            # Static assets
│   ├── css/          # Compiled CSS
│   ├── fonts/        # Web fonts
│   ├── images/       # Images and icons
│   ├── js/           # JavaScript files
│   └── post_resources/ # Resources for blog posts
├── docs/              # Documentation
├── pages/             # Static pages (moved from root)
│   ├── about.html
│   ├── art.html
│   ├── blog.html
│   ├── connections.html
│   ├── projects.html
│   └── subscribe.html
├── projects/          # Project showcase pages
└── photos/            # Photo gallery

## Root Files (Minimal)
- _config.yml         # Jekyll configuration
- .gitignore         # Git ignore rules
- CNAME             # GitHub Pages custom domain
- feed.xml          # Primary RSS feed
- Gemfile           # Ruby dependencies
- index.html        # Homepage
- manifest.json     # PWA manifest
- offline.html      # Offline page for PWA
- package.json      # Node dependencies
- README.md         # Project readme
- robots.txt        # SEO robots file
- service-worker.js # PWA service worker
- sitemap.xml       # XML sitemap

## Key Changes Made

### 1. Moved from Root
- Page files → `/pages/`
- Test scripts → `/_tests/`
- Deployment configs → `/_config/`
- Alternative feeds → `/_feeds/`
- Multiple lighthouse report files removed

### 2. Removed
- Duplicate `includes/` directory
- Temporary files and backups
- Packaged theme directory (`jekyll-theme-globalized/`)

### 3. Updated
- `_config.yml` to reflect new paths
- Navigation links in `_includes/header.html`
- `.gitignore` for better coverage

## Benefits
1. **Cleaner root**: Only essential files remain in root
2. **Better organization**: Related files grouped together
3. **Jekyll standards**: Follows modern Jekyll conventions
4. **Maintainability**: Easier to find and manage files
5. **Scalability**: Structure supports growth

## Navigation Path Updates
All internal navigation has been updated to use absolute paths:
- `/pages/[page].html` for static pages
- `/projects/[project].html` for project pages
- `/art/[gallery].html` for art pages

## Testing
Run `bundle exec jekyll build` to verify the site builds correctly with the new structure.