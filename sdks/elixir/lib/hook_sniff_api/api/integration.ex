defmodule HookSniffAPI.Api.Integration do
  @moduledoc """
  API calls for all endpoints tagged `Integration`.
  """

  alias HookSniffAPI.Connection
  import HookSniffAPI.RequestBuilder

  @doc """
  List all integrations.

  ### Parameters

  - `connection` (HookSniffAPI.Connection): Connection to server
  - `opts` (keyword): Optional parameters

  ### Returns

  - `{:ok, list}` on success
  - `{:error, Tesla.Env.t}` on failure
  """
  @spec integrations_list(Tesla.Env.client, keyword()) :: {:ok, list} | {:error, Tesla.Env.t}
  def integrations_list(connection, _opts \\ []) do
    %{}
    |> method(:get)
    |> url("/api/v1/integrations")
    |> Enum.into([])
    |> (&Connection.request(connection, &1)).()
  end

  @doc """
  Get integration details.

  ### Parameters

  - `connection` (HookSniffAPI.Connection): Connection to server
  - `id` (String.t): Integration ID
  - `opts` (keyword): Optional parameters

  ### Returns

  - `{:ok, map}` on success
  - `{:error, Tesla.Env.t}` on failure
  """
  @spec integrations_get(Tesla.Env.client, String.t, keyword()) :: {:ok, map} | {:error, Tesla.Env.t}
  def integrations_get(connection, id, _opts \\ []) do
    %{}
    |> method(:get)
    |> url("/api/v1/integrations/#{id}")
    |> Enum.into([])
    |> (&Connection.request(connection, &1)).()
  end

  @doc """
  Create a new integration.

  ### Parameters

  - `connection` (HookSniffAPI.Connection): Connection to server
  - `body` (map): Integration body

  ### Returns

  - `{:ok, map}` on success
  - `{:error, Tesla.Env.t}` on failure
  """
  @spec integrations_create(Tesla.Env.client, map, keyword()) :: {:ok, map} | {:error, Tesla.Env.t}
  def integrations_create(connection, body, _opts \\ []) do
    %{}
    |> method(:post)
    |> url("/api/v1/integrations")
    |> add_param(:body, :body, body)
    |> Enum.into([])
    |> (&Connection.request(connection, &1)).()
  end

  @doc """
  Update an integration.

  ### Parameters

  - `connection` (HookSniffAPI.Connection): Connection to server
  - `id` (String.t): Integration ID
  - `body` (map): Update body

  ### Returns

  - `{:ok, map}` on success
  - `{:error, Tesla.Env.t}` on failure
  """
  @spec integrations_update(Tesla.Env.client, String.t, map, keyword()) :: {:ok, map} | {:error, Tesla.Env.t}
  def integrations_update(connection, id, body, _opts \\ []) do
    %{}
    |> method(:put)
    |> url("/api/v1/integrations/#{id}")
    |> add_param(:body, :body, body)
    |> Enum.into([])
    |> (&Connection.request(connection, &1)).()
  end

  @doc """
  Delete an integration.

  ### Parameters

  - `connection` (HookSniffAPI.Connection): Connection to server
  - `id` (String.t): Integration ID
  - `opts` (keyword): Optional parameters

  ### Returns

  - `{:ok, nil}` on success
  - `{:error, Tesla.Env.t}` on failure
  """
  @spec integrations_delete(Tesla.Env.client, String.t, keyword()) :: {:ok, nil} | {:error, Tesla.Env.t}
  def integrations_delete(connection, id, _opts \\ []) do
    %{}
    |> method(:delete)
    |> url("/api/v1/integrations/#{id}")
    |> Enum.into([])
    |> (&Connection.request(connection, &1)).()
  end

  @doc """
  Send a test event.

  ### Parameters

  - `connection` (HookSniffAPI.Connection): Connection to server
  - `id` (String.t): Integration ID

  ### Returns

  - `{:ok, map}` on success
  - `{:error, Tesla.Env.t}` on failure
  """
  @spec integrations_test(Tesla.Env.client, String.t, keyword()) :: {:ok, map} | {:error, Tesla.Env.t}
  def integrations_test(connection, id, _opts \\ []) do
    %{}
    |> method(:post)
    |> url("/api/v1/integrations/#{id}/test")
    |> Enum.into([])
    |> (&Connection.request(connection, &1)).()
  end

  @doc """
  List events for an integration.

  ### Parameters

  - `connection` (HookSniffAPI.Connection): Connection to server
  - `id` (String.t): Integration ID

  ### Returns

  - `{:ok, list}` on success
  - `{:error, Tesla.Env.t}` on failure
  """
  @spec integrations_list_events(Tesla.Env.client, String.t, keyword()) :: {:ok, list} | {:error, Tesla.Env.t}
  def integrations_list_events(connection, id, _opts \\ []) do
    %{}
    |> method(:get)
    |> url("/api/v1/integrations/#{id}/events")
    |> Enum.into([])
    |> (&Connection.request(connection, &1)).()
  end

  @doc """
  Get statistics for an integration.

  ### Parameters

  - `connection` (HookSniffAPI.Connection): Connection to server
  - `id` (String.t): Integration ID

  ### Returns

  - `{:ok, map}` on success
  - `{:error, Tesla.Env.t}` on failure
  """
  @spec integrations_get_stats(Tesla.Env.client, String.t, keyword()) :: {:ok, map} | {:error, Tesla.Env.t}
  def integrations_get_stats(connection, id, _opts \\ []) do
    %{}
    |> method(:get)
    |> url("/api/v1/integrations/#{id}/stats")
    |> Enum.into([])
    |> (&Connection.request(connection, &1)).()
  end
end
