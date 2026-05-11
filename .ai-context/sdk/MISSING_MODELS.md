# MISSING MODELS ANALYSIS — HookSniff SDK (Aşama 1.1)

> **Generated:** 2026-05-11  
> **Source:** `docs/openapi.yaml` (3547 lines)  
> **Purpose:** Identify every missing model to reach Svix-level SDK quality

---

## Summary

| Metric | Count |
|--------|-------|
| **Current schemas in `components/schemas`** | 78 (including 3 common: Error, Uuid, DateTime) |
| **Current domain models** | 75 |
| **Total missing models** | **76** |
| **Target model count (Svix-level)** | ~151 |
| **Endpoints with inline/untyped responses** | 24 |

---

## Legend

- ✅ Model exists in `components/schemas`
- ❌ Model missing (inline object or unspecified response)
- 🔶 Partially defined (exists but incomplete)

---

## 1. Auth (17 endpoints)

### Existing Models ✅
- `RegisterRequest`, `LoginRequest`, `AuthResponse`, `TwoFactorRequiredResponse`
- `CustomerResponse`, `ForgotPasswordRequest`, `ResetPasswordRequest`
- `VerifyEmailRequest`, `ResendVerificationRequest`, `RefreshTokenRequest`
- `Verify2faRequest`, `Enable2faRequest`, `Confirm2faRequest`, `Disable2faRequest`
- `UpdateProfileRequest`, `ChangePasswordRequest`

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 1 | `Enable2faResponse` | `POST /auth/2fa/enable` | Response is inline `{secret, qr_url}` |
| 2 | `LogoutRequest` | `POST /auth/logout` | Optional — body could carry `refresh_token` for explicit invalidation |
| 3 | `ExportDataResponse` | `GET /auth/export` | GDPR export — no typed response schema |

#### Proposed Schemas

```yaml
Enable2faResponse:
  type: object
  properties:
    secret: { type: string, description: "TOTP secret key" }
    qr_url: { type: string, format: uri, description: "QR code provisioning URL" }
  required: [secret, qr_url]

LogoutRequest:
  type: object
  properties:
    refresh_token: { type: string, description: "Refresh token to invalidate" }

ExportDataResponse:
  type: object
  properties:
    user: { $ref: "#/components/schemas/CustomerResponse" }
    endpoints: { type: array, items: { $ref: "#/components/schemas/Endpoint" } }
    deliveries: { type: array, items: { $ref: "#/components/schemas/Delivery" } }
    teams: { type: array, items: { $ref: "#/components/schemas/Team" } }
    exported_at: { $ref: "#/components/schemas/DateTime" }
  required: [exported_at]
```

---

## 2. Endpoints (7 endpoints)

### Existing Models ✅
- `Endpoint`, `CreateEndpointRequest`, `UpdateEndpointRequest`, `RetryPolicy`

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 4 | `EndpointListResponse` | `GET /endpoints` | Returns bare array, no pagination wrapper |
| 5 | `RotateSecretResponse` | `POST /endpoints/{id}/rotate-secret` | Inline `{signing_secret, message}` |

#### Proposed Schemas

```yaml
EndpointListResponse:
  type: object
  properties:
    data: { type: array, items: { $ref: "#/components/schemas/Endpoint" } }
    total: { type: integer }
    has_more: { type: boolean }
  required: [data, total, has_more]

RotateSecretResponse:
  type: object
  properties:
    signing_secret: { type: string }
    message: { type: string }
  required: [signing_secret, message]
```

---

## 3. Webhooks / Deliveries (10 endpoints)

### Existing Models ✅
- `CreateWebhookRequest`, `BatchWebhookRequest`, `Delivery`, `DeliveryListResponse`
- `BatchResponse`, `DeliveryAttempt`, `BatchReplayRequest`

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 6 | `DeliveryDetailResponse` | `GET /webhooks/{id}/details` | Response unspecified (200 with no schema) |
| 7 | `DeliveryAttemptDetailResponse` | `GET /webhooks/{id}/attempts/{attempt_id}` | Response unspecified |
| 8 | `WebhookFilter` | `GET /webhooks` | Query params (status, endpoint_id, page, per_page) not modeled |

#### Proposed Schemas

