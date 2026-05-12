# OpenAPI Spec Audit — Items 279 & 280

> **Date:** 2026-05-12
> **Status:** Documentation only — actual spec updates needed

## 1. Missing Endpoints (Item 279)

The following endpoints exist in the Rust API code (`api/src/routes/`) but are **not documented** in `docs/openapi.yaml`:

### Admin Endpoints (14 missing)

| Path | Methods | Source File |
|------|---------|-------------|
| `/admin/alerts` | GET | `admin.rs` |
| `/admin/alerts/{id}` | DELETE | `admin.rs` |
| `/admin/audit-logs` | GET | `admin.rs` |
| `/admin/churn` | GET | `admin.rs` |
| `/admin/deliveries/{id}/replay` | POST | `admin.rs` |
| `/admin/revenue/export` | GET | `admin.rs` |
| `/admin/settings` | GET, PUT | `admin.rs` |
| `/admin/test-webhook` | POST | `admin.rs` |
| `/admin/users/export` | GET | `admin.rs` |
| `/admin/users/{id}/analytics` | GET | `admin.rs` |
| `/admin/users/{id}/impersonate` | POST | `admin.rs` |

### OAuth Endpoints (2 missing)

| Path | Methods | Source File |
|------|---------|-------------|
| `/oauth/github` | GET | `oauth.rs` |
| `/oauth/github/callback` | GET | `oauth.rs` |

### Duplicate/Conflicting Routes

- `/routing/{id}/routing` and `/routing/{id}/health` exist in OpenAPI but the actual code mounts routing under `/endpoints/{id}/routing` and `/endpoints/{id}/health`. The standalone `/routing/` paths should be removed from the spec.

### Batch Models Not Merged

`docs/new-models-batch2.yaml` and `docs/new-models-batch3.yaml` contain ~50 additional schema definitions that have **not been merged** into `docs/openapi.yaml`. These include:
- `DeliveryDetailResponse`, `WebhookFilter`, `DeliveryExportResponse`
- `TeamListResponse`, `UpdateTeamRequest`, `TeamMemberListResponse`, `InviteMemberRequest`
- `SSOConfig`, `CustomDomain`, `RateLimit`, `AuditLogEntry`
- And many more

## 2. Wrong Type Definitions (Item 280)

### Issues Found

| Location | Issue | Fix |
|----------|-------|-----|
| `amount_cents` in `Invoice` | `type: integer` — should be `type: integer, format: int64` | BIGINT in DB, can exceed 32-bit |
| `monthly_price_cents` in `PlanInfo` | Same as above | Same fix |
| Routing paths | `/routing/{id}/routing` and `/routing/{id}/health` reference standalone router but code uses `/endpoints/{id}/routing` | Remove duplicate paths |
| `inbound/{provider}/{endpoint_id}` | In OpenAPI but code only has `/{provider}` (no `{endpoint_id}` in path) | Verify actual route handler |
| Response schemas | Most endpoints return bare `description` without `$ref` to response schema | Should reference actual response types |

### Recommendations

1. **Merge batch YAML files** into `openapi.yaml` — this adds ~50 missing schemas
2. **Add missing admin endpoints** — 11 endpoints undocumented
3. **Add GitHub OAuth endpoints** — 2 endpoints
4. **Fix `amount_cents` format** — add `format: int64` for financial fields
5. **Remove duplicate routing paths** — clean up `/routing/{id}/*`
6. **Add response schemas** — many endpoints only have `description` without type info

## Action Items

- [ ] Merge `new-models-batch2.yaml` into `openapi.yaml`
- [ ] Merge `new-models-batch3.yaml` into `openapi.yaml`
- [ ] Add 13 missing endpoint paths
- [ ] Fix `int64` format for financial integer fields
- [ ] Remove conflicting `/routing/` standalone paths
- [ ] Add proper `$ref` response schemas to all endpoints
