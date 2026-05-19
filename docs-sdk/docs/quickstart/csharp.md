---
sidebar_position: 9
---

# C# Quick Start

## Installation

```bash
dotnet add package HookSniff
```

### Package Reference

```xml
<PackageReference Include="HookSniff" Version="1.2.0" />
```

## Setup

```csharp
using HookSniff;

var hs = new HookSniffClient(
    apiKey: Environment.GetEnvironmentVariable("HOOKSNIFF_API_KEY")
);
```

## Create an Endpoint

```csharp
var endpoint = await hs.Endpoints.CreateAsync(new CreateEndpointRequest
{
    Url = "https://myapp.com/webhook",
    Description = "Order notifications",
    EventTypes = new[] { "order.created", "order.updated" }
});

Console.WriteLine($"Endpoint ID: {endpoint.Id}");
Console.WriteLine($"Signing secret: {endpoint.Secret}");
```

## Send a Webhook

```csharp
var delivery = await hs.Webhooks.SendAsync(new SendWebhookRequest
{
    EndpointId = endpoint.Id,
    Event = "order.created",
    Data = new Dictionary<string, object>
    {
        { "order_id", "ORD-12345" },
        { "amount", 99.99 },
        { "currency", "USD" }
    }
});

Console.WriteLine($"Delivery ID: {delivery.Id}");
Console.WriteLine($"Status: {delivery.Status}");
```

## Verify Incoming Webhooks

```csharp
using HookSniff;

var wh = new WebhookVerifier("whsec_your_signing_secret");

// ASP.NET controller
[HttpPost("webhook")]
public async Task<IActionResult> HandleWebhook()
{
    try
    {
        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync();
        var payload = wh.Verify(body, Request.Headers);

        Console.WriteLine($"Event: {payload.EventType}");
        Console.WriteLine($"Data: {payload.Data}");

        return Ok();
    }
    catch (SignatureVerificationException)
    {
        return Unauthorized("Invalid signature");
    }
}
```

## List Deliveries

```csharp
var deliveries = await hs.Webhooks.ListAsync(new ListWebhooksRequest
{
    EndpointId = endpoint.Id,
    Limit = 20
});

foreach (var dlv in deliveries.Data)
{
    Console.WriteLine($"{dlv.Id}: {dlv.Status}");
}
```

## Error Handling

```csharp
try
{
    await hs.Endpoints.GetAsync("nonexistent");
}
catch (HttpException ex)
{
    Console.WriteLine($"HTTP {ex.StatusCode}: {ex.Message}");
    if (ex.StatusCode == 429)
    {
        var retryAfter = ex.Headers["retry-after"];
        Console.WriteLine($"Retry after {retryAfter} seconds");
    }
}
catch (ValidationException ex)
{
    Console.WriteLine($"Validation failed: {ex.Errors}");
}
```
