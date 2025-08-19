# Jekyll Theme Packaging Structure

## Overview
This document outlines the structure and requirements for packaging the website as a reusable Jekyll theme gem for GitHub Pages.

## Theme Package Structure

```
jekyll-theme-globalized/
├── LICENSE.txt
├── README.md
├── jekyll-theme-globalized.gemspec
├── _layouts/
│   ├── default.html
│   ├── post.html
│   ├── page.html
│   └── home.html
├── _includes/
│   ├── header.html
│   ├── footer.html
│   ├── navigation.html
│   ├── language-switcher.html
│   ├── social-links.html
│   ├── somafm-player.html
│   └── components/
│       ├── post-card.html
│       ├── project-card.html
│       ├── photo-gallery.html
│       └── dropdown-menu.html
├── _sass/
│   ├── _base.scss
│   ├── _layout.scss
│   ├── _variables.scss
│   ├── _typography.scss
│   ├── _components.scss
│   ├── _utilities.scss
│   └── theme/
│       ├── _colors.scss
│       ├── _responsive.scss
│       └── _animations.scss
├── assets/
│   ├── css/
│   │   └── main.scss
│   ├── js/
│   │   ├── main.js
│   │   ├── localization.js
│   │   └── components/
│   └── fonts/
├── _config.yml
└── _data/
    ├── navigation.yml
    ├── languages.yml
    └── theme.yml
```

## Gemspec Configuration

```ruby
# jekyll-theme-globalized.gemspec
Gem::Specification.new do |spec|
  spec.name          = "jekyll-theme-globalized"
  spec.version       = "1.0.0"
  spec.authors       = ["Your Name"]
  spec.email         = ["email@example.com"]

  spec.summary       = "A modern, internationalized Jekyll theme for GitHub Pages"
  spec.description   = "A fully responsive, multilingual Jekyll theme with built-in i18n support, customizable components, and modern web standards."
  spec.homepage      = "https://github.com/yourusername/jekyll-theme-globalized"
  spec.license       = "MIT"

  spec.metadata["plugin_type"] = "theme"
  spec.metadata["documentation_uri"] = "https://github.com/yourusername/jekyll-theme-globalized/wiki"

  spec.files         = `git ls-files -z`.split("\x0").select do |f|
    f.match(%r{^(assets|_layouts|_includes|_sass|_data|LICENSE|README|_config\.yml)}i)
  end

  spec.required_ruby_version = ">= 2.5.0"
  
  spec.add_runtime_dependency "jekyll", ">= 3.9", "< 5.0"
  spec.add_runtime_dependency "jekyll-polyglot", "~> 1.5"
  spec.add_runtime_dependency "jekyll-seo-tag", "~> 2.8"
  spec.add_runtime_dependency "jekyll-feed", "~> 0.15"
  
  spec.add_development_dependency "bundler", "~> 2.0"
  spec.add_development_dependency "rake", "~> 13.0"
end
```

## Configuration System

### Default Configuration (_config.yml)
```yaml
# Theme defaults
theme_config:
  # Color scheme
  colors:
    primary: "#6d105a"
    secondary: "#ffffff"
    accent: "#ff6b6b"
    background: "#1a1a1a"
    text: "#ffffff"
  
  # Typography
  fonts:
    heading: "'DM Mono', monospace"
    body: "'DM Mono', monospace"
    code: "'Fira Code', monospace"
  
  # Layout
  layout:
    container_width: "1200px"
    sidebar_width: "300px"
    header_style: "bordered" # bordered, minimal, full
  
  # Features
  features:
    language_switcher: true
    social_links: true
    search: false
    comments: false
    analytics: false
    somafm_player: false
  
  # Internationalization
  i18n:
    enabled: true
    default_language: "en"
    languages: ["en"]
    rtl_languages: ["ar", "he", "fa"]

# User overridable settings
title: Your Site Title
description: Your site description
url: ""
baseurl: ""

# Social links (optional)
social:
  github: username
  twitter: username
  linkedin: username
  instagram: username
```

### Theme Overrides
Users can override theme defaults in their `_config.yml`:

```yaml
# User's _config.yml
theme: jekyll-theme-globalized

# Override theme colors
theme_config:
  colors:
    primary: "#0066cc"
    secondary: "#f0f0f0"
  
  features:
    somafm_player: true
    analytics: true
    
  i18n:
    languages: ["en", "es", "fr", "ja"]
    default_language: "en"

# Google Analytics
google_analytics: UA-XXXXXXXX-X
```

## Customization Hooks

### Layout Inheritance
```liquid
<!-- User can create custom layouts extending theme layouts -->
<!-- _layouts/custom-post.html -->
---
layout: post
---

<div class="custom-wrapper">
  {{ content }}
  
  <!-- Add custom elements -->
  <div class="custom-author-bio">
    <!-- Custom author bio -->
  </div>
</div>
```

