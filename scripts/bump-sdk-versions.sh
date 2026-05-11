#!/bin/bash
# bump-sdk-versions.sh — Tüm SDK'ların version'ını güncelle
# Kullanım: ./scripts/bump-sdk-versions.sh 0.3.0

set -e

NEW_VERSION="${1:?Kullanım: $0 <version>}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🪝 HookSniff SDK Version Bump → $NEW_VERSION"
echo ""

# Node.js
if [ -f "$ROOT_DIR/sdks/node/package.json" ]; then
    sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" "$ROOT_DIR/sdks/node/package.json"
    echo "✅ node/package.json → $NEW_VERSION"
fi

# Python
if [ -f "$ROOT_DIR/sdks/python/setup.py" ]; then
    sed -i "s/version=['\"][^'\"]*['\"]/version='$NEW_VERSION'/" "$ROOT_DIR/sdks/python/setup.py"
    echo "✅ python/setup.py → $NEW_VERSION"
fi

# Rust
if [ -f "$ROOT_DIR/sdks/rust/Cargo.toml" ]; then
    sed -i "0,/^version = \"[^\"]*\"/{s/^version = \"[^\"]*\"/version = \"$NEW_VERSION\"/}" "$ROOT_DIR/sdks/rust/Cargo.toml"
    echo "✅ rust/Cargo.toml → $NEW_VERSION"
fi

# Go — version in go.mod is module path, not versioned. Tag-based.
echo "⏭️  go — tag-based, manual"

# Ruby
if [ -f "$ROOT_DIR/sdks/ruby/hooksniff.gemspec" ]; then
    sed -i "s/version = ['\"][^'\"]*['\"]/version = '$NEW_VERSION'/" "$ROOT_DIR/sdks/ruby/hooksniff.gemspec"
    echo "✅ ruby/hooksniff.gemspec → $NEW_VERSION"
fi

# Java
if [ -f "$ROOT_DIR/sdks/java/pom.xml" ]; then
    sed -i "0,/<version>[^<]*<\/version>/{s/<version>[^<]*<\/version>/<version>$NEW_VERSION<\/version>/}" "$ROOT_DIR/sdks/java/pom.xml"
    echo "✅ java/pom.xml → $NEW_VERSION"
fi

# Kotlin
if [ -f "$ROOT_DIR/sdks/kotlin/pom.xml" ]; then
    sed -i "0,/<version>[^<]*<\/version>/{s/<version>[^<]*<\/version>/<version>$NEW_VERSION<\/version>/}" "$ROOT_DIR/sdks/kotlin/pom.xml"
    echo "✅ kotlin/pom.xml → $NEW_VERSION"
fi

# PHP
if [ -f "$ROOT_DIR/sdks/php/composer.json" ]; then
    sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" "$ROOT_DIR/sdks/php/composer.json"
    echo "✅ php/composer.json → $NEW_VERSION"
fi

# C#
if [ -f "$ROOT_DIR/sdks/csharp/HookSniff.csproj" ]; then
    sed -i "s/<Version>[^<]*<\/Version>/<Version>$NEW_VERSION<\/Version>/" "$ROOT_DIR/sdks/csharp/HookSniff.csproj"
    echo "✅ csharp/HookSniff.csproj → $NEW_VERSION"
fi

# Elixir
if [ -f "$ROOT_DIR/sdks/elixir/mix.exs" ]; then
    sed -i "s/@version \"[^\"]*\"/@version \"$NEW_VERSION\"/" "$ROOT_DIR/sdks/elixir/mix.exs"
    echo "✅ elixir/mix.exs → $NEW_VERSION"
fi

# Swift
if [ -f "$ROOT_DIR/sdks/swift/Package.swift" ]; then
    # Swift uses git tags, not version in Package.swift
    echo "⏭️  swift — tag-based, manual"
fi

echo ""
echo "📋 Sonraki adımlar:"
echo "  1. git diff — değişiklikleri kontrol et"
echo "  2. git add sdks/ && git commit -m \"chore: bump SDK versions to $NEW_VERSION\""
echo "  3. git tag v$NEW_VERSION && git push origin main --tags"
echo "  4. SDK'ları publish et (npm, PyPI, crates.io, vb.)"
