# 🚀 HookSniff Quickstart — 5 Dakikada İlk Webhook'unu Gönder

## 1. Kayıt Ol (1 dakika)

1. [hooksniff.vercel.app/register](https://hooksniff.vercel.app/register) adresine git
2. Email ve şifreni gir
3. Email doğrulama linkine tıkla

## 2. API Key Al (1 dakika)

1. Dashboard → **Core** → **API Keys** sekmesine git
2. **"Create API Key"** butonuna tıkla
3. Key'i kopyala (sadece bir kez gösterilir!)

```
hr_live_abc123def456...
```

## 3. Endpoint Oluştur (1 dakika)

Webhook'ların nereye teslim edileceğini belirle.

```bash
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints \
  -H "Authorization: Bearer hr_live_SENIN_KEYIN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://senin-siten.com/webhook"}'
```

Response:
```json
{
  "id": "ep_abc123",
  "url": "https://senin-siten.com/webhook",
  "created_at": "2026-05-15T00:00:00Z"
}
```

## 4. Webhook Gönder (1 dakika)

```bash
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \
  -H "Authorization: Bearer hr_live_SENIN_KEYIN" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint_id": "ep_abc123",
    "event": "order.created",
    "data": {
      "order_id": "12345",
      "amount": 99.99,
      "currency": "USD"
    }
  }'
```

Response:
```json
{
  "id": "wh_xyz789",
  "status": "pending",
  "event": "order.created",
  "created_at": "2026-05-15T00:00:00Z"
}
```

## 5. Teslimatı Kontrol Et (1 dakika)

Dashboard → **Deliveries** sekmesine git. Webhook'un durumunu göreceksin:

- ✅ **Delivered** — Başarıyla teslim edildi
- ⏳ **Pending** — Teslim edilmeyi bekliyor
- ❌ **Failed** — Teslimat başarısız (otomatik retry)

## 🎉 Tebrikler!

İlk webhook'unu gönderdin. Şimdi ne yapabilirsin:

- **[Entegrasyon Rehberleri](integrations/)** — Shopify, Stripe, GitHub gibi platformlarla bağla
- **[API Dokümantasyonu](API.md)** — Tüm endpoint'leri öğren
- **[SSS](faq/)** — Sık sorulan sorular

## Sorun mu var?

- Dashboard'da hata mı görüyorsun? → [SSS](faq/)'ye bak
- API çalışmıyor mu? → [API Dokümantasyonu](API.md)'nu kontrol et
- Hâlâ çözemedin mi? → support@hooksniff.dev
