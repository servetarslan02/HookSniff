# HookSniff Elixir SDK

Official Elixir client for the [HookSniff](https://hooksniff.is-a.dev) webhook delivery service.

## Installation

Add `hooksniff` to your list of dependencies in `mix.exs`:

```elixir
def deps do
  [
    {:hooksniff, "~> 0.2.0"}
  ]
end
```

## Usage

```elixir
# Create client
client = HookSniff.new("hr_live_...")

# Create endpoint
{:ok, endpoint} = HookSniff.Endpoints.create(client, %{
  url: "https://myapp.com/webhook",
  description: "Orders"
})

# Send webhook
{:ok, delivery} = HookSniff.Webhooks.send(client, %{
  endpoint_id: endpoint["id"],
  event: "order.created",
  data: %{order_id: "12345", amount: 99.99}
})

# List deliveries
{:ok, result} = HookSniff.Webhooks.list(client, status: "delivered", page: 1)

# Get delivery attempts
{:ok, attempts} = HookSniff.Webhooks.attempts(client, delivery["id"])
```

## Webhook Verification

Verify incoming webhooks using Standard Webhooks headers:

```elixir
# From Plug/Phoenix conn
result = HookSniff.WebhookVerification.verify_webhook_from_headers(
  payload: conn.assigns[:raw_body],
  headers: conn.req_headers |> Map.new(),
  secret: "whsec_..."
)

case result do
  {:ok, payload} ->
    # Handle verified webhook
    IO.puts("Event: #{payload["event"]}")

  {:error, reason} ->
    # Reject webhook
    Logger.warning("Webhook verification failed: #{reason}")
end
```

## Error Handling

```elixir
case HookSniff.Endpoints.create(client, %{url: "invalid"}) do
  {:ok, endpoint} -> # Success
  {:error, %HookSniff.Error{code: :validation_error, message: msg}} -> # 400
  {:error, %HookSniff.Error{code: :rate_limit_error}} -> # 429
  {:error, error} -> # Other error
end
```

## License

MIT
