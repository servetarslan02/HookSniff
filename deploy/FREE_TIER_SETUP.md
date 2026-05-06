# HookRelay — Ücretsiz (Free Tier) Deployment Rehberi

Bu rehber, HookRelay'ı **tamamen ücretsiz** servisler kullanarak production ortamına nasıl deploy edeceğinizi adım adım anlatır.

## Mimari Özet

```
┌─────────────────────────────────────────────────────────┐
│                    HookRelay Architecture                │
│                                                         │
│  ┌──────────┐     ┌──────────────┐     ┌──────────┐    │
│  │ Webhook  │────▶│  API (Rust)  │────▶│ Worker   │    │
│  │ Sources  │     │  Oracle Cloud│     │ (Rust)   │    │
│  └──────────┘     │  ARM64 Free  │     └────┬─────┘    │
│                   └──────┬───────┘          │          │
│                          │                  ▼          │
│                   ┌──────▼───────┐   ┌──────────┐      │
│                   │  Neon DB     │   │ Webhook  │      │
│                   │  (PostgreSQL)│   │ Dest.    │      │
│                   │  Free Tier   │   └──────────┘      │
│                   └──────────────┘                      │
│                                                         │
│  ┌──────────┐     ┌──────────────┐                      │
│  │Dashboard │────▶│   Vercel     │                      │
│  │ (Next.js)│     │  Free Tier   │                      │
│  └──────────┘     └──────────────┘                      │
│                                                         │
│  ┌──────────┐     ┌──────────────┐     ┌──────────┐    │
│  │ Upstash  │     │ Grafana      │     │ Cloudflare│   │
│  │ Redis    │     │ Cloud        │     │ R2       │    │
│  │ Free     │     │ Free         │     │ Free     │    │
│  └──────────┘     └──────────────┘     └──────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Ücretsiz Servisler ve Limitler

| Servis | Ne İçin | Free Tier Limiti |
|--------|---------|-------------------|
| **Oracle Cloud** | API + Worker sunucusu | 4 OCPU ARM, 24 GB RAM, 200 GB disk |
| **Neon** | PostgreSQL veritabanı | 0.5 GB depolama, 24/7 compute |
| **Upstash** | Redis (queue/cache) | 10,000 komut/gün, 256 MB |
| **Vercel** | Dashboard (Next.js) | 100 GB bandwidth/ay |
| **Grafana Cloud** | Monitoring/logs/traces | 10K metrics, 50 GB logs |
| **Resend** | E-posta gönderimi | 3,000 e-posta/ay |
| **Cloudflare R2** | Object storage | 10 GB, 10M istek/ay |

---

## Adım 1: Oracle Cloud Always Free Hesabı

### 1.1 Kayıt Olma

1. [https://cloud.oracle.com/free](https://cloud.oracle.com/free) adresine gidin
2. **Always Free** tier'ı seçin (kredi kartı gerekli ama ücret alınmaz)
3. Hesap doğrulamasını tamamlayın (e-posta + telefon)

### 1.2 ARM Instance Oluşturma

1. Oracle Cloud Console > **Compute** > **Instances** > **Create Instance**
2. Aşağıdaki ayarları yapın:
   - **Name**: `hookrelay-server`
   - **Image**: `Ubuntu 24.04 Minimal aarch64`
   - **Shape**: `VM.Standard.A1.Flex` (ARM Ampere)
   - **OCPU**: 4 (maksimum ücretsiz)
   - **Memory**: 24 GB
   - **Boot Volume**: 200 GB (ücretsiz limit)
   - **Networking**: VCN oluştur veya mevcut seç
   - **SSH Keys**: Public key'inizi ekleyin

3. **Create** butonuna tıklayın

### 1.3 Security List Yapılandırması

1. **Networking** > **Virtual Cloud Networks** > VCN'niz > **Security Lists** > **Default Security List**
2. **Add Ingress Rules** ekleyin:

| Kaynak | Protokol | Hedef Port | Açıklama |
|--------|----------|------------|----------|
| 0.0.0.0/0 | TCP | 80 | HTTP |
| 0.0.0.0/0 | TCP | 443 | HTTPS |
| 0.0.0.0/0 | TCP | 3000 | API |
| 0.0.0.0/0 | TCP | 3001 | Dashboard (dev) |

### 1.4 Instance'a Bağlanma

```bash
ssh -i ~/.ssh/your-key ubuntu@<INSTANCE_PUBLIC_IP>
```

### 1.5 HookRelay Kurulumu

```bash
# Projeyi klonlayın (veya dosyaları kopyalayın)
git clone https://github.com/your-org/hookrelay.git
cd hookrelay

