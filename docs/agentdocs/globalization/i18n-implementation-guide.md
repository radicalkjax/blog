# Internationalization (i18n) Implementation Guide

## Overview
This guide outlines the approach for implementing internationalization in the Jekyll website to support multiple languages and locales.

## Recommended Solution: Jekyll-polyglot

### Why Jekyll-polyglot?
- **GitHub Pages Compatible**: Works with GitHub Pages safe mode
- **SEO Friendly**: Automatic hreflang tags and sitemap generation
- **Fallback Support**: Graceful fallback to default language
- **URL Structure**: Clean URL structure with language codes
- **Active Development**: Well-maintained with regular updates

## Implementation Architecture

```
_i18n/
├── en/                    # English (default)
│   ├── _posts/           # Blog posts in English
│   ├── about.md          # About page content
│   ├── projects.md       # Projects content
│   └── site.yml          # UI strings and metadata
├── es/                    # Spanish
│   ├── _posts/
│   ├── about.md
│   ├── projects.md
│   └── site.yml
├── fr/                    # French
│   ├── _posts/
│   ├── about.md
│   ├── projects.md
│   └── site.yml
└── ja/                    # Japanese
    ├── _posts/
    ├── about.md
    ├── projects.md
    └── site.yml
```

## Configuration Changes

### _config.yml Updates
```yaml
# Internationalization
languages: ["en", "es", "fr", "ja", "zh", "ar", "de", "pt"]
default_lang: "en"
exclude_from_localization: ["assets", "js", "css", "fonts"]
parallel_localization: true

# Language names for display
language_names:
  en: "English"
  es: "Español"
  fr: "Français"
  ja: "日本語"
  zh: "中文"
  ar: "العربية"
  de: "Deutsch"
  pt: "Português"

# Polyglot configuration
plugins:
  - jekyll-polyglot

# Site metadata per language
site_data:
  en:
    title: "KALI JACKSON (@RADICALKJAX)"
    description: "Personal website and blog"
  es:
    title: "KALI JACKSON (@RADICALKJAX)"
    description: "Sitio web personal y blog"
  fr:
    title: "KALI JACKSON (@RADICALKJAX)"
    description: "Site web personnel et blog"
```

## String Extraction Strategy

### Phase 1: UI Elements
Extract all hardcoded strings from layouts and includes:

#### Header Navigation
```yaml
# _i18n/en/site.yml
navigation:
  blog: "Blog"
  projects: "Projects"
  art: "Art"
  about: "About Me"
  journey: "Personal Journey"
  connections: "Connections"
  
dropdown:
  photos: "Photos"
  other_things: "Other Things"
  rocket_pup: "Rocket Pup"
  caliphoria: "Caliphoria"
  wattz: "Wattz"
  presentations: "Presentations"
```

#### Common UI Elements
```yaml
ui:
  read_more: "Read more"
  back_to_top: "Back to top"
  search: "Search"
  tags: "Tags"
  categories: "Categories"
  share: "Share"
  previous: "Previous"
  next: "Next"
```

### Phase 2: Content Pages
Move page content to markdown files in language directories:

```markdown
<!-- _i18n/en/about.md -->
# About Me

I'm Kali Jackson, a software engineer and security researcher...

<!-- _i18n/es/about.md -->
# Acerca de Mí

Soy Kali Jackson, ingeniera de software e investigadora de seguridad...
```

### Phase 3: Blog Posts
Organize posts by language:

```
_i18n/
├── en/
│   └── _posts/
│       ├── 2025-08-17-hacker-joy.md
│       └── ...
├── es/
│   └── _posts/
│       ├── 2025-08-17-alegria-hacker.md
│       └── ...
```

## Layout Modifications

### Language Switcher Component
```html
<!-- _includes/language-switcher.html -->
<div class="language-switcher">
  {% for lang in site.languages %}
    {% if lang == site.active_lang %}
      <span class="active">{{ site.language_names[lang] }}</span>
    {% else %}
      <a href="{% if lang == site.default_lang %}
        {{ page.url }}
      {% else %}
        /{{ lang }}{{ page.url }}
      {% endif %}">
        {{ site.language_names[lang] }}
      </a>
    {% endif %}
  {% endfor %}
</div>
```

### Updated Layout Structure
```liquid
<!-- _layouts/default.html -->
<!DOCTYPE html>
<html lang="{{ site.active_lang }}" dir="{% if site.active_lang == 'ar' %}rtl{% else %}ltr{% endif %}">
<head>
    <meta charset="UTF-8">
    <title>{% t site.title %} - {% t page.title %}</title>
    
    <!-- hreflang tags for SEO -->
    {% for lang in site.languages %}
    <link rel="alternate" hreflang="{{ lang }}" 
          href="{{ site.url }}/{% unless lang == site.default_lang %}{{ lang }}/{% endunless %}{{ page.url }}" />
    {% endfor %}
</head>
```

