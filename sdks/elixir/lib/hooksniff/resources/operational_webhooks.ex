defmodule HookSniff.OperationalWebhooks do
  alias HookSniff.Client
  @spec list(Client.t()) :: {:ok, list()} | {:error, term()}
  def list(%Client{} = c), do: Client.request(c, :get, "/api/v1/operational-webhooks")
  @spec create(Client.t(), map()) :: {:ok, map()} | {:error, term()}
  def create(%Client{} = c, body), do: Client.request(c, :post, "/api/v1/operational-webhooks", body)
  @spec get(Client.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def get(%Client{} = c, id), do: Client.request(c, :get, "/api/v1/operational-webhooks/#{id}")
  @spec update(Client.t(), String.t(), map()) :: {:ok, map()} | {:error, term()}
  def update(%Client{} = c, id, body), do: Client.request(c, :put, "/api/v1/operational-webhooks/#{id}", body)
  @spec delete(Client.t(), String.t()) :: :ok | {:error, term()}
  def delete(%Client{} = c, id), do: Client.request(c, :delete, "/api/v1/operational-webhooks/#{id}")
  @spec list_deliveries(Client.t(), String.t()) :: {:ok, list()} | {:error, term()}
  def list_deliveries(%Client{} = c, id), do: Client.request(c, :get, "/api/v1/operational-webhooks/#{id}/deliveries")
end
