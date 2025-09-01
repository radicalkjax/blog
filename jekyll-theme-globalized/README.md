# Jekyll Theme Globalized 🌍

A modern, fully internationalized Jekyll theme for GitHub Pages with built-in support for 8+ languages, RTL layouts, and extensive customization options.

[![Gem Version](https://badge.fury.io/rb/jekyll-theme-globalized.svg)](https://badge.fury.io/rb/jekyll-theme-globalized)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.txt)

## ✨ Features

- 🌐 **Multi-language Support** - Pre-configured for 8 languages (EN, ES, FR, JA, ZH, AR, DE, PT)
- 🔄 **RTL Support** - Full right-to-left layout support for Arabic, Hebrew, Persian, and Urdu
- 📱 **Responsive Design** - Mobile-first approach that works on all devices
- 🎨 **Highly Customizable** - Easy theming with Sass variables and configuration options
- 🚀 **Performance Optimized** - Fast loading with optimized assets and lazy loading
- 🔍 **SEO Ready** - Built-in SEO tags, sitemaps, and hreflang support
- 📝 **GitHub Pages Compatible** - Works out of the box with GitHub Pages
- ♿ **Accessible** - WCAG 2.1 AA compliant
- 📲 **PWA Support** - Progressive Web App capabilities with offline mode
- 🌍 **Automatic Locale Detection** - Detects user's browser language and suggests appropriate version
- 🖼️ **Localized Images** - Support for language-specific images and diagrams
- 🎯 **Modern CSS Features** - Container Queries, Logical Properties, and CSS Grid
- 🔒 **Security Headers** - Built-in CSP and security best practices

## 🚀 Quick Start

### Installation

Add this line to your Jekyll site's `Gemfile`:

```ruby
gem "jekyll-theme-globalized"
```

Add this to your Jekyll site's `_config.yml`:

```yaml
theme: jekyll-theme-globalized
```

Then execute:

```bash
bundle install
```

Or install it yourself:

```bash
gem install jekyll-theme-globalized
```

## 📋 Prerequisites

- Ruby 2.5.0 or higher
- Jekyll 3.9 or higher
- Bundler

## ⚙️ Configuration

### Basic Configuration

```yaml
# _config.yml
theme: jekyll-theme-globalized

title: Your Site Title
description: Your site description
url: "https://yoursite.com"
baseurl: ""

# Theme configuration
theme_config:
  colors:
    primary: "#6d105a"
    secondary: "#ffffff"
    accent: "#f84ef8"
  
  features:
    language_switcher: true
    social_links: true
    dark_mode: false
    
  i18n:
    languages: ["en", "es", "fr"]
    default_language: "en"
```

### Language Configuration

Configure multiple languages:

```yaml
# Jekyll Polyglot settings
languages: ["en", "es", "fr", "ja", "zh", "ar", "de", "pt"]
default_lang: "en"
exclude_from_localization: ["assets", "js", "css", "fonts"]
parallel_localization: false

# Language display names
language_names:
  en: "English"
  es: "Español"
  fr: "Français"
  ja: "日本語"
  zh: "中文"
  ar: "العربية"
  de: "Deutsch"
  pt: "Português"
```

### Color Customization

Override default colors:

```yaml
theme_config:
  colors:
    primary: "#0066cc"
    secondary: "#f0f0f0"
    accent: "#ff6600"
    background: "#ffffff"
    text: "#333333"
```

### Feature Toggles

Enable/disable theme features:

```yaml
theme_config:
  features:
    language_switcher: true
    social_links: true
    search: false
    comments: false
    analytics: true
    somafm_player: false
    dark_mode: true
    smooth_scroll: true
    back_to_top: true
```

## 📁 Theme Structure

```
your-site/
├── _config.yml          # Site configuration
├── _data/
│   └── [lang]/         # Language-specific data
│       └── strings.yml # Translations
├── _i18n/
│   └── [lang]/         # Language-specific content
│       ├── _posts/     # Localized blog posts
│       └── _pages/     # Localized pages
├── _layouts/           # Custom layouts (optional)
├── _includes/          # Custom includes (optional)
├── assets/
│   └── css/
│       └── main.scss   # Custom styles
└── index.md            # Homepage
```

## 🌍 Internationalization

### Adding Translations

Create translation files in `_data/[language]/strings.yml`:

```yaml
# _data/es/strings.yml
site:
  title: "Mi Sitio"
  description: "Descripción de mi sitio"

navigation:
  home: "Inicio"
  blog: "Blog"
  about: "Acerca de"
```

### Creating Multilingual Content

Place language-specific content in `_i18n/[language]/`:

```
_i18n/
├── en/
│   ├── _posts/
│   │   └── 2024-01-01-hello-world.md
│   └── about.md
├── es/
│   ├── _posts/
│   │   └── 2024-01-01-hola-mundo.md
│   └── about.md
```

### RTL Languages

The theme automatically applies RTL styles for Arabic, Hebrew, Persian, and Urdu. No additional configuration needed!

## 🎨 Customization

### Override Layouts

Create custom layouts by extending theme layouts:

```liquid
<!-- _layouts/custom-post.html -->
---
layout: post
---

<div class="custom-content">
  {{ content }}
</div>
```

### Custom Styles

Add custom styles in `assets/css/main.scss`:

```scss
---
---

// Import theme styles
@import "jekyll-theme-globalized";

// Your custom styles
.custom-class {
  color: red;
}
```

### Override Includes

Override any include by creating the same file in your project:

```
_includes/
└── header.html  # Overrides theme's header
```

## 📦 Included Layouts

- `default` - Base layout for all pages
- `home` - Homepage with hero section and recent posts
- `page` - Standard page layout
- `post` - Blog post layout with metadata

## 🧩 Components

The theme includes reusable components:

- Language switcher
- Social media links
- Navigation with dropdown support
- Post cards
- Project cards
- Photo galleries

## 🔌 Plugins

Required plugins (add to your `Gemfile`):

```ruby
group :jekyll_plugins do
  gem "jekyll-feed"
  gem "jekyll-seo-tag"
  gem "jekyll-polyglot"
end
```

## 🚢 Deployment

### GitHub Pages

1. Add the theme to your `Gemfile`
2. Update `_config.yml`
3. Push to GitHub
4. Enable GitHub Pages in repository settings

### Netlify

1. Add a `netlify.toml` file:

```toml
[build]
  command = "bundle exec jekyll build"
  publish = "_site"

[build.environment]
  JEKYLL_ENV = "production"
```

## 🤝 Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/radicalkjax/jekyll-theme-globalized.

1. Fork it
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

The theme is available as open source under the terms of the [MIT License](LICENSE.txt).

## 👏 Credits

Created with ❤️ by [Kali Jackson](https://radicalkjax.com)

Special thanks to:
- Jekyll team for the amazing static site generator
- Jekyll Polyglot for internationalization support
- All contributors and users of this theme

## 📚 Documentation

For more detailed documentation, visit our [Wiki](https://github.com/radicalkjax/jekyll-theme-globalized/wiki).

## 🐛 Issues

Found a bug? [Report it here](https://github.com/radicalkjax/jekyll-theme-globalized/issues).

## ⭐ Show Your Support

Give a ⭐️ if this theme helped you!