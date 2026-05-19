---
sidebar_position: 3
---

# API Reference

Complete REST API documentation for HookSniff. All endpoints are under `/v1`.

## Base URL

```
https://hooksniff-api-1046140057667.europe-west1.run.app
```

## Authentication

All API requests require a Bearer token:

```
Authorization: Bearer hr_live_your_api_key
```

Get your API key from **Settings → API Keys** in the dashboard.

---

## Endpoints

Manage webhook destination URLs.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/endpoints` | List endpoints (paginated) |
| POST | `/v1/endpoints` | Create endpoint |
| GET | `/v1/endpoints/:id` | Get endpoint |
| PUT | `/v1/endpoints/:id` | Update endpoint |
| PATCH | `/v1/endpoints/:id` | Patch endpoint |
| DELETE | `/v1/endpoints/:id` | Delete endpoint |
| POST | `/v1/endpoints/:id/rotate-secret` | Rotate signing secret |
| GET | `/v1/endpoints/:id/headers` | Get custom headers |
| PATCH | `/v1/endpoints/:id/headers` | Update custom headers |

### Create Endpoint

```bash
curl -X POST /v1/endpoints \
  -H "Authorization: Bearer hr_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://myapp.com/webhook",
    "description": "Order notifications",
    "event_types": ["order.created", "order.updated"],
    "rate_limit": 100
  }'
```

Response:
```json
{
  "id": "ep_abc123",
  "url": "https://myapp.com/webhook",
  "description": "Order notifications",
  "secret": "whsec_base64...",
  "event_types": ["order.created", "order.updated"],
  "rate_limit": 100,
  "created_at": "2026-01-15T10:30:00Z"
}
```

---

## Webhooks

Send and manage webhook deliveries.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/webhooks` | Send webhook |
| POST | `/v1/webhooks/batch` | Batch send |
| GET | `/v1/webhooks` | List deliveries |
| GET | `/v1/webhooks/:id` | Get delivery |
| POST | `/v1/webhooks/:id/replay` | Replay delivery |
| POST | `/v1/webhooks/bulk-replay` | Bulk replay |
| GET | `/v1/webhooks/:id/attempts` | Get delivery attempts |
| POST | `/v1/webhooks/:id/replay/:attempt_id` | Replay specific attempt |

### Send Webhook

```bash
curl -X POST /v1/webhooks \
  -H "Authorization: Bearer hr_live_xxx" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: order-12345-created" \
  -d '{
    "endpoint_id": "ep_abc123",
    "event": "order.created",
    "data": {
      "order_id": "ORD-12345",
      "amount": 99.99,
      "currency": "USD"
    }
  }'
```

Response:
```json
{
  "id": "msg_xyz789",
  "endpoint_id": "ep_abc123",
  "event": "order.created",
  "status": "pending",
  "created_at": "2026-01-15T10:30:00Z"
}
```

### List Deliveries

```bash
# All deliveries
GET /v1/webhooks?limit=20

# Filter by endpoint
GET /v1/webhooks?endpoint_id=ep_abc123&limit=20

# Filter by event type
GET /v1/webhooks?event_type=order.created&limit=20

# Filter by status
GET /v1/webhooks?status=failed&limit=20

# Pagination
GET /v1/webhooks?limit=20&cursor=eyJpZCI6MTB9
```

---

## Message Attempts

Delivery attempt details.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/webhooks/:id/attempts` | List attempts for a delivery |
| GET | `/v1/webhooks/:id/attempts/:attempt_id` | Get specific attempt |
| POST | `/v1/webhooks/:id/attempts/:attempt_id/replay` | Replay attempt |

---

## Event Types

Define and manage webhook event types.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/events` | List event types |
| POST | `/v1/events` | Create event type |
| GET | `/v1/events/:id` | Get event type |
| PUT | `/v1/events/:id` | Update event type |
| PATCH | `/v1/events/:id` | Patch event type |
| DELETE | `/v1/events/:id` | Delete event type |
| POST | `/v1/events/import-openapi` | Import from OpenAPI spec |

