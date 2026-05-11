defmodule HookSniff.ApiKeys do
  @moduledoc "API key management — list, create, delete."

  alias HookSniff.Client

  @doc "List API keys (paginated). Accepts `:limit` and `:offset` opts."
  @spec list(HookSniff.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def list(client, opts \\ []) do
    path = build_query("/v1/api-keys", opts)
    Client.request(:get, path, nil, client)
  end

  @doc "List all API keys (auto-paginate). Accepts `:limit` and `:max_pages` opts."
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

  @doc "Create a new API key"
  @spec create(HookSniff.t(), map()) :: {:ok, map()} | {:error, term()}
  def create(client, params), do: Client.request(:post, "/v1/api-keys", params, client)

  @doc "Delete an API key"
  @spec delete(HookSniff.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def delete(client, id), do: Client.request(:delete, "/v1/api-keys/#{id}", nil, client)

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
