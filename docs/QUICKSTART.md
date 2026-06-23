# HookSniff Quickstart — Send Your First Webhook in 5 Minutes

This guide walks you through registering, creating an endpoint, and sending your first webhook.

---

## 1. Register (1 minute)

1. Go to [hooksniff.vercel.app/register](https://hooksniff.vercel.app/register)
2. Enter your email and password
3. Click the email verification link

## 2. Get an API Key (1 minute)

1. In the dashboard, go to **Core** → **API Keys**
2. Click **"Create API Key"**
3. Copy the key (it's only shown once!)

```
hr_live_abc123def456...
```

## 3. Create an Endpoint (1 minute)

Tell HookSniff where to deliver your webhooks.

```bash
curl -X POST https://hooksniff-api-499907444852.europe-west1.run.app/v1/endpoints \
  -H "Authorization: Bearer hr_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-app.com/webhook"}'
```

Response:
```json
{
  "id": "ep_abc123",
  "url": "https://your-app.com/webhook",
  "created_at": "2026-05-15T00:00:00Z"
}
```

## 4. Send a Webhook (1 minute)

```bash
curl -X POST https://hooksniff-api-499907444852.europe-west1.run.app/v1/webhooks \
  -H "Authorization: Bearer hr_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint_id": "ep_abc123",
    "event": "order.created",
    "data": {
      "order_id": "12345",
      "amount": 99.99,
      "currency": "USD"
    }
  }'
```

Response:
```json
{
  "id": "wh_xyz789",
  "status": "pending",
  "event": "order.created",
  "created_at": "2026-05-15T00:00:00Z"
}
```

## 5. Check Delivery Status (1 minute)

Go to **Deliveries** in the dashboard. You'll see your webhook status:

- ✅ **Delivered** — Successfully delivered
- ⏳ **Pending** — Awaiting delivery
- ❌ **Failed** — Delivery failed (automatic retry in progress)

---

## What's Next?

- **[SDK Examples](SDK_EXAMPLES.md)** — Use official SDKs for your language
- **[API Reference](api-reference.md)** — Full API documentation
- **[Architecture](ARCHITECTURE.md)** — How HookSniff works under the hood
- **[Deployment Guide](DEPLOYMENT.md)** — Deploy to production

## Need Help?

- Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
- Open a [GitHub Issue](https://github.com/servetarslan02/HookSniff/issues)
- Email: hello@hooksniff.com
