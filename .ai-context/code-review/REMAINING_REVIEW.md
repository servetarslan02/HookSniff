# HookSniff Code Review — Remaining Files (SDKs, Deploy, Monitoring, Scripts, Portal, CLI)

**Date:** 2026-05-10
**Scope:** SDKs (7 files), Deploy (6+ files), Monitoring (4 files), Scripts (4 files), Portal (4 files), CLI (1 file)
**Severity Scale:** 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low | ⚪ Info

---

## Executive Summary

The codebase is well-structured with consistent API patterns across SDKs. However, there are **2 critical security issues** (hardcoded credentials in publish scripts, hardcoded Grafana password), several high-severity concerns around secret management in Helm charts, and a notable "HookRelay" naming remnant in portal CSS. The Terraform provider is a non-functional stub.

---

## 1. SDKs

### 1.1 sdks/kotlin/src/main/kotlin/com/hooksniff/HookSniffClient.kt

**Quality: Good** — Clean Kotlin with Gson, OkHttp, proper exception hierarchy.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🔵 Low | `SearchResource` is instantiated (`val search = SearchResource()`) but never wired into the client API surface like `endpoints()` and `webhooks()`. Inconsistent access pattern. |
| 2 | 🔵 Low | `export()` returns `Any` — untyped return loses type safety. Consider returning `String` for CSV or `List<Delivery>` for JSON. |
| 3 | ⚪ Info | `TypeToken<T>() {}.type` in `request()` — the reified type trick works at runtime but will always deserialize as raw `LinkedTreeMap` for generic types due to erasure. Works only because Gson handles the top-level type. |
| 4 | ⚪ Info | Hardcoded `DEFAULT_BASE_URL` with GCP Cloud Run URL is fine for SDK defaults, but should be documented as the production endpoint. |
| 5 | ⚪ Info | WebhookVerifier uses `MessageDigest.isEqual()` for constant-time comparison — correct approach for Kotlin/JVM. |

### 1.2 sdks/csharp/HookSniffClient.cs

**Quality: Good** — Clean C# with System.Text.Json, proper async/await, IDisposable.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🟡 Medium | `HookSniffConfig.ApiKey` defaults to `""` (empty string) — constructor allows creating a client with empty API key. Should throw `ArgumentNullException` like it does for null. |
| 2 | 🔵 Low | `SendRequestAsync` creates `new HttpMethod(method)` from raw string — no validation. Passing invalid method string will produce confusing errors. |
| 3 | 🔵 Low | `SearchAsync` returns `object` — completely untyped. Consumers must deserialize manually. |
| 4 | ⚪ Info | `EndpointList` model exists (unlike Kotlin which reuses `List<Endpoint>`) — good, matches API response shape. |

### 1.3 sdks/csharp/WebhookVerification.cs

**Quality: Excellent** — Uses `CryptographicOperations.FixedTimeEquals` for constant-time comparison. Proper HMAC-SHA256 with Standard Webhooks support.

| # | Severity | Finding |
|---|----------|---------|
| 1 | ⚪ Info | Well-implemented. `DecodeSecret` handles both base64 and raw secret formats with graceful fallback. |

### 1.4 sdks/php/src/HookSniffClient.php

**Quality: Good** — Clean PHP 8.1+ with readonly properties, match expressions, cURL.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🟡 Medium | `request()` uses `curl_close($ch)` — deprecated pattern. In PHP 8.0+, CurlHandle objects are automatically closed. Not harmful but outdated. |
| 2 | 🔵 Low | `search()` method exists on `WebhooksResource` but is not documented in the class docblock. |
| 3 | 🔵 Low | `export()` when `format !== 'csv'` tries to `array_map` the response as deliveries, but the API might return a different structure. |
| 4 | ⚪ Info | Good use of `declare(strict_types=1)` throughout. |

### 1.5 sdks/php/src/Models.php

**Quality: Excellent** — Clean PHP 8.1+ readonly promoted properties, proper `fromArray`/`toArray` pattern.

| # | Severity | Finding |
|---|----------|---------|
| 1 | ⚪ Info | `Stats` class doesn't have `toArray()` — inconsistent with other models. Not critical since stats are read-only. |

### 1.6 sdks/swift/Sources/HookSniff/HookSniff.swift

