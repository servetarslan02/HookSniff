# HookSniff — Activation & Retention Stratejisi
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

### HookSniff'in Bugünkü Durumu
- **Activation tanımı**: Yok — "aktif kullanıcı" tanımlanmamış
- **Onboarding flow**: Strateji raporu hazır, uygulanmamış
- **Retention mekanizması**: Yok
- **Churn prevention**: Yok
- **Win-back campaign**: Yok
- **NPS measurement**: Yok
- **Engagement scoring**: Yok
- **Analytics**: PostHog entegre değil (eş zamanlı kurulacak)

### Eksiklikler
| Alan | Durum | Öncelik |
|------|-------|---------|
| Activation tanımı | ❌ | 🔴 |
| Onboarding checklist | ❌ | 🔴 |
| Engagement scoring | ❌ | 🔴 |
| Re-engagement emails | ❌ | 🔴 |
| Churn prevention | ❌ | 🔴 |
| Win-back campaigns | ❌ | 🟡 |
| NPS survey | ❌ | 🟡 |
| Feature discovery prompts | ❌ | 🟡 |

---

## 2. Rakip Karşılaştırması

### 2.1 Rakip Activation/Onboarding (Doğrulanmış Veri)

**Svix (svix.com):**
- "Start in 5 dakika" — quick start promise
- Dashboard'da built-in webhook UI (Svix Portal)
- Embeddable webhook UI — kendi dashboard'una entegre et
- Case study'ler: Brex, Lob, Replicate, Guesty — her müşteri için success story
- Open-source → developer self-serve
- **Activation approach**: SDK kurulumu → endpoint oluşturma → ilk webhook

**Hookdeck (hookdeck.com):**
- Free tier: 10K event, 3 gün retention — limitsiz connections
- Built-in metrics dashboard — anında feedback
- Issues Management — otomatik hata tespiti
- SoC2 compliance → enterprise güvenilirlik
- **Activation approach**: Connection oluşturma → webhook gönderimi → metrics görme

**HookSniff:**
- Free tier: Limitsiz webhook, 1 endpoint
- 11 SDK — self-serve kurulum
- Dashboard: Vercel'de canlı
- OTEL entegrasyonu — built-in observability
- **Activation approach**: Signup → API key → endpoint → ilk webhook (4 adım)

### 2.2 Karşılaştırma Tablosu

| Özellik | Svix | Hookdeck | HookSniff |
|---------|------|----------|-----------|
| Quick start promise | "5 dakika" | — | "5 dakika" (hedef) |
| Free tier | 50 msg/sn | 10K event | Limitsiz webhook |
| Onboarding guide | ✅ Docs | ✅ Docs | 🟡 Planlandı |
| Embeddable UI | ✅ Portal | ❌ | 🟡 Planlandı |
| Built-in metrics | ✅ | ✅ | ✅ OTEL |
| Case studies | 10+ | — | ❌ |
| SDK'lar | 6+ | — | 11 ✅ |

---

## 3. Standart/Best Practice

### 3.1 Developer Tools Benchmarks (Doğrulanmış)

**OpenView/Boldstart Dev Tools Report 2023 (37 şirket verisi):**

| Metrik | Dev Tools | Genel SaaS | Kaynak |
|--------|-----------|------------|--------|
| Visitor → Signup | **%10** (median) | %5 | OpenView 2023 |
| Freemium visitor → signup | **%9** | — | OpenView 2023 |
| Organic leads | **%31** (PLG: %41) | — | OpenView 2023 |
| Sales-generated leads | **%28** (PLG: %12) | — | OpenView 2023 |
| Referral leads | **%5** (freemium: %9) | — | OpenView 2023 |
| Return visits before signup | **3.3** | — | OpenView 2023 |

**Kaynak:** boldstart-ventures/Medium, OpenView 2023 SaaS Benchmarks

**Kritik Bulgu:**
> "Higher growth companies (100%+ YoY) were more likely to have leads from organic sources."

