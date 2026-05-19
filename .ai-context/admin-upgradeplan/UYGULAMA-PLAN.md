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
```
Forecast MRR = Current MRR × (1 + growth_rate) ^ months
- Growth rate: Son 3 aylık ortalama büyüme
- Churn etkisi dahil
- Expansion revenue dahil
```

**Frontend:** `admin/revenue/components/RevenueContent.tsx`
- Forecast grafiği (3/6/12 ay)
- 3 senaryo: Best/Base/Worst case

### 6.2 Cancel Flow (1 oturum)
**Backend endpoint:** `POST /billing/cancel-feedback`

**İptal Akışı:**
```
1. Kullanıcı "Cancel" butonuna basar
2. Modal açılır: "Neden iptal ediyorsunuz?"
   - Too expensive
   - Not using it
   - Missing features
   - Found alternative
   - Other
3. Çözüm önerisi (sebebe göre):
   - Too expensive → %20 indirim teklifi
   - Not using it → Pause subscription teklifi
   - Missing features → Roadmap göster
4. Son onay
5. İptal gerçekleşir + feedback kaydedilir
```

**DB:** `cancel_feedback` tablosu
**Frontend:** Billing sayfasında cancel modal

---

## AŞAMA 7 — Platform Status Page + Broadcast
**Süre:** 1 oturum | **Öncelik:** 🟡 Önemli

### 7.1 Status Page (0.5 oturum)
**Dosya:** `app/[locale]/status/page.tsx` (auth gerektirmez)

**İçerik:**
- Sistem durumu kartı (operational/degraded/outage)
- Incident timeline (başlangıç, güncelleme, çözüm)
- Geçmiş incident'ler
- Subscribe (email ile bildirim)

**Admin:** `admin/status/page.tsx`
- Incident oluşturma formu
- Incident güncelleme
- Incident çözme

### 7.2 Broadcast Notification (0.5 oturum)
**Backend endpoint:** `POST /admin/broadcast`

**İşlev:**
- Hedef: tüm kullanıcılar, plan bazlı, segment bazlı
- Kanal: in-app + email
- Şablon desteği

**Frontend:** `admin/email/page.tsx` → "Broadcast" sekmesi

---

## AŞAMA 8 — Queue Yönetimi + Circuit Breaker UI
**Süre:** 0.5 oturum | **Öncelik:** 🟡 Önemli

### 8.1 Queue Yönetimi
**Frontend:** `admin/components/system/QueueStatus.tsx` (güncelleme)

**Yeni özellikler:**
- Queue depth grafiği (zaman serisi)
- Manuel queue temizleme butonu
- Stuck delivery tespiti
- Queue capacity göstergesi

### 8.2 Circuit Breaker UI
**Frontend:** `admin/components/system/HealthStatus.tsx` (güncelleme)

**Yeni özellikler:**
- Endpoint bazlı circuit breaker durumu (closed/open/half-open)
- Manuel reset butonu
- Circuit breaker geçmişi

---

## AŞAMA 9 — Event Deduplication + PDF Fatura
**Süre:** 1.5 oturum | **Öncelik:** 🟡 Önemli

### 9.1 Event Deduplication (1 oturum)
**Backend:** Event ID bazlı deduplication
- Zaman penceresi (varsayılan: 5 dakika)
- Aynı event ID → tek teslimat
- Admin ayarları: enable/disable, zaman penceresi

**Frontend:** Admin settings'de deduplication ayarları

### 9.2 PDF Fatura (0.5 oturum)
**Backend:** Fatura PDF oluşturma
- HTML template → PDF (headless browser veya library)
- Logo, adres, vergi bilgisi

**Frontend:** Fatura listesinde PDF indirme butonu

---

## AŞAMA 10 — Onboarding Tracker + API Usage
**Süre:** 1.5 oturum | **Öncelik:** 🟢 İyi Olur

### 10.1 Onboarding Tracker (1 oturum)
**Backend:** Funnel analytics endpoint

**Funnel:**
```
Kayıt → İlk Endpoint → İlk Webhook → İlk Teslimat → Aktif Kullanıcı
```

**Frontend:** `admin/page.tsx` → Overview tab'ında funnel grafiği

### 10.2 API Usage Dashboard (0.5 oturum)
**Frontend:** `admin/users/[id]/components/UsageTab.tsx` (güncelleme)

**Yeni özellikler:**
- API çağrı trendi (grafik)
- Rate limit kullanımı (progress bar)
- En çok API kullanan kullanıcılar listesi

---

## AŞAMA 11 — Şüpheli Aktivite + IP Blocklist
**Süre:** 1.5 oturum | **Öncelik:** 🟢 İyi Olur

### 11.1 Şüpheli Aktivite Tespiti (1 oturum)
**Backend:** Anomali tespiti
- Birden fazla başarısız login (5+ / 10 dakika)
- Farklı IP'den giriş
- Ani API kullanım artışı (%200+)
- Alert: şüpheli aktivite

**Frontend:** `admin/page.tsx` → Health tab'ında suspicious activity listesi

### 11.2 IP Blocklist (0.5 oturum)
**Backend:** IP kara liste yönetimi
- IP ekleme/kaldırma
- CIDR desteği
- Otomatik engelleme (şüpheli aktivite sonrası)

**Frontend:** `admin/settings/components/GeneralTab.tsx` → IP blocklist section

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
