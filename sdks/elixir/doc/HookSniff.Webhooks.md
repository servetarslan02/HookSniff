# `HookSniff.Webhooks`
[🔗](https://github.com/servetarslan02/hooksniff/blob/v0.2.0/lib/hooksniff/webhooks.ex#L1)

Webhooks resource — send, list, replay, batch, and inspect webhooks.

# `attempts`

```elixir
@spec attempts(HookSniff.t(), String.t()) ::
  {:ok, [map()]} | {:error, HookSniff.Error.t()}
```

Get delivery attempts.

# `batch`

```elixir
@spec batch(HookSniff.t(), [map()]) :: {:ok, map()} | {:error, HookSniff.Error.t()}
```

Send multiple webhooks in a batch.

# `export`

```elixir
@spec export(
  HookSniff.t(),
  keyword()
) :: {:ok, [map()] | String.t()} | {:error, HookSniff.Error.t()}
```

Export deliveries.

# `get`

```elixir
@spec get(HookSniff.t(), String.t()) :: {:ok, map()} | {:error, HookSniff.Error.t()}
```

Get a delivery by ID.

# `list`

```elixir
@spec list(
  HookSniff.t(),
  keyword()
) :: {:ok, map()} | {:error, HookSniff.Error.t()}
```

List deliveries with optional filters.

# `replay`

```elixir
@spec replay(HookSniff.t(), String.t()) ::
  {:ok, map()} | {:error, HookSniff.Error.t()}
```

Replay a delivery.

# `search`

Search deliveries with filters.

## Options
  - `:q` - Search query
  - `:event` - Event type filter
  - `:status` - Status filter
  - `:endpoint_id` - Endpoint ID filter
  - `:page` - Page number (default: 1)
  - `:per_page` - Results per page (default: 20)

# `send`

```elixir
@spec send(HookSniff.t(), map()) :: {:ok, map()} | {:error, HookSniff.Error.t()}
```

Send a webhook.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
