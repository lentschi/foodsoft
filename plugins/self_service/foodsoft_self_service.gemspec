$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "foodsoft_self_service/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "foodsoft_self_service"
  s.version     = FoodsoftSelfService::VERSION
  s.authors     = ["lentschi"]
  s.email       = ["office@florian-lentsch.at"]
  s.homepage    = "https://github.com/foodcoops/foodsoft"
  s.summary     = "Self service plugin for foodsoft."
  s.description = "Allows editing received amounts & making transactions on own account by simple members."

  s.files = Dir["{app,config,db,lib}/**/*"] + ["Rakefile", "README.md"]
  s.test_files = Dir["test/**/*"]

  s.add_dependency "rails"
end
