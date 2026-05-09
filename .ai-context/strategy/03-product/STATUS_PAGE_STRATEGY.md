# HookSniff — Status Page Stratejisi

> Oluşturma: 2026-05-09
> Durum: Taslak — Servet onayı bekliyor
> Kapsam: Mevcut durum analizi, araç karşılaştırma, entegrasyon planı, ölçekleme, risk analizi

---

## İçindekiler

1. [Mevcut Durum](#1-mevcut-durum)
2. [Neden Harici Status Page Gerekli?](#2-neden-harici-status-page-gerekli)
3. [Araç Karşılaştırması (10 Araç)](#3-araç-karşılaştırması-10-araç)
4. [Öneri ve Gerekçe](#4-öneri-ve-gerekçe)
5. [HookSniff Altyapısı ile Entegrasyon](#5-hooksniff-altyapısı-ile-entegrasyon)
6. [SLA Tanımları](#6-sla-tanımları)
7. [Alert ve Escalation Planı](#7-alert-ve-escalation-planı)
8. [Monitoring Metrikleri ve Eşik Değerleri](#8-monitoring-metrikleri-ve-eşik-değerleri)
9. [Ölçekleme Senaryoları](#9-ölçekleme-senaryoları)
10. [Risk Analizi](#10-risk-analizi)
11. [Uygulama Planı](#11-uygulama-planı)
12. [Maliyet Projeksiyonu](#12-maliyet-projeksiyonu)
13. [Incident Communication Templates](#13-incident-communication-templates)
14. [DNS ve Domain Kurulumu](#14-dns-ve-domain-kurulumu)
15. [Dashboard Entegrasyonu](#15-dashboard-entegrasyonu)
16. [Discord Alert Entegrasyonu](#16-discord-alert-entegrasyonu)
17. [Backup Monitoring Planı](#17-backup-monitoring-planı)
18. [GDPR ve Veri Güvenliği](#18-gdpr-ve-veri-güvenliği)
19. [Incident Response Workflow](#19-incident-response-workflow)
20. [Test ve Validation Planı](#20-test-ve-validation-planı)
21. [Status Page KPIları](#21-status-page-kpıları)
22. [Periyodik Review Planı](#22-periyodik-review-planı)
11. [Uygulama Planı](#11-uygulama-planı)
12. [Maliyet Projeksiyonu](#12-maliyet-projeksiyonu)

---

## 1. Mevcut Durum

### 1.1 HookSniff'in Kendi Health Check Sistemi

HookSniff'in düşündüğümüzden daha iyi bir health check altyapısı var:

**`GET /v1/status` (Public — auth gerektirmez)**
- API, Database, Redis, Worker durumunu kontrol eder
- Her component için `healthy` / `degraded` / `unhealthy` durumu döndürür
- Latency ölçümü (DB ve Redis için)
- Worker stuck processing kontrolü (5 dakikadan eski işler)
- CORS header'ları ile public erişime açık

**`GET /v1/health` (Internal — detaylı)**
- Database bağlantısı + latency
- Queue depth (pending webhook sayısı)
- Son başarılı teslimat zamanı
- Version bilgisi
- Uptime süresi

**Dashboard `/health` sayfası (Auth gerekli)**
- Her endpoint için success rate, avg/p95 latency
- Consecutive failure takibi
- 24 saatlik uptime yüzdesi
- Healthy/Degraded/Unhealthy durumları

### 1.2 Mevcut Public Status Sayfası

**URL:** `hooksniff.vercel.app/en/status`

| Konu | Durum | Sorun |
|------|-------|-------|
| Sayfa var mı? | ✅ Evet | — |
| API bağlantısı | ❌ "API server unreachable" | API'ye bağlanamıyor |
| Son 30 gün uptime | %0 | Ölçüm yapamıyor |
| Component durumları | Hepsi "Unknown" | API yanıt vermiyor |
| Incident history | "No incidents" | Ölçemediği için boş |
| Auto-refresh | 30 sn | İyi |
| Bildirim (email/Discord) | ❌ Yok | Kritik eksik |

**Temel sorun:** Status sayfası API'yi çağırmaya çalışıyor ama API ya CORS sorunu yaşıyor ya da status sayfası API'nin çalıştığından emin olmadan render ediyor. API çalışsa bile, API çöktüğünde status sayfası da bilgi veremez hale gelir.

### 1.3 Eksiklikler Özeti

| # | Eksik | Önem |
|---|-------|------|
| 1 | Harici monitoring yok — API çökünce status sayfası da çöküyor | 🔴 Kritik |
| 2 | Bildirim kanalı yok (email/Discord/Slack) | 🔴 Kritik |
| 3 | Historical uptime tracking yok (30 gün) | 🟡 Önemli |
| 4 | Incident management prosedürü yok | 🟡 Önemli |
| 5 | SLA tanımı yok | 🟡 Önemli |
| 6 | Alert escalation path yok | 🟡 Önemli |
| 7 | Custom domain yok (`status.hooksniff.com`) | 🟢 İyileştirme |

---

## 2. Neden Harici Status Page Gerekli?

### Senaryo Karşılaştırması

| Senaryo | Sadece kendi status sayfanız | Harici status page |
|---------|------|------|
| API çökerse | Status sayfası da çöker → kullanıcı bilgi alamaz | Harici sayfa ayakta → "sorunun farkındayız" |
| DB çökerse | Aynı | Aynı |
| Vercel (dashboard) çökerse | Status sayfası da gider | Harici sayfa hâlâ çalışır |
| Kullanıcı güveni | "Kendi kendine kontrol ediyor" | "Bağımsız servis onaylıyor" |
| Incident bildirimi | Manuel update lazım | Otomatik email/Slack/Discord |
| SLA kanıtı | Yok | Timestamp'li loglar |

### Yangın Alarmı Kuralı

> Yangın alarmını yangının yanına koymazsınız. Status page harici olmalı.

**Çözüm:** İki katmanlı status page:
1. **Harici (Better Stack / Instatus):** `status.hooksniff.com` — API çökse bile çalışır
2. **Kendi sayfanız:** `hooksniff.vercel.app/en/status` — dashboard içinde entegre, kullanıcı ayrı siteye gitmek zorunda kalmaz

---

## 3. Araç Karşılaştırması (10 Araç)

### 3.1 Hosted (Kullan-hazır) Çözümler

| Araç | Free Plan | Monitor | Check Sıklığı | Status Page | Custom Domain | Alert | Dil Desteği |
|------|-----------|---------|---------------|-------------|---------------|-------|-------------|
| **Better Stack** | ✅ | 10 monitor + 10 heartbeat | 3 dk (free), 30 sn (paid) | 1 sayfa (free) | ✅ (paid) | Slack, Email, SMS, Telefon | 50+ |
| **Instatus** | ✅ | 15 monitor | 2 dk (free), 30 sn (Pro) | 1 public sayfa (free) | Pro'da ($20/ay) | Email, Slack, Discord, Twitter | 30+ |
| **Hyperping** | ✅ | 20 monitor | 3 dk (free), 30 sn (paid) | 1 sayfa (free) | ✅ (paid) | Email, SMS, Slack, Telefon | ✅ |
| **OpenStatus** | ✅ | 1 monitor | 10 dk (free) | 1 sayfa (free) | ✅ | Slack, Discord, Email | ✅ |
| **StatusGator** | ✅ | 3 monitor | — | 1 sayfa (free) | ❌ (free) | Slack, Discord, Email | ✅ |
| **UptimeRobot** | ⚠️ | 10 monitor | 5 dk (free) | ❌ (free'de yok) | Paid | Email, SMS, Slack | ✅ |
| **Atlassian Statuspage** | ⚠️ | Sadece page | — | 100 subscriber | ❌ (free) | Email | ✅ |

### 3.2 Açık Kaynak (Self-Hosted) Çözümler

| Araç | Maliyet | Monitor | Status Page | Alert Kanalları | Bakım |
|------|---------|---------|-------------|-----------------|-------|
| **Uptime Kuma** | $0 (self-hosted) | Sınırsız | ✅ | 90+ kanal | Docker kurulum |
| **Upptime** | $0 (GitHub Actions) | Sınırsız | ✅ (GitHub Pages) | Email, Slack | GitHub workflow |
| **cState** | $0 (self-hosted) | Sadece page | ✅ | Email, Slack, Discord | Aktif |

### 3.3 Rakiplerin Kullandıkları

| Rakip | Status Page | Monitor |
|-------|-------------|---------|
| **Svix** | Statuspage.io (Atlassian) | ✅ |
| **Hookdeck** | Better Stack | ✅ |
| **Hook0** | ❌ Yok | ❌ Yok |

### 3.4 Detaylı Karşılaştırma

| Kriter | Better Stack | Instatus | Hyperping | OpenStatus | Uptime Kuma |
|--------|-------------|----------|-----------|------------|-------------|
| Free tier yeterliliği | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Kolay kurulum | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Profesyonel görünüm | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| HookSniff uyumu | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Monitoring derinliği | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Incident management | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| Alert seçenekleri | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Toplam** | **35/35** | **27/35** | **31/35** | **19/35** | **25/35** |

---

## 4. Öneri ve Gerekçe

### Kısa Vadeli (Şimdi — $0)

**→ Better Stack**

Neden:
- Free plan 10 monitor + 1 heartbeat → HookSniff'in 5 servisi için yeterli
- 3 dk check → HookSniff için yeterli sıklık (webhook servisi, saniye-level SLA yok)
- Professional görünüm → müşteri güveni
- Slack/Email/SMS alert → anında bildirim
- 1 status page free → `status.hooksniff.com` olarak kullanabilir
- SSL monitoring, domain expiration, cron monitoring dahil
- Hookdeck de Better Stack kullanıyor → sektörde kabul görmüş

**Kurulum süresi:** 20-30 dakika

### Orta Vadeli (100+ kullanıcı)

**→ Instatus'a geçmeyi düşünün**

Neden:
- 30+ dil desteği → HookSniff'in 8 dilli yapısıyla uyumlu
- Jamstack mimarisi → 10x hızlı yükleme
- Daha güzel tasarım → müşteri-facing sayfa
- $20/ay → custom domain + 50 monitor + 30 sn check

### Uzun Vadeli (Enterprise müşteri)

**→ Better Stack Pro veya Hyperping Pro**

Neden:
- Incident management + on-call scheduling
- SLA guarantee
- White-label (enterprise müşteri kendi markasıyla görmek ister)

---

## 5. HookSniff Altyapısı ile Entegrasyon

### 5.1 Monitor Edilecek Servisler ve Health Check Noktaları

| Servis | URL | Health Check | Ne Kontrol Edilecek |
|--------|-----|-------------|-------------------|
| **Dashboard** | `hooksniff.vercel.app` | HTTP 200 | Sayfa yükleniyor mu |
| **API** | `hooksniff-api-...run.app/v1/status` | HTTP 200 + JSON parse | Overall status = "operational" |
| **Worker** | `hooksniff-api-...run.app/v1/status` | JSON parse | Worker component = "healthy" |
| **Database (Neon)** | `hooksniff-api-...run.app/v1/status` | JSON parse | Database component = "healthy" + latency < 500ms |
| **Redis (Upstash)** | `hooksniff-api-...run.app/v1/status` | JSON parse | Redis component = "healthy" |

### 5.2 Mevcut `/v1/status` Response Yapısı

```json
{
  "overall_status": "operational",
  "uptime_30d": 100.0,
  "components": [
    {
      "name": "API",
      "status": "healthy",
      "latency_ms": null,
      "description": "Webhook ingestion and management API",
      "last_checked": "2026-05-09T23:00:00Z"
    },
    {
      "name": "Database",
      "status": "healthy",
      "latency_ms": 12,
      "description": "PostgreSQL database",
      "last_checked": "2026-05-09T23:00:00Z"
    },
    {
      "name": "Redis",
      "status": "healthy",
      "latency_ms": 3,
      "description": "Redis rate limiter and caching",
      "last_checked": "2026-05-09T23:00:00Z"
    },
    {
      "name": "Worker",
      "status": "healthy",
      "latency_ms": null,
      "description": "Background webhook delivery worker",
      "last_checked": "2026-05-09T23:00:00Z"
    }
  ],
  "checked_at": "2026-05-09T23:00:00Z"
}
```

### 5.3 Better Stack Entegrasyon Akışı

```
[HookSniff Servisleri]
        │
        ▼
[Better Stack Monitor] ──── her 3 dk'da bir HTTP GET ────→ /v1/status
        │
        ├── Status 200 + overall_status = "operational" → ✅ Healthy
        ├── Status 200 + overall_status = "degraded"    → ⚠️ Degraded
        ├── Status 503 veya timeout                      → ❌ Down
        │
        ▼
[Better Stack Alert Engine]
        │
        ├── Email → Servet'in emaili
        ├── Slack/Discord → #alerts kanalı
        ├── SMS → Servet'in telefonu (paid)
        │
        ▼
[Status Page] ──── status.hooksniff.com
        │
        ├── Public: Kullanıcılar durumu görebilir
        ├── Subscriber: Email ile incident update alır
        └── Embed: Dashboard'a widget eklenebilir
```

### 5.4 Mevcut Status Sayfası Düzeltmeleri

Kendi status sayfanız (`/en/status`) de düzeltilmeli:

| Sorun | Çözüm |
|-------|-------|
| "API server unreachable" | API URL'sini kontrol et, CORS ayarlarını doğrula |
| %0 uptime | Historical uptime tracking ekle (veritabanında günlük kayıt) |
| Component "Unknown" | `/v1/status` endpoint'inden veri çekmeyi düzelt |
| Bildirim yok | Email/Discord subscription formu ekle |

---

## 6. SLA Tanımları

### 6.1 HookSniff SLA Seviyeleri

| Plan | SLA Hedefi | Aylık Downtime | Check Sıklığı |
|------|-----------|----------------|---------------|
| Free | %99.0 | ~7 saat 18 dk | 3 dk |
| Starter | %99.5 | ~3 saat 39 dk | 1 dk |
| Pro | %99.9 | ~43 dk | 30 sn |
| Enterprise | %99.99 | ~4 dk 23 sn | 30 sn |

### 6.2 SLA Hesaplama

| SLA | Aylık Downtime | Yıllık Downtime |
|-----|----------------|-----------------|
| %99.0 | 7 saat 18 dk | 3 gün 15 saat |
| %99.5 | 3 saat 39 dk | 1 gün 19 saat |
| %99.9 | 43 dk 50 sn | 8 saat 45 dk |
| %99.99 | 4 dk 23 sn | 52 dk 36 sn |

### 6.3 Check Sıklığı vs Tespit Süresi

| Check Sıklığı | Max Tespit Gecikme | Uygun SLA |
|---------------|-------------------|-----------|
| 5 dk | 5 dk | %99.0 |
| 3 dk | 3 dk | %99.0 - %99.5 |
| 1 dk | 1 dk | %99.5 - %99.9 |
| 30 sn | 30 sn | %99.9 - %99.99 |

**HookSniff için önerilen:** 3 dk check (free tier) → %99.0-99.5 SLA için yeterli.

---

## 7. Alert ve Escalation Planı

### 7.1 Alert Kanalları

| Kanal | Ne Zaman | Kime | Maliyet |
|-------|----------|------|---------|
| **Email** | Her down/degraded olayı | Servet | $0 |
| **Discord webhook** | Her down/degraded olayı | #alerts kanalı | $0 |
| **Slack** (opsiyonel) | Her down/degraded olayı | #alerts kanalı | $0 |
| **SMS** | Sadece 15 dk+ süren down | Servet'in telefonu | Paid |
| **Telefon** | Sadece 1 saat+ süren down | Servet | Paid |

### 7.2 Escalation Path

```
Seviye 1 (0-5 dk):
  Better Stack tespit eder → Email + Discord bildirimi
  Kullanıcı kendi kontrol edebilir (status page)

Seviye 2 (5-15 dk):
  Hâlâ down → SMS gönder (eğer paid plan varsa)
  Servet mobil bildirimi alır

Seviye 3 (15-60 dk):
  Hâlâ down → Telefon alert (eğer paid plan varsa)
  Manuel müdahale gerekli

Seviye 4 (60+ dk):
  Hâlâ down → Incident report başlat
  Kullanıcılara status page'de update yaz
  "Üzerinde çalışıyoruz" mesajı
```

### 7.3 Gece Senaryosu

| Saat | Durum | Aksiyon |
|------|-------|---------|
| 23:00-08:00 | API down | Discord bildirimi → Servet uyuyorsa sabah görür |
| 23:00-08:00 | DB down | SMS (eğer var) → acil müdahale |
| 08:00+ | Herhangi down | Email + Discord → hemen müdahale |

**Öneri:** İlk 3 ay SMS/Telefon alert gerekmez. Email + Discord yeterli. $500+ gelir gelince SMS alert ekle.

---

## 8. Monitoring Metrikleri ve Eşik Değerleri

### 8.1 HTTP Health Check Metrikleri

| Metrik | Healthy | Degraded | Unhealthy |
|--------|---------|----------|-----------|
| HTTP Status Code | 200 | 200 (degraded içeriği) | 503 / timeout |
| Response Time | < 500ms | 500ms - 2000ms | > 2000ms veya timeout |
| Overall Status | "operational" | "degraded" | "down" |

### 8.2 Component Bazlı Eşik Değerleri

| Component | Healthy | Degraded | Unhealthy |
|-----------|---------|----------|-----------|
| **API** | Status 200, < 500ms | Status 200, 500-2000ms | Status 503 veya timeout |
| **Database** | Latency < 100ms | Latency 100-500ms | Latency > 500ms veya bağlantı hatası |
| **Redis** | Latency < 50ms | Latency 50-200ms | Latency > 200ms veya bağlantı hatası |
| **Worker** | 0 stuck item | 1-10 stuck item (>5 dk) | 10+ stuck item veya yanıt yok |

### 8.3 Endpoint Sağlık Metrikleri (Kendi Sisteminiz)

| Metrik | Healthy | Degraded | Unhealthy |
|--------|---------|----------|-----------|
| Success Rate | ≥ %95 | %85 - %95 | < %85 |
| Consecutive Failures | 0-2 | 3-4 | 5+ |
| Avg Response Time | < 500ms | 500-2000ms | > 2000ms |

### 8.4 "Down" Tanımı

Better Stack için "down" sayılacak durumlar:

| Durum | Down mı? | Neden |
|-------|----------|-------|
| HTTP 200 + overall_status = "operational" | ❌ Hayır | Sağlıklı |
| HTTP 200 + overall_status = "degraded" | ⚠️ Degraded | Kısmi sorun |
| HTTP 503 | ✅ Evet | Servis kullanılamıyor |
| Connection timeout (30 sn) | ✅ Evet | Servis yanıt vermiyor |
| DNS resolution failure | ✅ Evet | Servis erişilemez |
| SSL certificate error | ✅ Evet | Güvenlik sorunu |
| HTTP 200 ama body parse edilemiyor | ✅ Evet | Beklenmeyen yanıt |

---

## 9. Ölçekleme Senaryoları

### 9.1 Better Stack Free Tier Sınırları

| Limit | Free Plan | HookSniff Kullanımı | Yeterli mi? |
|-------|-----------|---------------------|-------------|
| Monitor sayısı | 10 | 5 (Dashboard, API, Worker, DB, Redis) | ✅ Evet |
| Heartbeat | 10 | 0 (şimdilik) | ✅ Evet |
| Status page | 1 | 1 | ✅ Evet |
| Check sıklığı | 3 dk | 3 dk | ✅ Evet |
| Alert | Email + Slack | Email + Discord | ✅ Evet |
| Subscriber | 1,000 | 0-100 | ✅ Evet |

### 9.2 Free Tier Ne Zaman Yetersiz Olur?

| Senaryo | Tetikleyici | Çözüm |
|---------|------------|-------|
| 5'ten fazla servis monitor etmek | Yeni servis eklendiğinde (örn: CDN, queue) | Paid plan ($29/ay) |
| 30 sn check gerekli | Pro plan müşterisi SLA istiyor | Paid plan |
| Custom domain gerekli | `status.hooksniff.com` isteniyor | Paid plan veya Instatus Pro ($20/ay) |
| Custom CSS/JS | Marka uyumu | Better Stack $12/ay ek |
| White-label | Enterprise müşteri | Better Stack $208/ay ek |
| SMS alert | Gece müdahale gerekli | Better Stack paid plan |
| 1000+ subscriber | Büyük müşteri tabanı | Better Stack $40/ay ek |

### 9.3 Ölçekleme Tetikleyicileri

| Tetikleyici | Eylem | Maliyet |
|------------|-------|---------|
| 50+ aktif kullanıcı | Discord #alerts kanalı kur | $0 |
| 100+ aktif kullanıcı | Instatus Pro'ya geç | $20/ay |
| 500+ aktif kullanıcı | Better Stack Pro'ya geç | $29/ay |
| Enterprise müşteri | White-label + SLA | $208+/ay |
| $1000+ MRR | Incident management + on-call | $29/ay (Better Stack Pro) |

---

## 10. Risk Analizi

### 10.1 Vendor Risk

| Risk | Olasılık | Etki | Önlem |
|------|----------|------|-------|
| Better Stack iflas/kapanır | Düşük | Yüksek | Export API + alternatif hazır tut (Instatus) |
| Better Stack fiyat artırır | Orta | Orta | Free tier yeterli → geçiş kolay |
| Better Stack free tier kaldırır | Düşük | Yüksek | Instatus free tier veya Uptime Kuma |
| Veri ihracı (EU → US) | Mevcut | Düşük | Better Stack US merkezli, Neon EU'da |

### 10.2 Teknik Risk

| Risk | Olasılık | Etki | Önlem |
|------|----------|------|-------|
| `/v1/status` endpoint'i çöker | Düşük | Yüksek | Harici monitoring zaten bu durumu yakalar |
| CORS sorunu (mevcut durum) | Yüksek | Orta | Düzelt — status sayfası API'ye bağlanamıyor |
| Database bağlantı havuzu tükenir | Orta | Yüksek | Health check DB latency'yi ölçer |
| Worker stuck processing | Orta | Orta | Health check 5 dk+ stuck item'ları yakalar |

### 10.3 Operasyonel Risk

| Risk | Olasılık | Etki | Önlem |
|------|----------|------|-------|
| Alert spam (false positive) | Orta | Düşük | 3 consecutive failure kuralı |
| Gece down ama kimse görmüyor | Orta | Yüksek | SMS alert (paid) veya Discord mobile notification |
| Incident sonrası update yazılmıyor | Yüksek | Orta | Incident template hazır tut |

---

## 11. Uygulama Planı

### Faz 1: Better Stack Kurulumu (20-30 dk, $0)

| Adım | Ne | Süre |
|------|-----|------|
| 1 | Better Stack'e kayıt ol | 5 dk |
| 2 | 5 monitor ekle (Dashboard, API, Worker, DB, Redis) | 10 dk |
| 3 | Status page oluştur | 5 dk |
| 4 | Email alert ayarla | 2 dk |
| 5 | Discord webhook alert ayarla | 3 dk |

### Faz 2: Mevcut Status Sayfası Düzeltmeleri (1-2 saat)

| Adım | Ne | Süre |
|------|-----|------|
| 6 | CORS sorununu düzelt (API status endpoint) | 30 dk |
| 7 | Historical uptime tracking ekle (veritabanı) | 30 dk |
| 8 | Status sayfasına email subscription ekle | 30 dk |

### Faz 3: Custom Domain + Entegrasyon (30 dk)

| Adım | Ne | Süre |
|------|-----|------|
| 9 | `status.hooksniff.com` DNS ayarla (CNAME → Better Stack) | 10 dk |
| 10 | Landing page'deki "Status" linkini güncelle | 5 dk |
| 11 | Dashboard'a embed widget ekle (opsiyonel) | 15 dk |

### Faz 4: Dokümantasyon (30 dk)

| Adım | Ne | Süre |
|------|-----|------|
| 12 | Incident response template yaz | 15 dk |
| 13 | Status page'i README'ye ekle | 5 dk |
| 14 | Alert kanallarını dokümante et | 10 dk |

**Toplam: ~3-4 saat, $0**

---

## 12. Maliyet Projeksiyonu

### Aşama 1 — Şimdi ($0)

| Kalem | Maliyet | İçerik |
|-------|---------|--------|
| Better Stack Free | $0 | 10 monitor, 1 status page, 3 dk check |
| Discord | $0 | #alerts kanalı |
| Email | $0 | Servet'in emaili |
| **Toplam** | **$0** | |

### Aşama 2 — 100+ Kullanıcı ($20/ay)

| Kalem | Maliyet | İçerik |
|-------|---------|--------|
| Instatus Pro | $20/ay | Custom domain, 50 monitor, 30 sn check |
| **Toplam** | **$20/ay** | |

### Aşama 3 — 500+ Kullanıcı ($29/ay)

| Kalem | Maliyet | İçerik |
|-------|---------|--------|
| Better Stack Pro | $29/ay | Incident management, on-call, 30 sn check |
| **Toplam** | **$29/ay** | |

### Aşama 4 — Enterprise ($208+/ay)

| Kalem | Maliyet | İçerik |
|-------|---------|--------|
| Better Stack Status Page | $12/ay | Custom CSS/JS |
| Better Stack White-label | $208/ay | Beyaz etiketli status page |
| SMS Alert | $0 (dahil) | Telefon bildirimi |
| **Toplam** | **$220+/ay** | |

---

## 13. Incident Communication Templates

### 13.1 Incident Severity Levels

| Seviye | Tanım | Örnek | Müdahale Süresi | Bildirim |
|--------|-------|-------|-----------------|----------|
| **P1 — Critical** | Servis tamamen kullanılamıyor | API down, DB down, tüm webhook'lar başarısız | 15 dk | Email + Discord + SMS |
| **P2 — Major** | Servis kısmen çalışıyor | Yüksek latency, bazı webhook'lar başarısız, Worker degraded | 30 dk | Email + Discord |
| **P3 — Minor** | Küçük etki | Tek endpoint yavaş, UI hatası, raporlama gecikmesi | 2 saat | Discord |
| **P4 — Info** | Bilgilendirme | Planlı bakım, scheduled maintenance | 24 saat | Status page |

### 13.2 Incident Lifecycle Template

Her incident 4 aşamadan geçer:

```
[Investigating] → [Identified] → [Monitoring] → [Resolved]
```

### 13.3 Incident Mesaj Şablonları

**Aşama 1: Investigating (Araştırılıyor)**

```
🔴 [P1] HookSniff API — Service Disruption

Durum: Investigating
Etkilenen servis: API, Worker
Etki: Webhook teslimatları geçici olarak durdu
Başlangıç: [YYYY-MM-DD HH:MM UTC]

Ekibimiz sorunu araştırıyor. Güncellemeleri buradan paylaşacağız.

Özür dileriz, en kısa sürede çözeceğiz.
```

**Aşama 2: Identified (Tespit Edildi)**

```
🟡 [P1] HookSniff API — Issue Identified

Durum: Identified
Neden: [Kısa açıklama — örn: "Database bağlantı havuzu tükendi"]
Etkilenen servis: API, Worker
Başlangıç: [YYYY-MM-DD HH:MM UTC]

Sorun tespit edildi, düzeltme üzerinde çalışılıyor.
Tahmini çözüm süresi: [X] dakika.
```

**Aşama 3: Monitoring (İzleniyor)**

```
🟢 [P1] HookSniff API — Fix Deployed, Monitoring

Durum: Monitoring
Çözüm: [Kısa açıklama — örn: "Bağlantı havuzu artırıldı, yeniden başlatıldı"]
Başlangıç: [YYYY-MM-DD HH:MM UTC]
Çözüm: [YYYY-MM-DD HH:MM UTC]

Düzeltme uygulandı. Servis normale döndü, izlemeye devam ediyoruz.
Bir sorun yaşarsanız lütfen bildirin.
```

**Aşama 4: Resolved (Çözüldü)**

```
✅ [P1] HookSniff API — Resolved

Durum: Resolved
Neden: [Kısa açıklama]
Süre: [X] dakika
Başlangıç: [YYYY-MM-DD HH:MM UTC]
Çözüm: [YYYY-MM-DD HH:MM UTC]

Sorun çözüldü, tüm servisler normal çalışıyor.
Post-mortem raporu 48 saat içinde paylaşılacak.
```

### 13.4 Türkçe Şablonlar

**Investigating (TR):**
```
🔴 HookSniff API — Servis Kesintisi

Durum: Araştırılıyor
Etkilenen servis: API
Başlangıç: [YYYY-MM-DD HH:MM UTC]

Ekibimiz sorunu araştırıyor. Güncellemeleri buradan paylaşacağız.
```

**Resolved (TR):**
```
✅ HookSniff API — Çözüldü

Durum: Çözüldü
Süre: [X] dakika
Başlangıç: [YYYY-MM-DD HH:MM UTC]
Çözüm: [YYYY-MM-DD HH:MM UTC]

Sorun çözüldü, tüm servisler normal çalışıyor.
```

### 13.5 Planlı Bakım Şablonu

```
🔧 Planned Maintenance — HookSniff API

Tarih: [YYYY-MM-DD]
Saat: [HH:MM - HH:MM UTC]
Etkilenen servis: [API / Dashboard / Worker]
Etki: [Kısmi kesinti / Tam kesinti / Gecikme]

Bu bakım [neden] için yapılacaktır.
Müşterilerimiz etkilenmeyecektir / kısa süreli kesinti yaşanacaktır.

Sorularınız için: support@hooksniff.com
```

---

## 14. DNS ve Domain Kurulumu

### 14.1 status.hooksniff.com Kurulumu

**Adım 1: Domain Satın Alma (eğer yoksa)**
- Cloudflare Registrar: `hooksniff.com` → ~$12/yıl
- Alternatif: `hooksniff.dev` → ~$12/yıl

**Adım 2: Cloudflare DNS Ayarları**

| Tip | Name | Target | Proxy |
|-----|------|--------|-------|
| CNAME | `status` | `cname.betterstack.com` | DNS only (gri bulut) |

**Adım 3: Better Stack'te Custom Domain**
1. Better Stack → Status Pages → Settings → Custom Domain
2. `status.hooksniff.com` yaz
3. Better Stack DNS doğrulamasını bekler (5-15 dk)
4. SSL otomatik oluşturulur (Let's Encrypt)

**Adım 4: Landing Page Linkini Güncelle**
- `hooksniff.vercel.app/en/status` → `status.hooksniff.com` olarak değiştir
- Footer'daki "Status" linki de güncellenmeli

### 14.2 SSL Durumu

| Konu | Durum |
|------|-------|
| SSL sertifikası | Better Stack otomatik oluşturur (Let's Encrypt) |
| HTTPS zorlaması | Evet, HTTP → HTTPS redirect |
| Certificate renewal | Otomatik |
| Wildcard | Hayır, sadece `status.hooksniff.com` |

### 14.3 Vercel Custom Domain (Opsiyonel)

Eğer `hooksniff.com` alınırsa dashboard için de custom domain:
1. Vercel → Project → Settings → Domains
2. `hooksniff.com` ekle
3. Cloudflare'de CNAME → `cname.vercel-dns.com`
4. Dashboard: `hooksniff.com` (ana domain)
5. API: `api.hooksniff.com` → Cloud Run custom domain mapping

---

## 15. Dashboard Entegrasyonu

### 15.1 Mevcut Durum

Dashboard'da `/en/status` sayfası var ama sadece kendi API'sinden veri çekiyor. API çökünce "API server unreachable" gösteriyor.

### 15.2 Çözüm: Hybrid Status Gösterimi

İki kaynaktan veri birleştirilecek:

```
┌─────────────────────────────────────────────────────────┐
│ 🪝 HookSniff Status                                     │
│                                                         │
│ External Monitor (Better Stack)                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✅ All systems operational                           │ │
│ │ Son kontrol: 2 dk önce                               │ │
│ │ [status.hooksniff.com'da görüntüle →]               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Internal Health (Kendi API'miz)                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ API     ✅ Healthy    12ms                          │ │
│ │ Database ✅ Healthy    8ms                           │ │
│ │ Redis   ✅ Healthy    3ms                           │ │
│ │ Worker  ✅ Healthy    —                             │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 15.3 Real-time Status Banner

Dashboard'ın en üstünde sürekli görünen banner:

```tsx
// Dashboard layout'unda eklenecek
{status === 'down' && (
  <div className="bg-red-600 text-white px-4 py-2 text-center text-sm">
    ⚠️ Some services are experiencing issues. 
    <a href="https://status.hooksniff.com" className="underline ml-1">View status page →</a>
  </div>
)}
{status === 'degraded' && (
  <div className="bg-yellow-600 text-white px-4 py-2 text-center text-sm">
    ⚡ Some services are running slower than usual.
    <a href="https://status.hooksniff.com" className="underline ml-1">View status page →</a>
  </div>
)}
```

### 15.4 Polling Stratejisi

| Durum | Polling Sıklığı | Neden |
|-------|----------------|-------|
| Normal (operational) | 5 dk | API yükünü azalt |
| Degraded | 1 dk | Daha sık kontrol |
| Down | 30 sn | Hızlı recovery tespiti |
| Kullanıcı sayfayı açtığında | Anında | İlk yükleme |

### 15.5 Fallback Davranışı

API'ye bağlanılamazsa:
1. Kullanıcıya "External status: check status.hooksniff.com" göster
2. Better Stack embed widget'ı kullan (API'ye ihtiyaç duymaz)
3. Son bilinen durumu localStorage'dan göster + "Son güncelleme: X dk önce"

---

## 16. Discord Alert Entegrasyonu

### 16.1 Discord Webhook Oluşturma

1. Discord → Sunucu Ayarları → Entegrasyonlar → Webhook'lar
2. "Yeni Webhook" tıkla
3. İsim: `HookSniff Alerts`
4. Kanal: `#alerts` (önceden oluşturulmalı)
5. Webhook URL'sini kopyala
6. Better Stack'te Alert Channels → Discord → URL'yi yapıştır

### 16.2 Discord Kanal Yapısı

```
🪝 HookSniff Discord

📁 Monitoring
  #alerts — Otomatik incident bildirimleri (sadece bot yazar)
  #status-updates — Incident update'leri (sadece bot yazar)
  #monitoring-log — Tüm health check logları (opsiyonel, verbose)

📁 Destek
  #destek — Kullanıcı soruları
```

### 16.3 Discord Embed Formatı

Better Stack'in gönderdiği Discord mesajı:

```
┌─────────────────────────────────────────┐
│ 🔴 HookSniff API is DOWN               │
│                                         │
│ Status: DOWN                            │
│ Started: 2026-05-09 23:15 UTC           │
│ Duration: 5 minutes                     │
│                                         │
│ Affected: API, Worker                   │
│ Region: europe-west1                    │
│                                         │
│ [View Status Page] [View Incident]      │
└─────────────────────────────────────────┘
```

### 16.4 Alert Filtreleme

| Durum | Discord'a gönder? | Neden |
|-------|-------------------|-------|
| DOWN (ilk tespit) | ✅ Evet | Acil müdahale |
| DOWN (devam ediyor) | ❌ Hayır | Spam önleme (15 dk'da bir hatırlatma) |
| DEGRADED | ✅ Evet | Bilgilendirme |
| RECOVERED | ✅ Evet | Rahatlama |
| SSL expiration warning | ✅ Evet | 7 gün kala |
| Domain expiration warning | ✅ Evet | 30 gün kala |

### 16.5 Better Stack Discord Ayarları

Better Stack → Alert Channels → Discord:
1. Webhook URL yapıştır
2. "Send on incident start" → ✅
3. "Send on incident update" → ✅
4. "Send on incident resolve" → ✅
5. "Send degraded alerts" → ✅ (opsiyonel)

---

## 17. Backup Monitoring Planı

### 17.1 Neden Backup Gerekli?

| Senaryo | Olasılık | Etki |
|---------|----------|------|
| Better Stack'in kendisi çöker | Düşük | HookSniff down ama haber veren yok |
| Better Stack false positive | Orta | Gereksiz alarm, alert fatigue |
| Better Stack free tier kaldırır | Düşük | Monitoring kaybolur |
| Network partitioning | Düşük | Better Stack HookSniff'e ulaşamıyor ama servis çalışıyor |

### 17.2 Backup Çözüm: Upptime (GitHub Actions)

**Neden Upptime?**
- $0 (GitHub free tier)
- Better Stack ile bağımsız
- GitHub Actions ile 5 dk'da bir kontrol
- GitHub Pages'de status page
- Sıfır bakım

**Kurulum:**
1. GitHub'da `servetarslan02/hooksniff-status` repo oluştur
2. Upptime template kullan: `upptime/upptime.js.org`
3. `.upptimerc.yml` yapılandır:

```yaml
owner: servetarslan02
repo: hooksniff-status
statusWebsite: https://servetarslan02.github.io/hooksniff-status
sites:
  - name: HookSniff API
    url: https://hooksniff-api-1046140057667.europe-west1.run.app/v1/status
    expectedStatusCodes: [200]
  - name: HookSniff Dashboard
    url: https://hooksniff.vercel.app
    expectedStatusCodes: [200]
  - name: HookSniff Worker
    url: https://hooksniff-worker-1046140057667.europe-west1.run.app/health
    expectedStatusCodes: [200]
```

4. GitHub Actions otomatik çalışır
5. Status page: `servetarslan02.github.io/hooksniff-status`

### 17.3 Backup Alert Mekanizması

| Kaynak | Alert | Kanal |
|--------|-------|-------|
| Better Stack (primary) | Email + Discord | Servet + #alerts |
| Upptime (backup) | GitHub Issues | Servet GitHub notifications |
| Kendi sisteminiz | Dashboard banner | Kullanıcılar |

### 17.4 False Positive Azaltma

| Yöntem | Açıklama |
|--------|----------|
| 3 consecutive failure | Tek seferlik timeout = alarm değil, 3 üst üste = alarm |
| Multi-region check | Farklı lokasyonlardan kontrol (Better Stack paid) |
| Confirmation check | İlk failure → 30 sn bekle → ikinci kontrol → hâlâ failure ise alarm |
| Maintenance window | Planlı bakım sırasında alertleri sustur |

---

## 18. GDPR ve Veri Güvenliği

### 18.1 Better Stack ve Veri Konumu

| Konu | Durum |
|------|-------|
| Better Stack merkezi | ABD |
| Veri depolama | ABD (varsayılan), EU opsiyonu var (paid) |
| Health check logları | IP adresi içermez, sadece HTTP response |
| Status page subscriber email'leri | Better Stack'te depolanır |

### 18.2 Health Check Logları Kişisel Veri mi?

| Veri | Kişisel Veri mi? | Açıklama |
|------|-------------------|----------|
| HTTP status code | ❌ Hayır | Servis durumu |
| Response time | ❌ Hayır | Performans metriği |
| Response body | ⚠️ Dikkat | Hata mesajı kullanıcı bilgisi içerebilir |
| IP adresi | ✅ Evet | Eğer loglanıyorsa |
| Subscriber email | ✅ Evet | Kullanıcı email'i |

### 18.3 Sub-processor Listesine Ekleme

Better Stack sub-processor listesine eklenmeli:

| Servis | Amaç | Konum |
|--------|------|-------|
| Better Stack | Uptime monitoring, status page | ABD |

Bu bilgi Privacy Policy'de ve DPA'da yer almalı.

### 18.4 KVKK Uyumu

| Konu | Durum | Aksiyon |
|------|-------|---------|
| Status page subscriber email'leri | Kişisel veri | Privacy Policy'de belirt |
| Health check logları | Kişisel veri değil | Aksiyon gerekmez |
| Incident history | Kişisel veri değil | Aksiyon gerekmez |
| Better Stack EU hosting | Paid plan | Gerekirse geç |

### 18.5 Veri Minimizasyonu

| İlke | Uygulama |
|------|----------|
| Sadece gerekli veri | IP loglama yok, sadece HTTP response |
| Retention süresi | Better Stack free: 30 gün log, 1 yıl incident |
| Subscriber verisi | Email dışında bilgi toplama |
| Right to erasure | Subscriber email silme prosedürü |

---

## 19. Incident Response Workflow

### 19.1 Genel Akış

```
Alert gelir
    │
    ▼
[1. Severity Belirle] ──── P1/P2/P3/P4
    │
    ▼
[2. Etki Değerlendir] ──── Kaç kullanıcı etkileniyor?
    │
    ├── P1/P2 → [3. Hemen Müdahale]
    │           │
    │           ▼
    │     [4. Teşhis] ──── Logları kontrol et, nedeni bul
    │           │
    │           ▼
    │     [5. Düzelt] ──── Fix uygula, deploy et
    │           │
    │           ▼
    │     [6. Status Page Update] ──── Incident mesajı yaz
    │           │
    │           ▼
    │     [7. İzle] ──── Servis normale döndü mü?
    │           │
    │           ├── Evet → [8. Resolve] ──── "Resolved" mesajı
    │           └── Hayır → [5]'e dön
    │
    └── P3/P4 → [9. Kayıt] ──── Jira/GitHub Issue oluştur
                    │
                    ▼
              [10. Planla] ──── Bir sonraki sprint'te çöz
```

### 19.2 P1 Incident Checklist (API Down)

```
□ Alert geldi mi? → Discord/Email kontrol et
□ Gerçekten down mu? → curl ile API'yi test et
□ Status page'de "Investigating" mesajı yaz
□ Logları kontrol et → Cloud Run logs, Neon logs
□ Nedeni tespit et → DB connection? Memory? CPU?
□ Fix uygula → Restart? Scale up? Config change?
□ Status page'de "Identified" mesajı yaz
□ Deploy sonrası izle → 5 dk bekle
□ Normale döndü mü? → Evetse "Resolved" yaz
□ Post-mortem yaz → 48 saat içinde
```

### 19.3 Post-Mortem Template

```
# Incident Post-Mortem — [Tarih]

## Özet
- Başlangıç: [YYYY-MM-DD HH:MM UTC]
- Bitiş: [YYYY-MM-DD HH:MM UTC]
- Süre: [X] dakika
- Severity: P1/P2/P3/P4
- Etkilenen servisler: [API, Worker, DB, Redis]

## Ne oldu?
[Kısa açıklama]

## Neden oldu?
[Kök neden analizi]

## Nasıl tespit ettik?
[Alert mekanizması, manuel tespit]

## Nasıl çözdük?
[Adım adım çözüm]

## Ne öğrendik?
[Dersler, gelecek önlemler]

## Aksiyonlar
- [ ] [Aksiyon 1]
- [ ] [Aksiyon 2]
- [ ] [Aksiyon 3]
```

### 19.4 Müşteri İletişimi

**P1/P2 incident sonrası müşteriye email:**

```
Konu: HookSniff Service Incident — [Tarih]

Merhaba,

[Tarih] tarihinde [saat] UTC'de [X] dakika süren bir servis kesintisi yaşadık.

Etkilenen servis: [API / Worker / DB]
Etki: [Webhook teslimatları geçici olarak durdu / Yükseltilmiş gecikme]
Neden: [Kısa açıklama]
Çözüm: [Ne yaptık]
Önlem: [Gelecekte nasıl önleyeceğiz]

Bu kesintiden etkilenen tüm müşterilerimizden özür dileriz.

Detaylı post-mortem raporu: [link]

Saygılarımızla,
HookSniff Ekibi
```

---

## 20. Test ve Validation Planı

### 20.1 Better Stack Kurulum Testi

| Test | Nasıl | Beklenen Sonuç |
|------|-------|-----------------|
| Monitor oluşturma | 5 monitor ekle | Hepsi "Pending" → "Up" |
| Health check | API'ye manuel curl | 200 OK döner |
| Alert tetikleme | API'yi durdur (test ortamı) | Email + Discord alert gelir |
| Recovery | API'yi başlat | "Resolved" alert gelir |
| Status page | URL'yi aç | Servis durumları doğru gösterilir |
| Subscriber | Email ile abone ol | Confirm email gelir |
| Custom domain | `status.hooksniff.com` | Sayfa yüklenir, SSL çalışır |

### 20.2 False Positive Testleri

| Test | Nasıl | Beklenen Sonuç |
|------|-------|-----------------|
| Kısa timeout | API 35 sn yavaş yanıt versin | Alert gelmemeli (3 dk check) |
| Tek seferlik hata | API 1 kez 503 döndürsün | Alert gelmemeli (3 consecutive) |
| DNS glitch | Kısa DNS kesintisi | Alert gelmemeli |
| Deploy sırasında | Yeni sürüm deploy edilirken | Alert gelmemeli (maintenance window) |

### 20.3 Maintenance Window Testi

| Test | Nasıl | Beklenen Sonuç |
|------|-------|-----------------|
| Planlı bakım | Better Stack'te maintenance oluştur | Alert'ler susturulur |
| Bakım bitişi | Maintenance'i bitir | Monitoring devam eder |
| Bakım uzatma | Süreyi uzat | Alert'ler hâlâ susturulur |

### 20.4 Dry Run Senaryosu

**Senaryo: API kasıtlı olarak kapatılır**

1. Better Stack'te maintenance window oluştur (test)
2. Cloud Run'da API servisini durdur
3. Better Stack'in tespit etmesini bekle (3 dk)
4. Email + Discord alert'in geldiğini doğrula
5. Status page'de "Down" gösterildiğini doğrula
6. API'yi başlat
7. "Resolved" alert'in geldiğini doğrula
8. Maintenance window'ı kapat

**Süre:** ~15 dk
**Ne sıklıkla:** İlk kurulumda 1 kez, sonra ayda 1 kez

---

## 21. Status Page KPIları

### 21.1 Status Page Performans Metrikleri

| KPI | Tanım | Hedef | Nasıl Ölçülür |
|-----|-------|-------|---------------|
| **Uptime Detection Time** | Down olayının tespit süresi | < 5 dk | Better Stack logs |
| **MTTA (Mean Time to Acknowledge)** | Alert'ten ilk müdahaleye | < 15 dk (P1) | Incident logları |
| **MTTR (Mean Time to Resolve)** | Alert'ten çözüme | < 60 dk (P1) | Incident logları |
| **False Positive Rate** | Yanlış alarm oranı | < %5 | Aylık review |
| **Status Page Uptime** | Status page'in kendisi | %99.99 | Upptime backup |
| **Subscriber Growth** | Abone artışı | Ayda +20 | Better Stack dashboard |

### 21.2 Kullanıcı Davranış Metrikleri

| KPI | Tanım | Hedef | Nasıl Ölçülür |
|-----|-------|-------|---------------|
| **Status Page Visits** | Aylık ziyaretçi | Takip | Google Analytics |
| **Subscriber Count** | Email abonesi | 100+ (6. ay) | Better Stack |
| **Incident Page Views** | Incident detay görüntüleme | Takip | Better Stack |
| **Self-service Rate** | Kullanıcı kendi kontrol ediyor | > %80 | Status page visit / support ticket |

### 21.3 Aylık Review Template

```
# Status Page Aylık Review — [Ay/Yıl]

## Metrikler
- Toplam incident: [X]
- P1: [X], P2: [X], P3: [X], P4: [X]
- Ortalama MTTA: [X] dk
- Ortalama MTTR: [X] dk
- False positive: [X]
- Status page ziyaretçi: [X]
- Yeni subscriber: [X]

## SLA Compliance
- Hedef SLA: %99.[X]
- Gerçekleşen: %99.[X]
- SLA breach: [X] kez

## Incident Özeti
| # | Tarih | Severity | Süre | Neden |
|---|-------|----------|------|-------|
| 1 | ... | P1 | 15 dk | DB connection pool |

## Aksiyonlar
- [ ] [Aksiyon 1]
- [ ] [Aksiyon 2]
```

---

## 22. Periyodik Review Planı

### 22.1 Günlük (Otomatik)

| Kontrol | Sorumlu | Süre |
|---------|---------|------|
| Better Stack status check | Otomatik (3 dk) | 0 dk |
| Discord alert kontrolü | Servet (sabah) | 2 dk |
| Status page ziyaretçi | Otomatik | 0 dk |

### 22.2 Haftalık

| Kontrol | Sorumlu | Süre |
|---------|---------|------|
| Incident review (varsa) | Servet | 10 dk |
| False positive kontrolü | Servet | 5 dk |
| Alert tuning (çok mu az?) | Servet | 5 dk |
| Backup monitoring kontrolü | Servet | 5 dk |

### 22.3 Aylık

| Kontrol | Sorumlu | Süre |
|---------|---------|------|
| SLA compliance raporu | Servet | 15 dk |
| Status page KPI review | Servet | 10 dk |
| Subscriber growth analizi | Servet | 5 dk |
| Incident post-mortem review | Servet | 10 dk |
| Alert kanalı testi | Servet | 5 dk |
| Backup monitoring testi | Servet | 5 dk |

### 22.4 Üç Aylık

| Kontrol | Sorumlu | Süre |
|---------|---------|------|
| Araç karşılaştırma (yeni alternatif?) | Servet | 30 dk |
| Fiyat/performans değerlendirmesi | Servet | 15 dk |
| Plan yükseltme kararı | Servet | 10 dk |
| GDPR/KVKK uyumluluk kontrolü | Servet | 15 dk |
| Incident response drill (dry run) | Servet | 30 dk |

### 22.5 Review Takvimi

| Hafta | Gün | Aktivite |
|-------|-----|----------|
| Her hafta | Pazartesi | Haftalık review |
| Her ay | 1'i | Aylık review |
| Her 3 ay | 1'i | Üç aylık review + drill |
| Her yıl | 1 Ocak | Yıllık strateji değerlendirmesi

---

## Notlar

- Bu belge OPERATIONS_STRATEGY.md ve LAUNCH_STRATEGY.md ile birlikte okunmalı
- Better Stack kurulumu yapılacak (20-30 dk)
- Mevcut `/v1/status` endpoint'i zaten iyi — sadece CORS ve status sayfası entegrasyonu düzeltilecek
- İlk hedef: $0 ile professional status page → müşteri güveni
- Rakip analizi: Hookdeck de Better Stack kullanıyor, Svix Statuspage.io kullanıyor
