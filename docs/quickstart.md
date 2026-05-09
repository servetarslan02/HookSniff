# Quickstart — 5 Minutes

## 1. Get Your API Key

Sign up at [hooksniff.vercel.app](https://hooksniff.vercel.app) and get your API key.

```bash
export HOOKSNIFF_KEY="hr_live_your_key_here"
```

## 2. Create an Endpoint

```bash
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints \
  -H "Authorization: Bearer $HOOKSNIFF_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://myapp.com/webhook"}'
```

Save the returned `id`.

## 3. Send a Webhook

```bash
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \
  -H "Authorization: Bearer $HOOKSNIFF_KEY" \
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
  -H "Authorization: Bearer $HOOKSNIFF_KEY"
```

## 5. Verify Signatures (Recommended)

HookSniff uses [Standard Webhooks](https://www.standardwebhooks.com/) signatures. Verify the `webhook-signature` header:

```javascript
const crypto = require('crypto');

app.post('/webhook', (req, res) => {
  const msgId = req.headers['webhook-id'];
  const timestamp = req.headers['webhook-timestamp'];
  const signature = req.headers['webhook-signature'];
  const secret = 'whsec_your_endpoint_secret';

  // Decode secret
  const secretBytes = Buffer.from(secret.replace('whsec_', ''), 'base64');

  // Compute expected signature
  const signedContent = `${msgId}.${timestamp}.${JSON.stringify(req.body)}`;
  const expected = 'v1,' + crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');

  // Verify signature (may have multiple, space-separated)
  const sigs = signature.split(' ');
  const valid = sigs.some(sig => sig === expected);

  if (!valid) {
    return res.status(401).send('Invalid signature');
  }

  // Check timestamp (reject if older than 5 minutes)
  const age = Math.abs(Date.now() / 1000 - parseInt(timestamp));
  if (age > 300) {
    return res.status(401).send('Timestamp expired');
  }

  // Process webhook
  console.log('Event:', req.body.event);
  console.log('Data:', req.body.data);

  res.status(200).send('OK');
});
```

---

That's it! Your webhooks are now delivered reliably with automatic retries.
