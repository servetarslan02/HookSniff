---
sidebar_position: 5
---

# Ruby Quick Start

## Installation

```bash
gem install hooksniff
```

Or add to your `Gemfile`:

```ruby
gem 'hooksniff'
```

## Setup

```ruby
require 'hooksniff'

# Initialize client
client = HookSniff::Client.new('hr_live_your_api_key')

# Or with options
client = HookSniff::Client.new('hr_live_your_api_key', {
  base_url: 'https://hooksniff-api-1046140057667.europe-west1.run.app',
  timeout: 30,
})
```

## Endpoints

```ruby
# List all endpoints
endpoints = client.endpoints.list

# Create an endpoint
endpoint = client.endpoints.create(
  url: 'https://example.com/webhook',
  description: 'My webhook endpoint',
  rate_limit: 100
)

# Get a specific endpoint
details = client.endpoints.get(endpoint['id'])

# Update an endpoint
updated = client.endpoints.update(endpoint['id'], url: 'https://new-url.com/webhook')

# Delete an endpoint
client.endpoints.delete(endpoint['id'])

# Rotate signing secret
key = client.endpoints.rotate_secret(endpoint['id'])
```

## Webhooks

```ruby
# Send a webhook
delivery = client.webhooks.send(
  endpoint_id: endpoint['id'],
  event_type: 'order.created',
  data: { order_id: '12345', amount: 99.99 }
)

# List deliveries
deliveries = client.webhooks.list(status: 'delivered', page: 1)

# Replay a delivery
client.webhooks.replay(delivery['id'])

# Batch send
batch = client.webhooks.batch(
  endpoint_id: endpoint['id'],
  events: [
    { event_type: 'order.created', data: { order_id: '1' } },
    { event_type: 'order.created', data: { order_id: '2' } }
  ]
)
```

## Webhook Verification

```ruby
require 'hooksniff'

webhook = HookSniff::Webhook.new('whsec_your_signing_secret')

# In your endpoint handler
def handle_webhook(request)
  begin
    payload = webhook.verify(
      request.body.read,
      headers: {
        'webhook-id' => request.headers['HTTP_WEBHOOK_ID'],
        'webhook-timestamp' => request.headers['HTTP_WEBHOOK_TIMESTAMP'],
        'webhook-signature' => request.headers['HTTP_WEBHOOK_SIGNATURE']
      }
    )
    # Payload is verified — process it
    puts "Received event: #{payload}"
    status 200
  rescue HookSniff::SignatureError
    status 401
  end
end
```

## Error Handling

```ruby
begin
  client.endpoints.get('nonexistent')
rescue HookSniff::ApiException => e
  puts "API Error #{e.status_code}: #{e.message}"
rescue StandardError => e
  puts "Network error: #{e.message}"
end
```
