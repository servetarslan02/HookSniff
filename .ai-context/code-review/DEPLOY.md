# 🔍 Deploy, Monitoring, Scripts, Portal, CLI İnceleme

> Kapsam: deploy/ (20 dosya), monitoring/ (7), scripts/ (10), portal/ (5), CLI (2)
> Tarih: 2026-05-10

---

## 🔴 Kritik — Credential Leaks

| # | Sorun | Dosya | Satır |
|---|-------|-------|-------|
| 1 | Maven Central credential'ları hardcoded (`f0wXBf` / `EYLV763IsQVseaffdOXNScf2HZlcLDGEK`) | `scripts/publish-sdks.sh` | ~maven |
| 2 | Hex.pm API key hardcoded (`caff94171db7190c24957e07ac3439e1`) | `scripts/publish-sdks.sh` | ~hex |
| 3 | Grafana admin password hardcoded | `monitoring/docker-compose.monitoring.yml` | GF_SECURITY_ADMIN_PASSWORD |
| 4 | Grafana Cloud token hardcoded | `monitoring/otel-collector-config.yml` | authorization |
| 5 | Helm default JWT_SECRET/HMAC_SECRET `"change-me-in-production"` | `deploy/helm/values.yaml` | env |
| 6 | Polar product ID'leri hardcoded | `deploy/api-env.yaml` | POLAR_PRODUCT | ✅ Düzeltildi (2026-05-10) |
| 7 | TOTP secret şifrelenmemiş | `migrations/033_totp_2fa.sql` | totp_secret |

## 🟠 Yüksek

| # | Sorun | Dosya |
|---|-------|-------|
| 1 | Portal API key URL'de (iframe src query param) | `portal/embed.js`, `portal/widget.html` |
| 2 | Portal double-path bug (`/v1/api/v1/webhooks`) | `portal/widget.html` | ✅ Düzeltildi (2026-05-10) |
| 3 | Terraform provider çalışmıyor (tüm CRUD stub) | `deploy/terraform-provider-hooksniff/endpoint_resource.go` |
| 4 | Helm DB password inline (kubectl describe ile görünür) | `deploy/helm/templates/deployments.yaml` |
| 5 | OTEL endpoint hardcoded (prod observability URL) | `deploy/api-env.yaml`, `worker-env.yaml` |
| 6 | Production log level debug (`RUST_LOG=info,hooksniff=debug`) | `render.yaml` | ✅ Düzeltildi (2026-05-10) |

## 🟡 Orta

| # | Sorun | Dosya |
|---|-------|-------|
| 1 | CORS duplicate entry | `deploy/api-env.yaml` |
| 2 | Redis auth enabled değil (default) | `deploy/helm/values.yaml` |
| 3 | Image tag `latest` — version pin yok | `deploy/helm/values.yaml` |
| 4 | Helm replica count ayrı ayrı configure edilemiyor | `deploy/helm/templates/deployments.yaml` |
| 5 | Prometheus `--web.enable-lifecycle` (external exposure riski) | `monitoring/prometheus.yml` |
| 6 | Grafana `disableDeletion: false` | `monitoring/grafana/provisioning/dashboards/dashboards.yml` |
| 7 | Portal README sadece Türkçe | `portal/README.md` |
| 8 | CLI'da test yok, engines field yok | `cli/package.json` |
| 9 | Publish script hardcoded version (`0.1.0`) | `scripts/publish-ruby.sh` |

## hookrelay Artıkları — ✅ Tümü Düzeltildi (2026-05-10)

| Dosya | İçerik | Durum |
|-------|--------|-------|
| `scripts/backup.sh` | `DB_NAME="${DB_NAME:-hookrelay}"` | ✅ |
| `cli/index.js` | `process.env.HOOKRELAY_API_URL`, `HOOKRELAY_API_KEY` | ✅ |
| `portal/style.css` | `/* ── HookRelay Widget — Dark & Light Theme ── */` | ✅ |
| `deploy/gcp-deploy.ps1` | hookrelay referansları | ✅ |
| `deploy/oracle-cloud-setup.sh` | 20+ hookrelay referansı | ✅ |
| `scripts/backup.sh` | 10+ hookrelay referansı | ✅ |
| `scripts/restore.sh` | 10+ hookrelay referansı | ✅ |
| `migrations/001_initial.sql` | hookrelay comment | ✅ |
| `migrations/002_security_features.sql` | `X-HookRelay-Signature` | ✅ |
| `migrations/005_event_mesh.sql` | hookrelay comment | ✅ |
| `tests/integration_test.sh` | hookrelay referansları | ✅ |
| `tests/integration/api_test.sh` | hookrelay referansları | ✅ |

## 🟢 Güçlü Yönler

- ✅ Production'da Secret Manager kullanımı (`deploy.yml` --set-secrets)
- ✅ k6 load test suite (smoke, load, stress, throughput)
- ✅ Grafana dashboard 8 panel ile iyi yapılandırılmış
- ✅ Alert rules (9 kural: error rate, latency, service down)
- ✅ CI/CD pipeline'da security audit
- ✅ Portal XSS koruması (DOM text node creation)
