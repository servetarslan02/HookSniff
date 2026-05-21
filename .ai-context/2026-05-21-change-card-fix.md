# 2026-05-21 — Change Card Button Fix

## Sorun
Billing sayfasındaki "Change Card" butonuna tıklandığında kullanıcı `/account` sayfasına yönlendiriliyordu. Oysa buton, Polar müşteri portalını açmalıydı.

## Kök Neden
Backend'de `create_customer_portal` fonksiyonunun `return_url` parametresi ve tüm fallback URL'ler `/account` olarak ayarlıydı. Frontend'deki `isOwnPage` kontrolü ise sadece `/dashboard/billing` ve `/billing`'i yakalıyordu — `/account`'ı değil.

## Yapılan Değişiklikler

### Backend (Rust)
- `api/src/billing/polar.rs`: `return_url` `/account` → `/dashboard/billing`
- `api/src/billing/polar.rs`: 2 fallback URL `/account` → `/dashboard/billing`
- `api/src/billing/mod.rs`: 2 fallback URL `/account` → `/dashboard/billing`

### Frontend (TypeScript)
- `dashboard/.../SubscriptionDetails.tsx`: `isOwnPage` kontrolüne `/account` eklendi

## Etki
- Polar portal'dan "back" tuşuna basıldığında artık billing sayfasına dönülür
- Polar hata verirse kullanıcı billing sayfasında kalır
- Provider yoksa kullanıcı billing sayfasına yönlendirilir

## Commit
`cfed648c` — main branch'e push edildi
