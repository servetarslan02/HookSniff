# HookSniff Go SDK

[![Go Reference](https://pkg.go.dev/badge/github.com/servetarslan02/hooksniff-go.svg)](https://pkg.go.dev/github.com/servetarslan02/hooksniff-go)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Go client library for the [HookSniff](https://hooksniff.vercel.app) webhook delivery API.

## Installation

```bash
go get github.com/servetarslan02/hooksniff-go
```

## Quick Start

```go
package main

import (
    "context"
    "fmt"
    "log"

    hooksniff "github.com/servetarslan02/hooksniff-go"
)

func main() {
    // Configure client
    cfg := hooksniff.NewConfiguration()
    cfg.DefaultHeader["Authorization"] = "Bearer hr_live_your_api_key_here"
    client := hooksniff.NewAPIClient(cfg)
    ctx := context.Background()

    // Create an endpoint
    endpoint, _, err := client.EndpointsAPI.EndpointsPost(ctx).
        CreateEndpointRequest(hooksniff.CreateEndpointRequest{
            Url:         "https://myapp.com/webhook",
            Description: hooksniff.PtrString("Order notifications"),
        }).
        Execute()
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Endpoint created: %s\n", endpoint.Id)

    // Send a webhook
    delivery, _, err := client.WebhooksAPI.WebhooksPost(ctx).
        CreateWebhookRequest(hooksniff.CreateWebhookRequest{
            EndpointId: endpoint.Id,
            Event:      hooksniff.PtrString("order.created"),
            Data:       map[string]interface{}{"order_id": "12345"},
        }).
        Execute()
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Delivery queued: %s\n", delivery.Id)
}
```

## Available Services

Each service maps to a group of API endpoints:

| Service | Description |
|---------|-------------|
| `client.EndpointsAPI` | Manage webhook destination endpoints |
| `client.WebhooksAPI` | Send, list, replay, and export webhook deliveries |
| `client.AuthAPI` | Registration, login, password reset, 2FA |
| `client.APIKeysAPI` | Manage API keys |
| `client.AlertsAPI` | Alert rules and notifications |
| `client.AnalyticsAPI` | Delivery trends, success rates, latency metrics |
| `client.BillingAPI` | Subscription, usage, invoices |
| `client.TeamsAPI` | Team management and invitations |
| `client.NotificationsAPI` | In-app notification management |
| `client.SchemasAPI` | Event schema management |
| `client.SearchAPI` | Search webhook deliveries |
| `client.HealthAPI` | System status and endpoint health |
| `client.AdminAPI` | Admin operations |
| `client.AuditLogAPI` | Audit log access |
| `client.InboundAPI` | Receive webhooks from external providers |
| `client.TemplatesAPI` | Webhook templates |
| `client.RoutingAPI` | Delivery routing configuration |
| `client.RateLimitsAPI` | Rate limit management |
| `client.CustomDomainsAPI` | Custom domain management |
| `client.CustomerPortalAPI` | Customer portal operations |
| `client.DeliveryDetailsAPI` | Detailed delivery information |
| `client.DevicesAPI` | Push notification device tokens |
| `client.EmbedAPI` | Embed widget configuration |
| `client.EventsAPI` | Event management |
| `client.OAuthAPI` | OAuth configuration |
| `client.OutboundIPsAPI` | Outbound IP addresses |
| `client.PlaygroundAPI` | API playground |
| `client.SimulatorAPI` | Webhook simulator |
| `client.SSOAPI` | SSO configuration |
| `client.StatsAPI` | Account usage statistics |
| `client.StreamAPI` | Real-time event streaming |
| `client.TransformsAPI` | Transform rules |

## Usage Examples

### List Endpoints

```go
endpoints, _, err := client.EndpointsAPI.EndpointsGet(ctx).Execute()
if err != nil {
    log.Fatal(err)
}
for _, ep := range endpoints {
    fmt.Printf("  %s: %s (%s)\n", ep.Id, ep.Url, ep.Status)
}
```

### Get Endpoint Details

```go
endpoint, _, err := client.EndpointsAPI.EndpointsIdGet(ctx, "ep_abc123").Execute()
if err != nil {
    log.Fatal(err)
}
fmt.Printf("URL: %s\n", endpoint.Url)
```

### List Deliveries

```go
deliveries, _, err := client.WebhooksAPI.WebhooksGet(ctx).
    Status("failed").
    Page(1).
    PerPage(20).
    Execute()
if err != nil {
    log.Fatal(err)
}
for _, d := range deliveries.Deliveries {
    fmt.Printf("  %s: %s\n", d.Id, d.Status)
}
```

### Replay a Delivery

```go
replayed, _, err := client.WebhooksAPI.WebhooksIdReplayPost(ctx, "dlv_abc123").Execute()
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Replay queued: %s\n", replayed.Id)
```

### Check System Health

```go
status, _, err := client.HealthAPI.StatusGet(ctx).Execute()
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Overall: %s\n", status.OverallStatus)
for _, c := range status.Components {
    fmt.Printf("  %s: %s\n", c.Name, c.Status)
}
```

## Configuration

```go
cfg := hooksniff.NewConfiguration()
cfg.BasePath = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1" // default
cfg.DefaultHeader["Authorization"] = "Bearer hr_live_..."
client := hooksniff.NewAPIClient(cfg)
```

## Error Handling

The SDK returns errors as the last return value:

```go
endpoint, resp, err := client.EndpointsAPI.EndpointsPost(ctx).
    CreateEndpointRequest(req).
    Execute()
if err != nil {
    // resp contains the HTTP response details
    fmt.Printf("HTTP %d: %s\n", resp.StatusCode, err.Error())
}
```

## License

MIT
