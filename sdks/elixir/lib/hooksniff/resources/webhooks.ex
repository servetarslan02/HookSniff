defmodule HookSniff.Webhooks do
  @moduledoc "Webhook send, list, batch, replay."

  alias HookSniff.Client

  @doc "Send a webhook"
  @spec send_webhook(HookSniff.t(), map()) :: {:ok, map()} | {:error, term()}
  def send_webhook(client, params), do: Client.request(:post, "/v1/webhooks", params, client)

  @doc "Send a batch of webhooks"
  @spec send_batch(HookSniff.t(), map()) :: {:ok, map()} | {:error, term()}
  def send_batch(client, params), do: Client.request(:post, "/v1/webhooks/batch", params, client)

  @doc "List webhook deliveries"
  @spec list(HookSniff.t()) :: {:ok, list()} | {:error, term()}
  def list(client), do: Client.request(:get, "/v1/webhooks", nil, client)

  @doc "Get a webhook delivery by ID"
  @spec get(HookSniff.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def get(client, id), do: Client.request(:get, "/v1/webhooks/#{id}", nil, client)

  @doc "Replay a webhook delivery"
  @spec replay(HookSniff.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def replay(client, id), do: Client.request(:post, "/v1/webhooks/#{id}/replay", %{}, client)
end
