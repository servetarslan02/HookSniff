# HookSniff Go SDK

<p align="center">
  <a href="https://pkg.go.dev/github.com/servetarslan02/hooksniff-go"><img src="https://pkg.go.dev/badge/github.com/servetarslan02/hooksniff-go.svg" alt="Go Reference"></a>
  <a href="https://github.com/servetarslan02/HookSniff"><img src="https://img.shields.io/github/license/servetarslan02/HookSniff" alt="License"></a>
</p>

Go SDK for the [HookSniff](https://hooksniff.com) webhook delivery platform.

## Installation

```bash
go get github.com/servetarslan02/hooksniff-go
```

## Quick Start

```go
package main

import (
    "fmt"
    hooksniff "github.com/servetarslan02/hooksniff-go"
)

func main() {
    client := hooksniff.New("hs_xxx")

    // List endpoints
    endpoints, err := client.Endpoint.List(nil)
    if err != nil {
        panic(err)
    }
    fmt.Println(endpoints)

    // Create an endpoint
    endpoint, err := client.Endpoint.Create(&hooksniff.EndpointIn{
        Url:         "https://example.com/webhook",
        Description: hooksniff.String("My endpoint"),
    })

    // Send a webhook
    message, err := client.Message.Create(&hooksniff.MessageIn{
        Event: "order.created",
        Data:  map[string]interface{}{"order_id": "123"},
    })
}
```

## Webhook Verification

```go
import "github.com/servetarslan02/hooksniff-go"

wh, err := hooksniff.NewWebhook("whsec_xxx")
if err != nil {
    panic(err)
}

payload, err := wh.Verify(body, http.Header{
    "Hooksniff-Id":        []string{r.Header.Get("hooksniff-id")},
    "Hooksniff-Signature": []string{r.Header.Get("hooksniff-signature")},
    "Hooksniff-Timestamp": []string{r.Header.Get("hooksniff-timestamp")},
})
if err != nil {
    // Invalid signature
}
```

## Resources

| Resource | Methods |
|----------|---------|
| `Endpoint` | `List`, `Create`, `Get`, `Update`, `Delete` |
| `Message` | `Create`, `List`, `Get` |
| `MessageAttempt` | `List`, `ListByMsg`, `Get`, `Resend` |
| `Authentication` | `DashboardAccess` |
| `EventType` | `List` |
| `Statistics` | `Aggregate` |

## Links

- [Documentation](https://docs.hooksniff.com)
- [Go Reference](https://pkg.go.dev/github.com/servetarslan02/hooksniff-go)
- [GitHub](https://github.com/servetarslan02/HookSniff)
