# HookSniff Swift SDK

[![Swift Package Manager](https://img.shields.io/badge/SPM-compatible-brightgreen.svg)](https://swift.org/package-manager/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Official Swift client for the [HookSniff](https://hooksniff.vercel.app) webhook delivery service.

## Installation

### Swift Package Manager

Add to your `Package.swift`:

```swift
dependencies: [
    .package(url: "https://github.com/servetarslan02/hooksniff-swift", from: "0.3.0")
]
```

Or in Xcode: File → Add Package Dependencies → Enter the URL above.

## Quick Start

```swift
import HookSniff

// Configure
let config = OpenAPIClientAPI.basePath
OpenAPIClientAPI.basePath = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
// Set API key via custom headers or URLSession configuration

// Create an endpoint
EndpointsAPI.endpointsPost(
    createEndpointRequest: CreateEndpointRequest(
        url: "https://myapp.com/webhook",
        description: "Order notifications"
    )
) { endpoint, error in
    if let endpoint = endpoint {
        print("Endpoint created: \(endpoint.id)")
    }
}

// Send a webhook
WebhooksAPI.webhooksPost(
    createWebhookRequest: CreateWebhookRequest(
        endpointId: "ep_abc123",
        event: "order.created",
        data: ["orderId": "12345"]
    )
) { delivery, error in
    if let delivery = delivery {
        print("Delivery: \(delivery.id)")
    }
}
```

## Available APIs

`EndpointsAPI`, `WebhooksAPI`, `AuthAPI`, `APIKeysAPI`, `AlertsAPI`, `AnalyticsAPI`, `BillingAPI`, `TeamsAPI`, `NotificationsAPI`, `SchemasAPI`, `SearchAPI`, `HealthAPI`, `AdminAPI`, `AuditLogAPI`, `InboundAPI`, `TemplatesAPI`, `RoutingAPI`, `RateLimitsAPI`, `CustomDomainsAPI`, `CustomerPortalAPI`, `DeliveryDetailsAPI`, `DevicesAPI`, `EmbedAPI`, `EventsAPI`, `OAuthAPI`, `OutboundIPsAPI`, `PlaygroundAPI`, `SimulatorAPI`, `SsoAPI`, `StatsAPI`, `StreamAPI`, `TransformsAPI`, `ContactAPI`

## Requirements

- macOS 12+ / iOS 15+ / tvOS 15+ / watchOS 8+
- Swift 5.9+

## License

MIT
