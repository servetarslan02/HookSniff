---
sidebar_position: 10
---

# Elixir Quick Start

## Installation

```elixir
# mix.exs
defp deps do
  [
    {:hooksniff, "~> 1.1"}
  ]
end
```

Then run:

```bash
mix deps.get
```

## Setup

```elixir
{:ok, hs} = HookSniff.client(api_key: System.get_env("HOOKSNIFF_API_KEY"))
```

## Create an Endpoint

```elixir
{:ok, endpoint} = HookSniff.Endpoints.create(hs, %{
  url: "https://myapp.com/webhook",
  description: "Order notifications",
  event_types: ["order.created", "order.updated"]
})

IO.puts("Endpoint ID: #{endpoint.id}")
IO.puts("Signing secret: #{endpoint.secret}")
```

## Send a Webhook

```elixir
{:ok, delivery} = HookSniff.Webhooks.send(hs, %{
  endpoint_id: endpoint.id,
  event: "order.created",
  data: %{
    order_id: "ORD-12345",
    amount: 99.99,
    currency: "USD"
  }
})

IO.puts("Delivery ID: #{delivery.id}")
IO.puts("Status: #{delivery.status}")
```

## Verify Incoming Webhooks

```elixir
{:ok, wh} = HookSniff.Webhook.new("whsec_your_signing_secret")

# Phoenix controller
def handle_webhook(conn, _params) do
  {:ok, body, conn} = Plug.Conn.read_body(conn)

  case HookSniff.Webhook.verify(wh, body, conn.req_headers) do
    {:ok, payload} ->
      IO.puts("Event: #{payload["event"]}")
      IO.puts("Data: #{inspect(payload["data"])}")
      send_resp(conn, 200, "OK")

    {:error, _reason} ->
      send_resp(conn, 401, "Invalid signature")
  end
end
```

## List Deliveries

```elixir
{:ok, deliveries} = HookSniff.Webhooks.list(hs, %{
  endpoint_id: endpoint.id,
  limit: 20
})

Enum.each(deliveries.data, fn dlv ->
  IO.puts("#{dlv.id}: #{dlv.status}")
end)
```

## Error Handling

```elixir
case HookSniff.Endpoints.get(hs, "nonexistent") do
  {:ok, endpoint} ->
    IO.puts("Got endpoint: #{endpoint.id}")

  {:error, %{status_code: 429, headers: headers}} ->
    retry_after = Map.get(headers, "retry-after")
    IO.puts("Rate limited. Retry after #{retry_after} seconds")

  {:error, %{status_code: status, body: body}} ->
    IO.puts("HTTP #{status}: #{body}")
end
```
