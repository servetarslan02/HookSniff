# HookSniff Kotlin SDK

[![Maven Central](https://img.shields.io/maven-central/v/io.github.servetarslan02/hooksniff-sdk-kotlin.svg)](https://central.sonatype.com/artifact/io.github.servetarslan02/hooksniff-sdk-kotlin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Official Kotlin client for the [HookSniff](https://hooksniff.vercel.app) webhook delivery service.

## Installation

### Gradle (Kotlin DSL)
```kotlin
implementation("io.github.servetarslan02:hooksniff-sdk-kotlin:0.3.0")
```

### Gradle (Groovy)
```groovy
implementation 'io.github.servetarslan02:hooksniff-sdk-kotlin:0.3.0'
```

## Quick Start

```kotlin
import org.openapitools.client.api.*
import org.openapitools.client.model.*
import org.openapitools.client.infrastructure.ApiClient

// Configure
val client = ApiClient()
client.addDefaultHeader("Authorization", "Bearer hr_live_your_api_key_here")
// Default base URL: https://hooksniff-api-1046140057667.europe-west1.run.app/v1

val endpointsApi = EndpointsApi(client.baseUrl)
val webhooksApi = WebhooksApi(client.baseUrl)

// Create an endpoint
val endpoint = endpointsApi.endpointsPost(
    CreateEndpointRequest(
        url = "https://myapp.com/webhook",
        description = "Order notifications"
    )
)
println("Endpoint created: ${endpoint.id}")

// Send a webhook
val delivery = webhooksApi.webhooksPost(
    CreateWebhookRequest(
        endpointId = endpoint.id,
        event = "order.created",
        data = mapOf("orderId" to "12345")
    )
)
println("Delivery: ${delivery.id}")
```

## Available APIs

`EndpointsApi`, `WebhooksApi`, `AuthApi`, `APIKeysApi`, `AlertsApi`, `AnalyticsApi`, `BillingApi`, `TeamsApi`, `NotificationsApi`, `SchemasApi`, `SearchApi`, `HealthApi`, `AdminApi`, `AuditLogApi`, `InboundApi`, `TemplatesApi`, `RoutingApi`, `RateLimitsApi`, `CustomDomainsApi`, `CustomerPortalApi`, `DeliveryDetailsApi`, `DevicesApi`, `EmbedApi`, `EventsApi`, `OAuthApi`, `OutboundIPsApi`, `PlaygroundApi`, `SimulatorApi`, `SSOApi`, `StatsApi`, `StreamApi`, `TransformsApi`, `ContactApi`

## License

MIT
