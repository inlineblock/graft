::Teaspoon.setup do |config|
  config.suite :graft do |suite|
    suite.boot_partial = "require_js"
    suite.helper = "graft_spec_helper"

    suite.matcher = "#{::File.join(::Graftjs::Engine.gem_dir , 'specs')}/**/*_spec.js"
    suite.javascripts = ["teaspoon-mocha"]
    suite.stylesheets = ["teaspoon"]
  end
end if defined?(::Teaspoon) && ::Teaspoon.respond_to?(:setup) # let Teaspoon be undefined outside of development/test/asset groups
