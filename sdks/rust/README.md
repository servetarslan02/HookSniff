# HookSniff Rust SDK

[![Crates.io](https://img.shields.io/crates/v/hooksniff.svg)](https://crates.io/crates/hooksniff)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Official Rust client for the [HookSniff](https://hooksniff.vercel.app) webhook delivery service.

## Installation

Add to your `Cargo.toml`:

```toml
[dependencies]
hooksniff = "0.3.0"
```

## Quick Start

```rust
use hooksniff::apis::configuration::Configuration;
use hooksniff::apis::endpoints_api;
use hooksniff::apis::webhooks_api;
use hooksniff::models::{CreateEndpointRequest, CreateWebhookRequest};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Configure client
    let mut config = Configuration::new();
    config.bearer_access_token = Some("hr_live_your_api_key_here".to_string());

    // Create an endpoint
    let endpoint = endpoints_api::endpoints_post(
        &config,
        CreateEndpointRequest {
            url: "https://myapp.com/webhook".to_string(),
            description: Some("Order notifications".to_string()),
            ..Default::default()
        },
    ).await?;
    println!("Endpoint created: {}", endpoint.id);

    // Send a webhook
    let delivery = webhooks_api::webhooks_post(
        &config,
        CreateWebhookRequest {
            endpoint_id: endpoint.id,
            event: Some("order.created".to_string()),
            data: Some(serde_json::json!({"order_id": "12345"})),
            ..Default::default()
        },
    ).await?;
    println!("Delivery queued: {} ({})", delivery.id, delivery.status);

    Ok(())
}
```

## Available API Modules

Each module contains functions for a group of endpoints:

| Module | Description |
|--------|-------------|
| `endpoints_api` | Manage webhook destination endpoints |
| `webhooks_api` | Send, list, replay, and export webhook deliveries |
| `auth_api` | Registration, login, password reset, 2FA |
| `api_keys_api` | Manage API keys |
| `alerts_api` | Alert rules and notifications |
| `analytics_api` | Delivery trends, success rates, latency metrics |
| `billing_api` | Subscription, usage, invoices |
| `teams_api` | Team management and invitations |
| `notifications_api` | In-app notification management |
| `schemas_api` | Event schema management |
| `search_api` | Search webhook deliveries |
| `health_api` | System status and endpoint health |
| `admin_api` | Admin operations |
| `audit_log_api` | Audit log access |
| `inbound_api` | Receive webhooks from external providers |
| `templates_api` | Webhook templates |
| `routing_api` | Delivery routing configuration |
| `rate_limits_api` | Rate limit management |
| `custom_domains_api` | Custom domain management |
| `customer_portal_api` | Customer portal operations |
| `delivery_details_api` | Detailed delivery information |
| `devices_api` | Push notification device tokens |
| `embed_api` | Embed widget configuration |
| `events_api` | Event management |
| `oauth_api` | OAuth configuration |
| `outbound_ips_api` | Outbound IP addresses |
| `playground_api` | API playground |
| `simulator_api` | Webhook simulator |
| `sso_api` | SSO configuration |
| `stats_api` | Account usage statistics |
| `stream_api` | Real-time event streaming |
| `transforms_api` | Transform rules |

## Usage Examples

### List Endpoints

```rust
let endpoints = endpoints_api::endpoints_get(&config).await?;
for ep in &endpoints {
    println!("  {}: {} ({:?})", ep.id, ep.url, ep.status);
}
```

### Get Endpoint Details

```rust
let endpoint = endpoints_api::endpoints_id_get(&config, "ep_abc123").await?;
println!("URL: {}", endpoint.url);
```

### Delete an Endpoint

```rust
endpoints_api::endpoints_id_delete(&config, "ep_abc123").await?;
```

### List Deliveries

```rust
let deliveries = webhooks_api::webhooks_get(
    &config,
    Some(1),       // page
    Some(20),      // per_page
    Some("failed"), // status
    None,          // endpoint_id
).await?;
for d in &deliveries.deliveries {
    println!("  {}: {}", d.id, d.status);
}
```

### Replay a Delivery

```rust
let replayed = webhooks_api::webhooks_id_replay_post(&config, "dlv_abc123").await?;
println!("Replay queued: {}", replayed.id);
```

### Check System Health

```rust
let status = health_api::status_get(&config).await?;
println!("Overall: {}", status.overall_status);
for c in &status.components {
    println!("  {}: {:?}", c.name, c.status);
}
```

## Configuration

```rust
use hooksniff::apis::configuration::Configuration;

let mut config = Configuration::new();
// Default base URL: https://hooksniff-api-1046140057667.europe-west1.run.app/v1
config.bearer_access_token = Some("hr_live_...".to_string());
```

## Error Handling

All API functions return `Result<T, Error<Variant>>`:

```rust
match endpoints_api::endpoints_post(&config, request).await {
    Ok(endpoint) => println!("Created: {}", endpoint.id),
    Err(e) => eprintln!("Error: {:?}", e),
}
```

## Models

All request/response types are in the `models` module:

```rust
use hooksniff::models::{
    Endpoint,
    CreateEndpointRequest,
    Delivery,
    DeliveryListResponse,
    DeliveryAttempt,
    BatchWebhookRequest,
    BatchResponse,
    AlertRule,
    SubscriptionResponse,
    // ... and 90+ more types
};
```

## License

MIT
