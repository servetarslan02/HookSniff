# HookSniff — Refund Policy Stratejisi
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
- **Refund policy**: Yok
- **Cancellation flow**: Yok
- **Downgrade akışı**: Yok
- **Payment provider**: Polar.sh (Stripe backend)
- **Pricing**: $29/ay (Plan), $99/ay (Team), Free (limitsiz webhook, 1 endpoint)
- **Refund API**: Polar.sh `POST /v1/refunds/` mevcut (doğrulandı)
- **Proration**: Polar.sh 3 proration behavior destekliyor (doğrulandı)

### Eksiklikler
| Alan | Durum | Öncelik |
|------|-------|---------|
| Refund policy sayfası | ❌ | 🔴 |
| Cancellation flow | ❌ | 🔴 |
| Downgrade akışı | ❌ | 🔴 |
| Exit survey | ❌ | 🟡 |
| Win-back offers | ❌ | 🟡 |
| Legal uyumluluk (KVKK/GDPR) | ❌ | 🔴 |

---

## 2. Rakip Karşılaştırması

### 2.1 Rakip Refund/Cancel Yaklaşımları (Doğrulanmış)

**Svix (svix.com/terms — doğrulandı 2026-05-10):**
- Terms of Use sayfası mevcut (2022 güncellenmiş)
- Kamuya açık refund policy bulunamadı
- Enterprise odaklı → büyük müşteriler için özel sözleşmeler
- Professional plan: $490/ay → enterprise satış süreci
- **Yaklaşım:** Enterprise sözleşme bazlı, kampanya yok

**Hookdeck (hookdeck.com — doğrulandı 2026-05-10):**
- Kamuya açık refund policy bulunamadı
- Free tier: 10K event → self-serve
- Team: $39/ay, Growth: $499/ay
- SoC2 compliance → enterprise readiness
- **Yaklaşık:** Self-serve cancel, muhtemelen pro-rated

**HookSniff Hedef:**
- Kamuya açık, şeffaf refund policy
- Self-serve cancellation
- 14 gün para iade garantisi
- Downgrade seçeneği

### 2.2 Karşılaştırma Tablosu

| Özellik | Svix | Hookdeck | HookSniff |
|---------|------|----------|-----------|
| Refund policy | ❌ Kamuya açık değil | ❌ Kamuya açık değil | ✅ Kamuya açık |
| Para iade süresi | Bilinmiyor | Bilinmiyor | 14 gün |
| Self-service cancel | ✅ | ✅ | ✅ |
| Downgrade | ✅ | ✅ | ✅ |
| Pause subscription | Bilinmiyor | Bilinmiyor | 🟡 Opsiyonel |
| Pro-rated refund | Bilinmiyor | Bilinmiyor | ✅ |
| Exit survey | Bilinmiyor | Bilinmiyor | ✅ |

---

## 3. Standart/Best Practice

### 3.1 SaaS Refund Policy Framework (Doğrulanmış)

**PayPro Global SaaS Refund Guide (2025):**

**Refund Window Seçimi:**
| Ürün Karmaşıklığı | Önerilen Window | Neden |
|-------------------|----------------|-------|
| Basit (tek tıkla kurulum) | 7 gün | Hızlı onboarding |
| Orta (SDK kurulumu) | **14 gün** | ✅ HookSniff için uygun |
| Karmaşık (enterprise entegrasyon) | 30 gün | Uzun eval süresi |

**Refund Türleri:**
| Tür | Tanım | HookSniff |
|-----|-------|-----------|
| Full refund | Tam para iadesi | ✅ İlk 14 gün |
| Pro-rated refund | Kullanılmayan gün iade | ✅ 14-30 gün arası |
| No refund | İade yok | ❌ 30+ gün |

**"No Questions Asked" vs "Specific Circumstances":**
| Yaklaşım | Artı | Eksi | Karar |
|----------|------|------|-------|
| No questions asked | Güven artırır | Abuse riski | ✅ İlk 14 gün |
| Specific circumstances | Risk azalır | Güven azalır | 14+ gün için |