### 3.2 Time to Value (Doğrulanmış)

**Userpilot Benchmark 2025 (547 SaaS şirket):**

| Metrik | Değer | Kaynak |
|--------|-------|--------|
| Ortalama TTV | **1 gün 12 saat 23 dk** | Userpilot 2025 |
| İyi TTV (dev tools) | **<10 dakika** | Evil Martians 2026 |
| Kötü TTV | **>3 gün** | Userpilot 2025 |

**Evil Martians PMF Methodology (2026, 37 devtools şirketi):**

> "Self-serve is existential, not nice-to-have. If you can't deliver value in 5 minutes, developers leave."

**Devtools vs Genel SaaS Farkları (Evil Martians 2026):**
| Metrik | Dev Tools | Genel SaaS |
|--------|-----------|------------|
| Conversion rate | **Daha yüksek** | Daha düşük |
| Net Revenue Retention (NRR) | **Daha yüksek** | Daha düşük |
| Time to value | **Daha hızlı** | Daha yavaş |
| YoY growth | **Daha hızlı** | Daha yavaş |

**Neden?**
> "When a devtool solves a real workflow problem, the value is concrete and measurable. Developers can justify the spend because they can point to time saved."

### 3.3 Churn Benchmarks (Doğrulanmış)

**SaaS Capital / Zylo / Vena Solutions (2025-2026):**

| Metrik | Değer | Kaynak |
|--------|-------|--------|
| Median gross revenue retention | **%90** | Zylo 2026 |
| B2B average annual retention | **%74** | Directive 2026 |
| Elite companies annual retention | **%90+** | Directive 2026 |
| Average annual churn | **%5-7** | Vena 2026 |
| Monthly churn (B2B SaaS) | **%0.5-1** | Industry standard |

### 3.4 NPS Benchmarks (Doğrulanmış)

**Sopact NPS Benchmarks 2026 (14 endüstri):**

| NPS Aralığı | Değerlendirme |
|-------------|--------------|
| <0 | Kötü (telecom, cable) |
| +10 to +30 | Ortalama (B2B) |
| **+30 to +50** | **İyi** |
| +50 to +70 | Mükemmel |
| +70+ | Dünya sınıfı |

**SaaS Ortalaması:** +30 to +40 (CustomerGauge, Sopact)

**HookSniff Hedefi:** +40 (6. ayda)

### 3.5 Win-Back Best Practices (Doğrulanmış)

**PayPro Global SaaS Guide (2025):**

> "Retaining or reactivating customers is 5-25x cheaper than acquiring new ones."

**Win-Back Framework:**
1. **Churn analizi** — neden ve ne zaman ayrıldılar?
2. **Segmentasyon** — RFM (Recency, Frequency, Monetary) analizi
3. **High-value segment** — en yüksek CLV'li churned users'ı bul
4. **Targeted re-engagement** — churn nedenine göre özelleştirilmiş kampanya
5. **Offer** — indirim, ücretsiz ay, yeni feature

---

## 4. Strateji

### 4.1 Activation Tanımı

**HookSniff Activation = İlk başarılı webhook gönderimi (signup sonrası 24 saat içinde)**

**Activation Steps (4 adım, hedef TTV: <10 dk):**
```
1. Signup (email + password)              → 100%
2. API key oluştur (dashboard'dan)         → %75
3. İlk endpoint oluştur                    → %65
4. İlk webhook gönder (SDK veya simulator) → %55
5. İlk başarılı yanıt al                   → %50 ← ACTIVATION
```

**Activation Rate Hedefi:** %50 (5. adım — dev tools benchmark: %10 signup conversion + activation)

### 4.2 Engagement Scoring Model

