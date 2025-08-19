# Modern Web Standards Checklist for Jekyll Theme

## Overview
This document outlines modern web development standards and best practices to implement in the globalized Jekyll theme.

## HTML5 Standards

### Semantic HTML
- [ ] Use semantic elements (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`)
- [ ] Proper heading hierarchy (h1-h6)
- [ ] Use `<figure>` and `<figcaption>` for images
- [ ] Implement `<time>` element with datetime attribute
- [ ] Use `<details>` and `<summary>` for collapsible content
- [ ] Proper form elements with labels

### Meta Tags
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="{{ page.description }}">
<meta property="og:title" content="{{ page.title }}">
<meta property="og:description" content="{{ page.description }}">
<meta property="og:image" content="{{ page.image }}">
<meta property="og:locale" content="{{ site.locale }}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="{{ page.url | absolute_url }}">
```

## CSS Modern Practices

### CSS Custom Properties (CSS Variables)
```css
:root {
  /* Colors */
  --color-primary: #6d105a;
  --color-secondary: #ffffff;
  --color-accent: #ff6b6b;
  --color-background: #1a1a1a;
  --color-text: #ffffff;
  
  /* Typography */
  --font-family-heading: 'DM Mono', monospace;
  --font-family-body: 'DM Mono', monospace;
  --font-size-base: 16px;
  --line-height-base: 1.6;
  
  /* Spacing */
  --spacing-unit: 8px;
  --spacing-xs: calc(var(--spacing-unit) * 0.5);
  --spacing-sm: var(--spacing-unit);
  --spacing-md: calc(var(--spacing-unit) * 2);
  --spacing-lg: calc(var(--spacing-unit) * 3);
  --spacing-xl: calc(var(--spacing-unit) * 4);
  
  /* Layout */
  --container-width: 1200px;
  --sidebar-width: 300px;
  --header-height: 80px;
  
  /* Animations */
  --transition-speed: 0.3s;
  --animation-curve: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #0a0a0a;
    --color-text: #f0f0f0;
  }
}
```

### CSS Grid & Flexbox
```css
/* Grid Layout */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-md);
  grid-auto-flow: dense;
}

/* Flexbox Layout */
.flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  justify-content: space-between;
  align-items: center;
}

/* Container Queries (when supported) */
@container (min-width: 700px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
```

### Modern CSS Features
```css
/* Logical Properties */
.element {
  margin-inline: auto;
  padding-block: var(--spacing-md);
  border-inline-start: 2px solid var(--color-primary);
}

/* Aspect Ratio */
.video-container {
  aspect-ratio: 16 / 9;
}

/* Clamp for Responsive Typography */
h1 {
  font-size: clamp(1.5rem, 4vw, 3rem);
}

/* CSS Shapes */
.float-shape {
  shape-outside: circle(50%);
  clip-path: circle(50%);
}

/* Scroll Snap */
.carousel {
  scroll-snap-type: x mandatory;
}

.carousel-item {
  scroll-snap-align: center;
}
```

## JavaScript ES6+ Features

### Module System
```javascript
// navigation.js
export class Navigation {
  constructor(selector) {
    this.element = document.querySelector(selector);
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.setupIntersectionObserver();
  }
  
  setupEventListeners() {
    this.element?.addEventListener('click', this.handleClick.bind(this));
  }
  
  handleClick(event) {
    // Handle navigation clicks
  }
  
  setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      { threshold: 0.1 }
    );
    
    document.querySelectorAll('section').forEach(section => {
      observer.observe(section);
    });
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Update active navigation item
      }
    });
  }
}

// main.js
import { Navigation } from './modules/navigation.js';

document.addEventListener('DOMContentLoaded', () => {
  const nav = new Navigation('.site-navigation');
});
```

### Modern JavaScript APIs
```javascript
// Web Components
class LanguageSwitcher extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.render();
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
      </style>
      <select>
        ${this.getLanguageOptions()}
      </select>
    `;
  }
}

customElements.define('language-switcher', LanguageSwitcher);

// Async/Await
async function fetchTranslations(language) {
  try {
    const response = await fetch(`/api/translations/${language}.json`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch translations:', error);
    return null;
  }
}

// Optional Chaining & Nullish Coalescing
const title = document.querySelector('.title')?.textContent ?? 'Default Title';

// Array Methods
const filteredPosts = posts
  .filter(post => post.published)
  .map(post => ({
    ...post,
    formattedDate: new Intl.DateTimeFormat('en-US').format(post.date)
  }))
  .sort((a, b) => b.date - a.date);
```

## Performance Optimization

### Resource Loading
```html
<!-- Preload critical resources -->
<link rel="preload" href="/assets/fonts/dm-mono.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/css/critical.css" as="style">

<!-- Prefetch next page resources -->
<link rel="prefetch" href="/next-page.html">

<!-- DNS Prefetch for external domains -->
<link rel="dns-prefetch" href="https://cdn.example.com">

<!-- Preconnect to required origins -->
<link rel="preconnect" href="https://fonts.googleapis.com">
```

### Lazy Loading
```html
<!-- Native lazy loading for images -->
<img src="placeholder.jpg" 
     data-src="actual-image.jpg" 
     loading="lazy" 
     alt="Description">

<!-- Intersection Observer for custom lazy loading -->
<script>
const lazyImages = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      imageObserver.unobserve(img);
    }
  });
});

