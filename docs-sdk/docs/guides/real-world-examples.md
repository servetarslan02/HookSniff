---
sidebar_position: 6
---

# Real-World Examples

Production webhook patterns you can copy and adapt.

## E-Commerce: Order Lifecycle

```javascript
// Create endpoints for each system
const warehouse = await hs.endpoint.create({
  url: 'https://warehouse.myapp.com/webhook',
  description: 'Warehouse notifications',
  event_types: ['order.created', 'order.paid', 'order.cancelled'],
});

const accounting = await hs.endpoint.create({
  url: 'https://accounting.myapp.com/webhook',
  description: 'Accounting system',
  event_types: ['order.paid', 'order.refunded'],
});

// Send event — HookSniff delivers to all matching endpoints
await hs.message.create({
  event: 'order.created',
  data: {
    order_id: 'ORD-12345',
    items: [{ sku: 'WIDGET-001', qty: 2, price: 29.99 }],
    total: 59.98,
  },
});
```

## CI/CD: Deploy Pipeline

```javascript
// GitHub webhook handler — forward to HookSniff
app.post('/github-webhook', async (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;

  if (event === 'push' && payload.ref === 'refs/heads/main') {
    await hs.message.create({
      event: 'push.main',
      data: {
        repo: payload.repository.full_name,
        sha: payload.after,
        author: payload.sender.login,
        message: payload.head_commit.message,
      },
    });
  }

  res.status(200).send('OK');
});
```

## Multi-Channel Notifications

```javascript
// Same event → multiple channels
const channels = {
  slack: await hs.endpoint.create({
    url: 'https://hooks.slack.com/services/YOUR/WEBHOOK',
    event_types: ['alert.*'],
  }),
  email: await hs.endpoint.create({
    url: 'https://email-service.myapp.com/webhook',
    event_types: ['alert.critical'],
  }),
  sms: await hs.endpoint.create({
    url: 'https://sms-service.myapp.com/webhook',
    event_types: ['alert.critical'],
  }),
};

// Send — delivered to all matching endpoints
await hs.message.create({
  event: 'alert.critical',
  data: { title: 'DB connection pool exhausted', severity: 'critical' },
});
```

## Multi-Tenant Webhooks

```javascript
// Customer registers their webhook
app.post('/api/webhooks/register', async (req, res) => {
  const { url, events } = req.body;

  const endpoint = await hs.endpoint.create({
    url,
    description: `Customer ${req.user.id}`,
    event_types: events,
  });

  // Return secret to customer (only shown once)
  res.json({
    endpoint_id: endpoint.id,
    signing_secret: endpoint.secret,
  });
});
```