**Quality: Good** — Proper Swift async/await, Sendable conformance, Codable models.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🟡 Medium | `HookSniff` class is `@unchecked Sendable` — bypasses Swift's strict concurrency checking. The class holds mutable state (`session`, `decoder`, `encoder`) that could cause data races. Should use proper synchronization or make resources `Sendable`. |
| 2 | 🔵 Low | `request()` force-casts `response as! HTTPURLResponse` — will crash if response is not HTTP. Should use `guard let`. |
| 3 | 🔵 Low | `requestData()` duplicates most of `request()` logic — DRY violation. `request()` should call `requestData()` and then decode. |
| 4 | 🔵 Low | `SearchResource` is defined but not exposed as a public property on `HookSniff`. Users can't access it. |
| 5 | ⚪ Info | `constantTimeCompare` uses XOR-based comparison — correct implementation. |

### 1.7 sdks/elixir/lib/hooksniff.ex

**Quality: Good** — Clean Elixir with proper error handling, `:httpc` usage.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🟡 Medium | Uses `:httpc` (Erlang stdlib) instead of more robust HTTP clients like `Req` or `Tesla`. `:httpc` has limited features (no connection pooling, no automatic retries). |
| 2 | 🔵 Low | `method_charlist/1` only handles `:get`, `:post`, `:put`, `:delete` — missing `:patch`. If the API uses PATCH, this will crash with `FunctionClauseError`. |
| 3 | 🔵 Low | No `SearchResource` module defined — search functionality missing from Elixir SDK. |
| 4 | ⚪ Info | SSL verification enabled (`ssl: [verify: :verify_peer]`) — good security practice. |

### 1.8 sdks/elixir/lib/hooksniff/webhook_verification.ex

**Quality: Excellent** — Uses `Plug.Crypto.secure_compare` for constant-time comparison. Proper Standard Webhooks + Svix header support.

| # | Severity | Finding |
|---|----------|---------|
| 1 | ⚪ Info | `decode_secret` adds `"=="` padding unconditionally — the `Base.decode64` will still work with extra padding, but `"==="` would be more correct for 3-modulo cases. Minor. |

---

## 2. Deploy

### 2.1 deploy/helm/hooksniff/templates/deployments.yaml

**Quality: Good** — Standard Kubernetes Deployment templates.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🟠 High | `DATABASE_URL` is constructed inline: `postgresql://hooksniff:{{ .Values.postgresql.auth.postgresPassword }}@...` — the database password is baked into the environment variable as a plain string. If anyone runs `kubectl describe pod`, the password is visible. Should use a Secret reference. |
| 2 | 🟡 Medium | `REDIS_URL` has no authentication: `redis://{{ .Release.Name }}-redis:6379` — no password even though Redis auth is disabled in values.yaml. Fine for internal cluster, but risky if Redis is exposed. |
| 3 | 🔵 Low | API and Worker deployments share the same `replicaCount` — should be independently configurable (workers may need more replicas than API). |

### 2.2 deploy/helm/hooksniff/templates/services.yaml

**Quality: Good** — Clean service definitions.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🟠 High | **Secrets in plain text in services.yaml**: The `Secret` resource at the bottom encodes `JWT_SECRET` and `HMAC_SECRET` from `.Values.env.JWT_SECRET` and `.Values.env.HMAC_SECRET`. Since these come from `values.yaml` defaults (`"change-me-in-production"`), they're visible in the Helm chart source. Should use `--set` or external secret management. |
| 2 | 🔵 Low | Postgres and Redis services are ClusterIP — correct for internal access. No issues. |

### 2.3 deploy/helm/hooksniff/templates/ingress.yaml

**Quality: Good** — Standard Ingress with TLS support.

| # | Severity | Finding |
|---|----------|---------|
| 1 | ⚪ Info | Well-structured with conditional ingress class, TLS, and path-based routing. |

### 2.4 deploy/helm/hooksniff/templates/statefulsets.yaml

**Quality: Good** — PostgreSQL and Redis as StatefulSets with PVCs.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🟡 Medium | Postgres password is passed as plain env var `POSTGRES_PASSWORD: {{ .Values.postgresql.auth.postgresPassword | quote }}` — visible in pod spec. Should use a Secret. |
| 2 | 🔵 Low | Redis has no persistence configuration for AOF — only RDB snapshots via volume. Data loss risk on crash. |

### 2.5 deploy/helm/hooksniff/values.yaml

