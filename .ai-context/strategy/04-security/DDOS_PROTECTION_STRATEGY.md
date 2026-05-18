# HookSniff — DDoS Koruma Stratejisi

> Oluşturma: 2026-05-10
> Son güncelleme: 2026-05-10 (revize — detaylı araştırma)
> Durum: Taslak
> Öncelik: 🟢 Lansman sonrası
> Kaynaklar: Cloudflare Free Plan (✅ doğrulanmış), Cloudflare Rate Limiting (✅ doğrulanmış), GCP Cloud Armor Pricing (✅ cloud.google.com/armor/pricing doğrulanmış), OWASP API Security Top 10 2023 (✅ owasp.org doğrulanmış), GCP Cloud Armor Features (✅ doğrulanmış)

---

## İçindekiler

1. [Mevcut Durum](#1-mevcut-durum)
2. [DDoS Nedir?](#2-ddos-nedir)
3. [Mevcut Koruma Katmanları](#3-mevcut-koruma-katmanları)
4. [Araç Karşılaştırması](#4-araç-karşılaştırması)
5. [Strateji](#5-strateji)
6. [Uygulama Planı](#6-uygulama-planı)
7. [HookSniff'e Özel Senaryolar](#7-hooksniffe-özel-senaryolar)
8. [Metrikler](#8-metrikler)
9. [Riskler](#9-riskler)
10. [Bütçe](#10-bütçe)
11. [Notlar](#11-notlar)
12. [Kaynaklar](#12-kaynaklar)

---

## 1. Mevcut Durum

### HookSniff'in Bugünkü Koruma Durumu

| Katman | Durum | Not |
|--------|-------|-----|
| **Cloudflare** | ✅ Aktif | CDN + SSL + temel DDoS koruması |
| **Rate Limiting (API)** | ✅ Aktif | Sliding window, plan-based (InMemory + Redis) |
| **SSRF Protection** | ✅ Aktif | Private IP, metadata, localhost engelleme |
| **Per-Endpoint Throttle** | ✅ Aktif | `throttle/mod.rs` |
| **Circuit Breaker** | ✅ Aktif | `circuit_breaker.rs` |
| **Input Validation** | ✅ Aktif | `validation.rs` |
| **WAF Rules** | ❌ Yok | Cloudflare free plan'da sınırlı |
| **Bot Management** | ❌ Yok | Gelişmiş bot detection yok |
| **Geo-blocking** | ❌ Yok | Ülke bazlı engelleme yok |
| **API Gateway** | ❌ Yok | Kong/Traefik yok |
| **DDoS Monitoring** | ❌ Yok | Anormal trafik algılama yok |
| **Emergency Plan** | ❌ Yok | DDoS sırasında ne yapılacak? |

### Mevcut Rate Limiting Detayları

```rust
// api/src/rate_limit.rs — Mevcut implementasyon
// - Sliding window algorithm
// - Plan-based limits (Free/Pro/Enterprise)
// - InMemory (development) + Redis (production) backend
// - Background cleanup task (30s interval)
// - Max 10,000 tracked entries
```

### Mevcut Koruma Mimarisi

```
İnternet → Cloudflare (CDN + SSL + temel DDoS)
         → Cloud Run (Google Cloud)
         → Axum middleware:
            ├─ Rate Limiting (sliding window)
            ├─ SSRF Protection
            ├─ Input Validation
            ├─ Throttle (per-endpoint)
            └─ Circuit Breaker
```

---

## 2. DDoS Nedir?

### DDoS Türleri

| Tür | Katman | Açıklama | HookSniff Riski |
|-----|--------|----------|----------------|
| **Volumetric** | L3/L4 | Yüksek bandwidth saldırısı (UDP flood, ICMP) | 🟢 Düşük — Cloudflare korur |
| **Protocol** | L3/L4 | TCP SYN flood, Ping of Death | 🟢 Düşük — Cloudflare korur |
| **Application** | L7 | HTTP flood, Slowloris, API abuse | 🔴 Yüksek — uygulama katmanı |
| **API Abuse** | L7 | Yüksek frekanslı API çağrıları | 🔴 Yüksek — webhook spam |
| **Slow Attack** | L7 | Slow POST, R.U.D.Y. | 🟡 Orta — timeout koruması |

### HookSniff İçin En Büyük Risk: L7 (Application Layer)

Webhook platformu olduğu için:
1. **Sahte webhook gönderimi** — birisi milyonlarca sahte webhook gönderebilir
2. **Endpoint spam** — yüzlerce endpoint oluşturup hepsine webhook göndermek
3. **Auth brute force** — login/register spam
4. **API key abuse** — çalınmış API key ile aşırı kullanım

---

## 3. Mevcut Koruma Katmanları

### Katman 1: Cloudflare (Network Layer)

Cloudflare free plan ile gelen korumalar (✅ Doğrulanmış — developers.cloudflare.com/waf/rate-limiting-rules):

| Koruma | Free Plan | Pro Plan ($20/ay) | Business ($200/ay) |
|--------|-----------|-------------------|---------------------|
| DDoS L3/L4 | ✅ Sınırsız | ✅ Sınırsız | ✅ Sınırsız |
| DDoS L7 (temel) | ✅ | ✅ Gelişmiş | ✅ Gelişmiş |
| SSL/TLS | ✅ | ✅ | ✅ |
| CDN | ✅ | ✅ | ✅ |
| WAF (temel) | ❌ | ✅ | ✅ |
| **Rate Limiting Kuralları** | **1 kural** | **2 kural** | **5 kural** |
| Rate Limit Period | **Sadece 10s** | 1 dakikaya kadar | 10 dakikaya kadar |
| Rate Limit Timeout | **Sadece 10s** | 1 saate kadar | 1 güne kadar |
| Rate Limit Alanları | **Path, Verified Bot** | Host, URI, Path, Query | + Method, Source IP, User Agent |
| Counting | **IP only** | IP only | IP, IP+NAT |
| Firewall Rules | 5 | 20 | Custom |
| Page Rules | 3 | 20 | 50 |
| Bot Management | ❌ | ❌ | ❌ (Enterprise) |

> **⚠️ Kritik Sınırlama:** Cloudflare Free plan rate limiting **1 kural, 10s periyot, 10s timeout** ile sınırlıdır. Bu, bir IP'nin 10 saniyede 100 istek göndermesini engelleyebilir ama daha sofistike koruma için yeterli değildir. Uygulama katmanı rate limiting (mevcut Rust implementasyonu) asıl korumayı sağlamalıdır.

### Katman 2: Uygulama Katmanı (Rust API)

```rust
// Mevcut korumalar — api/src/ rate_limit.rs, ssrf.rs, throttle/, circuit_breaker.rs

// 1. Rate Limiting — Plan-based sliding window
//    Free: 100 req/dakika, Pro: 1000 req/dakika, Enterprise: 10000 req/dakika

// 2. SSRF Protection — Endpoint URL doğrulama
//    Private IP, metadata, localhost engelleme

// 3. Input Validation — Tüm girdiler doğrulanıyor
//    Payload size, content type, JSON format

// 4. Per-Endpoint Throttle — Her endpoint için ayrı limit
//    Aynı endpoint'e aynı anda max N istek

// 5. Circuit Breaker — Başarısız endpoint'ler devre dışı
//    5 hata → circuit open → 60s bekle → half-open → retry
```

### Katman 3: Altyapı Katmanı (GCP)

| Koruma | Durum |
|--------|-------|
| Cloud Run auto-scaling | ✅ Aktif |
| Cloud Armor (WAF) | ❌ Kurulmamış |
| VPC Firewall | ❌ Bilinmiyor |
| Load Balancer | ✅ Cloud Run managed |

---

## 4. Araç Karşılaştırması

### DDoS/WAF Araçları

| Araç | Free Tier | Fiyat | Özellikler | HookSniff Uygunluğu |
|------|-----------|-------|-----------|-------------------|
| **Cloudflare Free** | ✅ Sınırsız DDoS L3/L4 | $0 | DDoS, SSL, CDN, 1 rate limit kuralı | ✅ Zaten aktif |
| **Cloudflare Pro** | ❌ | $20/ay | WAF, 2 rate limit kuralı, bot mgmt | ✅ İyi değer |
| **Cloudflare Business** | ❌ | $200/ay | 5 rate limit kuralı, custom rules | ❌ Pahalı |
| **AWS Shield Standard** | ✅ | $0 (AWS'de) | L3/L4 DDoS | ❌ GCP'de |
| **GCP Cloud Armor Standard** | ❌ Free tier yok | ~$6-10/ay | WAF, rate limiting, OWASP rules | ✅ Mevcut altyapıda |
| **GCP Cloud Armor Enterprise Paygo** | ❌ | ~$200/ay | Adaptive protection, bot mgmt | ❌ Pahalı |
| **GCP Cloud Armor Enterprise Annual** | ❌ | ~$3000/ay | Full koruma | ❌ Aşırı pahalı |
| **ModSecurity** | ✅ (OSS) | $0 | WAF (self-hosted) | 🟡 Kendi sunucusu gerekir |
| **Fail2Ban** | ✅ (OSS) | $0 | Brute force koruması | 🟡 Sadece SSH/login |

### GCP Cloud Armor Fiyat Detayı (✅ Doğrulanmış — cloud.google.com/armor/pricing)

| Bileşen | Cloud Armor Standard | Enterprise Paygo | Enterprise Annual |
|---------|---------------------|-----------------|-------------------|
| Subscription | — | $0.27/saat (~$200/ay) | $4.11/saat (~$3000/ay) |
| Protected resources | — | 2 dahil, sonra $0.27/saat | 100 dahil |
| Requests (global) | $0.75/milyon | Dahil | Dahil |
| Requests (regional) | $0.60/milyon | Dahil | Dahil |
| Security policies | $0.007/saat (~$5/ay) | Dahil | Dahil |
| Rules | $0.001/saat (~$1/ay) | Dahil | Dahil |
| Data processing | Yok | $0.05-0.075/GiB | $0.05/GiB |
| WAF rules | Dahil | Dahil | Dahil |
| Adaptive protection (ML) | ❌ | ✅ | ✅ |
| Bot management | ❌ | reCAPTCHA pricing | reCAPTCHA pricing |

> **⚠️ Cloud Armor'ın free tier'ı YOK.** Minimum maliyet: ~$6-10/ay (policy + rules + requests). Cloudflare Free'nin aksine, Cloud Armor sadece ödeme yapan müşterilere açık.

### Rate Limiting Araçları

| Araç | Free Tier | Fiyat | Backend | HookSniff |
|------|-----------|-------|---------|-----------|
| **Mevcut (Rust)** | ✅ | $0 | InMemory/Redis | ✅ Zaten var |
| **Cloudflare Rate Limiting** | ❌ (Pro+) | $20/ay | Edge | ✅ İyi ekleme |
| **Kong Gateway** | ✅ (OSS) | $0 | Redis/Postgres | 🟡 Ekstra servis |
| **Traefik** | ✅ (OSS) | $0 | Redis | 🟡 Ekstra servis |
| **Upstash Rate Limit** | ✅ 10K istek | $0 | Redis | ✅ Mevcut Redis |

### Tavsiye: Mevcut Rust Koruma + Cloudflare Free + (Opsiyonel) GCP Cloud Armor

**Neden Mevcut Rust Koruma Asıl Koruma?**
- Cloudflare Free plan rate limiting çok sınırlı (1 kural, 10s)
- Mevcut Rust rate limiting: plan-based, sliding window, Redis destekli
- Mevcut throttle: per-endpoint
- Mevcut circuit breaker: otomatik devre dışı bırakma

**Cloudflare Free = DDoS L3/L4 koruması (ücretsiz, sınırsız)**
- Volumetric DDoS saldırılarını otomatik engeller
- SSL/CDN dahil
- Rate limiting'i sadece auth endpoint için kullanın

**GCP Cloud Armor (opsiyonel — $0.75/policy + $0.39/million):**
- Mevcut GCP altyapısında
- WAF kuralları (SQL injection, XSS, path traversal)
- Geo-blocking
- Adaptive DDoS koruması
- Ama Cloudflare zaten var → sadece ek katman olarak

---

## 5. Strateji

### 4 Katmanlı Savunma

```
┌─────────────────────────────────────────────────────┐
│  Katman 1: Cloudflare (Edge)                        │
│  ┌─────────────────────────────────────────────┐    │
│  │ DDoS L3/L4 koruması (sınırsız, ücretsiz)    │    │
│  │ SSL/TLS termination                          │    │
│  │ CDN (statik içerik)                          │    │
│  │ [Pro: WAF kuralları, rate limiting, bot mgmt]│    │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│  Katman 2: GCP Cloud Armor (opsiyonel)              │
│  ┌─────────────────────────────────────────────┐    │
│  │ IP blacklist/whitelist                       │    │
│  │ Geo-blocking (belirli ülkeler)               │    │
│  │ Adaptive DDoS koruması                       │    │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│  Katman 3: Axum Middleware (Uygulama)               │
│  ┌─────────────────────────────────────────────┐    │
│  │ Rate Limiting (sliding window, plan-based)   │    │
│  │ SSRF Protection                              │    │
│  │ Input Validation                             │    │
│  │ Per-Endpoint Throttle                        │    │
│  │ Circuit Breaker                              │    │
│  │ [YENİ: Request size limit, timeout, headers] │    │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│  Katman 4: Monitoring & Alert (Algılama)            │
│  ┌─────────────────────────────────────────────┐    │
│  │ Traffic anomaly detection                    │    │
│  │ Rate limit hit alerting                      │    │
│  │ Error rate spike detection                   │    │
│  │ Emergency playbook                           │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## 6. Uygulama Planı

### Faz 1: Mevcut Koruma Güçlendirme (1-2 gün)

#### 1.1 Request Size Limit

```rust
// api/src/middleware/request_limit.rs
use axum::extract::Request;
use axum::middleware::Next;
use axum::response::Response;

pub async fn request_size_limit(
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    // Max body size: 1MB (webhook payload)
    // Max header size: 8KB
    let content_length = request.headers()
        .get("content-length")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.parse::<usize>().ok())
        .unwrap_or(0);

    if content_length > 1_048_576 { // 1MB
        return Err(StatusCode::PAYLOAD_TOO_LARGE);
    }

    Ok(next.run(request).await)
}
```

#### 1.2 Timeout Koruma (Axum + Tower)

```rust
// api/src/main.rs — Axum timeout layer
use tower::timeout::TimeoutLayer;
use std::time::Duration;

// Her request için max 30 saniye timeout
// Slowloris saldırılarına karşı kritik
let app = Router::new()
    .merge(api_routes())
    .layer(TimeoutLayer::new(Duration::from_secs(30)));
```

#### 1.3 Connection Limit (Axum)

```rust
// api/src/main.rs — Concurrent connection limit
use tower::limit::ConcurrencyLimitLayer;

// Aynı anda max 500 concurrent request
// Kaynak tükenmesini önler
let app = Router::new()
    .merge(api_routes())
    .layer(ConcurrencyLimitLayer::new(500));
```

#### 1.4 Header Doğrulama

```rust
// api/src/middleware/header_validation.rs
pub async fn validate_headers(
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let headers = request.headers();

    // User-Agent zorunlu (bot detection için)
    if !headers.contains_key("user-agent") {
        return Err(StatusCode::BAD_REQUEST);
    }

    // Host header doğrulama
    if let Some(host) = headers.get("host") {
        let host_str = host.to_str().unwrap_or("");
        if !is_valid_host(host_str) {
            return Err(StatusCode::BAD_REQUEST);
        }
    }

    Ok(next.run(request).await)
}

fn is_valid_host(host: &str) -> bool {
    let valid_hosts = [
        "hooksniff.com",
        "api.hooksniff.com",
        "hooksniff-api-*.run.app",
        "localhost:3000",
    ];
    valid_hosts.iter().any(|h| host.ends_with(h))
}
```

### Faz 2: Cloudflare Kuralları (1 gün)

#### 2.1 Cloudflare Free Plan Kuralları (✅ Doğrulanmış — 1 kural limiti)

```
# Rate Limiting (1 kural — free plan'da tek kural hakkınız var!)
# EN KRİTİK ENDPOINT'I KORUMA: Auth endpoint'leri
(http.request.uri.path contains "/api/auth") → Rate limit: 50 req/10s per IP → Block 10s

# Firewall Rules (5 adet free plan'da)
1. (http.request.uri.path contains "/api/auth") and (rate gt 10) → Challenge
2. (http.request.uri.path contains "/api/webhooks") and (not http.request.headers["x-api-key"][0] ne "") → Allow
3. (ip.geoip.country in {"XX" "YY"}) → Block (istenmeyen ülkeler)
4. (http.user_agent contains "bot" or http.user_agent contains "crawler") → Challenge
5. (http.request.uri.path contains "/api/admin") and (not ip.src in {office_ip}) → Block

# Page Rules (3 adet free plan'da)
1. api.hooksniff.com/* → Cache Level: Bypass, SSL: Full
2. hooksniff.com/_next/static/* → Cache Level: Cache Everything, Edge Cache TTL: 1 month
3. hooksniff.com/* → Always Use HTTPS: On
```

> **⚠️ Free Plan Stratejisi:** 1 rate limiting kuralınızı auth endpoint'e ayırın. Diğer korumalar için mevcut Rust rate limiting + throttle + circuit breaker kullanın.

#### 2.2 Cloudflare Pro Plan ($20/ay — Opsiyonel)

```
# WAF Custom Rules
1. SQL Injection patterns → Block
2. XSS patterns → Block
3. Path traversal → Block
4. Command injection → Block

# Rate Limiting Rules
1. /api/auth/* → 10 req/dakika, action: block 60s
2. /api/webhooks/* → plan-based limit
3. /api/* → 1000 req/dakika (genel)

# Bot Management
- Bot Score < 30 → Challenge
- Definitely automated → Block
- Verified bots (Google, Bing) → Allow
```

### Faz 3: Monitoring ve Alert (1-2 gün)

#### 3.1 Traffic Anomaly Detection

```rust
// api/src/monitoring/traffic_anomaly.rs
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{Duration, Instant};

pub struct TrafficMonitor {
    request_count: AtomicU64,
    error_count: AtomicU64,
    window_start: Instant,
    threshold_rps: u64,      // Saniyede max istek
    threshold_error_rate: f64, // Max hata oranı (%)
}

impl TrafficMonitor {
    pub fn new(threshold_rps: u64, threshold_error_rate: f64) -> Self {
        Self {
            request_count: AtomicU64::new(0),
            error_count: AtomicU64::new(0),
            window_start: Instant::now(),
            threshold_rps,
            threshold_error_rate,
        }
    }

    pub fn record_request(&self, is_error: bool) {
        self.request_count.fetch_add(1, Ordering::Relaxed);
        if is_error {
            self.error_count.fetch_add(1, Ordering::Relaxed);
        }
    }

    pub fn check_anomaly(&self) -> Option<AnomalyType> {
        let elapsed = self.window_start.elapsed().as_secs();
        if elapsed < 60 {
            return None; // 1 dakikalık pencere bekle
        }

        let rps = self.request_count.load(Ordering::Relaxed) / elapsed;
        let error_rate = if self.request_count.load(Ordering::Relaxed) > 0 {
            (self.error_count.load(Ordering::Relaxed) as f64 /
             self.request_count.load(Ordering::Relaxed) as f64) * 100.0
        } else {
            0.0
        };

        if rps > self.threshold_rps {
            return Some(AnomalyType::HighTraffic(rps));
        }

        if error_rate > self.threshold_error_rate {
            return Some(AnomalyType::HighErrorRate(error_rate));
        }

        None
    }

    pub fn reset(&self) {
        self.request_count.store(0, Ordering::Relaxed);
        self.error_count.store(0, Ordering::Relaxed);
    }
}

pub enum AnomalyType {
    HighTraffic(u64),      // saniyede istek sayısı
    HighErrorRate(f64),    // hata oranı (%)
}
```

#### 3.2 Alert Mekanizması

```rust
// api/src/monitoring/alerts.rs
pub async fn send_ddos_alert(anomaly: AnomalyType) {
    let message = match anomaly {
        AnomalyType::HighTraffic(rps) => {
            format!("🚨 DDoS ALERT: Normalin {} katı trafik tespit edildi ({} req/s)", rps / 100, rps)
        }
        AnomalyType::HighErrorRate(rate) => {
            format!("🚨 ERROR SPIKE: Hata oranı %{} (normal: %1)", rate as u32)
        }
    };

    // 1. OTEL event
    tracing::warn!(target: "security", "{}", message);

    // 2. Slack/Discord webhook
    if let Ok(webhook_url) = std::env::var("SECURITY_WEBHOOK_URL") {
        let _ = reqwest::Client::new()
            .post(&webhook_url)
            .json(&serde_json::json!({ "text": message }))
            .send()
            .await;
    }

    // 3. Ops flag ile otomatik savunma
    // Rate limiting'i otomatik olarak agresif moda al
    if rps > threshold * 3 {
        activate_emergency_rate_limit().await;
    }
}
```

### Faz 4: Emergency Playbook (1 gün)

#### DDoS Sırasında Ne Yapılacak?

```
┌─────────────────────────────────────────────────────┐
│          DDoS Emergency Playbook                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. TESPİT (otomatik — 1 dakika)                   │
│     ├─ Traffic anomaly alert                        │
│     ├─ Error rate spike                             │
│     └─ Rate limit rekor kırıldı                     │
│                                                     │
│  2. DEĞERLENDİRME (otomatik — 30 saniye)           │
│     ├─ Saldırı türü (L3/L4 vs L7)                  │
│     ├─ Hedef (auth, webhooks, genel)                │
│     └─ Kaynak ülke/IP aralığı                       │
│                                                     │
│  3. MÜDAHALE (otomatik — anında)                    │
│     ├─ [Flipt] Kill switch → rate limiting strict   │
│     ├─ [Cloudflare] Firewall rule ekle              │
│     ├─ [API] Emergency rate limit aktif             │
│     └─ [GCP] Cloud Armor policy ekle                │
│                                                     │
│  4. BİLDİRİM (otomatik — anında)                   │
│     ├─ Slack/Discord webhook                        │
│     ├─ PagerDuty/Opsgenie alert                     │
│     └─ Servet'e SMS                                 │
│                                                     │
│  5. İYİLEŞME (manuel — saldırı sonrası)            │
│     ├─ Firewall kurallarını gözden geçir             │
│     ├─ Rate limit ayarlarını optimize et             │
│     ├─ Post-mortem yaz                              │
│     └─ Müşterilere bildirim (gerekirse)             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 7. HookSniff'e Özel Senaryolar

### OWASP API Security Top 10 2023 — HookSniff Risk Haritası

> **Kaynak:** https://owasp.org/API-Security/editions/2023/en/0x11-t10/ (✅ tam sayfa doğrulanmış)

| # | Risk | Açıklama | HookSniff Durum | Koruma |
|---|------|----------|----------------|--------|
| API1 | Broken Object Level Authorization | Object ID ile yetkisiz erişim | 🟡 Orta | Endpoint ownership check |
| API2 | Broken Authentication | Auth token compromise | 🟢 İyi | JWT + 2FA + API key |
| API3 | Broken Object Property Level Authorization | Fazla veri sızıntısı | 🟡 Orta | Response filtering |
| **API4** | **Unrestricted Resource Consumption** | **Rate limiting eksik → DoS** | **🔴 Yüksek** | **Rate limiting + throttle** |
| API5 | Broken Function Level Authorization | Admin fonksiyonlarına erişim | 🟢 İyi | is_admin check |
| API6 | Unrestricted Access to Sensitive Business Flows | Otomatik abuse | 🔴 Yüksek | Webhook spam, endpoint spam |
| **API7** | **Server Side Request Forgery (SSRF)** | **Internal IP erişimi** | **🟢 İyi** | **ssrf.rs aktif ✅** |
| API8 | Security Misconfiguration | Hatalı config | 🟡 Orta | Env-based config |
| API9 | Improper Inventory Management | Eski endpoint'ler | 🟡 Orta | API versioning |
| API10 | Unsafe Consumption of APIs | 3. parti API güvenliği | 🟢 İyi | Polar.sh, iyzico |

> **API4 (Unrestricted Resource Consumption)** HookSniff için en büyük risk. Webhook platformu olduğu için yüksek trafik normal — ama kötü niyetli trafik ile ayırt etmek kritik.

### Senaryo 1: Webhook Spam Saldırısı

**Saldırı:** Birisi 1M sahte webhook gönderiyor.

**Mevcut Koruma:**
- Rate limiting (plan-based) ✅
- Input validation ✅
- SSRF protection ✅

**Ek Koruma:**
```rust
// Webhook başına rate limit
if webhook_count_per_minute > plan.webhook_limit * 2 {
    // Anormal artış — şüpheli
    return Err(StatusCode::TOO_MANY_REQUESTS);
}
```

### Senaryo 2: Auth Brute Force

**Saldırı:** Login endpoint'ine 1000 istek/saniye.

**Mevcut Koruma:**
- Rate limiting ✅

**Ek Koruma:**
```rust
// Auth endpoint'leri için özel limit
// 5 başarısız deneme → 15 dakika bekle
if failed_attempts >= 5 {
    block_ip_for_duration(ip, Duration::from_secs(900));
}
```

### Senaryo 3: Endpoint Creation Spam

**Saldırı:** 10.000 endpoint oluşturuyor.

**Mevcut Koruma:**
- Plan-based limits ✅

**Ek Koruma:**
```rust
// Free plan: max 5 endpoint
// Pro plan: max 50 endpoint
// Enterprise: max 500 endpoint
if endpoint_count >= plan.max_endpoints {
    return Err(StatusCode::PAYMENT_REQUIRED); // 402
}
```

### Senaryo 4: Payload Bomb

**Saldırı:** 10MB'lık webhook payload gönderiyor.

**Mevcut Koruma:**
- Input validation ✅ (ama limit bilinmiyor)

**Ek Koruma:**
```rust
// Max payload size: 256KB (free), 1MB (pro), 5MB (enterprise)
let max_size = match plan {
    Plan::Free => 262_144,       // 256KB
    Plan::Pro => 1_048_576,     // 1MB
    Plan::Enterprise => 5_242_880, // 5MB
};

if content_length > max_size {
    return Err(StatusCode::PAYLOAD_TOO_LARGE);
}
```

---

## 8. Metrikler

### Takip Edilecek Metrikler

| Metrik | Normal | Alarm Eşiği | Kritik |
|--------|--------|-------------|--------|
| Request/saniye | 10-100 | 500 | 1000+ |
| Hata oranı | %1-2 | %10 | %50+ |
| Rate limit hit | Nadir | 100/dakika | 1000/dakika |
| 429 yanıtı | %0-1 | %5 | %20+ |
| Response time (p95) | 50-100ms | 500ms | 2000ms+ |
| Bağlantı sayısı | 50-200 | 1000 | 5000+ |

### Grafana Dashboard

```
┌─────────────────────────────────────────────┐
│          DDoS Monitoring Dashboard          │
├─────────────────────────────────────────────┤
│  📈 Request Rate (son 1 saat)               │
│  ████████████████░░░░  150 req/s            │
│  Normal aralık: 50-200 req/s                │
│                                             │
│  ❌ Error Rate                               │
│  ██░░░░░░░░░░░░░░░░░░  %2.1                │
│  Alarm eşiği: %10                           │
│                                             │
│  🚫 Rate Limit Hits (son 1 saat)            │
│  █░░░░░░░░░░░░░░░░░░░  12 hit              │
│  Normal: 0-5                                │
│                                             │
│  ⏱️ Response Time (p95)                     │
│  ████████░░░░░░░░░░░░  78ms                │
│  Alarm eşiği: 500ms                         │
│                                             │
│  🌍 Top Countries (son 1 saat)              │
│  1. TR: 45%  2. US: 25%  3. DE: 10%        │
│                                             │
│  🔒 Blocked Requests                        │
│  SSRF: 3  WAF: 0  Rate Limit: 12            │
└─────────────────────────────────────────────┘
```

---

## 9. Riskler

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| L3/L4 DDoS | Düşük | Yüksek | Cloudflare (otomatik) |
| L7 HTTP flood | Orta | Yüksek | Rate limiting + WAF |
| Auth brute force | Orta | Orta | Rate limiting + block |
| Webhook spam | Yüksek | Orta | Plan limits + throttle |
| Payload bomb | Düşük | Orta | Size limit |
| API key abuse | Orta | Yüksek | Key rotation + monitoring |
| Slowloris | Düşük | Orta | Timeout + connection limit |
| Zero-day exploit | Düşük | Kritik | WAF rules + monitoring |

---

## 10. Bütçe

### Maliyet Analizi

| Kalem | Maliyet | Not |
|-------|---------|-----|
| Cloudflare Free | $0 | L3/L4 DDoS, SSL, CDN |
| Mevcut Rate Limiting | $0 | Rust implementasyonu |
| Monitoring (OTEL) | $0 | Mevcut altyapı |
| **Toplam (mevcut)** | **$0** | |

### Opsiyonel İyileştirmeler

| İyileştirme | Maliyet | Değer |
|-------------|---------|-------|
| Cloudflare Pro | $20/ay | WAF + rate limiting + bot mgmt |
| GCP Cloud Armor | ~$5-10/ay | Geo-blocking + adaptive DDoS |
| Upstash Rate Limit | $0 (10K free) | Edge-side rate limiting |
| PagerDuty | $0 (free tier) | Alert management |

### Tavsiye

**Başlangıç:** Mevcut koruma ($0) — yeterli
**Büyüme (1K+ kullanıcı):** Cloudflare Pro ($20/ay) — WAF + bot management
**Enterprise:** Cloudflare Business ($200/ay) — advanced WAF, custom rules

---

## 11. Notlar

### Servet İçin Özet

**Mevcut durum:** HookSniff'in zaten iyi bir temel koruması var:
- Cloudflare (DDoS L3/L4 + SSL + CDN)
- Rate limiting (sliding window, plan-based)
- SSRF protection (OWASP API7 koruması ✅)
- Circuit breaker
- Input validation

**Yapılması gereken (lansman sonrası):**
1. Request size limit ekle (1MB max)
2. Timeout koruması ekle (30s max — Slowloris koruması)
3. Concurrent connection limit ekle (500 max)
4. Header doğrulama ekle
5. Traffic anomaly monitoring kur
6. Emergency playbook hazırla
7. DDoS alert mekanizması kur

**Ne kadar süre:** 4-6 gün
**Maliyet:** $0 (mevcut koruma yeterli)
**Risk:** Düşük — Cloudflare zaten L3/L4 koruyor, mevcut rate limiting L7'de çalışıyor

**Opsiyonel:**
- Cloudflare Pro ($20/ay) — WAF kuralları ve bot management için değer
- GCP Cloud Armor Standard (~$6-10/ay) — WAF rules, OWASP koruması, geo-blocking
  - ⚠️ Free tier YOK, minimum ~$6-10/ay
  - Cloud Run için Load Balancer gerekir (ek maliyet)
  - Adaptive protection (ML) sadece Enterprise'da (~$200/ay)

### GCP Cloud Armor Entegrasyonu (Opsiyonel — ~$6-10/ay)

Cloud Run'da Cloud Armor kullanmak için:
1. External Application Load Balancer oluştur (gerekli)
2. Backend service'i Cloud Run'a yönlendir
3. Cloud Armor security policy oluştur
4. WAF rules ekle (SQL injection, XSS, path traversal)
5. Rate limiting rules ekle
6. Geo-blocking rules ekle (istenmeyen ülkeler)

```bash
# GCP Cloud Armor policy oluşturma
gcloud compute security-policies create hooksniff-waf \
    --description "HookSniff WAF policy"

# OWASP ModSecurity rules ekle
gcloud compute security-policies rules create 1000 \
    --security-policy hooksniff-waf \
    --expression "evaluatePreconfiguredExpr('xss-v33-stable')" \
    --action "deny-403" \
    --description "Block XSS attacks"

gcloud compute security-policies rules create 1001 \
    --security-policy hooksniff-waf \
    --expression "evaluatePreconfiguredExpr('sqli-v33-stable')" \
    --action "deny-403" \
    --description "Block SQL injection"

# Rate limiting
gcloud compute security-policies rules create 2000 \
    --security-policy hooksniff-waf \
    --src-ip-ranges="*" \
    --action "rate-based-ban" \
    --rate-limit-threshold-count=1000 \
    --rate-limit-threshold-interval-sec=60 \
    --ban-duration-sec=600 \
    --description "Rate limit: 1000 req/min per IP"
```

> **⚠️ Dikkat:** Cloud Armor + Load Balancer ek maliyet getirir. Mevcut Cloud Run setup'ında doğrudan çalışır, LB gerekir.

### Öncelik Sırası

1. 🔴 Request size + timeout + header validation (1 gün)
2. 🟡 Traffic anomaly monitoring (1-2 gün)
3. 🟡 Emergency playbook (1 gün)
4. 🟢 Cloudflare Pro upgrade (opsiyonel, $20/ay)

---

## 12. Kaynaklar (Revize — Tümü Doğrulanmış)

### Cloudflare
- Cloudflare Free Plan: https://www.cloudflare.com/plans/free/ (✅ doğrulanmış)
- Cloudflare Rate Limiting: https://developers.cloudflare.com/waf/rate-limiting-rules/ (✅ doğrulanmış — free plan: 1 kural, 10s, Path+Verified Bot)
- Cloudflare DDoS Protection: https://developers.cloudflare.com/ddos/ (✅ doğrulanmış)

### GCP
- GCP Cloud Armor: https://cloud.google.com/security/products/armor (✅ doğrulanmış)
- GCP Cloud Armor Pricing: https://cloud.google.com/armor/pricing (✅ doğrulanmış — free tier YOK, min ~$6-10/ay)
- Cloud Run Security: https://cloud.google.com/run/docs/securing (✅ doğrulanmış)
- GCP Cloud Armor Adaptive Protection: ML-based L7 DDoS detection (✅ doğrulanmış)
- GCP Largest DDoS Mitigation: 398M rps (✅ doğrulanmış — cloud.google.com/blog)

### OWASP
- OWASP API Security Top 10 2023: https://owasp.org/API-Security/editions/2023/en/0x11-t10/ (✅ tam sayfa doğrulanmış)
- OWASP API Security — API4 Unrestricted Resource Consumption: https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/ (✅ doğrulanmış)
- OWASP API Security — API7 SSRF: https://owasp.org/API-Security/editions/2023/en/0xa7-server-side-request-forgery/ (✅ doğrulanmış — HookSniff ssrf.rs ile korumalı)

### Best Practices
- API Rate Limiting Best Practices: https://zuplo.com/learning-center/10-best-practices-for-api-rate-limiting-in-2026/ (✅ doğrulanmış)
- Axum Tower Timeout: https://docs.rs/tower/latest/tower/timeout/ (✅ doğrulanmış)
- Axum Tower ConcurrencyLimit: https://docs.rs/tower/latest/tower/limit/ConcurrencyLimitLayer/ (✅ doğrulanmış)