# Kurulum scriptini çalıştırın
sudo bash deploy/oracle-cloud-setup.sh
```

Script şunları otomatik yapar:
- Docker ve Docker Compose kurulumu
- Firewall kuralları (iptables)
- Systemd servisi oluşturma
- Servisleri başlatma

---

## Adım 2: Neon — PostgreSQL (Veritabanı)

### 2.1 Kayıt Olma

1. [https://neon.tech](https://neon.tech) adresine gidin
2. GitHub veya Google ile giriş yapın
3. **Free Plan** otomatik olarak seçilir

### 2.2 Veritabanı Oluşturma

1. Neon Dashboard > **Create a project**
2. Ayarlar:
   - **Project name**: `hookrelay`
   - **Database name**: `hookrelay`
   - **Region**: `US East (Virginia)` (Oracle instance'ınıza en yakın)
3. **Create project** tıklayın

### 2.3 Connection String Alma

1. Neon Dashboard > **Connection Details**
2. **Connection string**'i kopyalayın:
   ```
   postgresql://user:password@ep-xxx-yyy.us-east-2.aws.neon.tech/hookrelay?sslmode=require
   ```
3. Bu değeri `.env` dosyasındaki `DATABASE_URL` alanına yapıştırın

### 2.4 Şema Oluşturma

Neon SQL Editor'de HookRelay tablolarını oluşturun:

```sql
-- Neon'da çalıştırılacak SQL (HookRelay migration'ları)
-- Bu SQL, HookRelay'ın ihtiyaç duyduğu tabloları oluşturur

CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    endpoint_url TEXT NOT NULL,
    secret_hash TEXT NOT NULL,
    events TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id),
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    attempts INT NOT NULL DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    next_retry_at TIMESTAMPTZ,
    response_status INT,
    response_body TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_tenant ON webhooks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_webhook ON deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_next_retry ON deliveries(next_retry_at) WHERE status = 'pending';
```

---

## Adım 3: Upstash — Redis (Queue/Cache)

### 3.1 Kayıt Olma

1. [https://upstash.com](https://upstash.com) adresine gidin
2. GitHub ile giriş yapın
3. Free plan otomatik olarak aktif olur

### 3.2 Database Oluşturma

1. Upstash Dashboard > **Create Database**
2. Ayarlar:
   - **Name**: `hookrelay`
   - **Region**: `us-east-1` (en yakın bölge)
   - **Type**: Regional (daha ucuz)
3. **Create** tıklayın

### 3.3 Redis URL Alma

1. Database detay sayfasına gidin
2. **Redis URL**'yi kopyalayın:
   ```
   redis://default:xxx@yyy-xxx.upstash.io:6379
   ```
3. `.env` dosyasındaki `REDIS_URL` alanına yapıştırın

---

## Adım 4: Grafana Cloud — Monitoring

### 4.1 Kayıt Olma

1. [https://grafana.com](https://grafana.com) adresine gidin
2. **Get started for free** tıklayın
3. Hesap oluşturun

### 4.2 Free Tier Yapılandırması

1. Grafana Cloud > **My Account**
2. **Stack** bölümünde:
   - **Prometheus** (metrics): URL ve API key kopyalayın
   - **Loki** (logs): URL ve API key kopyalayın
   - **Tempo** (traces): URL ve API key kopyalayın

### 3.3 OTLP Endpoint Alma

1. Grafana Cloud > **My Account** > **OTLP**
2. **OTLP endpoint URL**'yi kopyalayın:
   ```
   https://otlp-gateway-xxx.grafana.net/otlp
   ```
3. **OTLP token**'ı base64 ile encode edin:
   ```bash
   echo -n "your-instance-id:your-api-key" | base64
   ```
4. `.env` dosyasına yazın:
   ```
   OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-xxx.grafana.net/otlp
   OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic_base64_encoded_value
   ```

---

## Adım 5: Cloudflare R2 — Object Storage

### 5.1 Kayıt Olma

1. [https://dash.cloudflare.com](https://dash.cloudflare.com) adresine gidin
2. Hesap oluşturun (ücretsiz)
3. Sol menüden **R2** seçin

### 5.2 Bucket Oluşturma

1. **Create bucket** tıklayın
2. **Bucket name**: `hookrelay-webhooks`
3. **Region**: Automatic
4. **Create bucket** tıklayın

### 5.3 API Token Oluşturma

1. R2 ana sayfası > **Manage R2 API Tokens**
2. **Create API token** tıklayın
3. Ayarlar:
   - **Token name**: `hookrelay`
   - **Permissions**: `Object Read & Write`
   - **Specify bucket**: `hookrelay-webhooks`
4. **Create API Token** tıklayın
5. **Access Key ID** ve **Secret Access Key**'i kopyalayın
6. `.env` dosyasına yazın

### 5.4 Public URL (Opsiyonel)

Dosyaları public erişim için açmak isterseniz:
1. Bucket ayarları > **Public Access** > **Allow Access**
2. Public URL formatı: `https://pub-xxx.r2.dev`