```yaml
DeliveryDetailResponse:
  type: object
  properties:
    delivery: { $ref: "#/components/schemas/Delivery" }
    attempts: { type: array, items: { $ref: "#/components/schemas/DeliveryAttempt" } }
    endpoint: { $ref: "#/components/schemas/Endpoint" }
    request_headers: { type: object, nullable: true }
    request_body: { type: object, nullable: true }
    response_headers: { type: object, nullable: true }
  required: [delivery, attempts]

DeliveryAttemptDetailResponse:
  type: object
  properties:
    attempt: { $ref: "#/components/schemas/DeliveryAttempt" }
    request_headers: { type: object, nullable: true }
    request_body: { type: object, nullable: true }
    response_headers: { type: object, nullable: true }
  required: [attempt]

WebhookFilter:
  type: object
  properties:
    status: { type: string, enum: [pending, processing, delivered, failed] }
    endpoint_id: { $ref: "#/components/schemas/Uuid" }
    page: { type: integer, default: 1 }
    per_page: { type: integer, default: 20 }
```

---

## 4. API Keys (4 endpoints)

### Existing Models ✅
- `ApiKeyInfo`, `CreateApiKeyResponse`

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 9 | `CreateApiKeyRequest` | `POST /api-keys` | No request body defined |
| 10 | `ApiKeyListResponse` | `GET /api-keys` | Returns bare array |

#### Proposed Schemas

```yaml
CreateApiKeyRequest:
  type: object
  properties:
    name: { type: string, description: "Friendly name for the key" }
    expires_at: { $ref: "#/components/schemas/DateTime" }

ApiKeyListResponse:
  type: object
  properties:
    data: { type: array, items: { $ref: "#/components/schemas/ApiKeyInfo" } }
    total: { type: integer }
    has_more: { type: boolean }
  required: [data, total, has_more]
```

---

## 5. Alerts (5 endpoints)

### Existing Models ✅
- `AlertRule`, `CreateAlertRequest`

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 11 | `AlertListResponse` | `GET /alerts` | Returns bare array |
| 12 | `UpdateAlertRequest` | `PUT /alerts/{id}` | No update endpoint exists; needed for completeness |

#### Proposed Schemas

```yaml
AlertListResponse:
  type: object
  properties:
    data: { type: array, items: { $ref: "#/components/schemas/AlertRule" } }
    total: { type: integer }
    has_more: { type: boolean }
  required: [data, total, has_more]

UpdateAlertRequest:
  type: object
  properties:
    name: { type: string }
    condition: { type: string, enum: [failure_rate, latency, consecutive_failures] }
    threshold: { type: integer }
    channels: { type: array, items: { type: string, enum: [slack, email, webhook] } }
    is_active: { type: boolean }
    endpoint_id: { $ref: "#/components/schemas/Uuid" }
```

---

## 6. Analytics (3 endpoints)

### Existing Models ✅
- `DeliveryTrendResponse`, `SuccessRateResponse`, `LatencyTrendResponse`

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 13 | `AnalyticsFilter` | All analytics endpoints | Query param `range` repeated everywhere; also needs `endpoint_id` filter |

#### Proposed Schemas

```yaml
AnalyticsFilter:
  type: object
  properties:
    range: { type: string, enum: ["24h", "7d", "30d"], default: "24h" }
    endpoint_id: { $ref: "#/components/schemas/Uuid" }
```

---

## 7. Stats (1 endpoint)

### Existing Models ✅
- `StatsResponse`

### Missing Models ❌
None — complete.

---

## 8. Search (1 endpoint)

### Existing Models ✅
- `SearchResult`

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 14 | `SearchFilter` | `GET /search` | Query params (q, status, endpoint_id, page, per_page) not modeled |
| 15 | `SearchResultListResponse` | `GET /search` | `SearchResult` lacks `has_more` field for pagination |

#### Proposed Schemas

```yaml
SearchFilter:
  type: object
  properties:
    q: { type: string }
    status: { type: string }
    endpoint_id: { $ref: "#/components/schemas/Uuid" }
    page: { type: integer, default: 1 }
    per_page: { type: integer, default: 20 }
  required: [q]
```

> Note: `SearchResult` should be enhanced with `has_more: boolean` for Svix-level pagination.

---

## 9. Inbound (2 endpoints)

### Existing Models ✅
None.

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 16 | `InboundWebhookRequest` | `POST /inbound/{provider}` | Request body is generic `type: object` |
| 17 | `InboundWebhookResponse` | `POST /inbound/{provider}` | No typed response |

#### Proposed Schemas

