# HookSniff — SDK Usage Examples

> Son güncelleme: 2026-05-12
> API Base URL: `https://hooksniff-api-1046140057667.europe-west1.run.app/v1`

All SDKs follow the same pattern: initialize client → use resources (endpoints, webhooks) → handle responses.

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
npm install hooksniff-sdk
```

### 1. Create an Endpoint

```typescript
import { HookSniff } from "hooksniff-sdk";

const hs = new HookSniff({ apiKey: "hr_live_your_api_key" });

const endpoint = await hs.endpoints.create({
  url: "https://your-app.com/webhooks",
  description: "Order notifications",
  event_types: ["order.created", "order.updated"],
});

console.log(endpoint.id);          // "ep_abc123"
console.log(endpoint.secret);      // "whsec_xyz..." (save this!)
```

### 2. Send a Webhook

```typescript
const delivery = await hs.webhooks.send({
  endpoint_id: "ep_abc123",
  event: "order.created",
  data: {
    order_id: "ORD-001",
    amount: 99.99,
    currency: "USD",
  },
});

console.log(delivery.id);          // "dlv_..."
console.log(delivery.status);      // "pending"
```

### 3. List Deliveries

```typescript
// Paginated listing
const deliveries = await hs.webhooks.list({
  endpoint_id: "ep_abc123",
  limit: 20,
});

for (const dlv of deliveries.data) {
  console.log(`${dlv.id}: ${dlv.status} — ${dlv.event_type}`);
}

// Auto-paginate all
import { paginate } from "hooksniff-sdk/pagination";

for await (const dlv of paginate(hs.webhooks, { endpoint_id: "ep_abc123" })) {
  console.log(dlv.id, dlv.status);
}
```

### 4. Verify Incoming Webhook

```typescript
import { Webhook } from "hooksniff-sdk";

const wh = new Webhook("whsec_your_endpoint_secret");

// In your Express/Fastify handler:
app.post("/webhooks", (req, res) => {
  try {
    const payload = wh.verify(req.body, req.headers);
    console.log("Verified event:", payload.event_type);
    console.log("Data:", payload.data);
    res.status(200).send("ok");
  } catch (err) {
    res.status(400).send("invalid signature");
  }
});
```

---

## Python

### Installation

```bash
pip install hooksniff
```

### 1. Create an Endpoint

```python
from hooksniff import HookSniff

hs = HookSniff(api_key="hr_live_your_api_key")

endpoint = hs.endpoints.create(
    url="https://your-app.com/webhooks",
    description="Order notifications",
    event_types=["order.created", "order.updated"],
)

print(endpoint.id)       # "ep_abc123"
print(endpoint.secret)   # "whsec_xyz..."
```

### 2. Send a Webhook

```python
delivery = hs.webhooks.send(
    endpoint_id="ep_abc123",
    event="order.created",
    data={
        "order_id": "ORD-001",
        "amount": 99.99,
        "currency": "USD",
    },
)

print(delivery.id)       # "dlv_..."
print(delivery.status)   # "pending"
```

### 3. List Deliveries with Pagination

```python
# Single page
deliveries = hs.webhooks.list(endpoint_id="ep_abc123", limit=20)
for dlv in deliveries.data:
    print(f"{dlv.id}: {dlv.status}")

# Auto-paginate
from hooksniff.pagination import paginate

for dlv in paginate(hs.webhooks, endpoint_id="ep_abc123"):
    print(dlv.id, dlv.status)

# Collect all at once
from hooksniff.pagination import collect_all

all_deliveries = collect_all(hs.webhooks, endpoint_id="ep_abc123")
print(f"Total: {len(all_deliveries)}")
```

### 4. Verify Incoming Webhook

```python
from hooksniff import Webhook

wh = Webhook("whsec_your_endpoint_secret")

# In your Flask/FastAPI handler:
@app.route("/webhooks", methods=["POST"])
def handle_webhook():
    try:
        payload = wh.verify(request.data, request.headers)
        print(f"Event: {payload['event_type']}")
        print(f"Data: {payload['data']}")
        return "ok", 200
    except Exception:
        return "invalid signature", 400
```

---

## Go

### Installation

```bash
go get github.com/servetarslan02/hooksniff-sdk-go
```

### 1. Create an Endpoint

```go
package main

import (
    "fmt"
    hooksniff "github.com/servetarslan02/hooksniff-sdk-go"
)

