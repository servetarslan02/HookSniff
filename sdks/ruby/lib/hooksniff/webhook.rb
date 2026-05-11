# frozen_string_literal: true

require 'openssl'
require 'base64'
require 'json'

module HookSniff
  class WebhookVerificationError < StandardError; end

  class Webhook
    TIMESTAMP_TOLERANCE = 300 # 5 minutes

    def initialize(secret)
      @secret = decode_secret(secret)
    end

    def verify(payload, headers)
      normalized = headers.transform_keys(&:downcase)

      msg_id = normalized['svix-id'] || normalized['webhook-id']
      timestamp = normalized['svix-timestamp'] || normalized['webhook-timestamp']
      signature = normalized['svix-signature'] || normalized['webhook-signature']

      raise WebhookVerificationError, 'Missing webhook-id header' unless msg_id
      raise WebhookVerificationError, 'Missing webhook-timestamp header' unless timestamp
      raise WebhookVerificationError, 'Missing webhook-signature header' unless signature

      ts = timestamp.to_i
      now = Time.now.to_i
      if (now - ts).abs > TIMESTAMP_TOLERANCE
        raise WebhookVerificationError, 'Webhook timestamp is too old or too new'
      end

      content = "#{msg_id}.#{timestamp}.#{payload}"
      expected_hmac = OpenSSL::HMAC.digest('SHA256', @secret, content)
      expected_sig = "v1,#{Base64.strict_encode64(expected_hmac)}"

      signatures = signature.split(',').map(&:strip)
      signatures.each do |sig|
        parts = sig.split(',', 2)
        sig_value = parts.length > 1 ? parts[1] : parts[0]

        expected_parts = expected_sig.split(',', 2)
        expected_value = expected_parts.length > 1 ? expected_parts[1] : expected_parts[0]

        if secure_compare(expected_value, sig_value)
          return payload.is_a?(String) ? (JSON.parse(payload) rescue payload) : payload
        end
      end

      raise WebhookVerificationError, 'Invalid webhook signature'
    end

    def sign(msg_id, timestamp, payload)
      ts = timestamp.to_i.to_s
      content = "#{msg_id}.#{ts}.#{payload}"
      hmac = OpenSSL::HMAC.digest('SHA256', @secret, content)
      "v1,#{Base64.strict_encode64(hmac)}"
    end

    private

    def decode_secret(secret)
      raw = secret.start_with?('whsec_') ? secret[6..] : secret
      Base64.decode64(raw) rescue raw
    end

    def secure_compare(a, b)
      return false if a.length != b.length

      result = 0
      a.bytes.zip(b.bytes) { |x, y| result |= x ^ y }
      result.zero?
    end
  end
end
