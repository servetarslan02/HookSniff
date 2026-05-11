defmodule HookSniff.WebhookTest do
  use ExUnit.Case, async: true

  alias HookSniff.Webhook

  @test_secret "whsec_" <> Base.encode64("test-secret-key-for-hmac")
  @test_body ~s({"event":"order.created","data":{"order_id":"12345"}})
  @test_msg_id "msg_test123"
  @test_timestamp System.system_time(:second)

  defp sign_payload(secret, msg_id, timestamp, body) do
    raw_secret =
      secret
      |> String.replace_prefix("whsec_", "")
      |> Base.decode64!()

    content = "#{msg_id}.#{timestamp}.#{body}"
    sig = :crypto.mac(:hmac, :sha256, raw_secret, content)
    "v1,#{Base.encode64(sig)}"
  end

  defp valid_headers(msg_id \\ nil, timestamp \\ nil) do
    mid = msg_id || @test_msg_id
    ts = timestamp || @test_timestamp
    %{
      "webhook-id" => mid,
      "webhook-timestamp" => to_string(ts),
      "webhook-signature" => sign_payload(@test_secret, mid, ts, @test_body)
    }
  end

  # --- Svix-compatible test suite (14 test cases) ---

  # Test 1: Valid signature returns parsed JSON
  test "valid signature returns parsed JSON" do
    headers = valid_headers()
    assert {:ok, payload} = Webhook.verify(@test_body, headers, @test_secret)
    assert payload["event"] == "order.created"
    assert payload["data"]["order_id"] == "12345"
  end

  # Test 2: Invalid signature returns error
  test "invalid signature returns error" do
    headers = Map.put(valid_headers(), "webhook-signature", "v1,invalid_signature_here")
    assert {:error, %Webhook.VerificationError{}} = Webhook.verify(@test_body, headers, @test_secret)
  end

  # Test 3: Missing webhook-id header
  test "missing webhook-id returns error" do
    headers = Map.delete(valid_headers(), "webhook-id")
    assert {:error, %Webhook.VerificationError{message: msg}} = Webhook.verify(@test_body, headers, @test_secret)
    assert msg =~ "webhook-id"
  end

  # Test 4: Missing webhook-timestamp header
  test "missing webhook-timestamp returns error" do
    headers = Map.delete(valid_headers(), "webhook-timestamp")
    assert {:error, %Webhook.VerificationError{message: msg}} = Webhook.verify(@test_body, headers, @test_secret)
    assert msg =~ "webhook-timestamp"
  end

  # Test 5: Missing webhook-signature header
  test "missing webhook-signature returns error" do
    headers = Map.delete(valid_headers(), "webhook-signature")
    assert {:error, %Webhook.VerificationError{message: msg}} = Webhook.verify(@test_body, headers, @test_secret)
    assert msg =~ "webhook-signature"
  end

  # Test 6: Invalid timestamp (non-numeric)
  test "invalid (non-numeric) timestamp returns error" do
    headers = Map.put(valid_headers(), "webhook-timestamp", "not_a_number")
    assert {:error, %Webhook.VerificationError{message: msg}} = Webhook.verify(@test_body, headers, @test_secret)
    assert msg =~ "Invalid webhook-timestamp"
  end

  # Test 7: Expired timestamp (replay protection — >5min old)
  test "expired timestamp (>5min old) returns error" do
    old_ts = System.system_time(:second) - 600
    headers = valid_headers(@test_msg_id, old_ts)
    assert {:error, %Webhook.VerificationError{message: msg}} = Webhook.verify(@test_body, headers, @test_secret)
    assert msg =~ "too old or too new"
  end

  # Test 8: Future timestamp (>5min in the future)
  test "future timestamp (>5min future) returns error" do
    future_ts = System.system_time(:second) + 600
    headers = valid_headers(@test_msg_id, future_ts)
    assert {:error, %Webhook.VerificationError{message: msg}} = Webhook.verify(@test_body, headers, @test_secret)
    assert msg =~ "too old or too new"
  end

  # Test 9: Svix-branded headers work (svix-id, svix-timestamp, svix-signature)
  test "accepts svix-branded headers" do
    standard = valid_headers()
    svix_headers = %{
      "svix-id" => standard["webhook-id"],
      "svix-timestamp" => standard["webhook-timestamp"],
      "svix-signature" => standard["webhook-signature"]
    }
    assert {:ok, payload} = Webhook.verify(@test_body, svix_headers, @test_secret)
    assert payload["event"] == "order.created"
  end

  # Test 10: Multiple comma-separated signatures (multi-sig)
  test "verifies with multiple comma-separated signatures" do
    sig = sign_payload(@test_secret, @test_msg_id, @test_timestamp, @test_body)
    [_, sig_rest] = String.split(sig, ",", parts: 2)
    multi_sig = "v1,wrong_sig," <> sig_rest
    headers = Map.put(valid_headers(), "webhook-signature", multi_sig)
    assert {:ok, _} = Webhook.verify(@test_body, headers, @test_secret)
  end

  # Test 11: Multiple space-separated signatures with comma-separated values
  test "verifies with space-separated multi-sig entries" do
    sig = sign_payload(@test_secret, @test_msg_id, @test_timestamp, @test_body)
    # Create multi-format: "v1,wrong v1,correct"
    wrong_sig = "v1,d3Jvbmc=" <> String.duplicate("=", 0)
    multi = "#{wrong_sig} #{sig}"
    headers = Map.put(valid_headers(), "webhook-signature", multi)
    # Now supports space-separated multi-sig
    result = Webhook.verify(@test_body, headers, @test_secret)
    assert {:ok, _} = result
  end

  # Test 12: Works with and without whsec_ prefix
  test "works with and without whsec_ prefix" do
    raw_secret = Base.encode64("test-secret-key-for-hmac")
    headers = valid_headers()

    assert {:ok, _} = Webhook.verify(@test_body, headers, @test_secret)
    assert {:ok, _} = Webhook.verify(@test_body, headers, raw_secret)
  end

  # Test 13: sign() produces correct output
  test "sign() produces a verifiable signature" do
    sig = Webhook.sign(@test_msg_id, @test_timestamp, @test_body, @test_secret)
    assert String.starts_with?(sig, "v1,")

    headers = %{
      "webhook-id" => @test_msg_id,
      "webhook-timestamp" => to_string(@test_timestamp),
      "webhook-signature" => sig
    }
    assert {:ok, payload} = Webhook.verify(@test_body, headers, @test_secret)
    assert payload["event"] == "order.created"
  end

  # Test 14: sign() produces deterministic output
  test "sign() produces deterministic output for same inputs" do
    sig1 = Webhook.sign(@test_msg_id, @test_timestamp, @test_body, @test_secret)
    sig2 = Webhook.sign(@test_msg_id, @test_timestamp, @test_body, @test_secret)
    assert sig1 == sig2
  end

  # --- Additional edge case tests ---

  test "empty payload is handled" do
    body = ""
    ts = System.system_time(:second)
    sig = sign_payload(@test_secret, @test_msg_id, ts, body)

    headers = %{
      "webhook-id" => @test_msg_id,
      "webhook-timestamp" => to_string(ts),
      "webhook-signature" => sig
    }

    assert {:ok, ""} = Webhook.verify(body, headers, @test_secret)
  end

  test "returns raw string for non-JSON payload" do
    raw_body = "not json at all"
    ts = System.system_time(:second)
    sig = sign_payload(@test_secret, @test_msg_id, ts, raw_body)

    headers = %{
      "webhook-id" => @test_msg_id,
      "webhook-timestamp" => to_string(ts),
      "webhook-signature" => sig
    }

    assert {:ok, "not json at all"} = Webhook.verify(raw_body, headers, @test_secret)
  end

  test "empty headers map returns error" do
    assert {:error, %Webhook.VerificationError{}} = Webhook.verify(@test_body, %{}, @test_secret)
  end

  test "timestamp with leading zeros is valid" do
    ts = System.system_time(:second)
    ts_str = String.pad_leading(to_string(ts), 15, "0")
    sig = sign_payload(@test_secret, @test_msg_id, ts, @test_body)

    headers = %{
      "webhook-id" => @test_msg_id,
      "webhook-timestamp" => ts_str,
      "webhook-signature" => sig
    }

    # String.to_integer handles leading zeros correctly
    result = Webhook.verify(@test_body, headers, @test_secret)
    assert {:ok, _} = result
  end

  test "header keys are case-insensitive" do
    ts = System.system_time(:second)
    sig = sign_payload(@test_secret, @test_msg_id, ts, @test_body)

    headers = %{
      "Webhook-Id" => @test_msg_id,
      "Webhook-Timestamp" => to_string(ts),
      "Webhook-Signature" => sig
    }

    assert {:ok, _} = Webhook.verify(@test_body, headers, @test_secret)
  end

  test "sign with raw secret (no whsec_ prefix)" do
    raw_secret = Base.encode64("test-secret-key-for-hmac")
    sig = Webhook.sign(@test_msg_id, @test_timestamp, @test_body, raw_secret)
    assert String.starts_with?(sig, "v1,")

    # Verify it matches the whsec_ prefixed version
    sig_with_prefix = Webhook.sign(@test_msg_id, @test_timestamp, @test_body, @test_secret)
    assert sig == sig_with_prefix
  end

  test "verification error implements Exception behaviour" do
    error = %Webhook.VerificationError{message: "test error"}
    assert Exception.message(error) == "test error"
  end

  test "timestamp exactly at tolerance boundary is accepted" do
    # Exactly 5 minutes ago should be accepted
    ts = System.system_time(:second) - (5 * 60)
    sig = sign_payload(@test_secret, @test_msg_id, ts, @test_body)

    headers = %{
      "webhook-id" => @test_msg_id,
      "webhook-timestamp" => to_string(ts),
      "webhook-signature" => sig
    }

    # At exactly the boundary, abs(now - ts) == 300 which is NOT > 300
    assert {:ok, _} = Webhook.verify(@test_body, headers, @test_secret)
  end

  test "timestamp 1 second past tolerance is rejected" do
    ts = System.system_time(:second) - (5 * 60 + 1)
    sig = sign_payload(@test_secret, @test_msg_id, ts, @test_body)

    headers = %{
      "webhook-id" => @test_msg_id,
      "webhook-timestamp" => to_string(ts),
      "webhook-signature" => sig
    }

    assert {:error, %Webhook.VerificationError{}} = Webhook.verify(@test_body, headers, @test_secret)
  end

  test "signature with version prefix mismatch is rejected" do
    ts = System.system_time(:second)
    sig = sign_payload(@test_secret, @test_msg_id, ts, @test_body)
    # Replace v1 with v2
    bad_sig = "v2," <> elem(String.split_at(sig, 3), 1)

    headers = %{
      "webhook-id" => @test_msg_id,
      "webhook-timestamp" => to_string(ts),
      "webhook-signature" => bad_sig
    }

    assert {:error, %Webhook.VerificationError{}} = Webhook.verify(@test_body, headers, @test_secret)
  end

  test "nil payload raises or returns error" do
    # nil is not a binary, so the guard clause should fail
    assert_raise FunctionClauseError, fn ->
      Webhook.verify(nil, valid_headers(), @test_secret)
    end
  end
end
