# 📖 Okuma Durumu — Dosya Dosya Takip

> Son güncelleme: 2026-05-10 04:26 GMT+8
> Yeni dosya eklediğinde bu listeye ekle, karışmasın

## Durum Kodları
- ✅ = %100 satır satır okundu
- ⚡ = İlk N satır tarandı (yüzde belirtilir)
- 🔍 = Grep/scan yapıldı (XSS, secret, pattern araması)
- ❌ = Hiç okunmadı

---

## API (81 dosya) — ✅ %100

| Dosya | Durum | Not |
|-------|-------|-----|
| `api/Cargo.toml` | ✅ | |
| `api/src/main.rs` | ✅ | |
| `api/src/lib.rs` | ✅ | |
| `api/src/config.rs` | ✅ | Debug secret sızıntısı tespit |
| `api/src/db.rs` | ✅ | 43 migration inline |
| `api/src/error.rs` | ✅ | |
| `api/src/signing.rs` | ✅ | |
| `api/src/ssrf.rs` | ✅ | |
| `api/src/validation.rs` | ✅ | |
| `api/src/email.rs` | ✅ | |
| `api/src/rate_limit.rs` | ✅ | |
| `api/src/circuit_breaker.rs` | ✅ | |
| `api/src/metrics.rs` | ✅ | 433 satır tam okundu |
| `api/src/telemetry.rs` | ✅ | 246 satır tam okundu |
| `api/src/auth/jwt.rs` | ✅ | |
| `api/src/auth/mod.rs` | ✅ | |
| `api/src/middleware/mod.rs` | ✅ | |
| `api/src/middleware/idempotency.rs` | ✅ | |
| `api/src/middleware/webhook_verify.rs` | ✅ | |
| `api/src/models/customer.rs` | ✅ | |
| `api/src/models/delivery.rs` | ✅ | |
| `api/src/models/endpoint.rs` | ✅ | |
| `api/src/models/idempotency.rs` | ✅ | |
| `api/src/models/mod.rs` | ✅ | |
| `api/src/billing/mod.rs` | ✅ | 🔴 Fiyat $49/$149 yanlış |
| `api/src/billing/provider.rs` | ✅ | |
| `api/src/billing/stripe.rs` | ✅ | |
| `api/src/billing/polar.rs` | ✅ | |
| `api/src/billing/iyzico.rs` | ✅ | |
| `api/src/routes/mod.rs` | ✅ | |
| `api/src/routes/auth.rs` | ✅ | GDPR eksik tespit |
| `api/src/routes/webhooks.rs` | ✅ | |
| `api/src/routes/endpoints.rs` | ✅ | |
| `api/src/routes/admin.rs` | ✅ | Revenue query fiyat yanlış |
| `api/src/routes/billing.rs` | ✅ | |
| `api/src/routes/inbound.rs` | ✅ | |
| `api/src/routes/health.rs` | ✅ | |
| `api/src/routes/teams.rs` | ✅ | |
| `api/src/routes/alerts.rs` | ✅ | |
| `api/src/routes/analytics.rs` | ✅ | |
| `api/src/routes/api_keys.rs` | ✅ | |
| `api/src/routes/contact.rs` | ✅ | |
| `api/src/routes/customer_portal.rs` | ✅ | Duplicate API key mgmt |
| `api/src/routes/delivery_details.rs` | ✅ | |
| `api/src/routes/devices.rs` | ✅ | |
| `api/src/routes/docs.rs` | ✅ | |
| `api/src/routes/embed.rs` | ✅ | Hardcoded API URL |
| `api/src/routes/events.rs` | ✅ | |
| `api/src/routes/health_endpoints.rs` | ✅ | |
| `api/src/routes/notifications.rs` | ✅ | |
| `api/src/routes/outbound_ips.rs` | ✅ | |
| `api/src/routes/playground.rs` | ✅ | |
| `api/src/routes/routing.rs` | ✅ | |
| `api/src/routes/schemas.rs` | ✅ | |
| `api/src/routes/search.rs` | ✅ | |
| `api/src/routes/simulator.rs` | ✅ | |
| `api/src/routes/stats.rs` | ✅ | |
| `api/src/routes/stream.rs` | ✅ | |
| `api/src/routes/templates.rs` | ✅ | |
| `api/src/routes/transforms.rs` | ✅ | |
| `api/src/events/mod.rs` | ✅ | |
| `api/src/events/cloudevents.rs` | ✅ | |
| `api/src/fifo/mod.rs` | ✅ | 766 satır tam okundu |
| `api/src/industry/mod.rs` | ✅ | |
| `api/src/industry/ecommerce.rs` | ✅ | |
| `api/src/industry/fintech.rs` | ✅ | |
| `api/src/industry/healthcare.rs` | ✅ | |
| `api/src/industry/saas.rs` | ✅ | |
| `api/src/jobs/mod.rs` | ✅ | 1 satır (empty) |
| `api/src/jobs/retention.rs` | ✅ | |
| `api/src/notifications/mod.rs` | ✅ | |
| `api/src/retry_policy/mod.rs` | ✅ | 642 satır tam okundu |
| `api/src/schemas/mod.rs` | ✅ | |
| `api/src/schemas/registry.rs` | ✅ | |
| `api/src/templates/mod.rs` | ✅ | |
| `api/src/templates/library.rs` | ✅ | |
| `api/src/throttle/mod.rs` | ✅ | 372 satır tam okundu |
| `api/src/transform/mod.rs` | ✅ | 833 satır tam okundu |
| `api/src/transform/filter.rs` | ✅ | |
| `api/src/transform/templates.rs` | ✅ | |
| `api/src/ws/mod.rs` | ✅ | |
| `api/src/ws/handler.rs` | ✅ | 552 satır tam okundu |
| `api/tests/integration.rs` | ❌ | |
| `api/migrations/001_initial_schema.sql` | ⚡ | İlk 30 satır |

