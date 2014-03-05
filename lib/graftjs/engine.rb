module Graftjs
  class Engine < Rails::Engine
    
    ASSET_DIRECTORIES = %w( src ).freeze
    TEST_DIRECTORIES = %w( specs vendors ).freeze

    # Save this block, we'll use it in two calls to .initializer
    add_paths_block = lambda { |app|

      ::Graftjs::Engine::ASSET_DIRECTORIES.each do |dir|
        app.config.assets.paths << ::File.expand_path("#{::Graftjs::Engine.gem_dir}/#{dir}", __FILE__)
      end

      if Rails.env =~ /development|test|sandbox/
          ::Graftjs::Engine::TEST_DIRECTORIES.each do |dir|
            app.config.assets.paths << ::File.expand_path("#{::Graftjs::Engine.gem_dir}/#{dir}", __FILE__)
          end
      end
    }

    # Standard initializer
    initializer 'graftjs.update_asset_paths', &add_paths_block

    # Special initializer lets us precompile assets without fully initializing
    initializer 'graftjs.update_asset_paths', :group => :assets,
                &add_paths_block
    
    def self.gem_dir
      @gem_dir ||= File.expand_path("../../../", __FILE__)
    end

  end
end
