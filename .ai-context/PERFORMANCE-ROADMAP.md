# 🚀 Performance Roadmap

> Son güncelleme: 2026-05-15

## ✅ Tamamlanan Optimizasyonlar

| # | Optimizasyon | Etki | Durum |
|---|-------------|------|-------|
| 1 | TCP_NODELAY | -10-20ms/istek | ✅ |
| 2 | TCP Keepalive (60sn) | Bağlantı reuse | ✅ |
| 3 | Connect timeout (3sn) | Hızlı bağlantı | ✅ |
| 4 | HTTP timeout (15→10sn) | Yavaş endpoint erken biter | ✅ |
| 5 | Concurrency (25→50) | 2x paralel teslimat | ✅ |
| 6 | Per-endpoint concurrency (5→10) | 2x throughput | ✅ |
| 7 | HTTP/2 ALPN | Connection multiplexing | ✅ |
| 8 | Chunk okuma | Büyük response更快 | ✅ |
| 9 | Gzip compression | -%60-70 transfer | ✅ |
| 10 | Redis cache altyapısı | Hazır, handler'lara bağlanacak | ✅ |
| 11 | DB pool (20→50) | Daha fazla paralel sorgu | ✅ |
| 12 | Redis Cache (Auth) | DB yükü -%50, auth latency -%80 | ✅ |
| 13 | Health Check Pool | Bağımsız health, ana pool'dan izole | ✅ |
| 14 | Structured JSON Logging | Production'da JSON format | ✅ |
| 15 | Cache-Control headers | CDN-friendly cache policy | ✅ |
| 16 | ETag support | Conditional requests (304) | ✅ |
| 17 | CORS expose headers | ETag, X-Trace-Id erişilebilir | ✅ |
| 18 | Request timeout (25s) | Yavaş istemcilerden koruma | ✅ |
| 19 | Request metrics middleware | Latency tracking, slow request logging | ✅ |

## 📋 Kalan Optimizasyonlar

### Kısa Vade (1-2 oturum)

#### CDN Cache Headers ✅ DONE (Oturum 163)
- **Durum:** ✅ Cache-Control per endpoint category + ETag + CORS expose
- **Yapılan:** Health=10s, Docs=1h, Auth=no-store, API=private/no-cache
- **ETag:** SHA-256 weak ETag for GET health/docs/outbound-ips
- **CORS:** X-Trace-Id, X-Request-Id, ETag exposed to browser

#### 1. Redis Cache — Handler Entegrasyonu ✅ DONE (Oturum 162) ✅ DONE (Oturum 162)
- **Durum:** ✅ auth_middleware + jwt_auth_middleware Redis cache entegre
- **Yapılacak:** Auth middleware'de API key lookup cache'le (30sn TTL)
- **Etki:** DB yükü -%50, auth latency -%80
- **Dosya:** `api/src/middleware/mod.rs` — `auth_middleware` fonksiyonu

#### 2. Dashboard Code Splitting
- **Durum:** Zaten `dynamic()` kullanılıyor
- **Yapılacak:** Büyük component'leri daha küçük parçalara böl
- **Etki:** İlk yükleme -%20-30
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/` altındaki sayfalar

#### 3. Health Check Ayrı Pool ✅ DONE (Oturum 162)
- **Durum:** ✅ HealthPool newtype, 5 connections, 3s timeout
- **Yapılacak:** Küçük ayrı pool (5 connection) health için
- **Etki:** Health check her zaman çalışır, ana pool'dan bağımsız
- **Dosya:** `api/src/routes/health.rs`

#### 4. Structured JSON Logging ✅ DONE (Oturum 163)
- **Durum:** ✅ `APP_ENV=production` veya `LOG_FORMAT=json` ile otomatik JSON
- **Dosya:** `api/src/telemetry.rs` — zaten implemente edilmiş

### Orta Vade (3-5 oturum)

#### 5. Background Job Queue (Redis)
- **Durum:** Mevcut job'lar `tokio::spawn` ile
- **Yapılacak:** Redis-based job queue (email, retry, cleanup)
- **Etki:** API response daha hızlı, job'lar garantili
- **Dosya:** Yeni `api/src/job_queue.rs`

#### 6. Read Replica (Neon)
- **Durum:** Neon read endpoint destekliyor
- **Yapılacak:** Ana pool (write) + replica pool (read) ayrımı
- **Etki:** DB okuma 2x, write yükü azalır
- **Dosya:** `api/src/db.rs` — `create_read_pool()` fonksiyonu

#### 7. Cloud CDN (Statik Dosyalar)
- **Durum:** Vercel zaten CDN yapıyor
- **Yapılacak:** API response'ları için CDN header'ları ekle
- **Etki:** Tekrarlayan istekler更快
- **Dosya:** `api/src/main.rs` — cache-control header'ları

### Büyük İş (5+ oturum)

#### 8. WebSocket (Canlı Updates)
- **Durum:** Yok
- **Yapılacak:** WebSocket endpoint, canlı delivery updates
- **Etki:** Real-time体验
- **Dosya:** Yeni `api/src/routes/ws.rs` + dashboard WebSocket client

#### 9. Metrics Dashboard (Grafana) ✅ DONE (Oturum 162)
- **Durum:** ✅ 7 dashboard mevcut + yeni Performance dashboard (10 panel)
- **Yapılacak:** Custom Grafana panels (delivery latency, error rate, throughput)
- **Etki:** Monitoring daha iyi
- **Dosya:** Grafana dashboard JSON config

#### 10. Edge Workers (Cloudflare)
- **Durum:** Yok
- **Yapılacak:** Cloudflare Workers ile bölgesel deploy
- **Etki:** -%50 global latency
- **Dosya:** Yeni `workers/` dizini + wrangler config

#### 11. Event Sourcing
- **Durum:** Yok
- **Yapılacak:** Tüm olayları event store'a kaydet
- **Etki:** Audit trail, replay capability
- **Dosya:** Yeni `api/src/events/` modülü

#### 12. Multi-Region DB (Neon Branching)
- **Durum:** Tek region (eu-central-1)
- **Yapılacak:** Neon branching + read replica per region
- **Etki:** Global ölçek
- **Dosya:** DB config + routing logic

## 📊 Tahmini Etki Öznetimi

| Kategori | Mevcut | Hedef | Kazanç |
|----------|--------|-------|--------|
| Avg Latency | ~1917ms | ~800ms | -%58 |
| P95 Latency | ~3834ms | ~1500ms | -%61 |
| Transfer Size | ~100KB | ~35KB | -%65 |
| DB Queries/req | ~3-5 | ~1-2 | -%60 |
| İlk Yükleme | ~3s | ~1.5s | -%50 |
