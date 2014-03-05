require 'special_delivery/gem_tasks'
require 'rspec/core/rake_task'
require 'pry'

desc "Run specs"
RSpec::Core::RakeTask.new(:spec)

desc "Run specs (default)"
task :default => :spec

desc "Run web server for testing"
task :server do
  Dir.chdir File.dirname(__FILE__)
  port = ENV['port'] || "8000"
  puts "Starting webserver (via pyton SimpleHTTPServer) on port #{port}"
  puts "You can change the port by sending port=XXXX"
  puts "Press CTRL-C to stop"
  `python -m SimpleHTTPServer #{port}`
end
