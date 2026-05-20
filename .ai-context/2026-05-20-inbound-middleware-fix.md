# 2026-05-20 — Inbound Auth Middleware Fix + Config Setup

## Sorun
Auth middleware tüm inbound rotalarını blokluyordu. Dış servisler (Stripe, GitHub) API key gönderemediği için 401 hatası alıyordu.

## Kök Neden
`routes/mod.rs` içinde `inbound_routes` üzerine `auth_middleware` layer'ı uygulanmıştı. Bu middleware token yoksa `AppError::Unauthorized` döndürüyordu.

## Yapılan Değişiklikler

### 1. Auth Middleware Bypass (`api/src/middleware/mod.rs`)
- `/v1/inbound/{provider}` ve `/v1/inbound/{provider}/{endpoint_id}` rotaları için auth bypass eklendi
- `/v1/inbound/configs` rotaları hâlâ auth gerektiriyor
- Path-based kontrol: `path.starts_with("/v1/inbound/")` && `!after_prefix.starts_with("configs")`

### 2. DB Config Setup (Neon PostgreSQL)
- 9 provider için inbound_configs kaydı oluşturuldu (demo hesabına):
  stripe, github, shopify, slack, twilio, discord, linear, notion, generic
- Hepsi aynı endpoint'e (httpbin.org/post) yönlendiriliyor
- Her provider için unique test secret atandı

### 3. Build Hataları
- İlk denemede `routes/mod.rs` içinde handler fonksiyonları doğrudan kullanılmaya çalışıldı → compile error
- Çözüm: Mevcut `inbound::router()` yapısı korundu, sadece middleware bypass eklendi

## Test Sonuçları
- ✅ Sahte imza → 401 (doğru reddetme)
- ✅ İmzasız istek → 401 (doğru reddetme)
- ✅ Doğru imza → 200 + delivery_id (webhook teslim edildi)
- ✅ API key olmadan provider endpoint'e erişim → çalışıyor

## Push
- `00a49e8f` — auth middleware bypass
- `8671433b` — önceki (başarısız) deneme
