---
sidebar_position: 8
---

# PHP Quick Start

## Installation

```bash
composer require hooksniff/hooksniff-php
```

## Setup

```php
<?php
require 'vendor/autoload.php';

use HookSniff\HookSniff;

// Initialize client
$client = new HookSniff('hr_live_your_api_key');

// Or with options
$client = new HookSniff('hr_live_your_api_key', [
    'base_url' => 'https://hooksniff-api-1046140057667.europe-west1.run.app',
    'timeout'  => 30,
]);
```

## Endpoints

```php
// List all endpoints
$endpoints = $client->endpoints->list();

// Create an endpoint
$endpoint = $client->endpoints->create([
    'url'         => 'https://example.com/webhook',
    'description' => 'My webhook endpoint',
    'rate_limit'  => 100,
]);

// Get a specific endpoint
$details = $client->endpoints->get($endpoint['id']);

// Update an endpoint
$updated = $client->endpoints->update($endpoint['id'], [
    'url' => 'https://new-url.com/webhook',
]);

// Delete an endpoint
$client->endpoints->delete($endpoint['id']);

// Rotate signing secret
$key = $client->endpoints->rotateSecret($endpoint['id']);
```

## Webhooks

```php
// Send a webhook
$delivery = $client->webhooks->send([
    'endpoint_id' => $endpoint['id'],
    'event_type'  => 'order.created',
    'data'        => ['order_id' => '12345', 'amount' => 99.99],
]);

// List deliveries
$deliveries = $client->webhooks->list(['status' => 'delivered', 'page' => 1]);

// Replay a delivery
$client->webhooks->replay($delivery['id']);

// Batch send
$batch = $client->webhooks->batch([
    'endpoint_id' => $endpoint['id'],
    'events'      => [
        ['event_type' => 'order.created', 'data' => ['order_id' => '1']],
        ['event_type' => 'order.created', 'data' => ['order_id' => '2']],
    ],
]);
```

## Webhook Verification

```php
use HookSniff\Webhook;

$webhook = new Webhook('whsec_your_signing_secret');

// In your endpoint handler
try {
    $payload = $webhook->verify(file_get_contents('php://input'), [
        'webhook-id'        => $_SERVER['HTTP_WEBHOOK_ID'],
        'webhook-timestamp' => $_SERVER['HTTP_WEBHOOK_TIMESTAMP'],
        'webhook-signature' => $_SERVER['HTTP_WEBHOOK_SIGNATURE'],
    ]);
    // Payload is verified — process it
    http_response_code(200);
} catch (\HookSniff\SignatureVerificationException $e) {
    http_response_code(401);
}
```

## Error Handling

```php
try {
    $client->endpoints->get('nonexistent');
} catch (\HookSniff\ApiException $e) {
    echo "API Error {$e->getStatusCode()}: {$e->getMessage()}\n";
} catch (\Exception $e) {
    echo "Network error: {$e->getMessage()}\n";
}
```