**Quality: Fair** — Functional defaults but insecure.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🔴 Critical | `JWT_SECRET: "change-me-in-production"` and `HMAC_SECRET: "change-me-in-production"` — these are the actual default values committed to the repository. If deployed without override, all JWT tokens and HMAC signatures are trivially forgeable. |
| 2 | 🟡 Medium | `postgresql.auth.postgresPassword: hooksniff` — weak default password committed to repo. |
| 3 | 🟡 Medium | `redis.auth.enabled: false` — no Redis authentication by default. |
| 4 | 🔵 Low | All image tags default to `latest` — not reproducible. Should pin versions. |

### 2.6 deploy/terraform-provider-hooksniff/client.go

**Quality: Good** — Clean Go HTTP client with proper error handling.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🔵 Low | Uses `http.DefaultClient` — no timeout configured. Should create a client with `http.Client{Timeout: 30 * time.Second}`. |
| 2 | ⚪ Info | `Endpoint` struct includes `RoutingStrategy` and `FallbackURL` — these fields don't appear in the SDK models. Possible API drift or Terraform-specific fields. |

### 2.7 deploy/terraform-provider-hooksniff/endpoint_resource.go

**Quality: Stub** — All CRUD methods are TODO stubs.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🟠 High | **Non-functional Terraform provider**: `Create`, `Read`, `Update`, `Delete` are all empty stubs with TODO comments. The `Create` method even emits a warning "Not Implemented". This will confuse users who try to use it. |
| 2 | 🟡 Medium | `signing_secret` is marked `Sensitive: true` — good practice. But since the provider doesn't work, it's moot. |

### 2.8 deploy/api-env.yaml

**Quality: Fair** — Production environment config with embedded secrets.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🔴 Critical | **Hardcoded Polar product IDs**: `POLAR_PRODUCT_PRO: "ec5826ad-4a01-4146-b2d0-3b99eaf150a5"` and `POLAR_PRODUCT_BUSINESS: "e5b7d88a-7606-4963-a070-4102ca6405e2"` — these are production billing product identifiers committed to source control. While not secrets per se, they expose business configuration. |
| 2 | 🟡 Medium | `CORS_ORIGINS` has a duplicate entry: `"https://hooksniff.vercel.app,https://hooksniff.vercel.app"` — copy-paste error. |
| 3 | 🟠 High | `OTEL_EXPORTER_OTLP_ENDPOINT: "https://otlp-gateway-prod-us-east-0.grafana.net/otlp"` — production observability endpoint hardcoded. Should be in environment-specific config, not committed. |
| 4 | ⚪ Info | `MAX_PAYLOAD_BYTES: "1048576"` (1MB) — reasonable default. |

### 2.9 deploy/worker-env.yaml

**Quality: Minimal** — Worker-specific env vars.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🟡 Medium | Same `OTEL_EXPORTER_OTLP_ENDPOINT` hardcoded as api-env.yaml. |

---

## 3. Monitoring

### 3.1 monitoring/docker-compose.monitoring.yml

**Quality: Good** — Standard Prometheus + Grafana stack.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🔴 Critical | **Hardcoded Grafana admin password**: `GF_SECURITY_ADMIN_PASSWORD=hooksniff_grafana_change_me` — committed to source control. Anyone with repo access has admin access to Grafana. |
| 2 | 🟡 Medium | Prometheus port mapping `9091:9090` — external port differs from internal. Document why (port conflict avoidance). |
| 3 | 🔵 Low | `--web.enable-lifecycle` on Prometheus allows hot-reload via HTTP — could be a security risk if exposed externally. Fine for local dev. |
| 4 | ⚪ Info | Health checks configured for both services — good practice. |

### 3.2 monitoring/grafana/dashboards/hooksniff.json

**Quality: Excellent** — Comprehensive dashboard with 8 panels.

| # | Severity | Finding |
|---|----------|---------|
| 1 | ⚪ Info | Well-structured panels: Request Rate, Error Rate, Latency Percentiles, Webhook Delivery Success Rate, Active Connections, Delivery Status Pie, Kafka Publish Latency, DB Query Latency. Good coverage. |
| 2 | ⚪ Info | Uses `uid: "prometheus"` datasource reference — matches provisioning config. |
| 3 | 🔵 Low | Dashboard references `kafka_publish_latency_seconds_bucket` — verify Kafka metrics are actually exposed by the application. |

### 3.3 monitoring/grafana/provisioning/dashboards/dashboards.yml

**Quality: Good** — Standard Grafana provisioning config.

