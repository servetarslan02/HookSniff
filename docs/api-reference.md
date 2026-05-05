# Hookrelay API Reference

Base URL: `https://api.hookrelay.io/v1`

Authentication: `Authorization: Bearer hr_live_YOUR_KEY`

---

## Endpoints

### Create Endpoint

```
POST /v1/endpoints
```

**Request:**
```json
{
  "url": "https://myapp.com/webhook",
  "description": "Order notifications"
}
```

**Response:**
```json
{
  "id": "ep_abc123",
  "url": "https://myapp.com/webhook",
  "description": "Order notifications",
  "is_active": true,
  "created_at": "2026-05-06T02:00:00Z"
}
```

### List Endpoints

```
GET /v1/endpoints
```

**Response:**
```json
[
  {
    "id": "ep_abc123",
    "url": "https://myapp.com/webhook",
    "description": "Order notifications",
    "is_active": true,
    "created_at": "2026-05-06T02:00:00Z"
  }
]
```

### Delete Endpoint

```
DELETE /v1/endpoints/{id}
```

**Response:**
```json
{"deleted": true}
```

---

## Webhooks

### Send Webhook

```
POST /v1/webhooks
```

**Request:**
```json
{
  "endpoint_id": "ep_abc123",
  "event": "order.created",
  "data": {
    "order_id": "12345",
    "amount": 99.99
  }
}
```

**Response:**
```json
{
  "id": "wh_xyz789",
  "endpoint_id": "ep_abc123",
  "event": "order.created",
  "status": "pending",
  "attempt_count": 0,
  "response_status": null,
  "created_at": "2026-05-06T02:50:00Z"
}
```

### Get Webhook Status

```
GET /v1/webhooks/{id}
```

**Response:**
```json
{
  "id": "wh_xyz789",
  "endpoint_id": "ep_abc123",
  "event": "order.created",
  "status": "delivered",
  "attempt_count": 1,
  "response_status": 200,
  "created_at": "2026-05-06T02:50:00Z"
}
```

### List Webhooks

```
GET /v1/webhooks?page=1&per_page=20&status=delivered
```

**Query Parameters:**
- `page` (default: 1)
- `per_page` (default: 20, max: 100)
- `status` (optional: pending, delivered, failed)

**Response:**
```json
{
  "deliveries": [...],
  "total": 150,
  "page": 1,
  "per_page": 20
}
```

---

## Stats

### Get Statistics

```
GET /v1/stats
```

**Response:**
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

## Webhook Payload Format

When Hookrelay delivers a webhook to your endpoint, the payload looks like:

```http
POST https://myapp.com/webhook HTTP/1.1
Content-Type: application/json
X-Hookrelay-Signature: sha256=abc123def456...
X-Hookrelay-Delivery-Id: wh_xyz789
X-Hookrelay-Attempt: 1

{
  "event": "order.created",
  "data": {"order_id": "12345", "amount": 99.99},
  "timestamp": "2026-05-06T02:50:00Z"
}
```

### Signature Verification

Verify the `X-Hookrelay-Signature` header using HMAC-SHA256:

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

---

## Error Format

All errors return:

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "URL must start with http:// or https://"
  }
}
```

**Error Codes:**
- `UNAUTHORIZED` — Invalid or missing API key
- `FORBIDDEN` — Internal URL blocked
- `BAD_REQUEST` — Invalid input
- `NOT_FOUND` — Resource not found
- `PAYLOAD_TOO_LARGE` — Payload exceeds 1MB
- `RATE_LIMIT_EXCEEDED` — Monthly limit reached
- `INTERNAL_ERROR` — Server error (retry later)

---

## Rate Limits

| Plan | Requests/min | Webhooks/month |
|---|---|---|
| Free | 100 | 1,000 |
| Pro | 1,000 | 50,000 |
| Business | 10,000 | 500,000 |
