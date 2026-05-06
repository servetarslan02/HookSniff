defmodule HookRelay.Endpoints do
  @moduledoc """
  Endpoints resource — CRUD operations for webhook endpoints.
  """

  alias HookRelay

  @doc "Create a new endpoint."
  @spec create(HookRelay.t(), map()) :: {:ok, map()} | {:error, HookRelay.Error.t()}
  def create(client, params) do
    body = %{url: params[:url] || params["url"]}
    body = if params[:description], do: Map.put(body, :description, params[:description]), else: body
    body = if params[:retry_policy], do: Map.put(body, :retry_policy, params[:retry_policy]), else: body

    HookRelay.request(client, :post, "/endpoints", body)
  end

  @doc "Get an endpoint by ID."
  @spec get(HookRelay.t(), String.t()) :: {:ok, map()} | {:error, HookRelay.Error.t()}
  def get(client, endpoint_id) do
    HookRelay.request(client, :get, "/endpoints/#{endpoint_id}")
  end

  @doc "List all endpoints."
  @spec list(HookRelay.t(), keyword()) :: {:ok, map()} | {:error, HookRelay.Error.t()}
  def list(client, opts \\ []) do
    page = Keyword.get(opts, :page, 1)
    per_page = Keyword.get(opts, :per_page, 20)
    HookRelay.request(client, :get, "/endpoints?page=#{page}&per_page=#{per_page}")
  end

  @doc "Delete an endpoint."
  @spec delete(HookRelay.t(), String.t()) :: {:ok, boolean()} | {:error, HookRelay.Error.t()}
  def delete(client, endpoint_id) do
    case HookRelay.request(client, :delete, "/endpoints/#{endpoint_id}") do
      {:ok, %{"deleted" => deleted}} -> {:ok, deleted}
      {:ok, _} -> {:ok, true}
      error -> error
    end
  end

  @doc "Rotate the signing secret for an endpoint."
  @spec rotate_secret(HookRelay.t(), String.t()) :: {:ok, map()} | {:error, HookRelay.Error.t()}
  def rotate_secret(client, endpoint_id) do
    HookRelay.request(client, :post, "/endpoints/#{endpoint_id}/rotate-secret")
  end
end
