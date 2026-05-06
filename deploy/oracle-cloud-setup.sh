#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# HookRelay — Oracle Cloud Always Free Setup Script
# ═══════════════════════════════════════════════════════════════════
# Bu script, Oracle Cloud Always Free ARM (Ampere A1) instance'ı üzerinde
# Docker kurulumu, firewall yapılandırması ve HookRelay servislerini
# başlatmak için kullanılır.
#
# Desteklenen ortam: Ubuntu 22.04/24.04 ARM64 (aarch64)
# Oracle Cloud Always Free: 4 OCPU, 24 GB RAM (flexible shape)
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Renkler ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

info()  { echo -e "${CYAN}[INFO]${NC} $*"; }
ok()    { echo -e "${GREEN}[OK]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# ── Root kontrolü ──
if [[ $EUID -ne 0 ]]; then
    error "Bu script root olarak çalıştırılmalı. Kullanım: sudo bash $0"
    exit 1
fi

# ── Mimari kontrolü ──
ARCH=$(uname -m)
if [[ "$ARCH" != "aarch64" ]]; then
    warn "Bu script ARM64 (aarch64) için tasarlandı. Mevcut mimari: $ARCH"
    warn "Devam ediliyor ama ARM64 dışı ortamlarda sorunlar olabilir."
fi

# ── HookRelay dizini ──
HOOKRELAY_DIR="${HOOKRELAY_DIR:-/opt/hookrelay}"
info "HookRelay dizini: $HOOKRELAY_DIR"

# ═══════════════════════════════════════════════════════════════════
# 1. Sistem güncellemeleri
# ═══════════════════════════════════════════════════════════════════
info "Sistem paketleri güncelleniyor..."
apt-get update -qq
apt-get upgrade -y -qq
ok "Sistem güncellendi."

# ═══════════════════════════════════════════════════════════════════
# 2. Docker kurulumu
# ═══════════════════════════════════════════════════════════════════
if command -v docker &>/dev/null; then
    ok "Docker zaten kurulu: $(docker --version)"
else
    info "Docker kuruluyor..."

    # Docker'ın resmi kurulum scripti (güvenli, resmi kaynak)
    apt-get install -y -qq ca-certificates curl gnupg lsb-release

    # Docker GPG anahtarı
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
        gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    # Docker repository
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
        https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | \
        tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io \
        docker-buildx-plugin docker-compose-plugin

    # Docker servisini başlat
    systemctl enable docker
    systemctl start docker

    # Mevcut kullanıcıyı docker grubuna ekle
    REAL_USER="${SUDO_USER:-$USER}"
    if [[ "$REAL_USER" != "root" ]]; then
        usermod -aG docker "$REAL_USER"
        info "Kullanıcı '$REAL_USER' docker grubuna eklendi."
        info "Yeni oturum açmanız veya 'newgrp docker' çalıştırmanız gerekebilir."
    fi

    ok "Docker kuruldu: $(docker --version)"
fi

# Docker Compose kontrolü (plugin olarak)
if docker compose version &>/dev/null; then
    ok "Docker Compose plugin mevcut: $(docker compose version --short)"
else
    error "Docker Compose plugin bulunamadı. Lütfen Docker'ı yeniden kurun."
    exit 1
fi

# ═══════════════════════════════════════════════════════════════════
# 3. Firewall yapılandırması (iptables)
# ═══════════════════════════════════════════════════════════════════
info "Firewall yapılandırılıyor..."

# iptables kur (Oracle Cloud Ubuntu'da varsayılan olarak gelmeyebilir)
apt-get install -y -qq iptables-persistent netfilter-persistent 2>/dev/null || true

# Portları aç: 80 (HTTP), 443 (HTTPS), 3000 (API), 3001 (Dashboard dev)
for port in 80 443 3000 3001; do
    iptables -C INPUT -p tcp --dport "$port" -j ACCEPT 2>/dev/null || \
        iptables -A INPUT -p tcp --dport "$port" -j ACCEPT
    info "Port $port açıldı."
done

# Kuralları kaydet
if command -v netfilter-persistent &>/dev/null; then
    netfilter-persistent save 2>/dev/null || true
fi

ok "Firewall kuralları uygulandı (80, 443, 3000, 3001)."

# ═══════════════════════════════════════════════════════════════════
# 4. Oracle Cloud Security List notu
# ═══════════════════════════════════════════════════════════════════
warn "ÖNEMLI: Oracle Cloud Console > Networking > Security List bölümünden"
warn "de port 80, 443, 3000, 3001 için Ingress kuralı eklemeyi unutmayın!"
warn "Kaynak: 0.0.0.0/0, Protokol: TCP, Hedef Port: 80,443,3000,3001"

# ═══════════════════════════════════════════════════════════════════
# 5. HookRelay dizinini oluştur ve dosyaları kopyala
# ═══════════════════════════════════════════════════════════════════
info "HookRelay dizini hazırlanıyor..."

mkdir -p "$HOOKRELAY_DIR"

# Bu script'in bulunduğu dizindeki dosyaları kopyala
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# deploy dizinindeki prod dosyalarını kopyala
cp "$SCRIPT_DIR/docker-compose.prod.yml" "$HOOKRELAY_DIR/docker-compose.yml"
cp "$SCRIPT_DIR/Dockerfile.api.prod" "$HOOKRELAY_DIR/Dockerfile.api.prod"
cp "$SCRIPT_DIR/Dockerfile.worker.prod" "$HOOKRELAY_DIR/Dockerfile.worker.prod"

# .env.production.example'dan .env oluştur (eğer yoksa)
if [[ ! -f "$HOOKRELAY_DIR/.env" ]]; then
    if [[ -f "$SCRIPT_DIR/env.production.example" ]]; then
        cp "$SCRIPT_DIR/env.production.example" "$HOOKRELAY_DIR/.env"
        warn ".env dosyası oluşturuldu. Lütfen düzenleyin: $HOOKRELAY_DIR/.env"
    else
        warn ".env.production.example bulunamadı. Elle .env oluşturmanız gerekiyor."
    fi
fi

ok "HookRelay dosyaları kopyalandı."

# ═══════════════════════════════════════════════════════════════════
# 6. Systemd servisi oluştur
# ═══════════════════════════════════════════════════════════════════
info "Systemd servisi oluşturuluyor..."

cat > /etc/systemd/system/hookrelay.service << EOF
[Unit]
Description=HookRelay - Webhook Relay Service
Documentation=https://github.com/hookrelay/hookrelay
After=docker.service network-online.target
Requires=docker.service
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$HOOKRELAY_DIR

# Servisleri başlat
ExecStart=/usr/bin/docker compose up -d --remove-orphans
# Servisleri durdur
ExecStop=/usr/bin/docker compose down
# Servisleri yeniden başlat
ExecReload=/usr/bin/docker compose restart

# Ortam değişkenleri
EnvironmentFile=-$HOOKRELAY_DIR/.env

# Yeniden başlatma politikası
Restart=on-failure
RestartSec=30

# Güvenlik
NoNewPrivileges=true

# Loglama
StandardOutput=journal
StandardError=journal
SyslogIdentifier=hookrelay

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable hookrelay.service

ok "Systemd servisi oluşturuldu ve etkinleştirildi."

# ═══════════════════════════════════════════════════════════════════
# 7. Servisleri başlat
# ═══════════════════════════════════════════════════════════════════
info "HookRelay servisleri başlatılıyor..."

cd "$HOOKRELAY_DIR"

# .env dosyası kontrolü
if [[ ! -f ".env" ]]; then
    error ".env dosyası bulunamadı! Lütfen oluşturun: $HOOKRELAY_DIR/.env"
    error "Şablon: deploy/env.production.example"
    exit 1
fi

# Image'ları çek ve servisleri başlat
# Not: Bu sunucuda build yapılacaksa Dockerfile'lar da kopyalanır.
# Pre-built image'lar registry'den çekilebilir.
if [[ -f "Dockerfile.api.prod" ]]; then
    info "Image'lar build ediliyor (ARM64)..."
    docker compose build --parallel
fi

docker compose up -d

# Sağlık kontrolü
info "Sağlık kontrolü bekleniyor..."
sleep 15

# Servis durumlarını kontrol et
docker compose ps

# API sağlık kontrolü
API_HEALTH=$(curl -sf http://localhost:3000/health 2>/dev/null && echo "OK" || echo "FAIL")
if [[ "$API_HEALTH" == "OK" ]]; then
    ok "API sağlıklı."
else
    warn "API henüz hazır değil. Logları kontrol edin: docker compose logs api"
fi

# ═══════════════════════════════════════════════════════════════════
# 8. Otomatik güncelleme scripti (opsiyonel)
# ═══════════════════════════════════════════════════════════════════
info "Otomatik güncelleme scripti oluşturuluyor..."

cat > "$HOOKRELAY_DIR/update.sh" << 'UPDATE_EOF'
#!/bin/bash
# HookRelay otomatik güncelleme scripti
# Kullanım: bash /opt/hookrelay/update.sh

set -euo pipefail

HOOKRELAY_DIR="/opt/hookrelay"
cd "$HOOKRELAY_DIR"

echo "🔄 HookRelay güncelleniyor..."

# Mevcut image'ları yedekle (rollback için)
docker compose ps --format json > /tmp/hookrelay-backup-$(date +%Y%m%d%H%M%S).json 2>/dev/null || true

# Yeni image'ları çek/build et
docker compose pull 2>/dev/null || docker compose build --parallel

# Servisleri yeniden başlat
docker compose up -d --remove-orphans

# Sağlık kontrolü
sleep 15
if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Güncelleme başarılı!"
else
    echo "❌ Güncelleme sonrası sağlık kontrolü başarısız!"
    echo "   Logları kontrol edin: docker compose logs"
fi
UPDATE_EOF

chmod +x "$HOOKRELAY_DIR/update.sh"

ok "Güncelleme scripti oluşturuldu: $HOOKRELAY_DIR/update.sh"

# ═══════════════════════════════════════════════════════════════════
# 9. Log rotasyonu
# ═══════════════════════════════════════════════════════════════════
info "Docker log rotasyonu ayarlanıyor..."

cat > /etc/docker/daemon.json << 'DAEMON_EOF'
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    }
}
DAEMON_EOF

systemctl restart docker

ok "Docker log rotasyonu ayarlandı (10MB, 3 dosya)."

# ═══════════════════════════════════════════════════════════════════
# 10. Tamamlandı
# ═══════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ HookRelay kurulumu tamamlandı!${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  📁 Dizin:     $HOOKRELAY_DIR"
echo "  🔧 Servis:    systemctl start/stop/restart hookrelay"
echo "  📊 Durum:     docker compose -f $HOOKRELAY_DIR/docker-compose.yml ps"
echo "  📝 Loglar:    journalctl -u hookrelay -f"
echo "  🔄 Güncelleme: bash $HOOKRELAY_DIR/update.sh"
echo ""
echo "  ⚠️  Lütfen .env dosyasını düzenleyin:"
echo "     nano $HOOKRELAY_DIR/.env"
echo ""
echo "  ⚠️  Oracle Cloud Security List'te portları açın:"
echo "     80, 443, 3000, 3001 (Ingress, TCP, 0.0.0.0/0)"
echo ""
echo "═══════════════════════════════════════════════════════════════"
