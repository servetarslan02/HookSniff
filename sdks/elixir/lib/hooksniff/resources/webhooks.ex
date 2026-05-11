defmodule HookSniff.Webhooks do
  @moduledoc "Webhook send, list, batch, replay."

  alias HookSniff.Client

  @doc "Send a webhook"
  @spec send_webhook(HookSniff.t(), map()) :: {:ok, map()} | {:error, term()}
  def send_webhook(client, params), do: Client.request(:post, "/v1/webhooks", params, client)

  @doc "Send a batch of webhooks"
  @spec send_batch(HookSniff.t(), map()) :: {:ok, map()} | {:error, term()}
  def send_batch(client, params), do: Client.request(:post, "/v1/webhooks/batch", params, client)

  @doc "List webhook deliveries (paginated). Accepts `:limit` and `:offset` opts."
  @spec list(HookSniff.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def list(client, opts \\ []) do
    path = build_query("/v1/webhooks", opts)
    Client.request(:get, path, nil, client)
  end

  @doc "List all webhook deliveries (auto-paginate). Accepts `:limit` and `:max_pages` opts."
  @spec list_all(HookSniff.t(), keyword()) :: {:ok, list()} | {:error, term()}
  def list_all(client, opts \\ []) do
    HookSniff.Pagination.collect_all(fn limit, offset ->
      list(client, limit: limit, offset: offset)
    end, opts)
  end

  @doc "Get a webhook delivery by ID"
  @spec get(HookSniff.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def get(client, id), do: Client.request(:get, "/v1/webhooks/#{id}", nil, client)

  @doc "Replay a webhook delivery"
  @spec replay(HookSniff.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def replay(client, id), do: Client.request(:post, "/v1/webhooks/#{id}/replay", %{}, client)

  defp build_query(path, opts) do
    params = Enum.filter(opts, fn {_k, v} -> v != nil end)

    case params do
      [] -> path
      _ ->
        query =
          params
          |> Enum.map(fn {k, v} -> "#{k}=#{URI.encode_www_form(to_string(v))}" end)
          |> Enum.join("&")
        "#{path}?#{query}"
    end
  end
end
