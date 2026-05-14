---
sidebar_position: 1
---

# Webhook Signature Verification

All HookSniff webhooks are signed using **HMAC-SHA256** following the [Standard Webhooks](https://github.com/standard-webhooks/standard-webhooks) specification.

## How It Works

When HookSniff sends a webhook to your endpoint, it includes three headers:

| Header | Description |
|--------|-------------|
| `webhook-id` | Unique message ID |
| `webhook-timestamp` | Unix timestamp |
| `webhook-signature` | `v1,<base64-hmac>` |

Your server computes an HMAC-SHA256 signature using `{id}.{timestamp}.{body}` and compares it against the provided signature.

## Secret Format

Signing secrets start with `whsec_` followed by a base64-encoded key:

```
whsec_dGVzdHNlY3JldGtleWZvcmhvb2tzbmlmZg==
```

## Verification by Language

### Node.js

```javascript
const { Webhook } = require('hooksniff-sdk');

const webhook = new Webhook(process.env.WEBHOOK_SECRET);

// In your Express handler:
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const isValid = webhook.verify(req.body, {
    'webhook-id': req.headers['webhook-id'],
    'webhook-timestamp': req.headers['webhook-timestamp'],
    'webhook-signature': req.headers['webhook-signature'],
  });
  // ...
});
```

### Python

```python
from hooksniff import Webhook

webhook = Webhook(secret="whsec_...")

# In your Flask handler:
@app.route('/webhook', methods=['POST'])
def handle_webhook():
    payload = webhook.verify(request.data, dict(request.headers))
    # ...
```

### Go

```go
webhook, _ := hooksniff.NewWebhook("whsec_...")

// In your handler:
func handler(w http.ResponseWriter, r *http.Request) {
    body, _ := io.ReadAll(r.Body)
    err := webhook.Verify(body, map[string]string{
        "webhook-id":        r.Header.Get("webhook-id"),
        "webhook-timestamp": r.Header.Get("webhook-timestamp"),
        "webhook-signature": r.Header.Get("webhook-signature"),
    })
    // ...
}
```

### Rust

```rust
use hooksniff::webhook;
use std::collections::HashMap;

let mut headers = HashMap::new();
headers.insert("webhook-id".to_string(), msg_id);
headers.insert("webhook-timestamp".to_string(), timestamp);
headers.insert("webhook-signature".to_string(), signature);

webhook::verify_signature("whsec_...", &payload, &headers)?;
```

### Ruby

```ruby
webhook = HookSniff::Webhook.new("whsec_...")

# In your Sinatra/Rails handler:
post '/webhook' do
  payload = webhook.verify(request.body.read, {
    'webhook-id' => request.env['HTTP_WEBHOOK_ID'],
    'webhook-timestamp' => request.env['HTTP_WEBHOOK_TIMESTAMP'],
    'webhook-signature' => request.env['HTTP_WEBHOOK_SIGNATURE'],
  })
end
```

### Java

```java
WebhookVerifier verifier = new WebhookVerifier("whsec_...");

// In your handler:
verifier.verify(payload, headers);
```

## Security Notes

1. **Always verify signatures** — never process unverified webhooks
2. **Timestamp tolerance** — 5 minutes by default; reject old timestamps
3. **Timing-safe comparison** — prevents timing attacks
4. **Multiple signatures** — space-separated for key rotation support
5. **Use HTTPS** — webhooks should only be received over HTTPS