```yaml
InboundWebhookRequest:
  type: object
  description: "Raw webhook payload from external provider (Stripe, GitHub, etc.)"
  additionalProperties: true

InboundWebhookResponse:
  type: object
  properties:
    success: { type: boolean }
    message: { type: string }
    delivery_ids: { type: array, items: { $ref: "#/components/schemas/Uuid" } }
  required: [success]
```

---

## 10. Notifications (5 endpoints)

### Existing Models ✅
- `Notification`, `NotificationListResponse`

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 18 | `UnreadCountResponse` | `GET /notifications/unread-count` | Inline `{count: integer}` |

#### Proposed Schemas

```yaml
UnreadCountResponse:
  type: object
  properties:
    count: { type: integer }
  required: [count]
```

---

## 11. Devices (3 endpoints)

### Existing Models ✅
- `RegisterDeviceRequest`, `DeviceTokenResponse`

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 19 | `DeviceListResponse` | `GET /devices` | Returns bare array |

#### Proposed Schemas

```yaml
DeviceListResponse:
  type: object
  properties:
    data: { type: array, items: { $ref: "#/components/schemas/DeviceTokenResponse" } }
    total: { type: integer }
    has_more: { type: boolean }
  required: [data, total, has_more]
```

---

## 12. Teams (7 endpoints)

### Existing Models ✅
- `Team`, `CreateTeamRequest`, `InviteRequest`, `ChangeRoleRequest`
- `TeamDetailResponse`, `TeamMember`, `TeamInvite`

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 20 | `TeamListResponse` | `GET /teams` | Returns bare array |
| 21 | `TeamMemberListResponse` | `GET /teams/{id}/members` | Returns bare array |
| 22 | `UpdateTeamRequest` | `PUT /teams/{id}` | No update endpoint for team name |
| 23 | `AcceptInviteRequest` | `POST /teams/invite/accept` | No accept-invite endpoint |

#### Proposed Schemas

```yaml
TeamListResponse:
  type: object
  properties:
    data: { type: array, items: { $ref: "#/components/schemas/Team" } }
    total: { type: integer }
    has_more: { type: boolean }
  required: [data, total, has_more]

TeamMemberListResponse:
  type: object
  properties:
    data: { type: array, items: { $ref: "#/components/schemas/TeamMember" } }
    total: { type: integer }
    has_more: { type: boolean }
  required: [data, total, has_more]

UpdateTeamRequest:
  type: object
  properties:
    name: { type: string }

AcceptInviteRequest:
  type: object
  properties:
    token: { type: string, description: "Invitation token" }
  required: [token]
```

---

## 13. Billing (8 endpoints)

### Existing Models ✅
- `SubscriptionResponse`, `UpgradeRequest`, `UpgradeResponse`, `UsageResponse`, `InvoiceResponse`

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 24 | `BillingPortalResponse` | `POST /billing/portal` | Inline `{url: string}` |
| 25 | `InvoiceListResponse` | `GET /billing/invoices` | Returns bare array |
| 26 | `CancelSubscriptionRequest` | `DELETE /billing/subscription` | No cancel endpoint |
| 27 | `CancelSubscriptionResponse` | `DELETE /billing/subscription` | No cancel response |

#### Proposed Schemas

```yaml
BillingPortalResponse:
  type: object
  properties:
    url: { type: string, format: uri }
  required: [url]

InvoiceListResponse:
  type: object
  properties:
    data: { type: array, items: { $ref: "#/components/schemas/InvoiceResponse" } }
    total: { type: integer }
    has_more: { type: boolean }
  required: [data, total, has_more]

CancelSubscriptionRequest:
  type: object
  properties:
    reason: { type: string }
    immediate: { type: boolean, default: false }

CancelSubscriptionResponse:
  type: object
  properties:
    success: { type: boolean }
    message: { type: string }
    effective_date: { $ref: "#/components/schemas/DateTime" }
  required: [success]
```

---

## 14. Templates (3 endpoints)

### Existing Models ✅
- `WebhookTemplate`, `ApplyTemplateRequest`, `ApplyTemplateResponse`

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 28 | `TemplateListResponse` | `GET /templates` | Returns bare array |

#### Proposed Schemas

```yaml
TemplateListResponse:
  type: object
  properties:
    data: { type: array, items: { $ref: "#/components/schemas/WebhookTemplate" } }
    total: { type: integer }
    has_more: { type: boolean }
  required: [data, total, has_more]
```

