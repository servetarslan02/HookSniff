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

  # Test 1: Valid signature verification
  test "valid signature returns parsed JSON" do
    headers = valid_headers()
    assert {:ok, payload} = Webhook.verify(@test_body, headers, @test_secret)
    assert payload["event"] == "order.created"
    assert payload["data"]["order_id"] == "12345"
  end

  # Test 2: Invalid signature
  test "invalid signature returns error" do
    headers = Map.put(valid_headers(), "webhook-signature", "v1,invalid_signature_here")
    assert {:error, %Webhook.VerificationError{}} = Webhook.verify(@test_body, headers, @test_secret)
  end

  # Test 3: Missing webhook-id header
  test "missing webhook-id returns error" do
    headers = Map.delete(valid_headers(), "webhook-id")
    assert {:error, %Webhook.VerificationError{}} = Webhook.verify(@test_body, headers, @test_secret)
  end

  # Test 4: Missing webhook-timestamp header
  test "missing webhook-timestamp returns error" do
    headers = Map.delete(valid_headers(), "webhook-timestamp")
    assert {:error, %Webhook.VerificationError{}} = Webhook.verify(@test_body, headers, @test_secret)
  end

  # Test 5: Missing webhook-signature header
  test "missing webhook-signature returns error" do
    headers = Map.delete(valid_headers(), "webhook-signature")
    assert {:error, %Webhook.VerificationError{}} = Webhook.verify(@test_body, headers, @test_secret)
  end

  # Test 6: Expired timestamp (replay protection)
  test "expired timestamp returns error" do
    old_ts = System.system_time(:second) - 600
    headers = valid_headers(@test_msg_id, old_ts)
    assert {:error, %Webhook.VerificationError{}} = Webhook.verify(@test_body, headers, @test_secret)
  end

  # Test 7: Svix-branded headers
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

  # Test 8: Multiple comma-separated signatures
  test "verifies with multiple comma-separated signatures" do
    sig = sign_payload(@test_secret, @test_msg_id, @test_timestamp, @test_body)
    multi_sig = "v1,wrong_sig," <> elem(String.split(sig, ",", parts: 2), 1)
    headers = Map.put(valid_headers(), "webhook-signature", multi_sig)
    assert {:ok, _} = Webhook.verify(@test_body, headers, @test_secret)
  end

  # Test 9: sign() produces verifiable signature
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

  # Test 10: Secret prefix handling
  test "works with and without whsec_ prefix" do
    raw_secret = Base.encode64("test-secret-key-for-hmac")
    headers = valid_headers()

    assert {:ok, _} = Webhook.verify(@test_body, headers, @test_secret)
    assert {:ok, _} = Webhook.verify(@test_body, headers, raw_secret)
  end

  # Test 11: Invalid timestamp format
  test "invalid timestamp returns error" do
    headers = Map.put(valid_headers(), "webhook-timestamp", "not_a_number")
    assert {:error, %Webhook.VerificationError{}} = Webhook.verify(@test_body, headers, @test_secret)
  end

  # Test 12: Returns raw string when payload is not JSON
  test "returns raw string for non-JSON payload" do
    raw_body = "not json"
    ts = System.system_time(:second)
    sig = sign_payload(@test_secret, @test_msg_id, ts, raw_body)

    headers = %{
      "webhook-id" => @test_msg_id,
      "webhook-timestamp" => to_string(ts),
      "webhook-signature" => sig
    }

    assert {:ok, "not json"} = Webhook.verify(raw_body, headers, @test_secret)
  end
end
