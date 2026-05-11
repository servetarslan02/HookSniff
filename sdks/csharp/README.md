# HookSniff C# SDK

[![NuGet](https://img.shields.io/nuget/v/HookSniff.svg)](https://www.nuget.org/packages/HookSniff/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Official C# client for the [HookSniff](https://hooksniff.vercel.app) webhook delivery service.

## Installation

```bash
dotnet add package HookSniff --version 0.3.0
```

## Quick Start

```csharp
using hooksniff.Api;
using hooksniff.Client;
using hooksniff.Model;

// Configure
var config = new Configuration();
config.BasePath = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1";
config.ApiKey.Add("Authorization", "hr_live_your_api_key_here");

// Create an endpoint
var endpointsApi = new EndpointsApi(config);
var endpoint = endpointsApi.EndpointsPost(new CreateEndpointRequest(
    url: "https://myapp.com/webhook",
    description: "Order notifications"
));
Console.WriteLine($"Endpoint created: {endpoint.Id}");

// Send a webhook
var webhooksApi = new WebhooksApi(config);
var delivery = webhooksApi.WebhooksPost(new CreateWebhookRequest(
    endpointId: endpoint.Id,
    event: "order.created",
    data: new Dictionary<string, object> { { "orderId", "12345" } }
));
Console.WriteLine($"Delivery: {delivery.Id}");
```

## Available APIs

`EndpointsApi`, `WebhooksApi`, `AuthApi`, `APIKeysApi`, `AlertsApi`, `AnalyticsApi`, `BillingApi`, `TeamsApi`, `NotificationsApi`, `SchemasApi`, `SearchApi`, `HealthApi`, `AdminApi`, `AuditLogApi`, `InboundApi`, `TemplatesApi`, `RoutingApi`, `RateLimitsApi`, `CustomDomainsApi`, `CustomerPortalApi`, `DeliveryDetailsApi`, `DevicesApi`, `EmbedApi`, `EventsApi`, `OAuthApi`, `OutboundIPsApi`, `PlaygroundApi`, `SimulatorApi`, `SsoApi`, `StatsApi`, `StreamApi`, `TransformsApi`, `ContactApi`

## License

MIT
