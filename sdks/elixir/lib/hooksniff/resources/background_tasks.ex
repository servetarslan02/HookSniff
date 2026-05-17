defmodule HookSniff.BackgroundTasks do
  @moduledoc """
  Manage background tasks (async operations like bulk replay).
  """

  alias HookSniff.Client

  @spec list(Client.t()) :: {:ok, list()} | {:error, term()}
  def list(%Client{} = client) do
    Client.request(client, :get, "/api/v1/background-tasks")
  end

  @spec get(Client.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def get(%Client{} = client, task_id) do
    Client.request(client, :get, "/api/v1/background-tasks/#{task_id}")
  end

  @spec cancel(Client.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def cancel(%Client{} = client, task_id) do
    Client.request(client, :put, "/api/v1/background-tasks/#{task_id}")
  end
end
