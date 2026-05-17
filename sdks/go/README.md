# HookSniff Go SDK

Adapted from Svix SDK architecture for HookSniff webhook delivery platform.

## Installation

```bash
go get github.com/servetarslan02/hooksniff-go
```

## Quick Start

```go
package main

import (
    "fmt"
    "github.com/servetarslan02/hooksniff-go"
)

func main() {
    hs, err := hooksniff.New("hooksniff_xxx", nil)
    if err != nil {
        panic(err)
    }

    // List endpoints
    endpoints, err := hs.Endpoint.List(nil)
    if err != nil {
        panic(err)
    }
    fmt.Println(endpoints)
}
```

## Resources

| Resource | Description |
|----------|-------------|
| `hs.Endpoint` | Endpoint CRUD, secrets, stats |
| `hs.Message` | Send webhooks, list deliveries |
| `hs.MessageAttempt` | Delivery attempts |
| `hs.Authentication` | Login, register, profile |
| `hs.EventType` | Event type management |
| `hs.Statistics` | Analytics & stats |

## License

MIT
