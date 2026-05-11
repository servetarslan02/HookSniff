defmodule HookSniff.Teams do
  @moduledoc "Team management — members, invite, remove."

  alias HookSniff.Client

  @doc "List team members (paginated). Accepts `:limit` and `:offset` opts."
  @spec list_members(HookSniff.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def list_members(client, opts \\ []) do
    path = build_query("/v1/teams/members", opts)
    Client.request(:get, path, nil, client)
  end

  @doc "List all team members (auto-paginate). Accepts `:limit` and `:max_pages` opts."
  @spec list_all_members(HookSniff.t(), keyword()) :: {:ok, list()} | {:error, term()}
  def list_all_members(client, opts \\ []) do
    HookSniff.Pagination.collect_all(fn limit, offset ->
      list_members(client, limit: limit, offset: offset)
    end, opts)
  end

  @doc "Invite a team member"
  @spec invite(HookSniff.t(), map()) :: {:ok, map()} | {:error, term()}
  def invite(client, params), do: Client.request(:post, "/v1/teams/invite", params, client)

  @doc "Remove a team member"
  @spec remove_member(HookSniff.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def remove_member(client, id), do: Client.request(:delete, "/v1/teams/members/#{id}", nil, client)

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
