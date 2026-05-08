# `HookSniff`
[🔗](https://github.com/servetarslan02/hooksniff/blob/v0.2.0/lib/hooksniff.ex#L1)

Official Elixir client for the HookSniff webhook delivery service.

## Usage

    client = HookSniff.new("hr_live_...")

    # Create endpoint
    {:ok, endpoint} = HookSniff.Endpoints.create(client, %{url: "https://myapp.com/webhook"})

    # Send webhook
    {:ok, delivery} = HookSniff.Webhooks.send(client, %{
      endpoint_id: endpoint["id"],
      event: "order.created",
      data: %{order_id: "12345"}
    })

# `t`

```elixir
@type t() :: %HookSniff{
  api_key: String.t(),
  base_url: String.t(),
  timeout: pos_integer()
}
```

# `new`

```elixir
@spec new(
  String.t(),
  keyword()
) :: t()
```

Create a new HookSniff client.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
