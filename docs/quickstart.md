# Quickstart — 5 Minutes

## 1. Get Your API Key

Sign up at [hooksniff.vercel.app](https://hooksniff.vercel.app) and get your API key.

```bash
export HOOKRELAY_KEY="hr_live_your_key_here"
```

## 2. Create an Endpoint

```bash
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints \
  -H "Authorization: Bearer $HOOKRELAY_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://myapp.com/webhook"}'
```

Save the returned `id`.

## 3. Send a Webhook

```bash
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \
  -H "Authorization: Bearer $HOOKRELAY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint_id": "ep_YOUR_ENDPOINT_ID",
    "event": "test.ping",
    "data": {"hello": "world"}
  }'
```

## 4. Check Status

```bash
curl https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks/YOUR_DELIVERY_ID \
  -H "Authorization: Bearer $HOOKRELAY_KEY"
```

## 5. Verify Signatures (Recommended)

In your webhook handler, verify the `X-HookSniff-Signature` header:

```javascript
const crypto = require('crypto');

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-hooksniff-signature'];
  const secret = 'whsec_your_endpoint_secret';

  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expected) {
    return res.status(401).send('Invalid signature');
  }

  // Process webhook
  console.log('Event:', req.body.event);
  console.log('Data:', req.body.data);

  res.status(200).send('OK');
});
```

---

That's it! Your webhooks are now delivered reliably with automatic retries.
