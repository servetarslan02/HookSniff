defmodule HookSniff.Endpoints do
  @moduledoc "Manage webhook endpoints — create, list, update, delete, rotate secrets."

  alias HookSniff.Client

  @doc "List all endpoints"
  @spec list(HookSniff.t()) :: {:ok, list()} | {:error, term()}
  def list(client), do: Client.request(:get, "/v1/endpoints", nil, client)

  @doc "Create a new endpoint"
  @spec create(HookSniff.t(), map()) :: {:ok, map()} | {:error, term()}
  def create(client, params), do: Client.request(:post, "/v1/endpoints", params, client)

  @doc "Get endpoint by ID"
  @spec get(HookSniff.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def get(client, id), do: Client.request(:get, "/v1/endpoints/#{id}", nil, client)

  @doc "Update an endpoint"
  @spec update(HookSniff.t(), String.t(), map()) :: {:ok, map()} | {:error, term()}
  def update(client, id, params), do: Client.request(:put, "/v1/endpoints/#{id}", params, client)

  @doc "Delete an endpoint"
  @spec delete(HookSniff.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def delete(client, id), do: Client.request(:delete, "/v1/endpoints/#{id}", nil, client)

  @doc "Rotate the signing secret for an endpoint"
  @spec rotate_secret(HookSniff.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def rotate_secret(client, id), do: Client.request(:post, "/v1/endpoints/#{id}/rotate-secret", %{}, client)
end
