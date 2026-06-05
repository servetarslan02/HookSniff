#!/bin/bash
# ═══════════════════════════════════════════════════════════
# HookSniff SDK Sync — Ana repodaki SDK'ları ayrı repo'lara push et
# Kullanım: ./sync-sdks.sh [sdk-name|all]
# ═══════════════════════════════════════════════════════════
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SDK_DIR="$SCRIPT_DIR/sdks"
TMP_DIR="/tmp/hooksniff-sync"
GITHUB_USER="servetarslan02"
# Token from .sdk-tokens.env or hardcoded
TOKEN="${GITHUB_TOKEN:-}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}▸${NC} $1"; }
ok()   { echo -e "  ${GREEN}✅${NC} $1"; }
fail() { echo -e "  ${RED}❌${NC} $1"; }
section() { echo -e "\n${CYAN}━━━ $1 ━━━${NC}"; }

sync_sdk() {
    local name=$1
    local src_dir="$SDK_DIR/$name"
    local repo_name="hooksniff-${name}"
    local repo_url="https://oauth2:${TOKEN}@github.com/${GITHUB_USER}/${repo_name}.git"
    local tmp_dir="$TMP_DIR/${name}"

    if [ ! -d "$src_dir" ]; then
        fail "Kaynak klasör bulunamadı: $src_dir"
        return 1
    fi

    section "$name → ${repo_name}"

    # Clone ayrı repo
    rm -rf "$tmp_dir"
    log "Cloning ${repo_name}..."
    git clone "$repo_url" "$tmp_dir" 2>/dev/null

    # Mevcut dosyaları temizle (hariç: .git, README.md)
    cd "$tmp_dir"
    find . -maxdepth 1 ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} +

    # Ana repodaki SDK dosyalarını kopyala
    log "Copying files from sdks/${name}/..."
    cp -r "$src_dir"/* . 2>/dev/null || true
    cp -r "$src_dir"/.[^.]* . 2>/dev/null || true  # hidden files

    # .gitignore oluştur (node_modules, target, __pycache__ vb.)
    cat > .gitignore << 'GITIGNORE'
node_modules/
target/
__pycache__/
*.pyc
*.o
*.so
*.dylib
*.dll
dist/
build/
*.egg-info/
.mypy_cache/
.pytest_cache/
result
GITIGNORE

    # Commit ve push
    git add -A
    if git diff --cached --quiet; then
        log "Değişiklik yok, skip"
    else
        local file_count=$(git diff --cached --stat | tail -1)
        git commit -m "sync: ana repodan güncellendi ($(date +%Y-%m-%d))

$file_count"
        git push origin main 2>/dev/null
        ok "Push edildi — $file_count"
    fi

    cd "$SCRIPT_DIR"
    rm -rf "$tmp_dir"
}

# ── Ana Akış ───────────────────────────────────────────

echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  HookSniff SDK Sync                              ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"

TARGET="${1:-all}"

mkdir -p "$TMP_DIR"

# Sadece mevcut repo'ları sync et
EXISTING_REPOS="go java kotlin php ruby swift"

case "$TARGET" in
    all)
        for sdk in $EXISTING_REPOS; do
            sync_sdk "$sdk"
        done
        echo ""
        echo -e "${YELLOW}⚠️  Ayrı repo'su olmayan SDK'lar:${NC} node, python, rust, csharp, elixir"
        echo -e "   Bunlar sadece ana repoda (HookSniff/sdks/) duruyor."
        ;;
    *)
        if echo "$EXISTING_REPOS" | grep -qw "$TARGET"; then
            sync_sdk "$TARGET"
        else
            echo -e "${YELLOW}⚠️  $TARGET için ayrı repo yok. Sadece ana repoda.${NC}"
        fi
        ;;
esac

rm -rf "$TMP_DIR"

echo ""
echo -e "${GREEN}✅ Sync tamamlandı!${NC}"
