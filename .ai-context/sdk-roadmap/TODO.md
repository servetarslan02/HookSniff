# SDK — Yapılacak İşler (%100 Yol Haritası)

> Son güncelleme: 2026-05-17 22:20 GMT+8
> Hedef: Stripe seviyesinde SDK kalitesi

---

## 📊 İlerleme Tablosu

| Faz | İçerik | Süre | Durum | Sonuç |
|-----|--------|------|-------|-------|
| ✅ | Node.js SDK rewrite | — | Tamamlandı | %70-75 |
| Faz 1 | Core kalite | 6 saat | ⬜ | %85 |
| Faz 2 | Test suite | 4 saat | ⬜ | %90 |
| Faz 3 | CI/CD | 2 saat | ⬜ | %92 |
| Faz 4 | OpenAPI codegen | 3 saat | ⬜ | %95 |
| Faz 5 | Dokümantasyon | 4 saat | ⬜ | %97 |
| Faz 6 | Multi-dil (10 SDK) | 12-16 saat | ⬜ | 11/11 %95+ |
| Faz 7 | Son dokunuşlar | 3 saat | ⬜ | %100 |
| **TOPLAM** | | **34-38 saat** | | **%100** |

---

## 🔴 Faz 1 — Core Kalite (6 saat)

### 1.1 Rate Limit Handling (30 dk)
- [ ] Response header'dan `X-RateLimit-Remaining` ve `Retry-After` oku
- [ ] 429 gelince otomatik bekle + retry
- [ ] Rate limit bilgisini kullanıcıya暴露 et (`rateLimitInfo` property)
- **Dosya:** `src/request.ts`

### 1.2 ESM + CJS Dual Export (30 dk)
- [ ] `tsconfig.esm.json` + `tsconfig.cjs.json` oluştur
- [ ] `package.json` exports alanını güncelle
- [ ] Build script'ini güncelle (`build:esm`, `build:cjs`)
- **Dosya:** `package.json`, `tsconfig.*.json`

### 1.3 Debug Logging (30 dk)
- [ ] `debug: true` seçeneği ekle
- [ ] Her request'te: method, URL, status, duration logla
- [ ] Response body'yi logla (opsiyonel)
- **Dosya:** `src/request.ts`, `src/index.ts`

### 1.4 Error Specificity (30 dk)
- [ ] `RateLimitException` — 429 hataları
- [ ] `NotFoundException` — 404 hataları
- [ ] `ValidationException` — 422 hataları
- [ ] `UnauthorizedException` — 401 hataları
- [ ] `ForbiddenException` — 403 hataları
- [ ] `ServerException` — 5xx hataları
- [ ] `TimeoutException` — timeout hataları
- [ ] `NetworkException` — bağlantı hataları
- **Dosya:** `src/util.ts`

### 1.5 Typed Webhook Events (1 saat)
- [ ] `WebhookEvent<T>` generic tipi oluştur
- [ ] Popüler event type'larını tanımla:
  - `DeliveryCompletedEvent`
  - `DeliveryFailedEvent`
  - `EndpointDisabledEvent`
  - `TeamMemberAddedEvent`
  - `AlertTriggeredEvent`
- [ ] `wh.verify<T>()` generic desteği
- **Dosya:** `src/webhook.ts`, `src/models/events.ts`

### 1.6 JSDoc + Examples (2 saat)
- [ ] Her resource method'una JSDoc ekle
- [ ] Her method için `@example` kod bloğu
- [ ] Parameter açıklamaları
- [ ] Return type açıklamaları
- [ ] Throws açıklamaları
- **Dosya:** `src/resources/*.ts` (12 dosya)

### 1.7 Streaming/SSE Support (1 saat)
- [ ] `EventSource` wrapper oluştur
- [ ] `hs.stream.deliveries()` — real-time delivery events
- [ ] `hs.stream.webhooks()` — real-time webhook events
- [ ] Auto-reconnect on connection drop
- **Dosya:** `src/stream.ts`, `src/resources/stream.ts`

---

## 🟡 Faz 2 — Test Suite (4 saat)

### 2.1 Test Altyapısı (30 dk)
- [ ] Vitest veya Jest kur
- [ ] `vitest.config.ts` oluştur
- [ ] Mock API server (msw veya nock)
- [ ] Coverage config (%95 hedef)
- **Dosya:** `vitest.config.ts`, `src/__tests__/setup.ts`

