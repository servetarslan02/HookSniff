---
sidebar_position: 4
---

# Kotlin Quick Start

## Installation

### Gradle Kotlin DSL
```kotlin
implementation("com.hooksniff:hooksniff-kotlin:0.5.0")
```

### Gradle Groovy DSL
```groovy
implementation 'com.hooksniff:hooksniff-kotlin:0.5.0'
```

### Maven
```xml
<dependency>
    <groupId>com.hooksniff</groupId>
    <artifactId>hooksniff-kotlin</artifactId>
    <version>0.5.0</version>
</dependency>
```

## Setup

```kotlin
import com.hooksniff.*

fun main() {
    val hs = HookSniff(System.getenv("HOOKSNIFF_API_KEY"))
}
```

## Create an Application

```kotlin
val app = hs.application.create(ApplicationCreate(
    name = "My App"
))

println("Application ID: ${app.id}")
```

## Create an Endpoint

```kotlin
val ep = hs.endpoint.create(EndpointCreate(
    url = "https://myapp.com/webhook",
    application_id = app.id,
    description = "Order notifications"
))

println("Endpoint ID: ${ep.id}")
```

## Send a Webhook

```kotlin
val delivery = hs.webhook.send(WebhookSend(
    endpoint_id = ep.id,
    event = "order.created",
    data = buildJsonObject {
        put("order_id", "ORD-12345")
        put("amount", 99.99)
    }
))

println("Delivery ID: ${delivery.id}")
println("Status: ${delivery.status}")
```

## Verify Incoming Webhooks

```kotlin
val wh = Webhook("whsec_your_signing_secret")

fun handleWebhook(payload: String, headers: Map<String, String>) {
    try {
        val event = wh.verify(payload, headers)
        println("Event: $event")
    } catch (e: WebhookVerificationError) {
        println("Invalid signature: ${e.message}")
    }
}
```

## Error Handling

```kotlin
try {
    hs.endpoint.get("invalid_id")
} catch (e: AuthenticationError) {
    println("Invalid API key")
} catch (e: NotFoundError) {
    println("Endpoint not found")
} catch (e: RateLimitError) {
    println("Rate limited, retry after ${e.retryAfter}s")
} catch (e: ValidationError) {
    println("Validation error: ${e.detail}")
}
```
