# 🔬 Derin Analiz — Backend-Frontend Uyumsuzluğu

> Tarih: 2026-05-13
> Kapsam: Tüm dashboard sayfaları, api.ts, backend route'ları
> Yöntem: Kaynak kod karşılaştırması (backend endpoint'ler vs frontend API çağrıları)

---

## 📊 Özet

| Kategori | Sayı |
|----------|------|
| Backend'de var, frontend'de tamamen yok | 5 sayfa |
| Backend'de var, frontend'de eksik (yazma/işlem) | 7 sayfa |
| api.ts'de tanımlı ama hiçbir sayfada kullanılmayan metod | 8 metod |
| Admin sayfasında raw fetch (apiFetch yerine) | 5 yer |
| localStorage'da saklanan (backend'e gitmeyen) veri | 3 özellik |
| Backend'de var ama UI'da görünmeyen özellik | 6 özellik |

---

## 🔴 KRİTİK: api.ts'de Tanımlı Ama Kullanılmayan Metodlar

Bu metodlar `api.ts`'de tanımlı ama hiçbir sayfa çağırmıyor — müşteri bu işlevlere erişemiyor:

| # | Metod | Ne İşe Yarar | Etki |
|---|-------|--------------|------|
| 1 | `endpointsApi.update` | Endpoint güncelleme (URL, açıklama, retry policy) | ❌ Endpoint düzenleme çalışmıyor |
| 2 | `webhooksApi.batch` | Toplu webhook gönderme | ❌ Toplu işlem yapılamıyor |
| 3 | `adminApi.updateSettings` | Admin ayarlarını güncelleme | ❌ Admin ayarları raw fetch ile |
| 4 | `adminApi.createFeatureFlag` | Feature flag oluşturma | ❌ Flag oluşturulamıyor |
| 5 | `adminApi.updateFeatureFlag` | Feature flag güncelleme | ❌ Flag güncellenemiyor |
| 6 | `adminApi.deleteFeatureFlag` | Feature flag silme | ❌ Flag silinemiyor |
| 7 | `billingApiExtended.getUsage` | Kullanım detayı | ⚠️ Çağrılıyor ama UI'da eksik olabilir |
| 8 | `billingApiExtended.getInvoices` | Fatura listesi | ⚠️ Çağrılıyor ama UI'da eksik olabilir |

---

## 🔴 KRİTİK: localStorage'da Saklanan (Backend'e Gitmeyen) Veriler

Bu veriler sadece tarayıcı localStorage'da — kullanıcı cihaz değiştirince kayboluyor:

| # | Özellik | Nerede | Sorun |
|---|---------|--------|-------|
| 1 | **Bildirim tercihleri** | `NotificationSection.tsx` | `localStorage.getItem('hooksniff_email_notifs')` — backend'e gönderilmiyor |
| 2 | **Haftalık özet** | `NotificationSection.tsx` | `localStorage.getItem('hooksniff_weekly_digest')` — backend'e gönderilmiyor |
| 3 | **GDPR onayları** | `PrivacyConsentSection.tsx` | `localStorage.getItem('hooksniff_cookie_consent')` — backend'e gönderilmiyor, GDPR uyumsuz |

### Çözüm
Backend'de `notification_preferences` ve `consent_log` tabloları oluşturulmalı. Frontend localStorage yerine API çağırmalı.

---

## 🔴 KRİTİK: 2FA Ayarları Eksik

Backend'de tam 2FA desteği var:
- `POST /v1/auth/2fa/enable` — 2FA'yı başlat
- `POST /v1/auth/2fa/confirm` — TOTP kodu doğrula
- `POST /v1/auth/2fa/verify` — Giriş sırasında 2FA doğrula
- `POST /v1/auth/2fa/disable` — 2FA'yı kapat

**Ama Settings sayfasında 2FA bölümü yok.** Müşteri 2FA'yı aktif edemiyor.

### Yapılacak
1. `Settings` sayfasına `TwoFactorSection` bileşeni ekle
2. QR kod gösterimi (TOTP secret)
3. Backup kod üretimi
4. 2FA disable (şifre + TOTP kodu ile)

---

## 🔴 KRİTİK: GDPR Veri Dışa Aktarma Eksik

Backend'de `GET /v1/auth/export` endpoint'i var — tüm kullanıcı verisini JSON olarak döndürüyor.

**Ama Settings sayfasında "Verilerimi İndir" butonu yok.**

### Yapılacak
1. `PrivacyConsentSection` veya `DangerZoneSection`'a "Verilerimi İndir" butonu ekle
2. `apiFetch('/auth/export')` çağrısı → JSON dosyası olarak indir

---

## 🔴 KRİTİK: Webhook Export Eksik

Backend'de `GET /v1/webhooks/export` endpoint'i var — teslimatları CSV/JSON olarak dışa aktarıyor.

**Ama Deliveries sayfasında export butonu yok.**

### Yapılacak
1. Deliveries sayfasına "Dışa Aktar" butonu ekle
2. Filtrelenmiş verileri export et (durum, tarih aralığı)
3. CSV ve JSON format seçeneği

