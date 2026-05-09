# Integration Examples

## Stripe → Slack

Forward Stripe payment events to Slack.

```bash
# 1. Create endpoint pointing to Slack incoming webhook
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints \
  -H "Authorization: Bearer $HOOKSNIFF_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK", "description": "Stripe → Slack"}'

# 2. In your Stripe webhook handler, forward to HookSniff
# (Your app receives Stripe webhook, then sends to HookSniff)
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \
  -H "Authorization: Bearer $HOOKSNIFF_KEY" \
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
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints \
  -H "Authorization: Bearer $HOOKSNIFF_KEY" \
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
  const msgId = req.headers['webhook-id'];
  const timestamp = req.headers['webhook-timestamp'];
  const signature = req.headers['webhook-signature'];
  if (!signature || !msgId || !timestamp) return false;

  // Check timestamp (reject if older than 5 minutes)
  const age = Math.abs(Date.now() / 1000 - parseInt(timestamp));
  if (age > 300) return false;

  // Decode secret
  const secretBytes = Buffer.from(WEBHOOK_SECRET.replace('whsec_', ''), 'base64');

  // Compute expected signature
  const signedContent = `${msgId}.${timestamp}.${JSON.stringify(req.body)}`;
  const expected = 'v1,' + crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');

  // Verify (may have multiple space-separated signatures)
  const sigs = signature.split(' ');
  return sigs.some(sig => sig === expected);
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

def verify_webhook(request) -> bool:
    import base64, time
    msg_id = request.headers.get('webhook-id', '')
    timestamp = request.headers.get('webhook-timestamp', '')
    signature = request.headers.get('webhook-signature', '')
    if not all([msg_id, timestamp, signature]):
        return False

    # Check timestamp (reject if older than 5 minutes)
    age = abs(time.time() - int(timestamp))
    if age > 300:
        return False

    # Decode secret
    secret_bytes = base64.b64decode(WEBHOOK_SECRET.replace('whsec_', ''))

    # Compute expected signature
    payload = request.get_data(as_text=True)
    signed_content = f"{msg_id}.{timestamp}.{payload}"
    expected = 'v1,' + base64.b64encode(
        hmac.new(secret_bytes, signed_content.encode(), hashlib.sha256).digest()
    ).decode()

    # Verify (may have multiple space-separated signatures)
    return any(
        hmac.compare_digest(sig.strip(), expected)
        for sig in signature.split(' ')
        if sig.strip()
    )

@app.route('/webhook', methods=['POST'])
def handle_webhook():
    if not verify_webhook(request):
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
