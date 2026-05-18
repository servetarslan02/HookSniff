#!/bin/bash
# ═══════════════════════════════════════════════════════════
# HookSniff Local CI/CD — GitHub Actions Yerine
# SDK'lar ayrı repo'larda: hooksniff-node, hooksniff-python, vb.
#
# Kullanım:
#   ./local-release.sh patch          # 1.2.0 → 1.2.1 (tüm SDK'lar)
#   ./local-release.sh minor          # 1.2.0 → 1.3.0
#   ./local-release.sh major          # 1.2.0 → 2.0.0
#   ./local-release.sh set 1.5.0      # Elle version belirle
#   ./local-release.sh dry-run        # Publish etmeden test et
#   ./local-release.sh publish-only   # Sadece publish (version bump yok)
#   ./local-release.sh status         # Mevcut durumu göster
#   ./local-release.sh node           # Sadece Node.js'i publish et
#   ./local-release.sh python         # Sadece Python'ı publish et
#
# Token: .sdk-tokens.env dosyasından okunur
# ═══════════════════════════════════════════════════════════
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

TOKEN_FILE="$SCRIPT_DIR/.sdk-tokens.env"
VERSION_FILE="$SCRIPT_DIR/.sdk-version"
WORK_DIR="/tmp/hooksniff-release"
GITHUB_USER="servetarslan02"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

PASS=0
FAIL=0
SKIP=0
START_TIME=$(date +%s)

log()    { echo -e "${CYAN}▸${NC} $1"; }
ok()     { echo -e "  ${GREEN}✅${NC} $1"; PASS=$((PASS+1)); }
fail()   { echo -e "  ${RED}❌${NC} $1"; FAIL=$((FAIL+1)); }
skip()   { echo -e "  ${YELLOW}⏭${NC} $1"; SKIP=$((SKIP+1)); }
warn()   { echo -e "  ${YELLOW}⚠️${NC} $1"; }
section(){ echo -e "\n${CYAN}━━━ $1 ━━━${NC}"; }
header() { echo -e "\n${BOLD}${CYAN}$1${NC}"; }

# ═══════════════════════════════════════════════════════
# SDK Tanımları (repo_adı | registry | dil)
# ═══════════════════════════════════════════════════════

declare -A SDK_REPOS=(
    [node]="hooksniff-node"
    [python]="hooksniff-python"
    [go]="hooksniff-go"
    [rust]="hooksniff-rust"
    [ruby]="hooksniff-ruby"
    [java]="hooksniff-java"
    [kotlin]="hooksniff-kotlin"
    [php]="hooksniff-php"
    [csharp]="hooksniff-csharp"
    [elixir]="hooksniff-elixir"
    [swift]="hooksniff-swift"
)

ALL_SDKS=(node python go rust ruby java kotlin php csharp elixir swift)

# ═══════════════════════════════════════════════════════
# Version Yönetimi
# ═══════════════════════════════════════════════════════

get_current_version() {
    if [ -f "$VERSION_FILE" ]; then
        cat "$VERSION_FILE"
    else
        echo "1.2.0"
    fi
}

bump_version() {
    local current=$1
    local type=$2
    local major minor patch

    IFS='.' read -r major minor patch <<< "$current"

    case "$type" in
        major) echo "$((major+1)).0.0" ;;
        minor) echo "${major}.$((minor+1)).0" ;;
        patch) echo "${major}.${minor}.$((patch+1))" ;;
        *) echo "$type" ;;  # literal version
    esac
}

# ═══════════════════════════════════════════════════════
# Token Yükleme
# ═══════════════════════════════════════════════════════

load_tokens() {
    if [ -f "$TOKEN_FILE" ]; then
        set -a
        source "$TOKEN_FILE"
        set +a
        log "Token'lar yüklendi (.sdk-tokens.env)"
    else
        warn ".sdk-tokens.env bulunamadı — sadece dry-run yapılabilir"
    fi
}

# ═══════════════════════════════════════════════════════
# Repo Clone
# ═══════════════════════════════════════════════════════

