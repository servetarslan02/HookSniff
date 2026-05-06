defmodule HookSniff.Endpoints do
  @moduledoc """
  Endpoints resource — CRUD operations for webhook endpoints.
  """

  alias HookSniff

  @doc "Create a new endpoint."
  @spec create(HookSniff.t(), map()) :: {:ok, map()} | {:error, HookSniff.Error.t()}
  def create(client, params) do
    body = %{url: params[:url] || params["url"]}
    body = if params[:description], do: Map.put(body, :description, params[:description]), else: body
    body = if params[:retry_policy], do: Map.put(body, :retry_policy, params[:retry_policy]), else: body

    HookSniff.request(client, :post, "/endpoints", body)
  end

  @doc "Get an endpoint by ID."
  @spec get(HookSniff.t(), String.t()) :: {:ok, map()} | {:error, HookSniff.Error.t()}
  def get(client, endpoint_id) do
    HookSniff.request(client, :get, "/endpoints/#{endpoint_id}")
  end

  @doc "List all endpoints."
  @spec list(HookSniff.t(), keyword()) :: {:ok, map()} | {:error, HookSniff.Error.t()}
  def list(client, opts \\ []) do
    page = Keyword.get(opts, :page, 1)
    per_page = Keyword.get(opts, :per_page, 20)
    HookSniff.request(client, :get, "/endpoints?page=#{page}&per_page=#{per_page}")
  end

  @doc "Delete an endpoint."
  @spec delete(HookSniff.t(), String.t()) :: {:ok, boolean()} | {:error, HookSniff.Error.t()}
  def delete(client, endpoint_id) do
    case HookSniff.request(client, :delete, "/endpoints/#{endpoint_id}") do
      {:ok, %{"deleted" => deleted}} -> {:ok, deleted}
      {:ok, _} -> {:ok, true}
      error -> error
    end
  end

  @doc "Rotate the signing secret for an endpoint."
  @spec rotate_secret(HookSniff.t(), String.t()) :: {:ok, map()} | {:error, HookSniff.Error.t()}
  def rotate_secret(client, endpoint_id) do
    HookSniff.request(client, :post, "/endpoints/#{endpoint_id}/rotate-secret")
  end
end
