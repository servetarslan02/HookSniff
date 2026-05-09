#!/usr/bin/env bash
# Ruby SDK — RubyGems Publish
# Kullanım: chmod +x scripts/publish-ruby.sh && ./scripts/publish-ruby.sh
set -euo pipefail

cd "$(dirname "$0")/../sdks/ruby"

echo "🔧 Building gem..."
gem build hooksniff.gemspec

echo "📤 Pushing to RubyGems..."
gem push hooksniff-0.1.0.gem

echo "✅ Ruby SDK published!"
echo "🔗 https://rubygems.org/gems/hooksniff"