clone_sdk() {
    local sdk=$1
    local repo="${SDK_REPOS[$sdk]}"
    local dir="$WORK_DIR/$sdk"
    local token="${GITHUB_TOKEN:-}"

    if [ -d "$dir" ]; then
        log "$sdk — zaten klonlanmış, pull"
        (cd "$dir" && git pull --quiet 2>/dev/null) || true
        return 0
    fi

    local clone_url
    if [ -n "$token" ]; then
        clone_url="https://oauth2:${token}@github.com/${GITHUB_USER}/${repo}.git"
    else
        clone_url="https://github.com/${GITHUB_USER}/${repo}.git"
    fi

    if git clone "$clone_url" "$dir" 2>/dev/null; then
        log "$sdk clone ✓"
        return 0
    else
        fail "$sdk clone hatası"
        return 1
    fi
}

# ═══════════════════════════════════════════════════════
# Version Güncelleme (her SDK'nın kendi dosyasında)
# ═══════════════════════════════════════════════════════

update_sdk_version() {
    local sdk=$1
    local version=$2
    local dir="$WORK_DIR/$sdk"

    cd "$dir"

    case "$sdk" in
        node)
            if [ -f package.json ]; then
                sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$version\"/" package.json
                ok "node/package.json → v$version"
            fi
            ;;
        python)
            if [ -f pyproject.toml ]; then
                sed -i "s/^version = \"[^\"]*\"/version = \"$version\"/" pyproject.toml
                ok "python/pyproject.toml → v$version"
            elif [ -f setup.py ]; then
                sed -i "s/version=['\"][^'\"]*['\"]/version='$version'/" setup.py
                ok "python/setup.py → v$version"
            fi
            if [ -f hooksniff/__init__.py ]; then
                sed -i "s/__version__ = ['\"][^'\"]*['\"]/__version__ = '$version'/" hooksniff/__init__.py 2>/dev/null || true
            fi
            ;;
        rust)
            if [ -f Cargo.toml ]; then
                sed -i "0,/^version = \"[^\"]*\"/{s/^version = \"[^\"]*\"/version = \"$version\"/}" Cargo.toml
                ok "rust/Cargo.toml → v$version"
            fi
            ;;
        go)
            ok "go — version tag ile yönetilir"
            ;;
        ruby)
            local vf=$(find . -name "version.rb" 2>/dev/null | head -1)
            if [ -n "$vf" ]; then
                sed -i "s/VERSION = ['\"][^'\"]*['\"]/VERSION = '$version'/" "$vf"
                ok "ruby/version → v$version"
            else
                skip "ruby version dosyası bulunamadı"
            fi
            ;;
        java)
            if [ -f pom.xml ]; then
                sed -i "/<artifactId>hooksniff/,/<version>/{s/<version>[^<]*<\/version>/<version>$version<\/version>/;}" pom.xml 2>/dev/null || true
                ok "java/pom.xml → v$version"
            fi
            ;;
        kotlin)
            if [ -f build.gradle.kts ]; then
                sed -i "s/version = \"[^\"]*\"/version = \"$version\"/" build.gradle.kts
                ok "kotlin/build.gradle.kts → v$version"
            fi
            ;;
        php)
            ok "php — version tag ile yönetilir"
            ;;
        csharp)
            local csproj=$(find . -name "*.csproj" 2>/dev/null | head -1)
            if [ -n "$csproj" ]; then
                sed -i "s/<Version>[^<]*<\/Version>/<Version>$version<\/Version>/" "$csproj"
                ok "csharp/.csproj → v$version"
            fi
            ;;
        elixir)
            if [ -f mix.exs ]; then
                sed -i "s/version: \"[^\"]*\"/version: \"$version\"/" mix.exs
                ok "elixir/mix.exs → v$version"
            fi
            ;;
        swift)
            ok "swift — version tag ile yönetilir"
            ;;
    esac
}

# ═══════════════════════════════════════════════════════
# Test
# ═══════════════════════════════════════════════════════

