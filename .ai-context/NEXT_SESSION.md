# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-24 GMT+8 (OpenClaw oturumu 2)

## ✅ Son Oturumda Yapılan İşler

### SSO Auth Cookie Fix (BUG)
- `api/src/routes/sso.rs`: Cookie 900s → 3600s (1 saat)
- 5 adet `unwrap()` → proper error handling
- Commit: push edildi

### Cortex Dashboard (önceki oturum)
- ML Quality + Proactive Healing tab'ları
- OAuth double-click fix
- Session duration fix (PC 1 saat, mobile 90 gün)

---

## 🔴 Servet'in Yapması Gereken (Kod Dışı)

### 1. Google OAuth Client ID
- https://console.cloud.google.com/apis/credentials → proje: hooksniff-app
- Mevcut OAuth 2.0 Client ID'yi bul
- Client ID'yi kopyala (xxx.apps.googleusercontent.com formatında)

### 2. GitHub OAuth App
- https://github.com/settings/developers → New OAuth App
- Application name: HookSniff
- Homepage URL: https://hooksniff.vercel.app
- Callback URL: https://hooksniff-api-1046140057667.europe-west1.run.app/v1/oauth/github/callback

### 3. Secret Manager Güncelle
- `google-client-id` → gerçek değer gir
- `github-client-id` → gerçek değer gir
- `github-client-secret` → gerçek değer gir

### 4. Migration Uygula (Neon DB)
- Migration 087-100 dosyaları `migrations/` klasöründe mevcut
- Sırasıyla uygulanmalı

### 5. Cloud Build Tetikle
- Push yapıldı, Cloud Build otomatik tetiklenmeli
- Build log: https://console.cloud.google.com/cloud-build/history?project=hooksniff-app

---

## 🟡 Sıradaki Kod İşleri

### Backend Integration Tests
- Gerçek API ile çalışan test'ler
- SAML/OIDC callback akışı end-to-end
- SCIM provisioning akışı end-to-end

### Git Cleanup (P3)
- Stale branch'ler temizle
- 20+ açık Dependabot PR kontrol et
- Commit convention standardize et

### SDK İyileştirmeleri (P3)
- 11 SDK'da retry logic ekle
- OpenAPI schema vs actual API mismatch düzelt
- Version mismatch (Kotlin) kontrol et

---

## 📊 Proje Durumu Özeti

| Kategori | Durum |
|----------|-------|
| P0 (Acil) | 14/14 ✅ |
| P1 (Yüksek) | 44/44 ✅ |
| P2 (Orta) | 17/38 (21 kaldı) |
| P3 (Düşük) | 0/13 (13 kaldı) |
| **Toplam** | **75/103** |

### Tamamlanan Modüller
- ✅ Cortex Dashboard (6 tab)
- ✅ RBAC Frontend + Backend
- ✅ SSO Enhancements
- ✅ SCIM 2.0
- ✅ SDK Roadmap (Faz 8-15)
- ✅ Rate Limiting (Redis)
- ✅ Alert Evaluation Worker
- ✅ Redis State Migration (SSO)
- ✅ Session Duration Fix
- ✅ OAuth Double-Click Fix
- ✅ SSO Auth Cookie Fix

---

## 🔑 Hesap Bilgileri (Hatırlatma)

| Servis | Bilgi |
|--------|-------|
| Dashboard | https://hooksniff.vercel.app |
| API | https://hooksniff-api-1046140057667.europe-west1.run.app |
| Admin email | servetarslan02@gmail.com |
| Google Cloud | proje: hooksniff-app |
| Neon DB | proje: hookrelay |