| Aksiyon | Puan | Kategori |
|---------|------|----------|
| Signup | +10 | Base |
| Email verified | +10 | Base |
| API key created | +20 | Technical |
| Endpoint created | +25 | Technical |
| First webhook sent | +30 | **ACTIVATION** |
| First success response | +35 | **ACTIVATION** |
| SDK installed | +25 | Adoption |
| Schema created | +20 | Advanced |
| Team member invited | +15 | Expansion |
| Documentation viewed | +5 | Learning |
| Replay triggered | +15 | Advanced |
| Alert created | +10 | Advanced |

**Risk Segmentation:**

| Skor | Segment | Durum | Aksiyon |
|------|---------|-------|---------|
| 0-20 | 🔴 Cold | Düşük risk | Hoşgeldin emaili + quick start |
| 21-40 | 🟡 Warm | Orta risk | Onboarding nudge + video tutorial |
| 41-60 | 🟢 Active | İyi | Feature suggestion + expansion |
| 61-80 | 🔵 Power | Güçlü | Team invite nudge + referral |
| 81+ | 🟣 Champion | Şampiyon | Referral program + case study |

### 4.3 Onboarding Checklist (In-App)

**Dashboard'da gösterilecek widget:**

```
┌─────────────────────────────────────────┐
│  🚀 HookSniff'e Hoş Geldin!            │
│                                         │
│  ✅ Hesap oluşturdu                     │
│  ⬜ Email doğrula                       │
│  ⬜ API key oluştur                     │
│  ⬜ İlk endpoint'i oluştur              │
│  ⬜ İlk webhook'ı gönder               │
│  ⬜ SDK kur (opsiyonel)                 │
│                                         │
│  ████░░░░░░ %30 tamamlandı              │
└─────────────────────────────────────────┘
```

### 4.4 Quick Start Wizard (3 Adım)

**Signup sonrası ilk ekran:**

```
┌─────────────────────────────────────────────────┐
│  🚀 Hızlı Başlangıç (30 saniye)                │
│                                                  │
│  1️⃣ API Key Oluştur                             │
│     [Otomatik Oluştur] → sk_live_xxxxx          │
│                                                  │
│  2️⃣ İlk Endpoint                               │
│     URL: [https://example.com/webhook]          │
│     [Endpoint Oluştur]                          │
│                                                  │
│  3️⃣ İlk Webhook Gönder                         │
│     [🧪 Test Webhook Gönder]                    │
│     → 200 OK ✓                                  │
│                                                  │
│  🎉 İlk webhook'ın teslim edildi!               │
│     [Dashboard'a Git →]                         │
└─────────────────────────────────────────────────┘
```

### 4.5 Re-Engagement Email Sequence

**Based on PayPro Global framework + Userpilot TTV benchmarks:**

```
Gün 0 (Signup):
  → Hoşgeldin emaili (BETA_TESTING_STRATEGY §10)

Gün 1 (Inactive — 24 saat, webhook yok):
  Subject: "İlk webhook'ını gönderdin mi?"
  Content: Quick start link + video tutorial

Gün 3 (Inactive — 3 gün, webhook yok):
  Subject: "5 dakika içinde ilk webhook'ın hazır"
  Content: Step-by-step guide + "Sorun mu var? Cevapla"

Gün 7 (Inactive — 7 gün, webhook yok):
  Subject: "Seni özledik — webhook'lar seni bekliyor"
  Content: Use case examples + "1:1 call ister misin?"

Gün 14 (Inactive — 14 gün):
  Subject: "Sana nasıl yardımcı olabiliriz?"
  Content: Feedback survey link + feature list

Gün 21 (Inactive — 21 gün):
  Subject: "Son şans: %20 indirim (3 gün geçerli)"
  Content: Win-back offer + CTA

Gün 30 (Inactive — 30 gün):
  Subject: "Görüşmek üzere 👋"
  Content: Exit survey + "Geri dönmek istersen buradayız"
```

### 4.6 Churn Prevention

**Churn Risk Belirleme (Basit Model):**