func main() {
    hs := hooksniff.NewClient("hr_live_your_api_key")

    endpoint, err := hs.Endpoints.Create(&hooksniff.CreateEndpointRequest{
        URL:         "https://your-app.com/webhooks",
        Description: hooksniff.String("Order notifications"),
        EventTypes:  []string{"order.created", "order.updated"},
    })
    if err != nil {
        panic(err)
    }

    fmt.Println(endpoint.ID)       // "ep_abc123"
    fmt.Println(endpoint.Secret)   // "whsec_xyz..."
}
```

### 2. Send a Webhook

```go
delivery, err := hs.Webhooks.Send(&hooksniff.SendWebhookRequest{
    EndpointID: "ep_abc123",
    Event:      "order.created",
    Data: map[string]interface{}{
        "order_id": "ORD-001",
        "amount":   99.99,
        "currency": "USD",
    },
})
if err != nil {
    panic(err)
}

fmt.Println(delivery.ID)       // "dlv_..."
fmt.Println(delivery.Status)   // "pending"
```

### 3. List Deliveries

```go
deliveries, err := hs.Webhooks.List(&hooksniff.ListWebhooksRequest{
    EndpointID: "ep_abc123",
    Limit:      20,
})
if err != nil {
    panic(err)
}

for _, dlv := range deliveries.Data {
    fmt.Printf("%s: %s\n", dlv.ID, dlv.Status)
}
```

### 4. Verify Incoming Webhook

```go
wh := hooksniff.NewWebhook("whsec_your_endpoint_secret")

// In your HTTP handler:
func handleWebhook(w http.ResponseWriter, r *http.Request) {
    payload, err := wh.Verify(r.Body, r.Header)
    if err != nil {
        w.WriteHeader(400)
        w.Write([]byte("invalid signature"))
        return
    }

    fmt.Printf("Event: %s\n", payload.EventType)
    fmt.Printf("Data: %v\n", payload.Data)
    w.WriteHeader(200)
}
```

---

## Java

### Installation (Maven)

```xml
<dependency>
    <groupId>dev.hooksniff</groupId>
    <artifactId>hooksniff-java</artifactId>
    <version>1.0.0</version>
</dependency>
```

### 1. Create an Endpoint

```java
import dev.hooksniff.HookSniff;
import dev.hooksniff.models.Endpoint;

HookSniff hs = new HookSniff("hr_live_your_api_key");

Endpoint endpoint = hs.endpoints().create(
    CreateEndpointRequest.builder()
        .url("https://your-app.com/webhooks")
        .description("Order notifications")
        .eventTypes(List.of("order.created", "order.updated"))
        .build()
);

System.out.println(endpoint.getId());       // "ep_abc123"
System.out.println(endpoint.getSecret());   // "whsec_xyz..."
```

### 2. Send a Webhook

```java
import dev.hooksniff.models.Delivery;

Delivery delivery = hs.webhooks().send(
    SendWebhookRequest.builder()
        .endpointId("ep_abc123")
        .event("order.created")
        .data(Map.of(
            "order_id", "ORD-001",
            "amount", 99.99,
            "currency", "USD"
        ))
        .build()
);

System.out.println(delivery.getId());       // "dlv_..."
System.out.println(delivery.getStatus());   // "pending"
```

### 3. List Deliveries

```java
DeliveryListResponse deliveries = hs.webhooks().list(
    ListWebhooksRequest.builder()
        .endpointId("ep_abc123")
        .limit(20)
        .build()
);

for (Delivery dlv : deliveries.getData()) {
    System.out.printf("%s: %s%n", dlv.getId(), dlv.getStatus());
}
```

### 4. Verify Incoming Webhook

```java
import dev.hooksniff.Webhook;

Webhook wh = new Webhook("whsec_your_endpoint_secret");

