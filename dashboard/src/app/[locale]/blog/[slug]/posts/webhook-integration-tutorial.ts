import type { Post } from '.../data';

export const post: Post = {
    title: 'Complete Webhook Integration Tutorial: From Zero to Production',
    date: '2026-05-07',
    category: 'Engineering',
    readTime: '12 min',
    tags: ['tutorial', 'getting-started', 'integration'],
    author: 'HookSniff Team',
    content: `This tutorial walks you through integrating HookSniff into your application from scratch. By the end, you will have a production-ready webhook setup with signature verification, error handling, and monitoring.

### Step 1: Sign Up and Get Your API Key

1. Go to [hooksniff.vercel.app](https://hooksniff.vercel.app)
2. Create an account (email + password, no credit card required)
3. Navigate to Settings → API Keys
4. Create a new API key and copy it — you will need it for all SDK calls

Your free tier includes 10,000 webhooks per month.

### Step 2: Install the SDK

Choose your language:

**Node.js:**
\`\`\`bash
npm install @hooksniff/node
\`\`\`

**Python:**
\`\`\`bash
pip install hooksniff
\`\`\`

**Go:**
\`\`\`bash
go get github.com/hooksniff/hooksniff-go
\`\`\`

### Step 3: Create an Endpoint

An endpoint is a URL where HookSniff delivers webhooks. This is your server.

\`\`\`typescript

const client = new HookSniff({
  apiKey: process.env.HOOKSNIFF_API_KEY,
});

const endpoint = await client.endpoints.create({
  url: 'https://your-app.com/webhooks/hooksniff',
  description: 'Production webhook receiver',
  events: ['order.created', 'order.paid', 'order.shipped'],
});

console.log('Endpoint created:', endpoint.id);
// Output: Endpoint created: ep_abc123xyz
\`\`\`

\`\`\`python
from hooksniff import HookSniff

client = HookSniff(api_key="hs_...")

endpoint = client.endpoints.create(
    url="https://your-app.com/webhooks/hooksniff",
    description="Production webhook receiver",
    events=["order.created", "order.paid", "order.shipped"],
)

print(f"Endpoint created: {endpoint.id}")
\`\`\`

### Step 4: Send a Webhook

Now send your first webhook to test the integration:

\`\`\`typescript
const delivery = await client.webhooks.send({
  endpointId: endpoint.id,
  eventType: 'order.created',
  payload: {
    order_id: 'ord_12345',
    customer_email: 'customer@example.com',
    amount: 99.99,
    currency: 'USD',
    items: [
      { sku: 'WIDGET-001', quantity: 2, price: 49.99 },
    ],
  },
});

console.log('Delivery ID:', delivery.id);
\`\`\`

### Step 5: Receive and Verify Webhooks

On your server, receive the webhook and verify the HMAC signature. This is critical — never process an unverified webhook.

**Node.js (Express):**
\`\`\`typescript
import express from 'express';
import crypto from 'crypto';

const app = express();
const WEBHOOK_SECRET = process.env.HOOKSNIFF_WEBHOOK_SECRET;

app.post('/webhooks/hooksniff', express.raw({ type: 'application/json' }), (req, res) => {
  // 1. Extract signature header
  const signature = req.headers['x-hooksniff-signature'];
  const timestamp = req.headers['x-hooksniff-timestamp'];

  if (!signature || !timestamp) {
    return res.status(401).json({ error: 'Missing signature headers' });
  }

  // 2. Reject old timestamps (replay protection)
  const age = Math.abs(Date.now() / 1000 - parseInt(timestamp));
  if (age > 300) {  // 5 minutes
    return res.status(401).json({ error: 'Timestamp too old' });
  }

  // 3. Compute expected signature
  const payload = \`\${timestamp}.\${req.body}\`;
  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('base64');

  // 4. Compare signatures (constant-time)
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 5. Process the webhook
  const event = JSON.parse(req.body);
  handleWebhook(event);

  // 6. Respond quickly
  res.status(200).json({ received: true });
});
\`\`\`

**Python (Flask):**
\`\`\`python
import hmac
import hashlib
import time
from flask import Flask, request, jsonify

app = Flask(__name__)
WEBHOOK_SECRET = os.environ['HOOKSNIFF_WEBHOOK_SECRET']

@app.route('/webhooks/hooksniff', methods=['POST'])
def handle_webhook():
    # 1. Extract signature
    signature = request.headers.get('X-HookSniff-Signature')
    timestamp = request.headers.get('X-HookSniff-Timestamp')

    if not signature or not timestamp:
        return jsonify({'error': 'Missing headers'}), 401

    # 2. Replay protection
    if abs(time.time() - int(timestamp)) > 300:
        return jsonify({'error': 'Timestamp too old'}), 401

    # 3. Verify signature
    payload = f"{timestamp}.{request.data.decode()}"
    expected = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature, expected):
        return jsonify({'error': 'Invalid signature'}), 401

    # 4. Process
    event = request.json
    handle_event(event)

    return jsonify({'received': True}), 200
\`\`\`

### Step 6: Handle Errors and Retries

HookSniff retries failed deliveries with exponential backoff. Your endpoint should be idempotent — processing the same webhook twice should be safe.

\`\`\`typescript
const processedEvents = new Set();

async function handleWebhook(event: any) {
  // Idempotency check
  if (processedEvents.has(event.delivery_id)) {
    console.log('Already processed:', event.delivery_id);
    return;
  }

  try {
    switch (event.event_type) {
      case 'order.created':
        await processNewOrder(event.payload);
        break;
      case 'order.paid':
        await fulfillOrder(event.payload);
        break;
      case 'order.shipped':
        await notifyCustomer(event.payload);
        break;
      default:
        console.log('Unknown event type:', event.event_type);
    }

    processedEvents.add(event.delivery_id);
  } catch (error) {
    console.error('Webhook processing failed:', error);
    throw error;  // Trigger HookSniff retry
  }
}
\`\`\`

### Step 7: Monitor the Dashboard

The HookSniff dashboard gives you real-time visibility into every delivery:

- **Delivery log** — Every webhook with timestamp, status, payload, and response
- **Success rate** — Percentage of successful deliveries over time
- **Latency** — P50, P95, P99 delivery latency
- **Error breakdown** — Top error codes and failing endpoints
- **Dead letter queue** — Failed deliveries available for replay

Visit your dashboard at hooksniff.vercel.app/dashboard after sending your first webhook.

### Step 8: Set Up Alerts

Configure alerts so you know when something goes wrong:

\`\`\`typescript
await client.alerts.create({
  endpointId: endpoint.id,
  conditions: [
    { metric: 'success_rate', operator: 'lt', threshold: 99 },
    { metric: 'p99_latency', operator: 'gt', threshold: 5000 },
  ],
  channels: [
    { type: 'email', address: 'oncall@your-app.com' },
    { type: 'slack', webhook_url: 'https://hooks.slack.com/...' },
  ],
});
\`\`\`

### Production Checklist

Before going live, verify:

- ✅ HMAC signature verification is implemented
- ✅ Timestamp validation prevents replay attacks
- ✅ Endpoint responds within 5 seconds
- ✅ Processing is idempotent (safe to receive duplicates)
- ✅ Errors are thrown to trigger retries
- ✅ Dashboard monitoring is set up
- ✅ Alerts are configured for success rate and latency
- ✅ Dead letter queue is reviewed periodically

### Common Pitfalls

1. **Not verifying signatures** — Always verify. Never trust raw webhook payloads.
2. **Processing synchronously** — Respond 200 immediately, process in background.
3. **Ignoring the dead letter queue** — Check it weekly. Failed events are clues.
4. **Not using idempotency keys** — Webhooks can be delivered more than once.
5. **Hardcoding the webhook secret** — Use environment variables.

That is it! You now have a production-ready webhook integration. The SDKs handle the hard parts — you focus on your business logic.`,
};
