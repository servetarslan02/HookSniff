# SDK — Yapılan İşler

> Son güncelleme: 2026-05-17 22:06 GMT+8

---

## 2026-05-17 — Node.js SDK Svix Tabanlı Yeniden Yazım

### Ne yapıldı?
- Eski OpenAPI Generator 7.22.0 boilerplate kaldırıldı
- el yapımı el yapımı SDK oluşturuldu
- `sdks/node/` tamamen yeniden yazıldı

### Eklenen özellikler
1. ✅ **Retry + Exponential Backoff** — 5xx hatalarında otomatik retry (varsayılan 2 deneme)
2. ✅ **Auto-Idempotency Key** — POST isteklerine otomatik `idempotency-key` header
3. ✅ **Auto-Pagination** — `for await (const item of hs.resource.listAll())` desteği
4. ✅ **Webhook Doğrulama** — HMAC-SHA256, Standard Webhooks, timing-safe comparison
5. ✅ **Custom Fetch** — Test veya proxy ortamları için `fetch` injection
6. ✅ **Timeout Desteği** — `AbortSignal.timeout()` ile istek timeout
7. ✅ **Zero Dependencies** — Sadece native `fetch` (Node 18+)

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

### Model'ler
- 80+ TypeScript type (OpenAPI spec'ten)

### Dosya yapısı
```
sdks/node/src/
├── index.ts           ← HookSniff class
├── request.ts         ← HTTP client
├── webhook.ts         ← Signature verification
├── pagination.ts      ← Auto-pagination
├── util.ts            ← Error handling
├── HttpErrors.ts      ← HTTP error models
├── models/index.ts    ← 80+ types
└── resources/         ← 12 resource
```

### Versiyon değişikliği
- 0.4.0 → **0.5.0**

### Kalite artışı
- Eski: %55-60 → Yeni: **%70-75** (Stripe'a göre)

### Commit
- `c03cfa00` — `feat(node-sdk): rewrite with Svix-based architecture`
- 34 dosya değişti, 1902 ekleme, 3794 silme

---

## 2026-05-11 — İlk SDK Yayınları (11 dil)

### Ne yapıldı?
- OpenAPI spec'ten 11 dilde SDK üretildi (OpenAPI Generator 7.22.0)
- Tüm SDK'lar registry'lere publish edildi

### Registry'ler
| SDK | Registry | Versiyon |
|-----|----------|----------|
| Node.js | npm | 0.3.0 |
| Python | PyPI | 0.3.0 |
| Go | proxy.golang.org | v0.3.0 |
| Rust | crates.io | 0.4.0 |
| Ruby | RubyGems | 0.3.0 |
| Java | Maven Central | 0.1.0, 0.2.0, 0.3.0 |
| Kotlin | Maven Central | 0.3.0 |
| PHP | Packagist | 0.1.0 |
| C# | NuGet | 0.4.0 |
| Elixir | Hex.pm | 1.0.0 |
| Swift | GitHub | 0.3.0 |

### Sorunlar
- Versiyon tutarsızlığı (0.1.0 — 1.0.0 arası)
- OpenAPI auto-gen kalitesi düşük (~%20-25)
- Publish script eski (Node.js yapısını bozuyor)
