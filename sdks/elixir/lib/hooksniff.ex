defmodule HookSniff do
  @moduledoc """
  HookSniff SDK — A clean wrapper for the HookSniff webhook delivery API.

  ## Usage

      hs = HookSniff.new(api_key: "your-api-key")

      # List endpoints
      {:ok, endpoints} = HookSniff.Endpoints.list(hs)

      # Send a webhook
      {:ok, delivery} = HookSniff.Webhooks.send(hs, %{
        endpoint_id: "ep_123",
        event: "order.created",
        data: %{order_id: "12345"}
      })

      # Verify incoming webhook signature
      {:ok, payload} = HookSniff.Webhook.verify(raw_body, headers, secret)
  """

  @default_base_url "https://hooksniff-api-1046140057667.europe-west1.run.app"

  @type t :: %__MODULE__{
    api_key: String.t(),
    base_url: String.t(),
    timeout: pos_integer(),
    num_retries: non_neg_integer(),
    http_adapter: module()
  }

  defstruct [:api_key, :base_url, :timeout, :num_retries, :http_adapter]

  @doc """
  Create a new HookSniff client.

  ## Options

    * `:api_key` — (required) Your API key or JWT token.
    * `:base_url` — Base URL of the HookSniff API (default: production).
    * `:timeout` — Request timeout in milliseconds (default: 30_000).
    * `:num_retries` — Number of retries for 5xx errors (default: 2).

  ## Examples

      hs = HookSniff.new(api_key: "whsec_abc123")
  """
  @spec new(keyword()) :: t()
  def new(opts \\ []) do
    api_key = Keyword.fetch!(opts, :api_key)

    %__MODULE__{
      api_key: api_key,
      base_url: Keyword.get(opts, :base_url, @default_base_url),
      timeout: Keyword.get(opts, :timeout, 30_000),
      num_retries: Keyword.get(opts, :num_retries, 2),
      http_adapter: Keyword.get(opts, :http_adapter, HookSniff.DefaultHttpAdapter)
    }
  end
end
