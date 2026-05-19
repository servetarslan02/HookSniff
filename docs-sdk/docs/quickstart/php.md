---
sidebar_position: 8
---

# PHP Quick Start

## Installation

```bash
composer require hooksniff/hooksniff
```

## Setup

```php
<?php
require 'vendor/autoload.php';

$hs = new \HookSniff\Client(getenv('HOOKSNIFF_API_KEY'));
```

## Create an Endpoint

```php
$endpoint = $hs->endpoints->create([
    'url' => 'https://myapp.com/webhook',
    'description' => 'Order notifications',
    'event_types' => ['order.created', 'order.updated'],
]);

echo "Endpoint ID: {$endpoint->id}\n";
echo "Signing secret: {$endpoint->secret}\n";
```

## Send a Webhook

```php
$delivery = $hs->webhooks->send([
    'endpoint_id' => $endpoint->id,
    'event' => 'order.created',
    'data' => [
        'order_id' => 'ORD-12345',
        'amount' => 99.99,
        'currency' => 'USD',
    ],
]);

echo "Delivery ID: {$delivery->id}\n";
echo "Status: {$delivery->status}\n";
```

## Verify Incoming Webhooks

```php
$wh = new \HookSniff\Webhook('whsec_your_signing_secret');

// Laravel controller
public function handleWebhook(Request $request) {
    try {
        $payload = $wh->verify(
            $request->getContent(),
            [
                'webhook-id' => $request->header('webhook-id'),
                'webhook-timestamp' => $request->header('webhook-timestamp'),
                'webhook-signature' => $request->header('webhook-signature'),
            ],
        );

        echo "Event: {$payload['event']}\n";
        echo "Data: " . json_encode($payload['data']) . "\n";

        return response('OK', 200);
    } catch (\HookSniff\SignatureVerificationException $e) {
        return response('Invalid signature', 401);
    }
}
```

## List Deliveries

```php
$deliveries = $hs->webhooks->list([
    'endpoint_id' => $endpoint->id,
    'limit' => 20,
]);

foreach ($deliveries->data as $dlv) {
    echo "{$dlv->id}: {$dlv->status}\n";
}
```

## Error Handling

```php
try {
    $hs->endpoints->get('nonexistent');
} catch (\HookSniff\HttpError $e) {
    echo "HTTP {$e->getStatusCode()}: {$e->getMessage()}\n";
    if ($e->getStatusCode() === 429) {
        $retryAfter = $e->getHeaders()['retry-after'] ?? null;
        echo "Retry after {$retryAfter} seconds\n";
    }
} catch (\HookSniff\ValidationError $e) {
    echo "Validation failed: " . json_encode($e->getErrors()) . "\n";
}
```
