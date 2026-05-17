defmodule HookSniff.Environments do
  @moduledoc """
  Manage environments (dev/staging/prod) and their variables.
  """

  alias HookSniff.Client

  @doc """
  List all environments for the authenticated customer.
  """
  @spec list(Client.t()) :: {:ok, list()} | {:error, term()}
  def list(%Client{} = client) do
    Client.request(client, :get, "/api/v1/environments")
  end

  @doc """
  Create a new environment.
  """
  @spec create(Client.t(), map()) :: {:ok, map()} | {:error, term()}
  def create(%Client{} = client, body) do
    Client.request(client, :post, "/api/v1/environments", body)
  end

  @doc """
  Get an environment by ID.
  """
  @spec get(Client.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def get(%Client{} = client, environment_id) do
    Client.request(client, :get, "/api/v1/environments/#{environment_id}")
  end

  @doc """
  Update an environment.
  """
  @spec update(Client.t(), String.t(), map()) :: {:ok, map()} | {:error, term()}
  def update(%Client{} = client, environment_id, body) do
    Client.request(client, :put, "/api/v1/environments/#{environment_id}", body)
  end

  @doc """
  Delete an environment.
  """
  @spec delete(Client.t(), String.t()) :: :ok | {:error, term()}
  def delete(%Client{} = client, environment_id) do
    Client.request(client, :delete, "/api/v1/environments/#{environment_id}")
  end

  @doc """
  List all variables in an environment.
  """
  @spec list_variables(Client.t(), String.t()) :: {:ok, list()} | {:error, term()}
  def list_variables(%Client{} = client, environment_id) do
    Client.request(client, :get, "/api/v1/environments/#{environment_id}/variables")
  end

  @doc """
  Get a single variable.
  """
  @spec get_variable(Client.t(), String.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def get_variable(%Client{} = client, environment_id, variable_id) do
    Client.request(client, :get, "/api/v1/environments/#{environment_id}/variables/#{variable_id}")
  end

  @doc """
  Create a variable in an environment.
  """
  @spec create_variable(Client.t(), String.t(), map()) :: {:ok, map()} | {:error, term()}
  def create_variable(%Client{} = client, environment_id, body) do
    Client.request(client, :post, "/api/v1/environments/#{environment_id}/variables", body)
  end

  @doc """
  Update a variable.
  """
  @spec update_variable(Client.t(), String.t(), String.t(), map()) :: {:ok, map()} | {:error, term()}
  def update_variable(%Client{} = client, environment_id, variable_id, body) do
    Client.request(client, :put, "/api/v1/environments/#{environment_id}/variables/#{variable_id}", body)
  end

  @doc """
  Delete a variable.
  """
  @spec delete_variable(Client.t(), String.t(), String.t()) :: :ok | {:error, term()}
  def delete_variable(%Client{} = client, environment_id, variable_id) do
    Client.request(client, :delete, "/api/v1/environments/#{environment_id}/variables/#{variable_id}")
  end

  @doc """
  Bulk upsert variables (create or update multiple at once).
  """
  @spec bulk_upsert_variables(Client.t(), String.t(), map()) :: {:ok, list()} | {:error, term()}
  def bulk_upsert_variables(%Client{} = client, environment_id, body) do
    Client.request(client, :post, "/api/v1/environments/#{environment_id}/variables/bulk", body)
  end
end
