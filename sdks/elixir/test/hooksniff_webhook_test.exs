defmodule HookSniffWebhookTest do
  use ExUnit.Case

  @secret "whsec_dGVzdA=="
  @msg_id "msg_test123"
  @payload "{\"event\":\"test\"}"

  defp sign(secret, msg_id, timestamp, payload) do
    decoded = secret |> String.replace_prefix("whsec_", "") |> Base.decode64!()
    to_sign = "#{msg_id}.#{timestamp}.#{payload}"
    sig = :crypto.mac(:hmac, :sha256, decoded, to_sign) |> Base.encode64()
    "v1,#{sig}"
  end

  test "verify valid signature" do
    timestamp = System.system_time(:second)
    sig = sign(@secret, @msg_id, timestamp, @payload)
    headers = %{
      "webhook-id" => @msg_id,
      "webhook-timestamp" => "#{timestamp}",
      "webhook-signature" => sig
    }
    wh = HookSniffAPI.Webhook.new(@secret)
    assert {:ok, _result} = HookSniffAPI.Webhook.verify(wh, @payload, headers)
  end

  test "reject invalid signature" do
    headers = %{
      "webhook-id" => @msg_id,
      "webhook-timestamp" => "#{System.system_time(:second)}",
      "webhook-signature" => "v1,invalid"
    }
    wh = HookSniffAPI.Webhook.new(@secret)
    assert {:error, _} = HookSniffAPI.Webhook.verify(wh, @payload, headers)
  end

  test "svix branded headers" do
    timestamp = System.system_time(:second)
    sig = sign(@secret, @msg_id, timestamp, @payload)
    headers = %{
      "svix-id" => @msg_id,
      "svix-timestamp" => "#{timestamp}",
      "svix-signature" => sig
    }
    wh = HookSniffAPI.Webhook.new(@secret)
    assert {:ok, _result} = HookSniffAPI.Webhook.verify(wh, @payload, headers)
  end
end
