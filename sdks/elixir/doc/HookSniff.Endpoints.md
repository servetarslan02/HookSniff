# `HookSniff.Endpoints`
[🔗](https://github.com/servetarslan02/hooksniff/blob/v0.2.0/lib/hooksniff/endpoints.ex#L1)

Endpoints resource — CRUD operations for webhook endpoints.

# `create`

```elixir
@spec create(HookSniff.t(), map()) :: {:ok, map()} | {:error, HookSniff.Error.t()}
```

Create a new endpoint.

# `delete`

```elixir
@spec delete(HookSniff.t(), String.t()) ::
  {:ok, boolean()} | {:error, HookSniff.Error.t()}
```

Delete an endpoint.

# `get`

```elixir
@spec get(HookSniff.t(), String.t()) :: {:ok, map()} | {:error, HookSniff.Error.t()}
```

Get an endpoint by ID.

# `list`

```elixir
@spec list(
  HookSniff.t(),
  keyword()
) :: {:ok, map()} | {:error, HookSniff.Error.t()}
```

List all endpoints.

# `rotate_secret`

```elixir
@spec rotate_secret(HookSniff.t(), String.t()) ::
  {:ok, map()} | {:error, HookSniff.Error.t()}
```

Rotate the signing secret for an endpoint.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
