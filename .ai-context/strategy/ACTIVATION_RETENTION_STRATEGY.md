# HookSniff — Activation & Retention Stratejisi
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

---

## 1. Mevcut Durum

- **Activation tanımı**: Yok — "aktif kullanıcı" tanımlanmamış
- **Onboarding flow**: Strateji raporu hazır, uygulanmamış
- **Retention mekanizması**: Yok
- **Churn prevention**: Yok
- **Win-back campaign**: Yok
- **NPS measurement**: Yok
- **Engagement scoring**: Yok

---

## 2. Rakip Karşılaştırması

| Metrik | Svix | Hookdeck | Hook0 | HookSniff Hedef |
|--------|------|----------|-------|-----------------|
| Activation tanımı | İlk webhook | İlk endpoint | İlk event | İlk başarılı webhook |
| Time to activate | ~10 dk | ~5 dk | ~15 dk | <10 dk |
| Week 1 retention | ~50% | ~55% | ~35% | 45%+ |
| Month 1 retention | ~30% | ~35% | ~20% | 25%+ |
| Churn prevention | Email drip | In-app nudge | ❌ | Email + in-app |
| Win-back | Email | ❌ | ❌ | Email + offer |
| NPS measurement | Quarterly | ❌ | ❌ | Monthly |

---

## 3. Standart/Best Practice

### Activation Framework

**Hook Model (Nir Eyal):**
```
Trigger → Action → Variable Reward → Investment
  ↓         ↓           ↓              ↓
Email    Webhook    Dashboard       API key
Push     gönder     insights        oluştur
```

**Activation Metrics (SaaS benchmark):**
- Good activation rate: 40-60%
- Great activation rate: 60-80%
- Time to activate: <10 dk (developer tools)

### Retention Framework

**Retention Curves (SaaS benchmark):**
```
Week 0: 100%
Week 1: 40-60% (good: 50%+)
Week 4: 20-40% (good: 30%+)
Month 3: 15-30% (good: 20%+)
Month 6: 10-25% (good: 15%+)
Month 12: 5-20% (good: 10%+)
```

### Churn Prevention Levers
1. **Engagement scoring** — düşük skor = risk
2. **Usage alerts** — limit yaklaşınca bildirim
3. **Re-engagement email** — 7 gün inactive
4. **In-app nudges** — unused feature提示
5. **Exit survey** — neden gidiyorsun?

---

## 4. Strateji

### 4.1 Activation Tanımı

**HookSniff Activation = İlk başarılı webhook gönderimi**

**Activation Steps:**
```
1. Signup (email + password)
   ↓ 100%
2. Email verification
   ↓ 85%
3. API key oluştur
   ↓ 70%
4. İlk endpoint oluştur
   ↓ 60%
5. İlk webhook gönder (SDK veya dashboard)
   ↓ 45% ← ACTIVATION
6. İlk başarılı yanıt al
   ↓ 40%
```

**Activation Rate Hedefi**: %60 (5. adım)

### 4.2 Activation Scoring Model

| Aksiyon | Puan | Ağırlık |
|---------|------|---------|
| Signup | +10 | Base |
| Email verified | +15 | Engagement |
| API key created | +20 | Technical |
| Endpoint created | +25 | Technical |
| First webhook sent | +30 | ACTIVATION |
| First success response | +35 | ACTIVATION |
| SDK installed | +25 | Adoption |
| Schema created | +20 | Advanced |
| Team member invited | +15 | Expansion |
| Documentation viewed | +5 | Learning |

**Risk Scoring:**
| Skor | Durum | Aksiyon |
|------|-------|---------|
| 0-20 | 🔴 Düşük risk | Hoşgeldin emaili |
| 21-40 | 🟡 Orta risk | Onboarding nudge |
| 41-60 | 🟢 İyi | Feature suggestion |
| 61-80 | 🔵 Güçlü | Expansion nudge |
| 81+ | 🟣 Champion | Referral program |

### 4.3 Onboarding İyileştirmeleri

**İlk 5 Dakika Deneyimi:**
```
Signup
  ↓
"Welcome to HookSniff!" → 3 quick action card:
  ↓
┌─────────────────────────────────────────┐
│  🚀 Quick Start (pick one):            │
│                                         │
│  1. 📦 Install SDK (30 sec)            │
│     npm install hooksniff-sdk           │
│                                         │
│  2. 🔗 Create endpoint (1 click)       │
│     [Create Endpoint]                   │
│                                         │
│  3. 🧪 Try webhook simulator           │
│     [Send Test Webhook]                 │
└─────────────────────────────────────────┘
  ↓
Progress bar: ████░░░░ 25% → ███░░░░░ 50% → ██░░░░░░ 75% → █░░░░░░░ 100%
  ↓
"🎉 Congrats! Your first webhook was delivered!"
```

**Checklist Widget (In-app):**
```
✅ Create account
⬜ Verify email
⬜ Create API key
⬜ Create first endpoint
⬜ Send first webhook
⬜ Install SDK
⬜ Invite team member
```

### 4.4 Retention Mekanizmaları

**Haftalık Email Drip (Inactive users):**
```
Day 7 (inactive):
  Subject: "We miss you! Here's what's new"
  Content: New features + quick start reminder

Day 14 (inactive):
  Subject: "Your webhooks are waiting"
  Content: Use case example + offer help

Day 21 (inactive):
  Subject: "Can we help?"
  Content: 1:1 call offer + feedback request

Day 30 (inactive):
  Subject: "Before you go..."
  Content: Exit survey + win-back offer
```