```python
# Backend'de hesaplanacak
churn_risk_score = (
    days_inactive * 2 +          # 7 gün inactive = +14
    webhook_decline_rate * 3 +   # %50 azalma = +1.5
    support_tickets * 1 +        # 3 ticket = +3
    payment_failures * 5         # 1 failure = +5
)

# churn_risk_score > 20 → yüksek risk
# churn_risk_score 10-20 → orta risk
# churn_risk_score < 10 → düşük risk
```

**Churn Prevention Flow:**
```
Churn Risk Tespit (7 gün inactive + düşük usage)
    ↓
Re-engagement email (#1) — "Seni özledik"
    ↓ (3 gün bekle)
In-app nudge — "Yeni feature'ı denedin mi?"
    ↓ (3 gün bekle)
Re-engagement email (#2) — "Sana nasıl yardımcı olabiliriz?"
    ↓ (3 gün bekle)
1:1 call invitation — "15 dakika konuşalım mı?"
    ↓ (7 gün bekle)
Exit survey + win-back offer — "%20 indirim"
    ↓ (Inactive >30 gün)
Quarterly cleanup email — "Geri dönmek ister misin?"
```

### 4.7 Win-Back Campaign

**PayPro Global Framework'e Göre:**

**Adım 1: Churn Analizi**
- Neden ayrıldılar? (exit survey verisi)
- Ne zaman ayrıldılar? (recency)
- Ne kadar değerliydiler? (CLV)

**Adım 2: Segmentasyon (RFM)**
| Segment | Recency | Frequency | Monetary | Aksiyon |
|---------|---------|-----------|----------|---------|
| High-CLV churned | <30 gün | Yüksek | Yüksek | Kişisel email + %20 indirim |
| Mid-CLV churned | 30-60 gün | Orta | Orta | Email sequence + %15 indirim |
| Low-CLV churned | 60-90 gün | Düşük | Düşük | Otomatik email + %10 indirim |
| Never activated | Herhangi | Yok | Yok | "Tekrar dene" + video tutorial |

**Adım 3: Win-Back Offers**

| Durum | Offer | Süre | Kanal |
|-------|-------|------|-------|
| Cancel (fiyat) | %20 indirim (3 ay) | 7 gün geçerli | Email |
| Cancel (feature) | Feature roadmap paylaş | Hemen | Email |
| Cancel (geçici) | 3 ay pause | 14 gün geçerli | Email |
| 30 gün inactive | %15 indirim | 30 gün geçerli | Email |
| 60 gün inactive | 1 ay ücretsiz | 14 gün geçerli | Email |
| 90 gün inactive | Lifetime %25 discount | 14 gün geçerli | Email |

**Adım 4: Win-Back Email Template'leri**

**Template: Fiyat Nedeniyle Ayrılan**
```
Subject: [İsim], seni özledik — özel teklifimiz var

Merhaba [İsim],

HookSniff'den ayrıldığını gördük. Anlıyoruz — fiyat önemli.

Sana özel teklif: 3 ay boyunca %20 indirim.
- Plan: $29/ay → $23.20/ay
- Team: $99/ay → $79.20/ay

Teklif 7 gün geçerli: [link]

Neden ayrılmıştın? Bize söylersen daha iyi yapabiliriz: [survey link]

Teşekkürler,
HookSniff ekibi
```

**Template: Feature Eksikliği Nedeniyle Ayrılan**
```
Subject: [İsim], istediğin feature geldi!

Merhaba [İsim],

Sen ayrıldıktan sonra [feature] ekledik:

✅ [Feature 1] — [kısa açıklama]
✅ [Feature 2] — [kısa açıklama]
✅ [Feature 3] — [kısa açıklama]

Geri dönmek ister misin? 1 ay ücretsiz: [link]

Görüşlerini merak ediyoruz: [survey link]

HookSniff ekibi
```

### 4.8 NPS Measurement

**NPS Survey Schedule:**
- İlk 14 gün sonra (activation sonrası)
- Her 90 günde bir (aktif kullanıcılar)
- Churn sonrası (exit survey)

