# 2026-05-20 — Inbound Webhook Fix

## Sorun
Dashboard'daki "Gelen Webhooklar" sayfasında gösterilen tüm URL'ler (Stripe, GitHub, Shopify, Slack, Twilio, Discord, Linear, Notion) 401 Unauthorized hatası veriyordu.

## Kök Neden
1. **API key zorunluluğu** — `handle_inbound` fonksiyonu tüm isteklerde API key header'ı istiyordu, ama dış servisler (Stripe, GitHub vb.) API key göndermez
2. **Inbound config yok** — DB'de `inbound_configs` tablosunda kayıt yoksa anlamsız hata mesajları dönüyordu
3. **Dashboard URL'leri yanlış** — `/v1/inbound/{provider}` formatında gösteriliyordu, halbuki bu endpoint API key gerektiriyordu

## Yapılan Değişiklikler

### API (`api/src/routes/inbound.rs`)
- `resolve_customer_from_api_key()` — API key ile müşteri bulma helper'ı
- `resolve_customer_from_endpoint()` — endpoint_id ile müşteri bulma (API key gereksiz)
- `process_inbound()` — ortak webhook işleme fonksiyonu (kod tekrarını azaltır)
- `handle_inbound()` — API key varsa çalışır, yoksa açıklayıcı hata mesajı döner
- `handle_inbound_to_endpoint()` — **API key gerektirmez**, endpoint_id URL'den yeterli

### Dashboard (`dashboard/src/app/[locale]/(dashboard)/inbound/page.tsx`)
- URL gösterimi değişti: `/v1/inbound/{provider}/{endpoint_id}` formatında
- Config yoksa placeholder URL'ler + açıklama gösteriliyor
- Config varsa sadece o provider'ın URL'si gösteriliyor

### i18n (`en.json` + `tr.json`)
- `urlExplanation` — URL'lerin nasıl çalıştığını açıklayan metin
- `noEndpointsConfigured` — endpoint yapılmamış uyarısı
- `createConfigFirst` — config oluşturulması gerektiğini belirten mesaj

## Yeni Akış
```
1. Kullanıcı Dashboard → Inbound Webhooks → Add Provider
2. Provider seçer (ör: Stripe), secret girer, hedef endpoint seçer
3. Dashboard'da o provider için URL görünür: /v1/inbound/stripe/{endpoint_id}
4. Kullanıcı bu URL'yi Stripe dashboard'ına yapıştırır
5. Stripe webhook gönderir → HookSniff imza doğrulaması yapar → hedef endpoint'e teslim eder
```

## Push
- Commit: `9556dead`
- 4 dosya değişti, 216 satır eklendi, 197 satır silindi
