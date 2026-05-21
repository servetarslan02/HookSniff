# 2026-05-21 — Change Card Fix (Root Cause)

## Sorun
"Change Card" butonuna tıklayınca "No payment method on file" uyarısı çıkıyordu.

## Kök Neden
Backend, Polar API'ye `external_customer_id` olarak Polar'ın kendi customer ID'sini (`85552475-...`) gönderiyordu.
Ama Polar'ın `external_customer_id` parametresi, dış sistemin (HookSniff) müşteri UUID'sini (`03006b76-...`) bekliyor.

Polar API 422 hatası döndürüyordu → backend fallback olarak `/dashboard/billing` URL'i döndürüyordu → frontend bu URL'i görünce "No payment method" toast'u gösteriyordu.

## Çözüm
`api/src/billing/mod.rs`'de Polar provider'ı için `customer.id.to_string()` (HookSniff UUID) kullanıldı.

## Doğrulama
Polar API'ye doğru `external_customer_id` ile istek atıldı → `customer_portal_url` başarıyla döndü:
`https://polar.sh/servet-arslan/portal?customer_session_token=...`

## Commit
`bc4abae4` — main branch'e push edildi
