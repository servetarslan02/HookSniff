defmodule HookSniff.Endpoints do
  @moduledoc "Manage webhook endpoints — create, list, update, delete, rotate secrets."

  alias HookSniff.Client

  @doc "List endpoints (paginated). Accepts `:limit` and `:offset` opts."
  @spec list(HookSniff.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def list(client, opts \\ []) do
    path = build_query("/v1/endpoints", opts)
    Client.request(:get, path, nil, client)
  end

  @doc "List all endpoints (auto-paginate). Accepts `:limit` and `:max_pages` opts."
  @spec list_all(HookSniff.t(), keyword()) :: {:ok, list()} | {:error, term()}
  def list_all(client, opts \\ []) do
    HookSniff.Pagination.collect_all(fn limit, offset ->
      case list(client, limit: limit, offset: offset) do
        {:ok, %{status: status, body: body}} when status in 200..299 ->
          parsed = if is_binary(body), do: Jason.decode!(body), else: body
          {:ok, %{data: Map.get(parsed, "data", []), has_more: Map.get(parsed, "has_more", false)}}
        {:ok, %{status: status, body: body}} ->
          {:error, "HTTP #{status}: #{inspect(body)}"}
        {:error, _} = err ->
          err
      end
    end, opts)
  end

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

  defp build_query(path, opts) do
    params = Enum.filter(opts, fn {_k, v} -> v != nil end)

    case params do
      [] -> path
      _ ->
        query =
          params
          |> Enum.map(fn {k, v} -> "#{k}=#{URI.encode_www_form(to_string(v))}" end)
          |> Enum.join("&")
        "#{path}?#{query}"
    end
  end
end
