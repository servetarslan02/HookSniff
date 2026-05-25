# 2026-05-21 — Session Management Fix (HS-039)

## Problem
Oturumlar bazen düşüyordu. Ana nedenler:
1. JWT 1 saat, cookie 24 saat — tutarsızlık
2. Frontend sadece 401 aldıktan sonra refresh deniyordu (proaktif değildi)
3. Store'daki token state refresh sonrası güncellenmiyordu

## Çözüm

### Backend (Rust)
- `jwt.rs`: Access token 1saat → 15dk
- `auth.rs`: Cookie TOKEN_MAX_AGE 86400 → 900 (15dk)
- `sso.rs`, `oauth.rs`: SSO/OAuth cookie 86400 → 900

### Frontend (TypeScript)
- `api.ts`: Proaktif refresh eklendi (12dk interval)
  - `doRefresh()` artık string|null döndürüyor
  - `startProactiveRefresh()` / `stopProactiveRefresh()` export
- `store.tsx`: 
  - Login/restore sonrası proaktif refresh başlıyor
  - Logout'ta proaktif refresh duruyor
  - Token state refresh sonrası güncelleniyor
  - Cookie 7gün → 15dk

### TS Hataları (önceden var olan)
- `billing/page.tsx`: unused `planOrder` kaldırıldı
- `integrations/IntegrationsContent.tsx`: inline type annotation kaldırıldı
- `auth/callback/page.tsx`: unused `refresh` kaldırıldı

## Yeni Akış
```
Aktif kullanıcı → 12dk'da token yenilenir → oturum asla düşmez
1 saat pasif → idle timeout → login sayfası
Token expire + aktif → 401 → refresh → retry → başarılı
```

## Dosyalar
- api/src/auth/jwt.rs
- api/src/routes/auth.rs
- api/src/routes/sso.rs
- api/src/routes/oauth.rs
- dashboard/src/lib/api.ts
- dashboard/src/lib/store.tsx
- dashboard/src/app/[locale]/(dashboard)/billing/page.tsx
- dashboard/src/app/[locale]/(dashboard)/integrations/IntegrationsContent.tsx
- dashboard/src/app/[locale]/auth/callback/page.tsx

## Commit: 20aa1263
