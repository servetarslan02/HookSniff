defmodule HookSniff.HttpAdapter do
  @callback request(atom(), String.t(), list(), String.t(), keyword()) ::
              {:ok, %{status: integer(), body: String.t()}} | {:error, term()}
end

defmodule HookSniff.DefaultHttpAdapter do
  @behaviour HookSniff.HttpAdapter

  @impl true
  def request(method, url, headers, body, opts) do
    result = case method do
      :get -> HTTPoison.get(url, headers, opts)
      :post -> HTTPoison.post(url, body, headers, opts)
      :put -> HTTPoison.put(url, body, headers, opts)
      :delete -> HTTPoison.delete(url, headers, opts)
    end

    case result do
      {:ok, %HTTPoison.Response{status_code: status, body: resp_body}} ->
        {:ok, %{status: status, body: resp_body}}
      {:error, %HTTPoison.Error{reason: reason}} ->
        {:error, reason}
    end
  end
end

defmodule HookSniff.Client do
  @moduledoc """
  HTTP client for making requests to the HookSniff API.
  Uses HTTPoison with retry logic and error handling.
  """

  @user_agent "hooksniff-sdk/1.0.0/elixir"
  @default_adapter HookSniff.DefaultHttpAdapter

  @doc """
  Make an HTTP request to the HookSniff API.

  ## Parameters

    * `method` — HTTP method atom (`:get`, `:post`, `:put`, `:delete`)
    * `path` — API path (e.g., `/v1/endpoints`)
    * `body` — Optional request body (will be JSON-encoded)
    * `client` — `%HookSniff{}` struct with connection info

  ## Returns

    * `{:ok, %{status: integer, body: term}}` on success
    * `{:error, reason}` on failure
  """
  @spec request(atom(), String.t(), map() | nil, HookSniff.t()) ::
          {:ok, %{status: integer(), body: term()}} | {:error, term()}
  def request(method, path, body \\ nil, client) do
    url = client.base_url <> path
    headers = build_headers(client)

    body_str = if body, do: Jason.encode!(body), else: ""
    content_type = if body, do: [{"content-type", "application/json"}], else: []

    all_headers = headers ++ content_type

    do_request_with_retry(method, url, all_headers, body_str, client.num_retries, client.timeout, Map.get(client, :http_adapter, @default_adapter))
  end

  @doc """
  Make a request and return only the body, raising on error.
  """
  @spec request!(atom(), String.t(), map() | nil, HookSniff.t()) :: term()
  def request!(method, path, body \\ nil, client) do
    case request(method, path, body, client) do
      {:ok, %{status: status, body: resp_body}} when status in 200..299 ->
        resp_body
      {:ok, %{status: status, body: resp_body}} ->
        raise HookSniff.ApiError, status: status, body: resp_body
      {:error, reason} ->
        raise HookSniff.ApiError, status: 0, body: inspect(reason)
    end
  end

  defp build_headers(client) do
    [
      {"accept", "application/json"},
      {"authorization", "Bearer #{client.api_key}"},
      {"user-agent", @user_agent},
      {"idempotency-key", generate_idempotency_key()}
    ]
  end

  defp generate_idempotency_key do
    bytes = :crypto.strong_rand_bytes(16)
    "auto_" <> Base.encode16(bytes, case: :lower, padding: false)
  end

  defp do_request_with_retry(method, url, headers, body, retries, timeout, adapter) do
    Enum.reduce_while(0..retries, nil, fn attempt, _acc ->
      if attempt > 0 do
        # Exponential backoff: 50ms, 100ms, 200ms, ...
        Process.sleep(50 * Integer.pow(2, attempt - 1))
      end

      case make_request(method, url, headers, body, timeout, adapter) do
        {:ok, %{status: status} = resp} when status >= 500 and attempt < retries ->
          {:cont, {:error, resp}}

        {:ok, resp} ->
          {:halt, {:ok, resp}}

        {:error, _reason} = err when attempt < retries ->
          {:cont, err}

        {:error, _reason} = err ->
          {:halt, err}
      end
    end)
  end

  defp make_request(method, url, headers, body, timeout, adapter) do
    opts = [timeout: timeout, recv_timeout: timeout, ssl: [verify: :verify_peer]]

    case adapter.request(method, url, headers, body, opts) do
      {:ok, %{status: status, body: resp_body}} ->
        parsed = case Jason.decode(resp_body) do
          {:ok, json} -> json
          {:error, _} -> resp_body
        end
        {:ok, %{status: status, body: parsed}}

      {:error, _reason} = err ->
        err
    end
  end
end

defmodule HookSniff.ApiError do
  defexception [:status, :body]

  @impl true
  def message(%{status: status, body: body}) do
    "HookSniff API Error #{status}: #{inspect(body)}"
  end
end