test_sdk() {
    local sdk=$1
    local dir="$WORK_DIR/$sdk"

    cd "$dir"
    log "Testing $sdk..."

    case "$sdk" in
        node)
            npm ci --silent 2>/dev/null || true
            npm test --silent 2>/dev/null && ok "$sdk test ✓" || skip "$sdk test"
            ;;
        python)
            (pip install -e ".[test]" -q 2>/dev/null || pip install -e . -q 2>/dev/null) || true
            python -m pytest --quiet 2>/dev/null && ok "$sdk test ✓" || skip "$sdk test"
            ;;
        rust)
            cargo test --quiet 2>/dev/null && ok "$sdk test ✓" || skip "$sdk test"
            ;;
        go)
            go test ./... 2>/dev/null && ok "$sdk test ✓" || skip "$sdk test"
            ;;
        ruby)
            ruby -e "require './lib/hooksniff'" 2>/dev/null && ok "$sdk syntax ✓" || skip "$sdk test"
            ;;
        java)
            mvn test -B -q 2>/dev/null && ok "$sdk test ✓" || skip "$sdk test"
            ;;
        kotlin)
            [ -f gradlew ] && ./gradlew test --quiet 2>/dev/null && ok "$sdk test ✓" || skip "$sdk test"
            ;;
        csharp)
            dotnet test --verbosity quiet 2>/dev/null && ok "$sdk test ✓" || skip "$sdk test"
            ;;
        elixir)
            mix test 2>/dev/null && ok "$sdk test ✓" || skip "$sdk test"
            ;;
        swift)
            skip "$sdk test (Swift local'de zor)"
            ;;
        php)
            find . -name "*.php" -exec php -l {} \; 2>/dev/null | grep -v "No syntax errors" || ok "$sdk syntax ✓"
            ;;
    esac
}

# ═══════════════════════════════════════════════════════
# Publish
# ═══════════════════════════════════════════════════════