// In your Spring handler:
@PostMapping("/webhooks")
public ResponseEntity<String> handleWebhook(
        @RequestBody String body,
        @RequestHeader Map<String, String> headers) {
    try {
        WebhookPayload payload = wh.verify(body, headers);
        System.out.println("Event: " + payload.getEventType());
        return ResponseEntity.ok("ok");
    } catch (WebhookVerificationException e) {
        return ResponseEntity.status(400).body("invalid signature");
    }
}
```

---

## Rust

### Installation (Cargo.toml)

```toml
[dependencies]
hooksniff = "1.0"
tokio = { version = "1", features = ["full"] }
serde_json = "1"
```

### 1. Create an Endpoint

```rust
use hooksniff::HookSniff;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let hs = HookSniff::new("hr_live_your_api_key");

    let endpoint = hs.endpoints().create(
        CreateEndpointRequest {
            url: "https://your-app.com/webhooks".to_string(),
            description: Some("Order notifications".to_string()),
            event_types: Some(vec![
                "order.created".to_string(),
                "order.updated".to_string(),
            ]),
        },
    ).await?;

    println!("ID: {}", endpoint.id);
    println!("Secret: {}", endpoint.secret);
    Ok(())
}
```

### 2. Send a Webhook

```rust
let delivery = hs.webhooks().send(SendWebhookRequest {
    endpoint_id: "ep_abc123".to_string(),
    event: "order.created".to_string(),
    data: serde_json::json!({
        "order_id": "ORD-001",
        "amount": 99.99,
        "currency": "USD"
    }),
}).await?;

println!("Status: {}", delivery.status);
```

### 3. List Deliveries

```rust
let deliveries = hs.webhooks().list(ListWebhooksRequest {
    endpoint_id: Some("ep_abc123".to_string()),
    limit: Some(20),
    ..Default::default()
}).await?;

for dlv in &deliveries.data {
    println!("{}: {}", dlv.id, dlv.status);
}
```

### 4. Verify Incoming Webhook

```rust
use hooksniff::Webhook;

let wh = Webhook::new("whsec_your_endpoint_secret");

// In your Axum handler:
async fn handle_webhook(
    headers: HeaderMap,
    body: String,
) -> Result<String, StatusCode> {
    wh.verify(&body, &headers)
        .map(|payload| {
            println!("Event: {}", payload.event_type);
            "ok".to_string()
        })
        .map_err(|_| StatusCode::BAD_REQUEST)
}
```

---

## Ruby

### Installation

```bash
gem install hooksniff
```

### 1. Create an Endpoint

```ruby
require "hooksniff"

hs = HookSniff::Client.new(api_key: "hr_live_your_api_key")

endpoint = hs.endpoints.create(
  url: "https://your-app.com/webhooks",
  description: "Order notifications",
  event_types: ["order.created", "order.updated"],
)

puts endpoint.id       # "ep_abc123"
puts endpoint.secret   # "whsec_xyz..."
```

### 2. Send a Webhook

```ruby
delivery = hs.webhooks.send(
  endpoint_id: "ep_abc123",
  event: "order.created",
  data: {
    order_id: "ORD-001",
    amount: 99.99,
    currency: "USD",
  },
)

puts delivery.id       # "dlv_..."
puts delivery.status   # "pending"
```

### 3. List Deliveries

```ruby
deliveries = hs.webhooks.list(endpoint_id: "ep_abc123", limit: 20)

deliveries.data.each do |dlv|
  puts "#{dlv.id}: #{dlv.status}"
end
```

### 4. Verify Incoming Webhook

```ruby
wh = HookSniff::Webhook.new("whsec_your_endpoint_secret")

# In your Sinatra/Rails handler:
post "/webhooks" do
  payload = wh.verify(request.body.read, request.headers)
  puts "Event: #{payload["event_type"]}"
  status 200
rescue HookSniff::SignatureError
  status 400
end
```

---

## PHP

### Installation

```bash
composer require hooksniff/hooksniff-php
```

### 1. Create an Endpoint

```php
<?php
require 'vendor/autoload.php';

$hs = new HookSniff\Client('hr_live_your_api_key');

$endpoint = $hs->endpoints->create([
    'url' => 'https://your-app.com/webhooks',
    'description' => 'Order notifications',
    'event_types' => ['order.created', 'order.updated'],
]);

echo $endpoint->id;       // "ep_abc123"
echo $endpoint->secret;   // "whsec_xyz..."
```

### 2. Send a Webhook

```php
$delivery = $hs->webhooks->send([
    'endpoint_id' => 'ep_abc123',
    'event' => 'order.created',
    'data' => [
        'order_id' => 'ORD-001',
        'amount' => 99.99,
        'currency' => 'USD',
    ],
]);

echo $delivery->id;       // "dlv_..."
echo $delivery->status;   // "pending"
```

### 3. List Deliveries

```php
$deliveries = $hs->webhooks->list([
    'endpoint_id' => 'ep_abc123',
    'limit' => 20,
]);