---

## 15. Schemas (4 endpoints)

### Existing Models ✅
- `RegisterSchemaRequest`, `ValidateEventRequest`

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 29 | `SchemaResponse` | `GET /schemas/{id}`, `POST /schemas` | No entity model defined |
| 30 | `SchemaListResponse` | `GET /schemas` | Response unspecified |
| 31 | `ValidateEventResponse` | `POST /schemas/{id}/validate` | Response unspecified |
| 32 | `UpdateSchemaRequest` | `PUT /schemas/{id}` | No update endpoint |

#### Proposed Schemas

```yaml
SchemaResponse:
  type: object
  properties:
    id: { $ref: "#/components/schemas/Uuid" }
    name: { type: string }
    schema: { type: object, description: "JSON Schema document" }
    created_at: { $ref: "#/components/schemas/DateTime" }
    updated_at: { $ref: "#/components/schemas/DateTime" }
  required: [id, name, schema, created_at]

SchemaListResponse:
  type: object
  properties:
    data: { type: array, items: { $ref: "#/components/schemas/SchemaResponse" } }
    total: { type: integer }
    has_more: { type: boolean }
  required: [data, total, has_more]

ValidateEventResponse:
  type: object
  properties:
    valid: { type: boolean }
    errors: { type: array, items: { type: object, properties: { path: { type: string }, message: { type: string } } } }
  required: [valid]

UpdateSchemaRequest:
  type: object
  properties:
    name: { type: string }
    schema: { type: object }
```

---

## 16. Routing (6 endpoints, including duplicates)

### Existing Models ✅
- `RoutingInfo`, `UpdateRoutingRequest`, `EndpointHealth`

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 33 | `EndpointHealthListResponse` | `GET /endpoint-health` | Returns bare array |
| 34 | `EndpointHealthResponse` | `GET /endpoints/{id}/health` | Could wrap with metadata |

> Note: Duplicate `/routing/{id}/routing` and `/routing/{id}/health` endpoints exist that reuse `RoutingInfo` and `EndpointHealth` but have no typed response in their own paths.

#### Proposed Schemas

```yaml
EndpointHealthListResponse:
  type: object
  properties:
    data: { type: array, items: { $ref: "#/components/schemas/EndpointHealth" } }
    total: { type: integer }
    has_more: { type: boolean }
  required: [data, total, has_more]
```

---

## 17. Playground (2 endpoints)

### Existing Models ✅
- `TestWebhookRequest`, `TestWebhookResponse`

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 35 | `PlaygroundInfoResponse` | `GET /playground` | Inline `{endpoints[], sample_payloads[]}` |

#### Proposed Schemas

```yaml
PlaygroundInfoResponse:
  type: object
  properties:
    endpoints: { type: array, items: { $ref: "#/components/schemas/Endpoint" } }
    sample_payloads: { type: array, items: { type: object } }
  required: [endpoints, sample_payloads]
```

---

## 18. Transforms (5 endpoints)

### Existing Models ✅
- `TransformRule`, `CreateTransformRuleRequest`

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 36 | `TransformRuleListResponse` | `GET /endpoints/{endpoint_id}/transforms` | Returns bare array |
| 37 | `UpdateTransformRuleRequest` | `PUT /endpoints/{endpoint_id}/transforms/{id}` | Request body is generic `type: object` |
| 38 | `TransformTestResponse` | `POST /endpoints/{endpoint_id}/transforms/test` | Response unspecified |

#### Proposed Schemas

```yaml
TransformRuleListResponse:
  type: object
  properties:
    data: { type: array, items: { $ref: "#/components/schemas/TransformRule" } }
    total: { type: integer }
    has_more: { type: boolean }
  required: [data, total, has_more]

UpdateTransformRuleRequest:
  type: object
  properties:
    name: { type: string }
    rule_type: { type: string }
    config: { type: object }
    is_active: { type: boolean }

TransformTestResponse:
  type: object
  properties:
    success: { type: boolean }
    output: { type: object }
    duration_ms: { type: integer }
    error: { type: string, nullable: true }
  required: [success]
```

---

## 19. Stream (1 endpoint)

### Existing Models ✅
- `StreamParams`

### Missing Models ❌
None — SSE streams don't need typed JSON response models.

---

## 20. Contact (1 endpoint)

### Existing Models ✅
- `ContactRequest`, `ContactResponse`

### Missing Models ❌
None — complete.

---

