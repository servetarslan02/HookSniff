defmodule HookSniff.Webhook do
  @moduledoc """
  Webhook signature verification for incoming HookSniff webhooks.

  Verifies HMAC-SHA256 signatures in Standard Webhooks format.
  Supports `whsec_` prefixed secrets and replay protection (5-minute tolerance).

  ## Usage

      secret = "whsec_base64encoded..."
      headers = %{
        "webhook-id" => "msg_123",
        "webhook-timestamp" => "1678900000",
        "webhook-signature" => "v1,abc123..."
      }
      body = ~s({"event": "order.created"})

      {:ok, payload} = HookSniff.Webhook.verify(body, headers, secret)
      {:error, %HookSniff.Webhook.VerificationError{}} = HookSniff.Webhook.verify(body, bad_headers, secret)
  """

  @timestamp_tolerance_seconds 5 * 60

  defmodule VerificationError do
    defexception [:message]
  end

  @doc """
  Verify a webhook payload against its signature headers.

  ## Parameters

    * `payload` — The raw request body (string)
    * `headers` — Map with `webhook-id`, `webhook-timestamp`, `webhook-signature` keys
      (also accepts `svix-id`, `svix-timestamp`, `svix-signature`)
    * `secret` — The endpoint's signing secret (e.g., `"whsec_..."`)

  ## Returns

    * `{:ok, parsed_payload}` if verification succeeds
    * `{:error, %VerificationError{}}` if verification fails
  """
  @spec verify(String.t(), map(), String.t() | binary()) ::
          {:ok, term()} | {:error, VerificationError.t()}
  def verify(payload, headers, secret) when is_binary(payload) do
    normalized = normalize_headers(headers)

    with {:ok, msg_id} <- get_header(normalized, "webhook-id"),
         {:ok, timestamp} <- get_header(normalized, "webhook-timestamp"),
         {:ok, signature} <- get_header(normalized, "webhook-signature"),
         :ok <- validate_timestamp(timestamp),
         {:ok, secret_bytes} <- decode_secret(secret) do
      ts = String.to_integer(timestamp)
      content = "#{msg_id}.#{ts}.#{payload}"
      expected_sig = compute_hmac(secret_bytes, content)
      expected = "v1,#{Base.encode64(expected_sig)}"

      if verify_signature(expected, signature) do
        parse_payload(payload)
      else
        {:error, %VerificationError{message: "Invalid webhook signature"}}
      end
    end
  end

  @doc """
  Sign a payload (for testing or server-side webhook sending).

  ## Parameters

    * `msg_id` — The message ID
    * `timestamp` — Unix timestamp (integer)
    * `payload` — The payload string
    * `secret` — The signing secret

  ## Returns

  Signature string in `"v1,base64hmac"` format.
  """
  @spec sign(String.t(), integer(), String.t(), String.t() | binary()) :: String.t()
  def sign(msg_id, timestamp, payload, secret) when is_integer(timestamp) do
    {:ok, secret_bytes} = decode_secret(secret)
    content = "#{msg_id}.#{timestamp}.#{payload}"
    sig = compute_hmac(secret_bytes, content)
    "v1,#{Base.encode64(sig)}"
  end

  # --- Private helpers ---

  defp normalize_headers(headers) do
    Enum.into(headers, %{}, fn {k, v} -> {String.downcase(k), v} end)
  end

  defp get_header(headers, name) do
    # Support both svix- and webhook- prefixed headers
    svix_name = String.replace(name, "webhook-", "svix-")

    case Map.get(headers, name) || Map.get(headers, svix_name) do
      nil -> {:error, %VerificationError{message: "Missing #{name} header"}}
      value -> {:ok, value}
    end
  end

  defp validate_timestamp(timestamp_str) do
    case Integer.parse(timestamp_str) do
      {timestamp, ""} ->
        now = System.system_time(:second)
        if abs(now - timestamp) > @timestamp_tolerance_seconds do
          {:error, %VerificationError{
            message: "Webhook timestamp is too old or too new (tolerance: #{@timestamp_tolerance_seconds}s)"
          }}
        else
          :ok
        end

      _ ->
        {:error, %VerificationError{message: "Invalid webhook-timestamp header"}}
    end
  end

  defp decode_secret(secret) when is_binary(secret) do
    raw = if String.starts_with?(secret, "whsec_"),
      do: String.replace_prefix(secret, "whsec_", ""),
      else: secret

    case Base.decode64(raw) do
      {:ok, bytes} -> {:ok, bytes}
      :error -> {:ok, raw}
    end
  end

  defp decode_secret(secret) when is_list(secret), do: {:ok, :erlang.list_to_binary(secret)}

  defp compute_hmac(secret, content) do
    :crypto.mac(:hmac, :sha256, secret, content)
  end

  defp verify_signature(expected, actual) do
    expected_part = case String.split(expected, ",", parts: 2) do
      [_version, val] -> val
      [val] -> val
    end

    # Get all base64 signature values to check.
    # Handles: single "v1,base64", space-separated "v1,sig1 v1,sig2",
    # and comma-separated "v1,sig1,sig2" formats.
    sig_values =
      actual
      |> String.split(" ")
      |> Enum.map(&String.trim/1)
      |> Enum.filter(&(&1 != ""))
      |> Enum.flat_map(fn entry ->
        case String.split(entry, ",", parts: 2) do
          ["v1", rest] -> String.split(rest, ",")
          _ -> []
        end
      end)

    Enum.any?(sig_values, fn sig_val ->
      sig_val = String.trim(sig_val)
      if byte_size(expected_part) == byte_size(sig_val) do
        :crypto.hash_equals(expected_part, sig_val)
      else
        false
      end
    end)
  end

  defp parse_payload(payload) do
    case Jason.decode(payload) do
      {:ok, parsed} -> {:ok, parsed}
      {:error, _} -> {:ok, payload}
    end
  end
end
