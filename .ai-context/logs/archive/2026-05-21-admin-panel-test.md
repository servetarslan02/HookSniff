# Admin Panel Kapsamlı Test Raporu — 2026-05-21

## Test Ortamı
- **Hesap:** demo@hooksniff.com (Enterprise, Admin)
- **Dashboard:** https://hooksniff.vercel.app
- **API:** https://hooksniff-api-1046140057667.europe-west1.run.app

---

## Düzeltilen Bug'lar (commit fb230584)

### 1. Settings i18n Eksikliği ✅ DÜZELTİLDİ
- **Dosya:** `dashboard/src/messages/en.json`, `tr.json`
- **Sorun:** Email & Security sekmesinde ~13 key raw olarak görünüyordu
- **Eklenen key'ler:** emailSettings, emailSettingsDesc, senderAddress, securitySettings, webhookSecret, webhookSecretDesc, globalRateLimit, corsOrigins, corsOriginsDesc, backupSettings, backupRetention, backupRetentionDesc, features

### 2. CouponCode SQLx Deserialization ✅ DÜZELTİLDİ
- **Dosya:** `api/src/models/coupon.rs`
- **Sorun:** `coupon_type` alanı DB'de `type` ama sqlx eşleştiremiyordu
- **Fix:** `#[sqlx(rename = "type")]` eklendi

### 3. Plan Feature Tutarsızlığı ✅ DÜZELTİLDİ
- **Dosya:** `dashboard/src/app/[locale]/admin/revenue/components/RevenueContent.tsx`
- **Sorun:** Feature listesi "20/50/200 endpoints" diyor ama limits tablosunda farklı değerler
- **Fix:** Endpoint/webhook/rate/retention feature listesinden kaldırıldı (zaten limits bölümünde gösteriliyor)

---

## Hâlâ Açık Olan Bug'lar (Deploy Gerekli)

### 4. API 500 Hataları — Coupon Create
- **Endpoint:** `POST /v1/admin/coupons`
- **Durum:** DB'de tablo var, SQL direkt çalışıyor ama API 500 veriyor
- **Muhtemel neden:** Cloud Run'daki kod eski (#[sqlx(rename)] fix'i deploy edilmeli)

### 5. API 500 Hataları — Alert Create
- **Endpoint:** `POST /v1/admin/alerts`
- **Durum:** Aynı sorun — DB çalışıyor, API 500

### 6. API 500 Hataları — Revenue Metrics
- **Endpoint:** `GET /v1/admin/revenue/metrics`, `/cohorts`, `/refunds`
- **Durum:** Hepsi 500 dönüyor

### 7. API 500 Hataları — Security Events
- **Endpoint:** `GET /v1/admin/security/events`
- **Durum:** 500 dönüyor

### 8. Feature Flag Toggle
- **Durum:** API tarafında çalışıyor (PUT ile doğrulandı), frontend'de test sırasında yanlış element'e tıklanmış olabilir — deploy sonrası yeniden test gerekli

### 9. System Health Check Failed
- **Endpoint:** `GET /health`
- **Durum:** DB ve Redis "unknown" gösteriyor

### 10. CSP Violation
- **Sorun:** Cloudflare analytics script CSP tarafından engelleniyor
- **Fix:** Next.js config'de CSP header'a `static.cloudflareinsights.com` eklenmeli

---

## Çalışan Sayfalar (Sorunsuz)
- Overview ✅
- Users (list, search, filter, pagination, impersonate) ✅
- Feature Flags (create, edit, delete) ✅
- Activity Log (971 kayıt, filtre, pagination) ✅
- Email (bulk email formu) ✅
- Settings > General sekmesi ✅

## Deploy Komutu
```bash
gcloud builds submit --config cloudbuild.yaml
# VEYA sadece API:
gcloud run deploy hooksniff-api --source . --region europe-west1
```
