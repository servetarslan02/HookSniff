# HookSniff — Feature Flags Stratejisi

> Oluşturma: 2026-05-10
> Son güncelleme: 2026-05-10
> Durum: Taslak
> Öncelik: 🟢 Lansman sonrası
> Kaynaklar: Flagsmith Blog 2026 (✅ tam sayfa doğrulanmış), Unleash Pricing (✅ doğrulanmış), PostHog Pricing (✅ doğrulanmış), OpenFeature Spec (✅ doğrulanmış)

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

| Araç | Açık Kaynak | Self-hosted | Free Tier | Başlangıç | OpenFeature | Dil Desteği | GitHub Stars |
|------|------------|-------------|-----------|-----------|-------------|-------------|-------------|
| **PostHog** | ✅ MIT | ✅ | ✅ 1M flag calls/ay | $0 (PAYG) | ⚠️ Partial | JS, Python, Ruby, Node, Go, PHP | 25K+ |
| **Unleash** | ✅ Apache 2 | ✅ | ✅ Sınırsız (self-host) | $75/seat/cloud | ⚠️ Limited | Node, Go, Java, Python, Ruby, .NET | 12.7K |
| **Flagsmith** | ✅ BSD-3 | ✅ | ✅ 50K req/ay | $45/mo | ✅ Founding member | Go, Java, JS, .NET, Python, React, Rust | 6K |
| **LaunchDarkly** | ❌ | ❌ | ✅ 5 conn, 1K MAU | $12/mo | ✅ Multi-language | 15+ dil | — |
| **GrowthBook** | ✅ MIT | ✅ | ✅ 3 users | $20/user/mo | ✅ Multi-language | JS, Python, Ruby, Go, PHP, Java | 6K+ |
| **ConfigCat** | ❌ (SDK OSS) | ❌ | ✅ 10 flags | $110/mo | ✅ Good support | 12+ dil | — |
| **FeatBit** | ✅ MIT | ✅ | ✅ Cloud free | $49.90/mo | ❌ | JS, Python, Go, Java, .NET | 1.6K |
| **Flipt** | ✅ GPL | ✅ | ✅ Sınırsız | — | ✅ | Go, Python, JS | 4.6K |
| **Flagr** | ✅ Apache | ✅ | ✅ Sınırsız | — | ❌ | Go, Python, Java, Ruby | 2.5K |
| **flagd** | ✅ Apache | ✅ | ✅ Sınırsız | — | ✅ Reference impl | Go, JS, Java, Python | 779 |

### Fiyat Karşılaştırması (Aylık — 100K Flag Evaluations)

| Araç | Free Tier | Maliyet (100K eval) | Not |
|------|-----------|-------------------|-----|
| PostHog | 1M calls/ay | $0 | Analytics + flags birlikte |
| Unleash (self-host) | Sınırsız | $0 (sunucu maliyeti ~$5-10) | Docker ile çalışır |
| Flagsmith | 50K req | $45/mo (50K-1M arası) | SaaS veya self-host |
| LaunchDarkly | 1K MAU | $12+/mo | Pahalı, enterprise odaklı |
| GrowthBook | 3 users | $0 (self-host) | A/B test odaklı |
| ConfigCat | 10 flags | $110/mo | Basit ama pahalı |

### Puanlama (HookSniff İhtiyaçlarına Göre)

| Kriter | Ağırlık | PostHog | Unleash | Flagsmith | LaunchDarkly | GrowthBook |
|--------|---------|---------|---------|-----------|-------------|------------|
| Free tier | %25 | 10/10 | 10/10 | 7/10 | 5/10 | 9/10 |
| Self-host | %20 | 10/10 | 10/10 | 10/10 | 0/10 | 10/10 |
| Rust SDK | %15 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 |
| Next.js desteği | %10 | 10/10 | 8/10 | 9/10 | 10/10 | 9/10 |
| Analytics entegre | %15 | 10/10 | 3/10 | 3/10 | 5/10 | 8/10 |
| Kolaylık | %10 | 9/10 | 7/10 | 8/10 | 8/10 | 7/10 |
| OpenFeature | %5 | 5/10 | 5/10 | 10/10 | 10/10 | 10/10 |
| **Toplam** | **100%** | **7.6** | **6.8** | **6.6** | **4.6** | **7.8** |

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

