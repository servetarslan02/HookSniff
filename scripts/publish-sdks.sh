#!/bin/bash
# HookSniff SDK Publish Script
# Run this from the repo root: bash scripts/publish-sdks.sh

set -e

echo "🚀 HookSniff SDK Publish"
echo "========================"

# ==================== Ruby ====================
echo ""
echo "📦 Ruby → RubyGems"
echo "-------------------"
cd sdks/ruby
gem build hooksniff.gemspec
gem push hooksniff-0.1.0.gem
echo "✅ Ruby published"
cd ../..

# ==================== PHP (Packagist) ====================
echo ""
echo "📦 PHP → Packagist"
echo "-------------------"
echo "1. Go to https://packagist.org/packages/submit"
echo "2. Submit: https://github.com/servetarslan02/HookSniff (path: sdks/php)"
echo "3. Packagist will auto-detect composer.json"
echo "4. Set up GitHub webhook for auto-updates:"
echo "   https://packagist.org/about#how-to-update-packages"

# ==================== Java (Maven Central) ====================
echo ""
echo "📦 Java → Maven Central"
echo "------------------------"
mkdir -p ~/.m2
cat > ~/.m2/settings.xml << 'EOF'
<settings>
  <servers>
    <server>
      <id>ossrh</id>
      <username>f0wXBf</username>
      <password>EYLV763IsQVseaffdOXNScf2HZlcLDGEK</password>
    </server>
  </servers>
</settings>
EOF
cd sdks/java
mvn clean deploy -DskipTests
echo "✅ Java published"
cd ../..

# ==================== Kotlin (Maven Central) ====================
echo ""
echo "📦 Kotlin → Maven Central"
echo "--------------------------"
cd sdks/kotlin
./gradlew publish
echo "✅ Kotlin published"
cd ../..

# ==================== Elixir (Hex.pm) ====================
echo ""
echo "📦 Elixir → Hex.pm"
echo "-------------------"
cd sdks/elixir
mix hex.auth --key caff94171db7190c24957e07ac3439e1
mix hex.publish --yes
echo "✅ Elixir published"
cd ../..

echo ""
echo "🎉 Done! Check each package manager to verify."
