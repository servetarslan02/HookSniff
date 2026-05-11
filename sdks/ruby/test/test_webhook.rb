# frozen_string_literal: true

require 'minitest/autorun'
require_relative '../lib/hooksniff'

class WebhookTest < Minitest::Test
  def setup
    @secret = 'whsec_' + Base64.strict_encode64('test-secret-key-for-hmac')
    @body = '{"event":"order.created","data":{"order_id":"12345"}}'
    @msg_id = 'msg_test123'
    @timestamp = Time.now.to_i
  end

  def test_valid_signature
    wh = HookSniff::Webhook.new(@secret)
    headers = sign_payload(@secret, @msg_id, @timestamp, @body)
    result = wh.verify(@body, headers)
    assert_equal 'order.created', result['event']
  end

  def test_invalid_signature
    wh = HookSniff::Webhook.new(@secret)
    headers = sign_payload(@secret, @msg_id, @timestamp, @body)
    headers['webhook-signature'] = 'v1,invalid_signature'
    assert_raises(HookSniff::WebhookVerificationError) { wh.verify(@body, headers) }
  end

  def test_missing_headers
    wh = HookSniff::Webhook.new(@secret)
    assert_raises(HookSniff::WebhookVerificationError) { wh.verify(@body, {}) }
    assert_raises(HookSniff::WebhookVerificationError) { wh.verify(@body, { 'webhook-id' => 'msg_1' }) }
  end

  def test_expired_timestamp
    wh = HookSniff::Webhook.new(@secret)
    old_ts = Time.now.to_i - 600
    headers = sign_payload(@secret, @msg_id, old_ts, @body)
    assert_raises(HookSniff::WebhookVerificationError) { wh.verify(@body, headers) }
  end

  def test_svix_headers
    wh = HookSniff::Webhook.new(@secret)
    std_headers = sign_payload(@secret, @msg_id, @timestamp, @body)
    svix_headers = {
      'svix-id' => std_headers['webhook-id'],
      'svix-timestamp' => std_headers['webhook-timestamp'],
      'svix-signature' => std_headers['webhook-signature']
    }
    result = wh.verify(@body, svix_headers)
    assert_equal 'order.created', result['event']
  end

  def test_multiple_signatures
    wh = HookSniff::Webhook.new(@secret)
    headers = sign_payload(@secret, @msg_id, @timestamp, @body)
    sig = headers['webhook-signature']
    headers['webhook-signature'] = "v1,wrong_sig,#{sig[3..]}"
    result = wh.verify(@body, headers)
    assert_equal 'order.created', result['event']
  end

  def test_sign_and_verify
    wh = HookSniff::Webhook.new(@secret)
    ts = Time.now
    sig = wh.sign(@msg_id, ts, @body)
    assert sig.start_with?('v1,')

    headers = {
      'webhook-id' => @msg_id,
      'webhook-timestamp' => ts.to_i.to_s,
      'webhook-signature' => sig
    }
    result = wh.verify(@body, headers)
    assert_equal 'order.created', result['event']
  end

  def test_whsec_prefix_handling
    wh1 = HookSniff::Webhook.new(@secret)
    raw_secret = @secret.sub('whsec_', '')
    wh2 = HookSniff::Webhook.new(raw_secret)
    headers = sign_payload(@secret, @msg_id, @timestamp, @body)

    result1 = wh1.verify(@body, headers)
    result2 = wh2.verify(@body, headers)
    assert_equal result1['event'], result2['event']
  end

  private

  def sign_payload(secret, msg_id, timestamp, body)
    raw = secret.start_with?('whsec_') ? secret[6..] : secret
    secret_bytes = Base64.decode64(raw)
    content = "#{msg_id}.#{timestamp}.#{body}"
    hmac = OpenSSL::HMAC.digest('SHA256', secret_bytes, content)
    sig = "v1,#{Base64.strict_encode64(hmac)}"
    {
      'webhook-id' => msg_id,
      'webhook-timestamp' => timestamp.to_s,
      'webhook-signature' => sig
    }
  end
end
