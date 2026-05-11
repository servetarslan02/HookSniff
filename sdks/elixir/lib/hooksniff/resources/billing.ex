defmodule HookSniff.Billing do
  @moduledoc "Billing and subscription management."

  alias HookSniff.Client

  @doc "Get current billing plan"
  @spec plan(HookSniff.t()) :: {:ok, map()} | {:error, term()}
  def plan(client), do: Client.request(:get, "/v1/billing/plan", nil, client)

  @doc "Upgrade billing plan"
  @spec upgrade(HookSniff.t(), map()) :: {:ok, map()} | {:error, term()}
  def upgrade(client, params), do: Client.request(:post, "/v1/billing/upgrade", params, client)

  @doc "Open billing portal"
  @spec portal(HookSniff.t()) :: {:ok, map()} | {:error, term()}
  def portal(client), do: Client.request(:post, "/v1/billing/portal", %{}, client)
end
