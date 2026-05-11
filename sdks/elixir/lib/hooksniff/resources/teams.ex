defmodule HookSniff.Teams do
  @moduledoc "Team management — members, invite, remove."

  alias HookSniff.Client

  @doc "List team members"
  @spec list_members(HookSniff.t()) :: {:ok, list()} | {:error, term()}
  def list_members(client), do: Client.request(:get, "/v1/teams/members", nil, client)

  @doc "Invite a team member"
  @spec invite(HookSniff.t(), map()) :: {:ok, map()} | {:error, term()}
  def invite(client, params), do: Client.request(:post, "/v1/teams/invite", params, client)

  @doc "Remove a team member"
  @spec remove_member(HookSniff.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def remove_member(client, id), do: Client.request(:delete, "/v1/teams/members/#{id}", nil, client)
end
