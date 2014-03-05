root = File.join(File.dirname(__FILE__), "..")
require "graftjs/version"

module Graftjs
end

if defined?(::Rails)
  require "teaspoon" if ::Rails.env =~ /test|development|sandbox/
  require "graftjs/engine"
  require "graftjs/teaspoon"
end
