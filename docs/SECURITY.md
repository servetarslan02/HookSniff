# Security — Webhook Signature Verification & Replay Protection

## Standard Webhooks Signature

HookSniff follows the [Standard Webhooks](https://www.standardwebhooks.com/) specification for signature verification.

### Headers

Every webhook delivery includes these headers:

| Header | Description |
|--------|-------------|
| `webhook-id` | Unique delivery ID |
| `webhook-timestamp` | Unix timestamp (seconds) |
| `webhook-signature` | `v1,<base64(hmac)>` signature |

Legacy headers are also included for backward compatibility:
- Legacy header — use Standard Webhooks headers instead
- `webhook-id`: Same as `webhook-id`
- `webhook-attempt`: Attempt number

### Signature Computation

The signature is computed as:

```
signed_content = "{webhook_id}.{webhook_timestamp}.{body}"
signature = "v1," + base64(hmac_sha256(secret, signed_content))
```

The secret is base64-encoded with a `whsec_` prefix. Decode it before computing the HMAC:

```python
import base64, hmac, hashlib

def verify_signature(secret, msg_id, timestamp, signature_header, body):
    # Decode secret
    if secret.startswith("whsec_"):
        secret_bytes = base64.b64decode(secret[6:])
    else:
        secret_bytes = secret.encode()

    # Compute expected signature
    signed_content = f"{msg_id}.{timestamp}.{body}"
    expected = hmac.new(secret_bytes, signed_content.encode(), hashlib.sha256).digest()
    expected_sig = "v1," + base64.b64encode(expected).decode()

    # Compare (may have multiple signatures separated by spaces)
    return any(
        hmac.compare_digest(expected_sig, sig.strip())
        for sig in signature_header.split(" ")
        if sig.strip()
    )
```

### Replay Protection (±5 Minutes)

**Webhook timestamps older than 5 minutes should be rejected.** This prevents replay attacks where an attacker captures a valid webhook and re-sends it later.

```python
import time

def check_timestamp(timestamp_str, tolerance_secs=300):
    """Reject if timestamp is older/newer than tolerance (default 5 min)."""
    ts = int(timestamp_str)
    now = int(time.time())
    age = abs(now - ts)
    if age > tolerance_secs:
        raise ValueError(f"Timestamp expired: {age}s old (max {tolerance_secs}s)")
```

### Full Verification Example (Node.js)

```javascript
const crypto = require('crypto');

function verifyWebhook(secret, headers, body) {
    const msgId = headers['webhook-id'];
    const timestamp = headers['webhook-timestamp'];
    const signature = headers['webhook-signature'];

    // 1. Check timestamp (±5 min)
    const age = Math.abs(Date.now() / 1000 - parseInt(timestamp));
    if (age > 300) {
        throw new Error(`Timestamp expired: ${age}s`);
    }

    // 2. Decode secret
    const secretBytes = secret.startsWith('whsec_')
        ? Buffer.from(secret.slice(6), 'base64')
        : Buffer.from(secret);

    // 3. Compute signature
    const signedContent = `${msgId}.${timestamp}.${body}`;
    const expected = crypto.createHmac('sha256', secretBytes)
        .update(signedContent)
        .digest('base64');
    const expectedSig = `v1,${expected}`;

    // 4. Compare (handle multiple signatures)
    const sigs = signature.split(' ');
    const valid = sigs.some(sig => {
        const parts = sig.split(',');
        return parts[0] === 'v1' && parts[1] === expected;
    });

    if (!valid) throw new Error('Signature mismatch');
    return true;
}
```

### Full Verification Example (Python)

```python
import base64, hmac, hashlib, time, json

def verify_webhook(secret: str, headers: dict, body: str) -> bool:
    msg_id = headers.get("webhook-id", "")
    timestamp = headers.get("webhook-timestamp", "")
    signature = headers.get("webhook-signature", "")

    # 1. Check timestamp (±5 min tolerance)
    age = abs(time.time() - int(timestamp))
    if age > 300:
        raise ValueError(f"Replay attack? Timestamp {age:.0f}s old")

    # 2. Decode secret
    if secret.startswith("whsec_"):
        key = base64.b64decode(secret[6:])
    else:
        key = secret.encode()

    # 3. Verify signature
    content = f"{msg_id}.{timestamp}.{body}"
    expected = base64.b64encode(
        hmac.new(key, content.encode(), hashlib.sha256).digest()
    ).decode()
    expected_sig = f"v1,{expected}"

    # 4. Check against all provided signatures
    for sig in signature.split(" "):
        if hmac.compare_digest(sig.strip(), expected_sig):
            return True
    raise ValueError("Signature verification failed")
```

## Signature Rotation

When rotating signing secrets, the old secret remains valid for 24 hours. During this window, webhooks may be signed with either the old or new secret.

### Rotation Flow

1. Call `POST /v1/endpoints/{id}/rotate-secret`
2. New secret is returned immediately
3. Old secret remains valid for 24 hours
4. Update your consumers to use the new secret
5. After 24 hours, only the new secret works

## Best Practices

1. **Always verify signatures** — Never process an unsigned webhook
2. **Always check timestamps** — Reject deliveries older than 5 minutes
3. **Use HTTPS endpoints** — HTTP endpoints expose signatures to MITM attacks
4. **Store secrets securely** — Use environment variables, not hardcoded values
5. **Rotate secrets periodically** — At least every 90 days
6. **Log verification failures** — Helps detect attacks or misconfigurations