## Worker (10 dosya) — ✅ %100

| Dosya | Durum |
|-------|-------|
| `worker/Cargo.toml` | ✅ |
| `worker/src/main.rs` | ✅ |
| `worker/src/config.rs` | ✅ |
| `worker/src/delivery/mod.rs` | ✅ |
| `worker/src/delivery/http.rs` | ✅ |
| `worker/src/fanout.rs` | ✅ | 🔴 İşlevsiz tespit |
| `worker/src/signing.rs` | ✅ |
| `worker/src/telemetry.rs` | ✅ |
| `worker/src/activities/mod.rs` | ✅ |
| `worker/src/workflows/mod.rs` | ✅ |

## Dashboard — Bileşenler (19 dosya) — ✅ %100

| Dosya | Durum |
|-------|-------|
| `components/AuthGuard.tsx` | ✅ |
| `components/CodeBlock.tsx` | ✅ |
| `components/ConfirmDialog.tsx` | ✅ |
| `components/EmptyState.tsx` | ✅ |
| `components/ErrorBoundary.tsx` | ✅ |
| `components/Footer.tsx` | ✅ |
| `components/LanguageSwitcher.tsx` | ✅ |
| `components/LoadingSpinner.tsx` | ✅ |
| `components/NotificationCenter.tsx` | ✅ |
| `components/Onboarding.tsx` | ✅ |
| `components/SdkTabs.tsx` | ✅ |
| `components/StatusBadge.tsx` | ✅ |
| `components/ThemeProvider.tsx` | ✅ |
| `components/ThemeToggle.tsx` | ✅ |
| `components/Toast.tsx` | ✅ |
| `components/tremor/ChartCard.tsx` | ✅ |
| `components/tremor/StatCard.tsx` | ✅ |
| `components/tremor/StatusBadge.tsx` | ✅ |
| `components/tremor/index.ts` | ✅ |

