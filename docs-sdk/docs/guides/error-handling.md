---
sidebar_position: 2
---

# Error Handling

## API Error Codes

| Code | Meaning | SDK Behavior |
|------|---------|--------------|
| 400 | Bad Request | Validation error with details |
| 401 | Unauthorized | Authentication error |
| 404 | Not Found | Resource not found error |
| 429 | Rate Limited | Auto-retries after `Retry-After` header |
| 500 | Server Error | Auto-retries up to 2 times |

## Node.js

```typescript
import { HttpError, ValidationError } from 'hooksniff';

try {
  await hs.endpoint.create({ url: 'invalid' });
} catch (err) {
  if (err instanceof HttpError) {
    console.error(`HTTP ${err.statusCode}: ${err.message}`);
    if (err.statusCode === 429) {
      const retryAfter = err.headers['retry-after'];
      await new Promise(r => setTimeout(r, retryAfter * 1000));
    }
  } else if (err instanceof ValidationError) {
    console.error('Validation:', err.errors);
  }
}
```

## Python

```python
from hooksniff.exceptions import HttpError, ValidationError

try:
    hs.endpoint.create(url="invalid")
except HttpError as e:
    print(f"HTTP {e.status_code}: {e.message}")
except ValidationError as e:
    print(f"Validation: {e.errors}")
```

## Go

```go
endpoint, err := hs.Endpoint.Create(ctx, &hooksniff.EndpointIn{Url: "invalid"})
if err != nil {
    var httpErr *hooksniff.HttpError
    if errors.As(err, &httpErr) {
        fmt.Printf("HTTP %d: %s\n", httpErr.StatusCode, httpErr.Message)
    }
}
```

## Webhook Delivery Errors

When HookSniff delivers to **your** endpoint:

| Your Response | HookSniff Action |
|---------------|------------------|
| 2xx | ✅ Success |
| 4xx (except 429) | ❌ No retry — your client error |
| 429 | 🔄 Retry after `Retry-After` header |
| 5xx | 🔄 Retry with exponential backoff |
| Timeout (30s) | 🔄 Retry |
| Connection refused | 🔄 Retry |

## Best Practices

1. **Return 200 immediately** — process asynchronously
2. **Verify signature first** — reject invalid signatures with 401
3. **Use idempotency keys** — the `webhook-id` header is unique per delivery
4. **Log everything** — webhook-id, timestamp, event type
5. **Handle retries** — your handler may be called multiple times
6. **Respond within 30 seconds** — HookSniff times out after 30s
