# HookSniff — A/B Test Stratejisi

> Oluşturma: 2026-05-10
> Son güncelleme: 2026-05-10 (Doğrulandı)
> Durum: Taslak
> Kaynaklar: Guideflow A/B Testing Tools 2026, InfluenceFlow SaaS Pricing 2026, SaaSFactor Freemium vs Trial 2026, Monetizely Freemium Benchmarks

---

## İçindekiler

1. [Mevcut Durum](#1-mevcut-durum)
2. [Neden A/B Test?](#2-neden-ab-test)
3. [Araç Karşılaştırması](#3-araç-karşılaştırması)
4. [Test Planı — Landing Page](#4-test-planı--landing-page)
5. [Test Planı — Pricing Page](#5-test-planı--pricing-page)
6. [Test Planı — Onboarding](#6-test-planı--onboarding)
7. [Test Planı — Ürün İçi](#7-test-planı--ürün-içi)
8. [İstatistiksel Metodoloji](#8-istatistiksel-metodoloji)
9. [Metrikler](#9-metrikler)
10. [Uygulama Planı](#10-uygulama-planı)

---

## 1. Mevcut Durum

### HookSniff Bugünkü Durum

| Metrik | Değer | Not |
|--------|-------|-----|
| Dashboard | 41 sayfa (Next.js 15) | Vercel'de deploy |
| Landing page | hooksniff.vercel.app | Mevcut |
| Pricing page | Mevcut | $0/$29/$99/Custom |
| Onboarding | Basit kayıt akışı | Email + password |
| Test altyapısı | ❌ Yok | Henüz A/B test yapılmadı |
| Analytics | ❌ Yok | PostHog henüz kurulmadı |
| Conversion tracking | ❌ Yok | Henüz implemente edilmedi |

### Rakiplerin Test Durumu

| Rakip | A/B Test | Araç | Not |
|-------|----------|------|-----|
| Svix | ✅ Aktif | Bilinmiyor | $10.5M funding, $5M revenue — sürekli optimizasyon yapıyorlar |
| Hookdeck | ✅ Aktif | Bilinmiyor | SOC2 Type 2, G2 listelemesi — profesyonel operasyon |
| Stripe | ✅ Aktif | Özel araç | Endüstri lideri CRO |
| HookSniff | ❌ Henüz yok | — | Bu strateji ile başlanacak |

---

## 2. Neden A/B Test?

### Veriye Dayalı Karar Alma

- **%58** şirket hâlâ opinion-based karar alıyor (MarketingLTB 2026)
- **%24** SaaS şirketi pricing'i düzenli olarak test ediyor (Monetizely 2026)
- Pricing page A/B testleri **ortalama %12-18 iyileştirme** sağlıyor (InfluenceFlow 2026)
- Dedicated landing page'ler homepage'den **daha yüksek conversion** sağlıyor (Unbounce 2026)

### HookSniff İçin Neden Kritik?

1. **Fiyatlandırma hassas** — $29 vs $39 vs $49 test etmek geliri doğrudan etkiler
2. **Developer audience** — teknik kullanıcılar farklı tepki verir
3. **Free tier var** — freemium conversion optimization kritik
4. **$0 bütçe** — organik büyümede her %1 conversion artışı değerli

---

## 3. Araç Karşılaştırması

### Doğrulanmış A/B Test Araçları (Guideflow 2026)

| Araç | Fiyat | G2 Puanı | En İyi İçin | HookSniff Uygunluğu |
|------|-------|----------|-------------|---------------------|
| **PostHog** | Free tier | 4.4/5 | Product analytics + testing | ✅ **EN UYGUN** — analytics + A/B test birleşik |
| GrowthBook | Free (open-source) | 4.5/5 | Warehouse-native testing | ✅ İyi — self-hosted seçeneği |
| Statsig | Generous free tier | 4.5/5 | Modern experimentation | ✅ İyi — free tier cömert |
| LaunchDarkly | $75/seat/mo | 4.5/5 | Feature flags + experiments | ❌ Pahalı başlangıç için |
| VWO | $299/mo | 4.3/5 | Visual website testing | ❌ Pahalı |
| Convert | $99/mo | 4.7/5 | Privacy-focused | ❌ Bütçe dışı |
| Split.io | Free tier | 4.5/5 | Release management | 🟡 İyi ama PostHog daha uygun |
| Unbounce | $99/mo | 4.4/5 | Landing page testing | ❌ Pahalı, dar kapsam |
| Optimizely | Custom | 4.3/5 | Enterprise | ❌ Enterprise çözüm |

### Seçim: PostHog

**Neden PostHog?**
1. **Free tier** — 1M events/ay, 15K session recordings/ay
2. **All-in-one** — analytics, session recording, feature flags, A/B test
3. **Developer-friendly** — Rust SDK mevcut, API-first
4. **Self-hosted seçeneği** — veri kontrolü
5. **Funnels + Cohorts** — conversion analizi built-in
6. **Feature flags** — gradual rollout + A/B test birleşik

**Kurulum maliyeti:** $0 (free tier)
**Entegrasyon süresi:** 1-2 gün

### Alternatif: GrowthBook (Open-Source)

Eğer PostHog yetersiz kalırsa:
- Warehouse-native (Neon DB ile direkt çalışır)
- Self-hosted, tam kontrol
- Bayesian statistics built-in
- Ücretsiz

---

## 4. Test Planı — Landing Page

### Test 1: Hero Section Headline

**Hipotez:** "Reliable webhook delivery" yerine daha spesifik bir headline conversion artırır.

| Varyant | Headline | Hipotez |
|---------|----------|---------|
| A (Kontrol) | "Reliable webhook delivery for developers" | Mevcut |
| B | "Send webhooks. We deliver them. If they fail, we retry." | Daha aksiyon odaklı |
| C | "Webhook infrastructure that never drops a message" | Güven odaklı |
| D | "Ship webhooks in 5 minutes, not 5 weeks" | Hız odaklı |

**Metrik:** Signup conversion rate
**Örnek büyüklüğü:** Her varyant için minimum 200 ziyaretçi
**Süre:** 2 hafta

### Test 2: CTA Button

| Varyant | CTA | Renk | Hipotez |
|---------|-----|------|---------|
| A | "Get Started Free" | Mavi | Standart |
| B | "Start Sending Webhooks" | Yeşil | Aksiyon odaklı |
| C | "Try HookSniff Free" | Turuncu | Marka odaklı |
| D | "Deploy in 5 Minutes" | Mor | Hız odaklı |

**Metrik:** Click-through rate → signup
**Örnek büyüklüğü:** Her varyant için minimum 300 ziyaretçi

### Test 3: Social Proof

| Varyant | İçerik | Hipotez |
|---------|--------|---------|
| A | Sosyal proof yok | Kontrol |
| B | "Trusted by X developers" | Genel güven |
| C | Customer logos (Lob, Lithic gibi) | Tanınmış marka etkisi |
| D | "11 SDKs, 1378 tests, 0 downtime" | Teknik güvenilirlik |

**Metrik:** Signup conversion rate
**Süre:** 2 hafta

### Test 4: Hero Visual

| Varyant | Görsel | Hipotez |
|---------|--------|---------|
| A | Kod snippet'i (terminal) | Developer audience |
| B | Dashboard screenshot | Ürün gösterimi |
| C | Animasyonlu webhook flow | Etkileşimli |
| D | Minimal (sadece metin) | Odaklı |

---

## 5. Test Planı — Pricing Page

### Test 5: Fiyat Noktası

**Hipotez:** $29 Pro planı farklı fiyatlarla test etmek optimal fiyatı bulur.

| Varyant | Pro Fiyatı | Business Fiyatı | Hipotez |
|---------|-----------|----------------|---------|
| A (Kontrol) | $29/mo | $99/mo | Mevcut |
| B | $19/mo | $79/mo | Düşük fiyat = daha fazla müşteri |
| C | $39/mo | $129/mo | Yüksek fiyat = daha fazla gelir |
| D | $29/mo (yıllık $19) | $99/mo (yıllık $79) | Yıllık indirim teşviki |

**Metrik:** Plan selection rate + revenue per visitor
**Örnek büyüklüğü:** Her varyant için minimum 100 pricing page ziyaretçisi
**Süre:** 3 hafta

### Test 6: Plan Sayısı ve Kart Tasarımı

| Varyant | Tasarım | Hipotez |
|---------|---------|---------|
| A | 3 plan (Free/Pro/Business) | Standart |
| B | 4 plan (Free/Starter/Pro/Business) | Daha fazla segmentasyon |
| C | 2 plan (Free/Pro) + Enterprise CTA | Basitleştirilmiş |

**Metrik:** Conversion rate + ARPU
**Süre:** 2 hafta

### Test 7: Decoy Effect

**Hipotez:** Orta planı kasıtlı olarak daha az değerli yaparak Business planı satışını artırmak.

| Varyant | Plan Yapısı | Hipotez |
|---------|------------|---------|
| A | Free / Pro ($29) / Business ($99) | Standart |
| B | Free / Pro ($29) / Pro+ ($59, Business'tan az özellik) / Business ($99) | Decoy effect |

Duke Üniversitesi araştırmasına göre (2023), kasıtlı olarak daha az değerli bir orta plan eklemek premium plan satışını %35-50 artırıyor.

**Metrik:** Business plan selection rate
**Süre:** 3 hafta

### Test 8: Pricing Page Layout

| Varyant | Layout | Hipotez |
|---------|--------|---------|
| A | Yatay (3 kart yan yana) | Standart |
| B | Dikey (kartlar üst üste) | Mobil uyumlu |
| C | Öne çıkan plan ile (Business highlighted) | Yönlendirici |

---

## 6. Test Planı — Onboarding

### Test 9: Kayıt Akışı

| Varyant | Akış | Hipotez |
|---------|------|---------|
| A | Email + password | Standart |
| B | Email + magic link | Daha az sürtünme |
| C | GitHub OAuth + email | Developer-friendly |
| D | Sadece email (password sonra) | Minimum sürtünme |

**Metrik:** Registration completion rate
**Örnek büyüklüğü:** Her varyant için minimum 100 kayıt denemesi

### Test 10: Onboarding Steps

| Varyant | Adımlar | Hipotez |
|---------|---------|---------|
| A | Direkt dashboard'a | Minimum sürtünme |
| B | 3 adımlı wizard (endpoint → webhook → test) | Yönlendirilmiş |
| C | Video tutorial + skip seçeneği | Esnek |

**Metrik:** Time to first webhook + 7-day retention
**Süre:** 3 hafta

### Test 11: Free Tier Sınırı

| Varyant | Free Limit | Hipotez |
|---------|-----------|---------|
| A | 10,000 webhook/ay | Mevcut |
| B | 5,000 webhook/ay | Daha erken upgrade tetikleyici |
| C | 1,000 webhook + 7 gün deneme | Trial + freemium hybrid |

**Metrik:** Free-to-paid conversion rate
**Süre:** 4 hafta

---

## 7. Test Planı — Ürün İçi

### Test 12: Upgrade Prompt Yeri

| Varyant | Tetikleyici | Hipotez |
|---------|-----------|---------|
| A | Limit %80'de uyarı | Proaktif |
| B | Limit aşıldığında bloque | Acil durum |
| C | Dashboard'da sürekli banner | Görünür |
| D | Contextual (webhook gönderirken) | Alakalı |

**Metrik:** Upgrade conversion rate
**Süre:** 2 hafta

### Test 13: Feature Gating

| Varyant | Gated Features | Hipotez |
|---------|---------------|---------|
| A | FIFO + Schema Registry gated | Teknik özellik |
| B | Analytics + Retention gated | Değer odaklı |
| C | Rate limit gated | Kullanım odaklı |

**Metrik:** Which feature drives most upgrades
**Süre:** 3 hafta

---

## 8. İstatistiksel Metodoloji

### Güven Aralığı ve Örnek Büyüklüğü

| Parametre | Değer | Not |
|-----------|-------|-----|
| Güven düzeyi | %95 | Standart |
| Statistical power | %80 | Minimum |
| Minimum detectable effect (MDE) | %10 | Relative improvement |
| Test süresi | 2-4 hafta | Trafik hacmine göre |

### Örnek Büküklüğü Hesaplaması

Baz conversion rate: %2 (developer tools freemium benchmark)
MDE: %10 relative (yani %2 → %2.2)

```
n = (Z_α/2 + Z_β)² × (p1(1-p1) + p2(1-p2)) / (p1 - p2)²

n = (1.96 + 0.84)² × (0.02×0.98 + 0.022×0.978) / (0.002)²
n ≈ 7,840 per variant
```

**Pratik sonuç:** HookSniff'in trafiği düşük başlayacağı için:
- İlk aşamada **larger MDE (%25-50)** kullan — daha büyük etkileri tespit et
- Trafik arttıkça **MDE'yi düşür** — daha küçük optimizasyonları tespit et
- **Bayesian approach** (PostHog/GrowthBook) — daha az trafikle sonuç al

### Test Sırası (Prioritization)

| Öncelik | Test | Etki Potansiyeli | Zorluk |
|---------|------|-------------------|--------|
| 🔴 P1 | Hero headline | Yüksek | Kolay |
| 🔴 P1 | CTA button | Yüksek | Kolay |
| 🔴 P1 | Pricing page layout | Yüksek | Orta |
| 🟡 P2 | Registration flow | Orta | Orta |
| 🟡 P2 | Free tier limit | Orta | Kolay |
| 🟡 P2 | Social proof | Orta | Kolay |
| 🟢 P3 | Onboarding wizard | Orta | Zor |
| 🟢 P3 | Upgrade prompt yeri | Düşük | Kolay |
| 🟢 P3 | Feature gating | Düşük | Orta |
| 🟢 P3 | Decoy effect pricing | Yüksek | Orta |

---

## 9. Metrikler

### Primary Metrics (Ana Hedef)

| Metrik | Tanım | Hedef | Ölçüm |
|--------|-------|-------|-------|
| **Signup conversion rate** | Ziyaretçi → kayıt | >%5 | PostHog funnels |
| **Free-to-paid conversion** | Free → paid | >%2 | PostHog cohorts |
| **Revenue per visitor** | Toplam gelir / ziyaretçi | >$0.50 | Hesaplama |

### Secondary Metrics (Yan Hedef)

| Metrik | Tanım | Hedef | Ölçüm |
|--------|-------|-------|-------|
| Time to first webhook | Kayıt → ilk webhook | <5 dk | PostHog events |
| 7-day retention | 7 gün sonra aktif | >%40 | PostHog cohorts |
| Pricing page bounce rate | Hemen çıkma | <%60 | PostHog session recording |
| Plan selection distribution | Hangi plan seçiliyor | Dengeli | PostHog funnels |

### Guardrail Metrics (Koruma)

| Metrik | Kritik Eşik | Aksiyon |
|--------|------------|---------|
| Signup completion rate | <%30 | Testi durdur, akışı kontrol et |
| Error rate | >%1 | Testi durdur, hata düzelt |
| Support tickets | >2x artış | Testi durdur, UX kontrol et |

---

## 10. Uygulama Planı

### Aşama 1: Altyapı Kurulumu (1. Hafta)

- [ ] PostHog hesabı oluştur (free tier)
- [ ] Next.js SDK entegrasyonu (`posthog-js`)
- [ ] Rust API'ye server-side event tracking ekle
- [ ] Temel event'leri tanımla:
  - `page_view` (her sayfa)
  - `signup_started` (kayıt başlangıcı)
  - `signup_completed` (kayıt tamamlama)
  - `first_webhook_sent` (ilk webhook)
  - `plan_selected` (plan seçimi)
  - `upgrade_clicked` (upgrade tıklama)
  - `payment_completed` (ödeme tamamlama)
- [ ] Funnel tanımları (signup, upgrade, retention)
- [ ] Cohort tanımları (haftalık, aylık)

### Aşama 2: İlk Testler (2-3. Hafta)

- [ ] **Test 1:** Hero headline A/B testi başlat
- [ ] **Test 2:** CTA button A/B testi başlat
- [ ] **Test 5:** Fiyat noktası testi (düşük trafik için 2 varyant)
- [ ] Sonuçları günlük kontrol et

### Aşama 3: Optimizasyon (4-6. Hafta)

- [ ] Kazanan varyantları uygula
- [ ] **Test 9:** Kayıt akışı testi
- [ ] **Test 10:** Onboarding testi
- [ ] İlk cohort analizi

### Aşama 4: Sürekli İyileştirme (7+ Hafta)

- [ ] Her 2 haftada bir yeni test başlat
- [ ] Aylık test raporu oluştur
- [ ] Conversion funnel analizi
- [ ] Pricing page iterasyon

### Test Takvimi

| Hafta | Test | Varyant | Beklenen Trafik |
|-------|------|---------|----------------|
| 1 | Altyapı kurulumu | — | — |
| 2-3 | Hero headline | 4 varyant | 200-500 ziyaretçi |
| 2-3 | CTA button | 4 varyant | 200-500 ziyaretçi |
| 4-5 | Fiyat noktası | 2 varyant | 100-200 pricing ziyaretçisi |
| 6-7 | Kayıt akışı | 2 varyant | 50-100 kayıt denemesi |
| 8-9 | Social proof | 3 varyant | 200-500 ziyaretçi |
| 10-11 | Onboarding | 2 varyant | 50-100 yeni kullanıcı |
| 12+ | Sürekli iterasyon | Rotasyon | Trafik artışına göre |

---

## Notlar

### Kaynaklar

- Guideflow: "15 best A/B testing tools for SaaS in 2026" — https://www.guideflow.com/blog/ab-testing-tools
- InfluenceFlow: "SaaS Pricing Page Best Practices Complete Guide for 2026" — https://influenceflow.io/resources/saas-pricing-page-best-practices-complete-guide-for-2026/
- SaaSFactor: "Freemium vs Trial Models in SaaS" — https://www.saasfactor.co/blogs/freemium-vs-trial-models-in-saas-what-really-boosts-conversions
- Monetizely: "Freemium Conversion Rate" — https://www.getmonetizely.com/articles/freemium-conversion-rate-the-key-metric-that-drives-saas-growth-3588c
- Duke Üniversitesi (2023): Decoy effect araştırması
- MarketingLTB: %58 şirket opinion-based karar alıyor (2026)
- Unbounce: Landing page conversion benchmarks (2026)

### PostHog Kurulum Kodu (Next.js 15 — App Router)

⚠️ **Not:** Bu kod PostHog dokümantasyonuna dayanmaktadır. Dashboard deploy sonrası test edilmelidir. PostHog free tier: 1M events/ay, 15K session recordings/ay.

```typescript
// app/providers.tsx
'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogInit() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        capture_pageview: false, // Manuel capture ile kontrol
        capture_pageleave: true,
        person_profiles: 'identified_only', // Sadece identified kullanıcılar
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') posthog.debug() // Dev'de debug
        },
      })
    }
  }, [])

  return null
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
```

```typescript
// app/layout.tsx
import { CSPostHogProvider, PostHogInit } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <CSPostHogProvider>
        <PostHogInit />
        <body>{children}</body>
      </CSPostHogProvider>
    </html>
  )
}
```

### Event Tracking Örneği

```typescript
// lib/posthog-events.ts
import posthog from 'posthog-js'

// Auth events
export function trackSignupStarted(source: string) {
  posthog.capture('signup_started', { source })
}

export function trackSignupCompleted(method: string) {
  posthog.capture('signup_completed', { method, timestamp: new Date().toISOString() })
}

export function trackLogin(method: string) {
  posthog.capture('login_completed', { method })
}

// Webhook events
export function trackFirstWebhookSent(sdk: string, timeToFirst: number) {
  posthog.capture('first_webhook_sent', { sdk, time_to_first_seconds: timeToFirst })
}

export function trackWebhookSent(plan: string, event: string) {
  posthog.capture('webhook_sent', { plan, event_type: event })
}

// Billing events
export function trackUpgradeClicked(fromPlan: string, toPlan: string) {
  posthog.capture('upgrade_clicked', { from_plan: fromPlan, to_plan: toPlan })
}

export function trackPaymentCompleted(plan: string, amount: number, currency: string) {
  posthog.capture('payment_completed', { plan, amount, currency })
}

export function trackPlanSelected(plan: string, billing: 'monthly' | 'yearly') {
  posthog.capture('plan_selected', { plan, billing_cycle: billing })
}

// Feature usage events
export function trackFeatureUsed(feature: string, plan: string) {
  posthog.capture('feature_used', { feature_name: feature, current_plan: plan })
}

// Identify user (signup sonrası)
export function identifyUser(userId: string, email: string, plan: string) {
  posthog.identify(userId, { email, plan, signup_date: new Date().toISOString() })
}
```

### A/B Test Feature Flag Örneği

```typescript
// components/HeroSection.tsx
'use client'
import { useFeatureFlagVariantKey } from 'posthog-js/react'

export function HeroSection() {
  const variant = useFeatureFlagVariantKey('hero-headline-test')

  const headlines: Record<string, string> = {
    control: 'Reliable webhook delivery for developers',
    variant_a: 'Send webhooks. We deliver them. If they fail, we retry.',
    variant_b: 'Webhook infrastructure that never drops a message',
    variant_c: 'Ship webhooks in 5 minutes, not 5 weeks',
  }

  return (
    <section>
      <h1>{headlines[variant as string] || headlines.control}</h1>
      {/* ... */}
    </section>
  )
}
```

### Kurulum Checklist (Doğrulanacak)

- [ ] `posthog-js` npm package: `npm install posthog-js` — PostHog dokümantasyonuna göre
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` env var: PostHog dashboard → Project Settings → API Key
- [ ] `NEXT_PUBLIC_POSTHOG_HOST` env var: Vercel'de ayarla (varsayılan: `https://app.posthog.com`)
- [ ] Feature flags: PostHog dashboard'dan manuel oluştur
- [ ] Test: `posthog.debug()` ile browser console'da event'leri doğrula

### Dikkat Edilecekler

1. **GDPR uyumluluğu** — PostHog self-hosted seçeneği veri kontrolü sağlar. Varsayılan olarak EU'da veri saklanabilir
2. **Düşük trafik** — İlk aylarda büyük MDE (%25-50) kullan, küçük etkileri bekleme
3. **Test çakışması** — Aynı anda max 2-3 test çalıştır
4. **Süre yeterliliği** — Minimum 2 hafta, hafta sonu etkisini hesaba kat
5. **Multiple testing correction** — Birden fazla test sonucunu Bonferroni ile düzelt
6. **PostHog free tier limiti** — 1M events/ay. İlk aylarda yeterli, trafik artınca plan kontrol et
7. **Next.js 15 App Router** — `'use client'` directive gerekli, SSR'da PostHog çalışmaz
8. **Vercel env vars** — `NEXT_PUBLIC_` prefix'i zorunlu, yoksa client-side erişilemez