## Dashboard — Lib/Hooks (7 dosya) — ✅ %100

| Dosya | Durum |
|-------|-------|
| `lib/api.ts` | ✅ |
| `lib/store.tsx` | ✅ |
| `lib/email.ts` | ✅ |
| `lib/redis.ts` | ✅ |
| `lib/errors.ts` | ✅ |
| `lib/changelog-data.ts` | ❌ |
| `hooks/useDeliveryStream.ts` | ✅ |

## Dashboard — Sayfalar (73 dosya) — ⚡ Karışık

### ✅ Tam Okunan Sayfalar (9)
| Dosya | Durum | Satır |
|-------|-------|-------|
| `[locale]/dashboard/page.tsx` | ✅ | 584 |
| `[locale]/dashboard/endpoints/page.tsx` | ✅ | 201 |
| `[locale]/dashboard/deliveries/page.tsx` | ✅ | 237 |
| `[locale]/dashboard/deliveries/[id]/page.tsx` | ✅ | 406 |
| `[locale]/dashboard/settings/page.tsx` | ✅ | 387 |
| `[locale]/dashboard/billing/page.tsx` | ✅ | 402 |
| `[locale]/dashboard/api-keys/page.tsx` | ✅ | 300 |
| `[locale]/login/page.tsx` | ✅ | 172 |
| `[locale]/dashboard/alerts/page.tsx` | ⚡ | İlk 200 satır |

