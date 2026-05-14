# NEXT_SESSION.md — E2E Test Sonrası

> Son güncelleme: 2026-05-15 05:25 GMT+8

## Yapılan (Oturum 161 — E2E Test)

### Kapsamlı Müşteri Testi
- 20+ sayfa tarandı (landing, admin, user panel, API)
- 17 sayfa çalışıyor, 3 sayfa hatalı
- 13 i18n eksik key tespit edildi
- 2 backend 500 hatası bulundu
- Rapor: `.ai-context/E2E-TEST-REPORT-2026-05-15.md`

## 🔴 Acil — Bu Oturumda Yapılmalı

### 1. `/v1/auth/2fa/status` 500 Hatası
- **Sorun:** Settings sayfasındaki 2FA status endpoint'i 500 döndürüyor
- **Dosya:** `api/src/routes/auth.rs` — `get_2fa_status` handler
- **Etki:** 2FA bölümü tamamen çalışmıyor

### 2. `/monitoring` 404 Hatası
- **Sorun:** Monitoring sayfası 404 döndürüyor
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/monitoring/page.tsx` — var mı kontrol et
- **Etki:** Sidebar linki bozuk

### 3. i18n Eksik Key'ler (13 adet)
- `auth.verifyEmailSent`
- `billing.nextBilling`, `billing.webhooksThisMonth`, `billing.used`
- `settings.twoFactorAuth`, `settings.twoFactorDesc`, `settings.2faDisabled`, `settings.enable2fa`
- `docs.docs`, `docs.developer`, `docs.startup`, `docs.enterprise`, `docs.unlimited`
- **Dosya:** `dashboard/src/messages/en.json` — key'leri ekle

## 🟡 Orta — Sonraki Adımlar

### 4. `/api/status` 404
- Status API route'u tanımlı değil
- Ya Next.js API route oluştur ya da backend'den proxy et

### 5. Fiyat Tutarsızlığı
- Landing: $0/$29/$49/Custom
- MEMORY.md: $0/$29/$99
- Doğru fiyat ne? Servet'e sor veya düzelt

### 6. Pending Deliveries (2 adet)
- 13 Mayıs'tan kalma, 0 attempt
- Worker neden işlemiyor?

## Hesap Bilgileri
- Admin: servetarslan02@gmail.com / Alayci_165
- Dashboard: https://hooksniff.vercel.app
- API: https://hooksniff-api-1046140057667.europe-west1.run.app
