---
sidebar_position: 11
---

# Swift Quick Start

## Installation

Add to your `Package.swift`:

```swift
dependencies: [
    .package(url: "https://github.com/servetarslan02/hooksniff-swift", from: "1.2.0"),
]
```

Then add to your target:

```swift
.product(name: "HookSniff", package: "hooksniff-swift")
```

## Setup

```swift
import HookSniff

let hs = HookSniff(apiKey: ProcessInfo.processInfo.environment["HOOKSNIFF_API_KEY"] ?? "")
```

## Create an Endpoint

```swift
let endpoint = try await hs.endpoints.create(
    url: "https://myapp.com/webhook",
    description: "Order notifications",
    eventTypes: ["order.created", "order.updated"]
)

print("Endpoint ID: \(endpoint.id)")
print("Signing secret: \(endpoint.secret ?? "")")
```

## Send a Webhook

```swift
let delivery = try await hs.webhooks.send(
    endpointId: endpoint.id,
    event: "order.created",
    data: [
        "order_id": "ORD-12345",
        "amount": 99.99,
        "currency": "USD"
    ]
)

print("Delivery ID: \(delivery.id)")
print("Status: \(delivery.status)")
```

## Verify Incoming Webhooks

```swift
import HookSniff

let wh = try Webhook(secret: "whsec_your_signing_secret")

// Vapor handler
app.post("webhook") { req async throws -> Response in
    let body = req.body.string ?? ""

    do {
        let payload = try wh.verify(
            body: body,
            headers: [
                "webhook-id": req.headers["webhook-id"].first ?? "",
                "webhook-timestamp": req.headers["webhook-timestamp"].first ?? "",
                "webhook-signature": req.headers["webhook-signature"].first ?? "",
            ]
        )

        print("Event: \(payload.event)")
        print("Data: \(payload.data)")

        return Response(status: .ok)
    } catch {
        return Response(status: .unauthorized, body: "Invalid signature")
    }
}
```

## List Deliveries

```swift
let deliveries = try await hs.webhooks.list(
    endpointId: endpoint.id,
    limit: 20
)

for dlv in deliveries.data {
    print("\(dlv.id): \(dlv.status)")
}
```

## Error Handling

```swift
do {
    let endpoint = try await hs.endpoints.get(id: "nonexistent")
} catch let error as HttpError {
    print("HTTP \(error.statusCode): \(error.message)")
    if error.statusCode == 429 {
        let retryAfter = error.headers["retry-after"]
        print("Retry after \(retryAfter ?? "unknown") seconds")
    }
} catch let error as ValidationError {
    print("Validation failed: \(error.errors)")
} catch {
    print("Unexpected error: \(error)")
}
```