---

## Authentication

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/auth/register` | Register account |
| POST | `/v1/auth/login` | Login (returns JWT) |
| GET | `/v1/auth/me` | Get current user |
| POST | `/v1/auth/2fa/enable` | Enable 2FA |
| POST | `/v1/auth/2fa/verify` | Verify 2FA code |
| POST | `/v1/auth/forgot-password` | Request password reset |
| POST | `/v1/auth/reset-password` | Reset password |
| GET | `/v1/auth/verify-email` | Verify email |
| GET | `/v1/auth/export` | Export user data (GDPR) |
| DELETE | `/v1/auth/account` | Delete account (GDPR) |

### Register

```bash
curl -X POST /v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure_password",
    "name": "John Doe"
  }'
```

### Login

```bash
curl -X POST /v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure_password"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

## API Keys

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/api-keys` | List API keys |
| POST | `/v1/api-keys` | Create API key |
| DELETE | `/v1/api-keys/:id` | Delete API key |
| POST | `/v1/api-keys/:id/rotate` | Rotate API key |

---

## Applications

Group endpoints by application.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/applications` | List applications |
| POST | `/v1/applications` | Create application |
| GET | `/v1/applications/:id` | Get application |
| PUT | `/v1/applications/:id` | Update application |
| DELETE | `/v1/applications/:id` | Delete application |

---

## Analytics

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/analytics/deliveries` | Delivery trend data |
| GET | `/v1/analytics/success-rate` | Success rate metrics |
| GET | `/v1/analytics/latency` | Latency metrics |

---

## Billing

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/billing/plans` | List plans |
| POST | `/v1/billing/upgrade` | Upgrade plan |
| POST | `/v1/billing/portal` | Open customer portal |
| GET | `/v1/billing/usage` | Get usage stats |

---

## Teams

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/teams/members` | List team members |
| POST | `/v1/teams/invite` | Invite member |
| DELETE | `/v1/teams/members/:id` | Remove member |
| PUT | `/v1/teams/members/:id/role` | Change role |

---

## Alerts

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/alerts/rules` | List alert rules |
| POST | `/v1/alerts/rules` | Create alert rule |
| PUT | `/v1/alerts/rules/:id` | Update alert rule |
| DELETE | `/v1/alerts/rules/:id` | Delete alert rule |
| POST | `/v1/alerts/rules/:id/test` | Test alert rule |

---

## Search

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/search` | Full-text search deliveries |

---

## Inbound Webhooks

Receive webhooks from external providers (Stripe, GitHub, Shopify).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/inbound` | List inbound configs |
| POST | `/v1/inbound` | Create inbound config |
| GET | `/v1/inbound/:id` | Get inbound config |
| DELETE | `/v1/inbound/:id` | Delete inbound config |

---

## Integrations

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/integrations` | List integrations |
| POST | `/v1/integrations` | Create integration |
| GET | `/v1/integrations/:id` | Get integration |
| PUT | `/v1/integrations/:id` | Update integration |
| DELETE | `/v1/integrations/:id` | Delete integration |
| POST | `/v1/integrations/:id/rotate-key` | Rotate integration key |

---

## Connectors

Pre-built integrations.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/connectors` | List connectors |
| GET | `/v1/connectors/:id` | Get connector |
| DELETE | `/v1/connectors/:id` | Delete connector |

---

## Streaming

Real-time delivery event stream (SSE).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/stream/deliveries` | SSE stream of delivery events |
| GET | `/v1/stream/channels` | List stream channels |
| POST | `/v1/stream/channels` | Create channel |
| POST | `/v1/stream/publish` | Publish event |

---

## Schema Registry

JSON Schema validation.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/schemas` | List schemas |
| POST | `/v1/schemas` | Create schema |
| GET | `/v1/schemas/:id` | Get schema |
| PUT | `/v1/schemas/:id` | Update schema |
| DELETE | `/v1/schemas/:id` | Delete schema |

