---
sidebar_position: 9
---

# C# Quick Start

## Installation

### NuGet Package Manager

```powershell
Install-Package HookSniff.Sdk
```

### .NET CLI

```bash
dotnet add package HookSniff.Sdk
```

## Setup

```csharp
using HookSniff;

// Initialize client
var client = new HookSniffClient("hr_live_your_api_key");

// Or with options
var client = new HookSniffClient("hr_live_your_api_key", new HookSniffOptions
{
    BaseUrl = "https://hooksniff-api-1046140057667.europe-west1.run.app",
    Timeout = TimeSpan.FromSeconds(30),
});
```

## Endpoints

```csharp
// List all endpoints
var endpoints = await client.Endpoints.ListAsync();

// Create an endpoint
var endpoint = await client.Endpoints.CreateAsync(new EndpointCreateInput
{
    Url = "https://example.com/webhook",
    Description = "My webhook endpoint",
    RateLimit = 100,
});

// Get a specific endpoint
var details = await client.Endpoints.GetAsync(endpoint.Id);

// Update an endpoint
var updated = await client.Endpoints.UpdateAsync(endpoint.Id, new EndpointUpdateInput
{
    Url = "https://new-url.com/webhook",
});

// Delete an endpoint
await client.Endpoints.DeleteAsync(endpoint.Id);

// Rotate signing secret
var key = await client.Endpoints.RotateSecretAsync(endpoint.Id);
```

## Webhooks

```csharp
// Send a webhook
var delivery = await client.Webhooks.SendAsync(new WebhookSendInput
{
    EndpointId = endpoint.Id,
    EventType = "order.created",
    Data = new { order_id = "12345", amount = 99.99 },
});

// List deliveries
var deliveries = await client.Webhooks.ListAsync(new WebhookListInput
{
    Status = "delivered",
    Page = 1,
});

// Replay a delivery
await client.Webhooks.ReplayAsync(delivery.Id);

// Batch send
var batch = await client.Webhooks.BatchAsync(new WebhookBatchInput
{
    EndpointId = endpoint.Id,
    Events = new[]
    {
        new WebhookEvent { EventType = "order.created", Data = new { order_id = "1" } },
        new WebhookEvent { EventType = "order.created", Data = new { order_id = "2" } },
    },
});
```

## Webhook Verification

```csharp
using HookSniff;

var webhook = new Webhook("whsec_your_signing_secret");

// In your endpoint handler
[HttpPost("webhook")]
public IActionResult HandleWebhook()
{
    try
    {
        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync();
        
        var payload = webhook.Verify(body, new Dictionary<string, string>
        {
            ["webhook-id"] = Request.Headers["webhook-id"],
            ["webhook-timestamp"] = Request.Headers["webhook-timestamp"],
            ["webhook-signature"] = Request.Headers["webhook-signature"],
        });
        // Payload is verified — process it
        return Ok();
    }
    catch (SignatureVerificationException)
    {
        return Unauthorized();
    }
}
```

## Error Handling

```csharp
try
{
    await client.Endpoints.GetAsync("nonexistent");
}
catch (ApiException e)
{
    Console.WriteLine($"API Error {e.StatusCode}: {e.Message}");
}
catch (Exception e)
{
    Console.WriteLine($"Network error: {e.Message}");
}
```