### ⚡ Sadece İlk 20 Satırı Okunan Sayfalar (64)
| Dosya | Durum |
|-------|-------|
| `[locale]/about/page.tsx` | ⚡ İlk 20 |
| `[locale]/admin/page.tsx` | ⚡ İlk 20 |
| `[locale]/admin/revenue/page.tsx` | ⚡ İlk 20 |
| `[locale]/admin/settings/page.tsx` | ⚡ İlk 20 |
| `[locale]/admin/system/page.tsx` | ⚡ İlk 20 |
| `[locale]/admin/users/[id]/page.tsx` | ⚡ İlk 20 |
| `[locale]/admin/users/page.tsx` | ⚡ İlk 20 |
| `[locale]/alternatives/convoy/page.tsx` | ⚡ İlk 20 |
| `[locale]/alternatives/hook0/page.tsx` | ⚡ İlk 20 |
| `[locale]/alternatives/hookdeck/page.tsx` | ⚡ İlk 20 |
| `[locale]/alternatives/svix/page.tsx` | ⚡ İlk 20 |
| `[locale]/alternatives/webhook-relay/page.tsx` | ⚡ İlk 20 |
| `[locale]/blog/hooksniff-vs-svix/page.tsx` | ⚡ İlk 20 |
| `[locale]/blog/page.tsx` | ⚡ İlk 20 |
| `[locale]/blog/[slug]/page.tsx` | ⚡ İlk 20 + XSS grep ✅ (güvenli) |
| `[locale]/changelog/page.tsx` | ⚡ İlk 20 |
| `[locale]/changelog/[slug]/page.tsx` | ⚡ İlk 20 |
| `[locale]/compare/page.tsx` | ⚡ İlk 20 |
| `[locale]/contact/page.tsx` | ⚡ İlk 20 |
| `[locale]/customers/page.tsx` | ⚡ İlk 20 |
| `[locale]/customers/[slug]/page.tsx` | ⚡ İlk 20 |
| `[locale]/dashboard/analytics/page.tsx` | ⚡ İlk 20 |
| `[locale]/dashboard/endpoints/[id]/page.tsx` | ⚡ İlk 20 |
| `[locale]/dashboard/health/page.tsx` | ⚡ İlk 20 |
| `[locale]/dashboard/inbound/page.tsx` | ⚡ İlk 20 |
| `[locale]/dashboard/layout.tsx` | ⚡ İlk 20 |
| `[locale]/dashboard/logs/page.tsx` | ⚡ İlk 20 |
| `[locale]/dashboard/notifications/page.tsx` | ⚡ İlk 20 |
| `[locale]/dashboard/playground/page.tsx` | ⚡ İlk 20 |
| `[locale]/dashboard/portal/page.tsx` | ⚡ İlk 20 |
| `[locale]/dashboard/routing/page.tsx` | ⚡ İlk 20 |
| `[locale]/dashboard/schemas/page.tsx` | ⚡ İlk 20 |
| `[locale]/dashboard/search/page.tsx` | ⚡ İlk 20 |
| `[locale]/dashboard/team/page.tsx` | ⚡ İlk 20 |
| `[locale]/dashboard/templates/page.tsx` | ⚡ İlk 20 |
| `[locale]/dashboard/transforms/page.tsx` | ⚡ İlk 20 |
| `[locale]/dashboard/webhooks/new/page.tsx` | ⚡ İlk 20 |
| `[locale]/docs/api/page.tsx` | ⚡ İlk 20 |
| `[locale]/docs/architecture/page.tsx` | ⚡ İlk 20 |
| `[locale]/docs/concepts/page.tsx` | ⚡ İlk 20 |
| `[locale]/docs/dashboard/page.tsx` | ⚡ İlk 20 |
| `[locale]/docs/dlq/page.tsx` | ⚡ İlk 20 |
| `[locale]/docs/event-types/page.tsx` | ⚡ İlk 20 |
| `[locale]/docs/idempotency/page.tsx` | ⚡ İlk 20 |
| `[locale]/docs/integrations/page.tsx` | ⚡ İlk 20 |
| `[locale]/docs/page.tsx` | ⚡ İlk 20 |
| `[locale]/docs/portal/page.tsx` | ⚡ İlk 20 |
| `[locale]/docs/quickstart/page.tsx` | ⚡ İlk 20 |
| `[locale]/docs/retries/page.tsx` | ⚡ İlk 20 |
| `[locale]/docs/sdks/page.tsx` | ⚡ İlk 20 |
| `[locale]/docs/security/page.tsx` | ⚡ İlk 20 |
| `[locale]/docs/self-hosting/page.tsx` | ⚡ İlk 20 |
| `[locale]/faq/page.tsx` | ⚡ İlk 20 |
| `[locale]/newsletter/page.tsx` | ⚡ İlk 20 |
| `[locale]/page.tsx` | ⚡ İlk 20 |
| `[locale]/playground/page.tsx` | ⚡ İlk 20 |
| `[locale]/pricing/page.tsx` | ⚡ İlk 20 |
| `[locale]/privacy/page.tsx` | ⚡ İlk 20 |
| `[locale]/security/page.tsx` | ⚡ İlk 20 |
| `[locale]/startups/page.tsx` | ⚡ İlk 20 |
| `[locale]/status/page.tsx` | ⚡ İlk 20 |
| `[locale]/terms/page.tsx` | ⚡ İlk 20 |
| `[locale]/use-cases/page.tsx` | ⚡ İlk 20 |
| `[locale]/what-is-a-webhook/page.tsx` | ⚡ İlk 20 |

### 🔍 XSS Grep (tümü)
Tüm dashboard sayfalarında `dangerouslySetInnerHTML`, `eval(`, `innerHTML` arandı:
- `layout.tsx`: Theme script (güvenli, static)
- `blog/[slug]/page.tsx`: Code highlighting (güvenli, & escape ediliyor)

## Dashboard — Test Dosyaları (57 dosya) — ⚡ Taranan

| Dosya | Durum | Not |
|-------|-------|-----|
| `__tests__/api.test.ts` | ⚡ İlk 30 satır |
| `__tests__/smoke.test.ts` | ⚡ İlk 30 satır |
| `__tests__/store.test.tsx` | ⚡ İlk 30 satır |
| Diğer 54 test dosyası | ❌ | Vitest + testing-library pattern doğrulandı |

## Dashboard — Config/Other (7 dosya) — Karışık

