Gem::Specification.new do |s|
  s.name        = "hookrelay"
  s.version     = "0.1.0"
  s.summary     = "Official Ruby client for HookRelay webhook delivery service"
  s.description = "Ruby SDK for the HookRelay webhook delivery platform. Provides API client, webhook sending, delivery management, and signature verification."
  s.authors     = ["HookRelay"]
  s.email       = ["support@hookrelay.dev"]
  s.homepage    = "https://github.com/hookrelay/hookrelay-ruby"
  s.license     = "MIT"

  s.required_ruby_version = ">= 2.7.0"

  s.files = Dir["lib/**/*", "README.md", "LICENSE"]

  s.add_dependency "net-http", ">= 0.3.0"
  s.add_dependency "json", ">= 2.0.0"
  s.add_dependency "uri", ">= 0.12.0"
end
