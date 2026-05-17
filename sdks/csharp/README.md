# HookSniff C# SDK

Official C# SDK for the [HookSniff](https://hooksniff.com) webhook delivery API.

## Installation

```bash
dotnet add package HookSniff
```

## Usage

```csharp
using HookSniff;
using HookSniff.Models;

// Initialize client
var client = new HookSniffClient("your-api-key");

// List endpoints
var endpoints = await client.Endpoint.ListAsync();

// Create an endpoint
var endpoint = await client.Endpoint.CreateAsync(new EndpointIn
{
    Url = "https://example.com/webhook"
});

// Send a message
var message = await client.Message.CreateAsync(new MessageIn
{
    EventType = "order.created",
    Payload = new { order_id = "12345" }
});

// List message attempts
var attempts = await client.MessageAttempt.ListByMsgAsync(message.Id);

// Verify incoming webhook signature
var webhook = new Webhook("whsec_...");
var payload = webhook.Verify(rawBody, headers);

// List event types
var eventTypes = await client.EventType.ListAsync();

// Health check
await client.Health.PingAsync();
```

## API Reference

### Resources

- **Endpoint** — Create, list, update, delete endpoints
- **Message** — Create and list messages
- **MessageAttempt** — List and inspect delivery attempts
- **EventType** — Manage event types
- **Authentication** — Auth operations
- **Statistics** — Usage statistics
- **Health** — Health check

## Requirements

- .NET 8.0+

## License

MIT
