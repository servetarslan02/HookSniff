defmodule HookRelay.Webhooks do
  @moduledoc """
  Webhooks resource — send, list, replay, batch, and inspect webhooks.
  """

  alias HookRelay

  @doc "Send a webhook."
  @spec send(HookRelay.t(), map()) :: {:ok, map()} | {:error, HookRelay.Error.t()}
  def send(client, params) do
    body = %{
      endpoint_id: params[:endpoint_id] || params["endpoint_id"],
      data: params[:data] || params["data"]
    }

    body =
      if params[:event] || params["event"],
        do: Map.put(body, :event, params[:event] || params["event"]),
        else: body

    HookRelay.request(client, :post, "/webhooks", body)
  end

  @doc "Get a delivery by ID."
  @spec get(HookRelay.t(), String.t()) :: {:ok, map()} | {:error, HookRelay.Error.t()}
  def get(client, delivery_id) do
    HookRelay.request(client, :get, "/webhooks/#{delivery_id}")
  end

  @doc "List deliveries with optional filters."
  @spec list(HookRelay.t(), keyword()) :: {:ok, map()} | {:error, HookRelay.Error.t()}
  def list(client, opts \\ []) do
    page = Keyword.get(opts, :page, 1)
    per_page = Keyword.get(opts, :per_page, 20)
    status = Keyword.get(opts, :status)

    params = "page=#{page}&per_page=#{per_page}"
    params = if status, do: params <> "&status=#{status}", else: params

    HookRelay.request(client, :get, "/webhooks?#{params}")
  end

  @doc "Replay a delivery."
  @spec replay(HookRelay.t(), String.t()) :: {:ok, map()} | {:error, HookRelay.Error.t()}
  def replay(client, delivery_id) do
    HookRelay.request(client, :post, "/webhooks/#{delivery_id}/replay")
  end

  @doc "Send multiple webhooks in a batch."
  @spec batch(HookRelay.t(), [map()]) :: {:ok, map()} | {:error, HookRelay.Error.t()}
  def batch(client, webhooks) do
    body = %{
      webhooks:
        Enum.map(webhooks, fn w ->
          item = %{
            endpoint_id: w[:endpoint_id] || w["endpoint_id"],
            data: w[:data] || w["data"]
          }

          if w[:event] || w["event"],
            do: Map.put(item, :event, w[:event] || w["event"]),
            else: item
        end)
    }

    HookRelay.request(client, :post, "/webhooks/batch", body)
  end

  @doc "Get delivery attempts."
  @spec attempts(HookRelay.t(), String.t()) :: {:ok, [map()]} | {:error, HookRelay.Error.t()}
  def attempts(client, delivery_id) do
    HookRelay.request(client, :get, "/webhooks/#{delivery_id}/attempts")
  end

  @doc "Export deliveries."
  @spec export(HookRelay.t(), keyword()) :: {:ok, [map()] | String.t()} | {:error, HookRelay.Error.t()}
  def export(client, opts \\ []) do
    params =
      opts
      |> Enum.filter(fn {_k, v} -> v != nil end)
      |> Enum.map(fn {k, v} -> "#{k}=#{v}" end)
      |> Enum.join("&")

    path = if params != "", do: "/webhooks/export?#{params}", else: "/webhooks/export"
    HookRelay.request(client, :get, path)
  end
end
