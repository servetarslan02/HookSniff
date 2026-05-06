# HookRelay Rust SDK

Official Rust client for the [HookRelay](https://hookrelay.io) webhook delivery service.

## Installation

Add to your `Cargo.toml`:

```toml
[dependencies]
hookrelay = "0.2.0"
```

## Usage

```rust
use hookrelay::HookRelayClient;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = HookRelayClient::new("hr_live_...");

    // Create endpoint
    let endpoint = client.endpoints()
        .create("https://myapp.com/webhook", Some("Orders"), None)
        .await?;

    // Send webhook
    let delivery = client.webhooks()
        .send(&endpoint.id, "order.created", serde_json::json!({"order_id": "12345"}))
        .await?;

    // List deliveries
    let result = client.webhooks().list(Some("delivered"), 1, 20).await?;
    println!("Total: {}", result.total);

    Ok(())
}
```

## Webhook Verification

```rust
use hookrelay::WebhookVerifier;

let verifier = WebhookVerifier::new("whsec_...");

// From headers
let mut headers = std::collections::HashMap::new();
headers.insert("webhook-id".into(), request.headers["webhook-id"].clone());
headers.insert("webhook-timestamp".into(), request.headers["webhook-timestamp"].clone());
headers.insert("webhook-signature".into(), request.headers["webhook-signature"].clone());

let result = verifier.verify_from_headers(&body, &headers);

if result.valid {
    println!("Payload: {:?}", result.payload);
} else {
    println!("Error: {:?}", result.error);
}
```

## Error Handling

```rust
use hookrelay::HookRelayError;

match client.endpoints().create("https://myapp.com/webhook", None, None).await {
    Ok(endpoint) => println!("Created: {}", endpoint.id),
    Err(HookRelayError::Validation { message, .. }) => eprintln!("Validation: {}", message),
    Err(HookRelayError::Authentication { .. }) => eprintln!("Auth failed"),
    Err(HookRelayError::RateLimit { .. }) => eprintln!("Rate limited"),
    Err(e) => eprintln!("Error: {}", e),
}
```

## License

MIT
