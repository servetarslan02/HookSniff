# 🔍 Altyapı İnceleme

> Kapsam: Root config, GitHub workflows, migrations, i18n, integration tests
> Tarih: 2026-05-10

---

## 🔴 Kritik

| # | Sorun | Dosya |
|---|-------|-------|
| 1 | Dual migration systems çelişki (`migrations/` + `api/migrations/` farklı schema) | `migrations/`, `api/migrations/` |
| 2 | `webhook_queue` tablosu tanımsız (3 migration refere ediyor ama oluşturma yok) | `migrations/010`, `011`, `012` |
| 3 | Migration gap 013-025 (13 eksik) | `migrations/` dizini |
| 4 | docker-compose.yml'de hardcoded JWT_SECRET, HMAC_SECRET, POSTGRES_PASSWORD | `docker-compose.yml` |

## 🟠 Yüksek

| # | Sorun | Dosya |
|---|-------|-------|
| 1 | Polar product ID'leri render.yaml'da exposed | `render.yaml` |
| 2 | Production log level debug | `render.yaml` |
| 3 | 6/8 i18n dil <%40 çevrilmiş (de, ja, pt-BR, es, fr, ko) | `dashboard/src/messages/*.json` |
| 4 | Landing page free tier 1,000 yazıyor ama gerçek 10,000 | i18n JSON'ları |
| 5 | npm audit failure `continue-on-error: true` | `.github/workflows/ci.yml` |
| 6 | Production deploy'da manual approval yok | `.github/workflows/deploy.yml` |

## 🟡 Orta

| # | Sorun | Dosya |
|---|-------|-------|
| 1 | CORS duplicate | `render.yaml` |
| 2 | CockroachDB syntax (STRING) PostgreSQL ile tutarsız | `migrations/001_initial.sql` |
| 3 | OpenAPI'da POST /endpoints 200 → 201 olmalı | `docs/openapi.yaml` |
| 4 | OpenAPI'da per_page maximum constraint yok | `docs/openapi.yaml` |
| 5 | RegisterRequest'ta password optional | `docs/openapi.yaml` |
| 6 | `npm audit` failure handling eksik | `.github/workflows/ci.yml` |
| 7 | Docker image `latest` tag — rollback zor | `cloudbuild.yaml` |
| 8 | Image vulnerability scanning yok | `cloudbuild.yaml` |
| 9 | i18n'de Türkçe/Korean karışımı (`q4`) | `messages/tr.json`, `messages/ja.json` | ✅ Düzeltildi (2026-05-10) |
| 10 | `common.previous` tüm dillerde İngilizce | `messages/*.json` | ✅ Düzeltildi (2026-05-10) |
| 11 | Duplicate key patterns (`billing.plans.free` vs `billing["plans.free"]`) | i18n JSON'ları |

## Migrations — Dosya Bazlı

### Dual Migration Conflict
`migrations/001_initial.sql` ve `api/migrations/001_initial_schema.sql` aynı tabloları farklı tanımlıyor:
- `api/migrations/`'da `delivery_attempts`, `idempotency_keys`, `password_hash` var — diğerinde yok
- `migrations/`'da `webhook_limit` 1000 — `api/migrations/`'da da 1000 ama migration 029 bunu 10000 yapıyor

### Migration 002 — HookRelay Artığı
- `signature_header` default: `X-HookRelay-Signature` → `X-HookSniff-Signature` olmalı

### Migration 033 — TOTP Güvenlik
- `totp_secret` plain TEXT olarak saklanıyor — şifrelenmeli
- Backup codes yok — cihaz kaybedilirse hesap kilitli

## 🟢 Güçlü Yönler

- ✅ 80KB kapsamlı OpenAPI spec
- ✅ CI/CD pipeline'da security audit (Rust + Node)
- ✅ PostgreSQL service container + health checks (CI)
- ✅ Cache configured (Cargo + npm)
- ✅ Concurrency control (`cancel-in-progress: true`)
- ✅ Release workflow: GHCR + semantic versioning + buildx cache
- ✅ Integration test: full auth flow + error cases + cleanup
- ✅ Load test: k6 smoke/load/stress/throughput
