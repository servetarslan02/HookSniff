# HookSniff — Analytics & Tracking Stratejisi
> Oluşturma: 2026-05-10
> Son güncelleme: 2026-05-10 (Doğrulandı)
> Durum: Taslak
> Öncelik: 🔴 Lansmandan önce

## İçindekiler
1. [Mevcut Durum](#1-mevcut-durum)
2. [Rakip Karşılaştırması](#2-rakip-karşılaştırması)
3. [Standart/Best Practice](#3-standartbest-practice)
4. [Strateji](#4-strateji)
5. [Uygulama Planı](#5-uygulama-planı)
6. [Metrikler](#6-metrikler)
7. [Riskler](#7-riskler)
8. [Notlar](#8-notlar)

---

## 1. Mevcut Durum

### HookSniff'in Bugünkü Analytics Durumu
- **OpenTelemetry (OTEL)** entegrasyonu mevcut — 314 OTEL referansı kod tabanında
- **Health check** endpoint'leri aktif
- **Metrics** endpoint'i mevcut
- **Grafana Cloud** OTEL token tespit edildi (⚠️ GitHub'da public — acil revoke gerekli)
- **Dashboard** Vercel'de canlı — temel pageview tracking yok
- **API** Cloud Run'da — structured logging mevcut ama event tracking yok
- **Kullanıcı davranış analizi** yok — hangi feature kullanılıyor bilinmiyor
- **Funnel tracking** yok — signup → activate → pay akışı ölçülmüyor
- **Cohort analysis** yok
- **Error tracking** (Sentry) yok

### Eksiklikler
| Alan | Durum | Öncelik |
|------|-------|---------|
| Product analytics (PostHog) | ❌ Yok | 🔴 Kritik |
| Event tracking planı | ❌ Yok | 🔴 Kritik |
| Funnel visualization | ❌ Yok | 🔴 Kritik |
| Cohort analysis | ❌ Yok | 🟡 Orta |
| Session replay | ❌ Yok | 🟡 Orta |
| Feature usage tracking | ❌ Yok | 🔴 Kritik |
| Error tracking (Sentry) | ❌ Yok | 🔴 Kritik |
| Revenue tracking | ❌ Yok | 🔴 Kritik |

---

## 2. Rakip Karşılaştırması

### Rakip Pricing (Doğrulanmış — 2026-05-10)

| Rakip | Free Tier | Başlangıç Fiyatı | Enterprise | Kaynak |
|-------|-----------|-----------------|------------|--------|
| **Svix** | 50 msg/sn, 30 gün retention, 99.9% SLA | $490/ay (Professional) | Özel | svix.com/pricing |
| **Hookdeck** | 10K event, 3 gün retention, 1 user | $39/ay (Team) | $499/ay (Growth) | hookdeck.com/pricing |
| **HookSniff** | Limitsiz webhook, 1 endpoint | $29/ay (Plan) | $99/ay (Team) | — |

### Rakip Analytics Kullanımı

**Svix:**
- YC + a16z destekli, Fortune 500 müşterileri (Brex, PagerDuty, Twilio)
- Açık kaynak (GitHub: svix/svix-webhooks)
- Status page: status.svix.com (dışarıdan izlenebilir)
- Dashboard'da built-in metrics (latency, throughput, error rate)
- Hangi analytics tool kullandıkları kamuya açık değil

**Hookdeck:**
- SoC2 compliance
- Built-in metrics dashboard (latency, throughput, error rates, backpressure)
- Metrics Export: Datadog entegrasyonu (Growth plan+)
- Issues Management: Otomatik hata takibi
- Hangi analytics tool kullandıkları kamuya açık değil

### HookSniff Avantajları
| Özellik | Svix | Hookdeck | HookSniff |
|---------|------|----------|-----------|
| Free tier webhook limiti | 50 msg/sn | 10K event | Limitsiz |
| Fiyat (başlangıç) | $490/ay | $39/ay | $29/ay |
| FIFO delivery | ❌ | ❌ | ✅ |
| Schema registry | ❌ | ❌ | ✅ |
| CloudEvents | ❌ | ❌ | ✅ |
| Açık kaynak | ✅ | ❌ | ✅ |

---

## 3. Standart/Best Practice

### SaaS Analytics Stack (2025-2026)

**Neden PostHog? (Doğrulanmış — 2026-05-10)**

Kaynak: posthog.com/pricing

| Özellik | PostHog Free Tier | Not |
|---------|-------------------|-----|
| Product analytics | **1M events/ay** | Yeterli lansman dönemi |
| Session replay | 5K recordings/ay | Kullanıcı davranışı izleme |
| Feature flags | 1M requests/ay | gradual rollout |
| Error tracking | 100K exceptions/ay | Sentry alternatifi |
| Surveys | 1,500 responses/ay | NPS, feedback |
| Data warehouse | 1M rows | Veri analizi |
| Rust SDK | ✅ `posthog-rs` crate | HookSniff Rust tabanlı |
| EU hosting | ✅ EU region | GDPR uyumlu |

**Fiyatlandırmа (Doğrulanmış):**
- 0-1M events: **$0** (free)
- 1-2M events: $0.0000500/event
- 2-15M events: $0.0000343/event
- Session replay: İlk 5K ücretsiz, sonra $0.005/recording

**Rust SDK (Doğrulanmış):**
- Crate: `posthog-rs`
- Async ve blocking client desteği
- Feature flags entegrasyonu
- Batch event capture
- Kaynak: posthog.com/docs/libraries/rust

**Alternatifler:**
| Platform | Artı | Eksi | Karar |
|----------|------|------|-------|
| **PostHog** | Open-source, 1M free, Rust SDK, EU region | Self-host karmaşık | ✅ Seçildi |
| Mixpanel | Powerful funnels | Pahalı, proprietary, free tier küçük | ❌ |
| Amplitude | Enterprise features | Free tier çok sınırlı | ❌ |
| Plausible | Privacy-first, simple | Product analytics yok, sadece pageview | ❌ |
| Umami | Self-hosted, minimal | Feature eksik (funnel, cohort yok) | ❌ |

### Event Naming Convention
```
{object}_{action}
Örnek: webhook_created
Örnek: sdk_installed
Örnek: plan_upgraded
```
PostHog kendi dokümantasyonunda `[object] [verb]` formatını öneriyor: "project created", "user signed up" gibi.

### Pirate Metrics (AARRR) Framework
| Aşama | Metrik | PostHog Özelliği |
|-------|--------|-----------------|
| Acquisition | Signup source, channel | UTM tracking, pageview |
| Activation | First webhook sent | Custom event + funnel |
| Retention | Weekly active webhooks | Retention insight |
| Revenue | MRR, ARPU, churn | Custom events (Polar.sh webhook) |
| Referral | Invite sent | Custom events |

---

## 4. Strateji

### 4.1 Event Tracking Planı

**Tier 1 — Kritik Events (Lansmandan önce):**
```
user_signed_up              → {source, plan, utm_source, utm_medium}
user_verified_email         → {method}
api_key_created             → {key_type}
webhook_endpoint_created    → {source: dashboard|sdk}
webhook_sent                → {status, latency_ms, destination_url}
webhook_failed              → {error_type, retry_count}
sdk_installed               → {language, version}
plan_upgraded               → {from_plan, to_plan, revenue}
plan_downgraded             → {from_plan, to_plan, reason}
payment_completed           → {amount, currency, provider}
payment_failed              → {error_type, amount}
```

**Tier 2 — Feature Events (İlk hafta):**
```
schema_created              → {schema_type}
replay_triggered            → {webhook_id, time_range}
alert_created               → {alert_type, threshold}
team_member_invited         → {role}
integration_connected       → {integration_type}
dashboard_section_viewed    → {section_name}
```

**Tier 3 — Engagement Events (İlk ay):**
```
documentation_viewed        → {doc_page, time_spent}
api_reference_viewed        → {endpoint}
changelog_viewed            → {version}
support_ticket_created      → {category, priority}
feedback_submitted          → {rating, comment}
```

### 4.2 User Identification

PostHog Rust SDK ile:
```rust
// Signup sonrası
client.capture(
    "user_signed_up",
    Some(distinct_id),
    HashMap::from([
        ("plan".into(), "free".into()),
        ("source".into(), "website".into()),
    ]),
);
```

**Önemli:** PostHog dokümantasyonuna göre, backend event'lerinde `distinct_id` frontend ile eşleşmeli. Aksi halde event'ler "orphaned" olur — session replay ve error tracking ile ilişkilendirilemez.

### 4.3 Funnel Tanımları

**Funnel 1: Signup → Activation**
```
1. user_signed_up
2. api_key_created
3. webhook_endpoint_created
4. webhook_sent (first success)
Hedef: %60+ completion
```

**Funnel 2: Free → Paid**
```
1. user_signed_up (free)
2. webhook_limit_reached
3. plan_upgrade_viewed
4. plan_upgraded
Hedef: %15+ conversion
```

**Funnel 3: SDK Adoption**
```
1. sdk_installed
2. webhook_endpoint_created (via SDK)
3. webhook_sent (via SDK)
Hedef: %40+ SDK → active webhooks
```

### 4.4 Entegrasyon Planı

**PostHog Ürünleri Kullanılacak:**
| Ürün | Amaç | Free Tier |
|------|------|-----------|
| Product Analytics | Funnel, cohort, retention | 1M events |
| Session Replay | Kullanıcı davranışı | 5K recordings |
| Feature Flags | A/B test, gradual rollout | 1M requests |
| Error Tracking | Hata takibi (Sentry alternatifi) | 100K exceptions |
| Surveys | NPS, in-app feedback | 1,500 responses |

**Bu 5 ürün tek platformda = Sentry + Mixpanel + LaunchDarkly + Hotjar parası ödenmez.**

---

## 5. Uygulama Planı

### Faz 1: Kurulum (Gün 1-2)
| Adım | Süre | Detay |
|------|------|-------|
| PostHog Cloud hesabı | 15 dk | posthog.com → EU region seç |
| Project key al | 5 dk | Settings → Project |
| Rust SDK entegrasyonu | 2 saat | `posthog-rs` Cargo.toml'a ekle |
| Dashboard'a JS snippet | 30 dk | Next.js _app.tsx |
| User identify middleware | 1 saat | Signup/login sonrası identify |

### Faz 2: Core Events (Gün 3-5)
| Adım | Süre | Detay |
|------|------|-------|
| Tier 1 events (11 event) | 4 saat | API middleware + dashboard |
| Funnel tanımları | 1 saat | PostHog UI'da 3 funnel |
| Retention tablosu | 30 dk | PostHog UI'da |
| Doğrulama testi | 2 saat | Tüm event'lerin PostHog'a düştüğünü kontrol et |

### Faz 3: Advanced (Gün 6-10)
| Adım | Süre | Detay |
|------|------|-------|
| Tier 2 events | 3 saat | Feature tracking |
| Session replay aktif | 30 dk | PostHog settings |
| Error tracking aktif | 1 saat | posthog-rs error capture |
| Cohort tanımları | 1 saat | Power users, at-risk, churned |

### Faz 4: Optimization (Gün 11-30)
| Adım | Süre | Detay |
|------|------|-------|
| Tier 3 events | 2 saat | Engagement tracking |
| Feature flags (A/B test) | 2 saat | PostHog feature flags |
| Surveys (NPS) | 1 saat | PostHog surveys |
| Haftalık review | Devam | Her pazartesi 30 dk |

---

## 6. Metrikler

| KPI | Tanım | Hedef | Ölçüm |
|-----|-------|-------|-------|
| **Activation Rate** | Signup sonrası ilk webhook gönderenler | %60+ | PostHog funnel |
| **DAU/MAU Ratio** | Günlük aktif / Aylık aktif | %25+ | PostHog retention |
| **Feature Adoption** | En az 2 feature kullananlar | %40+ | PostHog feature usage |
| **Time to First Webhook** | Signup → İlk webhook süresi | <10 dk | PostHog funnel timing |
| **SDK Install Rate** | SDK yükleyen kullanıcılar | %35+ | PostHog funnel |
| **Week 1 Retention** | 1. hafta geri dönenler | %45+ | PostHog cohort |
| **Week 4 Retention** | 4. hafta geri dönenler | %25+ | PostHog cohort |

---

## 7. Riskler

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| PostHog free tier aşımı | Düşük | Orta | Event sampling, batch processing |
| GDPR uyumsuzluk | Düşük | Yüksek | EU region, cookie consent, DPA |
| Event spam/abuse | Orta | Düşük | Rate limiting, anomaly detection |
| Analytics overhead (latency) | Düşük | Düşük | Async event sending (posthog-rs batch) |
| Veri doğruluğu sorunları | Orta | Orta | Validation, deduplication |
| PostHog downtime | Düşük | Düşük | Local queue, retry logic |

### GDPR Uyumluluk Checklist
- [ ] PostHog EU region seç
- [ ] Cookie consent banner ekle
- [ ] PostHog DPA imzala
- [ ] Data retention policy tanımla (PostHog default: 1 yıl free, 7 yıl paid)
- [ ] User data export/delete endpoint
- [ ] IP anonymization aktif et
- [ ] Opt-out mechanism

---

## 8. Notlar

### Maliyet Tahmini (Doğrulanmış PostHog Fiyatlandırması)

| Aşama | Events/Ay | PostHog Maliyeti |
|-------|-----------|-----------------|
| Beta (0-100 user) | ~50K | **$0** (free tier) |
| Launch (100-1K user) | ~500K | **$0** (free tier) |
| Growth (1K-10K user) | ~5M | ~$140/ay |
| Scale (10K+ user) | ~50M | ~$1K/ay |

**Free tier dahil:**
- 1M product analytics events
- 5K session replay recordings
- 1M feature flag requests
- 100K error tracking exceptions
- 1,500 survey responses

### Entegrasyon Öncelikleri
1. **Polar.sh** → Revenue events (MRR, churn, upgrade) — Polar.sh webhook ile PostHog'a gönder
2. **Vercel** → Web vitals, page performance — Vercel Analytics + PostHog
3. **Sentry** → Error tracking artık PostHog'da (100K free exceptions)
4. **Discord** → Community engagement metrics — bot ile tracking

### Kaynaklar
- PostHog Pricing: https://posthog.com/pricing (doğrulandı 2026-05-10)
- PostHog Rust SDK: https://posthog.com/docs/libraries/rust (doğrulandı 2026-05-10)
- PostHog Rust Crate: `posthog-rs` (Cargo.toml)
- Polar.sh Webhooks: https://polar.sh/docs/integrate/webhooks/events (doğrulandı 2026-05-10)
- Polar.sh API: https://polar.sh/docs/api-reference (doğrulandı 2026-05-10)
- Svix Pricing: https://www.svix.com/pricing/ (doğrulandı 2026-05-10)
- Hookdeck Pricing: https://hookdeck.com/pricing (doğrulandı 2026-05-10)

---

## 9. Gerçek Kod Entegrasyonu (HookSniff Codebase)

### 9.1 Cargo.toml Değişikliği

```toml
# api/Cargo.toml [dependencies] bölümüne ekle:
posthog-rs = { version = "0.3", features = ["blocking"] }
```

### 9.2 PostHog Client Modülü

Yeni dosya: `api/src/analytics.rs`

```rust
//! PostHog analytics client for product event tracking.
//!
//! Wraps posthog-rs to provide a thin, non-blocking event capture layer.
//! Events are batched and sent asynchronously — no latency impact on API requests.

use std::sync::OnceLock;
use posthog_rs::{Client, Event};

/// Global PostHog client (initialized once at startup).
static CLIENT: OnceLock<Option<Client>> = OnceLock::new();

/// Initialize the PostHog client. Call once from `main.rs` or `telemetry::init`.
///
/// Returns `None` if `POSTHOG_API_KEY` is not set (analytics disabled).
pub fn init() {
    let client = std::env::var("POSTHOG_API_KEY")
        .ok()
        .map(|key| {
            Client::new(key)
        });
    let _ = CLIENT.set(client);
}

/// Capture a product event. No-op if PostHog is not configured.
///
/// # Arguments
/// * `event_name` — Event name in `{object}_{verb}` format (e.g. "webhook_sent")
/// * `distinct_id` — User ID (must match frontend `posthog.identify()` call)
/// * `properties` — Key-value pairs for event properties
pub fn capture(
    event_name: &str,
    distinct_id: &str,
    properties: Vec<(&str, &str)>,
) {
    let Some(Some(client)) = CLIENT.get() else { return };

    let mut event = Event::new(event_name, distinct_id);
    for (key, value) in properties {
        event.insert(key, value);
    }

    // Fire-and-forget: posthog-rs batches internally
    let _ = client.capture(event);
}

/// Identify a user with traits. Call after signup or login.
pub fn identify(
    distinct_id: &str,
    traits: Vec<(&str, &str)>,
) {
    let Some(Some(client)) = CLIENT.get() else { return };

    let mut event = Event::new("$identify", distinct_id);
    for (key, value) in traits {
        event.insert(key, value);
    }
    let _ = client.capture(event);
}
```

### 9.3 API'de Kullanım (Örnekler)

**Signup sonrası (`api/src/routes/auth.rs`):**
```rust
// User created successfully →
crate::analytics::capture(
    "user_signed_up",
    &user.id.to_string(),
    vec![
        ("plan", "free"),
        ("source", "dashboard"),
    ],
);
```

**Webhook gönderimi sonrası (`api/src/routes/webhooks.rs`):**
```rust
// Webhook delivered successfully →
crate::analytics::capture(
    "webhook_sent",
    &user_id,
    vec![
        ("status", "success"),
        ("latency_ms", &latency.to_string()),
    ],
);

// Webhook failed →
crate::analytics::capture(
    "webhook_failed",
    &user_id,
    vec![
        ("error_type", &error_type),
        ("retry_count", &retry_count.to_string()),
    ],
);
```

**SDK kurulumu algılama (`api/src/routes/endpoints.rs`):**
```rust
// Endpoint created via SDK (User-Agent check) →
let source = if user_agent.contains("hooksniff-sdk") { "sdk" } else { "dashboard" };
crate::analytics::capture(
    "webhook_endpoint_created",
    &user_id,
    vec![("source", source)],
);
```

### 9.4 Polar.sh → PostHog Entegrasyonu

Polar.sh webhook'ları gelir event'lerini PostHog'a göndermek için kullanılır.

**Yeni dosya: `api/src/routes/polar_webhooks.rs`**

```rust
//! Polar.sh webhook handler — forwards revenue events to PostHog.
//!
//! Polar.sh sends webhooks for subscription lifecycle events.
//! We capture these as PostHog events for revenue analytics.

use axum::Json;
use serde::Deserialize;
use crate::analytics;

#[derive(Debug, Deserialize)]
pub struct PolarWebhookPayload {
    pub event_type: String,
    pub data: serde_json::Value,
}

/// Handle Polar.sh webhook → forward to PostHog.
pub async fn handle_polar_webhook(
    Json(payload): Json<PolarWebhookPayload>,
) -> &'static str {
    let customer_id = payload.data
        .get("customer_id")
        .and_then(|v| v.as_str())
        .unwrap_or("unknown");

    match payload.event_type.as_str() {
        // Yeni abonelik
        "subscription.created" => {
            let amount = payload.data
                .get("amount")
                .and_then(|v| v.as_i64())
                .unwrap_or(0);
            let plan = payload.data
                .get("product_name")
                .and_then(|v| v.as_str())
                .unwrap_or("unknown");

            analytics::capture(
                "plan_upgraded",
                customer_id,
                vec![
                    ("from_plan", "free"),
                    ("to_plan", plan),
                    ("revenue", &format!("{}", amount as f64 / 100.0)),
                    ("provider", "polar"),
                ],
            );
        }

        // Abonelik yenilendi
        "order.created" => {
            let billing_reason = payload.data
                .get("billing_reason")
                .and_then(|v| v.as_str())
                .unwrap_or("");
            if billing_reason == "subscription_cycle" {
                analytics::capture(
                    "payment_completed",
                    customer_id,
                    vec![("provider", "polar"), ("type", "renewal")],
                );
            }
        }

        // Abonelik iptal edildi
        "subscription.canceled" => {
            analytics::capture(
                "plan_downgraded",
                customer_id,
                vec![
                    ("reason", "user_canceled"),
                    ("provider", "polar"),
                ],
            );
        }

        // Ödeme başarısız
        "subscription.past_due" => {
            analytics::capture(
                "payment_failed",
                customer_id,
                vec![
                    ("error_type", "payment_past_due"),
                    ("provider", "polar"),
                ],
            );
        }

        _ => {}
    }

    "ok"
}
```

**Route kaydı (`main.rs` veya router dosyası):**
```rust
.route("/webhooks/polar", post(polar_webhooks::handle_polar_webhook))
```

### 9.5 Dashboard Entegrasyonu (Next.js)

**`dashboard/src/app/layout.tsx` veya `_app.tsx`:**

```tsx
// PostHog client-side analytics
// npm install posthog-js

'use client';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: 'https://eu.i.posthog.com', // EU region
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
```

**Signup sonrası identify:**
```tsx
// Login/signup response sonrası
posthog.identify(user.id, {
  email: user.email,
  plan: user.plan,
  created_at: user.createdAt,
});
```

**Feature usage tracking:**
```tsx
// Endpoint oluşturulunca
posthog.capture('webhook_endpoint_created', { source: 'dashboard' });

// SDK yüklendiğinde
posthog.capture('sdk_installed', { language: 'nodejs', version: '0.1.0' });
```

---

## 10. Cookie Consent (GDPR)

### 10.1 Neden Zorunlu?

PostHog session replay ve pageview tracking çerez kullanır. EU kullanıcıları için:
- **ePrivacy Directive** — çerez için onay gerekli
- **GDPR Article 6** — açık rıza (consent) gerekli
- **KVKK (Türkiye)** — aynı gereklilikler

### 10.2 Uygulama

**Kütüphane:** `cookie-consent-banner` (lightweight, vanilla JS) veya `react-cookie-consent`

**`dashboard/src/components/CookieConsent.tsx`:**
```tsx
'use client';
import { useState, useEffect } from 'react';
import posthog from 'posthog-js';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setVisible(true);
    if (consent === 'accepted') {
      posthog.opt_in_capturing();
    } else {
      posthog.opt_out_capturing();
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 w-full bg-gray-900 text-white p-4 flex items-center justify-between z-50">
      <p className="text-sm">
        Web sitemizde analitik çerezler kullanıyoruz.{' '}
        <a href="/privacy" className="underline">Gizlilik Politikası</a>
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => {
            localStorage.setItem('cookie_consent', 'rejected');
            posthog.opt_out_capturing();
            setVisible(false);
          }}
          className="px-4 py-2 text-sm border rounded"
        >
          Reddet
        </button>
        <button
          onClick={() => {
            localStorage.setItem('cookie_consent', 'accepted');
            posthog.opt_in_capturing();
            setVisible(false);
          }}
          className="px-4 py-2 text-sm bg-blue-600 rounded"
        >
          Kabul Et
        </button>
      </div>
    </div>
  );
}
```

**PostHog otomatik opt-out:**
PostHog `person_profiles: 'identified_only'` ayarı ile anonim kullanıcılar profiling dışı kalır. Cookie consent reddedilirse `posthog.opt_out_capturing()` hiçbir event göndermez.

---

## 11. Event Sampling Stratejisi

### 11.1 Free Tier Aşım Senaryosu

| Aşama | Events/Ay | Free Tier | Durum |
|-------|-----------|-----------|-------|
| Beta | ~50K | 1M | ✅ Güvende |
| Launch | ~500K | 1M | ✅ Güvende |
| Growth (5K user) | ~2.5M | 1M | ⚠️ 1.5M aşım → ~$75/ay |
| Scale (20K user) | ~10M | 1M | ⚠️ 9M aşım → ~$350/ay |

### 11.2 Sampling Yöntemleri

**Yöntem 1: Event Bazında Sampling (Önerilen)**
```rust
// Her 10 webhook event'inden 1'ini gönder
if rand::random::<f64>() < 0.1 {
    analytics::capture("webhook_sent", &user_id, properties);
}
```

**Yöntem 2: Kullanıcı Bazında Sampling**
```rust
// Sadece %50 kullanıcının event'lerini gönder
let should_track = hash_user_id(&user_id) % 2 == 0;
if should_track {
    analytics::capture("webhook_sent", &user_id, properties);
}
```

**Yöntem 3: Tier-Based Sampling**
```rust
// Tier 1 event'ler her zaman, Tier 2/3 sampling
match event_tier {
    Tier::Critical => analytics::capture(...),  // her zaman
    Tier::Feature if rand::random::<f64>() < 0.5 => analytics::capture(...),  // %50
    Tier::Engagement if rand::random::<f64>() < 0.2 => analytics::capture(...),  // %20
    _ => {}
}
```

**Önerilen Yaklaşım:**
- **Tier 1 (Critical):** %100 gönder — signup, payment, webhook_sent bunlar zaten düşük frekanslı
- **Tier 2 (Feature):** %50 gönder — feature usage event'leri yüksek hacimli olabilir
- **Tier 3 (Engagement):** %20 gönder — pageview, doc view gibi yüksek hacimli

### 11.3 Billing Limit

PostHog'da **billing limit** ayarlanabilir:
1. PostHog Dashboard → Settings → Billing
2. Her ürün için aylık üst limit belirle
3. Limit aşılınca event'ler dropped (silinmez, sadece işlenmez)

**Önerilen limitler:**
| Ürün | Başlangıç Limiti |
|------|-----------------|
| Analytics | 2M events/ay |
| Session Replay | 10K recordings/ay |
| Feature Flags | 2M requests/ay |
| Error Tracking | 200K exceptions/ay |

---

## 12. Dashboard Layout (PostHog Insights)

### 12.1 Ana Dashboard

PostHog'da oluşturulacak insight'lar:

**Row 1 — KPI Cards:**
```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│   DAU    │   WAU    │   MAU    │   MRR    │  Churn   │
│   45     │   180    │   620    │  $145    │   2.1%   │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

**Row 2 — Funnel (Signup → Activation):**
```
user_signed_up → api_key_created → webhook_endpoint_created → webhook_sent
    100%             72%                 58%                    45%
```
PostHog: Insight → Funnel → 4 step ekle

**Row 3 — Retention Cohort:**
```
Week 0: 100% │ Week 1: 48% │ Week 2: 35% │ Week 4: 22%
```
PostHog: Insight → Retention → "user_signed_up" event, weekly

**Row 4 — Feature Usage (Bar Chart):**
```
Webhook Delivery  ████████████████████ 89%
SDK Integration   ██████████████       67%
Schema Registry   ███████              34%
Replay            ███                  12%
Alerts            ██                    8%
```
PostHog: Insight → Trend → breakdown by event name

**Row 5 — Revenue Trend (Line Chart):**
```
MRR over time — $0 → $29 → $145 → ...
```
PostHog: Insight → Trend → "plan_upgraded" event, sum of "revenue" property

### 12.2 Dashboard Embed

Dashboard'a PostHog insight embed etmek için:
```tsx
// dashboard/src/app/analytics/page.tsx
export default function AnalyticsPage() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* PostHog embed — iframe ile */}
      <iframe
        src={`https://eu.posthog.com/shared/${INSIGHT_ID}?token=${SHARING_TOKEN}`}
        className="w-full h-96 border rounded"
      />
    </div>
  );
}
```

### 12.3 Haftalık Review Checklist

Her pazartesi 30 dakika:
1. ✅ DAU/WAU trendi — artış mı azalma mı?
2. ✅ Funnel completion — hangi adımda drop-off?
3. ✅ Retention cohort — hangi hafta en fazla churn?
4. ✅ Feature adoption — hangi feature kullanılmıyor?
5. ✅ Revenue trend — MRR artıyor mu?
6. ✅ Error rate — spike var mı?
7. ✅ Top error types — en sık hata ne?

---

## 13. Entegrasyon Diyagramı

```
┌─────────────────────────────────────────────────────────────┐
│                    HookSniff Sistemi                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│  │ Dashboard │    │   API    │    │  Worker  │               │
│  │ (Next.js) │    │ (Axum)   │    │ (Rust)   │               │
│  └────┬─────┘    └────┬─────┘    └──────────┘               │
│       │               │                                      │
│       │ posthog-js    │ posthog-rs                           │
│       │               │                                      │
│  ┌────▼───────────────▼──────────────────┐                   │
│  │          PostHog Cloud (EU)            │                   │
│  │  ┌───────────┐ ┌──────────┐ ┌───────┐ │                   │
│  │  │ Analytics  │ │  Replay  │ │ Flags │ │                   │
│  │  └───────────┘ └──────────┘ └───────┘ │                   │
│  │  ┌───────────┐ ┌──────────┐           │                   │
│  │  │   Error   │ │ Surveys  │           │                   │
│  │  │ Tracking  │ │  (NPS)   │           │                   │
│  │  └───────────┘ └──────────┘           │                   │
│  └────────────────────────────────────────┘                   │
│                                                              │
│  ┌──────────┐                                               │
│  │Polar.sh  │──webhook──→ /webhooks/polar ──→ PostHog       │
│  │ (Billing)│            (revenue events)                    │
│  └──────────┘                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```
