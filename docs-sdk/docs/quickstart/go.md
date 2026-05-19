---
sidebar_position: 3
---

# Go Quick Start

## Installation

```bash
go get github.com/servetarslan02/hooksniff-go@v1.3.0
```

## Setup

```go
package main

import (
    "context"
    "fmt"
    "os"

    hooksniff "github.com/servetarslan02/hooksniff-go"
)

func main() {
    hs := hooksniff.NewClient(os.Getenv("HOOKSNIFF_API_KEY"))
    ctx := context.Background()
}
```

## Create an Endpoint

```go
endpoint, err := hs.Endpoint.Create(ctx, &hooksniff.EndpointIn{
    Url:         "https://myapp.com/webhook",
    Description: hooksniff.String("Order notifications"),
    EventTypes:  []string{"order.created", "order.updated"},
})
if err != nil {
    panic(err)
}

fmt.Printf("Endpoint ID: %s\n", endpoint.Id)
fmt.Printf("Signing secret: %s\n", endpoint.Secret)
```

## Send a Webhook

```go
delivery, err := hs.Message.Create(ctx, &hooksniff.MessageIn{
    EndpointId: endpoint.Id,
    Event:      "order.created",
    Data: map[string]interface{}{
        "order_id": "ORD-12345",
        "amount":   99.99,
        "currency": "USD",
    },
})
if err != nil {
    panic(err)
}

fmt.Printf("Delivery ID: %s\n", delivery.Id)
fmt.Printf("Status: %s\n", delivery.Status)
```

## Verify Incoming Webhooks

```go
wh, err := hooksniff.NewWebhook("whsec_your_signing_secret")
if err != nil {
    panic(err)
}

func handleWebhook(w http.ResponseWriter, r *http.Request) {
    payload, err := wh.Verify(r.Body, r.Header)
    if err != nil {
        w.WriteHeader(401)
        w.Write([]byte("Invalid signature"))
        return
    }

    fmt.Printf("Event: %s\n", payload.Event)
    fmt.Printf("Data: %v\n", payload.Data)
    w.WriteHeader(200)
}
```

## List Deliveries

```go
deliveries, err := hs.MessageAttempt.ListByEndpoint(ctx, endpoint.Id, &hooksniff.MessageAttemptListOptions{
    Limit: hooksniff.Int32(20),
})
if err != nil {
    panic(err)
}

for _, attempt := range deliveries.Data {
    fmt.Printf("%s: %d\n", attempt.Id, attempt.ResponseStatusCode)
}
```

## Error Handling

```go
endpoint, err := hs.Endpoint.Create(ctx, &hooksniff.EndpointIn{Url: "invalid"})
if err != nil {
    var httpErr *hooksniff.HttpError
    if errors.As(err, &httpErr) {
        fmt.Printf("HTTP %d: %s\n", httpErr.StatusCode, httpErr.Message)
        if httpErr.StatusCode == 429 {
            retryAfter := httpErr.Headers.Get("Retry-After")
            fmt.Printf("Retry after %s seconds\n", retryAfter)
        }
    }
}
```