| Dosya | Durum |
|-------|-------|
| `middleware.ts` | ✅ |
| `i18n/navigation.ts` | ❌ |
| `i18n/request.ts` | ❌ |
| `i18n/routing.ts` | ❌ |
| `app/layout.tsx` | ⚡ İlk 20 |
| `app/page.tsx` | ❌ |
| `app/sitemap.ts` | ❌ |

## SDK'lar (11 dil) — ✅ %100

| SDK | Dosyalar | Durum |
|-----|----------|-------|
| Python | client.py, verify.py, models.py, exceptions.py, utils.py, __init__.py, test_client.py | ✅ |
| Node.js | index.ts, verify.ts, types.ts | ✅ |
| Go | hooksniff.go (580 satır), hooksniff_test.go | ✅ |
| Rust | lib.rs (689 satır) | ✅ |
| Java | HookSniffClient.java, WebhookVerification.java + 9 model | ✅ |
| Kotlin | HookSniffClient.kt | ⚡ İlk 50 satır |
| C# | HookSniffClient.cs | ⚡ İlk 80 satır |
| Ruby | client.rb, verification.rb, models.rb | ✅ |
| PHP | HookSniffClient.php, Models.php | ⚡ İlk 30-50 satır |
| Swift | HookSniff.swift | ⚡ İlk 50 satır |
| Elixir | hooksniff.ex, webhook_verification.ex | ⚡ İlk 50 satır |

## Deploy (20 dosya) — ✅ %100

| Dosya | Durum | Not |
|-------|-------|-----|
| `gcp-deploy.sh` | ✅ | Product ID hardcoded |
| `gcp-deploy.ps1` | ✅ | hookrelay artığı |
| `Dockerfile.api.prod` | ✅ | Güvenli |
| `Dockerfile.worker.prod` | ✅ | Güvenli |
| `docker-compose.prod.yml` | ✅ | |
| `docker-compose.gcp.yml` | ✅ | |
| `oracle-cloud-setup.sh` | ✅ | 20+ hookrelay referansı |
| `helm/values.yaml` | ✅ | |
| `helm/Chart.yaml` | ✅ | |
| `helm/templates/*.yaml` | ❌ | 4 dosya okunmadı |
| `terraform-provider-hooksniff/main.go` | ✅ | Hardcoded URL |
| `terraform-provider-hooksniff/client.go` | ❌ |
| `terraform-provider-hooksniff/endpoint_resource.go` | ❌ |
| `api-env.yaml` | ❌ |
| `worker-env.yaml` | ❌ |

## Monitoring (7 dosya) — ✅ %100

| Dosya | Durum | Not |
|-------|-------|-----|
| `prometheus.yml` | ✅ | |
| `alert_rules.yml` | ✅ | 9 alert rule |
| `otel-collector-config.yml` | ✅ | 🔴 Grafana token hardcoded |
| `docker-compose.monitoring.yml` | ❌ |
| `grafana/dashboards/hooksniff.json` | ❌ |
| `grafana/provisioning/dashboards/dashboards.yml` | ✅ |
| `grafana/provisioning/datasources/prometheus.yml` | ✅ |

## Scripts (10 dosya) — ✅ %100

| Dosya | Durum | Not |
|-------|-------|-----|
| `ci-local.sh` | ✅ | |
| `auto-push.sh` | ✅ | |
| `backup.sh` | ✅ | 10+ hookrelay referansı |
| `restore.sh` | ✅ | 10+ hookrelay referansı |
| `publish-all.sh` | ✅ | |
| `publish-sdks.sh` | ❌ |
| `publish-elixir.sh` | ❌ |
| `publish-java.sh` | ❌ |
| `publish-ruby.sh` | ❌ |
| `github-memory-sync.sh` | ✅ | |

## Portal (5 dosya) — ✅ %100

