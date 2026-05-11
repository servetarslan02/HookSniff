# HookSniff Ruby SDK

[![Gem Version](https://img.shields.io/gem/v/hooksniff.svg)](https://rubygems.org/gems/hooksniff)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Official Ruby client for the [HookSniff](https://hooksniff.vercel.app) webhook delivery service.

## Installation

```bash
gem install hooksniff
```

Or in your Gemfile:
```ruby
gem 'hooksniff'
```

## Quick Start

```ruby
require 'openapi_client'

# Configure
config = OpenAPIClient::Configuration.new
config.server_index = 0
# Default base URL: https://hooksniff-api-1046140057667.europe-west1.run.app/v1
config.api_key['ApiKeyAuth'] = 'hr_live_your_api_key_here'

api_client = OpenAPIClient::ApiClient.new(config)

# Create an endpoint
endpoints_api = OpenAPIClient::EndpointsApi.new(api_client)
endpoint = endpoints_api.endpoints_post(
  OpenAPIClient::CreateEndpointRequest.new(
    url: 'https://myapp.com/webhook',
    description: 'Order notifications'
  )
)
puts "Endpoint created: #{endpoint.id}"

# Send a webhook
webhooks_api = OpenAPIClient::WebhooksApi.new(api_client)
delivery = webhooks_api.webhooks_post(
  OpenAPIClient::CreateWebhookRequest.new(
    endpoint_id: endpoint.id,
    event: 'order.created',
    data: { order_id: '12345' }
  )
)
puts "Delivery: #{delivery.id}"
```

## Available APIs

`EndpointsApi`, `WebhooksApi`, `AuthApi`, `APIKeysApi`, `AlertsApi`, `AnalyticsApi`, `BillingApi`, `TeamsApi`, `NotificationsApi`, `SchemasApi`, `SearchApi`, `HealthApi`, `AdminApi`, `AuditLogApi`, `InboundApi`, `TemplatesApi`, `RoutingApi`, `RateLimitsApi`, `CustomDomainsApi`, `CustomerPortalApi`, `DeliveryDetailsApi`, `DevicesApi`, `EmbedApi`, `EventsApi`, `OAuthApi`, `OutboundIPsApi`, `PlaygroundApi`, `SimulatorApi`, `SsoApi`, `StatsApi`, `StreamApi`, `TransformsApi`, `ContactApi`

## License

MIT