---

## Smart Routing

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/routing` | List routing rules |
| POST | `/v1/routing` | Create routing rule |
| GET | `/v1/routing/:id` | Get routing rule |
| PUT | `/v1/routing/:id` | Update routing rule |
| DELETE | `/v1/routing/:id` | Delete routing rule |

---

## Payload Transforms

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/transforms` | List transforms |
| POST | `/v1/transforms` | Create transform |
| GET | `/v1/transforms/:id` | Get transform |
| PUT | `/v1/transforms/:id` | Update transform |
| DELETE | `/v1/transforms/:id` | Delete transform |

---

## Rate Limiting

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/endpoints/:id/rate-limit` | Get rate limit |
| POST | `/v1/endpoints/:id/rate-limit` | Set rate limit |
| DELETE | `/v1/endpoints/:id/rate-limit` | Remove rate limit |

---

## Environments

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/environments` | List environments |
| POST | `/v1/environments` | Create environment |
| POST | `/v1/environments/export` | Export environments |
| POST | `/v1/environments/import` | Import environments |

---

## Background Tasks

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/background-tasks` | List tasks |
| GET | `/v1/background-tasks/:id` | Get task |
| POST | `/v1/background-tasks/:id/cancel` | Cancel task |

---

## Operational Webhooks

Webhooks about webhooks (delivery failures, endpoint disabled, etc.)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/operational-webhooks` | List ops webhook endpoints |
| POST | `/v1/operational-webhooks` | Create ops webhook endpoint |
| DELETE | `/v1/operational-webhooks/:id` | Delete ops webhook endpoint |

---

## Message Poller

Poll-based delivery (alternative to webhooks).

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/message-poller/poll` | Poll for messages |
| POST | `/v1/message-poller/commit` | Commit consumed messages |
| POST | `/v1/message-poller/seek` | Seek to position |

---

## Notifications

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/notifications` | List notifications |
| POST | `/v1/notifications/:id/read` | Mark as read |
| POST | `/v1/notifications/read-all` | Mark all as read |

---

## Service Tokens

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/service-tokens` | List tokens |
| POST | `/v1/service-tokens` | Create token |
| DELETE | `/v1/service-tokens/:id` | Delete token |

---

## Custom Domains

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/custom-domains` | List domains |
| POST | `/v1/custom-domains` | Add domain |
| POST | `/v1/custom-domains/:id/verify` | Verify domain |
| DELETE | `/v1/custom-domains/:id` | Delete domain |

---

## SSO

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/sso` | Get SSO config |
| PUT | `/v1/sso` | Update SSO config |

---

## Audit Log

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/audit-log` | List audit events |

---

## Portal

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/portal` | Generate portal link |

---

## Templates

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/templates` | List templates |
| POST | `/v1/templates` | Create template |
| GET | `/v1/templates/:id` | Get template |
| PUT | `/v1/templates/:id` | Update template |
| DELETE | `/v1/templates/:id` | Delete template |

---

## Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/metrics` | Prometheus metrics |
| GET | `/v1/outbound-ips` | List outbound IPs |

---

## Rate Limits

| Plan | Requests/min | Webhooks/day |
|------|-------------|-------------|
| Developer (Free) | 100 | 100 |
| Startup ($24/mo) | 500 | 30,000 |
| Pro ($49/mo) | 1,000 | 100,000 |
| Enterprise | Custom | Unlimited |

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1716100060
```

On 429: `Retry-After: 30` (seconds to wait)

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request — invalid parameters |
| 401 | Unauthorized — invalid or missing API key |
| 403 | Forbidden — insufficient permissions |
| 404 | Not Found — resource doesn't exist |
| 409 | Conflict — duplicate request (idempotency) |
| 422 | Unprocessable — validation failed |
| 429 | Rate Limited — too many requests |
| 500 | Internal Server Error |

Error response format:
```json
{
  "code": "validation_error",
  "detail": "Invalid field: url must be a valid HTTPS URL"
}
```