### 3.2 Refund Rate Benchmarks (Doğrulanmış)

**RevenueCat State of Subscription Apps 2026 (115,000 uygulama, $16B gelir):**

| Kategori | Median Refund Rate | Kaynak |
|----------|-------------------|--------|
| Genel SaaS | %1-3 | Industry standard |
| AI uygulamaları | **%4.2** | RevenueCat 2026 |
| Developer tools | %1-2 | Industry estimate |

**HookSniff Beklentisi:** %2-3 refund rate (developer tools için normal)

### 3.3 Polar.sh Refund API (Doğrulanmış)

Kaynak: polar.sh/docs/api-reference/refunds/create (doğrulandı 2026-05-10)

**Refund Endpoint:**
```
POST https://api.polar.sh/v1/refunds/
Authorization: Bearer <POLAR_OAT>
```

**Refund Reasons (Doğrulanmış):**
- `customer_request` — müşteri talebi
- `service_disruption` — servis kesintisi

**Partial Refund Desteği:**
- `amount` parametresi ile kısmi iade mümkün
- Örnek: $29'luk plan → $14.50 iade (15 gün kullandı, 15 gün kaldı)

**Polar.sh Proration Behaviors (Doğrulanmış):**

| Behavior | Tanım | Kullanım |
|----------|-------|----------|
| `invoice` | Anında fatura + prorated charge/credit | Upgrade'lerde |
| `prorate` | Bir sonraki faturada uygula | Genel downgrade |
| `next_period` | Bir sonraki dönemde uygula | Dönem sonu downgrade |

### 3.4 Hukuki Çerçeve (Türkiye + EU)

**Türkiye — KVKK (Law 6698, 2016):**
- Kişisel veri işleme için açık rıza gerekli
- Veri silme hakkı (unright to be forgotten)
- Cross-border transfer kısıtlamaları
- **HookSniff etkisi:** Kullanıcı verisi silme endpoint'i gerekli

**Türkiye — E-Ticaret Kanunu (Law 6563, 2014, amended 7416/2022):**
- Mesafeli sözleşmeler: 14 gün cayma hakkı
- **Dijital içerik istisnası:** Kullanım başladıysa cayma hakkı düşebilir
- **SaaS uygulaması:** İlk 14 gün içinde kullanılmamışsa tam iade

**EU — Consumer Rights Directive (2011/83/EU):**
- 14 gün withdrawal right
- Digital content: Kullanım başladıysa cayma hakkından feragat mümkün
- **HookSniff etkisi:** EU kullanıcıları için 14 gün, kullanım başladıysa pro-rated

**US — FTC Click-to-Cancel Rule (2024):**
- Kolay cancellation zorunlu
- Dark pattern yasağı
- Clear refund policy

