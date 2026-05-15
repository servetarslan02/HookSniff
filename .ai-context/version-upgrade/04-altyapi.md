# 🐳 Altyapı Güncelleme Rehberi

> Risk: 🟡 Orta
> Tahmini süre: 1 oturum

---

## 1. Node.js Docker 20 → 22 LTS

### Neden?

- Node.js 20 **Nisan 2026'da EOL** oluyor
- Node.js 22 LTS **Nisan 2027'ye** kadar destekleniyor
- Next.js 16 minimum Node 20.9 gerektiriyor, 22 tam uyumlu

### Dosyalar

#### Dockerfile.dashboard

```dockerfile
# ÖNCE
FROM node:20-alpine AS deps
FROM node:20-alpine AS builder
FROM node:20-alpine AS runner

# SONRA
FROM node:22-alpine AS deps
FROM node:22-alpine AS builder
FROM node:22-alpine AS runner
```

#### cloudbuild.yaml

```yaml
# ÖNCE
- name: 'node:20-slim'

# SONRA
- name: 'node:22-slim'
```

### Adımlar

```bash
# 1. Dockerfile güncelle
sed -i 's/node:20-alpine/node:22-alpine/g' Dockerfile.dashboard

# 2. cloudbuild.yaml güncelle
sed -i 's/node:20-slim/node:22-slim/g' cloudbuild.yaml

# 3. Local test (varsa)
docker build -f Dockerfile.dashboard -t hooksniff-dashboard:test .

# 4. Commit + push
git add Dockerfile.dashboard cloudbuild.yaml
git commit -m "chore: upgrade Node.js Docker to 22 LTS"
git push origin main
```

### Dikkat Edilecekler

- `package.json`'da `"engines": { "node": ">=18" }` varsa, `>=20` olarak güncelle
- Native module'ler (node-gyp) Node 22 ile uyumlu olmalı
- Vercel kendi Node sürümünü yönetir (Docker etkilemez)

---

## 2. PostgreSQL 16 → 17 (Local Docker)

### Neden?

- PostgreSQL 17 performans iyileştirmeleri ve yeni özellikler
- Sadece **local docker-compose** için — Neon DB kendi sürümünü yönetir

### Dosya

#### docker-compose.yml

```yaml
# ÖNCE
postgres:
  image: postgres:16-alpine

# SONRA
postgres:
  image: postgres:17-alpine
```

### Adımlar

```bash
# 1. docker-compose.yml güncelle
sed -i 's/postgres:16-alpine/postgres:17-alpine/g' docker-compose.yml

# 2. Eski veriyi temizle (local development için)
docker compose down -v

# 3. Yeni image ile başlat
docker compose up -d postgres

# 4. Migration çalıştır
node run-migrations.js

# 5. Test
docker compose up -d
```

### Dikkat Edilecekler

- **Neon DB etkilenmez** — Neon kendi PostgreSQL sürümünü yönetir
- Local development verisi kaybolur (`-v` flag)
- Migration'lar yeniden çalıştırılmalı
- Production'da Neon DB kullanıldığı için risk yok

---

## 3. Docker Image Güncellemeleri

### Rust Image

```dockerfile
# Mevcut (güncel)
FROM rust:1.95-bookworm AS builder
FROM debian:bookworm-slim

# Güncelleme gerekmiyor — 1.95 zaten en son stable
```

### Dashboard Image

```dockerfile
# Mevcut
FROM node:20-alpine AS deps
FROM node:20-alpine AS builder
FROM node:20-alpine AS runner

# Güncellenecek (yukarıdaki Node.js 22 bölümünde)
FROM node:22-alpine AS deps
FROM node:22-alpine AS builder
FROM node:22-alpine AS runner
```

---

## 4. Cloud Build Config

### cloudbuild.yaml Değişiklikleri

```yaml
# Migration step — Node image güncelleme
- name: 'node:22-slim'  # node:20-slim → node:22-slim

# Build step'leri aynı kalır (Docker image kullanıyor)
# Deploy step'leri aynı kalır (gcloud CLI)
```

### Vercel Config

Vercel kendi Node sürümünü yönetir. `vercel.json`'da değişiklik gerekmez.

Eğer Vercel'de Node sürümünü belirtmek istersen:

```json
{
  "functions": {
    "**": {
      "runtime": "nodejs22.x"
    }
  }
}
```

---

## 5. Neon DB (Servis — Değişiklik Yok)

Neon DB bir managed servis. PostgreSQL sürümünü Neon yönetir. Kullanıcı tarafında değişiklik gerekmez.

### Mevcut Durum
- Endpoint: ep-frosty-bar-al0hyt9d (eu-central-1, Frankfurt)
- Branch: production
- Boyut: 12 MB
- Compute limiti aşılmış (191.99/193.39 saat)

### Dikkat Edilecekler
- Compute limiti aşılmış — Neon free tier'da
- Yeni sürüm çıktığında Neon otomatik güncelleme yapabilir
- Manual müdahale gerekirse Neon Console'dan yapılır

---

## Özet Tablo

| Bileşen | Değişiklik | Risk | Etki |
|---------|-----------|------|------|
| Node.js Docker | 20 → 22 | 🟡 | Dashboard build |
| cloudbuild.yaml | node:20 → node:22 | 🟡 | CI/CD pipeline |
| PostgreSQL Docker | 16 → 17 | 🟢 | Sadece local |
| Rust Docker | Değişiklik yok | — | — |
| Neon DB | Değişiklik yok | — | — |
| Vercel | Değişiklik yok | — | — |