**API (Rust) — PostHog HTTP API:**

```rust
// src/feature_flags/posthog.rs
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeatureFlagResponse {
    pub feature_flags: Vec<String>,
    pub feature_flag_payloads: serde_json::Value,
}

pub struct PostHogClient {
    client: Client,
    api_key: String,
    host: String,
    cache: Arc<RwLock<Option<(FeatureFlagResponse, std::time::Instant)>>>,
    cache_ttl: std::time::Duration,
}

impl PostHogClient {
    pub fn new(api_key: String, host: Option<String>) -> Self {
        Self {
            client: Client::new(),
            api_key,
            host: host.unwrap_or_else(|| "https://us.i.posthog.com".to_string()),
            cache: Arc::new(RwLock::new(None)),
            cache_ttl: std::time::Duration::from_secs(60),
        }
    }

    pub async fn get_flags(&self, distinct_id: &str) -> Result<FeatureFlagResponse, reqwest::Error> {
        // Cache kontrolü
        {
            let cache = self.cache.read().await;
            if let Some((ref data, time)) = *cache {
                if time.elapsed() < self.cache_ttl {
                    return Ok(data.clone());
                }
            }
        }

        let url = format!("{}/decide?v=2", self.host);
        let response = self.client
            .post(&url)
            .json(&serde_json::json!({
                "api_key": self.api_key,
                "distinct_id": distinct_id,
                "groups": {},
            }))
            .send()
            .await?
            .json::<FeatureFlagResponse>()
            .await?;

        // Cache güncelle
        {
            let mut cache = self.cache.write().await;
            *cache = Some((response.clone(), std::time::Instant::now()));
        }

        Ok(response)
    }

    pub async fn is_enabled(&self, distinct_id: &str, flag_key: &str) -> bool {
        match self.get_flags(distinct_id).await {
            Ok(flags) => flags.feature_flags.contains(&flag_key.to_string()),
            Err(_) => false, // Hata durumunda flag kapalı (fail-safe)
        }
    }
}
```

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
// src/feature_flags/flipt.rs
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

    pub async fn kill_switch_active(&self) -> bool {
        self.is_enabled("kill_switch", "system", None).await
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

use std::sync::Arc;

pub struct FeatureFlagService {
    posthog: Arc<posthog::PostHogClient>,
    flipt: Arc<flipt::FliptClient>,
}

impl FeatureFlagService {
    pub fn new(
        posthog_key: String,
        posthog_host: Option<String>,
        flipt_host: String,
    ) -> Self {
        Self {
            posthog: Arc::new(posthog::PostHogClient::new(posthog_key, posthog_host)),
            flipt: Arc::new(flipt::FliptClient::new(flipt_host)),
        }
    }

    /// Product flag kontrolü (PostHog)
    pub async fn is_product_flag_enabled(&self, user_id: &str, flag_key: &str) -> bool {
        self.posthog.is_enabled(user_id, flag_key).await
    }

    /// Ops flag kontrolü (Flipt)
    pub async fn is_ops_flag_enabled(&self, flag_key: &str) -> bool {
        self.flipt.is_enabled(flag_key, "system", None).await
    }

    /// Kill switch kontrolü — fail-safe: bağlantı hatası = true (kapat)
    pub async fn is_kill_switch_active(&self) -> bool {
        self.flipt.kill_switch_active().await
    }

    /// Feature flag ile gradual rollout
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

        // 2. PostHog flag kontrolü
        if self.is_product_flag_enabled(user_id, flag_key).await {
            return true;
        }

        // 3. Fallback: percentage-based rollout
        let hash = format!("{}:{}", user_id, flag_key);
        let hash_value = md5::compute(hash.as_bytes());
        let bucket = (hash_value.0[0] as u32) * 100 / 256;
        bucket < default_percentage
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

#### GitHub Actions Workflow

```yaml
# .github/workflows/feature-flags-test.yml
name: Feature Flags Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      flipt:
        image: flipt/flipt:latest
        ports:
          - 8080:8080
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - run: cargo test feature_flags
      - run: cargo test --test feature_flags_integration
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

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| PostHog downtime | Düşük | Yüksek | Flipt fallback, cache |
| Flag drift (unutulan flag) | Orta | Düşük | Haftalık flag review |
| Flag çakışması | Düşük | Yüksek | Namespace ayrımı |
| Cache stale data | Orta | Düşük | 60s TTL, manual refresh |
| Kill switch yanlış kullanım | Düşük | Kritik | Onay mekanizması, audit log |
| Vendor lock-in | Düşük | Orta | OpenFeature standardı |
| Debug flag production'da açık kalır | Orta | Yüksek | Auto-expire, audit |

### Azaltma Stratejileri

1. **Kill switch koruması:** İki-step onay (toggle + confirm)
2. **Flag TTL:** Otomatik expire (30 gün max)
3. **Audit log:** Tüm flag değişiklikleri loglanır
4. **Haftalık review:** Aktif flag'lerin gözden geçirilmesi
5. **Stale flag alerting:** 30+ gün kullanılmayan flag'ler uyarı

---

## 11. Bütçe

### Maliyet Analizi (Aylık)

| Araç | Maliyet | Not |
|------|---------|-----|
| PostHog Cloud Free | $0 | 1M flag calls/ay, 15K events |
| Flipt (self-hosted) | ~$5-10 | GCP Cloud Run veya Compute Engine |
| **Toplam** | **~$5-10/ay** | |

### Bütçe Karşılaştırması

| Yaklaşım | Maliyet/ay | HookSniff Uygunluğu |
|----------|-----------|-------------------|
| PostHog Cloud Free + Flipt | $5-10 | ✅ Mükemmel |
| LaunchDarkly Free | $0 (sınırlı) | ⚠️ 5 connection, 1K MAU |
| Flagsmith SaaS | $0-45 | 🟡 50K req limit |
| Unleash Self-host | ~$5-10 | 🟡 Rust SDK yok |
| GrowthBook Self-host | ~$5-10 | 🟡 A/B odaklı |

### Büyüme Maliyeti (10K Kullanıcı)

| Araç | 10K Kullanıcı | 100K Kullanıcı |
|------|--------------|---------------|
| PostHog Cloud | $0 (free tier) | ~$450/mo (PAYG) |
| PostHog Self-host | ~$20/mo | ~$100/mo |
| Flipt Self-host | ~$5/mo | ~$10/mo |
| **Toplam** | **~$25/mo** | **~$110/mo** |

---

## 12. Notlar

### Servet İçin Özet

Feature flags = güvenli deploy + A/B test + acil durum kontrolü.

**Ne yapılacak:**
1. PostHog kurulacak (zaten analytics'te planlanıyor — ikisi bir arada)
2. Flipt kurulacak (ops flags + kill switch)
3. Dashboard'da PostHog SDK ile feature flags
4. API'de Flipt client ile ops flags
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
- Flipt Neon DB'yi kullanabilir (mevcut PostgreSQL altyapısı)
- Dashboard Vercel'de → PostHog Edge Config ile edge-side evaluation
- API Cloud Run'da → Flipt sidecar veya ayrı service
- Worker → Flipt client ile delivery enable/disable

---

## Kaynaklar

- Flagsmith Blog "Top 7 Feature Flag Tools 2026" (✅ tam sayfa doğrulanmış)
- Unleash Pricing & Comparison (✅ doğrulanmış)
- PostHog Pricing (✅ posthog.com/pricing doğrulanmış)
- OpenFeature Specification (✅ openfeature.dev doğrulanmış)
- GrowthBook Pricing (✅ growthbook.com/pricing doğrulanmış)
- ConfigCat Pricing (✅ configcat.com doğrulanmış)
- LaunchDarkly Free Tier (✅ launchdarkly.com doğrulanmış)
- Flipt GitHub (✅ github.com/flipt-io/flipt doğrulanmış)
