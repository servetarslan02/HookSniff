# 2026-05-17 — Node.js SDK Rewrite (Svix-based)

## Ne Yapıldı?

Node.js SDK tamamen yeniden yazıldı. Eski OpenAPI Generator boilerplate kaldırıldı, yerine Svix SDK mimarisi (MIT lisans) bazlı el yapımı SDK konuldu.

## Değişiklikler

### Eski → Yeni
- **Eski:** OpenAPI Generator 7.22.0 çıktısı, 32 dosya, saf boilerplate
- **Yeni:** El yapımı, 19 kaynak dosya, Svix mimarisi

### Eklenen Özellikler
1. **Retry + Exponential Backoff** — 5xx hatalarında otomatik retry (varsayılan 2 deneme)
2. **Auto-Idempotency Key** — POST isteklerine otomatik `idempotency-key` header
3. **Auto-Pagination** — `for await (const ep of hs.endpoints.listAll())` desteği
4. **Webhook Doğrulama** — HMAC-SHA256, Standard Webhooks, timing-safe comparison
5. **Custom Fetch** — Test veya proxy ortamları için `fetch` injection
6. **Timeout Desteği** — `AbortSignal.timeout()` ile istek timeout

### Resource'lar (12 adet)
- `endpoints` — CRUD, secret rotation, health check
- `webhooks` — send, batch, replay, delivery list, attempts
- `auth` — register, login, 2FA, password reset, profile, GDPR export
- `apiKeys` — list, create, delete, rotate
- `teams` — CRUD, invite, role management
- `alerts` — CRUD, test
- `analytics` — stats, delivery trends, success rate, latency
- `billing` — subscription, usage, invoices, upgrade, portal
- `health` — system status
- `search` — full-text search
- `notifications` — list, read, preferences, push devices
- `admin` — system status, user management, revenue, audit log

### Model'ler (80+ TypeScript type)
- Tüm OpenAPI spec'ten çıkan request/response type'ları

## Dosya Yapısı
```
sdks/node/src/
├── index.ts           ← Ana entry point (HookSniff class)
├── request.ts         ← HTTP client (retry, backoff, timeout)
├── webhook.ts         ← Webhook signature verification
├── pagination.ts      ← Auto-pagination iterator
├── util.ts            ← Error handling (ApiException)
├── HttpErrors.ts      ← HTTP error models
├── models/index.ts    ← 80+ TypeScript type
└── resources/         ← 12 API resource
    ├── endpoints.ts
    ├── webhooks.ts
    ├── auth.ts
    ├── apiKeys.ts
    ├── teams.ts
    ├── alerts.ts
    ├── analytics.ts
    ├── billing.ts
    ├── health.ts
    ├── search.ts
    ├── notifications.ts
    └── admin.ts
```

## Versiyon
- Eski: 0.4.0
- Yeni: 0.5.0

## Kalite Skoru
- Eski Node.js SDK: ~%55-60 (Stripe'a göre)
- Yeni Node.js SDK: ~%65-70 (Stripe'a göre)
- Artış: +10-15 puan

## Lisans
- MIT (Svix SDK'dan adapte edildi)
- `package.json` ve README'de belirtildi

## Commit
- `c03cfa00` — `feat(node-sdk): rewrite with Svix-based architecture`
- 34 dosya değişti, 1902 ekleme, 3794 silme

## Sonraki Adımlar
1. [ ] npm'de publish et (0.5.0)
2. [ ] Aynı stratejiyi Python, Go, Rust SDK'lara uygula
3. [ ] Test yaz (unit + integration)
4. [ ] CI/CD pipeline kur (GitHub Actions)
