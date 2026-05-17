# frozen_string_literal: true

require "hooksniff"

DEFAULT_MSG_ID = "msg_test123"
DEFAULT_PAYLOAD = "{\"test\": 2432232314}"
DEFAULT_SECRET = "dGVzdC1zaWduaW5nLWtleS1mb3ItdW5pdC10ZXN0cy1vbmx5"
TOLERANCE = 5 * 60

class TestPayload

  def initialize(id: DEFAULT_MSG_ID, timestamp: Time.now.to_i, payload: DEFAULT_PAYLOAD, secret: DEFAULT_SECRET)
    @id = id
    @timestamp = timestamp

    @payload = payload
    @secret = secret

    toSign = "#{@id}.#{@timestamp}.#{@payload}"
    @signature = Base64
      .encode64(OpenSSL::HMAC.digest(OpenSSL::Digest.new("sha256"), Base64.decode64(@secret), toSign))
      .strip

    @headers = {
      "hooksniff-id" => @id,
      "hooksniff-signature" => "v1,#{@signature}",
      "hooksniff-timestamp" => @timestamp
    }
  end

  attr_accessor :secret
  attr_accessor :id
  attr_accessor :timestamp
  attr_accessor :payload
  attr_accessor :signature
  attr_accessor :headers
end

describe HookSniff::Webhook do
  it "missing id raises error" do
    testPayload = TestPayload.new
    testPayload.headers.delete("hooksniff-id")

    wh = HookSniff::Webhook.new(testPayload.secret)

    expect { wh.verify(testPayload.payload, testPayload.headers) }.to(raise_error(HookSniff::WebhookVerificationError))
  end

  it "missing timestamp raises error" do
    testPayload = TestPayload.new
    testPayload.headers.delete("hooksniff-timestamp")

    wh = HookSniff::Webhook.new(testPayload.secret)

    expect { wh.verify(testPayload.payload, testPayload.headers) }.to(raise_error(HookSniff::WebhookVerificationError))
  end

  it "missing signature raises error" do
    testPayload = TestPayload.new
    testPayload.headers.delete("hooksniff-signature")

    wh = HookSniff::Webhook.new(testPayload.secret)

    expect { wh.verify(testPayload.payload, testPayload.headers) }.to(raise_error(HookSniff::WebhookVerificationError))
  end

  it "invalid signature raises error" do
    testPayload = TestPayload.new
    testPayload.headers["hooksniff-signature"] = "v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLawdd"

    wh = HookSniff::Webhook.new(testPayload.secret)

    expect { wh.verify(testPayload.payload, testPayload.headers) }.to(raise_error(HookSniff::WebhookVerificationError))
  end

  it "valid signature is valid and returns valid json" do
    testPayload = TestPayload.new
    wh = HookSniff::Webhook.new(testPayload.secret)

    json = wh.verify(testPayload.payload, testPayload.headers)
    expect(json[:test]).to(eq(2432232314))
  end

  it "valid unbranded signature is valid and returns valid json" do
    testPayload = TestPayload.new
    unbrandedHeaders = {
      "webhook-id" => testPayload.headers["hooksniff-id"],
      "webhook-signature" => testPayload.headers["hooksniff-signature"],
      "webhook-timestamp" => testPayload.headers["hooksniff-timestamp"]
    }
    testPayload.headers = unbrandedHeaders

    wh = HookSniff::Webhook.new(testPayload.secret)

    json = wh.verify(testPayload.payload, testPayload.headers)
    expect(json[:test]).to(eq(2432232314))
  end

  it "old timestamp raises error" do
    testPayload = TestPayload.new(timestamp: Time.now.to_i - TOLERANCE - 1)

    wh = HookSniff::Webhook.new(testPayload.secret)

    expect { wh.verify(testPayload.payload, testPayload.headers) }.to(raise_error(HookSniff::WebhookVerificationError))
  end

  it "new timestamp raises error" do
    testPayload = TestPayload.new(timestamp: Time.now.to_i + TOLERANCE + 1)

    wh = HookSniff::Webhook.new(testPayload.secret)

    expect { wh.verify(testPayload.payload, testPayload.headers) }.to(raise_error(HookSniff::WebhookVerificationError))
  end

  it "invalid timestamp raises error" do
    testPayload = TestPayload.new(timestamp: "teadwd")

    wh = HookSniff::Webhook.new(testPayload.secret)

    expect { wh.verify(testPayload.payload, testPayload.headers) }.to(raise_error(HookSniff::WebhookVerificationError))
  end

  it "multi sig payload is valid" do
    testPayload = TestPayload.new
    sigs = [
      "v1,Ceo5qEr07ixe2NLpvHk3FH9bwy/WavXrAFQ/9tdO6mc=",
      "v2,Ceo5qEr07ixe2NLpvHk3FH9bwy/WavXrAFQ/9tdO6mc=",
      # valid signature
      testPayload.headers["hooksniff-signature"],
      "v1,Ceo5qEr07ixe2NLpvHk3FH9bwy/WavXrAFQ/9tdO6mc="
    ]
    testPayload.headers["hooksniff-signature"] = sigs.join(" ")

    wh = HookSniff::Webhook.new(testPayload.secret)

    json = wh.verify(testPayload.payload, testPayload.headers)
    expect(json[:test]).to(eq(2432232314))
  end

  it "signature verification works with and without prefix" do
    testPayload = TestPayload.new

    wh = HookSniff::Webhook.new(testPayload.secret)
    json = wh.verify(testPayload.payload, testPayload.headers)
    expect(json[:test]).to(eq(2432232314))

    wh = HookSniff::Webhook.new("whsec_" + testPayload.secret)
    json = wh.verify(testPayload.payload, testPayload.headers)
    expect(json[:test]).to(eq(2432232314))
  end

  it "sign function works" do
    key = "whsec_dGVzdC1zaWduaW5nLWtleS1mb3ItdW5pdC10ZXN0cy1vbmx5"
    msg_id = "msg_test123"
    timestamp = 1614265330
    payload = "{\"test\": 2432232314}"
    expected = "v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE="

    wh = HookSniff::Webhook.new(key)
    signature = wh.sign(msg_id, timestamp, payload)
    expect(signature).to(eq(expected))
  end

  it "returns empty json when payload is empty" do
    testPayload = TestPayload.new(payload: '')

    wh = HookSniff::Webhook.new(testPayload.secret)

    json = wh.verify(testPayload.payload, testPayload.headers)
    expect(json).to(eq(nil))
  end
end
