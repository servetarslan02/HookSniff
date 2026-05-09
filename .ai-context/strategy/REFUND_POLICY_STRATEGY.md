# HookSniff — Refund Policy Stratejisi
> Oluşturma: 2026-05-10
> Durum: Taslak
> Öncelik: 🔴 Lansmandan önce

## İçindekiler
1. [Mevcut Durum](#1-mevcut-durum)
2. [Rakip Karşılaştırması](#2-rakip-karşılaştırmması)
3. [Standart/Best Practice](#3-standartbest-practice)
4. [Strateji](#4-strateji)
5. [Uygulama Planı](#5-uygulama-planı)
6. [Metrikler](#6-metrikler)
7. [Riskler](#7-riskler)

---

## 1. Mevcut Durum

- **Refund policy**: Yok
- **Cancellation flow**: Yok
- **Downgrade akışı**: Yok
- **Payment provider**: Polar.sh (Stripe backend)
- **Pricing**: $29/ay (Plan), $99/ay (Team)
- **Free plan**: Var (limitsiz webhook, 1 endpoint)

---

## 2. Rakip Karşılaştırması

| Özellik | Svix | Hookdeck | Hook0 | HookSniff Hedef |
|---------|------|----------|-------|-----------------|
| Para iade süresi | 14 gün | 30 gün | ❌ | 14 gün |
| Self-service cancel | ✅ | ✅ | ✅ | ✅ |
| Downgrade | ✅ | ✅ | ❌ | ✅ |
| Pause subscription | ❌ | ✅ | ❌ | 🟡 Opsiyonel |
| Pro-rated refund | ❌ | ✅ | ❌ | ✅ |
| Win-back offer | ❌ | ❌ | ❌ | ✅ |

---

## 3. Standart/Best Practice

### SaaS Refund Policy Best Practices (2025-2026)

**Endüstri Standartları:**
- %72 SaaS 14 gün para iade sunuyor
- %18 SaaS 30 gün sunuyor
- %10 SaaS para iade sunmuyor

**Refund Policy Bileşenleri:**
1. **Clear terms** — ne zaman iade, ne zaman değil
2. **Self-service** — kullanıcı kendisi yapabilmeli
3. **No questions asked** — ilk 14 gün
4. **Pro-rated** — kullanılmayan gün iade
5. **Easy process** — 1-2 tık, 48 saat içinde iade

**Cancellation Flow Best Practices:**
```
Cancel butonu
    ↓
"Neden iptal ediyorsun?" (survey)
    ↓
Alternatif sun (downgrade, pause, discount)
    ↓
Hala iptal etmek istiyor musun?
    ↓
Confirm → Pro-rated refund → Confirmation email
```

### Legal Requirements

**Türkiye (KVKK + Tüketici Hakları):**
- Mesafeli satış sözleşmesi: 14 gün cayma hakkı
- Dijital hizmet: Kullanım başladıysa cayma hakkı düşebilir
- Açık raporlama: Sözleşme öncesi bilgilendirme

**EU (GDPR + Consumer Rights):**
- 14 gün withdrawal right
- Digital content: Kullanım başladıysa cayma hakkından feragat
- Clear cancellation process

**US (FTC):**
- Clear refund policy
- Easy cancellation (Click-to-cancel rule)
- No dark patterns

---

## 4. Strateji

### 4.1 Refund Policy Tanımı

**HookSniff Refund Policy:**

```
## Para İade Politikası

### 14 Gün Para İade Garantisi
HookSniff'i denediğinizde memnun kalmazsanız, ilk 14 gün içinde
tam para iadesi alabilirsiniz. Soru sorulmaz.

### İade Koşulları
- ✅ İlk 14 gün içinde: Tam iade
- ✅ 14-30 gün arası: Kullanılmayan gün kadar pro-rated iade
- ❌ 30 gün sonra: İade yok (downgrade veya cancel yapılabilir)
- ❌ Abuse tespit edilirse: İade yok

### Nasıl İade Alınır?
1. Dashboard → Settings → Billing → "Cancel Subscription"
2. İade nedeni seçin (opsiyonel)
3. Onaylayın
4. 48 saat içinde iade işleme alınır

### İade Yapılmayan Durumlar
- API abuse/spam tespit edilirse
- Hizmet kötüye kullanılıyorsa
- 30 gün geçmişse
```

### 4.2 Cancellation Flow

**Adım 1: Cancellation Sayfası**
```
┌─────────────────────────────────────────────┐
│  Subscription Cancel                        │
├─────────────────────────────────────────────┤
│                                             │
│  😢 Gidiyorsunuz...                         │
│                                             │
│  Neden iptal ediyorsunuz?                   │
│  ○ Çok pahalı                               │
│  ○ Feature eksik                            │
│  ○ Başka tool'a geçtim                      │
│  ○ Geçici olarak ihtiyacım yok              │
│  ○ Diğer: ________                          │
│                                             │
│  ┌─────────────────────────────────────┐    │
││  💡 Bunu deneyin:                     │    │
││                                       │    │
││  → $29/ay Plan'a downgrade            │    │
││  → 3 ay %20 indirim                   │    │
││  → Subscription pause (3 ay)          │    │
│└─────────────────────────────────────┘    │
│                                             │
│  [Downgrade]  [Pause]  [Hala İptal Et]     │
│                                             │
└─────────────────────────────────────────────┘
```

**Adım 2: Confirmation**
```
┌─────────────────────────────────────────────┐
│  İade Onayı                                 │
├─────────────────────────────────────────────┤
│                                             │
│  İade tutarı: $XX.XX (pro-rated)           │
│  İade süresi: 48 saat                       │
│  Erişim: [tarih] tarihine kadar            │
│                                             │
│  [İptal Et ve İade Al]  [Geri Dön]         │
│                                             │
└─────────────────────────────────────────────┘
```

**Adım 3: Confirmation Email**
```
Subject: HookSniff aboneliğiniz iptal edildi

Merhaba [isim],

Aboneliğiniz başarıyla iptal edildi.

İade detayları:
- Tutar: $XX.XX
- Yöntem: [kart/bank transfer]
- Süre: 48 saat

Erişim: [tarih] tarihine kadar devam edecek.

Geri dönmek isterseniz: [link]

Neden iptal ettiğinizi paylaşabilir misiniz? [survey link]

Teşekkürler,
HookSniff ekibi
```

### 4.3 Downgrade Akışı

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
5. Mevcut dönem sonunda geçerli
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
5. Pro-rated hesapla
```

### 4.4 Win-Back Offers

| Durum | Offer | Süre |
|-------|-------|------|
| Cancel (fiyat) | %20 indirim (3 ay) | 7 gün geçerli |
| Cancel (feature) | Feature roadmap paylaş | Hemen |
| Cancel (geçici) | 3 ay pause | 14 gün geçerli |
| 30 gün inactive | %15 indirim | 30 gün geçerli |
| 60 gün inactive | 1 ay ücretsiz | 14 gün geçerli |

### 4.5 Pause Subscription

**Neden Pause?**
- Geçici olarak ihtiyacı olmayan kullanıcıları tutar
- Cancel'dan daha düşük churn
- Geri dönüş oranı yüksek

**Pause Koşulları:**
- Maksimum 3 ay pause
- Pause süresince ücret alınmaz
- Erişim limited (read-only dashboard)
- Pause bitince otomatik resume

---

## 5. Uygulama Planı

### Faz 1: Policy + Pages (Gün 1-3)
| Adım | Süre | Detay |
|------|------|-------|
| Refund policy yaz | 1 saat | Legal compliant |
| Cancellation sayfası tasarla | 2 saat | React component |
| Downgrade flow kodla | 3 saat | Polar.sh API |
| Email template'leri | 2 saat | 4 template |
| FAQ sayfası güncelle | 1 saat | Refund Q&A |

### Faz 2: Automation (Gün 4-7)
| Adım | Süre | Detay |
|------|------|-------|
| Auto-refund logic | 3 saat | Polar.sh webhook |
| Pro-rated calculation | 2 saat | Backend logic |
| Win-back automation | 3 saat | Email sequence |
| Pause feature | 4 saat | Polar.sh API |
| Test tüm flow'lar | 2 saat | E2E test |

### Faz 3: Monitoring (Gün 8-14)
| Adım | Süre | Detay |
|------|------|-------|
| Cancellation analytics | 2 saat | PostHog events |
| Refund metrics dashboard | 1 saat | PostHog insight |
| Exit survey analysis | 1 saat | Manual review |
| Weekly report automation | 1 saat | Script |

---

## 6. Metrikler

| Metrik | Hedef | Ölçüm |
|--------|-------|-------|
| Refund rate | <%5 | Polar.sh |
| Cancellation rate | <%10/ay | Polar.sh |
| Win-back success | >%15 | Email analytics |
| Pause usage | <%5 | Polar.sh |
| Downgrade rate | <%8 | Polar.sh |
| Exit survey completion | >%40 | Survey tool |
| Refund processing time | <48 saat | Manual tracking |
| Support tickets (refund) | <10/ay | Discord/email |

### Exit Survey Analizi

**Aylık Review:**
1. En çok neden cancel ediyorlar?
2. Hangi feature eksik?
3. Fiyat mı, feature mı, başka tool mu?
4. Win-back offer etkili mi?
5. Pause tercih edenler geri dönüyor mu?

---

## 7. Riskler

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| Abuse (refund farming) | Düşük | Orta | 14 gün limit, abuse detection |
| Yüksek refund rate | Orta | Yüksek | Exit survey, iteration |
| Legal uyumsuzluk | Düşük | Yüksek | Legal review, KVKK/GDPR |
| Polar.sh API limitations | Düşük | Orta | Manual fallback |
| Dark pattern şikayeti | Düşük | Yüksek | Clear, honest UI |
| Pro-rated hesaplama hatası | Düşük | Orta | Thorough testing |
