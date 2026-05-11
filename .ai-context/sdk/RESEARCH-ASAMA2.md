# AŞAMA 2 Araştırma Raporu — SDK Wrapper + İmza Doğrulama

> Tarih: 2026-05-11 22:48 GMT+8

## Svix SDK Analizi

### Mimari
- **Svix class** — ana wrapper, `SvixRequestContext` oluşturur
- **Resource classes** — `Endpoint`, `Message`, `Application` vb. her biri API resource'u temsil eder
- **SvixRequest** — HTTP helper, path params, query params, body, retry logic
- **Webhook class** — `standardwebhooks` paketini kullanır, HMAC-SHA256 doğrulama

### Desen
```
const svix = new Svix(token, options);
const endpoint = await svix.endpoint.create(appId, endpointIn);
const message = await svix.message.create(appId, messageIn);
```

### Retry
- `numRetries` veya `retryScheduleInMs` seçenekleri
- Exponential backoff (50ms → 100ms → 200ms)
- 5xx hatalarında retry, 4xx'te hemen throw

### Webhook Doğrulama
- `standardwebhooks` paketi (Svix'in kendi open-source paketi)
- Header'lar: `webhook-id`, `webhook-timestamp`, `webhook-signature`
- Veya Svix branded: `svix-id`, `svix-timestamp`, `svix-signature`
- HMAC-SHA256, secret `whsec_` prefix'i ile gelir

## HookSniff Mevcut SDK Analizi

### Mevcut Durum
- OpenAPI Generator ile üretilmiş (207 TypeScript dosyası, 172 model)
- `request` kütüphanesi kullanıyor (deprecated!)
- Her API resource'u ayrı dosyada (`endpointsApi.ts`, `webhooksApi.ts` vb.)
- Constructor pattern: `new EndpointsApi(basePath)` + manual auth set

### Sorunlar
1. `request` npm paketi deprecated (2020'den beri)
2. Wrapper class yok — doğrudan `new EndpointsApi()` + manual auth
3. `verifySignature` fonksiyonu yok
4. Modern TypeScript/ESM desteği yok
5. Bluebird Promise gereksiz (native Promise yeterli)

## Karar: Ne Yapacağız

### AŞAMA 2 Plan
1. **`src/index.ts`** — ana `HookSniff` class (Svix pattern)
2. **`src/webhook.ts`** — `verifySignature` fonksiyonu
3. **`src/request.ts`** — modern HTTP helper (native fetch)
4. **`src/resources/`** — API resource wrapper'ları
5. Mevcut generated kodu koru (backward compatibility)
6. Wrapper üst katman olarak çalışır

### Tasarım İlkeleri
- Native `fetch` kullan (Node 18+ built-in)
- `request` ve `bluebird` dependency'lerini kaldır
- TypeScript strict mode
- ESM + CJS dual export
- Zero external dependencies (sadece `crypto` — Node built-in)
- `whsec_` prefix secret format (Standard Webhooks uyumlu)
