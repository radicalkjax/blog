# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "eris-theme"
  spec.version       = "0.1.0"
  spec.authors       = ["Kali Jackson"]
  spec.email         = ["your.email@example.com"]

  spec.summary       = "Eris is a modern, minimalist Jekyll theme with a distinctive purple color scheme and unique border styling."
  spec.homepage      = "https://github.com/yourusername/eris-theme"
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0").select { |f| f.match(%r!^(assets|_layouts|_includes|_sass|LICENSE|README|_config\.yml)!i) }

  spec.add_runtime_dependency "jekyll", "~> 4.2"
  spec.add_development_dependency "bundler", "~> 2.3"
  spec.add_development_dependency "rake", "~> 13.0"
end