lazyImages.forEach(img => imageObserver.observe(img));
</script>
```

### Critical CSS
```html
<!-- Inline critical CSS -->
<style>
  /* Critical above-the-fold styles */
  :root { --color-primary: #6d105a; }
  body { margin: 0; font-family: 'DM Mono', monospace; }
  .header { /* ... */ }
</style>

<!-- Load non-critical CSS asynchronously -->
<link rel="preload" href="/assets/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/assets/css/main.css"></noscript>
```

## Progressive Web App (PWA)

### Web App Manifest
```json
{
  "name": "Jekyll Theme Globalized",
  "short_name": "JTG",
  "description": "A modern internationalized Jekyll theme",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#6d105a",
  "theme_color": "#6d105a",
  "icons": [
    {
      "src": "/assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker
```javascript
// sw.js
const CACHE_NAME = 'jekyll-theme-v1';
const urlsToCache = [
  '/',
  '/assets/css/main.css',
  '/assets/js/main.js',
  '/offline.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('/offline.html'))
  );
});
```

## Accessibility (WCAG 2.1 AA)

### ARIA Attributes
```html
<!-- Navigation -->
<nav role="navigation" aria-label="Main navigation">
  <ul role="list">
    <li role="listitem">
      <a href="/" aria-current="page">Home</a>
    </li>
  </ul>
</nav>

<!-- Language Switcher -->
<div role="group" aria-label="Language selection">
  <button aria-expanded="false" aria-controls="language-menu">
    <span aria-live="polite">Current language: English</span>
  </button>
  <ul id="language-menu" role="list" aria-hidden="true">
    <!-- Language options -->
  </ul>
</div>

<!-- Skip Links -->
<a href="#main" class="skip-link">Skip to main content</a>
<a href="#navigation" class="skip-link">Skip to navigation</a>
```

### Keyboard Navigation
```css
/* Focus Styles */
:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Skip Links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary);
  color: white;
  padding: var(--spacing-sm);
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### Color Contrast
```css
/* Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text) */
:root {
  --color-text: #ffffff; /* On #6d105a background = 7.2:1 ratio ✓ */
  --color-link: #66d9ef; /* On #1a1a1a background = 8.3:1 ratio ✓ */
}
```

## SEO Best Practices

### Structured Data
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "{{ site.title }}",
  "url": "{{ site.url }}",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "{{ site.url }}/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>

<!-- Article structured data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{{ page.title }}",
  "datePublished": "{{ page.date | date_to_xmlschema }}",
  "author": {
    "@type": "Person",
    "name": "{{ page.author }}"
  }
}
</script>
```

### Meta Tags & Open Graph
```html
<!-- SEO Meta Tags -->
<meta name="description" content="{{ page.description | default: site.description }}">
<meta name="keywords" content="{{ page.keywords | join: ', ' }}">
<meta name="author" content="{{ page.author | default: site.author }}">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:title" content="{{ page.title }}">
<meta property="og:description" content="{{ page.description }}">
<meta property="og:image" content="{{ page.image | absolute_url }}">
<meta property="og:url" content="{{ page.url | absolute_url }}">

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@{{ site.twitter_username }}">
<meta name="twitter:title" content="{{ page.title }}">
<meta name="twitter:description" content="{{ page.description }}">
<meta name="twitter:image" content="{{ page.image | absolute_url }}">
```

## Security Best Practices

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
               font-src 'self' https://fonts.gstatic.com; 
               img-src 'self' data: https:;">
```

### Security Headers
```html
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
<meta http-equiv="X-XSS-Protection" content="1; mode=block">
<meta name="referrer" content="strict-origin-when-cross-origin">
```

## Browser Support

### Target Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

### Progressive Enhancement
```css
/* Base styles for all browsers */
.grid {
  display: block;
}

/* Enhanced layout for modern browsers */
@supports (display: grid) {
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

/* Dark mode for supporting browsers */
@media (prefers-color-scheme: dark) {
  :root {
    --color-scheme: dark;
  }
}
```

## Testing Checklist

### Automated Testing
- [ ] HTML validation (W3C Validator)
- [ ] CSS validation (W3C CSS Validator)
- [ ] JavaScript linting (ESLint)
- [ ] Accessibility testing (axe-core)
- [ ] Performance testing (Lighthouse)
- [ ] SEO testing (Google Search Console)

### Manual Testing
- [ ] Cross-browser testing
- [ ] Mobile responsiveness
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Print stylesheet
- [ ] Offline functionality
- [ ] Form validation
- [ ] Error handling

### Performance Metrics
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Total Blocking Time < 300ms
- [ ] Cumulative Layout Shift < 0.1
- [ ] Time to Interactive < 3.8s

## Conclusion
This checklist ensures the Jekyll theme follows modern web standards, providing a solid foundation for a performant, accessible, and maintainable website that works across all modern browsers and devices.