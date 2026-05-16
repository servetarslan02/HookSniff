---
sidebar_position: 3
---

# Go Quick Start

## Installation

```bash
go get github.com/servetarslan02/hooksniff-go
```

## Setup

```go
package main

import (
    "fmt"
    hooksniff "github.com/servetarslan02/hooksniff-go"
)

func main() {
    // Initialize client
    client := hooksniff.New("sk_live_your_api_key", nil)

    // Or with options
    client = hooksniff.New("sk_live_your_api_key", &hooksniff.Options{
        BaseURL:    "https://hooksniff-api-1046140057667.europe-west1.run.app",
        NumRetries: 2,
    })
}
```

## Endpoints

```go
// List all endpoints
endpoints, err := client.Endpoints.List()

// Create an endpoint
endpoint, err := client.Endpoints.Create(hooksniff.EndpointCreateInput{
    URL:         "https://example.com/webhook",
    Description: "My webhook endpoint",
    RateLimit:   100,
})

// Get a specific endpoint
details, err := client.Endpoints.Get(endpoint.ID)

// Update an endpoint
updated, err := client.Endpoints.Update(endpoint.ID, hooksniff.EndpointUpdateInput{
    URL: "https://new-url.com/webhook",
})

// Delete an endpoint
err = client.Endpoints.Delete(endpoint.ID)

// Rotate signing secret
key, err := client.Endpoints.RotateSecret(endpoint.ID)
```

## Webhooks

```go
// Send a webhook
delivery, err := client.Webhooks.Send(hooksniff.WebhookSendInput{
    EndpointID: endpoint.ID,
    EventType:  "order.created",
    Data:       map[string]interface{}{"order_id": "12345", "amount": 99.99},
})

// List deliveries
deliveries, err := client.Webhooks.List(&hooksniff.WebhookListInput{
    Status: "delivered",
    Page:   1,
})

// Replay a delivery
err = client.Webhooks.Replay(delivery.ID)

// Batch send
batch, err := client.Webhooks.Batch(hooksniff.WebhookBatchInput{
    EndpointID: endpoint.ID,
    Events: []hooksniff.WebhookEvent{
        {EventType: "order.created", Data: map[string]interface{}{"order_id": "1"}},
        {EventType: "order.created", Data: map[string]interface{}{"order_id": "2"}},
    },
})
```

## Webhook Verification

```go
import "github.com/servetarslan02/hooksniff-go/webhook"

wh := webhook.New("whsec_your_signing_secret")

// In your HTTP handler
func handleWebhook(w http.ResponseWriter, r *http.Request) {
    payload, err := wh.Verify(r.Body, r.Header)
    if err != nil {
        http.Error(w, "Invalid signature", http.StatusUnauthorized)
        return
    }
    // Payload is verified — process it
    fmt.Printf("Received event: %+v\n", payload)
    w.WriteHeader(http.StatusOK)
}
```

## Other Resources

```go
// Auth
client.Auth.Register(hooksniff.RegisterInput{Email: "user@example.com", Password: "pass"})
client.Auth.Login(hooksniff.LoginInput{Email: "user@example.com", Password: "pass"})

// API Keys
keys, _ := client.APIKeys.List()
newKey, _ := client.APIKeys.Create(hooksniff.APIKeyCreateInput{Name: "Production"})

// Analytics
stats, _ := client.Analytics.Stats()
trends, _ := client.Analytics.Trends("7d")

// Billing
plans, _ := client.Billing.Plans()
client.Billing.Upgrade(hooksniff.BillingUpgradeInput{Plan: "pro"})

// Teams
members, _ := client.Teams.Members()
client.Teams.Invite(hooksniff.TeamInviteInput{Email: "colleague@example.com", Role: "member"})

// Search
results, _ := client.Search.Query(hooksniff.SearchInput{
    Query:   "order.created",
    Filters: map[string]string{"status": "failed"},
})

// Health
health, _ := client.Health.Check()
```

## Error Handling

```go
endpoint, err := client.Endpoints.Get("nonexistent")
if err != nil {
    if apiErr, ok := err.(*hooksniff.ApiException); ok {
        fmt.Printf("API Error %d: %s\n", apiErr.StatusCode, apiErr.Body)
    } else {
        fmt.Printf("Network error: %v\n", err)
    }
}
```
