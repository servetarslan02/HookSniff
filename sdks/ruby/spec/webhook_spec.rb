# frozen_string_literal: true

require 'spec_helper'
require 'hooksniff/webhook'
require 'openssl'
require 'base64'
require 'json'
require 'time'

RSpec.describe HookSniff::Webhook do
  let(:raw_secret) { 'testsecretkey1234567890abcdef' }
  let(:secret) { "whsec_#{Base64.strict_encode64(raw_secret)}" }
  let(:webhook) { described_class.new(secret) }
  let(:msg_id) { 'msg_test123' }
  let(:payload) { '{"event":"test","data":{"id":1}}' }

  def compute_signature(secret_key, msg_id, timestamp, payload_body)
    content = "#{msg_id}.#{timestamp}.#{payload_body}"
    hmac = OpenSSL::HMAC.digest('SHA256', secret_key, content)
    "v1,#{Base64.strict_encode64(hmac)}"
  end

  describe '#verify' do
    context 'with valid signature' do
      it 'returns the parsed payload on success' do
        timestamp = Time.now.to_i.to_s
        sig = compute_signature(raw_secret, msg_id, timestamp, payload)

        headers = {
          'svix-id' => msg_id,
          'svix-timestamp' => timestamp,
          'svix-signature' => sig
        }

        result = webhook.verify(payload, headers)
        expect(result).to eq(JSON.parse(payload))
      end

      it 'works with webhook- prefixed headers' do
        timestamp = Time.now.to_i.to_s
        sig = compute_signature(raw_secret, msg_id, timestamp, payload)

        headers = {
          'webhook-id' => msg_id,
          'webhook-timestamp' => timestamp,
          'webhook-signature' => sig
        }

        result = webhook.verify(payload, headers)
        expect(result).to eq(JSON.parse(payload))
      end

      it 'is case-insensitive on header keys' do
        timestamp = Time.now.to_i.to_s
        sig = compute_signature(raw_secret, msg_id, timestamp, payload)

        headers = {
          'Svix-Id' => msg_id,
          'Svix-Timestamp' => timestamp,
          'Svix-Signature' => sig
        }

        result = webhook.verify(payload, headers)
        expect(result).to eq(JSON.parse(payload))
      end

      it 'accepts signature with multiple comma-separated values' do
        timestamp = Time.now.to_i.to_s
        sig = compute_signature(raw_secret, msg_id, timestamp, payload)
        multi_sig = "v1_wrong,#{sig}"

        headers = {
          'svix-id' => msg_id,
          'svix-timestamp' => timestamp,
          'svix-signature' => multi_sig
        }

        # The second sig in the comma list should match
        result = webhook.verify(payload, headers)
        expect(result).to eq(JSON.parse(payload))
      end
    end

    context 'with invalid signature' do
      it 'raises WebhookVerificationError' do
        timestamp = Time.now.to_i.to_s

        headers = {
          'svix-id' => msg_id,
          'svix-timestamp' => timestamp,
          'svix-signature' => 'v1,dGhpcyBpcyB3cm9uZw==' # wrong sig
        }

        expect { webhook.verify(payload, headers) }
          .to raise_error(HookSniff::WebhookVerificationError, /Invalid webhook signature/)
      end

      it 'rejects signature signed with a different secret' do
        timestamp = Time.now.to_i.to_s
        wrong_secret = 'completelydifferentsecretkey1234'
        sig = compute_signature(wrong_secret, msg_id, timestamp, payload)

        headers = {
          'svix-id' => msg_id,
          'svix-timestamp' => timestamp,
          'svix-signature' => sig
        }

        expect { webhook.verify(payload, headers) }
          .to raise_error(HookSniff::WebhookVerificationError, /Invalid webhook signature/)
      end
    end

    context 'with expired timestamp' do
      it 'rejects timestamps older than tolerance' do
        old_timestamp = (Time.now.to_i - 600).to_s # 10 minutes ago
        sig = compute_signature(raw_secret, msg_id, old_timestamp, payload)

        headers = {
          'svix-id' => msg_id,
          'svix-timestamp' => old_timestamp,
          'svix-signature' => sig
        }

        expect { webhook.verify(payload, headers) }
          .to raise_error(HookSniff::WebhookVerificationError, /timestamp is too old/)
      end

      it 'rejects timestamps in the future beyond tolerance' do
        future_timestamp = (Time.now.to_i + 600).to_s # 10 minutes from now
        sig = compute_signature(raw_secret, msg_id, future_timestamp, payload)

        headers = {
          'svix-id' => msg_id,
          'svix-timestamp' => future_timestamp,
          'svix-signature' => sig
        }

        expect { webhook.verify(payload, headers) }
          .to raise_error(HookSniff::WebhookVerificationError, /timestamp is too old/)
      end

      it 'accepts timestamps within tolerance' do
        recent_timestamp = (Time.now.to_i - 100).to_s # 100 seconds ago, within 300s
        sig = compute_signature(raw_secret, msg_id, recent_timestamp, payload)

        headers = {
          'svix-id' => msg_id,
          'svix-timestamp' => recent_timestamp,
          'svix-signature' => sig
        }

        result = webhook.verify(payload, headers)
        expect(result).to eq(JSON.parse(payload))
      end
    end

    context 'with missing headers' do
      it 'raises error when svix-id is missing' do
        timestamp = Time.now.to_i.to_s
        headers = {
          'svix-timestamp' => timestamp,
          'svix-signature' => 'v1,fakesig'
        }

        expect { webhook.verify(payload, headers) }
          .to raise_error(HookSniff::WebhookVerificationError, /Missing webhook-id/)
      end

      it 'raises error when svix-timestamp is missing' do
        headers = {
          'svix-id' => msg_id,
          'svix-signature' => 'v1,fakesig'
        }

        expect { webhook.verify(payload, headers) }
          .to raise_error(HookSniff::WebhookVerificationError, /Missing webhook-timestamp/)
      end

      it 'raises error when svix-signature is missing' do
        timestamp = Time.now.to_i.to_s
        headers = {
          'svix-id' => msg_id,
          'svix-timestamp' => timestamp
        }

        expect { webhook.verify(payload, headers) }
          .to raise_error(HookSniff::WebhookVerificationError, /Missing webhook-signature/)
      end

      it 'raises error when all headers are missing' do
        expect { webhook.verify(payload, {}) }
          .to raise_error(HookSniff::WebhookVerificationError, /Missing webhook-id/)
      end
    end
  end

  describe '#sign' do
    it 'generates a valid signature that can be verified' do
      timestamp = Time.now.to_i
      sig = webhook.sign(msg_id, timestamp, payload)

      headers = {
        'svix-id' => msg_id,
        'svix-timestamp' => timestamp.to_s,
        'svix-signature' => sig
      }

      result = webhook.verify(payload, headers)
      expect(result).to eq(JSON.parse(payload))
    end
  end

  describe '#initialize' do
    it 'accepts raw base64 secret (without whsec_ prefix)' do
      raw = Base64.strict_encode64(raw_secret)
      wh = described_class.new(raw)
      timestamp = Time.now.to_i.to_s
      sig = compute_signature(raw_secret, msg_id, timestamp, payload)

      headers = {
        'svix-id' => msg_id,
        'svix-timestamp' => timestamp,
        'svix-signature' => sig
      }

      result = wh.verify(payload, headers)
      expect(result).to eq(JSON.parse(payload))
    end
  end
end
