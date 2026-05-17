# HookSniff Ruby SDK

Ruby SDK for [HookSniff](https://hooksniff.vercel.app) — reliable webhook delivery for developers.

## Installation

Add this line to your application's Gemfile:

```ruby
gem 'hooksniff'
```

And then execute:

```bash
bundle install
```

Or install it yourself as:

```bash
gem install hooksniff
```

## Usage

```ruby
require 'hooksniff'

# Initialize the client
hs = HookSniff::Client.new('YOUR_API_KEY')

# List endpoints
endpoints = hs.endpoint.list()
puts endpoints

# Create an endpoint
endpoint = hs.endpoint.create({
  url: "https://example.com/webhook",
  description: "My endpoint"
})

# Send a webhook message
message = hs.message.create({
  event_type: "order.created",
  payload: {
    order_id: "ord_123",
    amount: 9999
  }
})

# List delivery attempts
attempts = hs.message_attempt.list_by_msg(message.id)
```

## Webhook Verification

```ruby
require 'hooksniff'

wh = HookSniff::Webhook.new('whsec_...')

# Verify a webhook payload
begin
  payload = wh.verify(request_body, {
    'hooksniff-id' => request.headers['hooksniff-id'],
    'hooksniff-signature' => request.headers['hooksniff-signature'],
    'hooksniff-timestamp' => request.headers['hooksniff-timestamp']
  })
  # payload is valid
rescue HookSniff::WebhookVerificationError
  # invalid signature
end
```

## API Resources

| Resource | Description |
|----------|-------------|
| `hs.authentication` | Login, register, 2FA, password reset |
| `hs.endpoint` | CRUD for webhook endpoints |
| `hs.event_type` | Manage event types |
| `hs.health` | System health check |
| `hs.message` | Send webhook messages |
| `hs.message_attempt` | View delivery attempts |
| `hs.statistics` | Delivery statistics |

## License

MIT
