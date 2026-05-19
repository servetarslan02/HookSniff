# 🛠️ HookSniff — Aşamalı Uygulama Planı

> **Tarih:** 2026-05-20 01:01 GMT+8
> **Kural:** Her aşama = 1 oturum (1 saat). Sıralı ilerleme. Bitmeden geçilmez.
> **Referans:** `EKSIKLER-REVIZE.md`, `RAKIP-ANALIZ.md`, `ADMIN-PANEL-ANALIZ.md`

---

## 📋 İçindekiler

1. [Genel Kurallar](#1-genel-kurallar)
2. [Aşama 1 — Kullanıcı Davet Sistemi](#aşama-1)
3. [Aşama 2 — Şifre Sıfırlama + Session Yönetimi](#aşama-2)
4. [Aşama 3 — Dunning (Ödeme Kurtarma)](#aşama-3)
5. [Aşama 4 — Customer Health Score](#aşama-4)
6. [Aşama 5 — Promosyon/Kupon Kodu](#aşama-5)
7. [Aşama 6 — Revenue Forecast + Cancel Flow](#aşama-6)
8. [Aşama 7 — Platform Status Page + Broadcast](#aşama-7)
9. [Aşama 8 — Queue Yönetimi + Circuit Breaker UI](#aşama-8)
10. [Aşama 9 — Event Deduplication + PDF Fatura](#aşama-9)
11. [Aşama 10 — Onboarding Tracker + API Usage](#aşama-10)
12. [Aşama 11 — Şüpheli Aktivite + IP Blocklist](#aşama-11)
13. [Aşama 12 — Son Dokunuşlar + Test](#aşama-12)

---

## 1. Genel Kurallar

### Her Aşamada Yapılacaklar (ZORUNLU)
```
1. ✅ Backend endpoint(ler) yaz (Rust/Axum)
2. ✅ DB migration yaz (gerekirse)
3. ✅ Frontend sayfa/bileşen yaz (Next.js/TypeScript)
4. ✅ i18n key'leri ekle (EN + TR)
5. ✅ React Query hook yaz
6. ✅ cargo test çalıştır (Rust testleri geçmeli)
7. ✅ next build çalıştır (Frontend build geçmeli)
8. ✅ git commit + push
9. ✅ MEMORY.md güncelle
10. ✅ NEXT_SESSION.md güncelle
```

### Dosya Haritası
```
Backend:  api/src/routes/admin.rs (veya yeni module)
Frontend: dashboard/src/app/[locale]/admin/...
Hooks:    dashboard/src/hooks/useAdminData.ts
API:      dashboard/src/lib/api.ts
i18n:     dashboard/src/messages/en.json + tr.json
DB:       api/migrations/XXX_*.sql
```

### Test Komutları
```bash
cd api && cargo test           # Rust testleri
cd dashboard && npm run build  # Frontend build
```

---

## AŞAMA 1 — Kullanıcı Davet Sistemi
**Süre:** 1 oturum | **Öncelik:** 🔴 Kritik

### Hedef
Admin email ile kullanıcı davet edebilsin. Davet linki ile kayıt olsun.

### Adımlar

#### 1.1 DB Migration
**Dosya:** `api/migrations/065_user_invites.sql`
```sql
CREATE TABLE IF NOT EXISTS user_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    invited_by UUID NOT NULL REFERENCES customers(id),
    plan TEXT NOT NULL DEFAULT 'developer',
    token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, expired, revoked
    accepted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_user_invites_email ON user_invites(email);
CREATE INDEX idx_user_invites_token ON user_invites(token);
CREATE INDEX idx_user_invites_status ON user_invites(status);
```

#### 1.2 Backend — Rust
**Dosya:** `api/src/routes/admin.rs` (veya yeni `admin_invites.rs`)

**Endpoint'ler:**
| Method | Path | İşlev |
|--------|------|-------|
| POST | `/admin/users/invite` | Davet oluştur + email gönder |
| GET | `/admin/users/invites` | Davet listesi |
| DELETE | `/admin/users/invites/{id}` | Davet iptal et |
| POST | `/admin/users/invites/{id}/resend` | Davet yeniden gönder |
| GET | `/auth/invite/{token}` | Davet doğrulama (public) |

**İş akışı:**
```
1. Admin → POST /admin/users/invite { email, plan }
2. Sistem → Token oluştur, user_invites tablosuna kaydet
3. Sistem → Davet email'i gönder (Resend API)
4. Kullanıcı → Email'deki linke tıklar
5. Kullanıcı → GET /auth/invite/{token} (sayfa yüklenir)
6. Kullanıcı → Kayıt formu (email önceden doldurulmuş)
7. Kullanıcı → POST /auth/register { email, password, invite_token }
8. Sistem → user_invites.status = 'accepted'
```

#### 1.3 Frontend — Admin Paneli
**Dosya:** `admin/users/page.tsx`

**Değişiklikler:**
- "Invite User" butonu (header'a ekle)
- Invite modal: Email input, plan seçici
- Davet listesi tablosu (status badge: pending/accepted/expired/revoked)
- Tekrar gönder / iptal butonları

#### 1.4 Frontend — Davet Sayfası (Public)
**Dosya:** `app/[locale]/invite/[token]/page.tsx`

**İçerik:**
- Token doğrulama
- Kayıt formu (email önceden doldurulmuş)
- Hata durumları (expired, invalid, already accepted)

#### 1.5 Email Şablonu
**İçerik:**
```
Konu: [HookSniff] You've been invited to join HookSniff

Body:
- Logo
- "X has invited you to HookSniff"
- Plan bilgisi
- "Accept Invite" butonu
- Link: https://hooksniff.vercel.app/invite/{token}
```

#### 1.6 i18n
**Dosya:** `en.json` + `tr.json`
```json
{
  "admin": {
    "inviteUser": "Invite User",
    "inviteEmail": "Email address",
    "invitePlan": "Plan",
    "inviteSend": "Send Invite",
    "inviteSent": "Invite sent successfully",
    "inviteResend": "Resend Invite",
    "inviteRevoke": "Revoke Invite",
    "invitePending": "Pending",
    "inviteAccepted": "Accepted",
    "inviteExpired": "Expired",
    "inviteRevoked": "Revoked"
  }
}
```

### Kabul Kriterleri
- [ ] Admin kullanıcı davet edebiliyor
- [ ] Davet email'i gönderiliyor
- [ ] Davet linki çalışıyor
- [ ] Kayıt formu email ile açılıyor
- [ ] Kayıt sonrası davet "accepted" oluyor
- [ ] Davet listesi görünüyor
- [ ] İptal / tekrar gönderme çalışıyor
- [ ] Süresi dolmuş davet hata gösteriyor
- [ ] cargo test geçiyor
- [ ] next build geçiyor

---

## AŞAMA 2 — Şifre Sıfırlama + Session Yönetimi
**Süre:** 1 oturum | **Öncelik:** 🔴 Kritik

### Hedef
Admin kullanıcı şifresini sıfırlasın. Aktif oturumları yönetsin.

### Adımlar

#### 2.1 Backend — Şifre Sıfırlama
**Endpoint'ler:**
| Method | Path | İşlev |
|--------|------|-------|
| POST | `/admin/users/{id}/reset-password` | Sıfırlama linki gönder |
| POST | `/admin/users/{id}/set-password` | Doğrudan şifre belirle |

**İş akışı:**
```
1. Admin → POST /admin/users/{id}/reset-password
2. Sistem → Reset token oluştur, email gönder
3. Kullanıcı → Email'deki linke tıklar
4. Kullanıcı → Yeni şifre belirler
```

#### 2.2 Backend — Session Yönetimi
**Tablo:** `user_sessions` (eğer yoksa)
```sql
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    device TEXT,
    location TEXT,
    last_active TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
```

**Endpoint'ler:**
| Method | Path | İşlev |
|--------|------|-------|
| GET | `/admin/users/{id}/sessions` | Aktif oturumları listele |
| DELETE | `/admin/users/{id}/sessions/{sid}` | Tek oturumu kapat |
| DELETE | `/admin/users/{id}/sessions` | Tüm oturumları kapat |

#### 2.3 Frontend — Admin User Detail
**Dosya:** `admin/users/[id]/components/OverviewTab.tsx`

**Değişiklikler:**
- "Reset Password" butonu (Actions section)
- "Sessions" butonu → Session listesi modal

#### 2.4 Frontend — Session Modal
**Dosya:** `admin/users/[id]/components/SessionModal.tsx`

**İçerik:**
- Aktif oturum listesi (cihaz, IP, son aktivite, konum)
- Tek oturumu kapat butonu
- Tüm oturumları kapat butonu

#### 2.5 i18n
```json
{
  "admin": {
    "resetPassword": "Reset Password",
    "resetPasswordConfirm": "Send reset link to this user?",
    "resetPasswordSent": "Password reset link sent",
    "sessions": "Active Sessions",
    "sessionDevice": "Device",
    "sessionIp": "IP Address",
    "sessionLastActive": "Last Active",
    "sessionRevoke": "Revoke",
    "sessionRevokeAll": "Revoke All Sessions"
  }
}
```

### Kabul Kriterleri
- [ ] Admin şifre sıfırlama linki gönderebiliyor
- [ ] Kullanıcı yeni şifre belirleyebiliyor
- [ ] Aktif oturumlar listeleniyor
- [ ] Tek oturum kapatılabiliyor
- [ ] Tüm oturumlar kapatılabiliyor
- [ ] cargo test geçiyor
- [ ] next build geçiyor

---

## AŞAMA 3 — Dunning (Ödeme Kurtarma)
**Süre:** 2 oturum | **Öncelik:** 🔴 Kritik

### Hedef
Başarısız ödeme olduğunda otomatik email dizisi ile geri kazanım.

### Adımlar

#### 3.1 DB Migration
**Dosya:** `api/migrations/066_dunning.sql`
```sql
CREATE TABLE IF NOT EXISTS dunning_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    invoice_id TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- active, recovered, failed, canceled
    current_step INT NOT NULL DEFAULT 0,
    total_steps INT NOT NULL DEFAULT 4,
    next_action_at TIMESTAMPTZ,
    recovery_amount_cents BIGINT,
    recovered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_dunning_customer ON dunning_campaigns(customer_id);
CREATE INDEX idx_dunning_status ON dunning_campaigns(status);
CREATE INDEX idx_dunning_next_action ON dunning_campaigns(next_action_at);

CREATE TABLE IF NOT EXISTS dunning_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES dunning_campaigns(id) ON DELETE CASCADE,
    step INT NOT NULL,
    email_type TEXT NOT NULL, -- reminder, warning, final, grace
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ
);
CREATE INDEX idx_dunning_emails_campaign ON dunning_emails(campaign_id);
```

#### 3.2 Backend — Dunning Module
**Dosya:** `api/src/dunning.rs` (yeni module)

**Dunning Adımları:**
| Adım | Gün | Email Tipi | Konu |
|------|-----|------------|------|
| 1 | 1. gün | reminder | "Payment failed — update your card" |
| 2 | 3. gün | warning | "Action required — your account will be suspended" |
| 3 | 7. gün | final | "Final notice — account suspension in 48h" |
| 4 | 14. gün | grace | "Account suspended — restore now" |

**Endpoint'ler:**
| Method | Path | İşlev |
|--------|------|-------|
| GET | `/admin/dunning` | Dunning kampanya listesi |
| GET | `/admin/dunning/stats` | Kurtarma istatistikleri |
| POST | `/admin/dunning/{id}/cancel` | Kampanya iptal et |
| POST | `/admin/dunning/{id}/recover` | Manuel kurtarma işaretle |

**Background Job:**
- Her saat başı: `next_action_at` gelenleri kontrol et
- Email gönder, step artır, `next_action_at` hesapla
- Ödeme başarılı olursa: status = 'recovered'

#### 3.3 Frontend — Admin Revenue
**Dosya:** `admin/revenue/components/RevenueContent.tsx`

**Yeni Section:**
- Dunning kampanya listesi tablosu
- Kurtarma istatistik kartları (toplam, kurtarılan, başarısız, aktif)
- Kampanya detay modal (adımlar, email geçmişi)

#### 3.4 Frontend — Admin Settings
**Dosya:** `admin/settings/components/GeneralTab.tsx`

**Yeni Ayarlar:**
- Dunning enable/disable toggle
- Adım sayısı (varsayılan: 4)
- Adım günleri (varsayılan: 1, 3, 7, 14)
- Grace period süresi

#### 3.5 i18n
```json
{
  "admin": {
    "dunning": "Dunning",
    "dunningCampaigns": "Dunning Campaigns",
    "dunningRecovered": "Recovered",
    "dunningFailed": "Failed",
    "dunningActive": "Active",
    "dunningRecoveryRate": "Recovery Rate",
    "dunningStep": "Step",
    "dunningCancel": "Cancel Campaign",
    "dunningManualRecover": "Mark as Recovered"
  }
}
```

### Kabul Kriterleri
- [ ] Başarısız ödeme → dunning kampanyası başlıyor
- [ ] 4 adımlık email dizisi gönderiliyor
- [ ] Ödeme başarılı → kampanya "recovered"
- [ ] Admin kampanya listesini görebiliyor
- [ ] Admin kampanya iptal edebiliyor
- [ ] Kurtarma istatistikleri görünüyor
- [ ] cargo test geçiyor
- [ ] next build geçiyor

---

## AŞAMA 4 — Customer Health Score
**Süre:** 1.5 oturum | **Öncelik:** 🔴 Kritik

### Hedef
Her müşterinin sağlık skorunu hesapla, risk altındakileri tespit et.

### Adımlar

#### 4.1 DB Migration
**Dosya:** `api/migrations/067_health_score.sql`
```sql
CREATE TABLE IF NOT EXISTS customer_health_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE UNIQUE,
    score INT NOT NULL DEFAULT 50, -- 0-100
    usage_score INT NOT NULL DEFAULT 50,
    payment_score INT NOT NULL DEFAULT 50,
    endpoint_score INT NOT NULL DEFAULT 50,
    engagement_score INT NOT NULL DEFAULT 50,
    risk_level TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
    factors JSONB, -- detaylı faktörler
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_health_score_customer ON customer_health_scores(customer_id);
CREATE INDEX idx_health_score_risk ON customer_health_scores(risk_level);
```

#### 4.2 Backend — Health Score Module
**Dosya:** `api/src/health_score.rs`

**Skor Hesaplama:**
```rust
fn calculate_health_score(customer_id: Uuid) -> HealthScore {
    // 1. Usage Score (0-100)
    //    - Son 30 gün teslimat sayısı
    //    - Son 30 gün vs önceki 30 gün trend
    //    - Başarı oranı
    
    // 2. Payment Score (0-100)
    //    - Ödeme durumu (güncel/gecikmiş/başarısız)
    //    - Son ödeme tarihi
    //    - Dunning kampanyası var mı
    
    // 3. Endpoint Score (0-100)
    //    - Aktif endpoint sayısı
    //    - Endpoint sağlık durumu
    //    - Son teslimat tarihi
    
    // 4. Engagement Score (0-100)
    //    - Son login tarihi
    //    - API çağrı sıklığı
    //    - Dashboard kullanım
    
    // Genel skor = weighted average
    let score = (usage * 0.3) + (payment * 0.25) + (endpoint * 0.2) + (engagement * 0.25);
    
    // Risk seviyesi
    let risk = match score {
        80..=100 => "low",
        60..=79 => "medium",
        40..=59 => "high",
        _ => "critical",
    };
    
    HealthScore { score, usage_score, payment_score, endpoint_score, engagement_score, risk_level, factors }
}
```

**Endpoint'ler:**
| Method | Path | İşlev |
|--------|------|-------|
| GET | `/admin/health-scores` | Tüm skorlar (risk filtresi ile) |
| GET | `/admin/users/{id}/health-score` | Tek kullanıcı skoru |
| POST | `/admin/health-scores/recalculate` | Toplu yeniden hesaplama |

**Background Job:**
- Her gün gece yarısı: Tüm müşteriler için skor hesapla

#### 4.3 Frontend — Admin Users
**Dosya:** `admin/users/page.tsx`

**Değişiklikler:**
- Tabloya "Health" kolonu ekle (skor + renk: yeşil/sarı/kırmızı)
- Filtreye "Risk Level" ekle (low/medium/high/critical)
- "At-Risk Customers" quick filter butonu

#### 4.4 Frontend — Admin User Detail
**Dosya:** `admin/users/[id]/components/OverviewTab.tsx`

**Değişiklikler:**
- Health score kartı (büyük, renkli)
- Faktör breakdown (usage, payment, endpoint, engagement — mini grafik)
- Trend göstergesi (artış/azalış)

#### 4.5 Frontend — Admin Overview
**Dosya:** `admin/components/HealthTab.tsx`

**Yeni Section:**
- At-risk müşteri sayısı kartı
- Risk dağılımı pie chart (low/medium/high/critical)
- Son 10 at-risk müşteri listesi

### Kabul Kriterleri
- [ ] Health score hesaplanıyor (0-100)
- [ ] 4 faktör breakdown görünüyor
- [ ] Risk seviyesi doğru (low/medium/high/critical)
- [ ] Admin users tablosunda health kolonu var
- [ ] Risk filtresi çalışıyor
- [ ] At-risk customers listesi var
- [ ] Günlük otomatik hesaplama çalışıyor
- [ ] cargo test geçiyor
- [ ] next build geçiyor

---

## AŞAMA 5 — Promosyon/Kupon Kodu
**Süre:** 2 oturum | **Öncelik:** 🔴 Kritik

### Hedef
İndirim kuponları oluştur, kullan, takip et.

### Adımlar

#### 5.1 DB Migration
**Dosya:** `api/migrations/068_coupons.sql`
```sql
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'percentage', -- percentage, fixed
    value INT NOT NULL, -- percentage (10 = %10) veya cents
    currency TEXT NOT NULL DEFAULT 'usd',
    max_uses INT,
    used_count INT NOT NULL DEFAULT 0,
    valid_plans TEXT[], -- hangi planlar için geçerli
    valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES customers(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);

CREATE TABLE IF NOT EXISTS coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    discount_amount_cents BIGINT NOT NULL,
    used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_coupon_usages_coupon ON coupon_usages(coupon_id);
CREATE INDEX idx_coupon_usages_customer ON coupon_usages(customer_id);
```

#### 5.2 Backend
**Endpoint'ler:**
| Method | Path | İşlev |
|--------|------|-------|
| GET | `/admin/coupons` | Kupon listesi |
| POST | `/admin/coupons` | Kupon oluştur |
| PUT | `/admin/coupons/{id}` | Kupon güncelle |
| DELETE | `/admin/coupons/{id}` | Kupon sil |
| POST | `/billing/apply-coupon` | Kupon uygula (checkout'ta) |
| GET | `/admin/coupons/{id}/usages` | Kullanım geçmişi |

#### 5.3 Frontend — Admin Revenue
**Yeni Section: Coupon Management**
- Kupon listesi tablosu (kod, tip, değer, kullanım, durum)
- Kupon oluşturma formu
- Kupon düzenleme/silme
- Kullanım analytics

#### 5.4 Frontend — Billing Page
**Dosya:** `billing/page.tsx`

**Değişiklikler:**
- Checkout'ta "Coupon Code" input
- Kupon doğrulama + indirim gösterimi

### Kabul Kriterleri
- [ ] Kupon oluşturulabiliyor (percentage/fixed)
- [ ] Kupon kodu checkout'ta çalışıyor
- [ ] İndirim doğru hesaplanıyor
- [ ] Kullanım limiti çalışıyor
- [ ] Plan bazlı filtre çalışıyor
- [ ] Kupon yönetimi admin panelinde var
- [ ] cargo test geçiyor
- [ ] next build geçiyor

---

## AŞAMA 6 — Revenue Forecast + Cancel Flow
**Süre:** 1.5 oturum | **Öncelik:** 🟡 Önemli

### 6.1 Revenue Forecast (0.5 oturum)
**Backend endpoint:** `GET /admin/revenue/forecast`

**Hesaplama:**
```rust
// Son 3 aylık ortalama büyüme oranı
let growth_rate = (mrr_current / mrr_3_months_ago).powf(1.0/3.0) - 1.0;

// 3 senaryo
let best_case  = mrr_current * (1.0 + growth_rate * 1.5).powi(months);
let base_case  = mrr_current * (1.0 + growth_rate).powi(months);
let worst_case = mrr_current * (1.0 + growth_rate * 0.5).powi(months);

// Churn etkisi dahil
let net_growth = growth_rate - churn_rate;
```

**Frontend:** `admin/revenue/components/RevenueContent.tsx`
- Forecast grafiği (3/6/12 ay, area chart)
- 3 senaryo çizgisi: Best (yeşil), Base (mavi), Worst (kırmızı)
- Forecast kartları: "3 ay sonra: $X", "6 ay: $Y", "12 ay: $Z"

**i18n:**
```json
{
  "admin": {
    "revenueForecast": "Revenue Forecast",
    "bestCase": "Best Case",
    "baseCase": "Base Case",
    "worstCase": "Worst Case",
    "forecastMonths": "Forecast Period",
    "growthRate": "Growth Rate"
  }
}
```

### 6.2 Cancel Flow (1 oturum)
**DB Migration:** `api/migrations/069_cancel_feedback.sql`
```sql
CREATE TABLE IF NOT EXISTS cancel_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    reason TEXT NOT NULL, -- too_expensive, not_using, missing_features, found_alternative, other
    feedback_text TEXT,
    offer_made TEXT, -- discount, pause, roadmap, none
    offer_accepted BOOLEAN DEFAULT false,
    original_plan TEXT NOT NULL,
    canceled_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_cancel_feedback_customer ON cancel_feedback(customer_id);
CREATE INDEX idx_cancel_feedback_reason ON cancel_feedback(reason);
```

**Backend endpoint:** `POST /billing/cancel-feedback`
```rust
// İptal akışı:
// 1. Kullanıcı cancel butonuna basar
// 2. Modal açılır: sebep seçimi
// 3. Sebebe göre teklif:
//    - too_expensive → %20 indirim (3 ay)
//    - not_using → Pause subscription (6 aya kadar)
//    - missing_features → Roadmap linki
//    - found_alternative → Geri bildirim formu
//    - other → Serbest metin
// 4. Teklif kabul edilirse → plan güncelle, feedback kaydet
// 5. Teklif reddedilirse → iptal gerçekleş, feedback kaydet
```

**Frontend:** `billing/page.tsx` → Cancel modal
- Adım 1: Sebep seçimi (radio butonlar)
- Adım 2: Teklif gösterimi (sebebe göre değişir)
- Adım 3: Son onay
- Sonuç: Başarı mesajı veya teklif kabul mesajı

**i18n:**
```json
{
  "billing": {
    "cancelSubscription": "Cancel Subscription",
    "cancelReason": "Why are you canceling?",
    "reasonTooExpensive": "Too expensive",
    "reasonNotUsing": "Not using it enough",
    "reasonMissingFeatures": "Missing features",
    "reasonFoundAlternative": "Found an alternative",
    "reasonOther": "Other",
    "cancelOffer": "We have an offer for you",
    "offerDiscount": "Get 20% off for 3 months",
    "offerPause": "Pause your subscription for up to 6 months",
    "offerRoadmap": "See what's coming next",
    "acceptOffer": "Accept Offer",
    "declineAndCancel": "Decline and Cancel",
    "cancelConfirm": "Are you sure? This cannot be undone.",
    "cancelSuccess": "Subscription canceled",
    "offerAccepted": "Offer applied successfully"
  }
}
```

### Kabul Kriterleri (AŞAMA 6)
- [ ] Forecast grafiği 3/6/12 ay gösteriyor
- [ ] 3 senaryo doğru hesaplanıyor
- [ ] Cancel modal açılıyor
- [ ] Sebep seçimi çalışıyor
- [ ] Sebebe göre teklif gösteriliyor
- [ ] Teklif kabul → plan güncelleniyor
- [ ] Teklif red → iptal gerçekleşiyor
- [ ] Feedback kaydediliyor
- [ ] cargo test geçiyor
- [ ] next build geçiyor

---

## AŞAMA 7 — Platform Status Page + Broadcast
**Süre:** 1 oturum | **Öncelik:** 🟡 Önemli

### 7.1 Status Page (0.5 oturum)
**DB Migration:** `api/migrations/070_incidents.sql`
```sql
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'investigating', -- investigating, identified, monitoring, resolved
    severity TEXT NOT NULL DEFAULT 'minor', -- minor, major, critical
    affected_services TEXT[], -- api, dashboard, webhook, db, redis
    created_by UUID REFERENCES customers(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_created ON incidents(created_at DESC);

CREATE TABLE IF NOT EXISTS incident_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    message TEXT NOT NULL,
    created_by UUID REFERENCES customers(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_incident_updates_incident ON incident_updates(incident_id);
```

**Backend endpoint'ler:**
| Method | Path | İşlev |
|--------|------|-------|
| GET | `/status/incidents` | Aktif incident'ler (public) |
| GET | `/status/incidents/history` | Geçmiş incident'ler (public) |
| POST | `/admin/incidents` | Incident oluştur (admin) |
| PUT | `/admin/incidents/{id}` | Incident güncelle (admin) |
| POST | `/admin/incidents/{id}/updates` | Güncelleme ekle (admin) |
| PUT | `/admin/incidents/{id}/resolve` | Incident çöz (admin) |

**Frontend — Public:**
**Dosya:** `app/[locale]/status/page.tsx` (auth gerektirmez)
- Sistem durumu kartı (operational ✅ / degraded ⚠️ / outage 🔴)
- Aktif incident'ler (timeline)
- Geçmiş incident'ler (son 30 gün)
- Subscribe butonu (email ile bildirim)

**Frontend — Admin:**
**Dosya:** `admin/status/page.tsx`
- Incident oluşturma formu (title, severity, affected services)
- Incident listesi (aktif/çözülmüş)
- Güncelleme ekleme formu
- Çöz butonu

**i18n:**
```json
{
  "status": {
    "title": "System Status",
    "operational": "All Systems Operational",
    "degraded": "Some Systems Degraded",
    "outage": "Major Outage",
    "incident": "Incident",
    "investigating": "Investigating",
    "identified": "Identified",
    "monitoring": "Monitoring",
    "resolved": "Resolved",
    "subscribe": "Subscribe to Updates",
    "affectedServices": "Affected Services"
  },
  "admin": {
    "createIncident": "Create Incident",
    "incidentTitle": "Incident Title",
    "incidentSeverity": "Severity",
    "incidentServices": "Affected Services",
    "addUpdate": "Add Update",
    "resolveIncident": "Resolve Incident"
  }
}
```

### 7.2 Broadcast Notification (0.5 oturum)
**Backend endpoint:** `POST /admin/broadcast`
```rust
// Body: { subject, body, target: "all"|"plan"|"segment", plan_filter, channel: "email"|"in-app"|"both" }
// 1. Hedef kullanıcıları belirle
// 2. Email → Resend API (batch 50'şer)
// 3. In-app → notifications tablosuna ekle
// 4. Audit log kaydı
```

**Frontend:** `admin/email/page.tsx` → "Broadcast" sekmesi
- Konu + içerik formu
- Hedef seçimi: Tüm kullanıcılar / Plan bazlı / Segment
- Kanal seçimi: Email + In-app / Sadece email / Sadece in-app
- Gönderim geçmişi

**i18n:**
```json
{
  "admin": {
    "broadcast": "Broadcast Notification",
    "broadcastTarget": "Target",
    "broadcastAll": "All Users",
    "broadcastPlan": "By Plan",
    "broadcastChannel": "Channel",
    "broadcastEmail": "Email",
    "broadcastInApp": "In-App",
    "broadcastBoth": "Both",
    "broadcastSend": "Send Broadcast",
    "broadcastSent": "Broadcast sent to {count} users"
  }
}
```

### Kabul Kriterleri (AŞAMA 7)
- [ ] Public status page çalışıyor (auth gerektirmez)
- [ ] Sistem durumu doğru gösteriliyor
- [ ] Incident oluşturulabiliyor (admin)
- [ ] Incident güncellenebiliyor
- [ ] Incident çözülebiliyor
- [ ] Broadcast gönderilebiliyor
- [ ] Plan bazlı filtre çalışıyor
- [ ] Email + in-app kanal seçimi çalışıyor
- [ ] cargo test geçiyor
- [ ] next build geçiyor

---

## AŞAMA 8 — Queue Yönetimi + Circuit Breaker UI
**Süre:** 0.5 oturum | **Öncelik:** 🟡 Önemli

### 8.1 Queue Yönetimi
**Backend endpoint:** `GET /admin/queue/details`
```rust
// Response: {
//   pending: int,
//   processing: int,
//   failed: int,
//   oldest_pending_at: timestamp,
//   stuck_deliveries: Vec<{id, endpoint_url, created_at, attempts}>,
//   capacity: { max_concurrent: int, current_concurrent: int }
// }
```

**Frontend:** `admin/components/system/QueueStatus.tsx` (güncelleme)
- Queue depth grafiği (zaman serisi — son 24 saat)
- Manuel queue temizleme butonu (onay dialogu)
- Stuck delivery listesi (5 dakikadan eski pending'ler)
- Capacity progress bar (current/max)

**i18n:**
```json
{
  "admin": {
    "queueDetails": "Queue Details",
    "stuckDeliveries": "Stuck Deliveries",
    "queueCapacity": "Queue Capacity",
    "clearQueue": "Clear Failed Queue",
    "clearQueueConfirm": "This will remove all failed deliveries. Continue?"
  }
}
```

### 8.2 Circuit Breaker UI
**Backend endpoint:** `GET /admin/circuit-breakers`
```rust
// Response: Vec<{
//   endpoint_id: uuid,
//   endpoint_url: string,
//   state: "closed"|"open"|"half-open",
//   failure_count: int,
//   last_failure_at: timestamp,
//   next_retry_at: timestamp,
//   success_count: int
// }>
```

**Frontend:** `admin/components/system/HealthStatus.tsx` (güncelleme)
- Circuit breaker listesi tablosu
- Durum badge: closed (yeşil), open (kırmızı), half-open (sarı)
- Manuel reset butonu
- Son hata tarihi

**i18n:**
```json
{
  "admin": {
    "circuitBreakers": "Circuit Breakers",
    "circuitClosed": "Closed",
    "circuitOpen": "Open",
    "circuitHalfOpen": "Half-Open",
    "circuitReset": "Reset Circuit Breaker"
  }
}
```

### Kabul Kriterleri (AŞAMA 8)
- [ ] Queue detayları görünüyor (pending/processing/failed)
- [ ] Stuck delivery listesi var
- [ ] Manuel queue temizleme çalışıyor
- [ ] Circuit breaker durumları görünüyor
- [ ] Manuel reset çalışıyor
- [ ] cargo test geçiyor
- [ ] next build geçiyor

---

## AŞAMA 9 — Event Deduplication + PDF Fatura
**Süre:** 1.5 oturum | **Öncelik:** 🟡 Önemli

### 9.1 Event Deduplication (1 oturum)
**DB Migration:** `api/migrations/071_deduplication.sql`
```sql
CREATE TABLE IF NOT EXISTS event_dedup_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL,
    endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
    original_delivery_id UUID,
    duplicate_count INT NOT NULL DEFAULT 1,
    first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_dedup_event ON event_dedup_log(event_id, endpoint_id);
CREATE INDEX idx_dedup_last_seen ON event_dedup_log(last_seen DESC);
```

**Backend:** `api/src/deduplication.rs` (yeni module)
```rust
// Worker'da delivery öncesi kontrol:
// 1. Event ID + Endpoint ID → son X dakika içinde teslim edildi mi?
// 2. Evet → duplicate_count artır, teslim etme
// 3. Hayır → teslim et, dedup_log'a kaydet
// Zaman penceresi: settings'ten oku (varsayılan: 5 dakika)
```

**Backend endpoint'ler:**
| Method | Path | İşlev |
|--------|------|-------|
| GET | `/admin/dedup/stats` | Dedup istatistikleri (filtrelenen sayısı) |
| PUT | `/admin/dedup/settings` | Dedup ayarları (enable/disable, pencere) |

**Frontend:** `admin/settings/components/GeneralTab.tsx` → Deduplication section
- Enable/disable toggle
- Zaman penceresi input (dakika)
- İstatistik kartları: bugün filtrenen, toplam filtrenen, tasarruf

**i18n:**
```json
{
  "admin": {
    "deduplication": "Event Deduplication",
    "dedupEnabled": "Enabled",
    "dedupWindow": "Time Window (minutes)",
    "dedupFiltered": "Filtered Today",
    "dedupTotalFiltered": "Total Filtered",
    "dedupSavings": "Cost Savings"
  }
}
```

### 9.2 PDF Fatura (0.5 oturum)
**Backend:** `api/src/pdf_invoice.rs`
```rust
// HTML template → PDF
// İçerik: Logo, şirket adı, fatura no, tarih, kalemler, toplam, vergi
// Library: wkhtmltopdf veya headless Chrome
// Endpoint: GET /admin/users/{id}/invoices/{invoice_id}/pdf
```

**Frontend:** `admin/users/[id]/components/BillingTab.tsx`
- Fatura listesinde "PDF" indirme butonu (her satırda)
- Tıklanınca → PDF yeni sekmede açılır veya indirilir

**i18n:**
```json
{
  "admin": {
    "downloadPdf": "Download PDF",
    "invoicePdf": "Invoice PDF"
  }
}
```

### Kabul Kriterleri (AŞAMA 9)
- [ ] Aynı event ID filtrelenebiliyor
- [ ] Dedup ayarları çalışıyor (enable/disable, pencere)
- [ ] Dedup istatistikleri görünüyor
- [ ] Fatura PDF'i oluşturulabiliyor
- [ ] PDF indirme butonu çalışıyor
- [ ] PDF içeriği doğru (logo, kalemler, toplam)
- [ ] cargo test geçiyor
- [ ] next build geçiyor

---

## AŞAMA 10 — Onboarding Tracker + API Usage
**Süre:** 1.5 oturum | **Öncelik:** 🟢 İyi Olur

### 10.1 Onboarding Tracker (1 oturum)
**DB Migration:** `api/migrations/072_onboarding_events.sql`
```sql
CREATE TABLE IF NOT EXISTS onboarding_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    step TEXT NOT NULL, -- registered, first_endpoint, first_webhook, first_delivery, active_user
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_onboarding_customer ON onboarding_events(customer_id);
CREATE INDEX idx_onboarding_step ON onboarding_events(step);
```

**Backend endpoint:** `GET /admin/onboarding/funnel`
```rust
// Response: {
//   registered: 1000,
//   first_endpoint: 650,   // %65
//   first_webhook: 400,    // %40
//   first_delivery: 300,   // %30
//   active_user: 200,      // %20
//   avg_time_to_first_endpoint: "2.3 days",
//   avg_time_to_first_delivery: "4.1 days"
// }
```

**Frontend:** `admin/page.tsx` → Overview tab'ında funnel grafiği
- Funnel chart (büyükten küçüğe)
- Her adım için conversion oranı
- Drop-off noktaları (kırmızı ok)
- Ortalama süreler

**i18n:**
```json
{
  "admin": {
    "onboardingFunnel": "Onboarding Funnel",
    "stepRegistered": "Registered",
    "stepFirstEndpoint": "First Endpoint",
    "stepFirstWebhook": "First Webhook",
    "stepFirstDelivery": "First Delivery",
    "stepActiveUser": "Active User",
    "conversionRate": "Conversion Rate",
    "avgTime": "Avg Time",
    "dropOff": "Drop-off"
  }
}
```

### 10.2 API Usage Dashboard (0.5 oturum)
**Backend endpoint:** `GET /admin/users/{id}/api-usage`
```rust
// Response: {
//   total_calls_30d: 15000,
//   daily_calls: [{date: "2026-05-01", count: 500}, ...],
//   rate_limit: { limit: 1000, used: 750, remaining: 250 },
//   top_endpoints: [{url: "...", calls: 5000}, ...],
//   error_rate: 2.3
// }
```

**Frontend:** `admin/users/[id]/components/UsageTab.tsx` (güncelleme)
- API çağrı trendi (line chart — son 30 gün)
- Rate limit kullanımı (progress bar: 750/1000)
- En çok kullanılan endpoint'ler (bar chart)
- Hata oranı kartı

**i18n:**
```json
{
  "admin": {
    "apiUsage": "API Usage",
    "totalCalls": "Total Calls (30d)",
    "dailyCalls": "Daily Calls",
    "rateLimitUsage": "Rate Limit Usage",
    "topEndpoints": "Top Endpoints",
    "errorRate": "Error Rate"
  }
}
```

### Kabul Kriterleri (AŞAMA 10)
- [ ] Funnel grafiği görünüyor (5 adım)
- [ ] Conversion oranları doğru
- [ ] Drop-off noktaları işaretli
- [ ] Ortalama süreler hesaplanıyor
- [ ] API çağrı trendi grafikte
- [ ] Rate limit progress bar çalışıyor
- [ ] Top endpoint'ler listeleniyor
- [ ] cargo test geçiyor
- [ ] next build geçiyor

---

## AŞAMA 11 — Şüpheli Aktivite + IP Blocklist
**Süre:** 1.5 oturum | **Öncelik:** 🟢 İyi Olur

### 11.1 Şüpheli Aktivite Tespiti (1 oturum)
**DB Migration:** `api/migrations/073_suspicious_activity.sql`
```sql
CREATE TABLE IF NOT EXISTS suspicious_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL, -- brute_force, ip_change, api_spike, unusual_endpoint
    severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
    details JSONB, -- {ip, user_agent, attempts, threshold, ...}
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_by UUID REFERENCES customers(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_suspicious_customer ON suspicious_activities(customer_id);
CREATE INDEX idx_suspicious_type ON suspicious_activities(activity_type);
CREATE INDEX idx_suspicious_resolved ON suspicious_activities(resolved);
```

**Backend:** `api/src/suspicious.rs` (yeni module)
```rust
// Tespit kuralları:
// 1. Brute Force: Aynı IP'den 5+ başarısız login / 10 dakika
// 2. IP Change: Farklı IP'den giriş (son 24 saatte 3+ farklı IP)
// 3. API Spike: Son 1 saatte normal kullanımın %200+ üzeri
// 4. Unusual Endpoint: Ani endpoint oluşturma artışı (10+ / saat)

// Her tespit → suspicious_activities tablosuna kayıt
// Critical severity → admin alert (email + in-app)
```

**Backend endpoint'ler:**
| Method | Path | İşlev |
|--------|------|-------|
| GET | `/admin/suspicious` | Şüpheli aktivite listesi (filtre: type, severity, resolved) |
| PUT | `/admin/suspicious/{id}/resolve` | Çözüldü işaretle |
| DELETE | `/admin/suspicious/{id}` | Sil |

**Frontend:** `admin/page.tsx` → Health tab'ında suspicious activity section
- Şüpheli aktivite listesi tablosu
- Tür ikonları: brute_force 🔐, ip_change 🌐, api_spike 📈, unusual_endpoint 🔗
- Severity badge'leri: low (sarı), medium (turuncu), high (kırmızı), critical (koyu kırmızı)
- Çöz butonu
- Son 24 saat filtresi

**i18n:**
```json
{
  "admin": {
    "suspiciousActivity": "Suspicious Activity",
    "bruteForce": "Brute Force",
    "ipChange": "IP Change",
    "apiSpike": "API Spike",
    "unusualEndpoint": "Unusual Endpoint",
    "severityLow": "Low",
    "severityMedium": "Medium",
    "severityHigh": "High",
    "severityCritical": "Critical",
    "resolveActivity": "Mark as Resolved"
  }
}
```

### 11.2 IP Blocklist (0.5 oturum)
**DB Migration:** `api/migrations/074_ip_blocklist.sql`
```sql
CREATE TABLE IF NOT EXISTS ip_blocklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL,
    cidr_mask INT, -- null = tek IP, /24 = tüm subnet
    reason TEXT,
    blocked_by UUID REFERENCES customers(id),
    auto_blocked BOOLEAN NOT NULL DEFAULT false, -- suspicious activity sonrası
    expires_at TIMESTAMPTZ, null = süresiz
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ip_blocklist_ip ON ip_blocklist(ip_address);
CREATE INDEX idx_ip_blocklist_expires ON ip_blocklist(expires_at);
```

**Backend:** `api/src/ip_blocklist.rs` (yeni module)
```rust
// Middleware: Her istekte IP kontrol
// - ip_blocklist tablosunda var mı?
// - CIDR mask ile eşleşme kontrolü
// - Süresi dolmuş kayıtları yoksay
// - Eşleşen → 403 Forbidden döndür
```

**Backend endpoint'ler:**
| Method | Path | İşlev |
|--------|------|-------|
| GET | `/admin/ip-blocklist` | Blocklist |
| POST | `/admin/ip-blocklist` | IP ekle |
| DELETE | `/admin/ip-blocklist/{id}` | IP kaldır |

**Frontend:** `admin/settings/components/GeneralTab.tsx` → IP Blocklist section
- IP blocklist tablosu (IP, sebep, tarih, süre)
- IP ekleme formu (IP + sebep + süre)
- IP kaldırma butonu
- Otomatik engellenen IP'ler (suspicious activity sonrası)

**i18n:**
```json
{
  "admin": {
    "ipBlocklist": "IP Blocklist",
    "addIp": "Add IP",
    "ipAddress": "IP Address",
    "blockReason": "Reason",
    "blockDuration": "Duration",
    "autoBlocked": "Auto-blocked",
    "removeBlock": "Remove Block"
  }
}
```

### Kabul Kriterleri (AŞAMA 11)
- [ ] Brute force tespiti çalışıyor (5+ başarısız login)
- [ ] IP change tespiti çalışıyor (3+ farklı IP)
- [ ] API spike tespiti çalışıyor (%200+ artış)
- [ ] Şüpheli aktivite listesi görünüyor
- [ ] Severity badge'leri doğru
- [ ] Çöz butonu çalışıyor
- [ ] IP blocklist yönetimi çalışıyor
- [ ] Blocklist'teki IP → 403 alıyor
- [ ] Otomatik engelleme çalışıyor
- [ ] cargo test geçiyor
- [ ] next build geçiyor

---

## AŞAMA 12 — Son Dokunuşlar + Test
**Süre:** 1 oturum | **Öncelik:** 🟢 İyi Olur

### 12.1 Kapsamlı Test
- Tüm yeni endpoint'lerin test edilmesi
- Tüm yeni sayfaların test edilmesi
- Edge case'lerin kontrolü
- i18n doğrulama (EN + TR)

### 12.2 Dokümantasyon
- Yeni özelliklerin docs sayfalarına eklenmesi
- API reference güncellenmesi
- README güncellenmesi

### 12.3 Son Temizlik
- Unused code temizliği
- Console.log temizliği
- TypeScript strict mode kontrolü
- Lighthouse score kontrolü

---

## 📊 Toplam Özet

| Aşama | Özellik | Süre | Durum |
|-------|---------|------|-------|
| 1 | Kullanıcı Davet Sistemi | 1 oturum | ⬜ |
| 2 | Şifre Sıfırlama + Session | 1 oturum | ⬜ |
| 3 | Dunning (Ödeme Kurtarma) | 2 oturum | ⬜ |
| 4 | Customer Health Score | 1.5 oturum | ⬜ |
| 5 | Promosyon/Kupon Kodu | 2 oturum | ⬜ |
| 6 | Revenue Forecast + Cancel Flow | 1.5 oturum | ⬜ |
| 7 | Status Page + Broadcast | 1 oturum | ⬜ |
| 8 | Queue + Circuit Breaker UI | 0.5 oturum | ⬜ |
| 9 | Event Dedup + PDF Fatura | 1.5 oturum | ⬜ |
| 10 | Onboarding + API Usage | 1.5 oturum | ⬜ |
| 11 | Şüpheli Aktivite + IP Block | 1.5 oturum | ⬜ |
| 12 | Son Dokunuşlar + Test | 1 oturum | ⬜ |
| **TOPLAM** | **12 aşama, 35+ özellik** | **15.5 oturum** | ⬜ |

---

## 🎯 Başlama

**İlk oturum:** Aşama 1 — Kullanıcı Davet Sistemi

**Komut:**
```
Aşama 1'e başla — Kullanıcı Davet Sistemi
```

---

## 📝 Notlar

- Her aşama sonunda `git commit + push` zorunlu
- Her aşama sonunda `MEMORY.md` güncellenmeli
- Bir aşama bitmeden diğerine geçilmez
- Bir aşama 1 oturumda bitmezse → `NEXT_SESSION.md`'ye "yarıda kaldı" yaz
- Backend Rust, Frontend Next.js/TypeScript
- DB: Neon PostgreSQL, Cache: Upstash Redis
- Deploy: Google Cloud Build (API), Vercel (Dashboard)
