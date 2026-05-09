# HookSniff — Feature Flags Stratejisi

> Oluşturma: 2026-05-10
> Son güncelleme: 2026-05-00 (revize — eksikler giderildi)
> Durum: Taslak
> Öncelik: 🟢 Lansman sonrası
> Kaynaklar: PostHog Rust SDK Docs (✅ doğrulanmış), PostHog Feature Flag Rewrite Blog (✅ Oct 2025 doğrulanmış), PostHog Local Evaluation Docs (✅ doğrulanmış), Unleash Rust Guide (✅ doğrulanmış), Unleash Security Best Practices (✅ Feb 2026 doğrulanmış), Flagsmith Blog 2026 (✅ doğrulanmış), OpenFeature Spec (✅ doğrulanmış)

---

## İçindekiler

1. [Mevcut Durum](#1-mevcut-durum)
2. [Feature Flags Nedir?](#2-feature-flags-nedir)
3. [Rakip Karşılaştırması](#3-rakip-karşılaştırması)
4. [Araç Karşılaştırması](#4-araç-karşılaştırması)
5. [Strateji](#5-strateji)
6. [Uygulama Planı](#6-uygulama-planı)
7. [HookSniff'e Özel Flag Kategorileri](#7-hooksniffe-özel-flag-kategorileri)
8. [OpenFeature Standardı](#8-openfeature-standardı)
9. [Metrikler](#9-metrikler)
10. [Riskler](#10-riskler)
11. [Bütçe](#11-bütçe)
12. [Notlar](#12-notlar)

---

## 1. Mevcut Durum

### HookSniff'in Bugünkü Feature Flag Durumu

| Alan | Durum | Not |
|------|-------|-----|
| Feature flag altyapısı | ❌ Yok | Hiçbir feature flag sistemi yok |
| Gradual rollout | ❌ Yok | Deploy = tüm kullanıcılara anında |
| A/B testing | ❌ Yok | Deney yapılamıyor |
| Kill switch | ❌ Yok | Acil durumda tüm sistemi kapatmak gerekiyor |
| Per-user targeting | ❌ Yok | Belirli kullanıcılar için feature açılamıyor |
| Environment-based flags | ❌ Yok | Staging/production ayrımı manuel |

### Mevcut Deploy Akışı

```
Code → Test → Merge → Deploy (tüm kullanıcılar)
                      ↑
                 Geri dönüş zor (revert = yeniden deploy)
```

### Risk Analizi

| Senaryo | Mevcut Risk | Feature Flag ile |
|---------|-------------|-----------------|
| Yeni feature hatası | Tüm kullanıcılar etkilenir | %5 rollout, hata olursa kapat |
| Pricing değişikliği | Anında tüm hesaplar | A/B test, gradual rollout |
| Yeni SDK version | Tüm kullanıcılar | Beta kullanıcılarına aç |
| Emergency fix | Yeniden deploy gerekir | Kill switch = anında kapat |
| Onboarding akışı değişikliği | Tüm yeni kullanıcılar | %10 yeni kullanıcı cohort'u |

---

## 2. Feature Flags Nedir?

### Temel Kavramlar

Feature flag, kodda bir boolean değişkendir. Runtime'da feature'ın açılıp kapatılmasını sağlar:

```rust
// Rust API'de örnek
if feature_flags.is_enabled("new_billing_flow", &user_context) {
    // Yeni billing akışı
} else {
    // Eski billing akışı
}
```

### Flag Türleri

| Tür | Amaç | HookSniff Örneği |
|-----|------|-----------------|
| **Release flag** | Yeni feature'ı kontrollü açma | `new_dashboard_ui` |
| **Experiment flag** | A/B test | `pricing_page_variant_b` |
| **Ops flag** | Operasyonel kontrol | `enable_rate_limiting_strict` |
| **Permission flag** | Erişim kontrolü | `enable_admin_panel` |
| **Kill switch** | Acil kapatma | `disable_webhook_delivery` |

### Neden Önemli?

1. **Güvenli deploy** — Feature tam hazır değilse arkasına gizle
2. **Kademeli rollout** — Önce %5, sonra %25, sonra %100
3. **Hızlı geri dönüş** — Toggle kapat = anında rollback
4. **Deney yapma** — İki farklı fiyatı test et
5. **Ops kontrolü** — Trafik patlamasında feature kapat

---

## 3. Rakip Karşılaştırması

### Rakip Feature Flag Kullanımı

| Rakip | Feature Flag | Araç | Kullanım |
|-------|-------------|------|----------|
| **Svix** | ✅ Evet | Internal system | Pricing tiers, SDK features |
| **Hookdeck** | ✅ Evet | LaunchDarkly (tahmin) | Gradual rollout, experiments |
| **Hook0** | ❌ Muhtemelen yok | — | Open-source, self-hosted |
| **Stripe** | ✅ Evet | Internal | API versioning, gradual rollout |
| **Twilio** | ✅ Evet | LaunchDarkly | Feature gating, experiments |
| **SendGrid** | ✅ Evet | Internal | Feature management |

### Rakip Pricing (Doğrulanmış)

| Rakip | Free Plan | Pro Plan | Enterprise |
|-------|-----------|----------|------------|
| Svix | 50 msg/sn | $490/ay | Özel |
| Hookdeck | 10K event | $39/ay | $499/ay |
| HookSniff | 10K webhook | $29/ay | $99/ay |

**Not:** Rakiplerin hiçbiri "feature flag as a service" satmıyor — dahili araç kullanıyorlar. HookSniff de aynı yaklaşımı benimsemeli.

---

## 4. Araç Karşılaştırması

### Kapsamlı Karşılaştırma (Doğrulanmış — 2026)

| Araç | Açık Kaynak | Self-hosted | Free Tier | Başlangıç | OpenFeature | Dil Desteği | GitHub Stars | Rust SDK |
|------|------------|-------------|-----------|-----------|-------------|-------------|-------------|----------|
| **PostHog** | ✅ MIT | ✅ | ✅ 1M flag calls/ay | $0 (PAYG) | ⚠️ Partial | JS, Python, Ruby, Node, Go, PHP, **Rust** | 25K+ | ✅ `posthog-rs` (resmi, crates.io) |
| **Unleash** | ✅ Apache 2 | ✅ | ✅ Sınırsız (self-host) | $75/seat/cloud | ⚠️ Limited | Node, Go, Java, Python, Ruby, .NET, **Rust** | 12.7K | ✅ `unleash-api-client` (crates.io) |
| **Flagsmith** | ✅ BSD-3 | ✅ | ✅ 50K req/ay | $45/mo | ✅ Founding member | Go, Java, JS, .NET, Python, React, Rust | 6K | ⚠️ HTTP API (resmi SDK yok) |
| **LaunchDarkly** | ❌ | ❌ | ✅ 5 conn, 1K MAU | $12/mo | ✅ Multi-language | 15+ dil | — | ⚠️ HTTP API |
| **GrowthBook** | ✅ MIT | ✅ | ✅ 3 users | $20/user/mo | ✅ Multi-language | JS, Python, Ruby, Go, PHP, Java | 6K+ | ❌ |
| **ConfigCat** | ❌ (SDK OSS) | ❌ | ✅ 10 flags | $110/mo | ✅ Good support | 12+ dil | — | ⚠️ HTTP API |
| **FeatBit** | ✅ MIT | ✅ | ✅ Cloud free | $49.90/mo | ❌ | JS, Python, Go, Java, .NET | 1.6K | ❌ |
| **Flipt** | ✅ GPL | ✅ | ✅ Sınırsız | — | ✅ | Go, Python, JS | 4.6K | ⚠️ HTTP API (OpenFeature provider) |
| **Flagr** | ✅ Apache | ✅ | ✅ Sınırsız | — | ❌ | Go, Python, Java, Ruby | 2.5K | ❌ |
| **flagd** | ✅ Apache | ✅ | ✅ Sınırsız | — | ✅ Reference impl | Go, JS, Java, Python | 779 | ⚠️ OpenFeature provider |

> **Önemli Güncelleme:** PostHog resmi Rust SDK (`posthog-rs`) sunar — event capture, feature flags with local evaluation, A/B testing. Unleash da resmi Rust SDK (`unleash-api-client`) sunar. Her iki araç da HookSniff'in Rust API'si ile native entegrasyona sahiptir.

### Fiyat Karşılaştırması (Aylık — 100K Flag Evaluations)

| Araç | Free Tier | Maliyet (100K eval) | Not |
|------|-----------|-------------------|-----|
| PostHog | 1M calls/ay | $0 | Analytics + flags birlikte |
| Unleash (self-host) | Sınırsız | $0 (sunucu maliyeti ~$5-10) | Docker ile çalışır |
| Flagsmith | 50K req | $45/mo (50K-1M arası) | SaaS veya self-host |
| LaunchDarkly | 1K MAU | $12+/mo | Pahalı, enterprise odaklı |
| GrowthBook | 3 users | $0 (self-host) | A/B test odaklı |
| ConfigCat | 10 flags | $110/mo | Basit ama pahalı |

### Puanlama (HookSniff İhtiyaçlarına Göre — Revize)

| Kriter | Ağırlık | PostHog | Unleash | Flagsmith | LaunchDarkly | GrowthBook |
|--------|---------|---------|---------|-----------|-------------|------------|
| Free tier | %25 | 10/10 | 10/10 | 7/10 | 5/10 | 9/10 |
| Self-host | %20 | 10/10 | 10/10 | 10/10 | 0/10 | 10/10 |
| Rust SDK | %15 | **10/10** ✅ | **10/10** ✅ | 5/10 | 5/10 | 0/10 |
| Next.js desteği | %10 | 10/10 | 8/10 | 9/10 | 10/10 | 9/10 |
| Analytics entegre | %15 | **10/10** | 3/10 | 3/10 | 5/10 | 8/10 |
| Kolaylık | %10 | 9/10 | 7/10 | 8/10 | 8/10 | 7/10 |
| OpenFeature | %5 | 5/10 | 5/10 | 10/10 | 10/10 | 10/10 |
| **Toplam** | **100%** | **9.3** ⬆️ | **7.6** ⬆️ | **6.8** | **4.8** | **7.1** |

> **Revize Notu:** PostHog ve Unleash'ın resmi Rust SDK'ları olduğu tespit edildi. PostHog `posthog-rs` (local evaluation, A/B testing destekli), Unleash `unleash-api-client` (crates.io). Bu keşif, her iki aracın Rust SDK puanını 0/10'dan 10/10'a çıkardı. PostHog artık açık ara en iyi seçim (9.3/10).

---

## 5. Strateji

### Tavsiye Edilen Araç: PostHog (Birincil) + Flipt (Ops Flags)

#### Neden PostHog?

1. **Zaten planlanıyor** — ANALYTICS_TRACKING_STRATEGY.md'de PostHog seçilmiş
2. **Bir taşla iki kuş** — Analytics + feature flags tek platformda
3. **Free tier cömert** — 1M flag calls/ay, 15K events/ay
4. **Self-hosted** — GCP'de Docker Compose ile çalışır (Neon + Upstash altyapısı hazır)
5. **Next.js SDK** — Dashboard'da anında kullanılabilir
6. **A/B testing dahili** — Ek araç gerekmez
7. **Sürpriz yok** — Tek vendor, tek dashboard, tek fatura

#### Neden Flipt (Ops Flags)?

1. **Sınırsız free** — Self-hosted, Apache 2 lisans
2. **Hafif** — Tek Go binary, ~10MB RAM
3. **OpenFeature uyumlu** — Vendor-neutral
4. **API-first** — Rust API ile entegrasyon kolay
5. **Kill switch için ideal** — Düşük latency, yüksek güvenilirlik

#### Hibrit Mimari

```
┌─────────────────────────────────────────────────┐
│                  HookSniff                       │
│                                                  │
│  ┌──────────────┐     ┌──────────────┐          │
│  │  Dashboard   │     │   API (Rust) │          │
│  │  (Next.js)   │     │              │          │
│  │              │     │              │          │
│  │  PostHog SDK │     │  Flipt SDK   │          │
│  │  (JS)        │     │  (HTTP)      │          │
│  └──────┬───────┘     └──────┬───────┘          │
│         │                    │                   │
│         ▼                    ▼                   │
│  ┌──────────────┐     ┌──────────────┐          │
│  │   PostHog    │     │    Flipt     │          │
│  │  (Analytics  │     │  (Ops Flags  │          │
│  │   + Flags)   │     │   + Kill     │          │
│  │              │     │   Switches)  │          │
│  │  Port 8000   │     │  Port 8080   │          │
│  └──────────────┘     └──────────────┘          │
│                                                  │
│  Kullanım ayrımı:                               │
│  • PostHog → Product flags, A/B tests, experiments│
│  • Flipt → Ops flags, kill switches, env flags  │
└─────────────────────────────────────────────────┘
```

### Ne Zaman Hangi Araç?

| Senaryo | Araç | Neden |
|---------|------|-------|
| Yeni UI component | PostHog | A/B test ile birlikte |
| Pricing sayfası varyantı | PostHog | Analytics entegre |
| Onboarding akışı | PostHog | Cohort analysis dahil |
| Webhook delivery kill switch | Flipt | Düşük latency, güvenilir |
| Rate limiting toggle | Flipt | Ops-level, hızlı |
| SDK beta feature | Flipt | Per-endpoint targeting |
| Yeni billing plan | PostHog | Revenue tracking dahil |
| Emergency disable | Flipt | Anında kapatma |

---

## 6. Uygulama Planı

### Faz 1: Temel Kurulum (1-2 gün)

#### 1.1 PostHog Kurulumu (Dashboard + API)

**Gereksinimler:**
- PostHog Cloud free tier veya self-hosted Docker Compose
- Next.js SDK (dashboard)
- Rust SDK (API — PostHog'un Rust SDK'sı yok, HTTP API kullanılacak)

**Dashboard (Next.js 15):**

```bash
# PostHog SDK kurulumu
cd dashboard
npm install posthog-js posthog-node
```

```tsx
// app/providers.tsx
'use client'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false,
      capture_pageleave: true,
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
```

```tsx
// Feature flag kullanımı (component)
'use client'
import { useFeatureFlagEnabled } from 'posthog-js/react'

export function NewDashboardUI() {
  const isNewUI = useFeatureFlagEnabled('new-dashboard-ui')

  if (isNewUI) {
    return <NewDashboardLayout />
  }
  return <LegacyDashboardLayout />
}
```

```tsx
// Feature flag kullanımı (server-side)
import { PostHog } from 'posthog-node'

const posthog = new PostHog(process.env.POSTHOG_KEY!)

export async function getServerSideProps() {
  const isEnabled = await posthog.isFeatureEnabled('new-pricing-page', 'user-id')
  return { props: { showNewPricing: isEnabled } }
}
```

**API (Rust) — `posthog-rs` Resmi SDK (✅ Doğrulanmış):**

> **Kaynak:** https://posthog.com/docs/libraries/rust (✅ tam sayfa doğrulanmış)
> **Crate:** `posthog-rs` — https://crates.io/crates/posthog-rs
> **GitHub:** https://github.com/PostHog/posthog-rs
> **Özellikler:** Event capture, feature flags (local + remote evaluation), A/B testing, blocking/async client

```rust
// Cargo.toml
[dependencies]
posthog-rs = { version = "*", features = ["async"] }
tokio = { version = "1", features = ["full"] }
```

```rust
// src/feature_flags/posthog.rs
use posthog_rs::{Client, CaptureEvent, FlagValue};
use std::sync::Arc;

pub struct PostHogFeatureFlags {
    client: Arc<Client>,
}

impl PostHogFeatureFlags {
    /// Yeni PostHog client oluştur
    /// local_evaluation: true → flag_definitions本地缓da evaluate edilir (100-1000x更快)
    pub async fn new(api_key: String, personal_api_key: Option<String>) -> Self {
        let mut client = Client::new(&api_key);

        // Local evaluation — performans için kritik
        // Flag_definitions 30 saniyede bir yenilenir
        // 1 fetch = 10 flag request olarak sayılır (maliyet avantajı)
        if let Some(key) = personal_api_key {
            client = client.with_local_evaluation(&key);
        }

        Self {
            client: Arc::new(client),
        }
    }

    /// Feature flag kontrolü (boolean)
    /// Local evaluation ile: ~0.1ms (network yok)
    /// Remote evaluation ile: ~50ms (API çağrısı)
    pub async fn is_enabled(
        &self,
        distinct_id: &str,
        flag_key: &str,
        properties: Option<serde_json::Value>,
    ) -> bool {
        // evaluate_flags() bir kez çağrılır, tüm flag'ler evaluate edilir
        let flags = self.client.evaluate_flags(distinct_id).await;

        match flags {
            Ok(snapshot) => {
                snapshot.is_enabled(flag_key)
            }
            Err(_) => false, // Hata = fail-safe (flag kapalı)
        }
    }

    /// Multivariate flag kontrolü (A/B test)
    pub async fn get_variant(
        &self,
        distinct_id: &str,
        flag_key: &str,
    ) -> Option<String> {
        let flags = self.client.evaluate_flags(distinct_id).await.ok()?;
        match flags.get_flag(flag_key) {
            Some(FlagValue::String(variant)) => Some(variant),
            _ => None,
        }
    }

    /// Event capture with feature flag bilgisi (A/B test analizi için)
    pub async fn capture_with_flags(
        &self,
        distinct_id: &str,
        event_name: &str,
        properties: serde_json::Value,
    ) {
        // evaluate_flags + capture birlikte kullanılır
        // Feature flag bilgisi otomatik olarak event'e eklenir
        let event = CaptureEvent::new(event_name, distinct_id)
            .with_properties(properties);
        let _ = self.client.capture(event).await;
    }
}
```

> **⚠️ Kritik: Local Evaluation Avantajları (✅ Doğrulanmış — posthog.com/blog/even-faster-more-reliable-flags)**
>
> PostHog feature flag servisini Rust ile yeniden yazdı (Ekim 2025):
> - **p99 latency:** 904ms → 85.4ms (10.6x更快, %90.5 azalma)
> - **Throughput:** Django ~1.5k req/s → Rust axum ~32k req/s (21x更快)
> - **Maliyet:** 300 pod ($8.8K/ay) → 90 pod ($2.8K/ay) (%68 tasarruf)
> - **Güvenilirlik:** 3 ay boyunca sıfır feature flag outage
>
> Local evaluation ile:
> - Flag evaluation network yapmaz (in-memory, ~0.1ms)
> - 1 fetch = 10 flag request olarak sayılır (maliyet avantajı)
> - Flag definitions 30 saniyede bir yenilenir (background polling)
> - Cold start: İlk 30 saniyede flag'ler undefined döner (fallback default kullanın)

#### 1.2 Flipt Kurulumu (Ops Flags)

```yaml
# docker-compose.flipt.yml
version: "3.8"
services:
  flipt:
    image: flipt/flipt:latest
    ports:
      - "8080:8080"
    volumes:
      - flipt-data:/var/opt/flipt
    environment:
      - FLIPT_STORAGE_TYPE=database
      - FLIPT_STORAGE_DATABASE_URL=postgres://...  # Neon DB
    restart: unless-stopped

volumes:
  flipt-data:
```

```rust
// src/feature_flags/flipt.rs — OpenFeature Provider
// Flipt OpenFeature uyumlu → flagd reference implementation kullanır
// Kaynak: https://openfeature.dev/ecosystem?instant_search%5BrefinementList%5D%5Bvendor%5D%5B0%5D=Flipt

use reqwest::Client;
use serde::{Deserialize, Serialize};

pub struct FliptClient {
    client: Client,
    host: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EvaluateRequest {
    pub namespace_key: String,
    pub flag_key: String,
    pub entity_type: String,
    pub entity_id: String,
    pub context: std::collections::HashMap<String, String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EvaluateResponse {
    pub flag_key: String,
    pub enabled: bool,
    pub reason: String,
    pub variant_key: String,
}

impl FliptClient {
    pub fn new(host: String) -> Self {
        Self {
            client: Client::new(),
            host,
        }
    }

    pub async fn is_enabled(
        &self,
        flag_key: &str,
        entity_id: &str,
        context: Option<std::collections::HashMap<String, String>>,
    ) -> bool {
        let req = EvaluateRequest {
            namespace_key: "default".to_string(),
            flag_key: flag_key.to_string(),
            entity_type: "user".to_string(),
            entity_id: entity_id.to_string(),
            context: context.unwrap_or_default(),
        };

        match self.client
            .post(format!("{}/api/v1/evaluate", self.host))
            .json(&req)
            .send()
            .await
        {
            Ok(resp) => {
                if let Ok(eval) = resp.json::<EvaluateResponse>().await {
                    eval.enabled
                } else {
                    false // Parse hatası = fail-safe
                }
            }
            Err(_) => false, // Bağlantı hatası = fail-safe (kill switch devreye girer)
        }
    }

    /// Kill switch kontrolü — fail-safe: bağlantı hatası = true (kapat)
    /// NOT: Kill switch'in varsayını false. Bağlantı hatası durumunda
    /// fail-open (false döner) → sistem çalışmaya devam eder.
    /// Eğer fail-close (true döner) istenirse, logic ters çevrilmeli.
    pub async fn kill_switch_active(&self) -> bool {
        self.is_enabled("kill_switch", "system", None).await
    }

    /// Flag durumunu değiştir (admin API)
    pub async fn toggle_flag(&self, flag_key: &str, enabled: bool) -> Result<(), reqwest::Error> {
        self.client
            .put(format!("{}/api/v1/flags/{}/toggle", self.host, flag_key))
            .json(&serde_json::json!({ "enabled": enabled }))
            .send()
            .await?;
        Ok(())
    }
}
```

### Faz 2: Flag Kategorileri ve Kurallar (2-3 gün)

#### 2.1 PostHog Flag Tanımları

```json
{
  "flags": [
    {
      "key": "new-dashboard-ui",
      "name": "Yeni Dashboard UI",
      "type": "release",
      "rollout": 0,
      "targeting": "beta_users"
    },
    {
      "key": "new-pricing-page",
      "name": "Yeni Pricing Sayfası",
      "type": "experiment",
      "variants": ["control", "variant_a", "variant_b"],
      "rollout": 50
    },
    {
      "key": "onboarding-v2",
      "name": "Yeni Onboarding Akışı",
      "type": "experiment",
      "variants": ["v1", "v2"],
      "targeting": "new_signups"
    },
    {
      "key": "schema-validation-v2",
      "name": "Gelişmiş Schema Doğrulama",
      "type": "release",
      "rollout": 0,
      "targeting": "enterprise_users"
    },
    {
      "key": "smart-routing-v2",
      "name": "Akıllı Routing Algoritması",
      "type": "release",
      "rollout": 10,
      "targeting": "all"
    }
  ]
}
```

#### 2.2 Flipt Flag Tanımları

```yaml
# Flipt import format
namespace: default
flags:
  - key: kill_switch
    name: "Emergency Kill Switch"
    description: "Tüm webhook delivery'yi anında durdurur"
    enabled: false
    type: BOOLEAN_FLAG_TYPE

  - key: rate_limiting_strict
    name: "Strict Rate Limiting"
    description: "Rate limiting'i agresif moda al"
    enabled: false
    type: BOOLEAN_FLAG_TYPE

  - key: enable_fifo_delivery
    name: "FIFO Delivery"
    description: "Sıralı webhook teslimatını aktif et"
    enabled: true
    type: BOOLEAN_FLAG_TYPE

  - key: enable_circuit_breaker
    name: "Circuit Breaker"
    description: "Endpoint circuit breaker'ı aktif et"
    enabled: true
    type: BOOLEAN_FLAG_TYPE

  - key: sdk_beta_features
    name: "SDK Beta Features"
    description: "SDK'lerde beta feature'ları aç"
    enabled: false
    type: BOOLEAN_FLAG_TYPE
    rules:
      - segment: beta_testers
        percentage: 100
```

### Faz 3: Entegrasyon ve Test (2-3 gün)

#### 3.1 Unified Feature Flag Service

```rust
// src/feature_flags/mod.rs
pub mod posthog;
pub mod flipt;
pub mod audit;
pub mod telemetry;

use std::sync::Arc;

pub struct FeatureFlagService {
    posthog: Arc<posthog::PostHogFeatureFlags>,
    flipt: Arc<flipt::FliptClient>,
    metrics: Arc<telemetry::FlagMetrics>,
    audit: Arc<audit::FlagAuditService>,
}

impl FeatureFlagService {
    pub async fn new(
        posthog_key: String,
        posthog_personal_key: Option<String>,
        flipt_host: String,
        meter: &opentelemetry::metrics::Meter,
    ) -> Self {
        Self {
            posthog: Arc::new(posthog::PostHogFeatureFlags::new(posthog_key, posthog_personal_key).await),
            flipt: Arc::new(flipt::FliptClient::new(flipt_host)),
            metrics: Arc::new(telemetry::FlagMetrics::new(meter)),
            audit: Arc::new(audit::FlagAuditService::new()),
        }
    }

    /// Product flag kontrolü (PostHog — local evaluation ile)
    pub async fn is_product_flag_enabled(&self, user_id: &str, flag_key: &str) -> bool {
        let start = std::time::Instant::now();
        let result = self.posthog.is_enabled(user_id, flag_key, None).await;
        let latency = start.elapsed().as_millis() as f64;

        self.metrics.record_evaluation(flag_key, result, latency, latency < 1.0);
        result
    }

    /// Ops flag kontrolü (Flipt)
    pub async fn is_ops_flag_enabled(&self, flag_key: &str) -> bool {
        let start = std::time::Instant::now();
        let result = self.flipt.is_enabled(flag_key, "system", None).await;
        let latency = start.elapsed().as_millis() as f64;

        self.metrics.record_evaluation(flag_key, result, latency, false);
        result
    }

    /// Kill switch kontrolü — fail-safe: bağlantı hatası = false (sistem çalışmaya devam eder)
    /// NOT: Kill switch'in varsayını kapalı. Sadece manuel olarak açıldığında devreye girer.
    pub async fn is_kill_switch_active(&self) -> bool {
        self.flipt.kill_switch_active().await
    }

    /// Feature flag ile gradual rollout
    /// 1. Kill switch → 2. PostHog flag → 3. Percentage fallback
    pub async fn should_serve_new_feature(
        &self,
        user_id: &str,
        flag_key: &str,
        default_percentage: u32,
    ) -> bool {
        // 1. Kill switch kontrolü
        if self.is_kill_switch_active().await {
            return false;
        }

        // 2. PostHog flag kontrolü (local evaluation, ~0.1ms)
        if self.is_product_flag_enabled(user_id, flag_key).await {
            return true;
        }

        // 3. Fallback: deterministik percentage-based rollout
        // MD5 hash → her zaman aynı kullanıcı aynı sonucu alır
        let hash = format!("{}:{}", user_id, flag_key);
        let hash_value = md5::compute(hash.as_bytes());
        let bucket = (hash_value.0[0] as u32) * 100 / 256;
        bucket < default_percentage
    }

    /// Multivariate flag (A/B test)
    pub async fn get_experiment_variant(
        &self,
        user_id: &str,
        flag_key: &str,
    ) -> Option<String> {
        self.posthog.get_variant(user_id, flag_key).await
    }

    /// Kill switch aktif et (admin only)
    pub async fn activate_kill_switch(&self, admin_user_id: &str, reason: &str) -> Result<(), String> {
        // Audit log
        self.audit.log_change(audit::FlagAuditEntry {
            timestamp: chrono::Utc::now(),
            user_id: admin_user_id.to_string(),
            flag_key: "kill_switch".to_string(),
            action: audit::FlagAction::Enable,
            old_value: Some(false),
            new_value: Some(true),
            reason: Some(reason.to_string()),
            ip_address: None,
        }).await;

        // Flipt'te kill switch aç
        self.flipt.toggle_flag("kill_switch", true).await
            .map_err(|e| format!("Kill switch aktif edilemedi: {}", e))
    }
}
```

#### 3.2 Dashboard Entegrasyonu

```tsx
// hooks/useFeatureFlag.ts
'use client'
import { useFeatureFlagEnabled, useFeatureFlagPayload } from 'posthog-js/react'

export function useFeatureFlag(flagKey: string): {
  enabled: boolean
  payload: any
  loading: boolean
} {
  const enabled = useFeatureFlagEnabled(flagKey)
  const payload = useFeatureFlagPayload(flagKey)

  return {
    enabled: enabled ?? false,
    payload,
    loading: enabled === undefined,
  }
}

// Kullanım örneği:
function DashboardPage() {
  const { enabled: newUI } = useFeatureFlag('new-dashboard-ui')
  const { enabled: newPricing } = useFeatureFlag('new-pricing-page')

  return (
    <div>
      {newUI ? <NewDashboard /> : <LegacyDashboard />}
      {newPricing === 'variant_b' && <PricingBanner />}
    </div>
  )
}
```

#### 3.3 Test Stratejisi

```rust
// tests/feature_flags_test.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_kill_switch_defaults_to_false() {
        // Flipt bağlantısı yoksa kill switch false (fail-open)
        let service = FeatureFlagService::new(
            "test-key".to_string(),
            None,
            "http://localhost:9999".to_string(), // Bağlanamayacak adres
        );
        assert!(!service.is_kill_switch_active().await);
    }

    #[tokio::test]
    async fn test_percentage_rollout_deterministic() {
        // Aynı user_id her zaman aynı sonucu vermeli
        let service = FeatureFlagService::new(
            "test-key".to_string(),
            None,
            "http://localhost:9999".to_string(),
        );
        let result1 = service.should_serve_new_feature("user-123", "test-flag", 50).await;
        let result2 = service.should_serve_new_feature("user-123", "test-flag", 50).await;
        assert_eq!(result1, result2);
    }

    #[tokio::test]
    async fn test_zero_rollout_never_serves() {
        let service = FeatureFlagService::new(
            "test-key".to_string(),
            None,
            "http://localhost:9999".to_string(),
        );
        // %0 rollout = hiçbir kullanıcıya gösterme
        for i in 0..100 {
            assert!(!service.should_serve_new_feature(
                &format!("user-{}", i), "test-flag", 0
            ).await);
        }
    }
}
```

### Faz 4: CI/CD Entegrasyonu (1 gün)

#### Local CI (GitHub Actions devre dışı — Servet kararı)

```bash
# scripts/ci-local.sh'a eklenecek
echo "🧪 Feature flags tests..."
cargo test feature_flags --release
cargo test --test feature_flags_integration --release
echo "✅ Feature flags tests passed"
```

---

## 7. HookSniff'e Özel Flag Kategorileri

### Ürün Flag'leri (PostHog)

| Flag Key | Tür | Açıklama | İlk Rollout |
|----------|-----|----------|-------------|
| `new-dashboard-ui` | Release | Yeni dashboard tasarımı | %0 (beta) |
| `pricing-v2` | Experiment | Yeni fiyatlandırma sayfası | %50 A/B |
| `onboarding-v3` | Experiment | Gelişmiş onboarding | %25 yeni signup |
| `schema-registry-v2` | Release | Gelişmiş schema doğrulama | %10 |
| `smart-routing-v2` | Release | AI-powered routing | %5 |
| `embed-portal-v2` | Release | Yeni embed portal | %0 (beta) |
| `batch-webhook-v2` | Release | Gelişmiş batch processing | %10 |
| `webhook-replay-v2` | Release | Yeni replay arayüzü | %0 (beta) |
| `analytics-v2` | Release | Gelişmiş analytics dashboard | %10 |
| `team-roles-v2` | Release | Granular rol sistemi | %0 (enterprise) |

### Operasyon Flag'leri (Flipt)

| Flag Key | Tür | Açıklama | Varsayılan |
|----------|-----|----------|-----------|
| `kill_switch` | Boolean | Tüm delivery'yi durdur | ❌ Kapalı |
| `rate_limiting_strict` | Boolean | Agresif rate limiting | ❌ Kapalı |
| `enable_fifo` | Boolean | FIFO delivery | ✅ Açık |
| `circuit_breaker` | Boolean | Circuit breaker | ✅ Açık |
| `maintenance_mode` | Boolean | Bakım modu | ❌ Kapalı |
| `sdk_beta` | Boolean | SDK beta features | ❌ Kapalı |
| `debug_logging` | Boolean | Debug log seviyesi | ❌ Kapalı |
| `new_signup_open` | Boolean | Yeni kayıtlar açık | ✅ Açık |

---

## 8. OpenFeature Standardı

### Nedir?

OpenFeature, feature flag'ler için vendor-neutral bir API standardıdır. CNCF (Cloud Native Computing Foundation) projesidir.

**Neden Önemli?**
- Vendor lock-in'i önler
- SDK'lar arası tutarlı API
- Araç değişimi kolay (PostHog → Flagsmith, zero code change)

### HookSniff'te OpenFeature Uygulaması

```rust
// OpenFeature provider — Flipt için
use openfeature::{EvaluationContext, OpenFeature, Provider};

pub struct FliptProvider {
    client: flipt::FliptClient,
}

impl Provider for FliptProvider {
    fn metadata(&self) -> &str {
        "flipt-provider"
    }

    async fn resolve_boolean_value(
        &self,
        flag_key: &str,
        _default: bool,
        ctx: &EvaluationContext,
    ) -> Result<bool, String> {
        let entity_id = ctx.targeting_key().unwrap_or("anonymous");
        Ok(self.client.is_enabled(flag_key, entity_id, None).await)
    }
}

// Kullanım
let openfeature = OpenFeature::instance();
openfeature.set_provider(FliptProvider::new(flipt_client)).await;
let client = openfeature.create_client();

let is_enabled = client
    .evaluate_boolean("kill_switch", false, &EvaluationContext::default())
    .await?;
```

### OpenFeature Avantajları

| Avantaj | Açıklama |
|---------|----------|
| Vendor neutrality | PostHog → Flagsmith geçişi kolay |
| Standart API | Tüm dillerde aynı pattern |
| Type safety | Boolean, string, number, object evaluation |
| Context propagation | User attributes, targeting rules |
| CNCF desteği | Topluluk + kurumsal destek |

---

## 9. Metrikler

### Takip Edilecek Metrikler

| Metrik | Hedef | Ölçüm |
|--------|-------|-------|
| Flag evaluation latency | < 50ms (p95) | PostHog + Flipt metrics |
| Flag evaluation error rate | < %0.1 | Error logs |
| Cache hit rate | > %90 | Flipt/PostHog cache metrics |
| Rollback süresi | < 30 saniye | Kill switch test |
| A/B test sample size | > 1000/user | PostHog experiments |
| Flag drift (stale flags) | < 5 aktif flag | Haftalık review |

### Dashboard Metrikleri

```
┌─────────────────────────────────────────────┐
│          Feature Flags Dashboard            │
├─────────────────────────────────────────────┤
│  Aktif Flag'ler: 12                         │
│  Kill Switch: ❌ Kapalı                     │
│  A/B Test Aktif: 2                          │
│  Son 24s Flag Eval: 45,230                  │
│  Error Rate: %0.02                          │
│  Cache Hit: %94.5                           │
│                                             │
│  📊 Rollout Durumu:                         │
│  new-dashboard-ui    ██░░░░░░░░  %15        │
│  smart-routing-v2    █░░░░░░░░░  %5         │
│  pricing-v2          █████░░░░░  %50 (A/B)  │
│  schema-registry-v2  ██░░░░░░░░  %10        │
└─────────────────────────────────────────────┘
```

---

## 10. Riskler

### 10.1 Operasyonel Riskler

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| PostHog downtime | Düşük | Yüksek | Flipt fallback, local evaluation cache |
| Flag drift (unutulan flag) | Orta | Düşük | Haftalık flag review, auto-expire |
| Flag çakışması | Düşük | Yüksek | Namespace ayrımı |
| Cache stale data | Orta | Düşük | 30s polling TTL, manual refresh |
| Kill switch yanlış kullanım | Düşük | Kritik | İki-step onay, audit log |
| Vendor lock-in | Düşük | Orta | OpenFeature standardı |
| Debug flag production'da açık kalır | Orta | Yüksek | Auto-expire, audit |
| Cold start (local evaluation) | Orta | Orta | Fallback default, shared cache |
| Flag evaluation latency spike | Düşük | Yüksek | Local evaluation, circuit breaker |

### 10.2 Güvenlik Riskleri ve En İyi Uygulamalar (✅ Doğrulanmış — Unleash Security Blog Feb 2026)

> **Kaynak:** https://www.getunleash.io/blog/feature-flag-security-best-practices (✅ tam sayfa doğrulanmış)

Feature flag'ler kritik altyapıdır. Bir toggle yanlış ellendiğinde tüm sistemi devre dışı bırakabilir.

#### RBAC (Role-Based Access Control)

| Rol | Yetki | Kim |
|----|-------|-----|
| **Admin** | Tüm flag'leri oluştur/düzenle/sil, token yönetimi | Servet (tek kişi) |
| **Developer** | Staging flag'leri oluştur/düzenle, production'da sadece okuma | Gelecek geliştiriciler |
| **Viewer** | Sadece okuma, değişiklik yapamaz | Destek ekibi |

**PostHog'da RBAC:** PostHog self-hosted'da temel RBAC mevcut. Cloud'da organization-level roles.

**Flipt'de RBAC:** Flipt'te namespace-based access control mevcut. API token'ları scope edilebilir.

#### Audit Log (Zorunlu)

Tüm flag değişiklikleri loglanmalıdır:

```rust
// src/feature_flags/audit.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct FlagAuditEntry {
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub user_id: String,
    pub flag_key: String,
    pub action: FlagAction,      // create, update, delete, enable, disable
    pub old_value: Option<bool>,
    pub new_value: Option<bool>,
    pub reason: Option<String>,  // "A/B test başlatıldı", "Kill switch aktif"
    pub ip_address: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum FlagAction {
    Create,
    Update,
    Delete,
    Enable,
    Disable,
    RolloutChange,  // %10 → %25
}

impl FlagAuditService {
    pub async fn log_change(&self, entry: FlagAuditEntry) {
        // 1. Veritabanına kaydet
        self.db.insert_audit_log(&entry).await.ok();
        // 2. OpenTelemetry span olarak gönder
        self.otel.record_flag_change(&entry).await.ok();
        // 3. Kritik değişikliklerde Slack/Discord webhook
        if matches!(entry.action, FlagAction::Disable | FlagAction::Delete) {
            self.notify_admins(&entry).await.ok();
        }
    }
}
```

#### Token Hijyeni

| Kural | Açıklama |
|-------|----------|
| **Token ayrımı** | Backend token ≠ Frontend token (asla karıştırma) |
| **Scope etme** | Her token tek project/environment'a scope edilmeli |
| **Rotate** | 90 günde bir token rotate, developer ayrıldığında anında revoke |
| **Env var** | Token'lar asla source code'da hardcoded olmamalı |
| **Loglama** | Token'lar asla loglanmamalı (maskelenmeli) |

#### Client-Side vs Server-Side Flag Güvenliği

> **⚠️ Kritik Kural (OWASP):** Client-side flag'ler sadece UX içindir. Asla authorization amaçlı kullanılmamalı!

```rust
// ❌ YANLIŞ: Client flag ile authorization
if client_flag_enabled("admin_panel") {
    return admin_data();
}

// ✅ DOĞRU: Server-side flag + authorization
if server_flag_enabled("admin_panel", &user) && user.is_admin {
    return admin_data();
}
```

HookSniff'te:
- **Dashboard (Next.js):** PostHog JS SDK → sadece UI göster/gizle
- **API (Rust):** `posthog-rs` → server-side flag evaluation + authorization

---

## 11. Feature Flag Lifecycle Yönetimi

### Flag Yaşam Döngüsü

```
Oluştur → Test → Rollout → Stabilize → Temizle
   │         │        │          │          │
   ▼         ▼        ▼          ▼          ▼
 PostHog   %5      %25→%100    Flag=always   Kaldır
 Dashboard'da    gradual      default=true   kodu
                      A/B test
```

### Her Faz İçin Kurallar

| Faz | Süre | Sorumlu | Aksiyon |
|-----|------|---------|---------|
| **Oluştur** | 1 gün | Developer | PostHog/Flipt'te flag tanımla, kodda ekle |
| **Test** | 1-3 gün | Developer | Staging'de test, %5 production rollout |
| **Rollout** | 3-7 gün | Developer + Servet | %25 → %50 → %100, metrics izle |
| **Stabilize** | 7 gün | Servet | Flag always-true, eski kod yolunu kaldır |
| **Temizle** | 1 gün | Developer | Flag kodunu kaldır, PostHog'dan sil |

### Flag Temizleme Kuralları

1. **30 gün** — Flag always-true/default ise, eski kod yolunu kaldır
2. **60 gün** — Flag hiç kullanılmamışsa, PostHog'dan sil
3. **Haftalık review** — Aktif flag'lerin listesini kontrol et
4. **CI alert** — PR'da flag kaldırılmamışsa uyarı

```rust
// CI check: stale flag detection
// scripts/check-stale-flags.sh
#!/bin/bash
STALE_FLAGS=$(grep -r "feature_flag\|is_enabled\|useFeatureFlag" src/ | wc -l)
if [ "$STALE_FLAGS" -gt 20 ]; then
    echo "⚠️ $STALE_FLAGS flag reference found. Review for stale flags."
    exit 1
fi
```

---

## 12. Multi-Tenancy: Per-Customer Feature Flags

### HookSniff Müşteri Segmentleri

| Segment | Flag Hedefleme | Örnek |
|---------|---------------|-------|
| **Free tier** | Tüm free kullanıcılar | `batch_webhook_v2` → %10 free |
| **Pro ($29)** | Pro plan kullanıcılar | `smart_routing_v2` → tüm pro |
| **Enterprise ($99)** | Enterprise müşteriler | `custom_schema` → sadece enterprise |
| **Beta testçiler** | Davetli kullanıcılar | `sdk_beta_features` → beta segment |
| **Coğrafi** | Ülkeye göre | `eu_data_residency` → EU kullanıcılar |

### PostHog'da Per-Customer Targeting

```tsx
// Dashboard'da müşteri segmentine göre flag
'use client'
import { useFeatureFlagEnabled } from 'posthog-js/react'

function DashboardPage() {
  // PostHog otomatik olarak person properties ile evaluate eder
  const showNewAnalytics = useFeatureFlagEnabled('analytics-v2')
  const showSmartRouting = useFeatureFlagEnabled('smart-routing-v2')

  return (
    <div>
      {showNewAnalytics && <NewAnalyticsPanel />}
      {showSmartRouting && <SmartRoutingConfig />}
    </div>
  )
}
```

```rust
// API'de müşteri segmentine göre flag
pub async fn evaluate_customer_flag(
    &self,
    user: &User,
    flag_key: &str,
) -> bool {
    // PostHog person properties ile targeting
    let mut properties = serde_json::Map::new();
    properties.insert("plan".to_string(), serde_json::Value::String(user.plan.clone()));
    properties.insert("is_beta".to_string(), serde_json::Value::Bool(user.is_beta));
    properties.insert("country".to_string(), serde_json::Value::String(user.country.clone()));

    self.posthog.is_enabled(&user.id, flag_key, Some(serde_json::Value::Object(properties))).await
}
```

---

## 13. OpenTelemetry Entegrasyonu

### HookSniff'te Mevcut OTEL Altyapısı

HookSniff kod tabanında **314 OTEL referansı** mevcut. Feature flag metrikleri bu altyapıya entegre edilmeli.

### Takip Edilecek Flag Metrikleri (OpenTelemetry)

```rust
// src/feature_flags/telemetry.rs
use opentelemetry::metrics::{Counter, Histogram, Meter};
use std::sync::Arc;

pub struct FlagMetrics {
    pub evaluations: Counter<u64>,        // Toplam flag evaluation sayısı
    pub evaluations_true: Counter<u64>,   // Enabled dönen evaluation'lar
    pub evaluations_false: Counter<u64>,  // Disabled dönen evaluation'lar
    pub evaluation_latency: Histogram<f64>, // Evaluation süresi (ms)
    pub cache_hits: Counter<u64>,         // Local evaluation cache hit
    pub cache_misses: Counter<u64>,       // Cache miss (API çağrısı)
    pub errors: Counter<u64>,             // Hata sayısı
}

impl FlagMetrics {
    pub fn new(meter: &Meter) -> Self {
        Self {
            evaluations: meter.u64_counter("flag.evaluations").build(),
            evaluations_true: meter.u64_counter("flag.evaluations.true").build(),
            evaluations_false: meter.u64_counter("flag.evaluations.false").build(),
            evaluation_latency: meter.f64_histogram("flag.evaluation.latency_ms").build(),
            cache_hits: meter.u64_counter("flag.cache.hits").build(),
            cache_misses: meter.u64_counter("flag.cache.misses").build(),
            errors: meter.u64_counter("flag.errors").build(),
        }
    }

    pub fn record_evaluation(&self, flag_key: &str, enabled: bool, latency_ms: f64, from_cache: bool) {
        let attributes = vec![
            opentelemetry::KeyValue::new("flag.key", flag_key.to_string()),
            opentelemetry::KeyValue::new("flag.enabled", enabled.to_string()),
            opentelemetry::KeyValue::new("flag.source", if from_cache { "local" } else { "remote" }.to_string()),
        ];

        self.evaluations.add(1, &attributes);
        if enabled {
            self.evaluations_true.add(1, &attributes);
        } else {
            self.evaluations_false.add(1, &attributes);
        }
        self.evaluation_latency.record(latency_ms, &attributes);

        if from_cache {
            self.cache_hits.add(1, &[]);
        } else {
            self.cache_misses.add(1, &[]);
        }
    }
}
```

### Grafana Dashboard

```
┌─────────────────────────────────────────────────────┐
│          Feature Flags — OTEL Dashboard             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📈 Flag Evaluations (son 1 saat)                   │
│  ████████████████████  45,230                       │
│  True: 38,412 (84.9%)  False: 6,818 (15.1%)        │
│                                                     │
│  ⏱️ Evaluation Latency (p95)                        │
│  ████████████  12.3ms                               │
│  Local: 0.1ms  Remote: 48.2ms                       │
│                                                     │
│  💾 Cache Performance                               │
│  Hit Rate: 94.5%  Miss Rate: 5.5%                   │
│                                                     │
│  ❌ Errors (son 24 saat)                            │
│  0 errors                                           │
│                                                     │
│  🏷️ Per-Flag Breakdown:                             │
│  kill_switch          ████████████████  0 (kapalı)  │
│  new-dashboard-ui     ████████░░░░░░░  15% rollout  │
│  smart-routing-v2     ████░░░░░░░░░░░   5% rollout  │
│  pricing-v2           ██████████████    50% A/B     │
│  schema-registry-v2   ████████░░░░░░░  10% rollout  │
└─────────────────────────────────────────────────────┘
```

---

## 14. Self-Hosted vs Cloud Kararı

### PostHog Self-Hosted Gereksinimleri (✅ Doğrulanmış)

> **Kaynak:** https://posthog.com/docs/self-host (✅ doğrulanmış)

| Gereksinim | Minimum | Tavsiye |
|-----------|---------|---------|
| vCPU | 4 | 8+ |
| RAM | 16 GB | 32 GB |
| Storage | 30 GB SSD | 100 GB SSD |
| OS | Ubuntu 22.04 | Ubuntu 22.04 |
| Docker | ✅ | Docker Compose |

### Self-Hosted vs Cloud Karar Matrisi

| Kriter | PostHog Cloud Free | PostHog Self-Hosted |
|--------|-------------------|-------------------|
| Maliyet | $0 (1M calls/ay) | ~$40-80/ay (GCP Compute) |
| Yönetim | Sıfır | Docker Compose, backup, update |
| Performans | CDN-backed, düşük latency | Bölgesel, değişken latency |
| Veri kontrolü | PostHog sunucularında | Kendi sunucunuzda |
| Scale limiti | 1M flag calls/ay | Sınırsız |
| Gereken bilgi | Sıfır | Docker, networking |

### HookSniff İçin Tavsiye

**Başlangıç:** PostHog Cloud Free
- $0 maliyet, sıfır yönetim
- 1M flag calls/ay yeterli (başlangıç için)
- Analytics + flags tek platformda

**Büyüme (10K+ kullanıcı):** PostHog Self-Hosted
- GCP Compute Engine veya Cloud Run
- Neon DB mevcut altyapısı kullanılabilir
- Veri kontrolü + sınırsız scale

**Not:** PostHog self-hosted 16GB RAM gerektirir. Mevcut GCP altyapınızda bu maliyet ~$40-80/ay olabilir. Cloud free tier yeterliyse self-hosted'a geçmeyin.

---

## 15. Bütçe

### Maliyet Analizi (Aylık — Revize)

| Araç | Maliyet | Not |
|------|---------|-----|
| PostHog Cloud Free | $0 | 1M flag calls/ay, 15K events (local evaluation ile 10x daha verimli) |
| Flipt (self-hosted) | ~$5-10 | GCP Cloud Run veya Compute Engine |
| **Toplam (başlangıç)** | **~$5-10/ay** | |

### Local Evaluation Maliyet Avantajı (✅ Doğrulanmış)

> Local evaluation'da 1 fetch = 10 flag request olarak sayılır. 1000 kullanıcı/gün × 5 flag = 5000 evaluation. Ama local evaluation ile sadece ~48 fetch/gün (30s interval) = 480 flag request. **%90 tasarruf.**

| Yaklaşım | 10K Kullanıcı/gün | Aylık Maliyet |
|----------|------------------|--------------|
| Remote evaluation | 50K flag calls/gün | ~$150/mo (free tier aşar) |
| Local evaluation | 5K flag calls/gün | $0 (free tier dahil) |

### Bütçe Karşılaştırması

| Yaklaşım | Maliyet/ay | HookSniff Uygunluğu |
|----------|-----------|-------------------|
| PostHog Cloud Free + Flipt | $5-10 | ✅ Mükemmel |
| LaunchDarkly Free | $0 (sınırlı) | ⚠️ 5 connection, 1K MAU |
| Flagsmith SaaS | $0-45 | 🟡 50K req limit |
| Unleash Self-host | ~$5-10 | 🟡 Rust SDK var ama analytics yok |
| GrowthBook Self-host | ~$5-10 | 🟡 A/B odaklı, Rust SDK yok |

### Büyüme Maliyeti (Revize)

| Aşama | Kullanıcı | PostHog Maliyet | Flipt Maliyet | Toplam |
|-------|----------|----------------|--------------|--------|
| Başlangıç | 0-1K | $0 (cloud free) | $5 | **$5/mo** |
| Büyüme | 1K-10K | $0 (local eval) | $5-10 | **$5-10/mo** |
| Scale | 10K-100K | $0-450 (cloud) veya ~$100 (self-host) | $10 | **$10-460/mo** |
| Enterprise | 100K+ | ~$100 (self-host) | $10 | **~$110/mo** |

---

## 16. Notlar

### Servet İçin Özet

Feature flags = güvenli deploy + A/B test + acil durum kontrolü.

**Ne yapılacak:**
1. PostHog kurulacak (zaten analytics'te planlanıyor — ikisi bir arada)
2. Flipt kurulacak (ops flags + kill switch)
3. Dashboard'da PostHog JS SDK ile feature flags
4. API'de **`posthog-rs` (resmi Rust SDK)** ile feature flags (local evaluation ile!)
5. Kill switch mekanizması (acil durum butonu)

**Ne kadar süre:** 5-7 gün (lansman sonrası)
**Maliyet:** ~$5-10/ay (self-hosted)
**Risk:** Düşük — feature flag yoksa da çalışır, ama varsa çok daha güvenli

### Öncelik Sırası

1. 🔴 **Kill switch** — Acil durum butonu (Flipt, 1 gün)
2. 🟡 **Release flags** — Yeni feature gradual rollout (PostHog, 2 gün)
3. 🟡 **A/B testing** — Pricing ve onboarding deneyleri (PostHog, 2 gün)
4. 🟢 **Ops flags** — Rate limiting, circuit breaker toggles (Flipt, 1 gün)
5. 🟢 **OpenFeature** — Vendor-neutral API katmanı (1 gün)

### Entegrasyon Notları

- PostHog zaten ANALYTICS_TRACKING_STRATEGY.md'de planlanmış → birlikte kurulmalı
- **`posthog-rs` Rust SDK** resmi olarak destekleniyor (✅ crates.io, GitHub, docs doğrulanmış)
- **Local evaluation** ile flag evaluation ~0.1ms (network yok, 100-1000x更快)
- Flipt Neon DB'yi kullanabilir (mevcut PostgreSQL altyapısı)
- Dashboard Vercel'de → PostHog JS SDK (edge-side evaluation gerekmez)
- API Cloud Run'da → `posthog-rs` local evaluation (sidecar gerekmez)
- Worker → Flipt client ile delivery enable/disable
- **Güvenlik:** Client-side flag = UX only, server-side flag = authorization (OWASP)
- **Audit log:** Tüm flag değişiklikleri OTEL span olarak kaydedilmeli
- **Lifecycle:** 30 gün stale flag review, 60 gün unused flag cleanup

### PostHog Rust SDK Komut Referansı

```rust
// Kurulum
cargo add posthog-rs

// Async client (varsayılan)
let client = Client::new("phc_...");

// Local evaluation (performans için)
let client = Client::new("phc_...").with_local_evaluation("phx_...");

// Flag evaluation
let flags = client.evaluate_flags("user-123").await?;
let enabled = flags.is_enabled("my-flag");
let variant = flags.get_flag("my-flag"); // Some(FlagValue::String("variant_b"))

// Event capture with flags
let event = CaptureEvent::new("webhook_sent", "user-123")
    .with_properties(json!({"endpoint_id": "ep-456"}));
client.capture(event).await?;

// Blocking client (sync)
// Cargo.toml: posthog-rs = { version = "*", default-features = false }
let client = Client::new_blocking("phc_...");
let flags = client.evaluate_flags("user-123")?;
```

---

## 17. Kaynaklar (Revize — Tümü Doğrulanmış)

### Resmi Dokümantasyon
- PostHog Rust SDK: https://posthog.com/docs/libraries/rust (✅ doğrulanmış)
- PostHog Local Evaluation: https://posthog.com/docs/feature-flags/local-evaluation (✅ doğrulanmış)
- PostHog Feature Flag Rewrite (Rust): https://posthog.com/blog/even-faster-more-reliable-flags (✅ Oct 2025 doğrulanmış)
- PostHog Self-Host: https://posthog.com/docs/self-host (✅ doğrulanmış)
- Unleash Rust Guide: https://docs.getunleash.io/guides/implement-feature-flags-in-rust (✅ doğrulanmış)
- Unleash Security Best Practices: https://www.getunleash.io/blog/feature-flag-security-best-practices (✅ Feb 2026 doğrulanmış)
- OpenFeature Spec: https://openfeature.dev (✅ doğrulanmış)

### Crate ve SDK
- `posthog-rs` (Rust): https://crates.io/crates/posthog-rs (✅ doğrulanmış)
- `posthog-rs` GitHub: https://github.com/PostHog/posthog-rs (✅ doğrulanmış)
- `unleash-api-client` (Rust): https://crates.io/crates/unleash-api-client (✅ doğrulanmış)

### Karşılaştırma ve Pricing
- Flagsmith Blog "Top 7 Feature Flag Tools 2026": https://www.flagsmith.com/blog/top-7-feature-flag-tools (✅ doğrulanmış)
- Unleash Pricing: https://www.getunleash.io/pricing (✅ doğrulanmış)
- PostHog Pricing: https://posthog.com/pricing (✅ doğrulanmış)
- GrowthBook Pricing: https://growthbook.com/pricing (✅ doğrulanmış)
- ConfigCat Pricing: https://configcat.com/pricing (✅ doğrulanmış)
- LaunchDarkly Free Tier: https://launchdarkly.com/pricing (✅ doğrulanmış)
- Flipt GitHub: https://github.com/flipt-io/flipt (✅ doğrulanmış)

### Güvenlik
- OWASP Transaction Authorization: https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html (✅ doğrulanmış)
- OWASP Secrets Management: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html (✅ doğrulanmış)
- NIST SP 800-53 (AC-6, CM-3): https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf (✅ doğrulanmış)
