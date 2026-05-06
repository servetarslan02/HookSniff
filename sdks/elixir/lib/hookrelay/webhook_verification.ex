defmodule HookRelay.WebhookVerification do
  @moduledoc """
  Webhook signature verification for HookRelay.

  Supports both simple HMAC-SHA256 verification and Standard Webhooks
  (Svix-compatible) verification with timestamp tolerance.

  Also supports Svix headers (svix-id, svix-signature, svix-timestamp) as fallback.

  ## Example

      # Verify from request headers
      result = HookRelay.WebhookVerification.verify_webhook_from_headers(
        payload: body,
        headers: conn.req_headers |> Map.new(),
        secret: "whsec_..."
      )

      case result do
        {:ok, payload} -> # Valid webhook
        {:error, reason} -> # Invalid
      end
  """

  @default_tolerance_secs 300

  @doc """
  Verify a webhook signature using HMAC-SHA256 (legacy format).
  """
  @spec verify_signature(String.t(), String.t(), String.t()) :: boolean()
  def verify_signature(payload, signature, secret)
      when is_binary(payload) and is_binary(signature) and is_binary(secret) do
    if payload == "" or signature == "" or secret == "" do
      false
    else
      expected_hex =
        if String.starts_with?(signature, "sha256="),
          do: String.slice(signature, 7..-1//1),
          else: signature

      computed = :crypto.mac(:hmac, :sha256, secret, payload) |> Base.encode16(case: :lower)
      Plug.Crypto.secure_compare(computed, expected_hex)
    end
  end

  def verify_signature(_, _, _), do: false

  @doc """
  Verify a webhook using Standard Webhooks headers (Svix-compatible).

  Returns `{:ok, parsed_payload}` or `{:error, reason}`.
  """
  @spec verify_webhook(keyword()) :: {:ok, map() | String.t()} | {:error, String.t()}
  def verify_webhook(opts) do
    payload = Keyword.fetch!(opts, :payload)
    msg_id = Keyword.get(opts, :msg_id)
    timestamp = Keyword.get(opts, :timestamp)
    signature_header = Keyword.get(opts, :signature_header)
    secret = Keyword.fetch!(opts, :secret)
    tolerance_secs = Keyword.get(opts, :tolerance_secs, @default_tolerance_secs)

    cond do
      is_nil(msg_id) or msg_id == "" ->
        {:error, "Missing webhook-id header"}

      is_nil(timestamp) or timestamp == "" ->
        {:error, "Missing webhook-timestamp header"}

      is_nil(signature_header) or signature_header == "" ->
        {:error, "Missing webhook-signature header"}

      is_nil(payload) or payload == "" ->
        {:error, "Missing request body"}

      true ->
        verify_webhook_impl(payload, msg_id, timestamp, signature_header, secret, tolerance_secs)
    end
  end

  @doc """
  Verify a webhook from headers with automatic header detection.

  Supports both Standard Webhooks headers (webhook-id, webhook-signature, webhook-timestamp)
  and Svix headers (svix-id, svix-signature, svix-timestamp) as fallback.
  """
  @spec verify_webhook_from_headers(keyword()) :: {:ok, map() | String.t()} | {:error, String.t()}
  def verify_webhook_from_headers(opts) do
    headers = Keyword.fetch!(opts, :headers)
    normalized = for {k, v} <- headers, into: %{}, do: {String.downcase(to_string(k)), v}

    msg_id = normalized["webhook-id"]
    timestamp = normalized["webhook-timestamp"]
    signature_header = normalized["webhook-signature"]

    {msg_id, timestamp, signature_header} =
      if is_nil(msg_id) or is_nil(timestamp) or is_nil(signature_header) do
        {
          msg_id || normalized["svix-id"],
          timestamp || normalized["svix-timestamp"],
          signature_header || normalized["svix-signature"]
        }
      else
        {msg_id, timestamp, signature_header}
      end

    verify_webhook(
      payload: opts[:payload],
      msg_id: msg_id,
      timestamp: timestamp,
      signature_header: signature_header,
      secret: opts[:secret],
      tolerance_secs: opts[:tolerance_secs]
    )
  end

  # Private implementation

  defp verify_webhook_impl(payload, msg_id, timestamp, signature_header, secret, tolerance_secs) do
    case Integer.parse(timestamp) do
      {ts, ""} ->
        now = System.system_time(:second)

        if now - ts > tolerance_secs do
          {:error, "Message timestamp too old"}
        else
          if ts > now + tolerance_secs do
            {:error, "Message timestamp too new"}
          else
            do_verify_signature(payload, msg_id, timestamp, signature_header, secret)
          end
        end

      _ ->
        {:error, "Invalid webhook timestamp"}
    end
  end

  defp do_verify_signature(payload, msg_id, timestamp, signature_header, secret) do
    signed_content = "#{msg_id}.#{timestamp}.#{payload}"
    secret_bytes = decode_secret(secret)

    expected_sig =
      :crypto.mac(:hmac, :sha256, secret_bytes, signed_content)
      |> Base.encode64()

    expected_full = "v1,#{expected_sig}"

    signatures = String.split(signature_header, " ")

    verified =
      Enum.any?(signatures, fn sig ->
        trimmed = String.trim(sig)
        String.starts_with?(trimmed, "v1,") and Plug.Crypto.secure_compare(trimmed, expected_full)
      end)

    if verified do
      case Jason.decode(payload) do
        {:ok, parsed} -> {:ok, parsed}
        {:error, _} -> {:ok, payload}
      end
    else
      {:error, "Invalid webhook signature"}
    end
  end

  defp decode_secret(secret) do
    stripped =
      if String.starts_with?(secret, "whsec_"),
        do: String.slice(secret, 6..-1//1),
        else: secret

    # Add padding in case secret is unpadded base64
    case Base.decode64(stripped <> "==") do
      {:ok, decoded} -> decoded
      :error -> secret
    end
  end
end