## 21. Outbound IPs (1 endpoint)

### Existing Models ✅
- `OutboundIpsResponse`

### Missing Models ❌
None — complete.

---

## 22. Health / Status (3 endpoints)

### Existing Models ✅
- `SystemStatus`, `EndpointHealth`

### Missing Models ❌
(EndpointHealthListResponse counted in Routing section above)

None additional.

---

## 23. Customer Portal (12 endpoints)

### Existing Models ✅
- `PortalProfile`, `NotificationPreferences`, `UpdateNotificationPreferences`

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 39 | `PortalConfigResponse` | `GET /portal/config` | Response unspecified |
| 40 | `UpdatePortalConfigRequest` | `POST /portal/config` | Request body unspecified |
| 41 | `PortalConfigUpdateResponse` | `POST /portal/config` | Response unspecified |
| 42 | `EmbedCodeResponse` | `GET /portal/embed-code` | Response unspecified |
| 43 | `UpdateNotificationPreferencesResponse` | `PUT /portal/notifications` | Inline `{updated, preferences}` |
| 44 | `PortalProfileUpdateResponse` | `PUT /portal/me` | Response unspecified |

#### Proposed Schemas

```yaml
PortalConfigResponse:
  type: object
  properties:
    portal_name: { type: string }
    logo_url: { type: string, nullable: true }
    primary_color: { type: string, nullable: true }
    custom_domain: { type: string, nullable: true }
    enabled: { type: boolean }
  required: [enabled]

UpdatePortalConfigRequest:
  type: object
  properties:
    portal_name: { type: string }
    logo_url: { type: string }
    primary_color: { type: string }
    custom_domain: { type: string }
    enabled: { type: boolean }

PortalConfigUpdateResponse:
  type: object
  properties:
    success: { type: boolean }
    config: { $ref: "#/components/schemas/PortalConfigResponse" }
  required: [success]

EmbedCodeResponse:
  type: object
  properties:
    html: { type: string }
    script_url: { type: string, format: uri }
  required: [html, script_url]

UpdateNotificationPreferencesResponse:
  type: object
  properties:
    updated: { type: boolean }
    preferences: { $ref: "#/components/schemas/NotificationPreferences" }
  required: [updated, preferences]

PortalProfileUpdateResponse:
  type: object
  properties:
    success: { type: boolean }
    profile: { $ref: "#/components/schemas/PortalProfile" }
  required: [success]
```

---

## 24. Admin (7 endpoints)

### Existing Models ✅
- `PaginatedUsers`, `UserSummary`, `SystemStats`

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 45 | `AdminUserDetailResponse` | `GET /admin/users/{id}` | Response unspecified |
| 46 | `AdminChangePlanRequest` | `PUT /admin/users/{id}/plan` | Inline `{plan}` |
| 47 | `AdminChangePlanResponse` | `PUT /admin/users/{id}/plan` | Response unspecified |
| 48 | `AdminChangeStatusRequest` | `PUT /admin/users/{id}/status` | Inline `{is_active}` |
| 49 | `AdminChangeStatusResponse` | `PUT /admin/users/{id}/status` | Response unspecified |
| 50 | `AdminRevenueEntry` | `GET /admin/revenue` | Inline `{month, revenue_cents, subscriber_count}` |
| 51 | `AdminRevenueResponse` | `GET /admin/revenue` | Returns bare array of inline objects |
| 52 | `AdminSdkUpdateRequest` | `POST /admin/sdk-update` | Inline `{version, message}` |
| 53 | `AdminSdkUpdateResponse` | `POST /admin/sdk-update` | Response unspecified |

#### Proposed Schemas

```yaml
AdminUserDetailResponse:
  type: object
  properties:
    user: { $ref: "#/components/schemas/UserSummary" }
    endpoints_count: { type: integer }
    deliveries_count: { type: integer }
    teams: { type: array, items: { $ref: "#/components/schemas/Team" } }
  required: [user]

AdminChangePlanRequest:
  type: object
  properties:
    plan: { type: string, enum: [free, pro, business] }
  required: [plan]

AdminChangePlanResponse:
  type: object
  properties:
    success: { type: boolean }
    user: { $ref: "#/components/schemas/UserSummary" }
  required: [success]

AdminChangeStatusRequest:
  type: object
  properties:
    is_active: { type: boolean }
  required: [is_active]

AdminChangeStatusResponse:
  type: object
  properties:
    success: { type: boolean }
    user: { $ref: "#/components/schemas/UserSummary" }
  required: [success]

AdminRevenueEntry:
  type: object
  properties:
    month: { type: string }
    revenue_cents: { type: integer }
    subscriber_count: { type: integer }
  required: [month, revenue_cents, subscriber_count]

AdminRevenueResponse:
  type: object
  properties:
    data: { type: array, items: { $ref: "#/components/schemas/AdminRevenueEntry" } }
    total: { type: integer }
  required: [data]

AdminSdkUpdateRequest:
  type: object
  properties:
    version: { type: string }
    message: { type: string }
  required: [version, message]

AdminSdkUpdateResponse:
  type: object
  properties:
    success: { type: boolean }
    message: { type: string }
  required: [success]
```