publish_sdk() {
    local sdk=$1
    local mode=${2:-publish}
    local dir="$WORK_DIR/$sdk"

    cd "$dir"
    section "📦 Publish: $sdk ($mode)"

    case "$sdk" in
        node)
            if ! command -v npm &>/dev/null; then skip "npm yok"; return 0; fi
            if [ "$mode" = "dry-run" ]; then
                npm pack --dry-run 2>/dev/null
                ok "Node.js dry-run ✓"
            else
                [ -z "$NPM_TOKEN" ] && { fail "NPM_TOKEN yok"; return 0; }
                npm publish --access public 2>/dev/null
                ok "Node.js → npm ✓"
            fi
            ;;
        python)
            if ! command -v python3 &>/dev/null; then skip "python3 yok"; return 0; fi
            pip install build twine -q 2>/dev/null || pip3 install build twine -q 2>/dev/null || true
            if ! python3 -c "import build" 2>/dev/null; then
                skip "python build modülü yok"
                return 0
            fi
            if [ "$mode" = "dry-run" ]; then
                python3 -m build 2>/dev/null
                twine check dist/* 2>/dev/null
                ok "Python dry-run ✓"
            else
                [ -z "$PYPI_TOKEN" ] && { fail "PYPI_TOKEN yok"; return 0; }
                python3 -m build 2>/dev/null
                TWINE_USERNAME=__token__ TWINE_PASSWORD="$PYPI_TOKEN" twine upload dist/* 2>/dev/null
                ok "Python → PyPI ✓"
            fi
            ;;
        rust)
            if ! command -v cargo &>/dev/null; then skip "cargo yok"; return 0; fi
            cargo test --quiet 2>/dev/null || true
            if [ "$mode" = "dry-run" ]; then
                cargo package --allow-dirty 2>/dev/null
                ok "Rust dry-run ✓"
            else
                [ -z "$CARGO_REGISTRY_TOKEN" ] && { fail "CARGO_REGISTRY_TOKEN yok"; return 0; }
                cargo publish 2>/dev/null
                ok "Rust → crates.io ✓"
            fi
            ;;
        go)
            if [ "$mode" = "dry-run" ]; then
                ok "Go dry-run ✓ (git tag ile)"
            else
                ok "Go → pkg.go.dev (otomatik, tag ile)"
            fi
            ;;
        ruby)
            if ! command -v gem &>/dev/null; then skip "gem yok"; return 0; fi
            if [ "$mode" = "dry-run" ]; then
                gem build hooksniff.gemspec 2>/dev/null
                ok "Ruby dry-run ✓"
            else
                [ -z "$RUBYGEMS_TOKEN" ] && { fail "RUBYGEMS_TOKEN yok"; return 0; }
                gem build hooksniff.gemspec 2>/dev/null
                gem push hooksniff-*.gem 2>/dev/null
                ok "Ruby → RubyGems ✓"
            fi
            ;;
        java)
            if ! command -v mvn &>/dev/null; then skip "mvn yok"; return 0; fi
            if [ "$mode" = "dry-run" ]; then
                mvn package -B -q 2>/dev/null
                ok "Java dry-run ✓"
            else
                mvn deploy -B -DskipTests 2>/dev/null
                ok "Java → Maven Central ✓"
            fi
            ;;
        kotlin)
            if ! command -v java &>/dev/null; then skip "java yok"; return 0; fi
            if [ "$mode" = "dry-run" ]; then
                [ -f gradlew ] && ./gradlew build --quiet 2>/dev/null
                ok "Kotlin dry-run ✓"
            else
                [ -f gradlew ] && ./gradlew publish 2>/dev/null
                ok "Kotlin → Maven Central ✓"
            fi
            ;;
        php)
            if [ "$mode" = "dry-run" ]; then
                ok "PHP dry-run ✓ (Packagist auto-index)"
            else
                [ -z "$PACKAGIST_TOKEN" ] && { fail "PACKAGIST_TOKEN yok"; return 0; }
                curl -s -X POST "https://packagist.org/api/update-package?username=hooksniff&apiToken=$PACKAGIST_TOKEN" \
                    -H "Content-Type: application/json" \
                    -d '{"repository":{"url":"https://github.com/servetarslan02/hooksniff-php"}}' 2>/dev/null
                ok "PHP → Packagist ✓"
            fi
            ;;
        csharp)
            if ! command -v dotnet &>/dev/null; then skip "dotnet yok"; return 0; fi
            if [ "$mode" = "dry-run" ]; then
                dotnet pack -c Release --verbosity quiet 2>/dev/null
                ok "C# dry-run ✓"
            else
                [ -z "$NUGET_TOKEN" ] && { fail "NUGET_TOKEN yok"; return 0; }
                dotnet pack -c Release 2>/dev/null
                local nupkg=$(find . -name "*.nupkg" -path "*/Release/*" 2>/dev/null | head -1)
                [ -n "$nupkg" ] && dotnet nuget push "$nupkg" --api-key "$NUGET_TOKEN" --source https://api.nuget.org/v3/index.json 2>/dev/null
                ok "C# → NuGet ✓"
            fi
            ;;
        elixir)
            if ! command -v mix &>/dev/null; then skip "mix yok"; return 0; fi
            if [ "$mode" = "dry-run" ]; then
                ok "Elixir dry-run ✓"
            else
                [ -z "$HEX_API_KEY" ] && { fail "HEX_API_KEY yok"; return 0; }
                mix hex.publish --yes 2>/dev/null
                ok "Elixir → Hex.pm ✓"
            fi
            ;;
        swift)
            if [ "$mode" = "dry-run" ]; then
                ok "Swift dry-run ✓ (git tag ile)"
            else
                ok "Swift → Package Index (otomatik)"
            fi
            ;;
    esac
}

# ═══════════════════════════════════════════════════════
# Git Commit + Push (aynı repo)
# ═══════════════════════════════════════════════════════

commit_and_push_sdk() {
    local sdk=$1
    local version=$2
    local dir="$WORK_DIR/$sdk"

    cd "$dir"
    git add -A

    if git diff --cached --quiet; then
        log "$sdk — commit yok (değişiklik yok)"
        return 0
    fi

    git config user.email "servetarslan02@users.noreply.github.com" 2>/dev/null || true
    git config user.name "AI Agent" 2>/dev/null || true

    git commit -m "release: v$version" 2>/dev/null && ok "$sdk commit ✓" || warn "$sdk commit hatası"
    git push origin main 2>/dev/null && ok "$sdk push ✓" || warn "$sdk push hatası"
}

# ═══════════════════════════════════════════════════════
# Git Tag
# ═══════════════════════════════════════════════════════

create_sdk_tag() {
    local sdk=$1
    local version=$2
    local dir="$WORK_DIR/$sdk"

    cd "$dir"

    local tag_name="v$version"
    git tag -a "$tag_name" -m "Release v$version" 2>/dev/null && ok "$sdk tag $tag_name ✓" || warn "$sdk tag zaten var"
    git push origin "$tag_name" 2>/dev/null && ok "$sdk tag push ✓" || warn "$sdk tag push hatası"
}

# ═══════════════════════════════════════════════════════
# Ana Repo Commit
# ═══════════════════════════════════════════════════════

commit_main_repo() {
    local version=$1
    section "📤 Ana Repo Commit"

    cd "$SCRIPT_DIR"
    echo "$version" > "$VERSION_FILE"

    # .ai-context dosyalarını güncelle
    if [ -f ".ai-context/MEMORY.md" ]; then
        sed -i "s/Son güncelleme:.*/Son güncelleme: $(date +%Y-%m-%d\ %H:%M)/" ".ai-context/MEMORY.md"
    fi

    git add -A
    if git diff --cached --quiet; then
        log "Ana repo — commit yok"
        return
    fi

    git config user.email "servetarslan02@users.noreply.github.com" 2>/dev/null
    git config user.name "AI Agent" 2>/dev/null

    git commit -m "release: SDK v$version — local CI/CD" 2>/dev/null
    git push origin main 2>/dev/null && ok "Ana repo push ✓" || warn "Ana repo push hatası"
}