| # | Severity | Finding |
|---|----------|---------|
| 1 | ⚪ Info | `disableDeletion: false` — dashboards can be deleted via UI. Consider `true` for production. |

### 3.4 monitoring/grafana/provisioning/datasources/prometheus.yml

**Quality: Good** — Correct Prometheus datasource configuration.

| # | Severity | Finding |
|---|----------|---------|
| 1 | ⚪ Info | `editable: false` — prevents UI changes to datasource. Good for reproducibility. |

---

## 4. Scripts

### 4.1 scripts/publish-sdks.sh

**Quality: Dangerous** — Contains hardcoded credentials.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🔴 Critical | **Hardcoded Maven Central credentials**: `username: f0wXBf`, `password: EYLV763IsQVseaffdOXNScf2HZlcLDGEK` — written directly into `~/.m2/settings.xml`. This is a **credential leak** in source control. |
| 2 | 🔴 Critical | **Hardcoded Hex.pm API key**: `mix hex.auth --key caff94171db7190c24957e07ac3439e1` — directly in the script. |
| 3 | 🟠 High | The script uses `gem push hooksniff-0.1.0.gem` with hardcoded version — will fail if version differs. |
| 4 | 🟠 High | No error handling between publish steps — if Ruby fails, it still tries Java, Kotlin, Elixir. `set -e` helps but `cd` failures could be problematic. |
| 5 | 🟡 Medium | PHP section is manual instructions only — no automation for Packagist. |
| 6 | 🔵 Low | Mixes Turkish comments (`Kullanım`) with English output — inconsistent language. |

### 4.2 scripts/publish-elixir.sh

**Quality: Good** — Clean, minimal script.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🔵 Low | No `mix hex.auth` call — assumes already authenticated. The main `publish-sdks.sh` does auth inline. |
| 2 | ⚪ Info | `set -euo pipefail` — good error handling. |

### 4.3 scripts/publish-java.sh

**Quality: Good** — Proper Maven Central publish flow with documentation.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🟡 Medium | Comments reference `~/.m2/settings.xml` with placeholder credentials — good. But the main `publish-sdks.sh` overwrites this with real credentials. |
| 2 | ⚪ Info | Proper flow: compile → test → source jar → javadoc → GPG sign → deploy. |

### 4.4 scripts/publish-ruby.sh

**Quality: Good** — Simple gem build and push.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🔵 Low | Hardcoded version `0.1.0` in gem filename — will break if version changes. Should use `*.gem` glob. |

---

## 5. Portal

### 5.1 portal/widget.html

**Quality: Good** — Clean, self-contained webhook portal widget.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🟠 High | **API key passed via URL query parameter**: `var API_KEY = params.get("api_key")` — the API key is visible in the iframe URL. While the README claims "parent page'de görünmez" (not visible in parent page), it's visible in browser history, network logs, and iframe `src` attribute inspection. |
| 2 | 🟡 Medium | No Content Security Policy (CSP) headers or `sandbox` attribute on the iframe in `embed.js`. |
| 3 | 🔵 Low | `api("/api/v1/webhooks?limit=50")` — hardcoded `/api/v1` prefix, but `API_URL` already includes `/v1` from default. This would produce `...run.app/v1/api/v1/webhooks` — **double path prefix bug**. |
| 4 | ⚪ Info | Good XSS protection via `escHtml()` helper using DOM text node creation. |

### 5.2 portal/embed.js

**Quality: Good** — Clean embed script.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🟡 Medium | API key is passed as URL query parameter to iframe: `"?api_key=" + encodeURIComponent(API_KEY)` — exposed in iframe src. Should use `postMessage` or fragment identifier instead. |
| 2 | 🔵 Low | `iframe.setAttribute("allow", "clipboard-read; clipboard-write")` — unnecessary permissions for a read-only webhook viewer. |
| 3 | ⚪ Info | Good fallback logic when target container not found. |

### 5.3 portal/style.css

**Quality: Excellent** — Clean CSS with dark/light themes, responsive design.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🟠 High | **HookRelay remnant**: Line 1: `/* ── HookRelay Widget — Dark & Light Theme ── */` — the CSS file still references the old "HookRelay" name. Should be "HookSniff Widget". |

### 5.4 portal/README.md

**Quality: Good** — Comprehensive documentation in Turkish.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🔵 Low | Documentation is in Turkish — inconsistent with English codebase. Should have English version or be bilingual. |
| 2 | ⚪ Info | Good API response format documentation and security notes. |