---

## 25. Audit Log (2 endpoints)

### Existing Models ✅
None.

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 54 | `AuditLogEntry` | `GET /audit-log` | No entity model |
| 55 | `AuditLogListResponse` | `GET /audit-log` | Response unspecified |
| 56 | `AuditLogDetailResponse` | `GET /audit-log/{id}` | Response unspecified |

#### Proposed Schemas

```yaml
AuditLogEntry:
  type: object
  properties:
    id: { $ref: "#/components/schemas/Uuid" }
    action: { type: string }
    actor: { type: string }
    actor_email: { type: string }
    resource_type: { type: string }
    resource_id: { type: string }
    details: { type: object, nullable: true }
    ip_address: { type: string, nullable: true }
    created_at: { $ref: "#/components/schemas/DateTime" }
  required: [id, action, actor, resource_type, created_at]

AuditLogListResponse:
  type: object
  properties:
    data: { type: array, items: { $ref: "#/components/schemas/AuditLogEntry" } }
    total: { type: integer }
    has_more: { type: boolean }
  required: [data, total, has_more]

AuditLogDetailResponse:
  type: object
  properties:
    entry: { $ref: "#/components/schemas/AuditLogEntry" }
  required: [entry]
```

---

## 26. SSO (4 endpoints)

### Existing Models ✅
None.

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 57 | `SSOConfig` | `GET /sso/config` | No entity model |
| 58 | `SSOConfigRequest` | `POST /sso/config` | Inline `{provider, enabled}` |
| 59 | `SSOConfigResponse` | `GET/POST /sso/config` | Response unspecified |
| 60 | `SSOTestResponse` | `POST /sso/test` | Response unspecified |

#### Proposed Schemas

```yaml
SSOConfig:
  type: object
  properties:
    provider: { type: string, enum: [saml, oidc] }
    enabled: { type: boolean }
    metadata_url: { type: string, nullable: true }
    entity_id: { type: string, nullable: true }
    sso_url: { type: string, nullable: true }
    certificate: { type: string, nullable: true }
    client_id: { type: string, nullable: true }
    client_secret: { type: string, nullable: true }
    created_at: { $ref: "#/components/schemas/DateTime" }
    updated_at: { $ref: "#/components/schemas/DateTime" }
  required: [provider, enabled]

SSOConfigRequest:
  type: object
  properties:
    provider: { type: string, enum: [saml, oidc] }
    enabled: { type: boolean }
    metadata_url: { type: string }
    entity_id: { type: string }
    sso_url: { type: string }
    certificate: { type: string }
    client_id: { type: string }
    client_secret: { type: string }
  required: [provider, enabled]

SSOConfigResponse:
  type: object
  properties:
    config: { $ref: "#/components/schemas/SSOConfig" }
  required: [config]

SSOTestResponse:
  type: object
  properties:
    success: { type: boolean }
    message: { type: string }
    details: { type: object, nullable: true }
  required: [success]
```

---

## 27. Custom Domains (4 endpoints)

### Existing Models ✅
None.

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 61 | `CustomDomain` | `GET /custom-domains` | No entity model |
| 62 | `CustomDomainListResponse` | `GET /custom-domains` | Response unspecified |
| 63 | `CreateCustomDomainRequest` | `POST /custom-domains` | Inline `{domain}` |
| 64 | `CustomDomainResponse` | `POST /custom-domains` | Response unspecified |
| 65 | `VerifyDomainResponse` | `POST /custom-domains/{id}/verify` | Response unspecified |

#### Proposed Schemas

