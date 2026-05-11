# HookSniff Elixir SDK

[![Hex.pm](https://img.shields.io/hexpm/v/hooksniff.svg)](https://hex.pm/packages/hooksniff)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Official Elixir client for the [HookSniff](https://hooksniff.vercel.app) webhook delivery service.

## Installation

Add `hooksniff` to your `mix.exs`:

```elixir
def deps do
  [
    {:hooksniff, "~> 0.3.0"}
  ]
end
```

Then run:

```bash
mix deps.get
```

## Quick Start

```elixir
# Configure
config = %HookSniffAPI.Configuration{
  base_url: "https://hooksniff-api-1046140057667.europe-west1.run.app/v1",
  api_key: %{"Authorization" => "Bearer hr_live_your_api_key_here"}
}

# Create an endpoint
{:ok, endpoint} = HookSniffAPI.EndpointsApi.endpoints_post(config, %{
  url: "https://myapp.com/webhook",
  description: "Order notifications"
})
IO.puts("Endpoint created: #{endpoint.id}")

# Send a webhook
{:ok, delivery} = HookSniffAPI.WebhooksApi.webhooks_post(config, %{
  endpoint_id: endpoint.id,
  event: "order.created",
  data: %{order_id: "12345"}
})
IO.puts("Delivery: #{delivery.id}")
```

## Available API Modules

`EndpointsApi`, `WebhooksApi`, `AuthApi`, `APIKeysApi`, `AlertsApi`, `AnalyticsApi`, `BillingApi`, `TeamsApi`, `NotificationsApi`, `SchemasApi`, `SearchApi`, `HealthApi`, `AdminApi`, `AuditLogApi`, `InboundApi`, `TemplatesApi`, `RoutingApi`, `RateLimitsApi`, `CustomDomainsApi`, `CustomerPortalApi`, `DeliveryDetailsApi`, `DevicesApi`, `EmbedApi`, `EventsApi`, `OAuthApi`, `OutboundIPsApi`, `PlaygroundApi`, `SimulatorApi`, `SsoApi`, `StatsApi`, `StreamApi`, `TransformsApi`, `ContactApi`

## License

MIT
