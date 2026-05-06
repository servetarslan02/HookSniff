# HookRelay Java SDK

Official Java client for the [HookRelay](https://hookrelay.io) webhook delivery service.

## Installation

### Maven

```xml
<dependency>
    <groupId>com.hookrelay</groupId>
    <artifactId>hookrelay-sdk</artifactId>
    <version>0.1.0</version>
</dependency>
```

### Gradle

```groovy
implementation 'com.hookrelay:hookrelay-sdk:0.1.0'
```

## Quick Start

```java
import com.hookrelay.*;
import java.util.*;

// Initialize client
HookRelayClient client = new HookRelayClient("hr_live_your_api_key_here");

// Create a webhook endpoint
Endpoint endpoint = client.endpoints().create(
    "https://myapp.com/webhook",
    "Order notifications"
);
System.out.println("Endpoint created: " + endpoint.getId());

// Send a webhook
Map<String, Object> data = new HashMap<>();
data.put("orderId", "12345");
data.put("amount", 99.99);

Delivery delivery = client.webhooks().send(
    endpoint.getId(),
    "order.created",
    data
);
System.out.println("Delivery queued: " + delivery.getId() + ", status: " + delivery.getStatus());

// Check delivery status
Delivery status = client.webhooks().get(delivery.getId());
System.out.println("Status: " + status.getStatus() + ", attempts: " + status.getAttemptCount());

// List deliveries
DeliveryList deliveries = client.webhooks().list("failed", 1, 20);
for (Delivery d : deliveries.getDeliveries()) {
    System.out.println("  " + d.getId() + ": " + d.getStatus());
}

// Replay a failed delivery
Delivery replayed = client.webhooks().replay(delivery.getId());
System.out.println("Replay queued: " + replayed.getId());
```

## Batch Webhooks

Send multiple webhooks in a single request (max 100):

```java
List<Map<String, Object>> webhooks = new ArrayList<>();

Map<String, Object> wh1 = new HashMap<>();
wh1.put("endpoint_id", "ep_1");
wh1.put("event", "order.created");
wh1.put("data", Map.of("orderId", "12345"));
webhooks.add(wh1);

Map<String, Object> wh2 = new HashMap<>();
wh2.put("endpoint_id", "ep_2");
wh2.put("event", "payment.completed");
wh2.put("data", Map.of("paymentId", "pay_67890"));
webhooks.add(wh2);

BatchResult results = client.webhooks().batch(webhooks);
System.out.println("Delivered: " + results.getDeliveries().size());
System.out.println("Errors: " + results.getErrors().size());
```

## Retry Policy

Configure custom retry behavior when creating endpoints:

```java
RetryPolicy policy = new RetryPolicy();
policy.setMaxAttempts(5);
policy.setBackoff("exponential");
policy.setInitialDelaySecs(10);
policy.setMaxDelaySecs(3600);

Endpoint endpoint = client.endpoints().create(
    "https://myapp.com/webhook",
    "Critical notifications",
    policy
);
```

## Delivery Attempts

Inspect individual delivery attempts:

```java
List<DeliveryAttempt> attempts = client.webhooks().attempts(delivery.getId());
for (DeliveryAttempt attempt : attempts) {
    System.out.printf("  Attempt %d: status=%d, duration=%dms%n",
        attempt.getAttemptNumber(), attempt.getStatusCode(), attempt.getDurationMs());
    if (attempt.getErrorMessage() != null) {
        System.out.println("    Error: " + attempt.getErrorMessage());
    }
}
```

## Signature Verification

Verify incoming webhook signatures in your handler:

```java
import com.hookrelay.WebhookVerification;

// Simple verification
boolean valid = WebhookVerification.verifySignature(
    payload,
    request.getHeader("X-Hookrelay-Signature"),
    "whsec_your_endpoint_signing_secret"
);

if (!valid) {
    response.setStatus(401);
    response.getWriter().write("{\"error\": \"Invalid signature\"}");
    return;
}
```

### Standard Webhooks Verification

```java
WebhookVerification.VerificationResult result = WebhookVerification.verifyWebhook(
    payload,
    request.getHeader("webhook-id"),
    request.getHeader("webhook-timestamp"),
    request.getHeader("webhook-signature"),
    "whsec_..."
);

if (!result.isValid()) {
    response.setStatus(401);
    response.getWriter().write("{\"error\": \"" + result.getError() + "\"}");
    return;
}

// result.getPayload() contains the parsed payload
```

## Error Handling

```java
import com.hookrelay.HookRelayException.*;

try {
    Delivery delivery = client.webhooks().send("nonexistent", null, Map.of("test", true));
} catch (HookRelayException.AuthenticationException e) {
    System.out.println("Invalid API key");
} catch (HookRelayException.NotFoundException e) {
    System.out.println("Endpoint not found");
} catch (HookRelayException.RateLimitException e) {
    System.out.println("Rate limit exceeded - try again later");
} catch (HookRelayException.ValidationException e) {
    System.out.println("Invalid request: " + e.getMessage());
} catch (HookRelayException.PayloadTooLargeException e) {
    System.out.println("Payload exceeds maximum size");
}
```

## API Reference

### `new HookRelayClient(apiKey)`

| Constructor | Description |
|-------------|-------------|
| `HookRelayClient(String apiKey)` | Default config |
| `HookRelayClient(String apiKey, String baseUrl, int timeout)` | Custom config |

### `client.endpoints()`

- `.create(url, description)` → `Endpoint`
- `.create(url, description, retryPolicy)` → `Endpoint`
- `.get(endpointId)` → `Endpoint`
- `.list()` → `List<Endpoint>`
- `.delete(endpointId)` → `boolean`

### `client.webhooks()`

- `.send(endpointId, event, data)` → `Delivery`
- `.get(deliveryId)` → `Delivery`
- `.list(status, page, perPage)` → `DeliveryList`
- `.replay(deliveryId)` → `Delivery`
- `.batch(webhooks)` → `BatchResult`
- `.attempts(deliveryId)` → `List<DeliveryAttempt>`
- `.export(format, status, dateFrom, dateTo)` → `List<Delivery>`

### `WebhookVerification.verifySignature(payload, signature, secret)` → `boolean`

### `WebhookVerification.verifyWebhook(...)` → `VerificationResult`

## License

MIT
