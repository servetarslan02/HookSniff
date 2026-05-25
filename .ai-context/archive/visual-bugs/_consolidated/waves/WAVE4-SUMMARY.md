# 🐛 HookSniff — 4. DALGA DERİNLEMESİNE DENETİM

> **Tarih:** 2026-05-10 17:09-17:13 GMT+8  
> **Denetim Metodu:** 5 paralel AI agent — DB, API endpoints, worker/billing, git, içerik  

---

## 📊 4. DALGA ÖZETİ

| Agent | Kategori | 🔴 Crit | 🟠 High | 🟡 Med | 🟢 Low | **Toplam** |
|-------|----------|---------|---------|--------|--------|-----------|
| deep-db-migrations | DB Şeması | 0 | 3 | 5 | 2 | **10+** |
| deep-api-endpoints | API Endpoint | 10 | 0 | 10 | 0 | **20+** |
| deep-worker-billing | Worker/Billing | 0 | 5 | 15 | 18 | **38** |
| deep-db-migrations | DB Şeması | 0 | 3 | 5 | 2 | **10+** |
| deep-git-history | Git/Güvenlik | 0 | 3 | 3 | 2 | **8** |
| deep-landing-content | İçerik Kalitesi | 0 | 2 | 5 | 0 | **7+** |
| **TOPLAM** | | **10** | **13** | **38** | **22** | **~83+** |

---

## 🔴 KRİTİK SORUNLAR (10)

### API Endpoints (10)
| # | Endpoint | Sorun |
|---|----------|-------|
| 1 | `verify-email` | Rate limit yok — brute force |
| 2 | `refresh` | Rate limit yok — token stuffing |
| 3 | `2fa/verify` | Rate limit yok — TOTP brute force |
| 4 | Contact form | Rate limit yok — spam/flood |
| 5 | Inbound webhook | Signature verification optional — spoofing |
| 6 | Billing webhook | Signature verification optional (secret boşsa bypass) |
| 7 | Schema endpoint (2) | Ownership check yok — cross-tenant leak |
| 8 | Portal API key revoke | Parametre ignore — her zaman yeni key oluşturur |

---

## 🟠 YÜKSEK SORUNLAR (10)

### Worker/Billing (5)
| # | Sorun |
|---|-------|
| 1 | Concurrent delivery limit yok — `tokio::spawn` limitsiz paralel HTTP → DDoS riski |
| 2 | Throttle state in-memory — restart'ta kaybolur, multi-instance'da bypass |
| 3 | WebSocket connection limit yok — bellek tüketimi saldırılara açık |
| 4 | Retry'da jitter yok — thundering herd riski |
| 5 | Error classification yok — non-retryable hatalar da retry ediliyor |

### Git (3)
| # | Sorun |
|---|-------|
| 1 | Git history'de OTEL credentials (base64 Grafana secrets) |
| 2 | `.env.example` gerçek secret değerleri içeriyor |
| 3 | `.gitignore`'da `.env` pattern eksik |

### DB Migrations (3)
| # | Sorun |
|---|-------|
| 1 | İki migration sistemi senkron değil (standalone SQL vs embedded Rust) |
| 2 | CHECK constraint'ler eksik — invalid status değerleri girilebilir |
| 3 | `amount_cents` INT — overflow riski, BIGINT olmalı |

### Landing Content (2)
| # | Sorun |
|---|-------|
| 1 | Müşteri hikayeleri kurgusal — "PayStack" gerçek şirket, yasal risk |
| 2 | Landing page'de sıfır sosyal kanıt — testimonial, istatistik, logo yok |

---

## 🟡 ORTA SORUNLAR (33)

### API Endpoints (10)
- Status endpoint'te DB error sızıntısı
- Portal notification URL'lerinde SSRF riski
- Playground test endpoint'inde SSRF
- Alert condition whitelist eksik
- API key max limit yok
- SSE connection limit yok
- Template apply'de plan limit check yok

### Worker/Billing (15)
- Circuit breaker modülü var ama entegre edilmemiş
- FIFO modülü var ama worker döngüsüne bağlanmamış
- Retry policy modülü var ama kullanılmıyor
- Billing'de idempotency eksik
- Proration/grace period yok
- WebSocket'te server-initiated ping eksik
- Monitoring'de custom metric yok
- Schema registry'de enum/oneOf/format desteklenmiyor

### Git (3)
- 6+ stale branch temizlenmemiş
- 20+ açık Dependabot PR merge edilmemiş
- Commit convention tutarsız

### Landing Content (5)
- Blog'da veri tutarsızlığı (SDK sayısı farklı)
- Türkçe çeviri hataları ("APIimize", "Ölü Mektup Kuyruğu")
- SEO eksiklikleri (metadata, JSON-LD, sitemap)
- İstatistikler gerçekçi değil
- FAQ eksik (SEO featured snippets kaybı)

---

## 📁 RAPOR DOSYALARI

| Dosya | Boyut |
|-------|-------|
| DEEP-API-ENDPOINTS.md | 27KB |
| DEEP-WORKER-BILLING.md | 22KB |
| DEEP-LANDING-CONTENT.md | 22KB |
| DEEP-GIT-HISTORY.md | 10KB |
| DEEP-DB-MIGRATIONS.md | 37KB |
| ACTION-PLAN.md | 9KB |