### 2.2 Request Test (1 saat)
- [ ] Successful GET request
- [ ] Successful POST request (body serialization)
- [ ] Path parameter encoding
- [ ] Query parameter serialization
- [ ] Header parameter setting
- [ ] Retry on 5xx (exponential backoff)
- [ ] No retry on 4xx
- [ ] Timeout (AbortSignal)
- [ ] Custom fetch injection
- [ ] Idempotency key auto-generation
- **Dosya:** `src/__tests__/request.test.ts`

### 2.3 Webhook Test (30 dk)
- [ ] Valid signature verification
- [ ] Invalid signature rejection
- [ ] Expired timestamp rejection (>5 min)
- [ ] Missing header rejection
- [ ] Multiple signatures (v1,sig1 v1,sig2)
- [ ] Both svix-* and webhook-* headers
- [ ] Sign function output
- **Dosya:** `src/__tests__/webhook.test.ts`

### 2.4 Pagination Test (30 dk)
- [ ] Single page (all data in first response)
- [ ] Multi page (3+ pages)
- [ ] Empty result
- [ ] Iterator parameter passing
- [ ] Custom limit
- **Dosya:** `src/__tests__/pagination.test.ts`

### 2.5 Resource Test — Core (1 saat)
- [ ] `endpoints` — list, get, create, update, delete, rotateSecret, health
- [ ] `webhooks` — send, sendBatch, getDelivery, listDeliveries, replay, getAttempts
- [ ] `auth` — register, login, logout, me, forgotPassword, resetPassword
- **Dosya:** `src/__tests__/resources/endpoints.test.ts`, `webhooks.test.ts`, `auth.test.ts`

### 2.6 Resource Test — Extended (30 dk)
- [ ] `teams` — list, get, create, delete, invite, removeMember
- [ ] `alerts` — list, get, create, delete, test
- [ ] `billing` — subscription, usage, invoices, upgrade, portal
- [ ] `analytics` — stats, deliveryTrends, successRate, latency
- **Dosya:** `src/__tests__/resources/teams.test.ts`, `alerts.test.ts`, `billing.test.ts`, `analytics.test.ts`

### 2.7 Resource Test — Other (30 dk)
- [ ] `admin` — systemStatus, listUsers, getUser, revenue, auditLog
- [ ] `search` — query
- [ ] `notifications` — list, unreadCount, markRead, markAllRead
- [ ] `health` — check
- [ ] `apiKeys` — list, create, delete, rotate
- **Dosya:** `src/__tests__/resources/admin.test.ts`, `search.test.ts`, `notifications.test.ts`

---

## 🟡 Faz 3 — CI/CD (2 saat)

### 3.1 SDK CI Workflow (30 dk)
- [ ] `.github/workflows/sdk-ci.yml` oluştur
- [ ] Her push/PR'da build + test
- [ ] Matrix: Node 18, 20, 22
- [ ] Coverage upload (Codecov)
- **Dosya:** `.github/workflows/sdk-ci.yml`

### 3.2 SDK Publish Workflow (30 dk)
- [ ] `.github/workflows/sdk-publish.yml` oluştur
- [ ] Trigger: `v*` tag push
- [ ] Build → Test → Publish (npm)
- [ ] Multi-dil publish (Python, Go, Rust paralel)
- **Dosya:** `.github/workflows/sdk-publish.yml`

### 3.3 Changelog Otomasyonu (30 dk)
- [ ] `conventional-changelog` kur
- [ ] Her tag'de CHANGELOG.md güncelle
- [ ] Breaking change'leri vurgula
- **Dosya:** `CHANGELOG.md`, `scripts/changelog.sh`

### 3.4 npm Publish Otomasyonu (30 dk)
- [ ] `prepublishOnly` script (build + test)
- [ ] `npm publish --access public`
- [ ] GitHub Secret: `NPM_TOKEN`
- **Dosya:** `package.json`

---

## 🟢 Faz 4 — OpenAPI Codegen (3 saat)

### 4.1 TypeScript Type Üretici (1 saat)
- [ ] `scripts/generate-types.ts` oluştur
- [ ] OpenAPI YAML → TypeScript interface
- [ ] Enum'ları union type olarak üret
- [ ] Nested object'leri ayrı interface olarak üret
- **Dosya:** `scripts/generate-types.ts`

### 4.2 Model Üretimi (1 saat)
- [ ] Tüm OpenAPI schema'larını üret
- [ ] `src/models/index.ts`'i otomatik üret
- [ ] Serializer/Deserializer fonksiyonları
- **Dosya:** `src/models/index.ts` (otomatik)