## Localization Features

### Date Formatting
```liquid
<!-- Use locale-specific date formatting -->
{% case site.active_lang %}
{% when 'en' %}
  {{ post.date | date: "%B %d, %Y" }}
{% when 'es' %}
  {{ post.date | date: "%d de %B de %Y" }}
{% when 'fr' %}
  {{ post.date | date: "%d %B %Y" }}
{% when 'ja' %}
  {{ post.date | date: "%Y年%m月%d日" }}
{% endcase %}
```

### Number Formatting
```javascript
// assets/js/localization.js
function formatNumber(num, locale) {
  return new Intl.NumberFormat(locale).format(num);
}

function formatCurrency(amount, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
}
```

## RTL Language Support

### CSS Modifications
```css
/* assets/css/rtl.css */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .container {
  direction: rtl;
}

[dir="rtl"] nav ul {
  flex-direction: row-reverse;
}

[dir="rtl"] .post-card {
  text-align: right;
}

/* Flip margins and paddings */
[dir="rtl"] .margin-left {
  margin-right: var(--spacing);
  margin-left: 0;
}
```

## Font Strategy for Global Languages

### Variable Font Loading
```css
/* Latin */
@font-face {
  font-family: 'DM Mono';
  src: url('../fonts/dm-mono-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153;
}

/* Arabic */
@font-face {
  font-family: 'Noto Sans Arabic';
  src: url('../fonts/noto-sans-arabic.woff2') format('woff2');
  unicode-range: U+0600-06FF, U+0750-077F;
}

/* CJK */
@font-face {
  font-family: 'Noto Sans CJK';
  src: url('../fonts/noto-sans-cjk.woff2') format('woff2');
  unicode-range: U+3000-303F, U+4E00-9FFF;
}
```

## SEO Optimization

### Multilingual Sitemap
```xml
<!-- sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  {% for page in site.pages %}
    {% for lang in site.languages %}
    <url>
      <loc>{{ site.url }}/{% unless lang == site.default_lang %}{{ lang }}/{% endunless %}{{ page.url }}</loc>
      {% for altlang in site.languages %}
      <xhtml:link rel="alternate" hreflang="{{ altlang }}"
                  href="{{ site.url }}/{% unless altlang == site.default_lang %}{{ altlang }}/{% endunless %}{{ page.url }}"/>
      {% endfor %}
    </url>
    {% endfor %}
  {% endfor %}
</urlset>
```

### Meta Tags
```html
<!-- Language-specific meta tags -->
<meta property="og:locale" content="{{ site.active_lang }}_{{ site.active_lang | upcase }}">
{% for lang in site.languages %}
  {% unless lang == site.active_lang %}
<meta property="og:locale:alternate" content="{{ lang }}_{{ lang | upcase }}">
  {% endunless %}
{% endfor %}
```

## Testing Strategy

### Language Coverage Testing
1. Verify all UI strings are translated
2. Check for missing translations (fallback behavior)
3. Test RTL layout rendering
4. Validate date/time formatting
5. Test language switcher functionality

### Browser Testing
- Chrome/Firefox/Safari/Edge
- Mobile browsers (iOS Safari, Chrome Mobile)
- Screen readers (NVDA, JAWS, VoiceOver)

### Performance Testing
- Measure page load times per language
- Check font loading performance
- Validate caching strategy
- Test CDN behavior with language variants

## Migration Checklist

- [ ] Install jekyll-polyglot gem
- [ ] Update _config.yml with language settings
- [ ] Create _i18n directory structure
- [ ] Extract UI strings to translation files
- [ ] Convert layouts to use translation keys
- [ ] Migrate content to language directories
- [ ] Implement language switcher
- [ ] Add RTL support styles
- [ ] Configure multilingual fonts
- [ ] Update sitemap generation
- [ ] Add hreflang tags
- [ ] Test all language variants
- [ ] Update documentation
- [ ] Create translation guide

## Best Practices

1. **Use translation keys**: Descriptive, hierarchical keys
2. **Provide context**: Add comments for translators
3. **Handle pluralization**: Use proper plural forms
4. **Date/time localization**: Use locale-specific formats
5. **Image localization**: Support localized images/screenshots
6. **URL structure**: Consistent, SEO-friendly URLs
7. **Fallback strategy**: Graceful degradation
8. **Performance**: Lazy load language-specific resources
9. **Accessibility**: Maintain WCAG compliance
10. **Documentation**: Keep translation guide updated