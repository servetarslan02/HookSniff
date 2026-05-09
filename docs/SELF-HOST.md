# Self-Host Guide — HookSniff

HookSniff'i kendi sunucunuzda çalıştırın. Tek komutla kurulum.

## Hızlı Kurulum

```bash
# 1. Repo'yu klonlayın
git clone https://github.com/servetarslan02/HookSniff.git
cd HookSniff

# 2. Tek komutla başlatın
make self-host
```

Bu komut şunları yapar:
- `.env.example` → `.env` kopyalar (düzenlemeniz gerekir)
- Docker image'ları build eder
- Tüm servisleri başlatır (API, Worker, Dashboard, PostgreSQL, Redis)
- Sağlık kontrolü yapar

## Servisler

| Servis | Port | Açıklama |
|--------|------|----------|
| Dashboard | 3001 | Web arayüzü |
| API | 3000 | REST API |
| PostgreSQL | 5432 | Veritabanı |
| Redis | 6379 | Cache + Queue |

## Yönetim Komutları

```bash
# Durum kontrolü
make self-host-status

# Veritabanı yedekleme
make self-host-backup

# Güncelleme (git pull + rebuild)
make self-host-update

# Tüm servisleri durdur
make stop

# Logları göster
make logs

# Tek servis logu
make logs-api
make logs-worker
make logs-db
```

## İlk Kurulum

Servisleri başlattıktan sonra:

```bash
# İlk kullanıcıyı oluşturun
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "your-password"}'

# API key'inizi dashboard'dan oluşturun
# http://localhost:3001/dashboard/api-keys
```

## Ortam Değişkenleri (.env)

```env
# Veritabanı (Docker PostgreSQL kullanıyorsanız değişmeyin)
DATABASE_URL=postgresql://hooksniff:hooksniff@postgres:5432/hooksniff

# Redis (Docker Redis kullanıyorsanız değişmeyin)
REDIS_URL=redis://redis:6379

# JWT Secret (değiştirin!)
JWT_SECRET=rastgele-64-karakter-hex-string

# HMAC Secret (değiştirin!)
HMAC_SECRET=rastgele-64-karakter-hex-string

# API Base URL (production'da domain'iniz)
API_BASE_URL=http://localhost:3000
DASHBOARD_URL=http://localhost:3001
```

Secret üretmek için:
```bash
make generate-secret
```

## Production Deployment

### Reverse Proxy (Nginx)

```nginx
server {
    server_name hooksniff.example.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    server_name api.hooksniff.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d hooksniff.example.com -d api.hooksniff.example.com
```

### Firewall

```bash
# Sadece HTTP/HTTPS ve SSH'a izin ver
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Docker Compose (Doğrudan)

```bash
# Başlat
docker compose up -d --build

# Durdur
docker compose down

# Veritabanı sıfırla
docker compose down -v
docker compose up -d --build
```

## Sorun Giderme

```bash
# Servis durumlarını kontrol et
make status

# Logları göster
make logs

# Otomatik düzeltme
make fix

# Her şeyi sıfırla
make reset
```

### Yaygın Sorunlar

**Port kullanımda:**
```bash
sudo lsof -i :3000
sudo lsof -i :3001
```

**Veritabanı bağlantı hatası:**
```bash
make db-shell
# PostgreSQL kabuğunda:
# \dt  (tabloları listele)
# SELECT COUNT(*) FROM customers;
```

**Docker bellek yetersiz:**
```bash
docker system prune -a
```

## Güncelleme

```bash
# Tek komutla güncelleme
make self-host-update

#veya manuel:
git pull origin main
docker compose build
docker compose up -d
```

## Yedekleme ve Geri Yükleme

```bash
# Yedekle
make self-host-backup

# Geri yükle
docker compose exec -T postgres psql -U hooksniff -d hooksniff < backups/hooksniff_20240101_120000.sql
```
