# HookSniff Rust SDK

[![Crates.io](https://img.shields.io/crates/v/hooksniff.svg)](https://crates.io/crates/hooksniff)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Official Rust client for the [HookSniff](https://hooksniff.vercel.app) webhook delivery service.

## Installation

Add to your `Cargo.toml`:

```toml
[dependencies]
hooksniff = "0.2.0"
```

## Usage

```rust
use hooksniff::HookSniffClient;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Default base URL is used automatically
    let client = HookSniffClient::new("hr_live_...");

    // Or with custom base URL
    let client = HookSniffClient::with_base_url(
        "hr_live_...",
        "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
    );

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
use hooksniff::WebhookVerifier;

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
use hooksniff::HookSniffError;

match client.endpoints().create("https://myapp.com/webhook", None, None).await {
    Ok(endpoint) => println!("Created: {}", endpoint.id),
    Err(HookSniffError::Validation { message, .. }) => eprintln!("Validation: {}", message),
    Err(HookSniffError::Authentication { .. }) => eprintln!("Auth failed"),
    Err(HookSniffError::RateLimit { .. }) => eprintln!("Rate limited"),
    Err(e) => eprintln!("Error: {}", e),
}
```

## License

MIT
