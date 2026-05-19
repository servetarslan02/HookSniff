---
sidebar_position: 7
---

# Kotlin Quick Start

## Installation

### Gradle Kotlin DSL

```kotlin
dependencies {
    implementation("io.github.servetarslan02:hooksniff-sdk-kotlin:1.2.0")
}
```

### Gradle Groovy

```groovy
implementation 'io.github.servetarslan02:hooksniff-sdk-kotlin:1.2.0'
```

## Setup

```kotlin
import dev.hooksniff.HookSniff

val hs = HookSniff(apiKey = System.getenv("HOOKSNIFF_API_KEY"))
```

## Create an Endpoint

```kotlin
val endpoint = hs.endpoints.create(
    url = "https://myapp.com/webhook",
    description = "Order notifications",
    eventTypes = listOf("order.created", "order.updated"),
)

println("Endpoint ID: ${endpoint.id}")
println("Signing secret: ${endpoint.secret}")
```

## Send a Webhook

```kotlin
val delivery = hs.webhooks.send(
    endpointId = endpoint.id,
    event = "order.created",
    data = mapOf(
        "order_id" to "ORD-12345",
        "amount" to 99.99,
        "currency" to "USD",
    ),
)

println("Delivery ID: ${delivery.id}")
println("Status: ${delivery.status}")
```

## Verify Incoming Webhooks

```kotlin
import dev.hooksniff.Webhook

val wh = Webhook("whsec_your_signing_secret")

// Ktor handler
post("/webhook") {
    try {
        val payload = wh.verify(
            call.receiveText(),
            call.request.headers,
        )

        println("Event: ${payload.event}")
        println("Data: ${payload.data}")
        call.respondText("OK")
    } catch (e: SignatureVerificationException) {
        call.respondText("Invalid signature", status = HttpStatusCode.Unauthorized)
    }
}
```

## List Deliveries

```kotlin
val deliveries = hs.webhooks.list(
    endpointId = endpoint.id,
    limit = 20,
)

deliveries.data.forEach { dlv ->
    println("${dlv.id}: ${dlv.status}")
}
```

## Error Handling

```kotlin
try {
    hs.endpoints.get("nonexistent")
} catch (e: HttpError) {
    println("HTTP ${e.statusCode}: ${e.message}")
    if (e.statusCode == 429) {
        val retryAfter = e.headers["retry-after"]
        println("Retry after $retryAfter seconds")
    }
} catch (e: ValidationError) {
    println("Validation failed: ${e.errors}")
}
```
