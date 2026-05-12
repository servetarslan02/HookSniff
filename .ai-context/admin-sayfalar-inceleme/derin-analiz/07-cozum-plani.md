# 📋 Çözüm Planı — Öncelikli Adımlar

> Tarih: 2026-05-13
> Amaç: Tüm uyumsuzlukları öncelik sırasına göre çözmek

---

## 🔴 AŞAMA 1 — KRİTİK (Hemen, 1-2 gün)

### 1.1 Endpoint Düzenleme Çalışmıyor
**Sorun:** `endpointsApi.update` api.ts'de tanımlı ama hiçbir sayfa çağırmıyor.
**Çözüm:**
- `endpoints/[id]/page.tsx`'de "Düzenle" butonu ekle
- Modal: URL, açıklama, aktif/pasif toggle
- `endpointsApi.update(token, id, formData)` çağrısı
- Başarı/hata toast mesajı
**Dosyalar:** `endpoints/[id]/page.tsx`, `endpoints/[id]/components/EditEndpointModal.tsx` (yeni)

### 1.2 2FA Ayarları Eksik
**Sorun:** Backend'de 2FA var ama Settings'de UI yok.
**Çözüm:**
- `settings/components/TwoFactorSection.tsx` oluştur
- "2FA'yı Aktifleştir" butonu → QR kod gösterimi
- TOTP doğrulama input'u → `authApi.enable2fa(token, code)`
- Backup kod gösterimi
- "2FA'yı Kapat" butonu (şifre + TOTP kodu ile)
**Dosyalar:** `settings/components/TwoFactorSection.tsx` (yeni), `settings/page.tsx`

### 1.3 GDPR Veri Dışa Aktarma
**Sorun:** Backend'de `GET /v1/auth/export` var ama buton yok.
**Çözüm:**
- `PrivacyConsentSection`'a "Verilerimi İndir" butonu ekle
- `apiFetch('/auth/export')` → JSON dosyası olarak indir
**Dosyalar:** `settings/components/PrivacyConsentSection.tsx`

### 1.4 ConsentToggle API Çağrısı
**Sorun:** Sadece localStorage + cookie, API çağırmıyor.
**Çözüm:**
- Backend'de `consent_log` tablosu oluştur (migration)
- `POST /v1/auth/consent` endpoint'i ekle
- ConsentToggle'ı güncelle → API çağrısı ekle
**Dosyalar:** `ConsentToggle.tsx`, `api/src/routes/auth.rs`, `api/migrations/`

### 1.5 Admin Settings Raw Fetch → adminApi
**Sorun:** 5 yerde `fetch()` kullanılıyor, CSRF koruması atlanıyor.
**Çözüm:**
- Tüm `fetch()` → `adminApi.updateSettings()`, `adminApi.listAlerts()`, vb.
- Error handling统一
**Dosyalar:** `admin/settings/page.tsx`

### 1.6 Feature Flags CRUD
**Sorun:** Admin sadece listeleyebiliyor, oluşturamıyor/silemiyor.
**Çözüm:**
- Feature flags yönetim kartı ekle (admin/page.tsx)
- Toggle ile enable/disable
- "Yeni Flag" butonu + form
- Silme butonu (ConfirmDialog)
**Dosyalar:** `admin/page.tsx`, `admin/components/FeatureFlagsCard.tsx` (yeni)

### 1.7 Webhook Export Butonu
**Sorun:** Backend'de export var ama buton yok.
**Çözüm:**
- Deliveries sayfasına "Dışa Aktar" butonu ekle
- Format seçici (CSV/JSON)
- Filtrelenmiş verileri export et
**Dosyalar:** `deliveries/page.tsx`

### 1.8 Circuit Breaker Durumu
**Sorun:** Backend'de var ama Health'de görünmüyor.
**Çözüm:**
- Her endpoint kartına circuit breaker göstergesi ekle
- Durum renk kodları: 🟢 Closed, 🔴 Open, 🟡 HalfOpen
**Dosyalar:** `health/page.tsx`

---

## 🟡 AŞAMA 2 — YÜKSEK (1-2 hafta)

### 2.1 Batch Replay Butonu
- Deliveries sayfasına checkbox + "Seçilenleri Tekrar Gönder"
- `webhooksApi.batch()` çağrısı

### 2.2 NotificationSection Başlangıç Değerleri
- Sayfa yüklenirken API'den tercihleri çek
- localStorage fallback olarak kullan

### 2.3 Schema Oluşturma Formu
- "Yeni Schema" butonu + modal (name, version, JSON textarea)
- `apiFetch('/schemas', { method: 'POST', body })` çağrısı

### 2.4 Template "Kullan" Butonu
- Template kartına "Kullan" butonu
- Endpoint seçici modal
- `apiFetch('/templates/{id}/apply', { method: 'POST', body: { endpoint_id } })`

### 2.5 Routing Düzenleme Formu
- "Düzenle" butonu + modal (strategy, fallback_url)
- `apiFetch('/endpoints/{id}/routing', { method: 'PUT', body })`

### 2.6 Rate Limit Ayarlama Formu
- "Limit Ayarla" butonu + modal (rps, burst_size)
- `apiFetch('/rate-limits/{endpoint_id}', { method: 'POST', body })`

### 2.7 Alert Düzenleme
- Her alert kartında "Düzenle" butonu
- Mevcut değerlerle form
- `alertsApi.update(token, id, data)` çağrısı

### 2.8 Outbound IPs Sayfası
- Yeni sayfa: `/dashboard/outbound-ips`
- IP listesi + kopyalama butonu

---

## 🟢 AŞAMA 3 — ORTA (1 ay)

### 3.1 Yeni Sayfalar
- Applications sayfası
- Simulator sayfası
- Stream (SSE) sayfası
- Devices sayfası

### 3.2 Mevcut Sayfalarda İyileştirmeler
- Inbound config silme/düzenleme (backend ekle)
- Transform düzenleme/sıralama (backend ekle)
- Billing ödeme yöntemi yönetimi
- Admin: ARPU, LTV, cohort analizi

### 3.3 UI Özellikleri
- CloudEvents toggle (endpoint ayarları)
- FIFO toggle (endpoint ayarları)
- WebSocket ayarları

---

## 📊 Zaman Tahmini

| Aşama | Süre | Toplam Madde |
|-------|------|-------------|
| 🔴 AŞAMA 1 | 1-2 gün | 8 madde |
| 🟡 AŞAMA 2 | 1-2 hafta | 8 madde |
| 🟢 AŞAMA 3 | 1 ay | 9 madde |
| **TOPLAM** | ~5 hafta | **25 madde** |

---

## ⚠️ Dikkat Edilecekler

1. **Her değişiklik sonrası `next build` ile doğrula** — Build hatası varsa push etme
2. **i18n anahtarlarını ekle** — EN + TR her yeni metin için
3. **Dark mode kontrol et** — Her yeni bileşen dark mode desteklemeli
4. **Accessibility kontrol et** — aria-label, htmlFor, keyboard navigation
5. **Backend migration varsa önce uygula** — Neon DB'ye psql ile
6. **cargo test çalıştır** — Backend değişikliği sonrası
