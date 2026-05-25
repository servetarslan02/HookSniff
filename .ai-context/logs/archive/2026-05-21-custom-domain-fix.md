# 2026-05-21 — Custom Domain Test & Fix

## Test Yapılan
- Custom Domain akışı (Routing → Custom Domain sekmesi)
- Domain ekleme, doğrulama, silme, edge case'ler

## Düzeltilen Sorunlar (3 adet)

### 1. Input Filtresi UX Bug
- **Sorun:** `https://webhooks.example.com` yapıştırılınca `httpswebhooks.example.com` oluyordu
- **Sebep:** `onChange` handler `[^a-z0-9.-]` regex ile filtreliyordu, `:` ve `/` karakterlerini silip harfleri bırakıyordu
- **Fix:** onChange'de önce `https?://` protokolünü temizle, sonra filtre uygula
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/custom-domain/CustomDomainContent.tsx` satır 181

### 2. Add Domain Butonu Disabled Durumu
- **Sorun:** `justaword` (nokta yok) girilince buton aktif kalıyordu
- **Fix:** `disabled={saving || !domain || !domain.includes('.')}` — nokta yoksa devre dışı
- **Dosya:** Aynı dosya, satır 192

### 3. Duplicate DNS Records
- **Sorun:** Yeni domain eklenince hem üstte "DNS Records" tablosu hem "Your Domains" altında aynı bilgi gösteriliyordu
- **Fix:** Üstteki tablo, domain "Your Domains" listesinde varsa gizleniyor
- **Dosya:** Aynı dosya, satır 201

## Commit
- `a1cb0170` — "fix: custom domain input filter, button state, and duplicate DNS records"
- Push edildi: `origin/main`
