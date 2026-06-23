# HookSniff — SDK Usage Examples

> Last updated: 2026-06-17
> API Base URL: `https://hooksniff-api-499907444852.europe-west1.run.app`

All SDKs follow the same pattern: initialize client → use resources (applications, endpoints, webhooks) → handle responses.

---

## Table of Contents

- [Node.js (TypeScript)](#nodejs-typescript)
- [Python](#python)
- [Go](#go)
- [Java](#java)
- [Rust](#rust)
- [Ruby](#ruby)
- [PHP](#php)
- [C#](#c)
- [Kotlin](#kotlin)
- [Elixir](#elixir)
- [Swift](#swift)

---

## Node.js (TypeScript)

### Installation

```bash
npm install hooksniff-node
```

### Quick Start

```typescript
import { HookSniff } from "hooksniff-sdk";

const hs = new HookSniff("hr_live_...");

// Create an application
const app = await hs.application.create({ name: "My App" });

// Create an endpoint
const ep = await hs.endpoint.create({
  url: "https://app.com/webhook",
  application_id: app.id,
  description: "Order notifications",
});

// Send a webhook
const delivery = await hs.webhook.send({
  endpoint_id: ep.id,
  event: "order.created",
  data: { order_id: "12345", amount: 99.99 },
});

console.log(delivery.id); // "msg_..."
```

### Auto-Pagination

```typescript
// Iterate through all endpoints automatically
for await (const ep of hs.endpoint.list()) {
  console.log(ep.url);
}

// Or collect all at once
const allEndpoints = await hs.endpoint.list().all();
```

### Webhook Verification

```typescript
import { Webhook, WebhookVerificationError } from "hooksniff-sdk";

const wh = new Webhook("whsec_...");

app.post("/webhook", (req, res) => {
  try {
    const event = wh.verify(req.body, req.headers);
    console.log("Verified event:", event);
    res.status(200).send("OK");
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      res.status(401).send("Invalid signature");
    }
    throw err;
  }
});
```

### Error Handling

```typescript
import {
  AuthenticationError,
  NotFoundError,
  RateLimitError,
} from "hooksniff-sdk";

try {
  await hs.endpoint.get("invalid_id");
} catch (err) {
  if (err instanceof NotFoundError) {
    console.log("Endpoint not found");
  } else if (err instanceof AuthenticationError) {
    console.log("Invalid API key");
  } else if (err instanceof RateLimitError) {
    console.log(`Rate limited, retry after ${err.retryAfter}s`);
  }
}
```

### Idempotency

```typescript
const delivery = await hs.webhook.send(
  { endpoint_id: ep.id, event: "order.created", data: {} },
  { idempotencyKey: "unique-key-123" },
);
```

### All Resources

```typescript
// Applications
await hs.application.create({ name: "My App" });
await hs.application.list();  // auto-pagination
await hs.application.get("app_123");
await hs.application.update("app_123", { name: "New Name" });
await hs.application.delete("app_123");

// Endpoints
await hs.endpoint.create({ url: "...", application_id: "app_123" });
await hs.endpoint.list();
await hs.endpoint.get("ep_123");
await hs.endpoint.update("ep_123", { url: "..." });
await hs.endpoint.delete("ep_123");
await hs.endpoint.rotateSecret("ep_123");

// Webhooks
await hs.webhook.send({ endpoint_id: "ep_123", event: "...", data: {} });
await hs.webhook.sendBatch([{ endpoint_id: "ep_123", event: "...", data: {} }]);
await hs.webhook.list();
await hs.webhook.get("msg_123");
await hs.webhook.replay("msg_123");

// API Keys
await hs.apiKey.list();
await hs.apiKey.create({ name: "Production Key" });
await hs.apiKey.delete("key_123");

// Analytics
await hs.analytics.deliveries({ range: "24h" });
await hs.analytics.successRate({ range: "7d" });

// Billing
await hs.billing.subscription();
await hs.billing.upgrade({ plan: "pro" });
await hs.billing.portal();

// Teams
await hs.team.list();
await hs.team.create({ name: "Engineering" });

// Cortex AI
await hs.cortex.insights();
await hs.cortex.anomalies({ endpoint_id: "ep_123" });
await hs.cortex.predict("ep_123");
await hs.cortex.autoHeal("ep_123");

// Notifications
await hs.notification.list();
await hs.notification.getUnreadCount();
await hs.notification.markRead("notif_123");
await hs.notification.markAllRead();

// Templates
await hs.template.list();
await hs.template.get("tmpl_123");

// Schemas
await hs.schema.list();
await hs.schema.create({ name: "Order Schema", schema: { ... } });
await hs.schema.validate("schema_123", { order_id: "123" });

// Alerts
await hs.alert.list();
await hs.alert.create({ name: "...", condition: "failure_rate", threshold: 10, channels: ["email"] });

// Search
await hs.search.deliveries("order.created");

// Health
await hs.health.check();
await hs.health.outboundIps();

// User
await hs.me();
```

### Configuration

```typescript
const hs = new HookSniff("hr_live_...", {
  baseUrl: "https://your-instance.com",  // Custom API URL
  timeout: 30000,                         // Request timeout (ms)
  retries: 3,                             // Max retries on 5xx/429
  headers: { "X-Custom": "value" },       // Custom headers
});
```

---

## Python

### Installation

```bash
pip install hooksniff-python
```

### Quick Start

```python
from hooksniff_python import HookSniff

hs = HookSniff("hr_live_...")

# Create an application
app = hs.application.create(name="My App")

# Create an endpoint
ep = hs.endpoint.create(
    url="https://app.com/webhook",
    application_id=app["id"],
    description="Order notifications",
)

# Send a webhook
delivery = hs.webhook.send(
    endpoint_id=ep["id"],
    event="order.created",
    data={"order_id": "12345", "amount": 99.99},
)

print(delivery["id"])  # "msg_..."
```

### Auto-Pagination

```python
# Iterate through all endpoints
for ep in hs.endpoint.list():
    print(ep["url"])

# Or collect all
all_endpoints = hs.endpoint.list().all()
```

### Webhook Verification

```python
from hooksniff_python import Webhook, WebhookVerificationError

wh = Webhook("whsec_...")

# In your Flask/FastAPI handler:
def handle_webhook(request):
    try:
        event = wh.verify(request.body, request.headers)
        print(f"Verified event: {event}")
        return "OK", 200
    except WebhookVerificationError:
        return "Invalid signature", 401
```

### Error Handling

```python
from hooksniff_python import AuthenticationError, NotFoundError, RateLimitError

try:
    hs.endpoint.get("invalid_id")
except NotFoundError:
    print("Endpoint not found")
except AuthenticationError:
    print("Invalid API key")
except RateLimitError as e:
    print(f"Rate limited, retry after {e.retry_after}s")
```

### All Resources

```python
# Applications
hs.application.create(name="My App")
hs.application.list()  # auto-pagination
hs.application.get("app_123")
hs.application.update("app_123", name="New Name")
hs.application.delete("app_123")

# Endpoints
hs.endpoint.create(url="...", application_id="app_123")
hs.endpoint.list()
hs.endpoint.get("ep_123")
hs.endpoint.update("ep_123", url="...")
hs.endpoint.delete("ep_123")
hs.endpoint.rotate_secret("ep_123")

# Webhooks
hs.webhook.send(endpoint_id="ep_123", event="...", data={})
hs.webhook.send_batch([{...}])
hs.webhook.list()
hs.webhook.get("msg_123")
hs.webhook.replay("msg_123")

# API Keys
hs.api_key.list()
hs.api_key.create(name="Production Key")
hs.api_key.delete("key_123")

# Analytics
hs.analytics.deliveries(range="24h")
hs.analytics.success_rate(range="7d")

# Billing
hs.billing.subscription()
hs.billing.upgrade(plan="pro")
hs.billing.portal()

# Teams
hs.team.list()
hs.team.create(name="Engineering")

# Cortex AI
hs.cortex.insights()
hs.cortex.anomalies(endpoint_id="ep_123")
hs.cortex.predict("ep_123")
hs.cortex.auto_heal("ep_123")

# Notifications
hs.notification.list()
hs.notification.get_unread_count()
hs.notification.mark_read("notif_123")
hs.notification.mark_all_read()

# Templates
hs.template.list()
hs.template.get("tmpl_123")

# Schemas
hs.schema.list()
hs.schema.create(name="Order Schema", schema={...})
hs.schema.validate("schema_123", {"order_id": "123"})

# Alerts
hs.alert.list()
hs.alert.create(name="...", condition="failure_rate", threshold=10, channels=["email"])

# Search
hs.search.deliveries("order.created")

# Health
hs.health.check()
hs.health.outbound_ips()

# User
hs.me()
```

### Configuration

```python
hs = HookSniff(
    "hr_live_...",
    base_url="https://your-instance.com",  # Custom API URL
    timeout=30,                             # Request timeout (seconds)
    retries=3,                              # Max retries on 5xx/429
    headers={"X-Custom": "value"},          # Custom headers
)
```

---

## Go

### Installation

```bash
go get github.com/servetarslan02/hooksniff-go
```

### Quick Start

```go
package main

import (
    "fmt"
    hooksniff "github.com/servetarslan02/hooksniff-go"
)

func main() {
    hs := hooksniff.NewClient("hr_live_...")

    // Create an application
    app, err := hs.Application.Create(&hooksniff.ApplicationCreate{
        Name: "My App",
    })

    // Create an endpoint
    ep, err := hs.Endpoint.Create(&hooksniff.EndpointCreate{
        URL:           "https://app.com/webhook",
        ApplicationID: app.ID,
        Description:   hooksniff.String("Order notifications"),
    })

    // Send a webhook
    delivery, err := hs.Webhook.Send(&hooksniff.WebhookSend{
        EndpointID: ep.ID,
        Event:      "order.created",
        Data:       map[string]interface{}{"order_id": "12345", "amount": 99.99},
    })

    fmt.Println(delivery.ID)
}
```

### Webhook Verification

```go
wh := hooksniff.NewWebhook("whsec_...")

func handleWebhook(w http.ResponseWriter, r *http.Request) {
    payload, err := wh.Verify(r.Body, r.Header)
    if err != nil {
        w.WriteHeader(401)
        w.Write([]byte("Invalid signature"))
        return
    }

    fmt.Printf("Event: %s\n", payload.Event)
    w.WriteHeader(200)
}
```

---

## Java

### Installation (Maven)

```xml
<dependency>
    <groupId>com.hooksniff</groupId>
    <artifactId>hooksniff-java</artifactId>
    <version>0.4.0</version>
</dependency>
```

### Quick Start

```java
import com.hooksniff.HookSniff;

HookSniff hs = new HookSniff("hr_live_...");

// Create an application
Application app = hs.application().create(
    ApplicationCreate.builder().name("My App").build()
);

// Create an endpoint
Endpoint ep = hs.endpoint().create(
    EndpointCreate.builder()
        .url("https://app.com/webhook")
        .applicationId(app.getId())
        .description("Order notifications")
        .build()
);

// Send a webhook
WebhookDelivery delivery = hs.webhook().send(
    WebhookSend.builder()
        .endpointId(ep.getId())
        .event("order.created")
        .data(Map.of("order_id", "12345", "amount", 99.99))
        .build()
);

System.out.println(delivery.getId());
```

### Webhook Verification

```java
Webhook wh = new Webhook("whsec_...");

@PostMapping("/webhook")
public ResponseEntity<String> handleWebhook(
        @RequestBody String body,
        @RequestHeader Map<String, String> headers) {
    try {
        WebhookEvent event = wh.verify(body, headers);
        System.out.println("Event: " + event.getEvent());
        return ResponseEntity.ok("OK");
    } catch (WebhookVerificationException e) {
        return ResponseEntity.status(401).body("Invalid signature");
    }
}
```

---

## Rust

### Installation (Cargo.toml)

```toml
[dependencies]
hooksniff = "0.4"
tokio = { version = "1", features = ["full"] }
```

### Quick Start

```rust
use hooksniff::HookSniff;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let hs = HookSniff::new("hr_live_...");

    let app = hs.application().create(
        ApplicationCreate { name: "My App".into() }
    ).await?;

    let ep = hs.endpoint().create(
        EndpointCreate {
            url: "https://app.com/webhook".into(),
            application_id: app.id,
            description: Some("Order notifications".into()),
        }
    ).await?;

    let delivery = hs.webhook().send(
        WebhookSend {
            endpoint_id: ep.id,
            event: "order.created".into(),
            data: serde_json::json!({"order_id": "12345", "amount": 99.99}),
        }
    ).await?;

    println!("{}", delivery.id);
    Ok(())
}
```

---

## Ruby

### Installation

```bash
gem install hooksniff
```

### Quick Start

```ruby
require "hooksniff"

hs = HookSniff::Client.new("hr_live_...")

app = hs.application.create(name: "My App")
ep = hs.endpoint.create(
  url: "https://app.com/webhook",
  application_id: app.id,
  description: "Order notifications",
)

delivery = hs.webhook.send(
  endpoint_id: ep.id,
  event: "order.created",
  data: { order_id: "12345", amount: 99.99 },
)

puts delivery.id
```

---

## PHP

### Installation

```bash
composer require hooksniff/hooksniff-php
```

### Quick Start

```php
<?php
require 'vendor/autoload.php';

$hs = new HookSniff\Client("hr_live_...");

$app = $hs->application->create(["name" => "My App"]);
$ep = $hs->endpoint->create([
    "url" => "https://app.com/webhook",
    "application_id" => $app->id,
    "description" => "Order notifications",
]);

$delivery = $hs->webhook->send([
    "endpoint_id" => $ep->id,
    "event" => "order.created",
    "data" => ["order_id" => "12345", "amount" => 99.99],
]);

echo $delivery->id;
```

---

## C\#

### Installation

```bash
dotnet add package HookSniff.Sdk
```

### Quick Start

```csharp
using HookSniff;

var hs = new HookSniffClient("hr_live_...");

var app = await hs.Application.CreateAsync(new ApplicationCreate { Name = "My App" });
var ep = await hs.Endpoint.CreateAsync(new EndpointCreate {
    Url = "https://app.com/webhook",
    ApplicationId = app.Id,
    Description = "Order notifications",
});

var delivery = await hs.Webhook.SendAsync(new WebhookSend {
    EndpointId = ep.Id,
    Event = "order.created",
    Data = new Dictionary<string, object> { { "order_id", "12345" }, { "amount", 99.99 } },
});

Console.WriteLine(delivery.Id);
```

---

## Kotlin

### Installation (Gradle)

```kotlin
implementation("com.hooksniff:hooksniff-kotlin:0.5.0")
```

### Quick Start

```kotlin
import com.hooksniff.HookSniff

val hs = HookSniff("hr_live_...")

val app = hs.application.create(name = "My App")
val ep = hs.endpoint.create(
    url = "https://app.com/webhook",
    applicationId = app.id,
    description = "Order notifications",
)

val delivery = hs.webhook.send(
    endpointId = ep.id,
    event = "order.created",
    data = mapOf("order_id" to "12345", "amount" to 99.99),
)

println(delivery.id)
```

---

## Elixir

### Installation (mix.exs)

```elixir
{:hooksniff, "~> 0.4"}
```

### Quick Start

```elixir
{:ok, hs} = HookSniff.client("hr_live_...")

{:ok, app} = HookSniff.Application.create(hs, %{name: "My App"})
{:ok, ep} = HookSniff.Endpoint.create(hs, %{
  url: "https://app.com/webhook",
  application_id: app.id,
  description: "Order notifications"
})

{:ok, delivery} = HookSniff.Webhook.send(hs, %{
  endpoint_id: ep.id,
  event: "order.created",
  data: %{order_id: "12345", amount: 99.99}
})

IO.puts(delivery.id)
```

---

## Swift

### Installation (Swift Package Manager)

```swift
dependencies: [
    .package(url: "https://github.com/servetarslan02/hooksniff-swift", from: "0.4.0"),
]
```

### Quick Start

```swift
import HookSniff

let hs = HookSniff("hr_live_...")

let app = try await hs.application.create(name: "My App")
let ep = try await hs.endpoint.create(
    url: "https://app.com/webhook",
    applicationId: app.id,
    description: "Order notifications"
)

let delivery = try await hs.webhook.send(
    endpointId: ep.id,
    event: "order.created",
    data: ["order_id": "12345", "amount": 99.99]
)

print(delivery.id)
```

---

## Common Patterns

### Error Handling

All SDKs throw/return errors for:
- `401` — Invalid API key (`AuthenticationError`)
- `404` — Resource not found (`NotFoundError`)
- `429` — Rate limit exceeded (`RateLimitError`, auto-retry with backoff)
- `400` — Validation error (`ValidationError`)
- `500` — Server error (`ServerError`, auto-retry)

### Webhook Signature Verification

All SDKs verify signatures using the [Standard Webhooks](https://www.standardwebhooks.com/) spec:

```
signed_content = "{webhook_id}.{webhook_timestamp}.{body}"
signature = "v1," + base64(hmac_sha256(secret, signed_content))
```

**Important:** Reject webhooks with timestamps older than 5 minutes (replay protection).

### Auto-Pagination

All SDKs support auto-pagination for list endpoints:

```typescript
// Node.js
for await (const ep of hs.endpoint.list()) {
  console.log(ep.url);
}
```

```python
# Python
for ep in hs.endpoint.list():
    print(ep["url"])
```

### Rate Limits

| Plan | Webhooks/day | Requests/min |
|------|-------------|--------------|
| Developer | 300 | 100 |
| Startup | 30,000 | 500 |
| Pro | 100,000 | 1,000 |
| Enterprise | Unlimited | 5,000 |

SDKs automatically retry on `429` with exponential backoff.
