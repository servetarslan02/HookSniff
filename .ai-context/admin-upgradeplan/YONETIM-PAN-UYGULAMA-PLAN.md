# 🛡️ HookSniff — Yönetim Paneli Uygulama Planı

> **Tarih:** 2026-05-20 01:32 GMT+8
> **Amaç:** Site sahibi olarak mevcut sistemleri tam olarak yönetebilir hale gelmek
> **Kural:** Her aşama = 1 oturum (1 saat). Sıralı ilerleme. Bitmeden geçilmez.

---

## 📋 İçindekiler

1. [Mevcut Durum — Ne Yapabiliyorsun?](#1-mevcut-durum)
2. [Eksikler — Ne Yapamıyorsun?](#2-eksikler)
3. [Aşama 1 — Şifre Sıfırlama](#aşama-1)
4. [Aşama 2 — Dunning (Ödeme Kurtarma)](#aşama-2)
5. [Aşama 3 — Platform Status Page + Broadcast](#aşama-3)
6. [Aşama 4 — Customer Health Score](#aşama-4)
7. [Aşama 5 — Kupon/Promosyon Kodu](#aşama-5)
8. [Aşama 6 — IP Blocklist + Şüpheli Aktivite](#aşama-6)
9. [Aşama 7 — Revenue Forecast + Fatura PDF](#aşama-7)
10. [Aşama 8 — Onboarding Tracker + Segmentasyon](#aşama-8)
11. [Aşama 9 — Son Dokunuşlar + Test](#aşama-9)

---

## 1. Mevcut Durum — Ne Yapabiliyorsun?

### ✅ Mevcut Admin Yetenekleri (71 özellik)

**Kullanıcı Yönetimi:**
- Kullanıcı listeleme, arama, filtreleme ✅
- Plan değiştirme ✅
- Ban / unban ✅
- Impersonate (kullanıcının gözünden görme) ✅
- Email gönderme ✅
- Kullanıcı detayı (9 sekme) ✅
- CSV export ✅

**Webhook & Teslimat:**
- Kullanıcının webhook'larını görme ✅
- Failed delivery'leri görme ✅
- Delivery replay ✅
- Batch replay ✅
- Dead letters ✅
- Test webhook ✅

**Faturalandırma:**
- Gelir takibi (MRR, ARPU, LTV, NRR) ✅
- Fatura listesi ✅
- Refund ✅
- Cohort analizi ✅

**Sistem İzleme:**
- DB, Redis, API sağlık durumu ✅
- Queue durumu ✅
- Rate limit ihlalleri ✅
- API latency ✅

**Güvenlik:**
- Audit log (37 aksiyon) ✅
- Feature flags ✅
- Alerts ✅

**Platform Ayarları:**
- Plan fiyatları ✅
- Plan limitleri ✅
- Maintenance mode ✅
- Signup enable/disable ✅

**Müşteri İlişkileri:**
- Not ekleme ✅
- Etiket ekleme ✅
- İletişim geçmişi ✅
- Toplu email ✅

**GDPR:**
- Veri dışa aktarma ✅
- Veri silme ✅

---

## 2. Eksikler — Ne Yapamıyorsun?

### 🔴 Kritik Eksikler (4)

| # | Eksik | Etki |
|---|-------|------|
| 1 | **Şifre sıfırlayamıyorsun** | Destek engeli — "şifremi unuttum" taleplerini çözemezsin |
| 2 | **Dunning yok** | Her gün para kaybı — başarısız ödeme kurtarma yok |
| 3 | **Status page yok** | İletişim eksik — sorunları duyuramıyorsun |
| 4 | **Broadcast bildirim gönderemiyorsun** | İletişim eksik — bakım/feature duyurusu yapamıyorsun |

### 🟡 Önemli Eksikler (5)

| # | Eksik | Etki |
|---|-------|------|
| 5 | **Customer health score yok** | Churn göremiyorsun — risk altındaki müşterileri tespit edemiyorsun |
| 6 | **Kupon kodu oluşturamıyorsun** | Kampanya yapamıyorsun |
| 7 | **IP blocklist yok** | Güvenlik açığı — kötü niyetli IP'leri engelleyemiyorsun |
| 8 | **Şüpheli aktivite tespiti yok** | Güvenlik açığı — brute force/anormal davranış göremiyorsun |
| 9 | **Revenue forecast yok** | Planlama eksik — gelir projeksiyonu yapamıyorsun |

### 🟢 İyi Olur (4)

| # | Eksik | Etki |
|---|-------|------|
| 10 | **Fatura PDF'i yok** | Profesyonellik eksik |
| 11 | **Onboarding funnel yok** | Drop-off görmüyorsun |
| 12 | **Kullanıcı segmentasyonu yok** | Hedefleme yapamıyorsun |
| 13 | **Cancel flow yok** | İptal akışı özelleştirme eksik |

---

## 3. Genel Kurallar

### Her Aşamada Yapılacaklar (ZORUNLU)
```
1. ✅ Backend endpoint(ler) yaz (Rust/Axum)
2. ✅ DB migration yaz (gerekirse)
3. ✅ Frontend sayfa/bileşen yaz (Next.js/TypeScript)
4. ✅ i18n key'leri ekle (EN + TR)
5. ✅ React Query hook yaz
6. ✅ cargo test çalıştır
7. ✅ next build çalıştır
8. ✅ git commit + push
9. ✅ MEMORY.md güncelle
10. ✅ NEXT_SESSION.md güncelle
```

---

## AŞAMA 1 — Şifre Sıfırlama
**Süre:** 0.5 oturum | **Öncelik:** 🔴 Kritik

### Ne Yapılacak

#### Backend
| Method | Path | İşlev |
|--------|------|-------|
| POST | `/admin/users/{id}/reset-password` | Şifre sıfırlama linki gönder |

#### Frontend
- `admin/users/[id]/components/OverviewTab.tsx` → "Reset Password" butonu
- Onay dialogu: "Kullanıcıya sıfırlama linki gönderilsin mi?"
- Başarı mesajı: "Şifre sıfırlama linki gönderildi"

#### i18n
```json
{
  "admin": {
    "resetPassword": "Reset Password",
    "resetPasswordConfirm": "Send password reset link to this user?",
    "resetPasswordSent": "Password reset link sent to user's email"
  }
}
```

### Kabul Kriterleri
- [ ] Admin şifre sıfırlama linki gönderebiliyor
- [ ] Kullanıcıya email gidiyor
- [ ] Email'deki link ile yeni şifre belirlenebiliyor
- [ ] cargo test + next build geçiyor

---

## AŞAMA 2 — Dunning (Ödeme Kurtarma)
**Süre:** 2 oturum | **Öncelik:** 🔴 Kritik

### Ne Yapılacak

#### DB Migration
**Dosya:** `api/migrations/065_dunning.sql`
```sql
CREATE TABLE IF NOT EXISTS dunning_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    invoice_id TEXT,
    status TEXT NOT NULL DEFAULT 'active',
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
    email_type TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ
);
CREATE INDEX idx_dunning_emails_campaign ON dunning_emails(campaign_id);
```

#### Backend
**Yeni module:** `api/src/dunning.rs`

**Dunning Adımları:**
| Adım | Gün | Email | Konu |
|------|-----|-------|------|
| 1 | 1 | reminder | "Payment failed — update your card" |
| 2 | 3 | warning | "Account will be suspended in 48h" |
| 3 | 7 | final | "Final notice — suspension in 48h" |
| 4 | 14 | grace | "Account suspended — restore now" |

| Method | Path | İşlev |
|--------|------|-------|
| GET | `/admin/dunning` | Kampanya listesi |
| GET | `/admin/dunning/stats` | Kurtarma istatistikleri |
| POST | `/admin/dunning/{id}/cancel` | Kampanya iptal |
| POST | `/admin/dunning/{id}/recover` | Manuel kurtarma işaretle |

**Background Job:** Her saat `next_action_at` gelenleri kontrol et → email gönder

#### Frontend
- `admin/revenue/components/RevenueContent.tsx` → Dunning section
- Kampanya listesi tablosu (müşteri, durum, adım, tarih)
- Kurtarma istatistik kartları

#### Admin Settings
- Dunning enable/disable toggle
- Adım sayısı ve günleri

#### i18n
```json
{
  "admin": {
    "dunning": "Dunning", "dunningCampaigns": "Campaigns",
    "dunningRecovered": "Recovered", "dunningFailed": "Failed",
    "dunningRecoveryRate": "Recovery Rate", "dunningCancel": "Cancel"
  }
}
```

### Kabul Kriterleri
- [ ] Başarısız ödeme → kampanya başlıyor
- [ ] 4 adımlık email dizisi gönderiliyor
- [ ] Ödeme başarılı → "recovered"
- [ ] Admin kampanya listesini görebiliyor
- [ ] İptal / manuel kurtarma çalışıyor
- [ ] cargo test + next build geçiyor

---

## AŞAMA 3 — Status Page + Broadcast
**Süre:** 1 oturum | **Öncelik:** 🔴 Kritik

### Ne Yapılacak

#### DB Migration
**Dosya:** `api/migrations/066_incidents.sql`
```sql
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'investigating',
    severity TEXT NOT NULL DEFAULT 'minor',
    affected_services TEXT[],
    created_by UUID REFERENCES customers(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);
CREATE INDEX idx_incidents_status ON incidents(status);

CREATE TABLE IF NOT EXISTS incident_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    message TEXT NOT NULL,
    created_by UUID REFERENCES customers(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### Backend
**Public:**
| Method | Path | İşlev |
|--------|------|-------|
| GET | `/status/incidents` | Aktif incident'ler |
| GET | `/status/incidents/history` | Geçmiş incident'ler |

**Admin:**
| Method | Path | İşlev |
|--------|------|-------|
| POST | `/admin/incidents` | Incident oluştur |
| PUT | `/admin/incidents/{id}` | Güncelle |
| POST | `/admin/incidents/{id}/updates` | Güncelleme ekle |
| PUT | `/admin/incidents/{id}/resolve` | Çöz |
| POST | `/admin/broadcast` | Broadcast bildirim |

#### Frontend
- `app/[locale]/status/page.tsx` → Public status page (auth gerektirmez)
- `admin/status/page.tsx` → Incident yönetimi
- `admin/email/page.tsx` → Broadcast sekmesi

#### i18n
```json
{
  "status": {
    "title": "System Status", "operational": "All Systems Operational",
    "degraded": "Degraded", "outage": "Outage",
    "investigating": "Investigating", "resolved": "Resolved"
  },
  "admin": {
    "createIncident": "Create Incident", "resolveIncident": "Resolve",
    "broadcast": "Broadcast", "broadcastSend": "Send to All"
  }
}
```

### Kabul Kriterleri
- [ ] Public status page çalışıyor
- [ ] Incident oluşturulabiliyor/güncellenebiliyor/çözülebiliyor
- [ ] Broadcast gönderilebiliyor
- [ ] cargo test + next build geçiyor

---

## AŞAMA 4 — Customer Health Score
**Süre:** 1.5 oturum | **Öncelik:** 🟡 Önemli

### Ne Yapılacak

#### DB Migration
**Dosya:** `api/migrations/067_health_score.sql`
```sql
CREATE TABLE IF NOT EXISTS customer_health_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE UNIQUE,
    score INT NOT NULL DEFAULT 50,
    usage_score INT NOT NULL DEFAULT 50,
    payment_score INT NOT NULL DEFAULT 50,
    endpoint_score INT NOT NULL DEFAULT 50,
    engagement_score INT NOT NULL DEFAULT 50,
    risk_level TEXT NOT NULL DEFAULT 'medium',
    factors JSONB,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_health_score_risk ON customer_health_scores(risk_level);
```

#### Backend
**Yeni module:** `api/src/health_score.rs`

**Skor Formülü:**
```
Health = (Usage × 0.30) + (Payment × 0.25) + (Endpoint × 0.20) + (Engagement × 0.25)
```

| Method | Path | İşlev |
|--------|------|-------|
| GET | `/admin/health-scores` | Tüm skorlar (risk filtresi) |
| GET | `/admin/users/{id}/health-score` | Tek kullanıcı |
| POST | `/admin/health-scores/recalculate` | Toplu hesaplama |

**Background Job:** Her gün gece yarısı hesaplama

#### Frontend
- `admin/users/page.tsx` → Health kolonu + risk filtresi
- `admin/users/[id]/components/OverviewTab.tsx` → Health score kartı
- `admin/components/HealthTab.tsx` → At-risk müşteri listesi

#### i18n
```json
{
  "admin": {
    "healthScore": "Health Score", "riskLevel": "Risk Level",
    "riskLow": "Low", "riskMedium": "Medium", "riskHigh": "High", "riskCritical": "Critical",
    "atRiskCustomers": "At-Risk Customers"
  }
}
```

### Kabul Kriterleri
- [ ] Health score hesaplanıyor (0-100)
- [ ] 4 faktör breakdown görünüyor
- [ ] Risk seviyesi doğru
- [ ] Tabloda health kolonu + filtre var
- [ ] At-risk listesi var
- [ ] cargo test + next build geçiyor

---

## AŞAMA 5 — Kupon/Promosyon Kodu
**Süre:** 2 oturum | **Öncelik:** 🟡 Önemli

### Ne Yapılacak

#### DB Migration
**Dosya:** `api/migrations/068_coupons.sql`
```sql
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'percentage',
    value INT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    max_uses INT,
    used_count INT NOT NULL DEFAULT 0,
    valid_plans TEXT[],
    valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES customers(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_coupons_code ON coupons(code);

CREATE TABLE IF NOT EXISTS coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    discount_amount_cents BIGINT NOT NULL,
    used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### Backend
| Method | Path | İşlev |
|--------|------|-------|
| GET | `/admin/coupons` | Kupon listesi |
| POST | `/admin/coupons` | Kupon oluştur |
| PUT | `/admin/coupons/{id}` | Güncelle |
| DELETE | `/admin/coupons/{id}` | Sil |
| POST | `/billing/apply-coupon` | Kupon uygula |
| GET | `/admin/coupons/{id}/usages` | Kullanım geçmişi |

#### Frontend
- `admin/revenue/components/RevenueContent.tsx` → Coupon section
- `billing/page.tsx` → Coupon Code input

#### i18n
```json
{
  "admin": {
    "coupons": "Coupons", "createCoupon": "Create Coupon",
    "couponCode": "Code", "couponType": "Type", "couponValue": "Value"
  }
}
```

### Kabul Kriterleri
- [ ] Kupon oluşturulabiliyor (percentage/fixed)
- [ ] Checkout'ta çalışıyor
- [ ] Kullanım limiti çalışıyor
- [ ] cargo test + next build geçiyor

---

## AŞAMA 6 — IP Blocklist + Şüpheli Aktivite
**Süre:** 1.5 oturum | **Öncelik:** 🟡 Önemli

### Ne Yapılacak

#### DB Migration
**Dosya:** `api/migrations/069_security.sql`
```sql
CREATE TABLE IF NOT EXISTS ip_blocklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL,
    cidr_mask INT,
    reason TEXT,
    blocked_by UUID REFERENCES customers(id),
    auto_blocked BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ip_blocklist_ip ON ip_blocklist(ip_address);

CREATE TABLE IF NOT EXISTS suspicious_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    activity_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium',
    details JSONB,
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_by UUID REFERENCES customers(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_suspicious_resolved ON suspicious_activities(resolved);
```

#### Backend
**IP Blocklist:**
| Method | Path | İşlev |
|--------|------|-------|
| GET | `/admin/ip-blocklist` | Blocklist |
| POST | `/admin/ip-blocklist` | IP ekle |
| DELETE | `/admin/ip-blocklist/{id}` | IP kaldır |

**Middleware:** Her istekte IP kontrol → 403

**Şüpheli Aktivite:**
- 5+ başarısız login / 10 dakika → brute force
- 3+ farklı IP / 24 saat → IP change
- %200+ API artışı / 1 saat → spike

| Method | Path | İşlev |
|--------|------|-------|
| GET | `/admin/suspicious` | Aktivite listesi |
| PUT | `/admin/suspicious/{id}/resolve` | Çözüldü |

#### Frontend
- `admin/settings/components/GeneralTab.tsx` → IP Blocklist section
- `admin/page.tsx` → Health tab'ında suspicious activity

#### i18n
```json
{
  "admin": {
    "ipBlocklist": "IP Blocklist", "addIp": "Add IP",
    "suspiciousActivity": "Suspicious Activity",
    "bruteForce": "Brute Force", "resolveActivity": "Resolve"
  }
}
```

### Kabul Kriterleri
- [ ] IP blocklist yönetimi çalışıyor
- [ ] Blocklist'teki IP → 403
- [ ] Brute force tespiti çalışıyor
- [ ] Şüpheli aktivite listesi var
- [ ] cargo test + next build geçiyor

---

## AŞAMA 7 — Revenue Forecast + Fatura PDF
**Süre:** 1 oturum | **Öncelik:** 🟢 İyi Olur

### Ne Yapılacak

#### Revenue Forecast
**Backend:** `GET /admin/revenue/forecast`

**Hesaplama:**
```
Forecast = Current MRR × (1 + growth_rate) ^ months
Best: growth × 1.5 | Base: growth | Worst: growth × 0.5
```

**Frontend:** Forecast grafiği (3/6/12 ay, 3 senaryo)

#### Fatura PDF
**Backend:** `GET /admin/users/{id}/invoices/{invoice_id}/pdf`

**Frontend:** Fatura listesinde PDF butonu

#### i18n
```json
{
  "admin": {
    "revenueForecast": "Revenue Forecast", "bestCase": "Best Case",
    "baseCase": "Base Case", "worstCase": "Worst Case",
    "downloadPdf": "Download PDF"
  }
}
```

### Kabul Kriterleri
- [ ] Forecast grafiği çalışıyor
- [ ] 3 senaryo doğru
- [ ] PDF indirme çalışıyor
- [ ] cargo test + next build geçiyor

---

## AŞAMA 8 — Onboarding Tracker + Segmentasyon
**Süre:** 1.5 oturum | **Öncelik:** 🟢 İyi Olur

### Ne Yapılacak

#### Onboarding Tracker
**DB:** `onboarding_events` tablosu

**Funnel:** Kayıt → İlk Endpoint → İlk Webhook → İlk Teslimat → Aktif

**Backend:** `GET /admin/onboarding/funnel`

**Frontend:** Funnel grafiği

#### Kullanıcı Segmentasyonu
**Backend:** `GET /admin/segments` + `POST /admin/segments`

**Hazır Segment'ler:**
- High-volume Pro (1000+ teslimat, pro plan)
- At-risk (health score < 40)
- New users (son 7 gün)
- Inactive (30+ gün login yok)

**Frontend:** Segment filtresi dropdown

#### i18n
```json
{
  "admin": {
    "onboardingFunnel": "Onboarding Funnel", "segments": "Segments",
    "createSegment": "Create Segment"
  }
}
```

### Kabul Kriterleri
- [ ] Funnel grafiği çalışıyor
- [ ] Segment oluşturulabiliyor
- [ ] Segment filtresi çalışıyor
- [ ] cargo test + next build geçiyor

---

## AŞAMA 9 — Son Dokunuşlar + Test
**Süre:** 1 oturum | **Öncelik:** 🟢 İyi Olur

### Ne Yapılacak

#### Cancel Flow
**Backend:** `POST /billing/cancel-feedback`

**İptal Akışı:** Sebep seçimi → Teklif → Onay

**Frontend:** Billing sayfasında cancel modal

#### Kapsamlı Test
- Tüm yeni endpoint'ler test edilecek
- Tüm yeni sayfalar test edilecek
- Edge case'ler kontrol edilecek
- i18n doğrulama (EN + TR)

### Kabul Kriterleri
- [ ] Cancel flow çalışıyor
- [ ] Tüm testler geçiyor
- [ ] cargo test + next build geçiyor

---

## 📊 Toplam Özet

| Aşama | Özellik | Süre | Durum |
|-------|---------|------|-------|
| 1 | Şifre Sıfırlama | 0.5 oturum | ⬜ |
| 2 | Dunning (Ödeme Kurtarma) | 2 oturum | ⬜ |
| 3 | Status Page + Broadcast | 1 oturum | ⬜ |
| 4 | Customer Health Score | 1.5 oturum | ⬜ |
| 5 | Kupon/Promosyon Kodu | 2 oturum | ⬜ |
| 6 | IP Blocklist + Şüpheli Aktivite | 1.5 oturum | ⬜ |
| 7 | Revenue Forecast + Fatura PDF | 1 oturum | ⬜ |
| 8 | Onboarding + Segmentasyon | 1.5 oturum | ⬜ |
| 9 | Son Dokunuşlar + Test | 1 oturum | ⬜ |
| **TOPLAM** | **13 özellik** | **12 oturum** | ⬜ |

---

## 🎯 Sonuç

### Yönetimsel Kontrol Skoru

| Kategori | Şu An | Hedef |
|----------|-------|-------|
| Kullanıcı Yönetimi | %60 | %75 |
| Faturalandırma | %50 | %90 |
| Sistem İzleme | %80 | %85 |
| Güvenlik | %40 | %90 |
| İletişim | %30 | %90 |
| Analytics | %70 | %90 |
| **GENEL** | **%55** | **%87** |

---

## 📝 Notlar

- Her aşama sonunda `cargo test + next build + commit + push` zorunlu
- Bir aşama bitmeden diğerine geçilmez
- Backend Rust, Frontend Next.js/TypeScript
- DB: Neon PostgreSQL, Cache: Upstash Redis
