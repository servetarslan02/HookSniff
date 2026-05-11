defmodule HookSniff.ApiKeys do
  @moduledoc "API key management — list, create, delete."

  alias HookSniff.Client

  @doc "List API keys"
  @spec list(HookSniff.t()) :: {:ok, list()} | {:error, term()}
  def list(client), do: Client.request(:get, "/v1/api-keys", nil, client)

  @doc "Create a new API key"
  @spec create(HookSniff.t(), map()) :: {:ok, map()} | {:error, term()}
  def create(client, params), do: Client.request(:post, "/v1/api-keys", params, client)

  @doc "Delete an API key"
  @spec delete(HookSniff.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def delete(client, id), do: Client.request(:delete, "/v1/api-keys/#{id}", nil, client)
end
