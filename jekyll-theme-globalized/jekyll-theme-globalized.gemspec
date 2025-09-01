# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "jekyll-theme-globalized"
  spec.version       = "1.1.0"
  spec.authors       = ["Kali Jackson"]
  spec.email         = ["contact@radicalkjax.com"]

  spec.summary       = "A modern, internationalized Jekyll theme for GitHub Pages"
  spec.description   = "A fully responsive, multilingual Jekyll theme with built-in i18n support for 8+ languages, RTL support, PWA capabilities, automatic locale detection, localized image support, modern CSS features (Container Queries, Logical Properties), and customizable components. Perfect for personal blogs, portfolios, and documentation sites."
  spec.homepage      = "https://github.com/radicalkjax/jekyll-theme-globalized"
  spec.license       = "MIT"

  spec.metadata["plugin_type"] = "theme"
  spec.metadata["documentation_uri"] = "https://github.com/radicalkjax/jekyll-theme-globalized/wiki"
  spec.metadata["source_code_uri"] = "https://github.com/radicalkjax/jekyll-theme-globalized"
  spec.metadata["bug_tracker_uri"] = "https://github.com/radicalkjax/jekyll-theme-globalized/issues"

  spec.files         = Dir.glob("**/*").select do |f|
    f.match(%r{^(assets|_layouts|_includes|_sass|_data|LICENSE|README|manifest\.json|service-worker\.js|offline\.html|_config\.yml)}i) && !File.directory?(f)
  end

  spec.required_ruby_version = ">= 2.5.0"
  
  spec.add_runtime_dependency "jekyll", ">= 3.9", "< 5.0"
  spec.add_runtime_dependency "jekyll-polyglot", "~> 1.5"
  spec.add_runtime_dependency "jekyll-seo-tag", "~> 2.8"
  spec.add_runtime_dependency "jekyll-feed", "~> 0.15"
  
  spec.add_development_dependency "bundler", "~> 2.0"
  spec.add_development_dependency "rake", "~> 13.0"
end