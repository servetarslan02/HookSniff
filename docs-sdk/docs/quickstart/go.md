---
sidebar_position: 3
---

# Go Quick Start

## Installation

```bash
go get github.com/servetarslan02/hooksniff-go@v1.4.0
```

## Setup

```go
package main

import (
    "fmt"
    "os"

    hooksniff "github.com/servetarslan02/hooksniff-go"
)

func main() {
    hs := hooksniff.New(os.Getenv("HOOKSNIFF_API_KEY"), nil)
}
```

## Create an Application

```go
app, err := hs.Application.Create(&hooksniff.ApplicationCreate{
    Name: "My App",
})
if err != nil {
    panic(err)
}

fmt.Printf("Application ID: %s\n", app.ID)
```

## Create an Endpoint

```go
ep, err := hs.Endpoint.Create(&hooksniff.EndpointCreate{
    URL:           "https://myapp.com/webhook",
    ApplicationID: app.ID,
    Description:   hooksniff.String("Order notifications"),
})
if err != nil {
    panic(err)
}

fmt.Printf("Endpoint ID: %s\n", ep.ID)
```

## Send a Webhook

```go
delivery, err := hs.Webhook.Send(&hooksniff.WebhookSend{
    EndpointID: ep.ID,
    Event:      "order.created",
    Data: map[string]interface{}{
        "order_id": "ORD-12345",
        "amount":   99.99,
    },
})
if err != nil {
    panic(err)
}

fmt.Printf("Delivery ID: %s\n", delivery.ID)
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

    fmt.Printf("Payload: %s\n", string(payload))
    w.WriteHeader(200)
}
```

## List Deliveries (Auto-Pagination)

```go
paginator := hs.Webhook.List()
for {
    item, ok := paginator.Next()
    if !ok {
        break
    }
    // item is json.RawMessage — unmarshal as needed
    fmt.Printf("Delivery: %s\n", string(item))
}
```

## Error Handling

```go
_, err := hs.Endpoint.Get("invalid_id")
if err != nil {
    switch e := err.(type) {
    case *hooksniff.AuthenticationError:
        fmt.Println("Invalid API key")
    case *hooksniff.NotFoundError:
        fmt.Println("Endpoint not found")
    case *hooksniff.RateLimitError:
        fmt.Printf("Rate limited, retry after %ds\n", e.RetryAfter)
    case *hooksniff.ValidationError:
        fmt.Println("Validation error:", e.Detail)
    default:
        fmt.Println("Error:", err)
    }
}
```
