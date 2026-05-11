# HookSniff Java SDK

[![Maven Central](https://img.shields.io/maven-central/v/io.github.servetarslan02/hooksniff-sdk.svg)](https://central.sonatype.com/artifact/io.github.servetarslan02/hooksniff-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Official Java client for the [HookSniff](https://hooksniff.vercel.app) webhook delivery service.

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

## Quick Start

```java
import org.openapitools.client.api.*;
import org.openapitools.client.model.*;
import org.openapitools.client.Configuration;

// Configure
var apiClient = Configuration.getDefaultApiClient();
apiClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
apiClient.addDefaultHeader("Authorization", "Bearer hr_live_your_api_key_here");

// Create an endpoint
var endpointsApi = new EndpointsApi(apiClient);
var req = new CreateEndpointRequest()
    .url("https://myapp.com/webhook")
    .description("Order notifications");
var endpoint = endpointsApi.endpointsPost(req);
System.out.println("Endpoint created: " + endpoint.getId());

// Send a webhook
var webhooksApi = new WebhooksApi(apiClient);
var webhookReq = new CreateWebhookRequest()
    .endpointId(endpoint.getId())
    .event("order.created")
    .data(Map.of("orderId", "12345"));
var delivery = webhooksApi.webhooksPost(webhookReq);
System.out.println("Delivery: " + delivery.getId());
```

## Available APIs

`EndpointsApi`, `WebhooksApi`, `AuthApi`, `APIKeysApi`, `AlertsApi`, `AnalyticsApi`, `BillingApi`, `TeamsApi`, `NotificationsApi`, `SchemasApi`, `SearchApi`, `HealthApi`, `AdminApi`, `AuditLogApi`, `InboundApi`, `TemplatesApi`, `RoutingApi`, `RateLimitsApi`, `CustomDomainsApi`, `CustomerPortalApi`, `DeliveryDetailsApi`, `DevicesApi`, `EmbedApi`, `EventsApi`, `OAuthApi`, `OutboundIPsApi`, `PlaygroundApi`, `SimulatorApi`, `SsoApi`, `StatsApi`, `StreamApi`, `TransformsApi`, `ContactApi`

## License

MIT