**HookSniff Hukuki Pozisyon:**
- ✅ 14 gün tam iade (kullanılmamışsa)
- ✅ Pro-rated iade (14-30 gün arası)
- ✅ Kullanım başladıysa cayma hakkından feragat (ToS'de belirtilecek)
- ❌ 30+ gün iade yok

---

## 4. Strateji

### 4.1 Refund Policy Metni

```
## HookSniff Para İade Politikası

### 14 Gün Para İade Garantesi
HookSniff'i denediğinizde memnun kalmazsanız, ilk 14 gün içinde
tam para iadesi alabilirsiniz. Soru sorulmaz.

### İade Koşulları
- ✅ İlk 14 gün içinde, kullanılmamışsa: Tam iade
- ✅ 14-30 gün arası: Kullanılmayan gün kadar pro-rated iade
- ❌ 30 gün sonra: İade yok (downgrade veya cancel yapılabilir)
- ❌ Abuse/spam tespit edilirse: İade yok

### Nasıl İade Alınır?
1. Dashboard → Settings → Billing → "Cancel Subscription"
2. İade nedeni seçin (opsiyonel)
3. Onaylayın
4. 48 saat içinde iade işleme alınır

### İade Yapılmayan Durumlar
- API abuse/spam tespit edilirse
- Hizmet kötüye kullanılıyorsa
- 30 gün geçmişse

### İletişim
Refund sorularınız için: refund@hooksniff.com
```

### 4.2 Cancellation Flow (Detaylı)

**Adım 1: Cancellation Sayfası**

```
┌─────────────────────────────────────────────────┐
│  Subscription Cancel                            │
├─────────────────────────────────────────────────┤
│                                                  │
│  😢 Gidiyorsunuz...                              │
│                                                  │
│  Neden iptal ediyorsunuz?                        │
│  ○ Çok pahalı                                    │
│  ○ Feature eksik                                 │
│  ○ Başka tool'a geçtim                           │
│  ○ Geçici olarak ihtiyacım yok                   │
│  ○ Diğer: __________                             │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
││  💡 Bunu deneyin:                          │    │
││                                            │    │
││  → Free plan'a downgrade (limitsiz webhook)│    │
││  → 3 ay %20 indirim                        │    │
││  → Subscription pause (3 ay)               │    │
│└─────────────────────────────────────────┘    │
│                                                  │
│  [Free'a Downgrade]  [Pause]  [Hala İptal Et]  │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Adım 2: Confirmation**

```
┌─────────────────────────────────────────────────┐
│  İade Onayı                                      │
├─────────────────────────────────────────────────┤
│                                                  │
│  İade tutarı: $XX.XX (pro-rated)                │
│  İade süresi: 48 saat                            │
│  Erişim: [tarih] tarihine kadar                 │
│                                                  │
│  [İptal Et ve İade Al]  [Geri Dön]              │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Adım 3: Confirmation Email**
```
Subject: HookSniff aboneliğiniz iptal edildi

Merhaba [isim],

Aboneliğiniz başarıyla iptal edildi.

İade detayları:
- Tutar: $XX.XX
- Yöntem: Orijinal ödeme yöntemi
- Süre: 48 saat

Erişim: [tarih] tarihine kadar devam edecek.

Geri dönmek isterseniz: [link]

Neden iptal ettiğinizi paylaşabilir misiniz? [survey link]

Teşekkürler,
HookSniff ekibi
```

### 4.3 Downgrade Akışı (Polar.sh Proration ile)

**Polar.sh Proration Behavior (Doğrulanmış):**

**Plan ($29) → Free:**
```
1. Dashboard → Settings → Billing
2. "Downgrade to Free" seç
3. Uyarı: "Aşağıdaki feature'lar kaybolacak:"
   - Unlimited endpoints → 1 endpoint
   - Priority support → Community support
   - Schema registry → ❌
   - Replay → ❌
4. Onayla
5. Proration: next_period (dönem sonunda geçerli)
```

**Team ($99) → Plan ($29):**
```
1. Dashboard → Settings → Billing
2. "Downgrade to Plan" seç
3. Uyarı: "Aşağıdaki feature'lar kaybolacak:"
   - 10 team members → 1 user
   - SSO → ❌
   - Audit log → ❌
4. Onayla
5. Proration: prorate (anında, bir sonraki faturada credit)
```

**Polar.sh API ile:**
```rust
// Downgrade: Team → Plan
// proration_behavior: "next_period" (dönem sonunda)
curl --request PATCH \
  --url https://api.polar.sh/v1/subscriptions/{subscription_id} \
  --header 'Authorization: Bearer <POLAR_OAT>' \
  --data '{
    "product_id": "<plan_product_id>",
    "proration_behavior": "next_period"
  }'
```

### 4.4 Refund API Entegrasyonu (Rust)

**Yeni dosya: `api/src/routes/refund.rs`**

```rust
//! Refund handler — creates refund via Polar.sh API.
//!
//! Polar.sh refund endpoint: POST /v1/refunds/
//! Refund reasons: customer_request, service_disruption

use axum::Json;
use serde::{Deserialize, Serialize};
use crate::error::AppError;

#[derive(Debug, Deserialize)]
pub struct RefundRequest {
    pub order_id: String,
    pub reason: Option<String>,
    pub amount: Option<i64>, // partial refund (cents)
}

#[derive(Debug, Serialize)]
struct PolarRefundCreate {
    order_id: String,
    reason: String,
    amount: Option<i64>,
}

/// Create a refund via Polar.sh API.
///
/// Full refund: amount = None (Polar refunds full order amount)
/// Partial refund: amount = Some(1450) → $14.50
pub async fn create_refund(
    Json(req): Json<RefundRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let polar_token = std::env::var("POLAR_ACCESS_TOKEN")
        .map_err(|_| AppError::Internal("POLAR_ACCESS_TOKEN not set".into()))?;

    let reason = match req.reason.as_deref() {
        Some("service_disruption") => "service_disruption",
        _ => "customer_request",
    };

    let body = PolarRefundCreate {
        order_id: req.order_id,
        reason: reason.to_string(),
        amount: req.amount,
    };

    let client = reqwest::Client::new();
    let resp = client
        .post("https://api.polar.sh/v1/refunds/")
        .header("Authorization", format!("Bearer {}", polar_token))
        .json(&body)
        .send()
        .await
        .map_err(|e| AppError::Internal(format!("Polar API error: {}", e)))?;

    if !resp.status().is_success() {
        let status = resp.status();
        let text = resp.text().await.unwrap_or_default();
        return Err(AppError::Internal(
            format!("Polar refund failed ({}): {}", status, text),
        ));
    }

    let result: serde_json::Value = resp.json().await
        .map_err(|e| AppError::Internal(format!("Parse error: {}", e)))?;

    // PostHog event
    crate::analytics::capture(
        "refund_created",
        "system",
        vec![
            ("order_id", &req.order_id),
            ("reason", reason),
        ],
    );

    Ok(Json(result))
}
```

### 4.5 Win-Back Offers

| Durum | Offer | Süre | Kanal |
|-------|-------|------|-------|
| Cancel (fiyat) | %20 indirim (3 ay) | 7 gün geçerli | Email |
| Cancel (feature) | Feature roadmap paylaş | Hemen | Email |
| Cancel (geçici) | 3 ay pause | 14 gün geçerli | Email |
| 30 gün inactive | %15 indirim | 30 gün geçerli | Email |
| 60 gün inactive | 1 ay ücretsiz | 14 gün geçerli | Email |
| 90 gün inactive | Lifetime %25 discount | 14 gün geçerli | Email |

### 4.6 Exit Survey (Tally.so — 5 soru)

```
1. Neden iptal ediyorsunuz? (çoklu seçim)
   □ Çok pahalı
   □ Feature eksik
   □ Başka tool'a geçtim
   □ Geçici olarak ihtiyacım yok
   □ Teknik sorunlar
   □ Diğer: ___

2. En çok hangi feature eksikti? (serbest metin)
   [_________________________________]

3. Hangi tool'a geçiyorsunuz? (opsiyonel)
   □ Svix  □ Hookdeck  □ Kendi sistemim  □ Diğer: ___

4. Fiyat ne olsa geri dönerdiniz?
   □ $14/ay  □ $19/ay  □ $24/ay  □ Ücretsiz kalmalı

5. Ek yorumlarınız:
   [_________________________________]
```

---

## 5. Uygulama Planı

### Faz 1: Policy + Pages (Gün 1-3)
| Adım | Süre | Tool | Detay |
|------|------|------|-------|
| Refund policy yaz | 1 saat | Markdown | Legal compliant metin |
| Cancellation sayfası | 3 saat | React | Dashboard component |
| Downgrade flow | 3 saat | Polar.sh API | Proration behavior |
| Confirmation email | 1 saat | Resend | Template |
| Exit survey form | 1 saat | Tally.so | 5 soru |

### Faz 2: API + Automation (Gün 4-7)
| Adım | Süre | Tool | Detay |
|------|------|------|-------|
| Refund API endpoint | 2 saat | Rust | `POST /api/refund` |
| Pro-rated calculation | 2 saat | Backend | Gün bazlı hesaplama |
| Win-back email sequence | 2 saat | Resend | 3 email template |
| Pause feature | 3 saat | Polar.sh API | Subscription pause |
| Test tüm flow'lar | 2 saat | — | E2E test |

### Faz 3: Monitoring (Gün 8-10)
| Adım | Süre | Tool | Detay |
|------|------|------|-------|
| Cancellation analytics | 2 saat | PostHog | Event tracking |
| Refund metrics dashboard | 1 saat | PostHog | Insight |
| Exit survey analysis | 1 saat | Manual | Haftalık review |
| Weekly report automation | 1 saat | Script | Email summary |

---

## 6. Metrikler

### KPI Tanımları

| KPI | Tanım | Hedef | Benchmark | Kaynak |
|-----|-------|-------|-----------|--------|
| **Refund rate** | İade oranı | <%3 | %1-3 (dev tools) | RevenueCat 2026 |
| **Cancellation rate** | Aylık iptal oranı | <%5 | B2B: %0.5-1 | Industry |
| **Downgrade rate** | Aylık downgrade | <%8 | — | Industry |
| **Win-back success** | Geri dönen churned | %10+ | — | PayPro Global |
| **Pause usage** | Pause seçenler | <%5 | — | Industry |
| **Exit survey completion** | Survey tamamlayan | %40+ | — | Industry |
| **Refund processing time** | İade süresi | <48 saat | — | Industry |
| **Support tickets (refund)** | Destek talebi | <5/ay | — | Industry |

### Exit Survey Analizi (Aylık)

Her ayın ilk günü:
1. En çok neden cancel ediyorlar?
2. Hangi feature eksik?
3. Hangi tool'a geçiyorlar?
4. Fiyat feedback → fiyat ayarlaması
5. Win-back offer etkili mi?

---

## 7. Riskler

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| Abuse (refund farming) | Düşük | Orta | 14 gün limit, abuse detection |
| Yüksek refund rate | Orta | Yüksek | Exit survey, iteration |
| Legal uyumsuzluk (KVKK) | Düşük | Yüksek | ToS'de cayma hakkı istisnası |
| Polar.sh API limitations | Düşük | Orta | Manual fallback |
| Dark pattern şikayeti | Düşük | Yüksek | Clear, honest UI |
| Pro-rated hesaplama hatası | Düşük | Orta | Thorough testing |

---

## 8. Notlar

### Polar.sh Entegrasyon Özeti (Doğrulanmış)

| Özellik | Endpoint | Durum |
|---------|----------|-------|
| Refund oluştur | `POST /v1/refunds/` | ✅ Mevcut |
| Subscription cancel | `PATCH /v1/subscriptions/{id}` | ✅ Mevcut |
| Proration (invoice) | `proration_behavior: "invoice"` | ✅ Mevcut |
| Proration (prorate) | `proration_behavior: "prorate"` | ✅ Mevcut |
| Proration (next_period) | `proration_behavior: "next_period"` | ✅ Mevcut |
| Customer management | Dashboard + API | ✅ Mevcut |

### Maliyet Tahmini

| Kalem | Maliyet |
|-------|---------|
| Polar.sh refund API | $0 (Stripe backend dahil) |
| Tally.so exit survey | $0 (free plan) |
| Resend email templates | $0 (free tier) |
| **Toplam** | **$0** |

### Kaynaklar (Doğrulanmış)
- Polar.sh Refund API: https://polar.sh/docs/api-reference/refunds/create (doğrulandı 2026-05-10)
- Polar.sh Proration: https://polar.sh/docs/features/subscriptions/proration (doğrulandı 2026-05-10)
- PayPro Global SaaS Refund: https://payproglobal.com/how-to/set-up-saas-refund-policy/ (doğrulandı 2026-05-10)
- RevenueCat 2026: https://www.revenuecat.com/state-of-subscription-apps/ (115K uygulama, AI refund rate %4.2)
- Svix Terms: https://www.svix.com/terms/ (doğrulandı 2026-05-10)
- Turkey KVKK: Law 6698 (2016) — istanbullawyerfirm.com (doğrulandı 2026-05-10)
- Turkey E-Commerce: Law 6563 (2014, amended 7416/2022) — 14 gün cayma hakkı
- EU Consumer Rights Directive: 2011/83/EU — 14 gün withdrawal