**NPS Soruları (PostHog Surveys ile):**
```
1. "HookSniff'i bir arkadaşına tavsiye eder misin?" (0-10)
2. "En çok neyi seviyorsun?" (open text)
3. "En çok neyi geliştirsek?" (open text)
4. "Hangi feature'ı eksik buluyorsun?" (multiple choice)
   □ Daha fazla SDK  □ Daha iyi docs  □ Monitoring
   □ Team management  □ API testing  □ Diğer: ___
```

**NPS Hedefleri:**
| Dönem | Hedef | Benchmark |
|-------|-------|-----------|
| Beta sonu | +30 | Başlangıç |
| Ay 3 | +35 | SaaS ortalaması |
| Ay 6 | +40 | İyi |
| Ay 12 | +50 | Mükemmel |

### 4.9 Feature Discovery Prompts

**In-app nudges (context-based):**

| Tetikleyici | Nudge | Konum |
|-------------|-------|-------|
| 5+ webhook gönderdi | "💡 Schema registry ile payload'larını doğrula" | Dashboard banner |
| Endpoint oluşturdu | "🔄 FIFO delivery'yi denedin mi? Sıralı teslimat garantisi" | Endpoint detail page |
| API key oluşturdu | "📦 SDK kurulumu 30 saniye sürüyor" | Quick start modal |
| Hata aldı | "🔍 Replay ile hatayı tekrar incele" | Error notification |
| Team üyesi yok | "👥 Ekip arkadaşlarını davet et" | Sidebar |

---

## 5. Uygulama Planı

### Faz 1: Activation (Gün 1-5)
| Adım | Süre | Tool | Detay |
|------|------|------|-------|
| Activation tanımını kodla | 2 saat | PostHog | "webhook_first_success" funnel |
| Onboarding checklist widget | 4 saat | React | Dashboard component |
| Quick start wizard | 4 saat | React | 3-step wizard |
| Activation email sequence | 2 saat | Resend | 3 email template |
| Test + iterate | 2 saat | — | E2E test |

### Faz 2: Retention (Gün 6-10)
| Adım | Süre | Tool | Detay |
|------|------|------|-------|
| Engagement scoring model | 3 saat | Backend | Rust scoring logic |
| Inactive detection cron | 1 saat | Rust | Daily check |
| Re-engagement email sequence | 2 saat | Resend | 4 email template |
| In-app nudge component | 3 saat | React | Context-based prompts |
| Feature discovery prompts | 2 saat | React | Banner + modal |

### Faz 3: Churn Prevention (Gün 11-15)
| Adım | Süre | Tool | Detay |
|------|------|------|-------|
| Churn risk scoring | 2 saat | Backend | Risk algorithm |
| Automated prevention flow | 3 saat | Backend | Email + in-app |
| Exit survey form | 1 saat | Tally.so | 5 soru |
| Win-back email sequence | 2 saat | Resend | 3 email template |
| Dashboard: churn metrics | 2 saat | PostHog | Insight |

### Faz 4: NPS + Optimization (Gün 16-21)
| Adım | Süre | Tool | Detay |
|------|------|------|-------|
| NPS survey automation | 2 saat | PostHog | Surveys feature |
| NPS dashboard | 1 saat | PostHog | Insight |
| Retention cohort analysis | 2 saat | PostHog | Cohort |
| 21 gün raporu | 2 saat | — | Metrics + learnings |

---

## 6. Metrikler

### KPI Tanımları (Doğrulanmış Benchmark'lar ile)

