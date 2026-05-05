# HookRelay Go SDK

Go client library for the [HookRelay](https://github.com/servetarslan02/hookrelay) webhook delivery API.

## Installation

```bash
go get github.com/servetarslan02/hookrelay/sdks/go
```

## Quick Start

```go
package main

import (
    "context"
    "fmt"
    "log"

    hookrelay "github.com/servetarslan02/hookrelay/sdks/go"
)

func main() {
    client := hookrelay.New("hr_live_YOUR_API_KEY")

    // Create an endpoint
    ep, err := client.Endpoints.Create(context.Background(), &hookrelay.CreateEndpointRequest{
        URL:         "https://myapp.com/webhook",
        Description: "My app webhook",
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Endpoint: %s\n", ep.ID)

    // Send a webhook
    delivery, err := client.Webhooks.Send(context.Background(), &hookrelay.SendWebhookRequest{
        EndpointID: ep.ID,
        Event:      "order.created",
        Data: map[string]interface{}{
            "order_id": "ord_123",
            "total":    49.99,
        },
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Delivery: %s (status: %s)\n", delivery.ID, delivery.Status)
}
```

## API Reference

### Endpoints

```go
// List all endpoints
endpoints, err := client.Endpoints.List(ctx)

// Create endpoint
ep, err := client.Endpoints.Create(ctx, &hookrelay.CreateEndpointRequest{
    URL:              "https://myapp.com/webhook",
    Description:      "My webhook endpoint",
    RoutingStrategy:  "failover",
    FallbackURL:      "https://backup.myapp.com/webhook",
    EventFilter:      []string{"order.*", "payment.completed"},
})

// Get endpoint
ep, err := client.Endpoints.Get(ctx, "ep_abc123")

// Delete endpoint
err := client.Endpoints.Delete(ctx, "ep_abc123")

// Rotate signing secret
result, err := client.Endpoints.RotateSecret(ctx, "ep_abc123")
```

### Webhooks

```go
// Send webhook
delivery, err := client.Webhooks.Send(ctx, &hookrelay.SendWebhookRequest{
    EndpointID: "ep_abc123",
    Event:      "order.created",
    Data:       map[string]interface{}{"order_id": "12345"},
})

// Send batch
deliveries, errors, err := client.Webhooks.SendBatch(ctx, []*hookrelay.SendWebhookRequest{
    {EndpointID: "ep_1", Event: "order.created", Data: map[string]interface{}{"id": "1"}},
    {EndpointID: "ep_2", Event: "user.signup", Data: map[string]interface{}{"id": "2"}},
})

// List deliveries
resp, err := client.Webhooks.List(ctx, 1)

// Get delivery details
delivery, err := client.Webhooks.Get(ctx, "wh_abc123")

// Replay delivery
delivery, err := client.Webhooks.Replay(ctx, "wh_abc123")
```

### Custom API URL

```go
client := hookrelay.NewWithBaseURL("hr_live_YOUR_KEY", "https://api.hookrelay.com/v1")
```

## License

MIT
