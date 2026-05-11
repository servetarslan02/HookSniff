#!/bin/bash
# ============================================
# HookSniff SDK Publisher
# Kullanım: bash publish-sdks.sh
# ============================================

set -e
cd "$(dirname "$0")"

echo "🪝 HookSniff SDK Publisher"
echo "========================="
echo ""

# Renkler
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

publish_npm() {
    echo -e "${YELLOW}[1/11] Node.js (npm)...${NC}"
    cd sdks/node
    npm install 2>/dev/null
    # src/ klasörünü düzelt
    mkdir -p src
    [ -f api.ts ] && mv api.ts src/ 2>/dev/null
    [ -d model ] && mv model src/ 2>/dev/null
    [ -d api ] && mv api src/ 2>/dev/null
    echo 'export * from "./api/apis"; export * from "./model/models";' > src/index.ts
    npm run build 2>/dev/null
    npm publish --access public 2>/dev/null && echo -e "${GREEN}  ✅ npm yayında${NC}" || echo -e "${RED}  ❌ npm hata${NC}"
    cd ../..
}

publish_pypi() {
    echo -e "${YELLOW}[2/11] Python (PyPI)...${NC}"
    cd sdks/python
    python3 -m build 2>/dev/null
    python3 -m twine upload dist/* 2>/dev/null && echo -e "${GREEN}  ✅ PyPI yayında${NC}" || echo -e "${RED}  ❌ PyPI hata${NC}"
    cd ../..
}

publish_ruby() {
    echo -e "${YELLOW}[3/11] Ruby (RubyGems)...${NC}"
    cd sdks/ruby
    gem build hooksniff.gemspec 2>/dev/null
    gem push hooksniff-*.gem 2>/dev/null && echo -e "${GREEN}  ✅ RubyGems yayında${NC}" || echo -e "${RED}  ❌ RubyGems hata${NC}"
    cd ../..
}

publish_csharp() {
    echo -e "${YELLOW}[4/11] C# (NuGet)...${NC}"
    cd sdks/csharp
    dotnet pack -c Release 2>/dev/null
    dotnet nuget push bin/Release/*.nupkg --source https://api.nuget.org/v3/index.json 2>/dev/null && echo -e "${GREEN}  ✅ NuGet yayında${NC}" || echo -e "${RED}  ❌ NuGet hata${NC}"
    cd ../..
}

publish_elixir() {
    echo -e "${YELLOW}[5/11] Elixir (Hex)...${NC}"
    cd sdks/elixir
    mix hex.publish --yes 2>/dev/null && echo -e "${GREEN}  ✅ Hex yayında${NC}" || echo -e "${RED}  ❌ Hex hata${NC}"
    cd ../..
}

publish_go() {
    echo -e "${YELLOW}[6/11] Go (git tag)...${NC}"
    cd sdks/go
    git tag v0.3.0 2>/dev/null
    git push origin v0.3.0 2>/dev/null && echo -e "${GREEN}  ✅ Go tag atıldı${NC}" || echo -e "${YELLOW}  ⚠️ Go tag zaten var veya hata${NC}"
    cd ../..
}

publish_swift() {
    echo -e "${YELLOW}[7/11] Swift (git tag)...${NC}"
    cd sdks/swift
    git tag v0.3.0 2>/dev/null
    git push origin v0.3.0 2>/dev/null && echo -e "${GREEN}  ✅ Swift tag atıldı${NC}" || echo -e "${YELLOW}  ⚠️ Swift tag zaten var veya hata${NC}"
    cd ../..
}

echo "Hangi SDK'ları publish etmek istiyorsun?"
echo "  1) Hepsini"
echo "  2) Sadece npm + PyPI (zaten yayınlandı)"
echo "  3) Tek tek seç"
echo ""
read -p "Seçim (1/2/3): " choice

case $choice in
    1)
        publish_npm
        publish_pypi
        publish_ruby
        publish_csharp
        publish_elixir
        publish_go
        publish_swift
        # Java + Kotlin + PHP için manuel adım gerekir
        echo ""
        echo -e "${YELLOW}[8/11] Java (Maven Central) → manuel gerekli${NC}"
        echo -e "${YELLOW}[9/11] Kotlin (Maven Central) → manuel gerekli${NC}"
        echo -e "${YELLOW}[10/11] PHP (Packagist) → manuel gerekli${NC}"
        echo -e "${YELLOW}[11/11] Rust (crates.io) → zaten yayınlandı${NC}"
        ;;
    2)
        echo "npm ve PyPI zaten 0.3.0 olarak yayınlandı!"
        ;;
    3)
        echo "Hangisi? (npm/pypi/ruby/csharp/elixir/go/swift/java/kotlin/php)"
        read -p "SDK adı: " sdk
        case $sdk in
            npm) publish_npm ;;
            pypi) publish_pypi ;;
            ruby) publish_ruby ;;
            csharp) publish_csharp ;;
            elixir) publish_elixir ;;
            go) publish_go ;;
            swift) publish_swift ;;
            *) echo "Bilinmeyen SDK" ;;
        esac
        ;;
esac

echo ""
echo "🎉 Bitti! Yayınlanan sürümleri kontrol et:"
echo "   npm: https://www.npmjs.com/package/hooksniff-sdk"
echo "   PyPI: https://pypi.org/project/hooksniff/"
echo "   crates.io: https://crates.io/crates/hooksniff"
echo "   RubyGems: https://rubygems.org/gems/hooksniff"
echo "   NuGet: https://www.nuget.org/packages/HookSniff"
echo "   Hex: https://hex.pm/packages/hooksniff"