| KPI | Tanım | Hedef | Benchmark | Kaynak |
|-----|-------|-------|-----------|--------|
| **Activation Rate** | Signup → ilk webhook (24 saat) | %50+ | Dev tools: %10 visitor→signup | OpenView 2023 |
| **Time to First Webhook** | Signup → ilk success | <10 dk | İyi: <5 dk, Kötü: >3 gün | Evil Martians 2026 |
| **DAU/MAU Ratio** | Günlük aktif / Aylık aktif | %25+ | SaaS: %10-20 | Industry |
| **Week 1 Retention** | 1. hafta geri dönenler | %45+ | B2B: %30-40 | Industry |
| **Week 4 Retention** | 4. hafta geri dönenler | %25+ | B2B: %15-25 | Industry |
| **Month 3 Retention** | 3. ay geri dönenler | %15+ | B2B: %10-20 | Industry |
| **Gross Revenue Retention** | Gelir koruma oranı | %90+ | Median: %90 | Zylo 2026 |
| **Monthly Churn** | Aylık kayıp oranı | <%5 | B2B: %0.5-1 | Industry |
| **NPS** | Net Promoter Score | +40+ | SaaS: +30-40 | Sopact 2026 |
| **Win-back Rate** | Geri dönen churned users | %10+ | — | PayPro Global |

### Monitoring Dashboard (PostHog)

```
┌─────────────────────────────────────────────────────┐
│  HookSniff — Activation & Retention                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Activation Funnel                            │   │
│  │  Signup → API Key → Endpoint → Webhook Sent   │   │
│  │  100%    75%      65%       50%               │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Retention Cohort (Weekly)                    │   │
│  │  Week 0: 100% │ Week 1: 48% │ Week 4: 22%    │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Engagement Score Distribution                │   │
│  │  🔴 Cold: 25% │ 🟡 Warm: 30% │ 🟢 Active: 30% │   │
│  │  🔵 Power: 10% │ 🟣 Champion: 5%              │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Churn Risk                                   │   │
│  │  🔴 High: 5  │ 🟡 Medium: 12 │ 🟢 Low: 83%   │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  NPS: +38  │  MRR: $145  │  Churn: 2.1%/mo         │
└─────────────────────────────────────────────────────┘
```

---

## 7. Riskler

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| Activation tanımı yanlış | Orta | Yüksek | Beta'da validate et, iterate |
| Email spam filtresi | Orta | Orta | SPF/DKIM, warm-up, frequency cap |
| Kullanıcı email fatigue | Orta | Orta | Preference center, unsubscribe |
| Scoring modeli yanlış | Düşük | Yüksek | Beta verisi ile calibrate |
| Win-back yetersiz | Orta | Orta | Test different offers |
| NPS düşük çıkarsa | Orta | Yüksek | Hızlı aksiyon, iletişim |
| TTV çok uzun | Orta | Yüksek | Quick start wizard, video tutorial |
| Churn high çıkarsa | Orta | Yüksek | Exit survey, feature iteration |

---

## 8. Notlar

### Maliyet Tahmini

| Kalem | Maliyet |
|-------|---------|
| PostHog (free tier) | $0 |
| Resend (free tier) | $0 |
| Tally.so (free) | $0 |
| **Toplam** | **$0** |

### Kaynaklar (Doğrulanmış)
- Evil Martians PMF Methodology: https://evilmartians.com/chronicles/product-market-fit-methodology-devtools (2026-03-23, 37 devtools şirketi)
- OpenView Dev Tools Benchmarks: boldstart-ventures/Medium (2023, OpenView raw data)
- Userpilot TTV Benchmark: https://userpilot.com/blog/time-to-value/ (2025, 547 SaaS şirketi)
- Zylo SaaS Statistics: https://zylo.com/blog/saas-statistics/ (2026)
- Directive B2B SaaS: https://directiveconsulting.com/blog/blog-b2b-saas-marketing-guide-2026/ (2026)
- Vena SaaS Statistics: https://www.venasolutions.com/blog/saas-statistics (2026)
- Sopact NPS Benchmarks: https://www.sopact.com/use-case/nps-benchmarks (2026, 14 endüstri)
- PayPro Global Win-Back: https://payproglobal.com/how-to/win-back-lost-customers/ (2025)
- Svix: https://www.svix.com (doğrulandı 2026-05-10)
- Hookdeck: https://hookdeck.com (doğrulandı 2026-05-10)
