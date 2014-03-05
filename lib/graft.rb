root = File.join(File.dirname(__FILE__), "..")
require "graft/version"
require "compass-rails"

module Graft
end

if defined?(::Rails)
  require "teaspoon" if ::Rails.env =~ /test|development|sandbox/
  require "graft/engine"
  require "graft/teaspoon"
end
