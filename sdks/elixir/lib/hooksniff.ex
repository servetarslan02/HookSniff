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
  @user_agent "hooksniff-elixir/0.2.0"

  defstruct [:api_key, :base_url, :timeout]

  @type t :: %__MODULE__{
          api_key: String.t(),
          base_url: String.t(),
          timeout: pos_integer()
        }

  @doc """
  Create a new HookSniff client.
  """
  @spec new(String.t(), keyword()) :: t()
  def new(api_key, opts \\ []) do
    %__MODULE__{
      api_key: api_key,
      base_url: Keyword.get(opts, :base_url, @default_base_url),
      timeout: Keyword.get(opts, :timeout, @default_timeout)
    }
  end

  @doc false
  def request(%__MODULE__{} = client, method, path, body \\ nil) do
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
      {:ok, {{_http_ver, status, _reason}, resp_headers, resp_body}} ->
        handle_response(status, resp_headers, to_string(resp_body))

      {:error, reason} ->
        {:error, %HookSniff.Error{message: "HTTP error: #{inspect(reason)}", code: :network_error}}
    end
  end

  defp method_charlist(:get), do: :get
  defp method_charlist(:post), do: :post
  defp method_charlist(:put), do: :put
  defp method_charlist(:delete), do: :delete

  defp handle_response(status, _headers, body) when status in 200..299 do
    case Jason.decode(body) do
      {:ok, decoded} -> {:ok, decoded}
      {:error, _} -> {:ok, body}
    end
  end

  defp handle_response(400, _headers, body), do: {:error, parse_error(body, :validation_error)}
  defp handle_response(401, _headers, body), do: {:error, parse_error(body, :authentication_error)}
  defp handle_response(404, _headers, body), do: {:error, parse_error(body, :not_found_error)}
  defp handle_response(413, _headers, body), do: {:error, parse_error(body, :payload_too_large_error)}
  defp handle_response(429, _headers, body), do: {:error, parse_error(body, :rate_limit_error)}
  defp handle_response(status, _headers, body), do: {:error, parse_error(body, :unknown_error, status)}

  defp parse_error(body, code, status \\ nil) do
    message =
      case Jason.decode(body) do
        {:ok, %{"error" => %{"message" => msg}}} -> msg
        _ -> "HTTP #{status || code}"
      end

    %HookSniff.Error{message: message, code: code, status: status}
  end
end

