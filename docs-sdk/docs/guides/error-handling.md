---
sidebar_position: 1
---

# Error Handling

All HookSniff SDKs follow a consistent error handling pattern. Errors are categorized into two types:

## API Errors

API errors occur when the server returns a non-2xx response. These include:

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad Request — invalid parameters |
| 401 | Unauthorized — invalid or missing API key |
| 403 | Forbidden — insufficient permissions |
| 404 | Not Found — resource doesn't exist |
| 409 | Conflict — resource already exists |
| 422 | Unprocessable Entity — validation error |
| 429 | Too Many Requests — rate limit exceeded |
| 500 | Internal Server Error |

### Node.js

```javascript
try {
  await client.endpoints.get('nonexistent');
} catch (err) {
  if (err.name === 'ApiException') {
    console.error(`API Error ${err.code}: ${err.body}`);
  } else {
    console.error('Network error:', err.message);
  }
}
```

### Python

```python
from hooksniff import HookSniff, ApiException

try:
    hs.endpoints.get("nonexistent")
except ApiException as e:
    print(f"API Error {e.status_code}: {e.message}")
except Exception as e:
    print(f"Network error: {e}")
```

### Go

```go
endpoint, err := client.Endpoints.Get("nonexistent")
if err != nil {
    if apiErr, ok := err.(*hooksniff.ApiException); ok {
        fmt.Printf("API Error %d: %s\n", apiErr.StatusCode, apiErr.Body)
    } else {
        fmt.Printf("Network error: %v\n", err)
    }
}
```

### Java / Kotlin

```java
try {
    client.endpoints().get("nonexistent");
} catch (ApiException e) {
    System.err.println("API Error " + e.getStatusCode() + ": " + e.getBody());
} catch (Exception e) {
    System.err.println("Network error: " + e.getMessage());
}
```

### Ruby

```ruby
begin
  client.endpoints.get('nonexistent')
rescue HookSniff::ApiException => e
  puts "API Error #{e.status_code}: #{e.message}"
rescue StandardError => e
  puts "Network error: #{e.message}"
end
```

### C\#

```csharp
try {
    await client.Endpoints.GetAsync("nonexistent");
} catch (ApiException e) {
    Console.WriteLine($"API Error {e.StatusCode}: {e.Message}");
} catch (Exception e) {
    Console.WriteLine($"Network error: {e.Message}");
}
```

### PHP

```php
try {
    $client->endpoints->get('nonexistent');
} catch (\HookSniff\ApiException $e) {
    echo "API Error {$e->getStatusCode()}: {$e->getMessage()}\n";
} catch (\Exception $e) {
    echo "Network error: {$e->getMessage()}\n";
}
```

## Rate Limiting

When you receive a 429 response, the SDK will automatically retry after the `Retry-After` header duration (up to `num_retries` times). You can also handle it manually:

```python
import time
from hooksniff import ApiException

try:
    hs.webhooks.send(...)
except ApiException as e:
    if e.status_code == 429:
        retry_after = int(e.headers.get('Retry-After', 5))
        time.sleep(retry_after)
        # Retry the request
```

## Network Errors

Network errors (timeouts, DNS failures, connection refused) are thrown as generic exceptions. All SDKs support configurable timeouts and retries:

| SDK | Default Timeout | Default Retries |
|-----|----------------|-----------------|
| Node.js | 30s | 2 |
| Python | 30s | 2 |
| Go | 30s | 2 |
| Java/Kotlin | 30s | 2 |
| Ruby | 30s | 2 |
| C# | 30s | 2 |
| PHP | 30s | 2 |
