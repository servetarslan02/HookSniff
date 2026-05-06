# HookRelay PHP SDK

Official PHP client for the [HookRelay](https://hookrelay.io) webhook delivery service.

## Installation

```bash
composer require hookrelay/hookrelay-php
```

## Quick Start

```php
<?php

require 'vendor/autoload.php';

use HookRelay\HookRelayClient;

// Initialize client
$client = new HookRelayClient('hr_live_your_api_key_here');

// Create a webhook endpoint
$endpoint = $client->endpoints()->create(
    'https://myapp.com/webhook',
    'Order notifications'
);
echo "Endpoint created: {$endpoint['id']}\n";

// Send a webhook
$delivery = $client->webhooks()->send(
    $endpoint['id'],
    'order.created',
    ['orderId' => '12345', 'amount' => 99.99]
);
echo "Delivery queued: {$delivery['id']}, status: {$delivery['status']}\n";

// Check delivery status
$status = $client->webhooks()->get($delivery['id']);
echo "Status: {$status['status']}, attempts: {$status['attempt_count']}\n";

// List deliveries
$deliveries = $client->webhooks()->list('failed', 1, 20);
foreach ($deliveries['deliveries'] as $d) {
    echo "  {$d['id']}: {$d['status']}\n";
}

// Replay a failed delivery
$replayed = $client->webhooks()->replay($delivery['id']);
echo "Replay queued: {$replayed['id']}\n";
```

## Batch Webhooks

Send multiple webhooks in a single request (max 100):

```php
$results = $client->webhooks()->batch([
    ['endpoint_id' => 'ep_1', 'event' => 'order.created', 'data' => ['orderId' => '12345']],
    ['endpoint_id' => 'ep_2', 'event' => 'payment.completed', 'data' => ['paymentId' => 'pay_67890']],
]);

echo "Delivered: " . count($results['deliveries']) . "\n";
echo "Errors: " . count($results['errors']) . "\n";
foreach ($results['errors'] as $err) {
    echo "  Item {$err['index']}: {$err['error']}\n";
}
```

## Retry Policy

Configure custom retry behavior when creating endpoints:

```php
$endpoint = $client->endpoints()->create(
    'https://myapp.com/webhook',
    'Critical notifications',
    [
        'max_attempts' => 5,
        'backoff' => 'exponential',
        'initial_delay_secs' => 10,
        'max_delay_secs' => 3600,
    ]
);
```

## Delivery Attempts

Inspect individual delivery attempts:

```php
$attempts = $client->webhooks()->attempts($delivery['id']);
foreach ($attempts as $attempt) {
    echo "  Attempt {$attempt['attempt_number']}: status={$attempt['status_code']}, ";
    echo "duration={$attempt['duration_ms']}ms\n";
    if ($attempt['error_message']) {
        echo "    Error: {$attempt['error_message']}\n";
    }
}
```

## Export Logs

Export webhook logs as JSON or CSV:

```php
// JSON export
$logs = $client->webhooks()->export('json', 'failed');

// CSV export
$csvData = $client->webhooks()->export('csv', null, '2024-01-01');
file_put_contents('webhooks.csv', $csvData);
```

## Signature Verification

Verify incoming webhook signatures in your handler:

```php
<?php

use HookRelay\WebhookVerification;

$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HOOKRELAY_SIGNATURE'] ?? '';
$secret = 'whsec_your_endpoint_signing_secret';

if (!WebhookVerification::verifySignature($payload, $signature, $secret)) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid signature']);
    exit;
}

$data = json_decode($payload, true);
echo "Received event: {$data['event']}\n";
echo json_encode(['received' => true]);
```

### Standard Webhooks Verification

```php
use HookRelay\WebhookVerification;

$result = WebhookVerification::verifyWebhook(
    $payload,
    $_SERVER['HTTP_WEBHOOK_ID'] ?? null,
    $_SERVER['HTTP_WEBHOOK_TIMESTAMP'] ?? null,
    $_SERVER['HTTP_WEBHOOK_SIGNATURE'] ?? null,
    'whsec_...'
);

if (!$result['valid']) {
    http_response_code(401);
    echo json_encode(['error' => $result['error']]);
    exit;
}

echo "Event: {$result['payload']['event']}\n";
```

## Error Handling

```php
use HookRelay\AuthenticationException;
use HookRelay\NotFoundException;
use HookRelay\RateLimitException;
use HookRelay\ValidationException;
use HookRelay\PayloadTooLargeException;

try {
    $delivery = $client->webhooks()->send('nonexistent', ['test' => true]);
} catch (AuthenticationException $e) {
    echo "Invalid API key\n";
} catch (NotFoundException $e) {
    echo "Endpoint not found\n";
} catch (RateLimitException $e) {
    echo "Rate limit exceeded - try again later\n";
} catch (ValidationException $e) {
    echo "Invalid request: {$e->getMessage()}\n";
} catch (PayloadTooLargeException $e) {
    echo "Payload exceeds maximum size\n";
}
```

## API Reference

### `new HookRelayClient(apiKey, baseUrl = null, timeout = 0)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | required | Your HookRelay API key |
| `baseUrl` | `string` | `https://api.hookrelay.io/v1` | API base URL |
| `timeout` | `int` | `30` | Request timeout in seconds |

### `$client->endpoints()`

- `->create(url, description?, retryPolicy?)` → `array`
- `->get(endpointId)` → `array`
- `->list()` → `array`
- `->delete(endpointId)` → `bool`

### `$client->webhooks()`

- `->send(endpointId, data, event?)` → `array`
- `->get(deliveryId)` → `array`
- `->list(status?, page?, perPage?)` → `array`
- `->replay(deliveryId)` → `array`
- `->batch(webhooks)` → `array`
- `->attempts(deliveryId)` → `array`
- `->export(format?, status?, dateFrom?, dateTo?)` → `array|string`

### `WebhookVerification::verifySignature(payload, signature, secret)` → `bool`

### `WebhookVerification::verifyWebhook(...)` → `array`

## License

MIT
