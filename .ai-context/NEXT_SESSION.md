# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-24 GMT+8 (OpenClaw oturumu)

## ✅ Tamamlanan İşler (Bu Oturum)

### Cortex Dashboard — ML Quality + Proactive Healing Tabs
- `dashboard/src/app/[locale]/admin/cortex/page.tsx` — 329 satır eklendi
- ML Quality: model doğruluk, hata oranı, kalite skoru, sıfırla butonu
- Proactive Healing: proaktif uyarılar, severity, tavsiyeler
- PredictionsTab typo fix
- Commit: `b820786a` — push edildi

---

## Sıradaki — Gerçekten Yapılması Gereken

### 🔴 Servet'in Yapması Gereken (Kod Dışı)

1. **Google OAuth Client ID**
   - https://console.cloud.google.com/apis/credentials → proje: hooksniff-app
   - Mevcut OAuth 2.0 Client ID'yi bul
   - Client ID'yi kopyala (xxx.apps.googleusercontent.com formatında)

2. **GitHub OAuth App**
   - https://github.com/settings/developers → New OAuth App
   - Application name: HookSniff
   - Homepage URL: https://hooksniff.vercel.app
   - Callback URL: https://hooksniff-api-1046140057667.europe-west1.run.app/v1/oauth/github/callback

3. **Secret Manager Güncelle**
   - `google-client-id` → gerçek değer gir
   - `github-client-id` → gerçek değer gir
   - `github-client-secret` → gerçek değer gir

4. **Migration Uygula (Neon DB)**
   - Migration 087: SSO Enhancements
   - Migration 088: RBAC Enhancements
   - Migration 089: Cortex indexes + fixes

5. **Cloud Build Tetikle**
   - Push yapıldı (`b820786a`), Cloud Build otomatik tetiklenmeli
   - Build log: https://console.cloud.google.com/cloud-build/history?project=hooksniff-app

### 🟡 Backend Integration Tests
- Gerçek API ile çalışan test'ler (backend çalışırken)
- SAML/OIDC callback akışı end-to-end
- SCIM provisioning akışı end-to-end

### 🟢потенциyal İyileştirmeler
- Worker'da cortex_integration aktif kullanımı (delivery outcome reporting)
- Dashboard: correlations, surge, routing tab'ları (opsiyonel)
- Merkezi Cortex Scheduler refactor (şu anki offset yöntemi çalışıyor)

---

## 📊 Proje Durumu

### Tamamlanan Modüller (Son Oturumlar)
| Modül | Durum |
|-------|-------|
| Cortex Dashboard (6 tab) | ✅ |
| RBAC Frontend + Backend | ✅ |
| SSO Enhancements | ✅ |
| SCIM 2.0 | ✅ |
| SDK Roadmap (Faz 8-15) | ✅ |
| Rate Limiting (Redis) | ✅ |
| Alert Evaluation Worker | ✅ |
| Redis State Migration (SSO) | ✅ |
