---
sidebar_position: 4
---

# Rust Quick Start

## Installation

```toml
[dependencies]
hooksniff = "1.5"
tokio = { version = "1", features = ["full"] }
```

## Setup

```rust
use hooksniff::api::HookSniff;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let hs = HookSniff::new(
        std::env::var("HOOKSNIFF_API_KEY")?,
        None, // Uses default base URL
    );

    // With custom base URL
    let hs = HookSniff::new(
        std::env::var("HOOKSNIFF_API_KEY")?,
        Some("https://hooksniff-api-1046140057667.europe-west1.run.app".to_string()),
    );

    Ok(())
}
```

## Create an Endpoint

```rust
use hooksniff::models::EndpointIn;

let endpoint = hs.endpoint().create(EndpointIn {
    url: "https://myapp.com/webhook".to_string(),
    description: Some("Order notifications".to_string()),
    event_types: Some(vec![
        "order.created".to_string(),
        "order.updated".to_string(),
    ]),
    ..Default::default()
}).await?;

println!("Endpoint ID: {}", endpoint.id);
println!("Signing secret: {}", endpoint.secret.unwrap());
```

## Send a Webhook

```rust
use hooksniff::models::MessageIn;

let delivery = hs.message().create(MessageIn {
    endpoint_id: endpoint.id.clone(),
    event: "order.created".to_string(),
    data: serde_json::json!({
        "order_id": "ORD-12345",
        "amount": 99.99,
        "currency": "USD"
    }),
    ..Default::default()
}).await?;

println!("Delivery ID: {}", delivery.id);
println!("Status: {}", delivery.status);
```

## Verify Incoming Webhooks

```rust
use hooksniff::webhooks::Webhook;

let wh = Webhook::new("whsec_your_signing_secret".to_string());

// Axum handler
async fn handle_webhook(
    headers: axum::http::HeaderMap,
    body: String,
) -> Result<String, axum::http::StatusCode> {
    let payload = wh.verify(body.as_bytes(), &headers)
        .map_err(|_| axum::http::StatusCode::UNAUTHORIZED)?;

    println!("Event: {}", payload.event);
    println!("Data: {:?}", payload.data);
    Ok("OK".to_string())
}
```

## List Deliveries

```rust
use hooksniff::models::MessageAttemptListOptions;

let attempts = hs.message_attempt().list_by_endpoint(
    &endpoint.id,
    Some(MessageAttemptListOptions {
        limit: Some(20),
        ..Default::default()
    }),
).await?;

for attempt in &attempts.data {
    println!("{}: {}", attempt.id, attempt.response_status_code);
}
```

## Error Handling

```rust
match hs.endpoint().get("nonexistent").await {
    Ok(ep) => println!("Got endpoint: {}", ep.id),
    Err(hooksniff::Error::Api { status, body }) => {
        eprintln!("API Error {}: {}", status, body);
        if status == 429 {
            eprintln!("Rate limited — retry after cooldown");
        }
    }
    Err(e) => eprintln!("Error: {}", e),
}
```
