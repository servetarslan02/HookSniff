# HookSniff — Analytics & Tracking Stratejisi
> Oluşturma: 2026-05-10
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
- **Grafana Cloud** OTEL token tespit edildi (⚠️ GitHub'da public — acil revoke)
- **Dashboard** Vercel'de canlı — temel pageview tracking yok
- **API** Cloud Run'da — structured logging mevcut ama event tracking yok
- **Kullanıcı davranış analizi** yok — hangi feature kullanılıyor bilinmiyor
- **Funnel tracking** yok — signup → activate → pay akışı ölçülmüyor
- **Cohort analysis** yok

### Eksiklikler
| Alan | Durum | Öncelik |
|------|-------|---------|
| Product analytics (PostHog/Mixpanel) | ❌ Yok | 🔴 Kritik |
| Event tracking planı | ❌ Yok | 🔴 Kritik |
| Funnel visualization | ❌ Yok | 🔴 Kritik |
| Cohort analysis | ❌ Yok | 🟡 Orta |
| Session replay | ❌ Yok | 🟡 Orta |
| Feature usage tracking | ❌ Yok | 🔴 Kritik |
| Error tracking (Sentry) | ❌ Yok | 🔴 Kritik |
| Revenue tracking | ❌ Yok | 🔴 Kritik |

---

## 2. Rakip Karşılaştırması

| Özellik | Svix | Hookdeck | Hook0 | HookSniff (Bugün) | HookSniff (Hedef) |
|---------|------|----------|-------|--------------------|--------------------|
| Product analytics | Mixpanel | Amplitude | PostHog | ❌ | PostHog |
| Event tracking | ✅ 50+ event | ✅ 30+ event | ✅ 20+ event | ❌ | ✅ 40+ event |
| Funnel tracking | ✅ | ✅ | ❌ | ❌ | ✅ |
| Cohort analysis | ✅ | ✅ | ❌ | ❌ | ✅ |
| Session replay | Hotjar | FullStory | ❌ | ❌ | PostHog |
| Error tracking | Sentry | Sentry | Sentry | ❌ | Sentry |
| Revenue tracking | Stripe MRR | ChartMogul | ❌ | ❌ | Polar.sh + PostHog |

### Rakip Yaklaşımları
- **Svix**: Mixpanel + Hotjar + Sentry üçlüsü. Her webhook event'i için tracking.
- **Hookdeck**: Amplitude ile deep funnel analysis. FullStory ile user journey mapping.
- **Hook0**: PostHog self-hosted. Minimal ama yeterli.

---

## 3. Standart/Best Practice

### SaaS Analytics Stack (2025-2026 Best Practices)

**Minimum Viable Analytics Stack:**
1. **Product Analytics**: PostHog (open-source, self-hostable, generous free tier)
2. **Error Tracking**: Sentry (free tier: 5K events/month)
3. **Session Replay**: PostHog built-in (veya LogRocket)
4. **Revenue Analytics**: Polar.sh dashboard + PostHog revenue events

**Event Naming Convention (Best Practice):**
```
{object}_{action}_{context}
Örnek: webhook_created_dashboard
Örnek: sdk_installed_nodejs
Örnek: plan_upgraded_pro
```

**Pirate Metrics (AARRR) Framework:**
| Aşama | Metrik | Tool |
|-------|--------|------|
| Acquisition | Signup source, channel | PostHog UTM tracking |
| Activation | First webhook sent, SDK installed | PostHog events |
| Retention | Weekly active webhooks | PostHog retention |
| Revenue | MRR, ARPU, churn | Polar.sh + PostHog |
| Referral | Invite sent, referral conversion | PostHog custom events |

**Event Taxonomy Standards:**
- **Identify** events: user signup, profile update
- **Track** events: feature usage, errors, upgrades
- **Group** events: team/workspace actions
- **Page** events: pageview, section view

---

## 4. Strateji

### 4.1 Analytics Platform Seçimi: PostHog

**Neden PostHog?**
- ✅ Open-source — self-hosted option
- ✅ Free tier: 1M events/ay (yeterli lansman dönemi)
- ✅ Product analytics + session replay + feature flags tek platformda
- ✅ EU hosting option (GDPR uyumlu)
- ✅ Rust SDK mevcut (HookSniff Rust tabanlı)
- ✅ Polar.sh ile entegrasyon mümkün
- ✅ Dashboard'a embed edilebilir

**Alternatifler Değerlendirildi:**
| Platform | Artı | Eksi | Karar |
|----------|------|------|-------|
| PostHog | Open-source, generous free | Self-host karmaşık olabilir | ✅ Seçildi |
| Mixpanel | Powerful funnels | Pahalı, proprietary | ❌ |
| Amplitude | Enterprise features | Free tier sınırlı | ❌ |
| Plausible | Privacy-first | Product analytics yok | ❌ |
| Umami | Self-hosted, simple | Feature eksik | ❌ |

### 4.2 Event Tracking Planı

**Tier 1 — Kritik Events (Lansmandan önce):**
```
user_signed_up          → {source, plan, utm_source, utm_medium}
user_verified_email     → {method}
api_key_created         → {key_type}
webhook_endpoint_created → {source_dashboard, source_sdk}
webhook_sent            → {status, latency_ms, destination_url}
webhook_failed          → {error_type, retry_count}
sdk_installed           → {language, version}
plan_upgraded           → {from_plan, to_plan, revenue}
plan_downgraded         → {from_plan, to_plan, reason}
payment_completed       → {amount, currency, provider}
payment_failed          → {error_type, amount}
```

**Tier 2 — Feature Events (İlk hafta):**
```
schema_created          → {schema_type}
replay_triggered        → {webhook_id, time_range}
alert_created           → {alert_type, threshold}
team_member_invited     → {role}
integration_connected   → {integration_type}
dashboard_section_viewed → {section_name}
filter_applied          → {filter_type, filter_value}
```

**Tier 3 — Engagement Events (İlk ay):**
```
documentation_viewed    → {doc_page, time_spent}
api_reference_viewed    → {endpoint}
changelog_viewed        → {version}
support_ticket_created  → {category, priority}
feedback_submitted      → {rating, comment}
```

### 4.3 User Identification Strategy

```javascript
// PostHog identify call
posthog.identify(user.id, {
  email: user.email,
  plan: user.plan,
  created_at: user.createdAt,
  webhook_count: user.webhookCount,
  sdk_language: user.primarySdk,
  company_size: user.companySize,
  source: user.signupSource
});
```

### 4.4 Funnel Tanımları

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
4. schema_created
Hedef: %40+ SDK → active webhooks
```

### 4.5 Dashboard Entegrasyonu

**PostHog Dashboard Layout:**
```
┌─────────────────────────────────────────────────┐
│  HookSniff — Product Analytics                  │
├─────────────────────────────────────────────────┤
│  [KPI Cards]                                    │
│  DAU | WAU | MAU | MRR | Churn Rate             │
├─────────────────────────────────────────────────┤
│  [Funnel: Signup → Activation]                  │
│  ████████████░░░░ 62%                           │
├─────────────────────────────────────────────────┤
│  [Retention Cohort Table]                       │
│  Week 0: 100% → Week 1: 45% → Week 4: 28%      │
├─────────────────────────────────────────────────┤
│  [Top Features by Usage]                        │
│  1. Webhook Delivery (89%)                      │
│  2. SDK Integration (67%)                       │
│  3. Schema Registry (34%)                       │
│  4. Replay (12%)                                │
└─────────────────────────────────────────────────┘
```

---

## 5. Uygulama Planı

### Faz 1: Kurulum (Gün 1-2)
| Adım | Süre | Detay |
|------|------|-------|
| PostHog Cloud hesabı oluştur | 15 dk | posthog.com, EU region seç |
| PostHog project key al | 5 dk | Settings → Project |
| Rust SDK entegrasyonu | 2 saat | `posthog-rs` crate, API middleware |
| Dashboard'a PostHog snippet ekle | 30 dk | Next.js _app.tsx |
| User identify middleware | 1 saat | Signup/login sonrası identify |

### Faz 2: Core Events (Gün 3-5)
| Adım | Süre | Detay |
|------|------|-------|
| Tier 1 events ekle | 4 saat | 11 kritik event |
| Funnel tanımları oluştur | 1 saat | PostHog UI'da 3 funnel |
| Retention tablosu oluştur | 30 dk | PostHog UI'da |
| Test et | 2 saat | Tüm event'lerin doğru gittiğini doğrula |

### Faz 3: Advanced (Gün 6-10)
| Adım | Süre | Detay |
|------|------|-------|
| Tier 2 events ekle | 3 saat | Feature tracking |
| Session replay aktif et | 30 dk | PostHog settings |
| Cohort tanımları | 1 saat | Power users, at-risk, churned |
| Dashboard'a PostHog insight embed | 2 saat | Next.js iframe/dynamic |

### Faz 4: Optimization (Gün 11-30)
| Adım | Süre | Detay |
|------|------|-------|
| Tier 3 events ekle | 2 saat | Engagement tracking |
| A/B test framework kur | 2 saat | PostHog feature flags |
| Alert tanımları | 1 saat | Churn spike, error rate |
| Haftalık analytics review | Devam | Her pazartesi 30 dk |

---

## 6. Metrikler

### KPI Tanımları

| KPI | Tanım | Hedef | Ölçüm |
|-----|-------|-------|-------|
| **Activation Rate** | Signup sonrası ilk webhook gönderenler | %60+ | PostHog funnel |
| **DAU/MAU Ratio** | Günlük aktif / Aylık aktif | %25+ | PostHog retention |
| **Feature Adoption** | En az 2 feature kullananlar | %40+ | PostHog feature usage |
| **Time to First Webhook** | Signup → İlk webhook süresi | <10 dk | PostHog funnel timing |
| **SDK Install Rate** | SDK yükleyen kullanıcılar | %35+ | PostHog funnel |
| **Week 1 Retention** | 1. hafta geri dönenler | %45+ | PostHog cohort |
| **Week 4 Retention** | 4. hafta geri dönenler | %25+ | PostHog cohort |

### Monitoring Dashboard

**Günlük Kontrol (5 dk):**
- DAU trendi
- Error rate
- Signup → activation funnel

**Haftalık Review (30 dk):**
- Cohort retention
- Feature adoption changes
- Funnel drop-off analizi

**Aylık Review (1 saat):**
- MRR trendi
- Churn analizi
- A/B test sonuçları

---

## 7. Riskler

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| PostHog free tier aşımı | Düşük | Orta | Event sampling, batch processing |
| GDPR uyumsuzluk | Düşük | Yüksek | EU region, cookie consent, DPA |
| Event spam/abuse | Orta | Düşük | Rate limiting, anomaly detection |
| Analytics overhead (latency) | Düşük | Düşük | Async event sending, queue |
| Veri doğruluğu sorunları | Orta | Orta | Validation, deduplication |
| PostHog downtime | Düşük | Düşük | Local queue, retry logic |

### GDPR Uyumluluk Checklist
- [ ] PostHog EU region seç
- [ ] Cookie consent banner ekle
- [ ] PostHog DPA imzala
- [ ] Data retention policy tanımla (90 gün)
- [ ] User data export/delete endpoint
- [ ] IP anonymization aktif et
- [ ] opt-out mechanism

---

## 8. Notlar

### Maliyet Tahmini
| Aşama | Events/Ay | Maliyet |
|-------|-----------|---------|
| Beta (0-100 user) | ~50K | $0 (free tier) |
| Launch (100-1K user) | ~500K | $0 (free tier) |
| Growth (1K-10K user) | ~5M | ~$300/ay |
| Scale (10K+ user) | ~50M | ~$1K/ay |

### Entegrasyon Öncelikleri
1. **Polar.sh** → Revenue events (MRR, churn, upgrade)
2. **Vercel** → Web vitals, page performance
3. **Sentry** → Error correlation with user behavior
4. **Discord** → Community engagement metrics

### Kaynaklar
- PostHog Docs: https://posthog.com/docs
- PostHog Rust SDK: https://posthog.com/docs/libraries/rust
- SaaS Metrics Guide: https://posthog.com/blog/saas-metrics
