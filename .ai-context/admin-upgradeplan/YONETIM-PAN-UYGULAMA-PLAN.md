# 🛡️ HookSniff — Yönetim Paneli Uygulama Planı

> **Tarih:** 2026-05-20 01:19 GMT+8
> **Amaç:** Site sahibi olarak mevcut sistemleri tam olarak yönetebilir hale gelmek
> **Kural:** Her aşama = 1 oturum (1 saat). Sıralı ilerleme. Bitmeden geçilmez.

---

## 📋 İçindekiler

1. [Mevcut Durum — Ne Yapabiliyorsun?](#1-mevcut-durum)
2. [Eksikler — Ne Yapamıyorsun?](#2-eksikler)
3. [Aşama 1 — Kullanıcı Davet + Şifre Sıfırlama](#aşama-1)
4. [Aşama 2 — Session Yönetimi + API Key İptali](#aşama-2)
5. [Aşama 3 — Dunning (Ödeme Kurtarma)](#aşama-3)
6. [Aşama 4 — Platform Status Page + Broadcast](#aşama-4)
7. [Aşama 5 — Queue + Cache + Circuit Breaker Müdahale](#aşama-5)
8. [Aşama 6 — Kullanıcı Bilgi Düzenleme + Pause](#aşama-6)
9. [Aşama 7 — Customer Health Score](#aşama-7)
10. [Aşama 8 — Kupon/Promosyon Kodu](#aşama-8)
11. [Aşama 9 — IP Blocklist + Şüpheli Aktivite](#aşama-9)
12. [Aşama 10 — Revenue Forecast + Fatura PDF](#aşama-10)
13. [Aşama 11 — Onboarding Tracker + Kullanıcı Segmentasyonu](#aşama-11)
14. [Aşama 12 — Son Dokunuşlar + Test](#aşama-12)

---

## 1. Mevcut Durum — Ne Yapabiliyorsun?

### ✅ Mevcut Admin Yetenekleri (71 özellik)

**Kullanıcı Yönetimi:**
- Kullanıcı listeleme, arama, filtreleme ✅
- Plan değiştirme (free→developer→startup→pro→enterprise) ✅
- Ban / unban (sebep ile) ✅
- Impersonate (kullanıcının gözünden görme) ✅
- Email gönderme ✅
- Kullanıcı detayı (9 sekme) ✅
- CSV export ✅

**Webhook & Teslimat Yönetimi:**
- Kullanıcının webhook'larını görme ✅
- Failed delivery'leri görme ✅
- Delivery replay (tekrar gönderme) ✅
- Batch replay (toplu tekrar) ✅
- Dead letters görme ✅
- Test webhook gönderme ✅

**Faturalandırma:**
- Gelir takibi (MRR, ARR, ARPU, LTV, NRR) ✅
- Fatura listesi ✅
- Refund (iade) yapma ✅
- Cohort analizi ✅
- Churn raporu ✅

**Sistem İzleme:**
- DB, Redis, API sağlık durumu ✅
- Queue durumu ✅
- Rate limit ihlalleri ✅
- API latency ✅
- Deploy bilgisi ✅

**Güvenlik:**
- Audit log (37 aksiyon tipi) ✅
- Feature flag yönetimi ✅
- Alert yönetimi ✅
- 2FA yönetimi ✅
- SSO/SAML yapılandırması ✅

**Platform Ayarları:**
- Plan fiyatları ✅
- Plan limitleri (endpoint, webhook, rate limit, retention) ✅
- Maintenance mode ✅
- Signup enable/disable ✅
- Retry ayarları ✅

**Müşteri İlişkileri:**
- Not ekleme ✅
- Etiket ekleme (VIP, at-risk) ✅
- İletişim geçmişi ✅
- Toplu email ✅

**GDPR:**
- Kullanıcı verisi dışa aktarma ✅
- Kullanıcı verisi silme ✅

---

## 2. Eksikler — Ne Yapamıyorsun?

### 🔴 Yönetimsel Eksikler (Kritik)

| # | Eksik | Etki | Ne Yapılacak |
|---|-------|------|-------------|
| 1 | **Kullanıcı davet edemiyorsun** | Büyüme engeli | Admin email ile davet göndersin |
| 2 | **Şifre sıfırlayamıyorsun** | Destek engeli | Admin kullanıcı şifresini sıfırlasın |
| 3 | **Aktif oturumları yönetemiyorsun** | Güvenlik açığı | Oturumları gör, kapat |
| 4 | **API key iptal edemiyorsun** | Güvenlik açığı | Admin key iptal/rotasyon yapsın |
| 5 | **Dunning yok** | Her gün para kaybı | Başarısız ödeme → otomatik email dizisi |
| 6 | **Status page yok** | İletişim eksik | Public incident yönetimi |

### 🟡 Yönetimsel Eksikler (Önemli)

| # | Eksik | Etki | Ne Yapılacak |
|---|-------|------|-------------|
| 7 | **Queue temizleyemiyorsun** | Müdahale engeli | Manuel queue temizleme |
| 8 | **Cache temizleyemiyorsun** | Debug engeli | Redis flush butonu |
| 9 | **Circuit breaker resetleyemiyorsun** | Müdahale engeli | Manuel reset |
| 10 | **Kullanıcı bilgisi düzenleyemiyorsun** | Destek engeli | Ad, email, plan düzenleme |
| 11 | **Abonelik donduramıyorsun** | Müşteri kaybı | Pause subscription |
| 12 | **Broadcast bildirim gönderemiyorsun** | İletişim eksik | Tüm kullanıcıya bildirim |
| 13 | **Kullanıcı şifresini zorla değiştiremiyorsun** | Güvenlik açığı | Force password change |
| 14 | **Customer health score yok** | Churn göremiyorsun | Kullanım + ödeme → skor |
| 15 | **IP blocklist yok** | Güvenlik açığı | IP kara liste |
| 16 | **Şüpheli aktivite tespiti yok** | Güvenlik açığı | Anomali tespiti |

### 🟢 Yönetimsel Eksikler (İyi Olur)

| # | Eksik | Etki | Ne Yapılacak |
|---|-------|------|-------------|
| 17 | **Kupon kodu oluşturamıyorsun** | Kampanya engeli | Promosyon sistemi |
| 18 | **Revenue forecast yok** | Planlama eksik | Gelir projeksiyonu |
| 19 | **Fatura PDF'i yok** | Profesyonellik eksik | PDF oluşturma |
| 20 | **Onboarding funnel yok** | Drop-off görmüyorsun | Funnel analytics |
| 21 | **Kullanıcı segmentasyonu yok** | Hedefleme engeli | Dinamik segment |
| 22 | **Elle fatura oluşturamıyorsun** | Muhasebe engeli | Manuel fatura |
| 23 | **Deploy geçmişi yok** | Operasyon eksik | Geçmiş deploy'lar |
| 24 | **DB migration geçmişi yok** | Operasyon eksik | Migration listesi |
| 25 | **Cancel flow yok** | Churn engelleme eksik | İptal akışı özelleştirme |

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

### Dosya Haritası
```
Backend:  api/src/routes/admin/...
Frontend: dashboard/src/app/[locale]/admin/...
Hooks:    dashboard/src/hooks/useAdminData.ts
API:      dashboard/src/lib/api.ts
i18n:     dashboard/src/messages/en.json + tr.json
DB:       api/migrations/XXX_*.sql
```

---

## AŞAMA 1 — Kullanıcı Davet + Şifre Sıfırlama
**Süre:** 1 oturum | **Öncelik:** 🔴 Kritik | **Yönetim Etkisi:** Müşteri desteği + büyüme

### Ne Yapılacak

#### 1.1 DB Migration
**Dosya:** `api/migrations/065_user_invites.sql`
```sql
CREATE TABLE IF NOT EXISTS user_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    invited_by UUID NOT NULL REFERENCES customers(id),
    plan TEXT NOT NULL DEFAULT 'developer',
    token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending',
    accepted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_user_invites_email ON user_invites(email);
CREATE INDEX idx_user_invites_token ON user_invites(token);
```

#### 1.2 Backend Endpoint'ler
| Method | Path | İşlev |
|--------|------|-------|
| POST | `/admin/users/invite` | Davet oluştur + email gönder |
| GET | `/admin/users/invites` | Davet listesi |
| DELETE | `/admin/users/invites/{id}` | Davet iptal et |
| POST | `/admin/users/invites/{id}/resend` | Davet yeniden gönder |
| GET | `/auth/invite/{token}` | Davet doğrulama (public) |
| POST | `/admin/users/{id}/reset-password` | Şifre sıfırlama linki gönder |

#### 1.3 Frontend
- `admin/users/page.tsx` → "Invite User" butonu + modal
- Davet listesi tablosu (status badge)
- `app/[locale]/invite/[token]/page.tsx` → Davet kayıt sayfası (public)
- `admin/users/[id]/components/OverviewTab.tsx` → "Reset Password" butonu

#### 1.4 i18n
```json
{
  "admin": {
    "inviteUser": "Invite User", "inviteEmail": "Email", "invitePlan": "Plan",
    "inviteSend": "Send Invite", "inviteSent": "Invite sent",
    "inviteResend": "Resend", "inviteRevoke": "Revoke",
    "invitePending": "Pending", "inviteAccepted": "Accepted",
    "inviteExpired": "Expired", "inviteRevoked": "Revoked",
    "resetPassword": "Reset Password", "resetPasswordSent": "Reset link sent"
  }
}
```

### Kabul Kriterleri
- [ ] Admin kullanıcı davet edebiliyor
- [ ] Davet email'i gönderiliyor
- [ ] Davet linki ile kayıt çalışıyor
- [ ] Davet listesi görünüyor (iptal/tekrar gönder)
- [ ] Admin şifre sıfırlama linki gönderebiliyor
- [ ] cargo test + next build geçiyor

---

## AŞAMA 2 — Session Yönetimi + API Key İptali
**Süre:** 1 oturum | **Öncelik:** 🔴 Kritik | **Yönetim Etkisi:** Güvenlik

### Ne Yapılacak

#### 2.1 DB Migration
**Dosya:** `api/migrations/066_user_sessions.sql`
```sql
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    device TEXT,
    last_active TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
```

#### 2.2 Backend Endpoint'ler
| Method | Path | İşlev |
|--------|------|-------|
| GET | `/admin/users/{id}/sessions` | Aktif oturumları listele |
| DELETE | `/admin/users/{id}/sessions/{sid}` | Tek oturumu kapat |
| DELETE | `/admin/users/{id}/sessions` | Tüm oturumları kapat |
| POST | `/admin/users/{id}/api-keys/{key_id}/revoke` | API key iptal et |
| POST | `/admin/users/{id}/force-password-change` | Zorla şifre değiştirme |

#### 2.3 Frontend
- `admin/users/[id]/components/OverviewTab.tsx` → "Sessions" butonu + modal
- Session listesi (cihaz, IP, son aktivite)
- Tek/tüm oturum kapatma butonu
- API key listesinde "Revoke" butonu
- "Force Password Change" butonu

#### 2.4 i18n
```json
{
  "admin": {
    "sessions": "Active Sessions", "sessionDevice": "Device",
    "sessionIp": "IP", "sessionLastActive": "Last Active",
    "sessionRevoke": "Revoke", "sessionRevokeAll": "Revoke All",
    "revokeApiKey": "Revoke API Key", "revokeApiKeyConfirm": "This key will stop working immediately.",
    "forcePasswordChange": "Force Password Change",
    "forcePasswordChangeConfirm": "User will be required to change password on next login."
  }
}
```

### Kabul Kriterleri
- [ ] Aktif oturumlar listeleniyor
- [ ] Tek oturum kapatılabiliyor
- [ ] Tüm oturumlar kapatılabiliyor
- [ ] API key iptal edilebiliyor
- [ ] Zorla şifre değiştirme çalışıyor
- [ ] cargo test + next build geçiyor

---

## AŞAMA 3 — Dunning (Ödeme Kurtarma)
**Süre:** 2 oturum | **Öncelik:** 🔴 Kritik | **Yönetim Etkisi:** Gelir kurtarma

### Ne Yapılacak

#### 3.1 DB Migration
**Dosya:** `api/migrations/067_dunning.sql`
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

#### 3.2 Backend
**Yeni module:** `api/src/dunning.rs`

**Dunning Adımları:**
| Adım | Gün | Email | Konu |
|------|-----|-------|------|
| 1 | 1 | reminder | "Payment failed — update your card" |
| 2 | 3 | warning | "Account will be suspended in 48h" |
| 3 | 7 | final | "Final notice — suspension in 48h" |
| 4 | 14 | grace | "Account suspended — restore now" |

**Endpoint'ler:**
| Method | Path | İşlev |
|--------|------|-------|
| GET | `/admin/dunning` | Kampanya listesi |
| GET | `/admin/dunning/stats` | Kurtarma istatistikleri |
| POST | `/admin/dunning/{id}/cancel` | Kampanya iptal |
| POST | `/admin/dunning/{id}/recover` | Manuel kurtarma işaretle |

**Background Job:** Her saat `next_action_at` gelenleri kontrol et → email gönder

#### 3.3 Frontend
- `admin/revenue/components/RevenueContent.tsx` → Dunning section
- Kampanya listesi tablosu (müşteri, durum, adım, tarih)
- Kurtarma istatistik kartları (toplam, kurtarılan, başarısız, oran)
- Kampanya detay modal (adımlar, email geçmişi)

#### 3.4 Admin Settings
- Dunning enable/disable toggle
- Adım sayısı ve günleri ayarlama

#### 3.5 i18n
```json
{
  "admin": {
    "dunning": "Dunning", "dunningCampaigns": "Campaigns",
    "dunningRecovered": "Recovered", "dunningFailed": "Failed",
    "dunningActive": "Active", "dunningRecoveryRate": "Recovery Rate",
    "dunningCancel": "Cancel Campaign", "dunningManualRecover": "Mark Recovered"
  }
}
```

### Kabul Kriterleri
- [ ] Başarısız ödeme → kampanya başlıyor
- [ ] 4 adımlık email dizisi gönderiliyor
- [ ] Ödeme başarılı → kampanya "recovered"
- [ ] Admin kampanya listesini görebiliyor
- [ ] İptal / manuel kurtarma çalışıyor
- [ ] Kurtarma istatistikleri görünüyor
- [ ] cargo test + next build geçiyor

---

## AŞAMA 4 — Platform Status Page + Broadcast
**Süre:** 1 oturum | **Öncelik:** 🔴 Kritik | **Yönetim Etkisi:** İletişim

### Ne Yapılacak

#### 4.1 DB Migration
**Dosya:** `api/migrations/068_incidents.sql`
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

#### 4.2 Backend
**Public endpoint'ler:**
| Method | Path | İşlev |
|--------|------|-------|
| GET | `/status/incidents` | Aktif incident'ler (public) |
| GET | `/status/incidents/history` | Geçmiş incident'ler (public) |

**Admin endpoint'ler:**
| Method | Path | İşlev |
|--------|------|-------|
| POST | `/admin/incidents` | Incident oluştur |
| PUT | `/admin/incidents/{id}` | Incident güncelle |
| POST | `/admin/incidents/{id}/updates` | Güncelleme ekle |
| PUT | `/admin/incidents/{id}/resolve` | Çöz |
| POST | `/admin/broadcast` | Broadcast bildirim gönder |

#### 4.3 Frontend
- `app/[locale]/status/page.tsx` → Public status page (auth gerektirmez)
  - Sistem durumu kartı (operational/degraded/outage)
  - Aktif incident'ler (timeline)
  - Geçmiş incident'ler
- `admin/status/page.tsx` → Admin incident yönetimi
  - Incident oluşturma/güncelleme/çözme
  - Güncelleme ekleme
- `admin/email/page.tsx` → "Broadcast" sekmesi
  - Hedef: tüm / plan bazlı
  - Kanal: email + in-app

#### 4.4 i18n
```json
{
  "status": {
    "title": "System Status", "operational": "All Systems Operational",
    "degraded": "Some Systems Degraded", "outage": "Major Outage",
    "investigating": "Investigating", "identified": "Identified",
    "monitoring": "Monitoring", "resolved": "Resolved"
  },
  "admin": {
    "createIncident": "Create Incident", "resolveIncident": "Resolve",
    "broadcast": "Broadcast", "broadcastSend": "Send to All Users"
  }
}
```

### Kabul Kriterleri
- [ ] Public status page çalışıyor
- [ ] Incident oluşturulabiliyor/güncellenebiliyor/çözülebiliyor
- [ ] Broadcast gönderilebiliyor (email + in-app)
- [ ] cargo test + next build geçiyor

---

## AŞAMA 5 — Queue + Cache + Circuit Breaker Müdahale
**Süre:** 0.5 oturum | **Öncelik:** 🟡 Önemli | **Yönetim Etkisi:** Operasyon

### Ne Yapılacak

#### 5.1 Backend
| Method | Path | İşlev |
|--------|------|-------|
| GET | `/admin/queue/details` | Queue detayları (stuck, capacity) |
| POST | `/admin/queue/clear-failed` | Failed queue temizle |
| POST | `/admin/cache/flush` | Redis cache temizle |
| GET | `/admin/circuit-breakers` | Circuit breaker listesi |
| POST | `/admin/circuit-breakers/{id}/reset` | Circuit breaker reset |

#### 5.2 Frontend
- `admin/components/system/QueueStatus.tsx` → Queue detayları + temizleme butonu
- `admin/components/system/HealthStatus.tsx` → Circuit breaker durumu + reset
- `admin/settings/components/DevTab.tsx` → Cache flush butonu

#### 5.3 i18n
```json
{
  "admin": {
    "queueDetails": "Queue Details", "clearFailedQueue": "Clear Failed Queue",
    "flushCache": "Flush Redis Cache", "flushCacheConfirm": "All cache will be cleared. Continue?",
    "circuitBreakers": "Circuit Breakers", "circuitReset": "Reset"
  }
}
```

### Kabul Kriterleri
- [ ] Queue detayları görünüyor (stuck delivery'ler)
- [ ] Failed queue temizlenebiliyor
- [ ] Redis cache temizlenebiliyor
- [ ] Circuit breaker resetlenebiliyor
- [ ] cargo test + next build geçiyor

---

## AŞAMA 6 — Kullanıcı Bilgi Düzenleme + Pause
**Süre:** 1 oturum | **Öncelik:** 🟡 Önemli | **Yönetim Etkisi:** Destek

### Ne Yapılacak

#### 6.1 Backend
| Method | Path | İşlev |
|--------|------|-------|
| PUT | `/admin/users/{id}/profile` | İsim, email düzenle |
| POST | `/admin/users/{id}/pause` | Abonelik dondur |
| POST | `/admin/users/{id}/unpause` | Abonelik devam ettir |
| POST | `/admin/users/{id}/transfer` | Başka kullanıcıya taşı |

#### 6.2 Frontend
- `admin/users/[id]/components/OverviewTab.tsx` → Profil düzenleme formu
- "Pause Subscription" butonu (süre seçimi: 30/60/90 gün)
- "Transfer Account" butonu (yeni email)

#### 6.3 i18n
```json
{
  "admin": {
    "editProfile": "Edit Profile", "pauseSubscription": "Pause Subscription",
    "pauseDuration": "Pause Duration", "unpauseSubscription": "Resume Subscription",
    "transferAccount": "Transfer Account", "transferEmail": "New Owner Email"
  }
}
```

### Kabul Kriterleri
- [ ] Kullanıcı adı/emaili düzenlenebiliyor
- [ ] Abonelik dondurulabiliyor/devam ettirilebiliyor
- [ ] Hesap başka kullanıcıya taşınabiliyor
- [ ] cargo test + next build geçiyor

---

## AŞAMA 7 — Customer Health Score
**Süre:** 1.5 oturum | **Öncelik:** 🟡 Önemli | **Yönetim Etkisi:** Churn engelleme

### Ne Yapılacak

#### 7.1 DB Migration
**Dosya:** `api/migrations/069_health_score.sql`
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

#### 7.2 Backend
**Yeni module:** `api/src/health_score.rs`

**Skor Formülü:**
```
Health = (Usage × 0.30) + (Payment × 0.25) + (Endpoint × 0.20) + (Engagement × 0.25)
```

| Faktör | 0-100 | Veri Kaynağı |
|--------|-------|-------------|
| Usage | Son 30 gün teslimat sayısı + trend | deliveries tablosu |
| Payment | Ödeme durumu + dunning var mı | invoices + dunning |
| Endpoint | Aktif endpoint sayısı + sağlık | endpoints tablosu |
| Engagement | Son login + API çağrı sıklığı | sessions + audit_log |

**Endpoint'ler:**
| Method | Path | İşlev |
|--------|------|-------|
| GET | `/admin/health-scores` | Tüm skorlar (risk filtresi) |
| GET | `/admin/users/{id}/health-score` | Tek kullanıcı skoru |
| POST | `/admin/health-scores/recalculate` | Toplu yeniden hesaplama |

**Background Job:** Her gün gece yarısı tüm müşteriler için hesaplama

#### 7.3 Frontend
- `admin/users/page.tsx` → Tabloya "Health" kolonu + risk filtresi
- `admin/users/[id]/components/OverviewTab.tsx` → Health score kartı + faktör breakdown
- `admin/components/HealthTab.tsx` → At-risk müşteri listesi

#### 7.4 i18n
```json
{
  "admin": {
    "healthScore": "Health Score", "riskLevel": "Risk Level",
    "riskLow": "Low", "riskMedium": "Medium", "riskHigh": "High", "riskCritical": "Critical",
    "atRiskCustomers": "At-Risk Customers", "usageScore": "Usage",
    "paymentScore": "Payment", "endpointScore": "Endpoints", "engagementScore": "Engagement"
  }
}
```

### Kabul Kriterleri
- [ ] Health score hesaplanıyor (0-100)
- [ ] 4 faktör breakdown görünüyor
- [ ] Risk seviyesi doğru (low/medium/high/critical)
- [ ] Tabloda health kolonu + risk filtresi var
- [ ] At-risk müşteri listesi var
- [ ] Günlük otomatik hesaplama çalışıyor
- [ ] cargo test + next build geçiyor

---

## AŞAMA 8 — Kupon/Promosyon Kodu
**Süre:** 2 oturum | **Öncelik:** 🟡 Önemli | **Yönetim Etkisi:** Kampanya

### Ne Yapılacak

#### 8.1 DB Migration
**Dosya:** `api/migrations/070_coupons.sql`
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

#### 8.2 Backend
| Method | Path | İşlev |
|--------|------|-------|
| GET | `/admin/coupons` | Kupon listesi |
| POST | `/admin/coupons` | Kupon oluştur |
| PUT | `/admin/coupons/{id}` | Kupon güncelle |
| DELETE | `/admin/coupons/{id}` | Kupon sil |
| POST | `/billing/apply-coupon` | Kupon uygula (checkout) |
| GET | `/admin/coupons/{id}/usages` | Kullanım geçmişi |

#### 8.3 Frontend
- `admin/revenue/components/RevenueContent.tsx` → Coupon Management section
- Kupon listesi tablosu (kod, tip, değer, kullanım, durum)
- Kupon oluşturma/düzenleme formu
- `billing/page.tsx` → "Coupon Code" input (checkout'ta)

#### 8.4 i18n
```json
{
  "admin": {
    "coupons": "Coupons", "createCoupon": "Create Coupon",
    "couponCode": "Code", "couponType": "Type", "couponValue": "Value",
    "couponMaxUses": "Max Uses", "couponValidPlans": "Valid Plans",
    "percentage": "Percentage", "fixed": "Fixed Amount"
  }
}
```

### Kabul Kriterleri
- [ ] Kupon oluşturulabiliyor (percentage/fixed)
- [ ] Checkout'ta kupon kodu çalışıyor
- [ ] Kullanım limiti çalışıyor
- [ ] Kupon yönetimi admin panelinde var
- [ ] cargo test + next build geçiyor

---

## AŞAMA 9 — IP Blocklist + Şüpheli Aktivite
**Süre:** 1.5 oturum | **Öncelik:** 🟡 Önemli | **Yönetim Etkisi:** Güvenlik

### Ne Yapılacak

#### 9.1 DB Migration
**Dosya:** `api/migrations/071_security.sql`
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

#### 9.2 Backend
**IP Blocklist:**
| Method | Path | İşlev |
|--------|------|-------|
| GET | `/admin/ip-blocklist` | Blocklist |
| POST | `/admin/ip-blocklist` | IP ekle |
| DELETE | `/admin/ip-blocklist/{id}` | IP kaldır |

**Middleware:** Her istekte IP kontrol → 403

**Şüpheli Aktivite Tespiti:**
- 5+ başarısız login / 10 dakika → brute force
- 3+ farklı IP / 24 saat → IP change
- %200+ API artışı / 1 saat → spike

| Method | Path | İşlev |
|--------|------|-------|
| GET | `/admin/suspicious` | Şüpheli aktivite listesi |
| PUT | `/admin/suspicious/{id}/resolve` | Çözüldü işaretle |

#### 9.3 Frontend
- `admin/settings/components/GeneralTab.tsx` → IP Blocklist section
- `admin/page.tsx` → Health tab'ında suspicious activity listesi

#### 9.4 i18n
```json
{
  "admin": {
    "ipBlocklist": "IP Blocklist", "addIp": "Add IP",
    "suspiciousActivity": "Suspicious Activity",
    "bruteForce": "Brute Force", "ipChange": "IP Change", "apiSpike": "API Spike",
    "resolveActivity": "Mark Resolved"
  }
}
```

### Kabul Kriterleri
- [ ] IP blocklist yönetimi çalışıyor
- [ ] Blocklist'teki IP → 403 alıyor
- [ ] Brute force tespiti çalışıyor
- [ ] Şüpheli aktivite listesi görünüyor
- [ ] Çöz butonu çalışıyor
- [ ] cargo test + next build geçiyor

---

## AŞAMA 10 — Revenue Forecast + Fatura PDF
**Süre:** 1 oturum | **Öncelik:** 🟢 İyi Olur | **Yönetim Etkisi:** Planlama + profesyonellik

### Ne Yapılacak

#### 10.1 Revenue Forecast
**Backend:** `GET /admin/revenue/forecast`

**Hesaplama:**
```
Forecast = Current MRR × (1 + growth_rate) ^ months
growth_rate = (mrr_now / mrr_3mo_ago)^(1/3) - 1
Best: growth × 1.5 | Base: growth | Worst: growth × 0.5
```

**Frontend:** `admin/revenue/components/RevenueContent.tsx` → Forecast grafiği (3/6/12 ay, 3 senaryo)

#### 10.2 Fatura PDF
**Backend:** `GET /admin/users/{id}/invoices/{invoice_id}/pdf`
- HTML template → PDF (logo, kalemler, toplam, vergi)

**Frontend:** Fatura listesinde "PDF" indirme butonu

#### 10.3 i18n
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
- [ ] Forecast grafiği 3/6/12 ay gösteriyor
- [ ] 3 senaryo doğru hesaplanıyor
- [ ] Fatura PDF'i oluşturulabiliyor
- [ ] PDF indirme butonu çalışıyor
- [ ] cargo test + next build geçiyor

---

## AŞAMA 11 — Onboarding Tracker + Kullanıcı Segmentasyonu
**Süre:** 1.5 oturum | **Öncelik:** 🟢 İyi Olur | **Yönetim Etkisi:** Büyüme

### Ne Yapılacak

#### 11.1 Onboarding Tracker
**DB:** `onboarding_events` tablosu

**Funnel:** Kayıt → İlk Endpoint → İlk Webhook → İlk Teslimat → Aktif

**Backend:** `GET /admin/onboarding/funnel`

**Frontend:** `admin/page.tsx` → Overview tab'ında funnel grafiği

#### 11.2 Kullanıcı Segmentasyonu
**Backend:** `GET /admin/segments` + `POST /admin/segments`

**Hazır Segment'ler:**
- High-volume Pro (1000+ teslimat, pro plan)
- At-risk (health score < 40)
- New users (son 7 gün kayıt)
- Inactive (30+ gün login yok)
- Enterprise-ready (5+ endpoint, pro plan)

**Frontend:** `admin/users/page.tsx` → Segment filtresi dropdown

#### 11.3 i18n
```json
{
  "admin": {
    "onboardingFunnel": "Onboarding Funnel", "segments": "Segments",
    "createSegment": "Create Segment", "highVolume": "High-Volume",
    "atRisk": "At-Risk", "newUsers": "New Users", "inactive": "Inactive"
  }
}
```

### Kabul Kriterleri
- [ ] Funnel grafiği görünüyor (5 adım)
- [ ] Conversion oranları doğru
- [ ] Segment oluşturulabiliyor
- [ ] Segment filtresi çalışıyor
- [ ] cargo test + next build geçiyor

---

## AŞAMA 12 — Son Dokunuşlar + Test
**Süre:** 1 oturum | **Öncelik:** 🟢 İyi Olur | **Yönetim Etkisi:** Kalite

### Ne Yapılacak

#### 12.1 Elle Fatura Oluşturma
**Backend:** `POST /admin/invoices` (manuel fatura)
**Frontend:** `admin/revenue/page.tsx` → "Create Invoice" butonu

#### 12.2 Deploy Geçmişi
**Backend:** `GET /admin/deploy-history`
**Frontend:** `admin/system/page.tsx` → Deploy geçmişi tablosu

#### 12.3 DB Migration Geçmişi
**Backend:** `GET /admin/migrations`
**Frontend:** `admin/system/page.tsx` → Migration listesi

#### 12.4 Cancel Flow
**Backend:** `POST /billing/cancel-feedback`
**Frontend:** `billing/page.tsx` → İptal akışı (sebep → teklif → onay)

#### 12.5 Kapsamlı Test
- Tüm yeni endpoint'ler test edilecek
- Tüm yeni sayfalar test edilecek
- Edge case'ler kontrol edilecek
- i18n doğrulama (EN + TR)

### Kabul Kriterleri
- [ ] Elle fatura oluşturulabiliyor
- [ ] Deploy geçmişi görünüyor
- [ ] DB migration geçmişi görünüyor
- [ ] Cancel flow çalışıyor
- [ ] Tüm testler geçiyor
- [ ] cargo test + next build geçiyor

---

## 📊 Toplam Özet

| Aşama | Yönetim Alanı | Özellik | Süre | Durum |
|-------|--------------|---------|------|-------|
| 1 | Müşteri Desteği | Davet + Şifre Sıfırlama | 1 oturum | ⬜ |
| 2 | Güvenlik | Session + API Key İptali | 1 oturum | ⬜ |
| 3 | Gelir | Dunning (Ödeme Kurtarma) | 2 oturum | ⬜ |
| 4 | İletişim | Status Page + Broadcast | 1 oturum | ⬜ |
| 5 | Operasyon | Queue + Cache + Circuit | 0.5 oturum | ⬜ |
| 6 | Destek | Kullanıcı Düzenleme + Pause | 1 oturum | ⬜ |
| 7 | Büyüme | Customer Health Score | 1.5 oturum | ⬜ |
| 8 | Kampanya | Kupon/Promosyon Kodu | 2 oturum | ⬜ |
| 9 | Güvenlik | IP Blocklist + Şüpheli Aktivite | 1.5 oturum | ⬜ |
| 10 | Planlama | Forecast + Fatura PDF | 1 oturum | ⬜ |
| 11 | Büyüme | Onboarding + Segmentasyon | 1.5 oturum | ⬜ |
| 12 | Kalite | Son Dokunuşlar + Test | 1 oturum | ⬜ |
| **TOPLAM** | **6 alan** | **25 özellik** | **15 oturum** | ⬜ |

---

## 🎯 Sonuç

### Yönetimsel Kontrol Skoru (Hedef)

| Kategori | Şu An | Hedef | Artış |
|----------|-------|-------|-------|
| Kullanıcı Yönetimi | %60 | %95 | +35% |
| Faturalandırma | %50 | %90 | +40% |
| Sistem İzleme | %80 | %95 | +15% |
| Güvenlik | %40 | %90 | +50% |
| İletişim | %30 | %90 | +60% |
| Analytics | %70 | %90 | +20% |
| **GENEL** | **%55** | **%92** | **+37%** |

### 12 Aşama Sonunda Yapabileceklerin

- ✅ Kullanıcı davet edebileceksin
- ✅ Şifre sıfırlayabileceksin
- ✅ Oturumları yönetebileceksin
- ✅ API key iptal edebileceksin
- ✅ Başarısız ödeme kurtarabileceksin (dunning)
- ✅ Platform durumu duyurabileceksin (status page)
- ✅ Broadcast bildirim gönderebileceksin
- ✅ Queue/cache/circuit breaker müdahale edebileceksin
- ✅ Kullanıcı bilgisi düzenleyebileceksin
- ✅ Abonelik dondurabileceksin
- ✅ Müşteri sağlık skorunu görebileceksin
- ✅ Kupon kodu oluşturabileceksin
- ✅ IP engelleyebileceksin
- ✅ Şüpheli aktivite tespit edebileceksin
- ✅ Gelir projeksiyonu yapabileceksin
- ✅ Fatura PDF'i oluşturabileceksin
- ✅ Onboarding funnel'ını görebileceksin
- ✅ Kullanıcı segmentasyonu yapabileceksin
- ✅ Elle fatura oluşturabileceksin
- ✅ Deploy geçmişini görebileceksin
- ✅ İptal akışını özelleştirebileceksin

---

## 📝 Notlar

- Her aşama sonunda `cargo test + next build + commit + push` zorunlu
- Bir aşama bitmeden diğerine geçilmez
- Bir aşama 1 oturumda bitmezse → `NEXT_SESSION.md`'ye "yarıda kaldı" yaz
- Backend Rust, Frontend Next.js/TypeScript
- DB: Neon PostgreSQL, Cache: Upstash Redis
- Deploy: Google Cloud Build (API), Vercel (Dashboard)
