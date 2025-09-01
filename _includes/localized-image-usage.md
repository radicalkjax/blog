# Localized Image Support

## Overview
The localized image system allows you to display different images based on the current language/locale of the site.

## Usage Methods

### Method 1: Using the Include Component
```liquid
{% include localized-image.html 
   src="/assets/images/hero.jpg" 
   alt="Hero image" 
   class="hero-image"
   width="800"
   height="400"
   loading="lazy" %}
```

### Method 2: Using Data Attributes
```html
<img src="/assets/images/diagram.png" 
     alt="System diagram" 
     data-localizable="true">
```

### Method 3: Using CSS Class
```html
<img src="/assets/images/screenshot.png" 
     alt="App screenshot" 
     class="localized-image">
```

## File Naming Convention
For localized images, use this naming pattern:
- Default: `image.jpg`
- English: `image.en.jpg`
- Spanish: `image.es.jpg`
- French: `image.fr.jpg`
- Japanese: `image.ja.jpg`
- Chinese: `image.zh.jpg`
- Arabic: `image.ar.jpg`
- German: `image.de.jpg`
- Portuguese: `image.pt.jpg`

## Examples

### Blog Post Images
```liquid
{% include localized-image.html 
   src="/assets/images/blog/tutorial-screenshot.png" 
   alt="Tutorial screenshot" %}
```

### Product Screenshots
```liquid
{% include localized-image.html 
   src="/assets/images/products/app-interface.jpg" 
   alt="App interface in user's language"
   class="product-screenshot" %}
```

### Diagrams with Text
```liquid
{% include localized-image.html 
   src="/assets/images/diagrams/architecture.svg" 
   alt="System architecture diagram" %}
```

## JavaScript API
You can also mark images as localizable programmatically:

```javascript
// Mark specific images as localizable
markImageAsLocalizable('.content img');

// Listen for language changes
window.addEventListener('locale-changed', function(e) {
    console.log('Language changed to:', e.detail.lang);
});
```

## Best Practices
1. Always provide a default image (without language code)
2. Use descriptive alt text that makes sense in all languages
3. Consider file size - only create localized versions when necessary
4. Test that fallback works correctly
5. Use SVG for diagrams when possible (easier to localize text)