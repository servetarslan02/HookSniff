defmodule HookSniff.Alerts do
  @moduledoc "Alert rules and notifications."

  alias HookSniff.Client

  @doc "List alert rules (paginated). Accepts `:limit` and `:offset` opts."
  @spec list_rules(HookSniff.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def list_rules(client, opts \\ []) do
    path = build_query("/v1/alerts/rules", opts)
    Client.request(:get, path, nil, client)
  end

  @doc "List all alert rules (auto-paginate). Accepts `:limit` and `:max_pages` opts."
  @spec list_all_rules(HookSniff.t(), keyword()) :: {:ok, list()} | {:error, term()}
  def list_all_rules(client, opts \\ []) do
    HookSniff.Pagination.collect_all(fn limit, offset ->
      list_rules(client, limit: limit, offset: offset)
    end, opts)
  end

  @doc "List alert notifications (paginated). Accepts `:limit` and `:offset` opts."
  @spec list_notifications(HookSniff.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def list_notifications(client, opts \\ []) do
    path = build_query("/v1/alerts/notifications", opts)
    Client.request(:get, path, nil, client)
  end

  @doc "List all alert notifications (auto-paginate). Accepts `:limit` and `:max_pages` opts."
  @spec list_all_notifications(HookSniff.t(), keyword()) :: {:ok, list()} | {:error, term()}
  def list_all_notifications(client, opts \\ []) do
    HookSniff.Pagination.collect_all(fn limit, offset ->
      list_notifications(client, limit: limit, offset: offset)
    end, opts)
  end

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
