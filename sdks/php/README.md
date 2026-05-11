# HookSniff PHP SDK

[![Packagist](https://img.shields.io/packagist/v/hooksniff/hooksniff-php.svg)](https://packagist.org/packages/hooksniff/hooksniff-php)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Official PHP client for the [HookSniff](https://hooksniff.vercel.app) webhook delivery service.

## Installation

```bash
composer require hooksniff/hooksniff-php
```

## Quick Start

```php
<?php
require 'vendor/autoload.php';

use OpenAPI\Client\Api\EndpointsApi;
use OpenAPI\Client\Api\WebhooksApi;
use OpenAPI\Client\Configuration;
use OpenAPI\Client\ApiClient;

// Configure
$config = Configuration::getDefaultConfiguration()
    ->setHost('https://hooksniff-api-1046140057667.europe-west1.run.app/v1')
    ->setApiKey('Authorization', 'hr_live_your_api_key_here');

$apiClient = new ApiClient($config);

// Create an endpoint
$endpointsApi = new EndpointsApi($apiClient);
$endpoint = $endpointsApi->endpointsPost([
    'url' => 'https://myapp.com/webhook',
    'description' => 'Order notifications',
]);
echo "Endpoint created: " . $endpoint->getId() . "\n";

// Send a webhook
$webhooksApi = new WebhooksApi($apiClient);
$delivery = $webhooksApi->webhooksPost([
    'endpoint_id' => $endpoint->getId(),
    'event' => 'order.created',
    'data' => ['order_id' => '12345'],
]);
echo "Delivery: " . $delivery->getId() . "\n";
```

## Available APIs

`EndpointsApi`, `WebhooksApi`, `AuthApi`, `APIKeysApi`, `AlertsApi`, `AnalyticsApi`, `BillingApi`, `TeamsApi`, `NotificationsApi`, `SchemasApi`, `SearchApi`, `HealthApi`, `AdminApi`, `AuditLogApi`, `InboundApi`, `TemplatesApi`, `RoutingApi`, `RateLimitsApi`, `CustomDomainsApi`, `CustomerPortalApi`, `DeliveryDetailsApi`, `DevicesApi`, `EmbedApi`, `EventsApi`, `OAuthApi`, `OutboundIPsApi`, `PlaygroundApi`, `SimulatorApi`, `SSOApi`, `StatsApi`, `StreamApi`, `TransformsApi`, `ContactApi`

## License

MIT
