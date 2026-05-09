# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 06:25 GMT+8

---

## 🔴 ACİL — Servet'in Yapması Gereken

| Görev | Öncelik | Not |
|-------|---------|-----|
| GitHub PAT rotate | 🔴 ACİL | Eski token chat'te paylaşıldı — YENİ TOKEN OLUŞTUR |
| npm token rotate | 🔴 ACİL | Eski token paylaşıldı |
| GCP SA key rotate | 🔴 ACİL | Eski key paylaşıldı |
| Vercel token rotate | 🔴 ACİL | Eski token paylaşıldı |
| Login test | 🔴 | Deploy sonrası dashboard'da dene |
| OAuth test | 🔴 | Google/GitHub OAuth env var'ları ayarla |
| iyzico hesap | ❌ | Vergi levhası + banka hesabı |

---

## ✅ SON OTURUMLAR (66a + 66b) — Backend + Dashboard Entegrasyonu

### Oturum 66a — Backend Endpoints (06:02 - 06:15)
- 7 backend endpoint eklendi (OAuth, audit-log, SSO, custom-domains, portal-config, rate-limits)
- Migration 038: 5 yeni tablo
- GitHub: `fea537b`

### Oturum 66b — Dashboard → API (06:15 - 06:25)
- 7 dashboard sayfası localStorage'dan gerçek API'ye bağlandı
- OAuth callback sayfası oluşturuldu
- OAuth backend HttpOnly cookie fix
- GitHub: `16fcf9b`

---

## 🟡 YENİ OTURUMDA YAPILACAK

| # | Görev | Öncelik | Not |
|---|-------|---------|-----|
| 1 | Build & deploy | 🔴 | `cargo check` → fix → deploy |
| 2 | OAuth env var'ları | 🔴 | GCP'de GOOGLE_CLIENT_ID, GITHUB_CLIENT_ID ayarla |
| 3 | Dashboard build test | 🔴 | `cd dashboard && npm run build` |
| 4 | Migration çalıştır | 🔴 | 038_backend_endpoints.sql Neon DB'de |
| 5 | Test dosyaları temizliği | 🟢 | Unused import'lar |

### Deploy Checklist
```
1. Neon DB'de migration çalıştır:
   psql $DATABASE_URL -f migrations/038_backend_endpoints.sql

2. GCP Cloud Run env var'ları ekle:
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GITHUB_CLIENT_ID=...
   GITHUB_CLIENT_SECRET=...
   OAUTH_REDIRECT_BASE=https://hooksniff-api-1046140057667.europe-west1.run.app

3. Vercel dashboard rebuild

4. Login test + OAuth test
```

---

## ⚠️ Önemli Notlar

- **Oturumlar 1 saat** — planlı çalış, GitHub push sık yap
- **Hafıza GitHub'da kalıcı** — `.ai-context/`
- **Rust kurulu değil** — bu makinede `cargo check` çalıştırılamıyor
- **Token güvenliği** — Servet token paylaştı, rotate edilmeli
