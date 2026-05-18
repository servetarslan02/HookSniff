defmodule HookSniff.MessagePoller do
  alias HookSniff.Client

  @spec poll(Client.t(), String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def poll(%Client{} = c, consumer_id, opts \\ []) do
    params =
      [consumer_id: consumer_id, include_payload: Keyword.get(opts, :include_payload, true)]
      |> maybe_add(:limit, opts)
      |> maybe_add(:endpoint_id, opts)
      |> maybe_add(:event_type, opts)

    Client.request(c, :get, "/api/v1/message-poller/poll", nil, params)
  end

  @spec seek(Client.t(), String.t(), String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def seek(%Client{} = c, consumer_id, message_id, opts \\ []) do
    body =
      %{consumer_id: consumer_id, message_id: message_id}
      |> maybe_add_map(:endpoint_id, opts)

    Client.request(c, :post, "/api/v1/message-poller/seek", body)
  end

  @spec commit(Client.t(), String.t(), String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def commit(%Client{} = c, consumer_id, message_id, opts \\ []) do
    body =
      %{consumer_id: consumer_id, message_id: message_id}
      |> maybe_add_map(:endpoint_id, opts)

    Client.request(c, :post, "/api/v1/message-poller/commit", body)
  end

  defp maybe_add(params, key, opts) do
    case Keyword.get(opts, key) do
      nil -> params
      val -> Keyword.put(params, key, val)
    end
  end

  defp maybe_add_map(map, key, opts) do
    case Keyword.get(opts, key) do
      nil -> map
      val -> Map.put(map, key, val)
    end
  end
end
