---
sidebar_position: 6
---

# Java Quick Start

## Installation

### Maven

```xml
<dependency>
    <groupId>io.github.servetarslan02</groupId>
    <artifactId>hooksniff-sdk</artifactId>
    <version>0.3.0</version>
</dependency>
```

### Gradle

```groovy
implementation 'io.github.servetarslan02:hooksniff-sdk:0.3.0'
```

## Setup

```java
import com.hooksniff.sdk.HookSniff;

// Initialize client
HookSniff client = new HookSniff("hr_live_your_api_key");

// Or with options
HookSniff client = new HookSniff("hr_live_your_api_key", 
    "https://hooksniff-api-1046140057667.europe-west1.run.app", 30000);
```

## Endpoints

```java
// List all endpoints
var endpoints = client.endpoints().list();

// Create an endpoint
var endpoint = client.endpoints().create(
    EndpointCreateInput.builder()
        .url("https://example.com/webhook")
        .description("My webhook endpoint")
        .rateLimit(100)
        .build()
);

// Get a specific endpoint
var details = client.endpoints().get(endpoint.getId());

// Update an endpoint
var updated = client.endpoints().update(endpoint.getId(),
    EndpointUpdateInput.builder()
        .url("https://new-url.com/webhook")
        .build()
);

// Delete an endpoint
client.endpoints().delete(endpoint.getId());

// Rotate signing secret
var key = client.endpoints().rotateSecret(endpoint.getId());
```

## Webhooks

```java
// Send a webhook
var delivery = client.webhooks().send(
    WebhookSendInput.builder()
        .endpointId(endpoint.getId())
        .eventType("order.created")
        .data(Map.of("order_id", "12345", "amount", 99.99))
        .build()
);

// List deliveries
var deliveries = client.webhooks().list(
    WebhookListInput.builder().status("delivered").page(1).build()
);

// Replay a delivery
client.webhooks().replay(delivery.getId());

// Batch send
var batch = client.webhooks().batch(
    WebhookBatchInput.builder()
        .endpointId(endpoint.getId())
        .events(List.of(
            WebhookEvent.builder().eventType("order.created").data(Map.of("order_id", "1")).build(),
            WebhookEvent.builder().eventType("order.created").data(Map.of("order_id", "2")).build()
        ))
        .build()
);
```

## Webhook Verification

```java
import com.hooksniff.sdk.Webhook;

Webhook webhook = new Webhook("whsec_your_signing_secret");

// In your handler
@PostMapping("/webhook")
public ResponseEntity<?> handleWebhook(HttpServletRequest request) {
    try {
        var payload = webhook.verify(
            request.getReader().lines().collect(Collectors.joining()),
            Map.of(
                "webhook-id", request.getHeader("webhook-id"),
                "webhook-timestamp", request.getHeader("webhook-timestamp"),
                "webhook-signature", request.getHeader("webhook-signature")
            )
        );
        // Payload is verified — process it
        return ResponseEntity.ok().build();
    } catch (SignatureVerificationException e) {
        return ResponseEntity.status(401).build();
    }
}
```

## Error Handling

```java
try {
    client.endpoints().get("nonexistent");
} catch (ApiException e) {
    System.err.println("API Error " + e.getStatusCode() + ": " + e.getBody());
} catch (Exception e) {
    System.err.println("Network error: " + e.getMessage());
}
```
