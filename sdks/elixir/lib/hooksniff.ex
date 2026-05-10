defmodule HookSniff do
  @moduledoc """
  Official Elixir client for the HookSniff webhook delivery service.

  ## Usage

      client = HookSniff.new("hr_live_...")

      # Create endpoint
      {:ok, endpoint} = HookSniff.Endpoints.create(client, %{url: "https://myapp.com/webhook"})

      # Send webhook
      {:ok, delivery} = HookSniff.Webhooks.send(client, %{
        endpoint_id: endpoint["id"],
        event: "order.created",
        data: %{order_id: "12345"}
      })
  """

  @default_base_url "https://api.hooksniff.com/v1"
  @default_timeout 30_000
  @default_max_retries 3
  @user_agent "hooksniff-elixir/0.3.0"

  defstruct [:api_key, :base_url, :timeout, :max_retries]

  @type t :: %__MODULE__{
          api_key: String.t(),
          base_url: String.t(),
          timeout: pos_integer(),
          max_retries: non_neg_integer()
        }

  @doc """
  Create a new HookSniff client.
  """
  @spec new(String.t(), keyword()) :: t()
  def new(api_key, opts \\ []) do
    %__MODULE__{
      api_key: api_key,
      base_url: Keyword.get(opts, :base_url, @default_base_url),
      timeout: Keyword.get(opts, :timeout, @default_timeout),
      max_retries: Keyword.get(opts, :max_retries, @default_max_retries)
    }
  end

  @doc false
  def request(%__MODULE__{} = client, method, path, body \\ nil) do
    do_request(client, method, path, body, 0)
  end

  defp do_request(client, method, path, body, attempt) do
    url = client.base_url <> path
    url_charlist = String.to_charlist(url)

    headers = [
      {'authorization', String.to_charlist("Bearer " <> client.api_key)},
      {'content-type', 'application/json'},
      {'user-agent', String.to_charlist(@user_agent)}
    ]

    http_opts = [
      timeout: client.timeout,
      connect_timeout: client.timeout,
      ssl: [verify: :verify_peer]
    ]

    {content_type, req_body} =
      case body do
        nil -> {'application/json', []}
        _ -> {'application/json', Jason.encode!(body)}
      end

    request = {url_charlist, headers, content_type, req_body}

    case :httpc.request(method_charlist(method), request, http_opts, []) do
      {:ok, {{_http_ver, status, _reason}, _resp_headers, resp_body}} ->
        if retryable?(status) and attempt < client.max_retries do
          :timer.sleep(calculate_backoff(attempt))
          do_request(client, method, path, body, attempt + 1)
        else
          handle_response(status, resp_body)
        end

      {:error, _reason} ->
        if attempt < client.max_retries do
          :timer.sleep(calculate_backoff(attempt))
          do_request(client, method, path, body, attempt + 1)
        else
          {:error, %HookSniff.Error{message: "Network error after #{attempt + 1} attempts", code: :network_error}}
        end
    end
  end

  defp retryable?(status), do: status == 429 or status >= 500

  defp calculate_backoff(attempt) do
    min(1000 * Integer.pow(2, attempt), 30_000)
  end

  defp method_charlist(:get), do: :get
  defp method_charlist(:post), do: :post
  defp method_charlist(:put), do: :put
  defp method_charlist(:delete), do: :delete

  defp handle_response(status, body) when status in 200..299 do
    case Jason.decode(body) do
      {:ok, decoded} -> {:ok, decoded}
      {:error, _} -> {:ok, body}
    end
  end

  defp handle_response(400, body), do: {:error, parse_error(body, :validation_error)}
  defp handle_response(401, body), do: {:error, parse_error(body, :authentication_error)}
  defp handle_response(404, body), do: {:error, parse_error(body, :not_found_error)}
  defp handle_response(413, body), do: {:error, parse_error(body, :payload_too_large_error)}
  defp handle_response(429, body), do: {:error, parse_error(body, :rate_limit_error)}
  defp handle_response(status, body), do: {:error, parse_error(body, :unknown_error, status)}

  defp parse_error(body, code, status \\ nil) do
    message =
      case Jason.decode(body) do
        {:ok, %{"error" => %{"message" => msg}}} -> msg
        _ -> "HTTP #{status || code}"
      end

    %HookSniff.Error{message: message, code: code, status: status}
  end
end

