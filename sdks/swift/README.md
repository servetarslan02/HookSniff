# HookSniff Swift SDK

Official Swift client for the [HookSniff](https://hooksniff.is-a.dev) webhook delivery service.

## Installation

### Swift Package Manager

Add to your `Package.swift`:

```swift
dependencies: [
    .package(url: "https://github.com/servetarslan02/hooksniff", from: "0.2.0")
]
```

Or in Xcode: File → Add Package Dependencies → Enter the repo URL.

## Usage

```swift
import HookSniff

let client = HookSniff(apiKey: "hr_live_...")

// Create endpoint
let endpoint = try await client.endpoints.create(
    url: "https://myapp.com/webhook",
    description: "Orders"
)

// Send webhook
let delivery = try await client.webhooks.send(
    endpointId: endpoint.id,
    event: "order.created",
    data: ["order_id": "12345", "amount": 99.99]
)

// List deliveries
let result = try await client.webhooks.list(status: "delivered", page: 1)
print("Total: \(result.total)")
```

## Webhook Verification

Verify incoming webhooks using Standard Webhooks headers:

```swift
let verifier = WebhookVerifier(secret: "whsec_...")

// From headers dict
let result = verifier.verifyFromHeaders(
    body: requestBody,
    headers: [
        "webhook-id": request.headers["webhook-id"],
        "webhook-timestamp": request.headers["webhook-timestamp"],
        "webhook-signature": request.headers["webhook-signature"]
    ]
)

if result.valid {
    // Handle verified webhook
    print("Payload: \(result.payload)")
} else {
    // Reject
    print("Error: \(result.error)")
}
```

## Error Handling

```swift
do {
    let endpoint = try await client.endpoints.create(url: "https://myapp.com/webhook")
} catch let error as HookSniffError {
    print("Error \(error.statusCode ?? 0): \(error.message)")
}
```

## License

MIT
