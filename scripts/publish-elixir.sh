#!/usr/bin/env bash
# Elixir SDK — Hex.pm Publish
# Kullanım: chmod +x scripts/publish-elixir.sh && ./scripts/publish-elixir.sh
set -euo pipefail

cd "$(dirname "$0")/../sdks/elixir"

echo "🔧 Dependencies kontrol..."
mix deps.get

echo "🧪 Test..."
mix test

echo "📤 Publishing to Hex.pm..."
mix hex.publish --yes

echo "✅ Elixir SDK published!"
echo "🔗 https://hex.pm/packages/hooksniff"
