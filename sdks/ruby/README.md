# HookRelay Ruby SDK

Official Ruby client for the [HookRelay](https://hookrelay.dev) webhook delivery service.

## Installation

Add to your Gemfile:

```ruby
gem "hookrelay"
```

Or install directly:

```bash
gem install hookrelay
```

## Quick Start

```ruby
require "hookrelay"

# Initialize client
client = HookRelay::Client.new(api_key: "hr_live_your_api_key_here")

# Create a webhook endpoint
endpoint = client.endpoints.create(
  url: "https://myapp.com/webhook",
  description: "Order notifications"
)
puts "Endpoint created: #{endpoint[:id]}"

# Send a webhook
delivery = client.webhooks.send(
  endpoint_id: endpoint[:id],
  event: "order.created",
  data: { order_id: "12345", amount: 99.99 }
)
puts "Delivery queued: #{delivery[:id]}, status: #{delivery[:status]}"

# Check delivery status
status = client.webhooks.get(delivery[:id])
puts "Status: #{status[:status]}, attempts: #{status[:attempt_count]}"

# List deliveries
deliveries = client.webhooks.list(status: "failed", page: 1)
deliveries[:deliveries].each do |d|
  puts "  #{d[:id]}: #{d[:status]}"
end

# Replay a failed delivery
replayed = client.webhooks.replay(delivery[:id])
puts "Replay queued: #{replayed[:id]}"
```

## Batch Webhooks

Send multiple webhooks in a single request (max 100):

```ruby
results = client.webhooks.batch([
  { endpoint_id: "ep_1", event: "order.created", data: { order_id: "12345" } },
  { endpoint_id: "ep_2", event: "payment.completed", data: { payment_id: "pay_67890" } }
])

puts "Delivered: #{results[:deliveries].length}"
puts "Errors: #{results[:errors].length}"
results[:errors].each do |err|
  puts "  Item #{err['index']}: #{err['error']}"
end
```

## Retry Policy

Configure custom retry behavior when creating endpoints:

```ruby
endpoint = client.endpoints.create(
  url: "https://myapp.com/webhook",
  description: "Critical notifications",
  retry_policy: {
    max_attempts: 5,
    backoff: "exponential",
    initial_delay_secs: 10,
    max_delay_secs: 3600
  }
)
```

## Delivery Attempts

Inspect individual delivery attempts:

```ruby
attempts = client.webhooks.attempts(delivery[:id])
attempts.each do |attempt|
  puts "  Attempt #{attempt[:attempt_number]}: status=#{attempt[:status_code]}, " \
       "duration=#{attempt[:duration_ms]}ms"
  puts "    Error: #{attempt[:error_message]}" if attempt[:error_message]
end
```

## Export Logs

Export webhook logs as JSON or CSV:

```ruby
# JSON export
logs = client.webhooks.export(format: "json", status: "failed")

# CSV export
csv_data = client.webhooks.export(format: "csv", date_from: "2024-01-01")
File.write("webhooks.csv", csv_data)
```

## Signature Verification

Verify incoming webhook signatures in your handler:

```ruby
require "hookrelay"
require "sinatra"

post "/webhook" do
  payload = request.body.read
  signature = request.env["HTTP_X_HOOKRELAY_SIGNATURE"]
  secret = "whsec_your_endpoint_signing_secret"

  unless HookRelay.verify_signature(payload, signature, secret)
    halt 401, { error: "Invalid signature" }.to_json
  end

  data = JSON.parse(payload)
  puts "Received event: #{data['event']}"
  content_type :json
  { received: true }.to_json
end
```

### Standard Webhooks Verification

For Standard Webhooks compatible verification:

```ruby
result = HookRelay.verify_webhook(
  payload: request.body.read,
  msg_id: request.env["HTTP_WEBHOOK_ID"],
  timestamp: request.env["HTTP_WEBHOOK_TIMESTAMP"],
  signature_header: request.env["HTTP_WEBHOOK_SIGNATURE"],
  secret: "whsec_..."
)

unless result[:valid]
  halt 401, { error: result[:error] }.to_json
end

puts "Event: #{result[:payload]['event']}"
```

## Error Handling

```ruby
begin
  delivery = client.webhooks.send(
    endpoint_id: "nonexistent",
    data: { test: true }
  )
rescue HookRelay::AuthenticationError => e
  puts "Invalid API key"
rescue HookRelay::NotFoundError => e
  puts "Endpoint not found"
rescue HookRelay::RateLimitError => e
  puts "Rate limit exceeded - try again later"
rescue HookRelay::ValidationError => e
  puts "Invalid request: #{e.message}"
rescue HookRelay::PayloadTooLargeError => e
  puts "Payload exceeds maximum size"
end
```

## API Reference

### `HookRelay::Client.new(api_key:, base_url: nil, timeout: nil)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `api_key` | `String` | required | Your HookRelay API key |
| `base_url` | `String` | `http://localhost:3000/v1` | API base URL |
| `timeout` | `Integer` | `30` | Request timeout in seconds |

### `client.endpoints`

- `.create(url:, description: nil, retry_policy: nil)` → `Hash`
- `.get(endpoint_id)` → `Hash`
- `.list` → `Array<Hash>`
- `.delete(endpoint_id)` → `Boolean`

### `client.webhooks`

- `.send(endpoint_id:, data:, event: nil)` → `Hash`
- `.get(delivery_id)` → `Hash`
- `.list(status: nil, page: 1, per_page: 20)` → `Hash`
- `.replay(delivery_id)` → `Hash`
- `.batch(webhooks)` → `Hash`
- `.attempts(delivery_id)` → `Array<Hash>`
- `.export(format: nil, status: nil, date_from: nil, date_to: nil)` → `Array<Hash> | String`

### `HookRelay.verify_signature(payload, signature, secret)` → `Boolean`

Verify a webhook signature using HMAC-SHA256.

### `HookRelay.verify_webhook(payload:, msg_id:, timestamp:, signature_header:, secret:, tolerance_secs: 300)` → `Hash`

Verify a webhook using Standard Webheaders headers.

## License

MIT
