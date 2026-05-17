# frozen_string_literal: true

require "test_helper"
require "hooksniff"

class WebhookTest < Minitest::Test
  SECRET = "whsec_dGVzdA=="
  MSG_ID = "msg_test123"
  TIMESTAMP = Time.now.to_i
  PAYLOAD = '{"event":"test"}'

  def sign(secret, msg_id, timestamp, payload)
    decoded = Base64.decode64(secret.sub("whsec_", ""))
    to_sign = "#{msg_id}.#{timestamp}.#{payload}"
    sig = Base64.strict_encode64(
      OpenSSL::HMAC.digest("SHA256", decoded, to_sign)
    )
    "v1,#{sig}"
  end

  def test_verify_valid_signature
    wh = HookSniff::Webhook.new(SECRET)
    sig = sign(SECRET, MSG_ID, TIMESTAMP, PAYLOAD)
    headers = {
      "webhook-id" => MSG_ID,
      "webhook-timestamp" => TIMESTAMP.to_s,
      "webhook-signature" => sig,
    }
    result = wh.verify(PAYLOAD, headers)
    assert_equal({"event" => "test"}, result)
  end

  def test_reject_invalid_signature
    wh = HookSniff::Webhook.new(SECRET)
    headers = {
      "webhook-id" => MSG_ID,
      "webhook-timestamp" => TIMESTAMP.to_s,
      "webhook-signature" => "v1,invalid",
    }
    assert_raises(HookSniff::WebhookVerificationError) do
      wh.verify(PAYLOAD, headers)
    end
  end

  def test_reject_old_timestamp
    wh = HookSniff::Webhook.new(SECRET)
    old_ts = Time.now.to_i - 600
    sig = sign(SECRET, MSG_ID, old_ts, PAYLOAD)
    headers = {
      "webhook-id" => MSG_ID,
      "webhook-timestamp" => old_ts.to_s,
      "webhook-signature" => sig,
    }
    assert_raises(HookSniff::WebhookVerificationError) do
      wh.verify(PAYLOAD, headers)
    end
  end

  def test_svix_branded_headers
    wh = HookSniff::Webhook.new(SECRET)
    sig = sign(SECRET, MSG_ID, TIMESTAMP, PAYLOAD)
    headers = {
      "svix-id" => MSG_ID,
      "svix-timestamp" => TIMESTAMP.to_s,
      "svix-signature" => sig,
    }
    result = wh.verify(PAYLOAD, headers)
    assert_equal({"event" => "test"}, result)
  end
end

class ErrorTest < Minitest::Test
  def test_create_error_from_status
    err = HookSniff.create_error_from_status(400)
    assert_instance_of HookSniff::BadRequestError, err
    assert_equal 400, err.code

    err = HookSniff.create_error_from_status(429)
    assert_instance_of HookSniff::RateLimitError, err
    assert_equal 429, err.code

    err = HookSniff.create_error_from_status(500)
    assert_instance_of HookSniff::InternalServerError, err
    assert_equal 500, err.code
  end
end
