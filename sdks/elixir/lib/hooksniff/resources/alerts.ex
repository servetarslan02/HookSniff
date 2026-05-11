defmodule HookSniff.Alerts do
  @moduledoc "Alert rules and notifications."

  alias HookSniff.Client

  @doc "List alert rules"
  @spec list_rules(HookSniff.t()) :: {:ok, list()} | {:error, term()}
  def list_rules(client), do: Client.request(:get, "/v1/alerts/rules", nil, client)

  @doc "List alert notifications"
  @spec list_notifications(HookSniff.t()) :: {:ok, list()} | {:error, term()}
  def list_notifications(client), do: Client.request(:get, "/v1/alerts/notifications", nil, client)
end
