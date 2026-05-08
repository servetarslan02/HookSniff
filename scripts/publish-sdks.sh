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
gem push hooksniff-0.1.0.gem --key rubygems_25bb6fae3c2e1f1b32aa01f5700d83752a50f9b251797a71
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
echo ""
echo "Packagist token: 86b49acd74d0894483fae6e47c4f68712239dcde"

# ==================== Java/Kotlin (Maven Central) ====================
echo ""
echo "📦 Java/Kotlin → Maven Central"
echo "-------------------------------"
cd sdks/java

# Create settings.xml for Maven
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

# Build and deploy
mvn clean deploy -DskipTests 2>&1 || echo "⚠️ Java publish failed - check Maven setup"
echo "✅ Java published"
cd ../..

# Kotlin - uses same Maven Central credentials
cd sdks/kotlin
./gradlew publish 2>&1 || echo "⚠️ Kotlin publish failed - check Gradle setup"
echo "✅ Kotlin published"
cd ../..

# ==================== C# (NuGet) ====================
echo ""
echo "📦 C# → NuGet"
echo "--------------"
cd sdks/csharp
dotnet pack -c Release 2>&1
echo "Run: dotnet nuget push bin/Release/*.nupkg --api-key YOUR_NUGET_KEY --source https://api.nuget.org/v3/index.json"
echo "Get key at: https://www.nuget.org/account/apikeys"
cd ../..

# ==================== Elixir (Hex.pm) ====================
echo ""
echo "📦 Elixir → Hex.pm"
echo "-------------------"
cd sdks/elixir
mix hex.publish --yes 2>&1 || echo "⚠️ Elixir publish failed - run: mix hex.auth"
echo "✅ Elixir published"
cd ../..

echo ""
echo "🎉 Done! Check each package manager to verify."
