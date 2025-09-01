source "https://rubygems.org"

# Jekyll version compatible with GitHub Pages
gem "jekyll", "~> 3.10.0"

# GitHub Pages supported plugins
gem "jekyll-feed", "~> 0.12"
gem "jekyll-seo-tag", "~> 2.6"

# Optional but commonly used
gem "kramdown-parser-gfm"
gem "webrick", "~> 1.7"  # Required for Ruby 3.0+

# Windows and JRuby does not include zoneinfo files
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]