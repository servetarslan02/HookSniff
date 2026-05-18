# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-19 02:45 GMT+8
> Bu dosya GitHub'da kalıcıdır. Her oturum başı okunur, oturum sonunda güncellenir.

## 🎯 Sıradaki: #6 — Idempotency Key Kontrolü

### Ne Yapılacak?
Tüm 11 SDK'ya `idempotencyKey` parametresi ekle:
- Kullanıcı kendi key'ini verebilmeli (opsiyonel)
- Verilmezse otomatik `auto_xxx` üretilmeli
- Retry güvenliği için kritik

### Örnek Kullanım:
```typescript
// Otomatik
await client.message.create({ eventType: "order.created", payload: {...} });
// Manuel
await client.message.create({ eventType: "order.created", payload: {...} }, { idempotencyKey: "order_123" });
```

### Tahmini Süre: 1-2 saat

---

## 📋 Tamamlanan Son İş

### #5 — Webhook Payload Parsing ✅ (2026-05-19)
- 11 SDK'da `verify()` → `WebhookEvent` döndürüyor
- `event`, `data`, `timestamp` field'ları
- Backward compatible (`verifyRaw()` / `verify_raw()`)

---

## 📊 SDK Kalite Skoru: %88

| Faz | İçerik | Durum |
|-----|--------|-------|
| 1 | İmza doğrulama | ✅ 11/11 |
| 2 | Retry/Backoff | ✅ 11/11 |
| 3 | Pagination | ✅ 11/11 |
| 4 | Error types (21) | ✅ 11/11 |
| 5 | Payload Parsing | ✅ 11/11 |
| 6 | Idempotency Key | ❌ Sıradaki |
| 7 | Response Metadata | ❌ |
| 8 | Config | ❌ |
| 9 | Debug Logging | ❌ |
| 10 | Typed Events | ❌ |

---

## ⚠️ Bilinen Sorunlar

1. Kotlin SDK build sorunu devam ediyor (package çakışması)
2. Test coverage düşük (%60-70)
3. Connector'lar eksik (Shopify, Stripe)
