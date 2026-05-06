# Integration Examples

## Stripe → Slack

Forward Stripe payment events to Slack.

```bash
# 1. Create endpoint pointing to Slack incoming webhook
curl -X POST https://api.hooksniff.is-a.dev/v1/endpoints \
  -H "Authorization: Bearer $HOOKRELAY_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK", "description": "Stripe → Slack"}'

# 2. In your Stripe webhook handler, forward to HookSniff
# (Your app receives Stripe webhook, then sends to HookSniff)
curl -X POST https://api.hooksniff.is-a.dev/v1/webhooks \
  -H "Authorization: Bearer $HOOKRELAY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint_id": "ep_YOUR_ID",
    "event": "payment.completed",
    "data": {"customer": "cus_123", "amount": 4999}
  }'
```

## GitHub → Deploy

Trigger deployments on push events.

```bash
# 1. Create endpoint for your deploy service
curl -X POST https://api.hooksniff.is-a.dev/v1/endpoints \
  -H "Authorization: Bearer $HOOKRELAY_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://deploy.myapp.com/api/trigger", "description": "GitHub push → Deploy"}'

# 2. GitHub webhook sends to HookSniff → HookSniff delivers to your deploy service
```

## Node.js Handler

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const WEBHOOK_SECRET = 'whsec_your_endpoint_secret';

function verifySignature(req) {
  const signature = req.headers['x-hooksniff-signature'];
  if (!signature) return false;

  const expected = 'sha256=' + crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

app.post('/webhook', (req, res) => {
  if (!verifySignature(req)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { event, data } = req.body;
  console.log(`Received event: ${event}`, data);

  // Process based on event type
  switch (event) {
    case 'order.created':
      // Handle new order
      break;
    case 'payment.completed':
      // Handle payment
      break;
    default:
      console.log(`Unknown event: ${event}`);
  }

  res.status(200).json({ received: true });
});

app.listen(3000, () => console.log('Webhook handler running on :3000'));
```

## Python Handler

```python
import hmac
import hashlib
from flask import Flask, request, jsonify

app = Flask(__name__)
WEBHOOK_SECRET = 'whsec_your_endpoint_secret'

def verify_signature(payload: str, signature: str) -> bool:
    expected = 'sha256=' + hmac.new(
        WEBHOOK_SECRET.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)

@app.route('/webhook', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-HookSniff-Signature', '')
    if not verify_signature(request.get_data(as_text=True), signature):
        return jsonify({'error': 'Invalid signature'}), 401

    data = request.json
    event = data.get('event')
    payload = data.get('data')

    print(f"Received event: {event}")
    # Process webhook here

    return jsonify({'received': True}), 200

if __name__ == '__main__':
    app.run(port=3000)
```
