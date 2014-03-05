# -*- encoding: utf-8 -*-
require File.expand_path('../lib/graftjs/version', __FILE__)

Gem::Specification.new do |gem|

  gem.authors       = ["Dennis Wilkins"]
  gem.email         = ["dennis@moneydesktop.com"]
  gem.description   = %q{Backbone.js Directive System}
  gem.summary       = %q{Backbone.js Directive System}
  gem.homepage      = "http://moneydesktop.github.com"

  gem.files         = `git ls-files`.split($\)
  gem.executables   = gem.files.grep(%r{^bin/}).map{ |f| File.basename(f) }
  gem.test_files    = gem.files.grep(%r{^(specs)/})
  gem.name          = "graftjs"
  gem.require_paths = ["lib"]
  gem.version       = Graftjs::VERSION

  gem.add_development_dependency 'rake'
  gem.add_development_dependency 'rspec'
  gem.add_development_dependency 'pry'
  gem.add_development_dependency 'special_delivery'
  gem.add_development_dependency 'teaspoon'

end
