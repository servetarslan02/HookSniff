# HookSniff PHP SDK

Official PHP SDK for the [HookSniff](https://hooksniff.com) webhook delivery API.

## Installation

```bash
composer require hooksniff/hooksniff
```

## Usage

```php
<?php

require 'vendor/autoload.php';

use HookSniff\HookSniff;
use HookSniff\Models\MessageIn;
use HookSniff\Webhook;

// Initialize client
$hs = new HookSniff('your-api-key');

// List endpoints
$endpoints = $hs->endpoint->list();

// Create an endpoint
use HookSniff\Models\EndpointIn;

$endpoint = $hs->endpoint->create(
    EndpointIn::create('https://example.com/webhook')
);

// Send a message
$message = $hs->message->create(
    MessageIn::create('order.created', ['order_id' => '12345'])
);

// List message attempts
$attempts = $hs->messageAttempt->listByMsg($message->id);

// Verify incoming webhook signature
$webhook = new Webhook('whsec_...');
$payload = $webhook->verify($rawBody, $headers);

// List event types
$eventTypes = $hs->eventType->list();

// Health check
$hs->health->ping();
```

## Configuration

```php
use HookSniff\HookSniff;
use HookSniff\HookSniffOptions;

$options = new HookSniffOptions(
    debug: true,
    timeoutMs: 30000,
    numRetries: 3,
);

$hs = new HookSniff('your-api-key', $options);
```

## API Reference

### Resources

- **endpoint** — Create, list, update, delete endpoints
- **message** — Create and list messages
- **messageAttempt** — List and inspect delivery attempts
- **eventType** — Manage event types
- **authentication** — Auth operations
- **statistics** — Usage statistics
- **health** — Health check

## Requirements

- PHP >= 8.1
- ext-curl
- ext-json
- ext-hash

## License

MIT
