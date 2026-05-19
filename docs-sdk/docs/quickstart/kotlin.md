---
sidebar_position: 7
---

# Kotlin Quick Start

## Installation

### Gradle (Kotlin DSL)

```kotlin
dependencies {
    implementation("io.github.servetarslan02:hooksniff-sdk-kotlin:0.3.0")
}
```

### Gradle (Groovy)

```groovy
implementation 'io.github.servetarslan02:hooksniff-sdk-kotlin:0.3.0'
```

## Setup

```kotlin
import com.hooksniff.sdk.HookSniff

// Initialize client
val client = HookSniff("hr_live_your_api_key")

// Or with options
val client = HookSniff(
    apiKey = "hr_live_your_api_key",
    baseUrl = "https://hooksniff-api-1046140057667.europe-west1.run.app",
    timeout = 30000
)
```

## Endpoints

```kotlin
// List all endpoints
val endpoints = client.endpoints.list()

// Create an endpoint
val endpoint = client.endpoints.create(
    url = "https://example.com/webhook",
    description = "My webhook endpoint",
    rateLimit = 100
)

// Get a specific endpoint
val details = client.endpoints.get(endpoint.id)

// Update an endpoint
val updated = client.endpoints.update(endpoint.id, url = "https://new-url.com/webhook")

// Delete an endpoint
client.endpoints.delete(endpoint.id)

// Rotate signing secret
val key = client.endpoints.rotateSecret(endpoint.id)
```

## Webhooks

```kotlin
// Send a webhook
val delivery = client.webhooks.send(
    endpointId = endpoint.id,
    eventType = "order.created",
    data = mapOf("order_id" to "12345", "amount" to 99.99)
)

// List deliveries
val deliveries = client.webhooks.list(status = "delivered", page = 1)

// Replay a delivery
client.webhooks.replay(delivery.id)

// Batch send
val batch = client.webhooks.batch(
    endpointId = endpoint.id,
    events = listOf(
        WebhookEvent("order.created", mapOf("order_id" to "1")),
        WebhookEvent("order.created", mapOf("order_id" to "2"))
    )
)
```

## Webhook Verification

```kotlin
import com.hooksniff.sdk.Webhook

val webhook = Webhook("whsec_your_signing_secret")

// In your handler
fun handleWebhook(body: String, headers: Map<String, String>): String {
    return try {
        val payload = webhook.verify(body, headers)
        // Payload is verified — process it
        println("Received event: $payload")
        "OK"
    } catch (e: SignatureVerificationException) {
        throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
    }
}
```

## Error Handling

```kotlin
try {
    client.endpoints.get("nonexistent")
} catch (e: ApiException) {
    println("API Error ${e.statusCode}: ${e.body}")
} catch (e: Exception) {
    println("Network error: ${e.message}")
}
```