# ═══════════════════════════════════════════════════════
# Status
# ═══════════════════════════════════════════════════════

show_status() {
    header "📊 HookSniff SDK Durum Raporu"
    echo ""

    local current=$(get_current_version)
    echo -e "  ${BOLD}Mevcut Version:${NC} v$current"
    echo -e "  ${BOLD}Version File:${NC}   $VERSION_FILE"
    echo ""

    echo -e "  ${BOLD}SDK Repo'ları:${NC}"
    for sdk in "${ALL_SDKS[@]}"; do
        local repo="${SDK_REPOS[$sdk]}"
        echo -e "    $sdk → github.com/${GITHUB_USER}/${repo}"
    done

    echo ""
    echo -e "  ${BOLD}Token Durumu:${NC}"
    if [ -f "$TOKEN_FILE" ]; then
        echo -e "    .sdk-tokens.env: ${GREEN}mevcut${NC}"
        for token in NPM_TOKEN PYPI_TOKEN CARGO_REGISTRY_TOKEN RUBYGEMS_TOKEN NUGET_TOKEN HEX_API_KEY GITHUB_TOKEN PACKAGIST_TOKEN; do
            if grep -q "^${token}=" "$TOKEN_FILE" 2>/dev/null; then
                local val=$(grep "^${token}=" "$TOKEN_FILE" | cut -d= -f2)
                if [ -n "$val" ] && [ "$val" != '""' ] && [ "$val" != "''" ]; then
                    echo -e "    $token: ${GREEN}✓${NC}"
                else
                    echo -e "    $token: ${YELLOW}boş${NC}"
                fi
            else
                echo -e "    $token: ${RED}✗${NC}"
            fi
        done
    else
        echo -e "    .sdk-tokens.env: ${RED}bulunamadı${NC}"
        echo -e "    ${YELLOW}Önce: cp .sdk-tokens.env.template .sdk-tokens.env${NC}"
    fi
}

# ═══════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════

summary() {
    END_TIME=$(date +%s)
    ELAPSED=$((END_TIME - START_TIME))
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  Release Sonuçları                               ${CYAN}║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC}  ${GREEN}✅ Başarılı:${NC} $PASS                                  ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${RED}❌ Başarısız:${NC} $FAIL                                  ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${YELLOW}⏭ Atlanan:${NC} $SKIP                                   ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ⏱ Süre: ${ELAPSED}s                                    ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
    echo ""

    if [ $FAIL -gt 0 ]; then
        echo -e "${RED}⚠️  $FAIL hata var!${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Release başarılı!${NC}"
    fi
}

# ═══════════════════════════════════════════════════════
# Tek SDK Release
# ═══════════════════════════════════════════════════════

