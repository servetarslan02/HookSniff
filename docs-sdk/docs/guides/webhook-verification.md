---
sidebar_position: 1
---

# Webhook Verification

Every webhook delivered by HookSniff includes a cryptographic signature. **Always verify it** before processing.

## How It Works

Each delivery includes three [Standard Webhooks](https://www.standardwebhooks.com/) headers:

| Header | Example | Purpose |
|--------|---------|---------|
| `webhook-id` | `msg_abc123` | Unique message ID |
| `webhook-timestamp` | `1716100000` | Unix timestamp (reject if > 5 min old) |
| `webhook-signature` | `v1,abc123...` | Space-separated HMAC-SHA256 signatures |

The signature is computed as:

```
signed_content = "{webhook-id}.{webhook-timestamp}.{body}"
signature = "v1," + base64(hmac_sha256(secret, signed_content))
```

## Node.js

```typescript
import { Webhook } from 'hooksniff';

const wh = new Webhook('whsec_your_signing_secret');

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const payload = wh.verify(req.body, {
      'webhook-id': req.headers['webhook-id']!,
      'webhook-timestamp': req.headers['webhook-timestamp']!,
      'webhook-signature': req.headers['webhook-signature']!,
    });
    console.log('Event:', payload.event);
    res.status(200).send('OK');
  } catch (err) {
    res.status(401).send('Invalid signature');
  }
});
```

## Python

```python
from hooksniff import Webhook

wh = Webhook("whsec_your_signing_secret")

@app.route("/webhook", methods=["POST"])
def handle_webhook():
    try:
        payload = wh.verify(
            request.data,
            {
                "webhook-id": request.headers["webhook-id"],
                "webhook-timestamp": request.headers["webhook-timestamp"],
                "webhook-signature": request.headers["webhook-signature"],
            },
        )
        print(f"Event: {payload['event']}")
        return "", 200
    except Exception:
        return "Invalid signature", 401
```

## Go

```go
wh, _ := hooksniff.NewWebhook("whsec_your_signing_secret")

func handleWebhook(w http.ResponseWriter, r *http.Request) {
    payload, err := wh.Verify(r.Body, r.Header)
    if err != nil {
        w.WriteHeader(401)
        w.Write([]byte("Invalid signature"))
        return
    }
    fmt.Printf("Event: %s\n", payload.Event)
    w.WriteHeader(200)
}
```

## Key Rotation

When you rotate a signing secret, HookSniff sends **both** old and new signatures (space-separated). Your code should verify that **at least one** matches:

```
webhook-signature: v1,old_signature v1,new_signature
```

## Security Tips

- ✅ Always use HTTPS for your webhook endpoint
- ✅ Use constant-time comparison (all SDKs do this automatically)
- ✅ Reject webhooks older than 5 minutes
- ✅ Rotate secrets periodically
- ✅ Return 2xx quickly, process asynchronously
- ❌ Never log signing secrets