foreach ($deliveries->data as $dlv) {
    echo "{$dlv->id}: {$dlv->status}\n";
}
```

### 4. Verify Incoming Webhook

```php
$wh = new HookSniff\Webhook('whsec_your_endpoint_secret');

// In your Laravel/Symfony controller:
public function handleWebhook(Request $request) {
    try {
        $payload = $wh->verify($request->getContent(), $request->headers->all());
        echo "Event: " . $payload['event_type'];
        return response('ok', 200);
    } catch (HookSniff\SignatureVerificationException $e) {
        return response('invalid signature', 400);
    }
}
```

---

## C\#

### Installation

```bash
dotnet add package HookSniff.Sdk
```

### 1. Create an Endpoint

```csharp
using HookSniff;

var hs = new HookSniffClient("hr_live_your_api_key");

var endpoint = await hs.Endpoints.CreateAsync(new CreateEndpointRequest
{
    Url = "https://your-app.com/webhooks",
    Description = "Order notifications",
    EventTypes = new[] { "order.created", "order.updated" }
});

Console.WriteLine(endpoint.Id);       // "ep_abc123"
Console.WriteLine(endpoint.Secret);   // "whsec_xyz..."
```

### 2. Send a Webhook

```csharp
var delivery = await hs.Webhooks.SendAsync(new SendWebhookRequest
{
    EndpointId = "ep_abc123",
    Event = "order.created",
    Data = new Dictionary<string, object>
    {
        { "order_id", "ORD-001" },
        { "amount", 99.99 },
        { "currency", "USD" }
    }
});

Console.WriteLine(delivery.Id);       // "dlv_..."
Console.WriteLine(delivery.Status);   // "pending"
```

### 3. List Deliveries

```csharp
var deliveries = await hs.Webhooks.ListAsync(new ListWebhooksRequest
{
    EndpointId = "ep_abc123",
    Limit = 20
});

foreach (var dlv in deliveries.Data)
{
    Console.WriteLine($"{dlv.Id}: {dlv.Status}");
}
```

### 4. Verify Incoming Webhook

```csharp
var wh = new WebhookVerifier("whsec_your_endpoint_secret");

// In your ASP.NET controller:
[HttpPost("webhooks")]
public IActionResult HandleWebhook()
{
    try
    {
        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync();
        var payload = wh.Verify(body, Request.Headers);
        Console.WriteLine($"Event: {payload.EventType}");
        return Ok();
    }
    catch (SignatureVerificationException)
    {
        return BadRequest("invalid signature");
    }
}
```

---

## Kotlin

### Installation (Gradle)

```kotlin
implementation("dev.hooksniff:hooksniff-kotlin:1.0.0")
```

### 1. Create an Endpoint

```kotlin
import dev.hooksniff.HookSniff

val hs = HookSniff(apiKey = "hr_live_your_api_key")

val endpoint = hs.endpoints.create(
    url = "https://your-app.com/webhooks",
    description = "Order notifications",
    eventTypes = listOf("order.created", "order.updated"),
)

println(endpoint.id)       // "ep_abc123"
println(endpoint.secret)   // "whsec_xyz..."
```

### 2. Send a Webhook

```kotlin
val delivery = hs.webhooks.send(
    endpointId = "ep_abc123",
    event = "order.created",
    data = mapOf(
        "order_id" to "ORD-001",
        "amount" to 99.99,
        "currency" to "USD",
    ),
)

println(delivery.id)       // "dlv_..."
println(delivery.status)   // "pending"
```

### 3. List Deliveries

```kotlin
val deliveries = hs.webhooks.list(
    endpointId = "ep_abc123",
    limit = 20,
)

deliveries.data.forEach { dlv ->
    println("${dlv.id}: ${dlv.status}")
}
```

### 4. Verify Incoming Webhook

```kotlin
import dev.hooksniff.Webhook

val wh = Webhook("whsec_your_endpoint_secret")

// In your Ktor handler:
post("/webhooks") {
    try {
        val payload = wh.verify(call.receiveText(), call.request.headers)
        println("Event: ${payload.eventType}")
        call.respondText("ok")
    } catch (e: SignatureVerificationException) {
        call.respondText("invalid signature", status = HttpStatusCode.BadRequest)
    }
}
```

---

## Elixir

### Installation (mix.exs)

```elixir
{:hooksniff, "~> 1.0"}
```

### 1. Create an Endpoint

```elixir
{:ok, hs} = HookSniff.client(api_key: "hr_live_your_api_key")

