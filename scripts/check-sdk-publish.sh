#!/bin/bash
# HookSniff SDK Publish Status Checker
# Checks if all SDKs are published and up-to-date on their registries.
#
# Usage: bash scripts/check-sdk-publish.sh

set -e

VERSION_NODE=$(grep '"version"' sdks/node/package.json | head -1 | sed 's/.*"\([^"]*\)".*/\1/')
VERSION_PYTHON=$(grep 'version' sdks/python/pyproject.toml | head -1 | sed 's/.*"\([^"]*\)".*/\1/')
VERSION_RUST=$(grep '^version' sdks/rust/Cargo.toml | head -1 | sed 's/.*"\([^"]*\)".*/\1/')

echo "📦 HookSniff SDK Publish Status"
echo "================================"
echo ""

# Node.js (npm)
echo -n "Node.js (npm) — hooksniff-sdk@$VERSION_NODE: "
NPM_VER=$(curl -s https://registry.npmjs.org/hooksniff-sdk/latest 2>/dev/null | grep -o '"version":"[^"]*"' | head -1 | sed 's/"version":"\([^"]*\)"/\1/')
if [ -z "$NPM_VER" ]; then
  echo "❌ NOT FOUND on npm"
elif [ "$NPM_VER" = "$VERSION_NODE" ]; then
  echo "✅ Published ($NPM_VER)"
else
  echo "⚠️  Mismatch — npm: $NPM_VER, local: $VERSION_NODE"
fi

# Python (PyPI)
echo -n "Python (PyPI) — hooksniff@$VERSION_PYTHON: "
PYPI_VER=$(curl -s https://pypi.org/pypi/hooksniff/json 2>/dev/null | grep -o '"version":"[^"]*"' | head -1 | sed 's/"version":"\([^"]*\)"/\1/')
if [ -z "$PYPI_VER" ]; then
  echo "❌ NOT FOUND on PyPI"
elif [ "$PYPI_VER" = "$VERSION_PYTHON" ]; then
  echo "✅ Published ($PYPI_VER)"
else
  echo "⚠️  Mismatch — PyPI: $PYPI_VER, local: $VERSION_PYTHON"
fi

# Rust (crates.io)
echo -n "Rust (crates.io) — hooksniff@$VERSION_RUST: "
CRATES_VER=$(curl -s https://crates.io/api/v1/crates/hooksniff 2>/dev/null | grep -o '"newest_version":"[^"]*"' | head -1 | sed 's/"newest_version":"\([^"]*\)"/\1/')
if [ -z "$CRATES_VER" ]; then
  echo "❌ NOT FOUND on crates.io"
elif [ "$CRATES_VER" = "$VERSION_RUST" ]; then
  echo "✅ Published ($CRATES_VER)"
else
  echo "⚠️  Mismatch — crates.io: $CRATES_VER, local: $VERSION_RUST"
fi

# Ruby (RubyGems)
echo -n "Ruby (RubyGems) — hooksniff: "
RUBY_VER=$(curl -s https://rubygems.org/api/v1/gems/hooksniff.json 2>/dev/null | grep -o '"version":"[^"]*"' | head -1 | sed 's/"version":"\([^"]*\)"/\1/')
if [ -z "$RUBY_VER" ]; then
  echo "❌ NOT FOUND on RubyGems"
else
  echo "✅ Published ($RUBY_VER)"
fi

# Java (Maven Central)
echo -n "Java (Maven Central) — hooksniff-sdk: "
MAVEN_VER=$(curl -s "https://search.maven.org/solrsearch/select?q=a:hooksniff-sdk&rows=1&wt=json" 2>/dev/null | grep -o '"latestVersion":"[^"]*"' | head -1 | sed 's/"latestVersion":"\([^"]*\)"/\1/')
if [ -z "$MAVEN_VER" ]; then
  echo "❌ NOT FOUND on Maven Central"
else
  echo "✅ Published ($MAVEN_VER)"
fi

# C# (NuGet)
echo -n "C# (NuGet) — HookSniff: "
NUGET_VER=$(curl -s "https://api.nuget.org/v3-flatcontainer/hooksniff/index.json" 2>/dev/null | grep -o '"versions":\["[^"]*"' | tail -1 | sed 's/.*"\([^"]*\)".*/\1/')
if [ -z "$NUGET_VER" ]; then
  echo "❌ NOT FOUND on NuGet"
else
  echo "✅ Published ($NUGET_VER)"
fi

# Elixir (Hex.pm)
echo -n "Elixir (Hex.pm) — hooksniff: "
HEX_VER=$(curl -s https://hex.pm/api/packages/hooksniff 2>/dev/null | grep -o '"latest_stable_version":"[^"]*"' | head -1 | sed 's/"latest_stable_version":"\([^"]*\)"/\1/')
if [ -z "$HEX_VER" ]; then
  echo "❌ NOT FOUND on Hex.pm"
else
  echo "✅ Published ($HEX_VER)"
fi

echo ""
echo "Done. Update versions in sdks/*/ if mismatches found."
