#!/usr/bin/env bash
# ============================================================================
# HookSniff SDK Publish — Tüm Kalan SDK'lar
# ============================================================================
# Servet'in local bilgisayarında çalıştırması için.
#
# Kullanım:
#   chmod +x scripts/publish-all.sh
#   ./scripts/publish-all.sh          # Tümü
#   ./scripts/publish-all.sh ruby     # Sadece Ruby
#   ./scripts/publish-all.sh elixir   # Sadece Elixir
#   ./scripts/publish-all.sh java     # Sadece Java
#   ./scripts/publish-all.sh kotlin   # Sadece Kotlin
# ============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${BLUE}[PUBLISH]${NC} $1"; }
ok()   { echo -e "${GREEN}✅ $1${NC}"; }
fail() { echo -e "${RED}❌ $1${NC}"; exit 1; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

# ──────────────────────────────────────────────
# Ruby SDK → RubyGems
# ──────────────────────────────────────────────
publish_ruby() {
    log "Ruby SDK publish başlıyor..."

    # Gem yüklü mü?
    command -v gem >/dev/null 2>&1 || fail "Ruby gem bulunamadı. Ruby kur: https://rubyinstaller.org/"

    cd sdks/ruby

    # Gem build
    log "Building gem..."
    gem build hooksniff.gemspec

    # Gem push
    log "Pushing to RubyGems..."
    gem push hooksniff-0.1.0.gem

    ok "Ruby SDK published! → https://rubygems.org/gems/hooksniff"
    cd "$ROOT_DIR"
}

# ──────────────────────────────────────────────
# Elixir SDK → Hex.pm
# ──────────────────────────────────────────────
publish_elixir() {
    log "Elixir SDK publish başlıyor..."

    # Mix yüklü mü?
    command -v mix >/dev/null 2>&1 || fail "Elixir mix bulunamadı. Elixir kur: https://elixir-lang.org/install.html"

    cd sdks/elixir

    # Dependencies
    log "Dependencies alınıyor..."
    mix deps.get

    # Test
    log "Test çalıştırılıyor..."
    mix test

    # Publish
    log "Publishing to Hex.pm..."
    mix hex.publish --yes

    ok "Elixir SDK published! → https://hex.pm/packages/hooksniff"
    cd "$ROOT_DIR"
}

# ──────────────────────────────────────────────
# Java SDK → Maven Central
# ──────────────────────────────────────────────
publish_java() {
    log "Java SDK publish başlıyor..."

    # Maven yüklü mü?
    command -v mvn >/dev/null 2>&1 || fail "Maven bulunamadı. Kur: brew install maven (macOS) veya apt install maven (Linux)"

    # GPG yüklü mü?
    command -v gpg >/dev/null 2>&1 || fail "GPG bulunamadı. Kur: brew install gnupg (macOS) veya apt install gnupg (Linux)"

    # ~/.m2/settings.xml var mı?
    [ -f ~/.m2/settings.xml ] || fail "~/.m2/settings.xml bulunamadı. Oluştur (aşağıdaki komutu çalıştır):
cat > ~/.m2/settings.xml << 'EOF'
<settings>
  <servers>
    <server>
      <id>ossrh</id>
      <username>OSSRH_USERNAME</username>
      <password>OSSRH_PASSWORD</password>
    </server>
  </servers>
  <profiles>
    <profile>
      <id>ossrh</id>
      <activation><activeByDefault>true</activeByDefault></activation>
      <properties>
        <gpg.executable>gpg</gpg.executable>
        <gpg.passphrase>GPG_PASSPHRASE</gpg.passphrase>
      </properties>
    </profile>
  </profiles>
</settings>
EOF"

    cd sdks/java

    # Clean + Compile
    log "Clean + Compile..."
    mvn clean compile

    # Test
    log "Test..."
    mvn test

    # Source + Javadoc
    log "Source + Javadoc jar..."
    mvn source:jar javadoc:jar

    # GPG sign
    log "GPG imzalama..."
    mvn gpg:sign

    # Deploy
    log "Deploy to Maven Central (staging)..."
    mvn deploy

    ok "Java SDK staging'e deploy edildi!"
    warn "Sonatype UI'dan release et: https://central.sonatype.com → Staging Repositories → Release"
    cd "$ROOT_DIR"
}

# ──────────────────────────────────────────────
# Kotlin SDK → Maven Central
# ──────────────────────────────────────────────
publish_kotlin() {
    log "Kotlin SDK publish başlıyor..."

    # Gradle yüklü mü?
    command -v gradle >/dev/null 2>&1 || {
        # Gradle wrapper var mı?
        [ -f sdks/kotlin/gradlew ] || fail "Gradle bulunamadı. Kur: brew install gradle (macOS) veya apt install gradle (Linux)"
    }

    command -v gpg >/dev/null 2>&1 || fail "GPG bulunamadı."

    cd sdks/kotlin

    # Gradle wrapper varsa onu kullan
    GRADLE_CMD="gradle"
    [ -f gradlew ] && GRADLE_CMD="./gradlew"

    # Clean + Build
    log "Clean + Build..."
    $GRADLE_CMD clean build

    # Publish
    log "Publishing to Maven Central..."
    $GRADLE_CMD publish

    ok "Kotlin SDK staging'e deploy edildi!"
    warn "Sonatype UI'dan release et: https://central.sonatype.com"
    cd "$ROOT_DIR"
}

# ──────────────────────────────────────────────
# Ana menü
# ──────────────────────────────────────────────
case "${1:-all}" in
    ruby)    publish_ruby ;;
    elixir)  publish_elixir ;;
    java)    publish_java ;;
    kotlin)  publish_kotlin ;;
    all)
        echo ""
        echo "🪝 HookSniff SDK Publish — Kalan 4 SDK"
        echo "======================================="
        echo ""

        publish_ruby    || warn "Ruby başarısız, devam ediliyor..."
        publish_elixir  || warn "Elixir başarısız, devam ediliyor..."
        publish_java    || warn "Java başarısız, devam ediliyor..."
        publish_kotlin  || warn "Kotlin başarısız, devam ediliyor..."

        echo ""
        ok "=== Publish işlemi tamamlandı! ==="
        ;;
    *)
        echo "Kullanım: $0 [ruby|elixir|java|kotlin|all]"
        exit 1
        ;;
esac