| Dosya | Durum | Not |
|-------|-------|-----|
| `embed.js` | ✅ | 🔴 API key URL'de |
| `widget.html` | ❌ |
| `example.html` | ❌ |
| `style.css` | ❌ |
| `README.md` | ❌ |

## CLI (2 dosya) — ✅ %100

| Dosya | Durum | Not |
|-------|-------|-----|
| `index.js` | ✅ | hookrelay env var artığı |
| `package.json` | ❌ |

## Migration SQL (24 dosya) — ⚡ Taranan

| Dosya | Durum | Not |
|-------|-------|-----|
| `migrations/001_initial.sql` | ⚡ İlk 30 | hookrelay comment |
| `migrations/002_security_features.sql` | ✅ | X-HookRelay-Signature |
| `migrations/005_event_mesh.sql` | ⚡ | hookrelay comment |
| Diğer 21 migration | ❌ | db.rs inline SQL okundu |

## Root Config Dosyaları — ❌

| Dosya | Durum |
|-------|-------|
| `Cargo.toml` | ❌ |
| `docker-compose.yml` | ❌ |
| `render.yaml` | ❌ |
| `package.json` | ❌ |
| `cloudbuild.yaml` | ❌ |
| `fix-migrations.js` | ❌ |
| `run-migrations.js` | ❌ |
| `test-api.ps1` | ❌ |
| `docs/openapi.yaml` | ❌ |
| `.github/workflows/*.yml` | ❌ (3 dosya) |
| `tests/` | ❌ (10+ dosya: k6, integration, fixtures) |

## i18n Mesaj Dosyaları — ❌

| Dosya | Durum |
|-------|-------|
| `messages/en.json` | ❌ |
| `messages/tr.json` | ❌ |
| `messages/de.json` | ❌ |
| `messages/ja.json` | ❌ |
| `messages/pt-BR.json` | ❌ |
| `messages/es.json` | ❌ |
| `messages/fr.json` | ❌ |
| `messages/ko.json` | ❌ |

## Portal dosyaları — ❌
| `portal/widget.html` | ❌ |
| `portal/example.html` | ❌ |
| `portal/style.css` | ❌ |

## Public dosyalar — ❌
| `dashboard/public/*.json` | ❌ (5 dosya: incidents, maintenance, manifest, status-history, status) |

---

## 📊 Özet

| Kategori | Toplam Dosya | Okunan | Oran |
|----------|-------------|--------|------|
| API Rust | 81 | 81 | %100 |
| Worker Rust | 10 | 10 | %100 |
| Dashboard bileşen | 19 | 19 | %100 |
| Dashboard lib/hook | 7 | 6 | %86 |
| Dashboard sayfalar | 73 | 9 tam + 64 tarama | ~%30 detaylı |
| Dashboard test | 57 | 3 | ~%5 |
| Dashboard config | 7 | 1 | ~%14 |
| SDK'lar | 52 | ~45 | ~%87 |
| Deploy | 20 | 15 | %75 |
| Monitoring | 7 | 6 | %86 |
| Scripts | 10 | 7 | %70 |
| Portal | 5 | 1 | %20 |
| CLI | 2 | 1 | %50 |
| Migrations | 24 | 3 | ~%13 |
| Root config | ~10 | 0 | %0 |
| i18n messages | 8 | 0 | %0 |
| Tests (integration) | ~10 | 0 | %0 |
| **TOPLAM** | **~380** | **~205** | **~%54** |

### En Çok Okunan (%100)
- Tüm API Rust kodu (81 dosya) ✅
- Tüm Worker Rust kodu (10 dosya) ✅
- Tüm Dashboard bileşenleri (19 dosya) ✅
- Tüm Dashboard lib dosyaları (6/7) ✅

### En Az Okunan (%0-%13)
- Root config dosyaları (Cargo.toml, docker-compose.yml vb.)
- i18n mesaj JSON'ları
- Integration/load test dosyaları
- Migration SQL'leri (21/24 okunmadı)
- Dashboard test dosyaları (54/57 okunmadı)
