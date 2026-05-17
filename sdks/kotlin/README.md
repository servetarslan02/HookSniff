# HookSniff Kotlin SDK

<p align="center">
  <a href="https://github.com/servetarslan02/hooksniff-kotlin"><img src="https://img.shields.io/github/license/servetarslan02/hooksniff-kotlin" alt="License"></a>
  <a href="https://central.sonatype.com/artifact/io.github.servetarslan02/hooksniff-sdk-kotlin"><img src="https://img.shields.io/maven-central/v/io.github.servetarslan02/hooksniff-sdk-kotlin" alt="Maven Central"></a>
</p>

Kotlin SDK for the [HookSniff](https://hooksniff.com) webhook delivery platform.

## Installation

### Gradle (Kotlin DSL)
```kotlin
implementation("io.github.servetarslan02:hooksniff-sdk-kotlin:1.0.0")
```

### Gradle (Groovy)
```groovy
implementation 'io.github.servetarslan02:hooksniff-sdk-kotlin:1.0.0'
```

### Maven
```xml
<dependency>
    <groupId>io.github.servetarslan02</groupId>
    <artifactId>hooksniff-sdk-kotlin</artifactId>
    <version>1.0.0</version>
</dependency>
```

## Quick Start

```kotlin
import com.hooksniff.kotlin.HookSniff
import com.hooksniff.kotlin.models.*

// Initialize client
val client = HookSniff("hs_xxx")

// List endpoints
val endpoints = client.endpoint.list("app_id")
println(endpoints)

// Create a message
val msg = MessageIn(
    eventType = "order.created",
    payload = """{"orderId": "123"}"""
)
val result = client.message.create("app_id", msg)
```

## Webhook Verification

```kotlin
import com.hooksniff.kotlin.Webhook

val wh = Webhook("whsec_xxx")
wh.verify(payload, headers) // throws WebhookVerificationException on failure
```

## Resources

| Resource | Methods |
|----------|---------|
| **Endpoint** | list, create, get, update, delete, patch, getHeaders, updateHeaders, patchHeaders, getSecret, rotateSecret, sendExample |
| **Message** | list, create, get, expungeContent |
| **MessageAttempt** | listByEndpoint, listByMsg, listAttemptedMessages, get, expungeContent, listAttemptedDestinations, resend |
| **EventType** | list, create, importOpenapi, get, update, delete, patch |
| **Authentication** | logout |
| **Health** | get |
| **Statistics** | *(placeholder)* |

## Features

- ✅ Kotlin Coroutines (suspend functions)
- ✅ Auto-retry with exponential backoff
- ✅ Auto-idempotency key generation
- ✅ Rate limit handling (429 Retry-After)
- ✅ Webhook signature verification (HMAC-SHA256)
- ✅ kotlinx.serialization
- ✅ OkHttp3

## Requirements

- Kotlin 1.9.0+
- JDK 11+

## Links

- [Documentation](https://docs.hooksniff.com)
- [API Reference](https://api.hooksniff.com)
- [GitHub](https://github.com/servetarslan02/hooksniff-kotlin)
