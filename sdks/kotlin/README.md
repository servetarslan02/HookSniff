# HookSniff Kotlin SDK

Kotlin SDK for [HookSniff](https://hooksniff.vercel.app) — reliable webhook delivery for developers.

## Installation

### Gradle (Kotlin DSL)

```kotlin
implementation("com.hooksniff.kotlin:hooksniff-kotlin:1.0.0")
```

### Gradle (Groovy)

```groovy
implementation 'com.hooksniff.kotlin:hooksniff-kotlin:1.0.0'
```

## Usage

```kotlin
import com.hooksniff.kotlin.HookSniff
import com.hooksniff.kotlin.models.*

// Initialize the client
val hs = HookSniff("YOUR_API_KEY")

// List endpoints
val endpoints = hs.endpoint.list()

// Create an endpoint
val endpoint = hs.endpoint.create(
    EndpointIn(
        url = "https://example.com/webhook",
        description = "My endpoint"
    )
)

// Send a webhook message
val message = hs.message.create(
    MessageIn(
        eventType = "order.created",
        payload = mapOf("order_id" to "ord_123", "amount" to 9999)
    )
)

// List delivery attempts
val attempts = hs.messageAttempt.listByMsg(message.id)
```

## Webhook Verification

```kotlin
import com.hooksniff.kotlin.Webhook
import com.hooksniff.kotlin.exceptions.WebhookVerificationException

val wh = Webhook("whsec_...")

try {
    val payload = wh.verify(
        requestBody,
        mapOf(
            "hooksniff-id" to request.getHeader("hooksniff-id"),
            "hooksniff-signature" to request.getHeader("hooksniff-signature"),
            "hooksniff-timestamp" to request.getHeader("hooksniff-timestamp")
        )
    )
    // payload is valid
} catch (e: WebhookVerificationException) {
    // invalid signature
}
```

## API Resources

| Resource | Description |
|----------|-------------|
| `hs.authentication` | Login, register, 2FA, password reset |
| `hs.endpoint` | CRUD for webhook endpoints |
| `hs.eventType` | Manage event types |
| `hs.health` | System health check |
| `hs.message` | Send webhook messages |
| `hs.messageAttempt` | View delivery attempts |
| `hs.statistics` | Delivery statistics |

## License

MIT
