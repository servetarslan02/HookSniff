# `HookSniff.WebhookVerification`
[🔗](https://github.com/servetarslan02/hooksniff/blob/v0.2.0/lib/hooksniff/webhook_verification.ex#L1)

Webhook signature verification for HookSniff.

Supports both simple HMAC-SHA256 verification and Standard Webhooks
(Svix-compatible) verification with timestamp tolerance.

Also supports Svix headers (svix-id, svix-signature, svix-timestamp) as fallback.

## Example

    # Verify from request headers
    result = HookSniff.WebhookVerification.verify_webhook_from_headers(
      payload: body,
      headers: conn.req_headers |> Map.new(),
      secret: "whsec_..."
    )

    case result do
      {:ok, payload} -> # Valid webhook
      {:error, reason} -> # Invalid
    end

# `verify_signature`

```elixir
@spec verify_signature(String.t(), String.t(), String.t()) :: boolean()
```

Verify a webhook signature using HMAC-SHA256 (legacy format).

# `verify_webhook`

```elixir
@spec verify_webhook(keyword()) :: {:ok, map() | String.t()} | {:error, String.t()}
```

Verify a webhook using Standard Webhooks headers (Svix-compatible).

Returns `{:ok, parsed_payload}` or `{:error, reason}`.

# `verify_webhook_from_headers`

```elixir
@spec verify_webhook_from_headers(keyword()) ::
  {:ok, map() | String.t()} | {:error, String.t()}
```

Verify a webhook from headers with automatic header detection.

Supports both Standard Webhooks headers (webhook-id, webhook-signature, webhook-timestamp)
and Svix headers (svix-id, svix-signature, svix-timestamp) as fallback.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
