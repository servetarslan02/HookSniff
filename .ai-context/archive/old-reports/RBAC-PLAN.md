# RBAC Enforcement Plan — 2026-05-22

## Amaç
Tüm protected endpoint'lere rol tabanlı erişim kontrolü eklemek.

## Erişim Matrisi

| Kaynak | Okuma | Yazma | Silme |
|--------|-------|-------|-------|
| Events | analyst | — | — |
| Search | analyst | — | — |
| Health | analyst | — | — |
| Audit Log | analyst | — | — |
| Stats | analyst | — | — |
| Delivery Details | analyst | — | — |
| Notifications | viewer | viewer | developer |
| Broadcasts | viewer | viewer | — |
| Devices | viewer | developer | developer |
| Playground | — | developer | — |
| Billing (read) | viewer | — | — |
| Billing (write) | — | admin | — |
| Portal Config | — | developer | — |

## Dosyalar

1. `api/src/routes/events.rs` — list_events → analyst
2. `api/src/routes/search.rs` — search_deliveries → analyst
3. `api/src/routes/health_endpoints.rs` — list/get health → analyst
4. `api/src/routes/audit_log.rs` — list/get audit → analyst
5. `api/src/routes/stats.rs` — get_stats → analyst
6. `api/src/routes/delivery_details.rs` — list/get details → analyst
7. `api/src/routes/notifications.rs` — read ops → viewer, delete → developer
8. `api/src/routes/broadcasts.rs` — all ops → viewer
9. `api/src/routes/devices.rs` — read → viewer, write → developer
10. `api/src/routes/playground.rs` — all ops → developer
11. `api/src/routes/billing/mod.rs` — read → viewer, write → admin
12. `api/src/routes/portal_config.rs` — all ops → developer
