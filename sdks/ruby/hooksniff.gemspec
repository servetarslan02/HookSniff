# frozen_string_literal: true

lib = File.expand_path("../lib", __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require "hooksniff/version"

Gem::Specification.new do |spec|
  spec.name          = "hooksniff"
  spec.version       = HookSniff::VERSION
  spec.authors       = ["HookSniff"]
  spec.email         = ["support@hooksniff.vercel.app"]
  spec.license       = "MIT"

  spec.summary       = "HookSniff webhooks API client and webhook verification library"
  spec.description   = "HookSniff makes webhooks easy and reliable. " \
                       "Learn more at https://hooksniff.vercel.app"
  spec.homepage      = "https://hooksniff.vercel.app"

  spec.required_ruby_version = ">= 3.2"

  if spec.respond_to?(:metadata)
    spec.metadata["allowed_push_host"] = "https://rubygems.org"
    spec.metadata["homepage_uri"] = spec.homepage
    spec.metadata["source_code_uri"] = "https://github.com/servetarslan02/HookSniff"
  else
    raise "RubyGems 2.0 or newer is required to protect against " \
      "public gem pushes."
  end

  ignored = Regexp.union(
    /\Aspec/,
    /\Apkg/,
    /\A.gitignore/,
    /.gem\z/
  )
  spec.files = Dir['**/*'].reject {|f| !File.file?(f) || ignored.match(f) }

  spec.bindir        = "exe"
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  spec.add_dependency "base64", "~> 0.3.0"
  spec.add_dependency "logger", "~> 1.0"

  spec.add_development_dependency "rake", "~> 13.0"
  spec.add_development_dependency "rspec", "~> 3.2"
  spec.add_development_dependency "webmock", "~> 3.25"
end