---

## 🟡 YÜKSEK: Batch Replay Eksik

Backend'de `POST /v1/webhooks/batch/replay` endpoint'i var — toplu tekrar gönderme.

**Ama Deliveries sayfasında batch replay yok.**

### Yapılacak
1. Deliveries sayfasına checkbox seçimi ekle (zaten var mı kontrol et)
2. "Seçilenleri Tekrar Gönder" butonu ekle
3. `webhooksApi.batch` metodunu kullan

---

## 🟡 YÜKSEK: Admin Settings Raw Fetch

Admin Settings sayfası `adminApi.updateSettings` yerine doğrudan `fetch()` kullanıyor:

```typescript
// Mevcut (kötü):
const res = await fetch(`${API}/admin/settings`, { method: 'PUT', ... });

// Olması gereken:
await adminApi.updateSettings(token, settings);
```

5 yerde raw fetch var. Bu, auth token'ın yanlış yönetilmesine ve CSRF korumasının atlanmasına neden olabilir.

---

## 🟡 YÜKSEK: Feature Flags CRUD Eksik

Backend'de tam CRUD var:
- `GET /v1/admin/feature-flags` — Listeleme ✅ Kullanılıyor
- `POST /v1/admin/feature-flags` — Oluşturma ❌ Kullanılmıyor
- `PUT /v1/admin/feature-flags/{id}` — Güncelleme ❌ Kullanılmıyor
- `DELETE /v1/admin/feature-flags/{id}` — Silme ❌ Kullanılmıyor

Admin panelinde feature flags sadece okunuyor. Admin yeni flag oluşturamıyor veya mevcut flag'leri açıp kapatamıyor.

---

## 🟡 YÜKSEK: Circuit Breaker Durumu Görünmeyen

Backend'de `circuit_breaker.rs` modülü var — endpoint'lerin circuit breaker durumunu tutuyor.

**Ama Health sayfasında circuit breaker durumu gösterilmiyor.**

### Yapılacak
1. Health sayfasına circuit breaker durumu ekle (open/half-open/closed)
2. Endpoint detay sayfasında circuit breaker göstergesi
3. Circuit breaker geçmişini gösterme

---

## 🟡 YÜKSEK: Notification Preferences Backend'e Gitmiyor

`NotificationSection.tsx` içinde:
- `emailNotifs` → `localStorage.setItem('hooksniff_email_notifs', ...)`
- `failureAlerts` → `localStorage.setItem('hooksniff_failure_alerts', ...)`
- `weeklyDigest` → `localStorage.setItem('hooksniff_weekly_digest', ...)`

Backend'de `notifications.rs`'de tercih endpoint'i var ama frontend çağırmıyor.

### Yapılacak
1. `NotificationSection`'ı güncelle — localStorage yerine API çağrısı
2. `notificationsApi.updatePreferences(token, prefs)` ekle
3. Sayfa yüklenirken tercihleri backend'den çek

---

## 🟢 ORTA: CloudEvents/FIFO/WebSocket UI Eksik

Backend'de bu özellikler var ama dashboard'da yapılandırma UI'ı yok:

| Özellik | Backend | Frontend UI |
|---------|---------|-------------|
| CloudEvents v1.0 | ✅ `events/cloudevents.rs` | ❌ Sadece blog/changelog'da bahsediliyor |
| FIFO Delivery | ✅ `fifo/mod.rs` | ❌ Sadece plan kartlarında bahsediliyor |
| WebSocket | ✅ `ws/` | ❌ `useDeliveryStream.ts` hook'u var ama kullanılmıyor |

### Yapılacak
1. Endpoint oluşturma/düzenleme formuna "CloudEvents format" toggle'ı ekle
2. Endpoint ayarlarına "FIFO enabled" toggle'ı ekle
3. WebSocket için ayar sayfası (opsiyonel)

---

## 🟢 ORTA: Inbound Config CRUD Eksik

Backend:
- `POST /v1/inbound/{provider}` — Handle inbound ✅ Frontend'de create var

Eksik:
- Inbound config silme — ❌ Backend'de de yok
- Inbound config düzenleme — ❌ Backend'de de yok

---

## 📋 Yapılacaklar Özeti

### 🔴 KRİTİK (Hemen)
1. 2FA ayarlarını Settings sayfasına ekle
2. GDPR veri dışa aktarma butonu ekle
3. Bildirim tercihlerini backend'e bağla
4. GDPR onaylarını backend'e bağla

### 🟡 YÜKSEK (1-2 Hafta)
5. `endpointsApi.update`'i endpoint detay sayfasında kullan
6. Webhook export butonu ekle (deliveries)
7. Batch replay butonu ekle (deliveries)
8. Admin settings'i raw fetch'ten adminApi'ye çevir
9. Feature flags CRUD (admin)
10. Circuit breaker durumu (health sayfası)

### 🟢 ORTA (1 Ay)
11. CloudEvents/FIFO UI toggle'ları
12. WebSocket ayarları
13. Inbound config düzenleme/silme
