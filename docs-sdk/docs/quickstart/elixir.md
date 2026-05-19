---
sidebar_position: 10
---

# Elixir Quick Start

## Installation

Add `hooksniff` to your list of dependencies in `mix.exs`:

```elixir
def deps do
  [{:hooksniff, "~> 0.3.0"}]
end
```

Then run:

```bash
mix deps.get
```

## Setup

```elixir
# Initialize client
{:ok, client} = HookSniff.Client.new("hr_live_your_api_key")

# Or with options
{:ok, client} = HookSniff.Client.new("hr_live_your_api_key",
  base_url: "https://hooksniff-api-1046140057667.europe-west1.run.app",
  timeout: 30_000
)
```

## Endpoints

```elixir
# List all endpoints
{:ok, endpoints} = HookSniff.Endpoints.list(client)

# Create an endpoint
{:ok, endpoint} = HookSniff.Endpoints.create(client, %{
  url: "https://example.com/webhook",
  description: "My webhook endpoint",
  rate_limit: 100
})

# Get a specific endpoint
{:ok, details} = HookSniff.Endpoints.get(client, endpoint["id"])

# Update an endpoint
{:ok, updated} = HookSniff.Endpoints.update(client, endpoint["id"], %{
  url: "https://new-url.com/webhook"
})

# Delete an endpoint
:ok = HookSniff.Endpoints.delete(client, endpoint["id"])

# Rotate signing secret
{:ok, key} = HookSniff.Endpoints.rotate_secret(client, endpoint["id"])
```

## Webhooks

```elixir
# Send a webhook
{:ok, delivery} = HookSniff.Webhooks.send(client, %{
  endpoint_id: endpoint["id"],
  event_type: "order.created",
  data: %{order_id: "12345", amount: 99.99}
})

# List deliveries
{:ok, deliveries} = HookSniff.Webhooks.list(client, %{status: "delivered", page: 1})

# Replay a delivery
:ok = HookSniff.Webhooks.replay(client, delivery["id"])

# Batch send
{:ok, batch} = HookSniff.Webhooks.batch(client, %{
  endpoint_id: endpoint["id"],
  events: [
    %{event_type: "order.created", data: %{order_id: "1"}},
    %{event_type: "order.created", data: %{order_id: "2"}}
  ]
})
```

## Webhook Verification

```elixir
webhook = HookSniff.Webhook.new("whsec_your_signing_secret")

# In your handler
def handle_webhook(conn, _params) do
  body = conn.assigns.raw_body
  headers = %{
    "webhook-id" => get_req_header(conn, "webhook-id"),
    "webhook-timestamp" => get_req_header(conn, "webhook-timestamp"),
    "webhook-signature" => get_req_header(conn, "webhook-signature")
  }

  case HookSniff.Webhook.verify(webhook, body, headers) do
    {:ok, payload} ->
      # Payload is verified — process it
      send_resp(conn, 200, "OK")
    {:error, _reason} ->
      send_resp(conn, 401, "Invalid signature")
  end
end
```

## Error Handling

```elixir
case HookSniff.Endpoints.get(client, "nonexistent") do
  {:ok, endpoint} -> IO.inspect(endpoint)
  {:error, %{status: status, body: body}} ->
    IO.puts("API Error #{status}: #{body}")
  {:error, reason} ->
    IO.puts("Network error: #{inspect(reason)}")
end
```