---

## Adım 6: Resend — E-posta

### 6.1 Kayıt Olma

1. [https://resend.com](https://resend.com) adresine gidin
2. GitHub ile giriş yapın
3. Free plan otomatik olarak aktif

### 6.2 Domain Doğrulama (Opsiyonel)

1. Resend Dashboard > **Domains** > **Add Domain**
2. Domain'inizi ekleyin
3. DNS kayıtlarını (SPF, DKIM, DMARC) ekleyin
4. Doğrulamayı bekleyin

> **Not**: Domain eklemezseniz `onboarding@resend.com` adresinden gönderim yapabilirsiniz (sadece test için).

### 6.3 API Key Alma

1. Resend Dashboard > **API Keys** > **Create API Key**
2. **Name**: `hookrelay`
3. **Permission**: `Full access`
4. **Create** tıklayın
5. API key'i kopyalayın (sadece bir kez gösterilir!)
6. `.env` dosyasına yazın

---

## Adım 7: Vercel — Dashboard Deploy

### 7.1 Kayıt Olma

1. [https://vercel.com](https://vercel.com) adresine gidin
2. GitHub ile giriş yapın
3. Free plan otomatik olarak aktif

### 7.2 Proje Oluşturma

1. Vercel Dashboard > **Add New** > **Project**
2. GitHub repo'nuzu seçin (hookrelay)
3. Ayarlar:
   - **Framework Preset**: Next.js
   - **Root Directory**: `dashboard`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. **Environment Variables** ekleyin:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-api-domain.com/v1` |
| `NEXT_PUBLIC_APP_NAME` | `HookRelay` |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` |

5. **Deploy** tıklayın

### 7.3 Custom Domain (Opsiyonel)

1. Vercel Dashboard > Project > **Settings** > **Domains**
2. Domain'inizi ekleyin
3. DNS kayıtlarını yapılandırın

---

## Adım 8: .env Yapılandırması

Oracle Cloud instance'ınızda `.env` dosyasını düzenleyin:

```bash
cd /opt/hookrelay
nano .env
```

Örnek `.env` (tüm değerleri kendi bilgilerinizle değiştirin):

```env
# Uygulama
APP_ENV=production
PORT=3000
RUST_LOG=info,hookrelay=info

# Güvenlik (openssl rand -hex 32 ile oluşturun)
HMAC_SECRET=a1b2c3d4e5f6...
JWT_SECRET=f6e5d4c3b2a1...

# Neon PostgreSQL
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/hookrelay?sslmode=require

# Upstash Redis
REDIS_URL=redis://default:xxx@yyy.upstash.io:6379

# Grafana Cloud
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-xxx.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic_xxx
OTEL_SERVICE_NAME=hookrelay

# Resend
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Cloudflare R2
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=hookrelay-webhooks
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Worker
MAX_ATTEMPTS=3
WORKER_CONCURRENCY=10
```

---

## Adım 9: Servisleri Başlatma

```bash
# Oracle Cloud instance'ında
cd /opt/hookrelay

# Servisleri başlat
sudo systemctl start hookrelay

# Durumu kontrol et
sudo systemctl status hookrelay

# Docker durumunu kontrol et
docker compose ps

# API sağlık kontrolü
curl http://localhost:3000/health

# Logları takip et
sudo journalctl -u hookrelay -f
```

---

## Adım 10: Domain ve SSL (Opsiyonel)

### Cloudflare Tunnel (Ücretsiz SSL + Proxy)

1. [https://one.dash.cloudflare.com](https://one.dash.cloudflare.com) > **Tunnels**
2. **Create a tunnel** > **Cloudflared**
3. Tunnel'ı kurun:
   ```bash
   # Oracle Cloud instance'ında
   curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
   sudo dpkg -i cloudflared.deb
   cloudflared tunnel login
   cloudflared tunnel create hookrelay
   ```
4. Tunnel yapılandırmasını oluşturun:
   ```yaml
   # ~/.cloudflared/config.yml
   tunnel: <tunnel-id>
   credentials-file: /root/.cloudflared/<tunnel-id>.json

   ingress:
     - hostname: api.yourdomain.com
       service: http://localhost:3000
     - hostname: yourdomain.com
       service: http://localhost:3001
     - service: http_status:404
   ```
5. Tunnel'ı başlatın:
   ```bash
   cloudflared tunnel run hookrelay
   ```
6. Systemd servisi olarak ayarlayın:
   ```bash
   sudo cloudflared service install
   sudo systemctl enable cloudflared
   sudo systemctl start cloudflared
   ```

---

## Sorun Giderme

### Docker build ARM64 hatası

**Sorun**: `exec format error` veya `no match for platform`

**Çözüm**:
```bash
# Docker buildx ile ARM64 build
docker buildx create --name arm64builder --use
docker buildx build --platform linux/arm64 -f deploy/Dockerfile.api.prod -t hookrelay-api:latest --load .
```

### Neon bağlantı hatası

**Sorun**: `connection refused` veya `SSL required`

**Çözüm**:
- Connection string'de `?sslmode=require` olduğundan emin olun
- Neon dashboard'dan connection string'i yeniden kopyalayın
- Instance'ınızın Neon'un bölgesine erişebildiğini kontrol edin

### Upstash bağlantı hatası

**Sorun**: `ECONNREFUSED` veya `NOAUTH`

**Çözüm**:
- Redis URL'nin doğru formatta olduğunu kontrol edin: `redis://default:password@host:port`
- Upstash dashboard'dan URL'yi yeniden kopyalayın
- Free tier limitini aşmadığınızı kontrol edin (10K komut/gün)

### Servis başlamıyor

**Sorun**: `docker compose up` sonrası servisler hemen kapanıyor

**Çözüm**:
```bash
# Logları kontrol et
docker compose logs api
docker compose logs worker

# .env dosyasını kontrol et
cat .env | grep -v "^#" | grep -v "^$"

# Manuel test
docker compose up api  # sadece API'yi başlat
```

### Oracle Cloud instance erişilemiyor

**Sorun**: SSH veya port erişimi yok

**Çözüm**:
1. Oracle Cloud Console > **Instances** > Instance > **VNIC** > **Security Lists**
2. Ingress kurallarının doğru olduğundan emin olun
3. Instance'ın public IP'sini kontrol edin
4. `iptables` kurallarını kontrol edin: `sudo iptables -L -n`

### Bellek yetersiz

**Sorun**: OOM (Out of Memory) hatası

**Çözüm**:
```bash
# Swap dosyası oluştur (2 GB)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Docker bellek limitlerini kontrol et
docker stats
```

---

## Güncelleme Prosedürü

HookRelay'ı güncellemek için:

```bash
cd /opt/hookrelay

# Otomatik güncelleme scriptini çalıştır
bash update.sh

# Veya manuel olarak:
git pull origin main
docker compose build --parallel
docker compose up -d --remove-orphans

# Sağlık kontrolü
sleep 15
curl http://localhost:3000/health
```

---

## Maliyet Tahmini

Bu kurulumun aylık maliyeti:

| Servis | Free Tier | Tahmini Maliyet |
|--------|-----------|-----------------|
| Oracle Cloud | 4 OCPU, 24 GB RAM | **$0** |
| Neon | 0.5 GB DB | **$0** |
| Upstash | 10K cmd/gün | **$0** |
| Vercel | 100 GB bandwidth | **$0** |
| Grafana Cloud | 10K metrics | **$0** |
| Resend | 3K e-posta/ay | **$0** |
| Cloudflare R2 | 10 GB storage | **$0** |
| Cloudflare Tunnel | Ücretsiz | **$0** |
| **Toplam** | | **$0/ay** |

> **Not**: Free tier limitlerini aşarsanız ücretlendirme başlayabilir. Limitleri izleyin ve uyarıları açın.
