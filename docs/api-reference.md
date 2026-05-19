# HookSniff API Reference

**Base URL:** `https://hooksniff-api-1046140057667.europe-west1.run.app/v1`
**Local:** `http://localhost:3000/v1`

**Authentication:** All endpoints (except `/auth/*` and `/health`) require:
```
Authorization: Bearer hr_live_YOUR_API_KEY
```

---

## Table of Contents

- [Authentication](#authentication)
- [Endpoints](#endpoints)
- [Webhooks](#webhooks)
- [API Keys](#api-keys)
- [Billing](#billing)
- [Stats](#stats)
- [Endpoint Health](#endpoint-health)
- [Webhook Delivery Format](#webhook-delivery-format)
- [Error Handling](#error-handling)
- [Rate Limits](#rate-limits)
- [Idempotency](#idempotency)

---

## Authentication

### Register

```
POST /v1/auth/register
```

Create a new account. Returns a JWT token and API key (shown only once).

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "customer": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "api_key": "hr_live_a1b2c3d4e5f6g7h8",
    "plan": "free",
    "webhook_limit": 1000,
    "webhook_count": 0,
    "created_at": "2026-05-06T00:00:00Z"
  }
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| `400` | Invalid email, password < 8 chars, or email already registered |
| `429` | Rate limit exceeded |

---

### Login

```
POST /v1/auth/login
```

Authenticate and get a JWT token. Does not return the API key.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "customer": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "plan": "free",
    "webhook_limit": 1000,
    "webhook_count": 0,
    "created_at": "2026-05-06T00:00:00Z"
  }
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| `400` | Invalid input |
| `401` | Wrong credentials |

---

## Endpoints

### List Endpoints

```
GET /v1/endpoints
```

Returns all webhook endpoints for the authenticated customer.

**Response `200`:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "url": "https://myapp.com/webhook",
    "description": "Order notifications",
    "is_active": true,
    "signing_secret": "whsec_abc123...",
    "retry_policy": {
      "max_attempts": 3,
      "backoff": "exponential",
      "initial_delay_secs": 10,
      "max_delay_secs": 3600
    },
    "created_at": "2026-05-06T00:00:00Z"
  }
]
```

---

### Create Endpoint

```
POST /v1/endpoints
```

Register a new webhook endpoint. A signing secret is auto-generated.

**Request:**
```json
{
  "url": "https://myapp.com/webhook",
  "description": "Order notifications",
  "retry_policy": {
    "max_attempts": 5,
    "backoff": "exponential",
    "initial_delay_secs": 30,
    "max_delay_secs": 3600
  },
  "custom_headers": {
    "X-Custom-Header": "value"
  },
  "event_filter": "order.*"
}
```

**Response `200`:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "url": "https://myapp.com/webhook",
  "description": "Order notifications",
  "is_active": true,
  "signing_secret": "whsec_abc123def456...",
  "retry_policy": {
    "max_attempts": 5,
    "backoff": "exponential",
    "initial_delay_secs": 30,
    "max_delay_secs": 3600
  },
  "created_at": "2026-05-06T00:00:00Z"
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| `400` | URL must start with `http://` or `https://` |
| `400` | Custom headers must start with `X-` |
| `403` | Internal/private URLs are blocked (SSRF protection) |

---

### Get Endpoint

```
GET /v1/endpoints/{id}
```

**Response `200`:** Same as endpoint object above.

**Errors:** `401` Unauthorized, `404` Not found.

---

### Update Endpoint

```
PUT /v1/endpoints/{id}
```

Partial update — only provided fields are modified.

**Request:**
```json
{
  "url": "https://myapp.com/webhooks/v2",
  "description": "Updated endpoint",
  "is_active": false,
  "retry_policy": {
    "max_attempts": 10,
    "backoff": "exponential"
  }
}
```

**Response `200`:** Updated endpoint object.

**Errors:** `400` Bad request, `401` Unauthorized, `404` Not found.

---

### Delete Endpoint

```
DELETE /v1/endpoints/{id}
```

Permanently removes the endpoint and all delivery history.

**Response `200`:**
```json
{ "deleted": true }
```

**Errors:** `401` Unauthorized, `404` Not found.

---

### Rotate Signing Secret

```
POST /v1/endpoints/{id}/rotate-secret
```

Generates a new signing secret. **Old secret remains valid for 24 hours.**

**Response `200`:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "signing_secret": "whsec_newsecret123...",
  "old_secret_valid_until": "2026-05-07T12:00:00Z",
  "message": "Secret rotated. Old secret remains valid for 24 hours."
}
```

---

## Webhooks

### Send Webhook

```
POST /v1/webhooks
```

Queues a webhook for async delivery. Returns immediately.

**Request:**
```json
{
  "endpoint_id": "550e8400-e29b-41d4-a716-446655440000",
  "event": "order.created",
  "data": {
    "order_id": "12345",
    "amount": 99.99,
    "currency": "USD"
  }
}
```

**Headers:**
```
Idempotency-Key: unique-request-id-123  (optional, for exactly-once delivery)
```

**Response `200`:**
```json
{
  "id": "wh_xyz789",
  "endpoint_id": "550e8400-e29b-41d4-a716-446655440000",
  "event": "order.created",
  "status": "pending",
  "attempt_count": 0,
  "response_status": null,
  "replay_count": 0,
  "created_at": "2026-05-06T02:50:00Z"
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| `400` | Invalid payload or event type |
| `404` | Endpoint not found or inactive |
| `413` | Payload exceeds max size (default 1 MB) |
| `429` | Monthly limit reached |

---

### Send Batch Webhooks

```
POST /v1/webhooks/batch
```

Send up to 100 webhooks in one request. Partial failures are reported.

**Request:**
```json
{
  "webhooks": [
    {
      "endpoint_id": "...",
      "event": "order.created",
      "data": { "order_id": "001" }
    },
    {
      "endpoint_id": "...",
      "event": "order.shipped",
      "data": { "order_id": "002" }
    }
  ]
}
```

**Response `200`:**
```json
{
  "deliveries": [
    { "id": "wh_001", "status": "pending", "..." : "..." },
    { "id": "wh_002", "status": "pending", "..." : "..." }
  ],
  "errors": [
    { "index": 5, "error": "Endpoint not found or inactive" }
  ]
}
```

---

### List Webhooks

```
GET /v1/webhooks?page=1&per_page=20&status=delivered
```

**Query Parameters:**
| Param | Default | Description |
|-------|---------|-------------|
| `page` | 1 | Page number |
| `per_page` | 20 | Items per page (max 100) |
| `status` | — | Filter: `pending`, `delivered`, `failed`, `filtered` |

**Response `200`:**
```json
{
  "deliveries": [...],
  "total": 150,
  "page": 1,
  "per_page": 20
}
```

---

### Get Webhook

```
GET /v1/webhooks/{id}
```

**Response `200`:** Delivery object with status, attempt count, response status.

---

### Replay Webhook

```
POST /v1/webhooks/{id}/replay
```

Creates a new delivery from the original payload. Endpoint must be active.

**Response `200`:** New delivery object with `status: "pending"`.

**Errors:** `400` Endpoint inactive, `404` Not found.

---

### Get Delivery Attempts

```
GET /v1/webhooks/{id}/attempts
```

Returns all delivery attempts (including retries) for a webhook.

**Response `200`:**
```json
[
  {
    "id": "att_001",
    "delivery_id": "wh_xyz789",
    "attempt_number": 1,
    "status_code": 500,
    "response_body": "Internal Server Error",
    "duration_ms": 1234,
    "error_message": null,
    "created_at": "2026-05-06T02:50:00Z"
  },
  {
    "id": "att_002",
    "delivery_id": "wh_xyz789",
    "attempt_number": 2,
    "status_code": 200,
    "response_body": "{\"ok\": true}",
    "duration_ms": 456,
    "error_message": null,
    "created_at": "2026-05-06T02:51:00Z"
  }
]
```

---

### Export Webhook Logs

```
GET /v1/webhooks/export?format=csv&status=failed&date_from=2026-05-01&date_to=2026-05-06
```

**Query Parameters:**
| Param | Default | Description |
|-------|---------|-------------|
| `format` | json | `json` or `csv` |
| `status` | — | Filter by status |
| `date_from` | — | Start date (ISO 8601 or YYYY-MM-DD) |
| `date_to` | — | End date |

Max 10,000 records per export.

---

## API Keys

### List API Keys

```
GET /v1/api-keys
```

Returns all keys with only their prefix visible (first 15 chars).

**Response `200`:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "prefix": "hr_live_a1b2c3d...",
    "name": "Production",
    "created_at": "2026-05-06T00:00:00Z",
    "last_used_at": "2026-05-06T12:00:00Z",
    "is_active": true
  }
]
```

---

### Create API Key

```
POST /v1/api-keys
```

**Request:**
```json
{
  "name": "Production API Key"
}
```

**Response `200`:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "key": "hr_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "prefix": "hr_live_a1b2c3d",
  "message": "Save this key — it won't be shown again."
}
```

> ⚠️ **The full key is only returned once.** Save it immediately.

---

### Delete API Key

```
DELETE /v1/api-keys/{id}
```

Immediately revokes the key.

**Response `200`:**
```json
{ "deleted": true }
```

---

### Rotate API Key

```
POST /v1/api-keys/{id}/rotate
```

Generates a new key value. **Old key is immediately invalidated** — no grace period.

**Response `200`:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "key": "hr_live_newkey123456789abcdef",
  "prefix": "hr_live_newkey1",
  "message": "Key rotated. Save the new key — it won't be shown again."
}
```

---

## Billing

### Get Subscription

```
GET /v1/billing/subscription
```

**Response `200`:**
```json
{
  "plan": "pro",
  "status": "active",
  "stripe_subscription_id": "sub_abc123",
  "webhook_limit": 50000,
  "endpoint_limit": 50,
  "retention_days": 30,
  "monthly_price_cents": 4900
}
```

---

### Upgrade Plan

```
POST /v1/billing/upgrade
```

Creates a Stripe Checkout session. Redirect customer to the returned URL.

**Request:**
```json
{ "plan": "pro" }
```

**Response `200`:**
```json
{
  "checkout_url": "https://checkout.stripe.com/pay/cs_test_...",
  "message": "Redirecting to Stripe Checkout for pro plan ($49.00/mo)"
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| `400` | Cannot downgrade (use portal) or enterprise (contact sales) |

---

### Open Customer Portal

```
POST /v1/billing/portal
```

Returns a Stripe Customer Portal URL for managing subscriptions.

**Response `200`:**
```json
{ "url": "https://billing.stripe.com/session/..." }
```

**Errors:** `400` No Stripe customer (upgrade first).

---

### Get Usage

```
GET /v1/billing/usage
```

**Response `200`:**
```json
{
  "plan": "pro",
  "webhooks": { "used": 1250, "limit": 50000, "remaining": 48750 },
  "endpoints": { "used": 3, "limit": 50, "remaining": 47 },
  "rate_limit": { "requests_per_minute": 1000 },
  "period": { "start": "2026-05-01", "end": "2026-05-06" }
}
```

---

## Stats

### Get Statistics

```
GET /v1/stats
```

**Response `200`:**
```json
{
  "total_deliveries": 1500,
  "delivered": 1450,
  "failed": 30,
  "pending": 20,
  "success_rate": 96.67,
  "endpoints_count": 5
}
```

---

## Endpoint Health

### List Endpoint Health

```
GET /v1/endpoint-health
```

**Response `200`:**
```json
[
  {
    "id": "...",
    "url": "https://myapp.com/webhook",
    "description": "Order notifications",
    "is_active": true,
    "health_status": "healthy",
    "success_rate": 99.2,
    "avg_response_ms": 234,
    "p95_response_ms": 468,
    "p99_response_ms": 702,
    "total_deliveries": 500,
    "successful": 496,
    "failed": 4,
    "consecutive_failures": 0,
    "last_success_at": "2026-05-06T12:00:00Z",
    "last_failure_at": null,
    "uptime_24h": 99.2,
    "uptime_7d": 98.8
  }
]
```

**Health Status:**
| Status | Condition |
|--------|-----------|
| `healthy` | < 3 consecutive failures, success rate ≥ 95% |
| `degraded` | 3-4 consecutive failures OR success rate < 95% |
| `unhealthy` | ≥ 5 consecutive failures |

---

### Get Endpoint Health

```
GET /v1/endpoint-health/{id}
```

Returns health details for a single endpoint.

---

## AI Center

The AI Center provides anomaly detection, risk scoring, and automated remediation.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/ai/status` | GET | Overall AI center status |
| `/v1/ai/events` | GET | List events (filter by severity, type) |
| `/v1/ai/risks` | GET | Risk scores for endpoints |
| `/v1/ai/actions` | GET | List AI actions |
| `/v1/ai/actions/{id}/approve` | POST | Approve a pending action |
| `/v1/ai/actions/{id}/reject` | POST | Reject a pending action |
| `/v1/ai/actions/{id}/rollback` | POST | Rollback an executed action |
| `/v1/ai/blocklist` | GET/POST | Manage IP/customer/endpoint blocks |
| `/v1/ai/blocklist/{id}` | DELETE | Remove a block entry |
| `/v1/ai/providers` | GET | AI provider status |
| `/v1/ai/stats` | GET | AI center statistics |

---

## Webhook Delivery Format

When HookSniff delivers a webhook to your endpoint:

```http
POST https://myapp.com/webhook HTTP/1.1
Content-Type: application/json
webhook-signature: v1,<base64(hmac)>
webhook-id: wh_xyz789
webhook-attempt: 1

{
  "event": "order.created",
  "data": {
    "order_id": "12345",
    "amount": 99.99
  },
  "timestamp": "2026-05-06T02:50:00Z"
}
```

### Signature Verification

Verify the `webhook-signature` header using Standard Webhooks HMAC-SHA256:

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

```python
import hmac, hashlib

def verify_signature(payload: bytes, signature: str, secret: str) -> bool:
    expected = 'sha256=' + hmac.new(
        secret.encode(), payload, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)
```

```go
func verifySignature(payload []byte, signature, secret string) bool {
    mac := hmac.New(sha256.New, []byte(secret))
    mac.Write(payload)
    expected := "sha256=" + hex.EncodeToString(mac.Sum(nil))
    return hmac.Equal([]byte(signature), []byte(expected))
}
```

### Your Endpoint Should

1. Return `2xx` for success (HookSniff marks as `delivered`)
2. Return `4xx`/`5xx` or timeout → retry with exponential backoff
3. Verify the signature before processing
4. Respond within 30 seconds (default timeout)

---

## Error Handling

All errors return a consistent format:

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "URL must start with http:// or https://"
  }
}
```

### Error Codes

| HTTP | Code | Description |
|------|------|-------------|
| 400 | `BAD_REQUEST` | Invalid input, validation failed |
| 401 | `UNAUTHORIZED` | Missing or invalid API key |
| 403 | `FORBIDDEN` | Internal URL blocked (SSRF protection) |
| 404 | `NOT_FOUND` | Resource not found |
| 413 | `PAYLOAD_TOO_LARGE` | Payload exceeds 1 MB |
| 429 | `RATE_LIMIT_EXCEEDED` | Monthly limit reached |
| 500 | `INTERNAL_ERROR` | Server error (safe to retry) |

---

## Rate Limits

| Plan | Requests/min | Webhooks/month | Endpoints | Retention |
|------|-------------|----------------|-----------|-----------|
| Free | 100 | 1,000 | 5 | 7 days |
| Pro ($49/mo) | 1,000 | 50,000 | 50 | 30 days |
| Business ($149/mo) | 10,000 | 500,000 | 500 | 90 days |

**Rate limit headers** (included in every response):
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 45
```

---

## Idempotency

The `POST /v1/webhooks` endpoint supports idempotency:

```
POST /v1/webhooks
Idempotency-Key: my-unique-key-123
```

- Same key within 24 hours → returns cached response
- Prevents duplicate deliveries on network retries
- Keys are scoped per customer

---

## Health Check

```
GET /v1/health
```

No authentication required.

```json
{
  "status": "ok",
  "service": "hooksniff-api",
  "version": "0.1.0"
}
```