```yaml
CustomDomain:
  type: object
  properties:
    id: { $ref: "#/components/schemas/Uuid" }
    domain: { type: string }
    status: { type: string, enum: [pending, verified, failed] }
    verification_token: { type: string, nullable: true }
    ssl_status: { type: string, nullable: true }
    created_at: { $ref: "#/components/schemas/DateTime" }
  required: [id, domain, status, created_at]

CustomDomainListResponse:
  type: object
  properties:
    data: { type: array, items: { $ref: "#/components/schemas/CustomDomain" } }
    total: { type: integer }
    has_more: { type: boolean }
  required: [data, total, has_more]

CreateCustomDomainRequest:
  type: object
  properties:
    domain: { type: string }
  required: [domain]

CustomDomainResponse:
  type: object
  properties:
    domain: { $ref: "#/components/schemas/CustomDomain" }
  required: [domain]

VerifyDomainResponse:
  type: object
  properties:
    verified: { type: boolean }
    message: { type: string }
    ssl_status: { type: string, nullable: true }
  required: [verified]
```

---

## 28. Rate Limits (4 endpoints)

### Existing Models ✅
None.

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 66 | `RateLimit` | All rate-limit endpoints | No entity model |
| 67 | `RateLimitListResponse` | `GET /rate-limits` | Response unspecified |
| 68 | `CreateRateLimitRequest` | `POST /rate-limits/{endpoint_id}` | Request body unspecified |
| 69 | `RateLimitResponse` | `GET/POST /rate-limits/{endpoint_id}` | Response unspecified |

#### Proposed Schemas

```yaml
RateLimit:
  type: object
  properties:
    endpoint_id: { $ref: "#/components/schemas/Uuid" }
    max_requests: { type: integer }
    window_seconds: { type: integer }
    current_count: { type: integer, nullable: true }
    created_at: { $ref: "#/components/schemas/DateTime" }
    updated_at: { $ref: "#/components/schemas/DateTime" }
  required: [endpoint_id, max_requests, window_seconds]

RateLimitListResponse:
  type: object
  properties:
    data: { type: array, items: { $ref: "#/components/schemas/RateLimit" } }
    total: { type: integer }
    has_more: { type: boolean }
  required: [data, total, has_more]

CreateRateLimitRequest:
  type: object
  properties:
    max_requests: { type: integer }
    window_seconds: { type: integer }
  required: [max_requests, window_seconds]

RateLimitResponse:
  type: object
  properties:
    rate_limit: { $ref: "#/components/schemas/RateLimit" }
  required: [rate_limit]
```

---

## 29. OAuth (3 endpoints)

### Existing Models ✅
None.

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 70 | `OAuthProvider` | `GET /oauth/providers` | No entity model |
| 71 | `OAuthProviderListResponse` | `GET /oauth/providers` | Response unspecified |
| 72 | `OAuthCallbackResponse` | `GET /oauth/google/callback` | Response unspecified (should reuse AuthResponse) |

#### Proposed Schemas

```yaml
OAuthProvider:
  type: object
  properties:
    name: { type: string }
    display_name: { type: string }
    icon_url: { type: string, nullable: true }
    enabled: { type: boolean }
  required: [name, display_name, enabled]

OAuthProviderListResponse:
  type: object
  properties:
    data: { type: array, items: { $ref: "#/components/schemas/OAuthProvider" } }
    total: { type: integer }
  required: [data, total]

OAuthCallbackResponse:
  type: object
  description: "Same as AuthResponse — OAuth login returns JWT tokens"
  properties:
    token: { type: string }
    customer: { $ref: "#/components/schemas/CustomerResponse" }
    refresh_token: { type: string }
  required: [token, customer]
```

---

## 30. Events (1 endpoint)

### Existing Models ✅
None.

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 73 | `EventType` | `GET /events` | No entity model |
| 74 | `EventTypeListResponse` | `GET /events` | Response unspecified |

#### Proposed Schemas

```yaml
EventType:
  type: object
  properties:
    name: { type: string, description: "e.g. order.created" }
    description: { type: string, nullable: true }
    category: { type: string, nullable: true }
    schema: { type: object, nullable: true, description: "Expected payload schema" }
  required: [name]

EventTypeListResponse:
  type: object
  properties:
    data: { type: array, items: { $ref: "#/components/schemas/EventType" } }
    total: { type: integer }
    has_more: { type: boolean }
  required: [data, total, has_more]
```

---

## 31. Embed (2 endpoints)

### Existing Models ✅
None (HTML/JS responses, not JSON).

