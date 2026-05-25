# 2026-05-18 — Swift SDK Düzeltme ve Eksik Kaynaklar

## Yapılan Düzeltmeler (12 dosya, +291/-32 satır)

### Eklenen Kaynaklar (6 yeni dosya)
1. **EnvironmentsResource** — ortam ve değişken CRUD
2. **BackgroundTasksResource** — list, get, cancel
3. **OperationalWebhooksResource** — CRUD + delivery logları
4. **MessagePollerResource** — poll, seek, commit
5. **InboundResource** — config'ler + inbound webhook işleme
6. **ConnectorResource** — connector ve config CRUD

### Düzeltilen Sorunlar
7. **IntegrationResource** — dönüş tipleri düzeltildi (bozuktu)
8. **StreamResource** — dönüş tipleri + publish path düzeltildi
9. **HealthResource** — API path `/health` → `/api/v1/health`
10. **Webhook.swift** — çoklu imza ayrıştırma düzeltildi (virgül yerine boşluk)
11. **HookSniff.swift** — `requestDict`, `requestArray`, `requestVoid` helper metodları eklendi
12. **Version** — 1.1.0 → 1.2.0

## Commit
- `a71aa5b` — `feat(swift-sdk): add missing resources and fix bugs (v1.2.0)`
