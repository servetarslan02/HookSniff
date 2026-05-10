# HookSniff Kotlin SDK

[![Maven Central](https://img.shields.io/maven-central/v/com.hooksniff/hooksniff-kotlin.svg)](https://central.sonatype.com/artifact/com.hooksniff/hooksniff-kotlin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Official Kotlin client for the [HookSniff](https://hooksniff.vercel.app) webhook delivery service.

## Installation

### Gradle (Kotlin DSL)

```kotlin
dependencies {
    implementation("com.hooksniff:hooksniff:0.3.0")
}
```

### Gradle (Groovy)

```groovy
dependencies {
    implementation 'com.hooksniff:hooksniff:0.3.0'
}
```

### Maven

```xml
<dependency>
    <groupId>com.hooksniff</groupId>
    <artifactId>hooksniff</artifactId>
    <version>0.3.0</version>
</dependency>
```

## Usage

```kotlin
import com.hooksniff.*

fun main() {
    // Default base URL is used automatically
    val client = HookSniffClient("hr_live_...")

    // Or with custom base URL
    val client2 = HookSniffClient("hr_live_...", baseUrl = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1")

    // Create endpoint
    val endpoint = client.endpoints().create(
        url = "https://myapp.com/webhook",
        description = "Orders"
    )

    // Send webhook
    val delivery = client.webhooks().send(
        endpointId = endpoint.id,
        event = "order.created",
        data = mapOf("order_id" to "12345", "amount" to 99.99)
    )

    // List deliveries
    val result = client.webhooks().list(status = "delivered", page = 1)
    println("Total: ${result.total}")

    client.close()
}
```

## Webhook Verification

Verify incoming webhooks using Standard Webhooks headers:

```kotlin
val verifier = WebhookVerifier("whsec_...")

// From headers map
val result = verifier.verifyFromHeaders(
    body = requestBody,
    headers = mapOf(
        "webhook-id" to request.headers["webhook-id"],
        "webhook-timestamp" to request.headers["webhook-timestamp"],
        "webhook-signature" to request.headers["webhook-signature"]
    )
)

if (result.valid) {
    println("Payload: ${result.payload}")
} else {
    println("Error: ${result.error}")
}
```

## Error Handling

```kotlin
try {
    val endpoint = client.endpoints().create(url = "https://myapp.com/webhook")
} catch (e: ValidationException) {
    println("Validation error: ${e.message}")
} catch (e: AuthenticationException) {
    println("Auth error: ${e.message}")
} catch (e: RateLimitException) {
    println("Rate limited: ${e.message}")
}
```

## License

MIT
