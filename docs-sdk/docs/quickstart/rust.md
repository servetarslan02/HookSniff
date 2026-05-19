---
sidebar_position: 4
---

# Rust Quick Start

## Installation

Add to your `Cargo.toml`:

```toml
[dependencies]
hooksniff = "0.3.0"
```

## Setup

```rust
use hooksniff::Client;

// Initialize client
let client = Client::new("hr_live_your_api_key");

// Or with custom base URL
let client = Client::with_options(
    "hr_live_your_api_key",
    "https://hooksniff-api-1046140057667.europe-west1.run.app",
);
```

## Endpoints

```rust
// List all endpoints
let endpoints = client.endpoints().list().await?;

// Create an endpoint
let endpoint = client.endpoints().create(
    "https://example.com/webhook",
    "My webhook endpoint",
    Some(100),
).await?;

// Get a specific endpoint
let details = client.endpoints().get(&endpoint.id).await?;

// Update an endpoint
let updated = client.endpoints().update(
    &endpoint.id,
    Some("https://new-url.com/webhook"),
    None,
).await?;

// Delete an endpoint
client.endpoints().delete(&endpoint.id).await?;

// Rotate signing secret
let key = client.endpoints().rotate_secret(&endpoint.id).await?;
```

## Webhooks

```rust
use hooksniff::models::WebhookSendInput;

// Send a webhook
let delivery = client.webhooks().send(WebhookSendInput {
    endpoint_id: endpoint.id.clone(),
    event_type: "order.created".to_string(),
    data: serde_json::json!({"order_id": "12345", "amount": 99.99}),
}).await?;

// List deliveries
let deliveries = client.webhooks().list(Some("delivered"), Some(1)).await?;

// Replay a delivery
client.webhooks().replay(&delivery.id).await?;

// Batch send
let batch = client.webhooks().batch(&endpoint.id, vec![
    WebhookSendInput {
        endpoint_id: endpoint.id.clone(),
        event_type: "order.created".to_string(),
        data: serde_json::json!({"order_id": "1"}),
    },
    WebhookSendInput {
        endpoint_id: endpoint.id.clone(),
        event_type: "order.created".to_string(),
        data: serde_json::json!({"order_id": "2"}),
    },
]).await?;
```

## Webhook Verification

```rust
use hooksniff::webhook::Webhook;

let webhook = Webhook::new("whsec_your_signing_secret");

// In your handler
fn handle_webhook(body: &str, headers: &HashMap<String, String>) -> Result<(), Error> {
    let payload = webhook.verify(body, headers)?;
    // Payload is verified — process it
    println!("Received event: {:?}", payload);
    Ok(())
}
```

## Error Handling

```rust
match client.endpoints().get("nonexistent").await {
    Ok(endpoint) => println!("Got endpoint: {:?}", endpoint),
    Err(hooksniff::Error::Api { status, body }) => {
        eprintln!("API Error {}: {}", status, body);
    }
    Err(e) => {
        eprintln!("Network error: {}", e);
    }
}
```
