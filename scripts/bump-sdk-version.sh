#!/bin/bash
# HookSniff SDK Version Bump
# Usage: bash scripts/bump-sdk-version.sh <new_version>
# Example: bash scripts/bump-sdk-version.sh 1.0.0

set -e

if [ -z "$1" ]; then
  echo "Usage: bash scripts/bump-sdk-version.sh <version>"
  echo "Example: bash scripts/bump-sdk-version.sh 1.0.0"
  exit 1
fi

NEW_VERSION="$1"
echo "📦 Bumping all SDKs to version $NEW_VERSION"
echo ""

# Node.js
echo -n "Node.js: "
sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" sdks/node/package.json
echo "✅ $NEW_VERSION"

# Python
echo -n "Python: "
sed -i "s/version = \"[^\"]*\"/version = \"$NEW_VERSION\"/" sdks/python/pyproject.toml
echo "✅ $NEW_VERSION"

# Go
echo -n "Go: "
# Go uses git tags, no file change needed
echo "✅ (use git tag sdk-v$NEW_VERSION)"

# Rust
echo -n "Rust: "
sed -i "s/^version = \"[^\"]*\"/version = \"$NEW_VERSION\"/" sdks/rust/Cargo.toml
echo "✅ $NEW_VERSION"

# Ruby
echo -n "Ruby: "
sed -i "s/VERSION = '[^']*'/VERSION = '$NEW_VERSION'/" sdks/ruby/lib/hooksniff/version.rb
echo "✅ $NEW_VERSION"

# Java
echo -n "Java: "
sed -i "s/<version>[^<]*<\/version>/<version>$NEW_VERSION<\/version>/" sdks/java/pom.xml
echo "✅ $NEW_VERSION"

# Kotlin
echo -n "Kotlin: "
sed -i "s/version = \"[^\"]*\"/version = \"$NEW_VERSION\"/" sdks/kotlin/build.gradle.kts
echo "✅ $NEW_VERSION"

# PHP
echo -n "PHP: "
sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" sdks/php/composer.json
echo "✅ $NEW_VERSION"

# C#
echo -n "C#: "
find sdks/csharp -name "*.csproj" -exec sed -i "s/<Version>[^<]*<\/Version>/<Version>$NEW_VERSION<\/Version>/" {} \;
echo "✅ $NEW_VERSION"

# Elixir
echo -n "Elixir: "
sed -i "s/version: \"[^\"]*\"/version: \"$NEW_VERSION\"/" sdks/elixir/mix.exs
echo "✅ $NEW_VERSION"

# Swift
echo -n "Swift: "
sed -i "s/version: \"[^\"]*\"/version: \"$NEW_VERSION\"/" sdks/swift/HookSniffSDK/Package.swift
echo "✅ $NEW_VERSION"

echo ""
echo "✅ All SDKs bumped to $NEW_VERSION"
echo ""
echo "Next steps:"
echo "  1. Update CHANGELOG.md in each SDK"
echo "  2. git add -A && git commit -m 'chore: bump all SDKs to $NEW_VERSION'"
echo "  3. git tag sdk-v$NEW_VERSION"
echo "  4. git push origin main --tags"
