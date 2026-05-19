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
    <version>1.1.0</version>
</dependency>
```

### Gradle

```groovy
implementation 'io.github.servetarslan02:hooksniff-sdk:1.1.0'
```

## Setup

```java
import dev.hooksniff.HookSniff;

HookSniff hs = new HookSniff(System.getenv("HOOKSNIFF_API_KEY"));
```

## Create an Endpoint

```java
import dev.hooksniff.models.*;

Endpoint endpoint = hs.endpoint().create(
    CreateEndpointRequest.builder()
        .url("https://myapp.com/webhook")
        .description("Order notifications")
        .eventTypes(List.of("order.created", "order.updated"))
        .build()
);

System.out.println("Endpoint ID: " + endpoint.getId());
System.out.println("Signing secret: " + endpoint.getSecret());
```

## Send a Webhook

```java
Delivery delivery = hs.webhooks().send(
    SendWebhookRequest.builder()
        .endpointId(endpoint.getId())
        .event("order.created")
        .data(Map.of(
            "order_id", "ORD-12345",
            "amount", 99.99,
            "currency", "USD"
        ))
        .build()
);

System.out.println("Delivery ID: " + delivery.getId());
System.out.println("Status: " + delivery.getStatus());
```

## Verify Incoming Webhooks

```java
import dev.hooksniff.Webhook;

Webhook wh = new Webhook("whsec_your_signing_secret");

// Spring controller
@PostMapping("/webhook")
public ResponseEntity<String> handleWebhook(
        @RequestBody String body,
        @RequestHeader Map<String, String> headers) {
    try {
        WebhookPayload payload = wh.verify(body, headers);
        System.out.println("Event: " + payload.getEvent());
        System.out.println("Data: " + payload.getData());
        return ResponseEntity.ok("OK");
    } catch (WebhookVerificationException e) {
        return ResponseEntity.status(401).body("Invalid signature");
    }
}
```

## List Deliveries

```java
DeliveryListResponse deliveries = hs.webhooks().list(
    ListWebhooksRequest.builder()
        .endpointId(endpoint.getId())
        .limit(20)
        .build()
);

for (Delivery dlv : deliveries.getData()) {
    System.out.printf("%s: %s%n", dlv.getId(), dlv.getStatus());
}
```

## Error Handling

```java
try {
    hs.endpoint().get("nonexistent");
} catch (HttpErrorException e) {
    System.err.println("HTTP " + e.getStatusCode() + ": " + e.getMessage());
    if (e.getStatusCode() == 429) {
        String retryAfter = e.getHeaders().get("retry-after");
        System.err.println("Retry after " + retryAfter + " seconds");
    }
} catch (ValidationException e) {
    System.err.println("Validation failed: " + e.getErrors());
}
```