### Sass Variable Overrides
```scss
// User's assets/css/main.scss
---
---

// Override theme variables before import
$primary-color: #0066cc;
$font-size-base: 18px;
$container-width: 1400px;

// Import theme styles
@import "jekyll-theme-globalized";

// Add custom styles
.custom-component {
  // Custom styles
}
```

### Include Overrides
Users can override any include by creating the same file in their project:
```
project/
├── _includes/
│   └── header.html  # Overrides theme's header.html
```

## Component System

### Reusable Components
```liquid
<!-- _includes/components/card.html -->
<div class="card {% if include.class %}{{ include.class }}{% endif %}">
  {% if include.image %}
  <img src="{{ include.image }}" alt="{{ include.alt }}" class="card-image">
  {% endif %}
  
  <div class="card-content">
    {% if include.title %}
    <h3 class="card-title">{{ include.title }}</h3>
    {% endif %}
    
    {% if include.description %}
    <p class="card-description">{{ include.description }}</p>
    {% endif %}
    
    {% if include.link %}
    <a href="{{ include.link }}" class="card-link">
      {{ include.link_text | default: "Read more" }}
    </a>
    {% endif %}
  </div>
</div>
```

### Component Usage
```liquid
<!-- In any layout or page -->
{% include components/card.html 
   title="Project Title"
   description="Project description"
   image="/assets/images/project.jpg"
   link="/projects/project-name"
   link_text="View Project"
   class="featured-card"
%}
```

## Data Files Structure

### Navigation Data (_data/navigation.yml)
```yaml
main:
  - title: 
      en: "Home"
      es: "Inicio"
      fr: "Accueil"
    url: /
    
  - title:
      en: "Blog"
      es: "Blog"
      fr: "Blog"
    url: /blog/
    
  - title:
      en: "Projects"
      es: "Proyectos"
      fr: "Projets"
    url: /projects/
    dropdown:
      - title:
          en: "Project 1"
          es: "Proyecto 1"
        url: /projects/project1/

footer:
  - title:
      en: "Privacy Policy"
      es: "Política de Privacidad"
    url: /privacy/
```

### Language Configuration (_data/languages.yml)
```yaml
languages:
  en:
    name: "English"
    flag: "🇬🇧"
    locale: "en_US"
    
  es:
    name: "Español"
    flag: "🇪🇸"
    locale: "es_ES"
    
  fr:
    name: "Français"
    flag: "🇫🇷"
    locale: "fr_FR"
```

## Installation Instructions

### For End Users
```bash
# 1. Add to Gemfile
gem "jekyll-theme-globalized"

# 2. Add to _config.yml
theme: jekyll-theme-globalized

# 3. Install
bundle install

# 4. Optional: Copy example content
bundle exec jekyll new-theme --scaffold
```

### Quick Start Template
```yaml
# _config.yml
theme: jekyll-theme-globalized
title: My Awesome Site
description: A multilingual website

# Theme configuration
theme_config:
  colors:
    primary: "#6d105a"
  
  features:
    language_switcher: true
    social_links: true
  
  i18n:
    languages: ["en", "es"]
    default_language: "en"

# Plugins
plugins:
  - jekyll-feed
  - jekyll-seo-tag
  - jekyll-polyglot
```

## Migration Guide

### From Existing Jekyll Site
1. **Backup current site**
2. **Install theme gem**
3. **Update _config.yml**
4. **Move custom styles to overrides**
5. **Update layouts to extend theme layouts**
6. **Move includes to match theme structure**
7. **Update asset references**
8. **Test locally**
9. **Deploy to GitHub Pages**

### Content Migration Checklist
- [ ] Convert layouts to use theme layouts
- [ ] Move includes to theme structure
- [ ] Update CSS to use theme variables
- [ ] Migrate JavaScript to theme system
- [ ] Update image references
- [ ] Configure i18n if needed
- [ ] Test responsive design
- [ ] Validate accessibility
- [ ] Check SEO tags
- [ ] Test on GitHub Pages

## Theme Development

### Local Development
```bash
# Clone theme repository
git clone https://github.com/username/jekyll-theme-globalized.git
cd jekyll-theme-globalized

# Install dependencies
bundle install

# Build example site
cd example/
bundle exec jekyll serve

# Run tests
bundle exec rake test
```

### Testing Structure
```
spec/
├── theme_spec.rb
├── fixtures/
│   └── test-site/
└── support/
    └── helpers.rb
```

### Publishing
```bash
# Build gem
gem build jekyll-theme-globalized.gemspec

# Push to RubyGems
gem push jekyll-theme-globalized-1.0.0.gem
```

## Documentation Requirements

### User Documentation
- Installation guide
- Configuration reference
- Customization guide
- Component documentation
- i18n setup guide
- Migration guide
- Troubleshooting

### Developer Documentation
- Contributing guide
- Architecture overview
- Component API
- Testing guide
- Release process
- Changelog

## Versioning Strategy

Follow Semantic Versioning (SemVer):
- **Major**: Breaking changes
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, backward compatible

Example:
- 1.0.0: Initial release
- 1.1.0: Add new component
- 1.1.1: Fix bug in component
- 2.0.0: Breaking change in configuration