**In-app Nudges:**
```
// 3 gün inactive
"👋 Haven't seen you in a while! Check out [new feature]"

// 7 gün inactive
"📊 Your webhooks have been processing. See your dashboard"

// Feature discovery
"💡 Did you know? You can set up alerts for failed webhooks"
```

**Engagement Triggers:**
| Tetikleyici | Aksiyon | Kanal |
|-------------|---------|-------|
| 3 gün login yok | Re-engagement email | Email |
| 7 gün login yok | "We miss you" email | Email |
| Limit %80 doldu | Upgrade nudge | In-app |
| 100+ webhook gönderdi | "Power user" badge | In-app |
| Team invite gönderdi | Expansion email | Email |
| Schema oluşturdu | Advanced feature suggestion | In-app |

### 4.5 Churn Prevention

**Churn Risk Belirleme:**
```python
churn_risk_score = (
    days_inactive * 2 +
    feature_usage_decline * 3 +
    support_tickets * 1 +
    payment_failures * 5
)
```

**Churn Prevention Flow:**
```
Churn Risk Tespit (7 gün inactive + düşük usage)
    ↓
Re-engagement email (#1)
    ↓ (3 gün bekle)
In-app nudge + feature suggestion
    ↓ (3 gün bekle)
Re-engagement email (#2) + discount offer
    ↓ (3 gün bekle)
1:1 call invitation
    ↓ (7 gün bekle)
Exit survey + win-back offer
    ↓ (Inactive >30 gün)
Monthly cleanup email (quarterly)
```

### 4.6 Win-Back Campaign

**Win-Back Offers:**
| Süre | Offer | Kanal |
|------|-------|-------|
| 30 gün inactive | %20 indirim (3 ay) | Email |
| 60 gün inactive | 1 ay ücretsiz | Email |
| 90 gün inactive | Lifetime discount | Email |

### 4.7 NPS Measurement

**NPS Survey Schedule:**
- İlk 14 gün sonra (activation sonrası)
- Her 90 günde bir (aktif kullanıcılar)
- Churn sonrası (exit survey)

**NPS Questions:**
```
1. "HookSniff'i bir arkadaşına tavsiye eder misin?" (0-10)
2. "En çok neyi seviyorsun?" (open text)
3. "En çok neyi geliştirsek?" (open text)
4. "Hangi feature'ı eksik buluyorsun?" (multiple choice)
```

**NPS Benchmarks (Developer Tools):**
- <0: Kötü
- 0-30: Ortalama
- 30-50: İyi
- 50-70: Mükemmel
- 70+: Dünya sınıfı

**Hedef**: 40+ (6. ayda)

---

## 5. Uygulama Planı

### Faz 1: Activation (Gün 1-7)
| Adım | Süre | Detay |
|------|------|-------|
| Activation tanımını kodla | 2 saat | PostHog funnel |
| Onboarding checklist widget | 4 saat | React component |
| Quick start wizard | 4 saat | 3-step wizard |
| Activation email sequence | 2 saat | 3 email template |
| Test + iterate | 2 saat | Beta feedback |

### Faz 2: Retention (Gün 8-14)
| Adım | Süre | Detay |
|------|------|-------|
| Engagement scoring model | 3 saat | Backend logic |
| Inactive detection cron | 1 saat | Daily check |
| Re-engagement email sequence | 2 saat | 4 email template |
| In-app nudge component | 3 saat | React component |
| Feature discovery prompts | 2 saat | Context-based |

### Faz 3: Churn Prevention (Gün 15-21)
| Adım | Süre | Detay |
|------|------|-------|
| Churn risk scoring | 2 saat | Backend algorithm |
| Automated prevention flow | 3 saat | Email + in-app |
| Exit survey form | 1 saat | Tally.so |
| Win-back email sequence | 2 saat | 3 email template |
| Dashboard: churn metrics | 2 saat | PostHog insight |

### Faz 4: NPS + Optimization (Gün 22-30)
| Adım | Süre | Detay |
|------|------|-------|
| NPS survey automation | 2 saat | Email + in-app |
| NPS dashboard | 1 saat | PostHog insight |
| Retention cohort analysis | 2 saat | PostHog cohort |
| 30 gün raporu | 2 saat | Metrics + learnings |
| Iterate on learnings | Devam | Continuous |

---

## 6. Metrikler

| Metrik | Hedef | Ölçüm |
|--------|-------|-------|
| Activation rate | %60+ | PostHog funnel |
| Time to activate | <10 dk | PostHog timing |
| Week 1 retention | %45+ | PostHog cohort |
| Week 4 retention | %25+ | PostHog cohort |
| Month 3 retention | %15+ | PostHog cohort |
| Churn rate (monthly) | <%10 | Polar.sh |
| NPS skoru | 40+ | Survey |
| Win-back rate | %10+ | Email analytics |
| Email open rate | %30+ | Resend/Gmail |
| Email click rate | %5+ | Resend/Gmail |

---

## 7. Riskler

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| Activation tanımı yanlış | Orta | Yüksek | Beta'da validate et |
| Email spam filtresi | Orta | Orta | SPF/DKIM, warm-up |
| Kullanıcı email fatigue | Orta | Orta | Frequency cap, preference center |
| Scoring modeli yanlış | Düşük | Yüksek | Beta verisi ile calibre |
| Win-back yetersiz | Orta | Orta | Test different offers |
| NPS düşük çıkarsa | Orta | Yüksek | Hızlı aksiyon, iletişim |
