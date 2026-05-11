defmodule HookSniff.Auth do
  @moduledoc "Authentication — register, login, 2FA, email verification, password reset."

  alias HookSniff.Client

  @doc "Register a new user"
  @spec register(HookSniff.t(), map()) :: {:ok, map()} | {:error, term()}
  def register(client, params), do: Client.request(:post, "/v1/auth/register", params, client)

  @doc "Log in"
  @spec login(HookSniff.t(), map()) :: {:ok, map()} | {:error, term()}
  def login(client, params), do: Client.request(:post, "/v1/auth/login", params, client)

  @doc "Enable two-factor authentication"
  @spec enable_2fa(HookSniff.t(), map()) :: {:ok, map()} | {:error, term()}
  def enable_2fa(client, params), do: Client.request(:post, "/v1/auth/2fa/enable", params, client)

  @doc "Verify email address"
  @spec verify_email(HookSniff.t()) :: {:ok, map()} | {:error, term()}
  def verify_email(client), do: Client.request(:get, "/v1/auth/verify-email", nil, client)

  @doc "Request password reset"
  @spec forgot_password(HookSniff.t(), map()) :: {:ok, map()} | {:error, term()}
  def forgot_password(client, params), do: Client.request(:post, "/v1/auth/forgot-password", params, client)

  @doc "Export user data"
  @spec export_data(HookSniff.t()) :: {:ok, map()} | {:error, term()}
  def export_data(client), do: Client.request(:get, "/v1/auth/export", nil, client)

  @doc "Delete user account"
  @spec delete_account(HookSniff.t()) :: {:ok, map()} | {:error, term()}
  def delete_account(client), do: Client.request(:delete, "/v1/auth/account", nil, client)
end
