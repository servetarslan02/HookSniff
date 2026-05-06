# HookRelay C# SDK

Official C# client for the [HookRelay](https://hookrelay.io) webhook delivery service.

## Installation

### NuGet

```bash
dotnet add package HookRelay
```

### From source

```bash
cd sdks/csharp
dotnet build
```

## Quick Start

```csharp
using HookRelay;

// Initialize client
var client = new HookRelayClient("hr_live_your_api_key_here");

// Create a webhook endpoint
var endpoint = await client.Endpoints.CreateAsync(
    "https://myapp.com/webhook",
    "Order notifications"
);
Console.WriteLine($"Endpoint created: {endpoint.Id}");

// Send a webhook
var delivery = await client.Webhooks.SendAsync(
    endpoint.Id,
    "order.created",
    new Dictionary<string, object>
    {
        ["orderId"] = "12345",
        ["amount"] = 99.99
    }
);
Console.WriteLine($"Delivery queued: {delivery.Id}, status: {delivery.Status}");

// Check delivery status
var status = await client.Webhooks.GetAsync(delivery.Id);
Console.WriteLine($"Status: {status.Status}, attempts: {status.AttemptCount}");

// List deliveries
var deliveries = await client.Webhooks.ListAsync("failed", 1, 20);
foreach (var d in deliveries.Deliveries)
{
    Console.WriteLine($"  {d.Id}: {d.Status}");
}

// Replay a failed delivery
var replayed = await client.Webhooks.ReplayAsync(delivery.Id);
Console.WriteLine($"Replay queued: {replayed.Id}");
```

## Batch Webhooks

Send multiple webhooks in a single request (max 100):

```csharp
var webhooks = new List<Dictionary<string, object>>
{
    new()
    {
        ["endpoint_id"] = "ep_1",
        ["event"] = "order.created",
        ["data"] = new Dictionary<string, object> { ["orderId"] = "12345" }
    },
    new()
    {
        ["endpoint_id"] = "ep_2",
        ["event"] = "payment.completed",
        ["data"] = new Dictionary<string, object> { ["paymentId"] = "pay_67890" }
    }
};

var results = await client.Webhooks.BatchAsync(webhooks);
Console.WriteLine($"Delivered: {results.Deliveries.Count}");
Console.WriteLine($"Errors: {results.Errors.Count}");
```

## Retry Policy

Configure custom retry behavior when creating endpoints:

```csharp
var endpoint = await client.Endpoints.CreateAsync(
    "https://myapp.com/webhook",
    "Critical notifications",
    new RetryPolicy
    {
        MaxAttempts = 5,
        Backoff = "exponential",
        InitialDelaySecs = 10,
        MaxDelaySecs = 3600
    }
);
```

## Delivery Attempts

Inspect individual delivery attempts:

```csharp
var attempts = await client.Webhooks.AttemptsAsync(delivery.Id);
foreach (var attempt in attempts)
{
    Console.WriteLine($"  Attempt {attempt.AttemptNumber}: status={attempt.StatusCode}, " +
                      $"duration={attempt.DurationMs}ms");
    if (attempt.ErrorMessage != null)
    {
        Console.WriteLine($"    Error: {attempt.ErrorMessage}");
    }
}
```

## Signature Verification

Verify incoming webhook signatures in your handler:

```csharp
using HookRelay;

// Simple verification
var payload = await new StreamReader(request.Body).ReadToEndAsync();
var signature = request.Headers["X-Hookrelay-Signature"].ToString();
var secret = "whsec_your_endpoint_signing_secret";

if (!WebhookVerification.VerifySignature(payload, signature, secret))
{
    response.StatusCode = 401;
    await response.WriteAsJsonAsync(new { error = "Invalid signature" });
    return;
}
```

### Standard Webhooks Verification

```csharp
var result = WebhookVerification.VerifyWebhook(
    payload,
    request.Headers["webhook-id"],
    request.Headers["webhook-timestamp"],
    request.Headers["webhook-signature"],
    "whsec_..."
);

if (!result.Valid)
{
    response.StatusCode = 401;
    await response.WriteAsJsonAsync(new { error = result.Error });
    return;
}

// result.Payload contains the parsed payload
```

## Error Handling

```csharp
using HookRelay;

try
{
    var delivery = await client.Webhooks.SendAsync("nonexistent",
        "test.event", new Dictionary<string, object> { ["test"] = true });
}
catch (AuthenticationException)
{
    Console.WriteLine("Invalid API key");
}
catch (NotFoundException)
{
    Console.WriteLine("Endpoint not found");
}
catch (RateLimitException)
{
    Console.WriteLine("Rate limit exceeded - try again later");
}
catch (ValidationException ex)
{
    Console.WriteLine($"Invalid request: {ex.Message}");
}
catch (PayloadTooLargeException)
{
    Console.WriteLine("Payload exceeds maximum size");
}
```

## API Reference

### `new HookRelayClient(apiKey)` / `new HookRelayClient(config)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ApiKey` | `string` | required | Your HookRelay API key |
| `BaseUrl` | `string` | `https://api.hookrelay.io/v1` | API base URL |
| `Timeout` | `int` | `30` | Request timeout in seconds |

### `client.Endpoints`

- `CreateAsync(url, description?, retryPolicy?)` → `Task<Endpoint>`
- `GetAsync(endpointId)` → `Task<Endpoint>`
- `ListAsync()` → `Task<List<Endpoint>>`
- `DeleteAsync(endpointId)` → `Task<bool>`

### `client.Webhooks`

- `SendAsync(endpointId, event?, data?)` → `Task<Delivery>`
- `GetAsync(deliveryId)` → `Task<Delivery>`
- `ListAsync(status?, page?, perPage?)` → `Task<DeliveryList>`
- `ReplayAsync(deliveryId)` → `Task<Delivery>`
- `BatchAsync(webhooks)` → `Task<BatchResult>`
- `AttemptsAsync(deliveryId)` → `Task<List<DeliveryAttempt>>`
- `ExportAsync(format?, status?, dateFrom?, dateTo?)` → `Task<List<Delivery>>`

### `WebhookVerification.VerifySignature(payload, signature, secret)` → `bool`

### `WebhookVerification.VerifyWebhook(...)` → `HookRelayVerificationResult`

## License

MIT
