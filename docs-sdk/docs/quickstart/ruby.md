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

hs = HookSniff::Client.new(api_key: ENV['HOOKSNIFF_API_KEY'])
```

## Create an Endpoint

```ruby
endpoint = hs.endpoints.create(
  url: 'https://myapp.com/webhook',
  description: 'Order notifications',
  event_types: ['order.created', 'order.updated'],
)

puts "Endpoint ID: #{endpoint.id}"
puts "Signing secret: #{endpoint.secret}"
```

## Send a Webhook

```ruby
delivery = hs.messages.create(
  endpoint_id: endpoint.id,
  event: 'order.created',
  data: { order_id: 'ORD-12345', amount: 99.99, currency: 'USD' },
)

puts "Delivery ID: #{delivery.id}"
puts "Status: #{delivery.status}"
```

## Verify Incoming Webhooks

```ruby
wh = HookSniff::Webhook.new('whsec_your_signing_secret')

# Sinatra handler
post '/webhook' do
  payload = wh.verify(
    request.body.read,
    {
      'webhook-id' => request.env['HTTP_WEBHOOK_ID'],
      'webhook-timestamp' => request.env['HTTP_WEBHOOK_TIMESTAMP'],
      'webhook-signature' => request.env['HTTP_WEBHOOK_SIGNATURE'],
    },
  )

  puts "Event: #{payload['event']}"
  puts "Data: #{payload['data']}"
  status 200
rescue HookSniff::SignatureVerificationError
  status 401
end

# Rails controller
class WebhooksController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
    payload = wh.verify(request.body.read, {
      'webhook-id' => request.headers['HTTP_WEBHOOK_ID'],
      'webhook-timestamp' => request.headers['HTTP_WEBHOOK_TIMESTAMP'],
      'webhook-signature' => request.headers['HTTP_WEBHOOK_SIGNATURE'],
    })
    render json: { received: true }
  rescue HookSniff::SignatureVerificationError
    head :unauthorized
  end
end
```

## List Deliveries

```ruby
attempts = hs.message_attempts.list_by_endpoint(
  endpoint_id: endpoint.id,
  limit: 20,
)

attempts.data.each do |a|
  puts "#{a.id}: #{a.response_status_code}"
end
```

## Error Handling

```ruby
begin
  hs.endpoints.get('nonexistent')
rescue HookSniff::HttpError => e
  puts "HTTP #{e.status_code}: #{e.message}"
  if e.status_code == 429
    retry_after = e.headers['retry-after']
    puts "Retry after #{retry_after} seconds"
  end
rescue HookSniff::ValidationError => e
  puts "Validation failed: #{e.errors}"
end
```