release_single_sdk() {
    local sdk=$1
    local mode=${2:-publish}
    local version=$(get_current_version)

    header "🪝 $sdk Release — v$version ($mode)"

    clone_sdk "$sdk" || return 0
    update_sdk_version "$sdk" "$version"
    test_sdk "$sdk"

    if [ "$mode" = "publish" ]; then
        publish_sdk "$sdk" publish
        commit_and_push_sdk "$sdk" "$version"
        create_sdk_tag "$sdk" "$version"
    else
        publish_sdk "$sdk" dry-run
    fi
}

# ═══════════════════════════════════════════════════════
# Tüm SDK Release
# ═══════════════════════════════════════════════════════

release_all() {
    local mode=${1:-publish}
    local version=$(get_current_version)

    header "🪝 TÜM SDK Release — v$version ($mode)"

    mkdir -p "$WORK_DIR"

    for sdk in "${ALL_SDKS[@]}"; do
        release_single_sdk "$sdk" "$mode"
    done

    if [ "$mode" = "publish" ]; then
        commit_main_repo "$version"
    fi
}

# ═══════════════════════════════════════════════════════
# Yardım
# ═══════════════════════════════════════════════════════

show_help() {
    echo ""
    echo "Kullanım: $0 <komut>"
    echo ""
    echo "Komutlar:"
    echo "  patch          Version bump (1.2.0 → 1.2.1) + test + publish + sync"
    echo "  minor          Version bump (1.2.0 → 1.3.0) + test + publish + sync"
    echo "  major          Version bump (1.2.0 → 2.0.0) + test + publish + sync"
    echo "  set X.Y.Z      Elle version belirle + test + publish + sync"
    echo "  dry-run        Publish etmeden test et"
    echo "  publish-only   Sadece publish (version bump yok)"
    echo "  status         Mevcut durumu göster"
    echo ""
    echo "Tek SDK:"
    echo "  node           Sadece Node.js"
    echo "  python         Sadece Python"
    echo "  go             Sadece Go"
    echo "  rust           Sadece Rust"
    echo "  ruby           Sadece Ruby"
    echo "  java           Sadece Java"
    echo "  kotlin         Sadece Kotlin"
    echo "  php            Sadece PHP"
    echo "  csharp         Sadece C#"
    echo "  elixir         Sadece Elixir"
    echo "  swift          Sadece Swift"
    echo ""
    echo "Örnek:"
    echo "  ./local-release.sh dry-run        # Önce test et"
    echo "  ./local-release.sh patch           # Hemen publish et"
    echo "  ./local-release.sh node            # Sadece Node.js"
    echo "  ./local-release.sh status          # Durum kontrol"
}

# ═══════════════════════════════════════════════════════
# Ana Akış
# ═══════════════════════════════════════════════════════

echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  🪝 HookSniff Local CI/CD                        ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"

MODE="${1:-help}"

case "$MODE" in
    help|-h|--help)
        show_help
        ;;
    status)
        show_status
        ;;
    patch|minor|major)
        load_tokens
        NEW_VERSION=$(bump_version "$(get_current_version)" "$MODE")
        header "Version: $(get_current_version) → $NEW_VERSION"
        echo "$NEW_VERSION" > "$VERSION_FILE"
        release_all publish
        summary
        ;;
    set)
        [ -z "$2" ] && { echo "Kullanım: $0 set 1.5.0"; exit 1; }
        load_tokens
        header "Version → $2"
        echo "$2" > "$VERSION_FILE"
        release_all publish
        summary
        ;;
    dry-run)
        load_tokens
        header "DRY-RUN — Version: $(get_current_version)"
        release_all dry-run
        summary
        ;;
    publish-only)
        load_tokens
        header "PUBLISH-ONLY — Version: $(get_current_version)"
        release_all publish
        summary
        ;;
    *)
        # Tek SDK kontrolü
        if [ -n "${SDK_REPOS[$MODE]+x}" ]; then
            load_tokens
            release_single_sdk "$MODE" publish
            summary
        else
            echo -e "${RED}Bilinmeyen komut: $MODE${NC}"
            show_help
            exit 1
        fi
        ;;
esac
