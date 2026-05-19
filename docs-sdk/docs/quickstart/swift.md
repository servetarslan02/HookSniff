---
sidebar_position: 11
---

# Swift Quick Start

## Installation

### Swift Package Manager

Add to your `Package.swift`:

```swift
dependencies: [
    .package(url: "https://github.com/servetarslan02/hooksniff-swift.git", from: "0.3.0")
]
```

### CocoaPods

```ruby
pod 'HookSniffSDK', '~> 0.3.0'
```

## Setup

```swift
import HookSniffSDK

// Initialize client
let client = HookSniffClient(apiKey: "hr_live_your_api_key")

// Or with options
let client = HookSniffClient(
    apiKey: "hr_live_your_api_key",
    baseUrl: "https://hooksniff-api-1046140057667.europe-west1.run.app",
    timeout: 30
)
```

## Endpoints

```swift
// List all endpoints
let endpoints = try await client.endpoints.list()

// Create an endpoint
let endpoint = try await client.endpoints.create(
    url: "https://example.com/webhook",
    description: "My webhook endpoint",
    rateLimit: 100
)

// Get a specific endpoint
let details = try await client.endpoints.get(id: endpoint.id)

// Update an endpoint
let updated = try await client.endpoints.update(
    id: endpoint.id,
    url: "https://new-url.com/webhook"
)

// Delete an endpoint
try await client.endpoints.delete(id: endpoint.id)

// Rotate signing secret
let key = try await client.endpoints.rotateSecret(id: endpoint.id)
```

## Webhooks

```swift
// Send a webhook
let delivery = try await client.webhooks.send(
    endpointId: endpoint.id,
    eventType: "order.created",
    data: ["order_id": "12345", "amount": 99.99]
)

// List deliveries
let deliveries = try await client.webhooks.list(status: "delivered", page: 1)

// Replay a delivery
try await client.webhooks.replay(id: delivery.id)

// Batch send
let batch = try await client.webhooks.batch(
    endpointId: endpoint.id,
    events: [
        WebhookEvent(eventType: "order.created", data: ["order_id": "1"]),
        WebhookEvent(eventType: "order.created", data: ["order_id": "2"])
    ]
)
```

## Webhook Verification

```swift
import HookSniffSDK

let webhook = Webhook(signingSecret: "whsec_your_signing_secret")

// In your handler
func handleWebhook(request: URLRequest, body: Data) throws -> Data {
    let headers = [
        "webhook-id": request.value(forHTTPHeaderField: "webhook-id") ?? "",
        "webhook-timestamp": request.value(forHTTPHeaderField: "webhook-timestamp") ?? "",
        "webhook-signature": request.value(forHTTPHeaderField: "webhook-signature") ?? ""
    ]
    
    let payload = try webhook.verify(body: body, headers: headers)
    // Payload is verified — process it
    print("Received event: \(payload)")
    return "OK".data(using: .utf8)!
}
```

## Error Handling

```swift
do {
    let endpoint = try await client.endpoints.get(id: "nonexistent")
} catch let error as ApiException {
    print("API Error \(error.statusCode): \(error.message)")
} catch {
    print("Network error: \(error.localizedDescription)")
}
```
