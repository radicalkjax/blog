source "https://rubygems.org"

# Use the github-pages gem to match GitHub's build environment
gem "github-pages", group: :jekyll_plugins

# Additional gems for local development
gem "webrick", "~> 1.7"  # Required for Ruby 3.0+

# Windows and JRuby does not include zoneinfo files
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]