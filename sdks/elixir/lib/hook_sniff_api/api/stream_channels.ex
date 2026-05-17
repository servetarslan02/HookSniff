defmodule HookSniffAPI.Api.Stream do
  @moduledoc """
  API calls for stream channels, subscriptions, and real-time events.
  """

  alias HookSniffAPI.Connection
  import HookSniffAPI.RequestBuilder

  @spec channels_list(Tesla.Env.client, keyword()) :: {:ok, list} | {:error, Tesla.Env.t}
  def channels_list(connection, _opts \\ []) do
    %{}
    |> method(:get)
    |> url("/api/v1/stream/channels")
    |> Enum.into([])
    |> (&Connection.request(connection, &1)).()
  end

  @spec channels_get(Tesla.Env.client, String.t, keyword()) :: {:ok, map} | {:error, Tesla.Env.t}
  def channels_get(connection, id, _opts \\ []) do
    %{}
    |> method(:get)
    |> url("/api/v1/stream/channels/#{id}")
    |> Enum.into([])
    |> (&Connection.request(connection, &1)).()
  end

  @spec channels_create(Tesla.Env.client, map, keyword()) :: {:ok, map} | {:error, Tesla.Env.t}
  def channels_create(connection, body, _opts \\ []) do
    %{}
    |> method(:post)
    |> url("/api/v1/stream/channels")
    |> add_param(:body, :body, body)
    |> Enum.into([])
    |> (&Connection.request(connection, &1)).()
  end

  @spec channels_update(Tesla.Env.client, String.t, map, keyword()) :: {:ok, map} | {:error, Tesla.Env.t}
  def channels_update(connection, id, body, _opts \\ []) do
    %{}
    |> method(:put)
    |> url("/api/v1/stream/channels/#{id}")
    |> add_param(:body, :body, body)
    |> Enum.into([])
    |> (&Connection.request(connection, &1)).()
  end

  @spec channels_delete(Tesla.Env.client, String.t, keyword()) :: {:ok, nil} | {:error, Tesla.Env.t}
  def channels_delete(connection, id, _opts \\ []) do
    %{}
    |> method(:delete)
    |> url("/api/v1/stream/channels/#{id}")
    |> Enum.into([])
    |> (&Connection.request(connection, &1)).()
  end

  @spec messages_list(Tesla.Env.client, String.t, keyword()) :: {:ok, list} | {:error, Tesla.Env.t}
  def messages_list(connection, id, _opts \\ []) do
    %{}
    |> method(:get)
    |> url("/api/v1/stream/channels/#{id}/messages")
    |> Enum.into([])
    |> (&Connection.request(connection, &1)).()
  end

  @spec subscriptions_list(Tesla.Env.client, keyword()) :: {:ok, list} | {:error, Tesla.Env.t}
  def subscriptions_list(connection, _opts \\ []) do
    %{}
    |> method(:get)
    |> url("/api/v1/stream/subscriptions")
    |> Enum.into([])
    |> (&Connection.request(connection, &1)).()
  end

  @spec subscriptions_disconnect(Tesla.Env.client, String.t, keyword()) :: {:ok, nil} | {:error, Tesla.Env.t}
  def subscriptions_disconnect(connection, id, _opts \\ []) do
    %{}
    |> method(:delete)
    |> url("/api/v1/stream/subscriptions/#{id}")
    |> Enum.into([])
    |> (&Connection.request(connection, &1)).()
  end

  @spec publish(Tesla.Env.client, map, keyword()) :: {:ok, map} | {:error, Tesla.Env.t}
  def publish(connection, body, _opts \\ []) do
    %{}
    |> method(:post)
    |> url("/api/v1/stream/publish")
    |> add_param(:body, :body, body)
    |> Enum.into([])
    |> (&Connection.request(connection, &1)).()
  end
end