### 4.3 Validation (1 saat)
- [ ] Runtime validation (zod veya valibot)
- [ ] API response validation
- [ ] Request body validation
- **Dosya:** `src/validation.ts`

---

## 🟢 Faz 5 — Dokümantasyon (4 saat)

### 5.1 Site Kurulumu (1 saat)
- [ ] Docusaurus veya Nextra kur
- [ ] `docs/` klasörü oluştur
- [ ] GitHub Pages deploy
- **Dosya:** `docs/`

### 5.2 Quick Start Guide (1 saat)
- [ ] Node.js Quick Start
- [ ] Python Quick Start
- [ ] Go Quick Start
- [ ] Rust Quick Start
- [ ] Her dil için "5 dakikada başla" rehberi
- **Dosya:** `docs/quickstart/*.md`

### 5.3 API Reference (1 saat)
- [ ] OpenAPI spec'ten otomatik doküman üret
- [ ] Her endpoint için code example
- [ ] Authentication rehberi
- **Dosya:** `docs/api/*.md`

### 5.4 Example'lar (1 saat)
- [ ] Webhook gönderme
- [ ] Webhook doğrulama
- [ ] Endpoint yönetimi
- [ ] Pagination kullanımı
- [ ] Error handling
- [ ] Express/Fastify integration
- **Dosya:** `docs/examples/*.md`

---

## 🟢 Faz 6 — Multi-Dil Yayılımı (12-16 saat)

### 6.1 Python SDK (2-3 saat)
- [ ] Svix Python core'dan adapte
- [ ] HookSniff resource'larını oluştur
- [ ] PyPI publish (0.5.0)
- **Referans:** `github.com/svix/svix-webhooks/python/`

### 6.2 Go SDK (2-3 saat)
- [ ] Svix Go core'dan adapte
- [ ] HookSniff resource'larını oluştur
- [ ] Go module publish (v0.5.0)
- **Referans:** `github.com/svix/svix-webhooks/go/`

### 6.3 Rust SDK (2-3 saat)
- [ ] Svix Rust core'dan adapte
- [ ] HookSniff resource'larını oluştur
- [ ] crates.io publish (0.5.0)
- **Referans:** `github.com/svix/svix-webhooks/rust/`

### 6.4 Kalan 7 SDK (6-8 saat)
- [ ] Ruby — `github.com/svix/svix-webhooks/ruby/`
- [ ] Java — `github.com/svix/svix-webhooks/java/`
- [ ] Kotlin — `github.com/svix/svix-webhooks/kotlin/`
- [ ] PHP — `github.com/svix/svix-webhooks/php/`
- [ ] C# — `github.com/svix/svix-webhooks/csharp/`
- [ ] Swift — `github.com/svix/svix-webhooks/swift/`
- [ ] Elixir — `github.com/svix/svix-webhooks/elixir/`

---

## 🟢 Faz 7 — Son Dokunuşlar (3 saat)

### 7.1 Tree-shaking (1 saat)
- [ ] ESM modular import desteği
- [ ] `import { Endpoints } from 'hooksniff-sdk/endpoints'`
- [ ] Side-effect free package.json
- **Dosya:** `package.json`, `tsconfig.esm.json`

### 7.2 Performance Benchmark (30 dk)
- [ ] Request latency ölçümü
- [ ] Svix SDK ile karşılaştırma
- [ ] Stripe SDK ile karşılaştırma
- **Dosya:** `benchmarks/`

### 7.3 Security Audit (30 dk)
- [ ] `npm audit` çalıştır
- [ ] Snyk taraması
- [ ] Dependency vulnerability check
- **Dosya:** `.github/workflows/security.yml`

### 7.4 Migration Guide (30 dk)
- [ ] v0.4 → v0.5 breaking changes
- [ ] Upgrade rehberi
- [ ] Deprecated API'ler
- **Dosya:** `MIGRATION.md`

### 7.5 Interactive Playground (30 dk)
- [ ] Webhook test tool (browser'da)
- [ ] Signature verification playground
- [ ] API explorer
- **Dosya:** `docs/playground/`

---

## 📈 Kalite Metrikleri Takibi

| Metrik | Hedef | Ölçüm Aracı |
|--------|-------|-------------|
| Test coverage | %95+ | Vitest coverage |
| TypeScript strict | 100% | `tsc --strict` |
| Bundle size | <50KB | Bundlephobia |
| npm download | 1000+/ay | npm API |
| GitHub stars | 50+ | GitHub API |
| Issue response | <24 saat | GitHub |
| Documentation | 100% API coverage | Custom script |
