# HookSniff — Conversion Funnel Stratejisi

> Oluşturma: 2026-05-09
> Durum: Taslak

---

## İçindekiler

1. [Funnel Tanımı](#1-funnel-tanımı)
2. [Her Aşama İçin Metrikler](#2-her-aşama-için-metrikler)
3. [Drop-off Analizi](#3-drop-off-analizi)
4. [Optimizasyon Stratejisi](#4-optimizasyon-stratejisi)
5. [Benchmark Değerler](#5-benchmark-değerler)

---

## 1. Funnel Tanımı

### HookSniff Conversion Funnel

```
Ziyaretçi → Kayıt → İlk Webhook → Düzenli Kullanım → Ödeme → Tutma
  (Visit)  (Signup) (Activation)  (Engagement)    (Revenue) (Retention)
```

| Aşama | Tanım | Hedef Eylem |
|-------|-------|-------------|
| **Visit** | Landing page'e gelen kişi | "Get Started" tıklasın |
| **Signup** | Hesap oluşturdu | Dashboard'a gelsin |
| **Activation** | İlk webhook'unu gönderdi | 5 dakika içinde |
| **Engagement** | Haftada 3+ kez giriş yapıyor | Endpoint oluştursun |
| **Revenue** | Pro plan'a geçti | $29/ay ödesin |
| **Retention** | 3 aydır aktif | Churn yapmasın |

### Aha Moment Tanımı

**HookSniff'in "aha moment'u":** İlk webhook'unu gönderip 200 OK yanıtını gördüğü an.

**Hedef:** Kayıttan sonra 5 dakika içinde aha moment'a ulaşsın.

---

## 2. Her Aşama İçin Metrikler

| Aşama | Metrik | Hedef | Ölçüm Yöntemi |
|-------|--------|-------|---------------|
| Visit | Unique visitors / gün | 100+ (1. ay) | Google Analytics |
| Visit → Signup | Conversion rate | %5+ | GA funnel |
| Signup → Activation | Activation rate | %40+ | PostHog event |
| Activation → Engagement | 7-day retention | %30+ | PostHog cohort |
| Engagement → Revenue | Upgrade rate | %10+ | Stripe/Polar analytics |
| Revenue → Retention | Monthly churn | < %5 | Billing analytics |

### Activation Tanımı (Detay)

Bir kullanıcı "activated" sayılır eğer:
1. Hesap oluşturdu ✅
2. API key kopyaladı ✅
3. Endpoint oluşturdu ✅
4. İlk webhook gönderdi ✅ (veya Playground'da test etti)

**Activation scoring:**
| Eylem | Puan |
|-------|------|
| Kayıt | 0 |
| API key kopyalama | +25 |
| Endpoint oluşturma | +25 |
| İlk webhook gönderme | +50 |
| **Toplam** | **100 = activated** |

---

## 3. Drop-off Analizi

### Her Aşamada Neden Bırakıyorlar?

| Aşama | Drop-off Nedeni | Çözüm |
|-------|----------------|-------|
| Visit → Signup | "Ne işe yarar anlamadım" | Hero section güçlendir |
| Visit → Signup | "Çok pahalı" | Free tier vurgula |
| Visit → Signup | "Kayıt uzun" | Google/GitHub OAuth ekle |
| Signup → Activation | "Ne yapacağımı bilmiyorum" | Onboarding modal güçlendir |
| Signup → Activation | "API key bulamadım" | Quick Start kartı ekle |
| Signup → Activation | "Endpoint oluşturmaya korktum" | webhook.site hazır URL |
| Activation → Engagement | "Bir kere kullandım, unuttum" | Email drip campaign |
| Activation → Engagement | "Başka tool'a geçtim" | Haftalık özet emaili |
| Engagement → Revenue | "Free tier yeterli" | Limit yaklaşınca bildirim |
| Engagement → Revenue | "Değerini görmedim" | ROI calculator |
| Revenue → Retention | "Sorun çıktı, destek yok" | Canlı chat (tawk.to) |
| Revenue → Retention | "Fiyat arttı" | Yıllık indirim sun |

---

## 4. Optimizasyon Stratejisi

### Visit → Signup (%5+ hedef)

| Optimizasyon | Etki | Süre |
|-------------|------|------|
| Hero section'a "Free, no credit card" ekle | Yüksek | 30 dk |
| Social proof: "X developer kullanıyor" | Orta | 1 saat |
| Google/GitHub OAuth ile tek tıkla kayıt | Yüksek | 3 saat |
| Pricing section'da free tier vurgusu | Orta | 30 dk |
| Demo video (30 sn) landing page'e | Yüksek | 2 saat |

### Signup → Activation (%40+ hedef)

| Optimizasyon | Etki | Süre |
|-------------|------|------|
| Onboarding modal'da adım adım rehber | Yüksek | 3 saat |
| Quick Start kartı (API key → endpoint → webhook) | Yüksek | 2 saat |
| webhook.site hazır URL ile endpoint oluşturma | Yüksek | 1 saat |
| Playground'da hazır template'ler | Orta | 1 saat |
| "Test Webhook" butonu her endpoint'te | Orta | 1 saat |

### Activation → Engagement (%30+ hedef)

| Optimizasyon | Etki | Süre |
|-------------|------|------|
| 3. gün email: "Webhook'ların nasıl gidiyor?" | Yüksek | 1 saat |
| 7. gün email: "Yeni özellik: Schema Registry" | Orta | 30 dk |
| Haftalık özet emaili: "Bu hafta X webhook teslim edildi" | Yüksek | 2 saat |
| Dashboard'da achievement sistemi: "100 webhook!" | Düşük | 3 saat |

### Engagement → Revenue (%10+ hedef)

| Optimizasyon | Etki | Süre |
|-------------|------|------|
| Limit %80'e ulaşınca bildirim | Yüksek | 1 saat |
| "Pro'ya geç, X özellik kazan" comparison table | Orta | 1 saat |
| 14 gün ücretsiz Pro denemesi | Yüksek | 2 saat |
| Yıllık ödeme %20 indirim | Orta | 30 dk |

### Revenue → Retention (< %5 churn hedef)

| Optimizasyon | Etki | Süre |
|-------------|------|------|
| Canlı destek (tawk.to) | Yüksek | 1 saat |
| Aylık müşteri başarı emaili | Orta | 1 saat |
| Feature request oylama | Düşük | 2 saat |
| Churn riski tespit (7 gün giriş yoksa) | Yüksek | 2 saat |

---

## 5. Benchmark Değerler

### SaaS Endüstri Ortalamaları

| Metrik | Ortalama | İyi | Mükemmel |
|--------|----------|-----|----------|
| Visit → Signup | %2-5 | %5-10 | %10+ |
| Signup → Activation | %20-30 | %30-50 | %50+ |
| 7-day retention | %20-30 | %30-50 | %50+ |
| Free → Paid | %2-5 | %5-10 | %10+ |
| Monthly churn | %5-7 | %3-5 | < %3 |

### HookSniff Hedefleri (İlk 6 Ay)

| Metrik | 1. Ay | 3. Ay | 6. Ay |
|--------|-------|-------|-------|
| Visit → Signup | %3 | %5 | %8 |
| Signup → Activation | %30 | %40 | %50 |
| 7-day retention | %20 | %30 | %40 |
| Free → Paid | %5 | %8 | %12 |
| Monthly churn | %10 | %7 | %5 |

---

## Notlar

- Bu belge ONBOARDING_STRATEGY ve LAUNCH_STRATEGY ile birlikte okunmalı
- Activation tanımı PostHog'da event olarak tanımlanacak
- Her aşamanın drop-off nedenleri gerçek kullanıcı verisiyle güncellenecek
