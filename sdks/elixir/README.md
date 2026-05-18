# HookSniffAPI

Webhook delivery, monitoring, and management API. All endpoints under &#x60;/v1&#x60; require authentication via &#x60;Authorization: Bearer &lt;api_key&gt;&#x60; header unless marked as **Public**. 

## Building

To install the required dependencies and to build the elixir project, run:

```console
mix local.hex --force
mix do deps.get, compile
```

## Installation

If [available in Hex][], the package can be installed by adding `hooksniff` to
your list of dependencies in `mix.exs`:

```elixir
def deps do
  [{:hooksniff, "~> 0.3.0"}]
end
```

Documentation can be generated with [ExDoc][] and published on [HexDocs][]. Once published, the docs can be found at
[https://hexdocs.pm/hooksniff][docs].

## Configuration

You can override the URL of your server (e.g. if you have a separate development and production server in your
configuration files).

```elixir
config :hooksniff, base_url: "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
```

Multiple clients for the same API with different URLs can be created passing different `base_url`s when calling
`HookSniffAPI.Connection.new/1`:

```elixir
client = HookSniffAPI.Connection.new(base_url: "https://hooksniff-api-1046140057667.europe-west1.run.app/v1")
```

[exdoc]: https://github.com/elixir-lang/ex_doc
[hexdocs]: https://hexdocs.pm
[available in hex]: https://hex.pm/docs/publish
[docs]: https://hexdocs.pm/hooksniff
