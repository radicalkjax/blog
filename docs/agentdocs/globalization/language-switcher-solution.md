# Language Switcher Solution - Jekyll Polyglot

## The Problem
When implementing a language switcher with jekyll-polyglot, we encountered a critical issue: Jekyll automatically relativizes URLs during the build process. This means when you're on `/es/debug.html` and try to link to the English version using `{{ page.url }}`, Jekyll converts it to `/es/debug.html` instead of the intended `/debug.html`.

## The Root Cause
Jekyll-polyglot is "fairly greedy and naive in its relativization." During the build process for each language version, all relative URLs are automatically adjusted to maintain the language context. This is usually helpful for internal links, but problematic for language switchers.

## The Solution: `static_href` Tag

Jekyll-polyglot provides a special Liquid tag `{% static_href %}` specifically for this use case. This tag prevents automatic URL relativization.

### Correct Implementation

```liquid
{% for lang in site.languages %}
  <li class="language-option {% if lang == site.active_lang %}active{% endif %}">
    {% if lang == site.active_lang %}
      <span class="language-link current">
        {{ lang | upcase }}
        <i class="fas fa-check"></i>
      </span>
    {% else %}
      <a {% static_href %}href="{% if lang == site.default_lang %}{{ site.baseurl }}{{ page.url }}{% else %}{{ site.baseurl }}/{{ lang }}{{ page.url }}{% endif %}"{% endstatic_href %} 
         class="language-link" 
         hreflang="{{ lang }}">
        {{ lang | upcase }}
      </a>
    {% endif %}
  </li>
{% endfor %}
```

### Key Points

1. **Use `static_href` for language links**: This prevents Jekyll from modifying the URLs
2. **URL Construction**:
   - Default language (English): `{{ site.baseurl }}{{ page.url }}`
   - Other languages: `{{ site.baseurl }}/{{ lang }}{{ page.url }}`
3. **Current language indication**: Show active language with a checkmark instead of a link
4. **Use `site.active_lang`**: This variable contains the current language being built

## Why This Works

The `static_href` tag tells jekyll-polyglot: "Don't touch this URL, I know what I'm doing." Without it, Jekyll assumes all URLs should be relative to the current language context.

## Test Results

Before using `static_href`:
- On `/es/debug.html`, English link pointed to `/es/debug.html` ❌

After using `static_href`:
- On `/es/debug.html`, English link correctly points to `/debug.html` ✅

## Lessons Learned

1. **Always use `static_href` for language switchers** in jekyll-polyglot
2. **The plugin documentation is essential** - this feature isn't obvious
3. **URL relativization is automatic** and affects all href attributes unless explicitly prevented
4. **Testing is crucial** - the issue only appears when navigating between languages

## References

- [Jekyll-polyglot documentation](https://github.com/untra/polyglot)
- [Polyglot website source](https://github.com/untra/polyglot/blob/master/site/_includes/sidebar.html) - Example implementation
- Feature introduced in jekyll-polyglot v1.4.0