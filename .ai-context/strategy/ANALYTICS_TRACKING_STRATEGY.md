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
- Svix Pricing: https://www.svix.com/pricing/ (doğrulandı 2026-05-10)
- Hookdeck Pricing: https://hookdeck.com/pricing (doğrulandı 2026-05-10)