{:ok, endpoint} = HookSniff.Endpoints.create(hs, %{
  url: "https://your-app.com/webhooks",
  description: "Order notifications",
  event_types: ["order.created", "order.updated"]
})

IO.puts(endpoint.id)       # "ep_abc123"
IO.puts(endpoint.secret)   # "whsec_xyz..."
```

### 2. Send a Webhook

```elixir
{:ok, delivery} = HookSniff.Webhooks.send(hs, %{
  endpoint_id: "ep_abc123",
  event: "order.created",
  data: %{
    order_id: "ORD-001",
    amount: 99.99,
    currency: "USD"
  }
})

IO.puts(delivery.id)       # "dlv_..."
IO.puts(delivery.status)   # "pending"
```

### 3. List Deliveries

```elixir
{:ok, deliveries} = HookSniff.Webhooks.list(hs, %{
  endpoint_id: "ep_abc123",
  limit: 20
})

Enum.each(deliveries.data, fn dlv ->
  IO.puts("#{dlv.id}: #{dlv.status}")
end)
```

### 4. Verify Incoming Webhook

```elixir
{:ok, wh} = HookSniff.Webhook.new("whsec_your_endpoint_secret")

# In your Phoenix controller:
def handle_webhook(conn, _params) do
  {:ok, body, conn} = Plug.Conn.read_body(conn)

  case HookSniff.Webhook.verify(wh, body, conn.req_headers) do
    {:ok, payload} ->
      IO.puts("Event: #{payload["event_type"]}")
      send_resp(conn, 200, "ok")

    {:error, _reason} ->
      send_resp(conn, 400, "invalid signature")
  end
end
```

---

## Swift

### Installation (Swift Package Manager)

```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/servetarslan02/hooksniff-sdk-swift", from: "1.0.0"),
]
```

### 1. Create an Endpoint

```swift
import HookSniff

let hs = HookSniff(apiKey: "hr_live_your_api_key")

let endpoint = try await hs.endpoints.create(
    url: "https://your-app.com/webhooks",
    description: "Order notifications",
    eventTypes: ["order.created", "order.updated"]
)

print(endpoint.id)       // "ep_abc123"
print(endpoint.secret)   // "whsec_xyz..."
```

### 2. Send a Webhook

```swift
let delivery = try await hs.webhooks.send(
    endpointId: "ep_abc123",
    event: "order.created",
    data: [
        "order_id": "ORD-001",
        "amount": 99.99,
        "currency": "USD"
    ]
)

print(delivery.id)       // "dlv_..."
print(delivery.status)   // "pending"
```

### 3. List Deliveries

```swift
let deliveries = try await hs.webhooks.list(
    endpointId: "ep_abc123",
    limit: 20
)

for dlv in deliveries.data {
    print("\(dlv.id): \(dlv.status)")
}
```

### 4. Verify Incoming Webhook

```swift
import HookSniff

let wh = try Webhook(secret: "whsec_your_endpoint_secret")

// In your Vapor handler:
app.post("webhooks") { req async throws -> Response in
    let body = req.body.string ?? ""

    do {
        let payload = try wh.verify(body: body, headers: req.headers)
        print("Event: \(payload.eventType)")
        return Response(status: .ok)
    } catch {
        return Response(status: .badRequest, body: "invalid signature")
    }
}
```

---

## Common Patterns

### Error Handling

All SDKs throw/return errors for:
- `401` — Invalid API key
- `404` — Resource not found
- `429` — Rate limit exceeded (auto-retry with backoff)
- `500` — Server error (auto-retry up to 2 times)

### Webhook Signature Verification

All SDKs verify signatures using the [Standard Webhooks](https://www.standardwebhooks.com/) spec:

```
signed_content = "{webhook_id}.{webhook_timestamp}.{body}"
signature = "v1," + base64(hmac_sha256(secret, signed_content))
```

**Important:** Reject webhooks with timestamps older than 5 minutes (replay protection).

### Pagination

All SDKs support cursor-based pagination. Use `limit` and `cursor` parameters, or use the built-in pagination helpers for auto-pagination.

### Rate Limits

- **Free:** 1,000 webhooks/day, 100 requests/min
- **Pro:** 10,000 webhooks/day, 1,000 requests/min
- **Business:** 100,000 webhooks/day, 5,000 requests/min

SDKs automatically retry on `429` with exponential backoff.