---

## 6. CLI

### 6.1 cli/package.json

**Quality: Minimal** — Bare-bones CLI package.

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🟡 Medium | No `engines` field — doesn't specify required Node.js version. |
| 2 | 🟡 Medium | `test` script is `echo "Error: no test specified" && exit 1` — no tests. |
| 3 | 🔵 Low | Only dependency is `commander` — minimal, which is good. But no `axios` or `node-fetch` for API calls. |
| 4 | 🔵 Low | Version `0.1.0` — pre-release. Consistent with other SDKs. |

---

## Cross-Cutting Findings

### A. HookRelay Naming Remnants

| Location | Line | Content |
|----------|------|---------|
| `portal/style.css` | 1 | `/* ── HookRelay Widget — Dark & Light Theme ── */` |

The project was clearly renamed from "HookRelay" to "HookSniff" at some point. Only one remnant found in the reviewed files. The grep also found remnants in `monitoring/otel-collector-config.yml`, `deploy/oracle-cloud-setup.sh`, `scripts/backup.sh`, `scripts/restore.sh`, `sdks/php/src/WebhookVerification.php`, `sdks/go/hooksniff.go`, `tests/integration_test.sh`, and `tests/integration/api_test.sh` (not in this review scope but noted).

### B. Hardcoded Production URLs

Every SDK hardcodes the same GCP Cloud Run URL:
```
https://hooksniff-api-1046140057667.europe-west1.run.app/v1
```

This appears in:
- Kotlin (line ~companion object)
- C# (HookSniffConfig default)
- PHP (const DEFAULT_BASE_URL)
- Swift (init default parameter)
- Elixir (module attribute @default_base_url)
- portal/widget.html (URL param default)
- portal/embed.js (data-api-url default)

**Risk**: If the Cloud Run service is redeployed with a different URL, all SDKs break. Should use a stable domain name.

### C. Inconsistent Search API Exposure

| SDK | Search Available? | How? |
|-----|-------------------|------|
| Kotlin | ✅ | `client.search.search(...)` — but not documented |
| C# | ✅ | `Webhooks.SearchAsync(...)` — returns `object` |
| PHP | ✅ | `WebhooksResource::search(...)` |
| Swift | ✅ | `SearchResource` class exists but NOT exposed on client |
| Elixir | ❌ | Not implemented |

### D. Secret Management Summary

| Secret | Where Hardcoded | Severity |
|--------|----------------|----------|
| Maven Central creds | `scripts/publish-sdks.sh` | 🔴 Critical |
| Hex.pm API key | `scripts/publish-sdks.sh` | 🔴 Critical |
| Grafana admin password | `monitoring/docker-compose.monitoring.yml` | 🔴 Critical |
| JWT_SECRET default | `deploy/helm/values.yaml` | 🔴 Critical |
| HMAC_SECRET default | `deploy/helm/values.yaml` | 🔴 Critical |
| Postgres password | `deploy/helm/values.yaml` | 🟡 Medium |
| Polar product IDs | `deploy/api-env.yaml` | 🔴 Critical |
| OTEL endpoint | `deploy/api-env.yaml` | 🟠 High |

---

## Recommendations (Priority Order)

1. **🔴 IMMEDIATE**: Rotate all hardcoded credentials (Maven Central, Hex.pm, Grafana). Move to environment variables or secret manager.
2. **🔴 IMMEDIATE**: Change Helm `values.yaml` defaults to require explicit secret injection (`""` instead of `"change-me-in-production"`).
3. **🟠 HIGH**: Fix the `portal/widget.html` double-path bug (`/v1/api/v1/webhooks` → `/api/v1/webhooks` or remove `/v1` from default URL).
4. **🟠 HIGH**: Remove or mark Terraform provider as experimental/unimplemented.
5. **🟠 HIGH**: Fix `portal/style.css` HookRelay remnant and grep for remaining HookRelay references.
6. **🟡 MEDIUM**: Replace hardcoded GCP Cloud Run URL with a stable domain across all SDKs.
7. **🟡 MEDIUM**: Make Helm replica counts independently configurable for API vs Worker.
8. **🟡 MEDIUM**: Use Kubernetes Secrets for DATABASE_URL construction instead of inline password.
9. **🔵 LOW**: Add tests to CLI package.
10. **🔵 LOW**: Translate portal README to English or add bilingual version.