### Missing Models ❌
None — these return HTML/JS, not JSON models.

---

## 32. Simulator (1 endpoint)

### Existing Models ✅
None.

### Missing Models ❌

| # | Model Name | Endpoint | Reason |
|---|-----------|----------|--------|
| 75 | `SimulatorRequest` | `POST /simulator` | Inline `{endpoint_id, event, data}` |
| 76 | `SimulatorResponse` | `POST /simulator` | Response unspecified |

#### Proposed Schemas

```yaml
SimulatorRequest:
  type: object
  properties:
    endpoint_id: { type: string }
    event: { type: string }
    data: { type: object }
  required: [endpoint_id, data]

SimulatorResponse:
  type: object
  properties:
    success: { type: boolean }
    delivery_id: { $ref: "#/components/schemas/Uuid" }
    status_code: { type: integer }
    duration_ms: { type: integer }
    response_body: { type: string, nullable: true }
  required: [success]
```

---

## Total Missing Models Summary

| Category | Existing | Missing | 
|----------|----------|---------|
| Auth | 16 | 3 |
| Endpoints | 4 | 2 |
| Webhooks | 7 | 3 |
| API Keys | 2 | 2 |
| Alerts | 2 | 2 |
| Analytics | 3 | 1 |
| Stats | 1 | 0 |
| Search | 1 | 2 |
| Inbound | 0 | 2 |
| Notifications | 2 | 1 |
| Devices | 2 | 1 |
| Teams | 7 | 4 |
| Billing | 5 | 4 |
| Templates | 3 | 1 |
| Schemas | 2 | 4 |
| Routing | 3 | 1 |
| Playground | 2 | 1 |
| Transforms | 2 | 3 |
| Stream | 1 | 0 |
| Contact | 2 | 0 |
| Outbound IPs | 1 | 0 |
| Health/Status | 2 | 0 |
| Customer Portal | 3 | 6 |
| Admin | 3 | 9 |
| Audit Log | 0 | 3 |
| SSO | 0 | 4 |
| Custom Domains | 0 | 5 |
| Rate Limits | 0 | 4 |
| OAuth | 0 | 3 |
| Events | 0 | 2 |
| Embed | 0 | 0 |
| Simulator | 0 | 2 |
| **TOTAL** | **75** | **76** |

---

## Priority Tiers

### 🔴 P0 — Critical (blocks SDK completeness)
1. All `*ListResponse` pagination wrappers (EndpointListResponse, TeamListResponse, etc.)
2. All untyped entity responses (SchemaResponse, AuditLogEntry, CustomDomain, RateLimit, SSOConfig, EventType, OAuthProvider)
3. All inline response models (Enable2faResponse, RotateSecretResponse, BillingPortalResponse, etc.)

### 🟡 P1 — Important (SDK parity with Svix)
4. Filter models (WebhookFilter, SearchFilter, AnalyticsFilter)
5. Update/Patch request models (UpdateAlertRequest, UpdateTransformRuleRequest, etc.)
6. Missing CRUD operations (UpdateTeamRequest, CancelSubscriptionRequest)

### 🟢 P2 — Nice to have
7. Detail response wrappers (DeliveryDetailResponse, AuditLogDetailResponse)
8. Admin-specific models (AdminRevenueEntry, AdminSdkUpdateRequest)
9. Simulator/Playground models

---

## Inconsistencies Found

1. **Pagination style varies**: `DeliveryListResponse` uses `deliveries/total/page/per_page`, `PaginatedUsers` uses `users/total/page/per_page`. Svix standard is `data/has_more/total/iterator`.
2. **`SearchResult`** has `deliveries` field but lacks `has_more` — inconsistent with pagination pattern.
3. **Duplicate routing endpoints**: `/endpoints/{id}/routing` and `/routing/{id}/routing` — same functionality, different paths.
4. **Inline objects**: 24 endpoints return inline/untyped objects instead of `$ref` schemas.
5. **Date types**: Some models use `$ref: DateTime` while others use bare `type: string` for timestamps (e.g., `AlertRule.created_at`, `ApiKeyInfo.created_at`).
6. **`endpoint_id` type**: In `SimulatorRequest` it's `type: string`, but in `CreateWebhookRequest` it's `$ref: Uuid`. Should be consistent.
7. **No `PATCH` endpoints**: All updates use `PUT` (full replace). Svix supports PATCH for partial updates.
