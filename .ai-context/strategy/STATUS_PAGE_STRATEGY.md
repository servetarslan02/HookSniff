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

## Notlar

- Bu belge OPERATIONS_STRATEGY.md ve LAUNCH_STRATEGY.md ile birlikte okunmalı
- Better Stack kurulumu Servet tarafından yapılabilir (20-30 dk)
- Mevcut `/v1/status` endpoint'i zaten iyi — sadece CORS ve status sayfası entegrasyonu düzeltilecek
- İlk hedef: $0 ile professional status page → müşteri güveni
- Rakip analizi: Hookdeck de Better Stack kullanıyor, Svix Statuspage.io kullanıyor
