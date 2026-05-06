# frozen_string_literal: true

module HookSniff
  # Verify a webhook signature using HMAC-SHA256.
  #
  # @param payload [String] The raw request body
  # @param signature [String] The signature from the X-Hookrelay-Signature header
  # @param secret [String] The endpoint's signing secret (starts with "whsec_")
  # @return [Boolean] true if the signature is valid
  def self.verify_signature(payload, signature, secret)
    return false if payload.nil? || payload.empty?
    return false if signature.nil? || signature.empty?
    return false if secret.nil? || secret.empty?

    expected_hex = signature.start_with?("sha256=") ? signature[7..] : signature

    computed = OpenSSL::HMAC.hexdigest("SHA256", secret, payload)

    # Constant-time comparison to prevent timing attacks
    secure_compare(computed, expected_hex)
  rescue
    false
  end

  # Verify a webhook signature from an incoming request (Standard Webhooks + Svix compatible).
  #
  # Supports both Standard Webheaders headers (webhook-id, webhook-signature, webhook-timestamp)
  # and Svix headers (svix-id, svix-signature, svix-timestamp) as fallback.
  #
  # @param payload [String] The raw request body
  # @param headers [Hash] The request headers (symbol or string keys)
  # @param secret [String] The endpoint's signing secret
  # @param tolerance_secs [Integer] Max age in seconds (default: 300)
  # @return [Hash] { valid: bool, payload: parsed_data, error: string }
  def self.verify_webhook_from_headers(payload:, headers:, secret:, tolerance_secs: 300)
    # Normalize header keys to lowercase strings
    normalized = headers.transform_keys { |k| k.to_s.downcase }

    msg_id = normalized["webhook-id"]
    timestamp = normalized["webhook-timestamp"]
    signature_header = normalized["webhook-signature"]

    # Fallback to Svix headers
    unless msg_id && timestamp && signature_header
      msg_id ||= normalized["svix-id"]
      timestamp ||= normalized["svix-timestamp"]
      signature_header ||= normalized["svix-signature"]
    end

    verify_webhook(
      payload: payload,
      msg_id: msg_id,
      timestamp: timestamp,
      signature_header: signature_header,
      secret: secret,
      tolerance_secs: tolerance_secs,
    )
  end

  # Verify a webhook signature from an incoming request (Standard Webhooks compatible).
  #
  # @param payload [String] The raw request body
  # @param msg_id [String] The webhook-id header
  # @param timestamp [String] The webhook-timestamp header
  # @param signature_header [String] The webhook-signature header
  # @param secret [String] The endpoint's signing secret
  # @param tolerance_secs [Integer] Max age in seconds (default: 300)
  # @return [Hash] { valid: bool, payload: parsed_data, error: string }
  def self.verify_webhook(payload:, msg_id:, timestamp:, signature_header:, secret:, tolerance_secs: 300)
    return { valid: false, error: "Missing webhook-id header" } if msg_id.nil? || msg_id.empty?
    return { valid: false, error: "Missing webhook-timestamp header" } if timestamp.nil? || timestamp.empty?
    return { valid: false, error: "Missing webhook-signature header" } if signature_header.nil? || signature_header.empty?
    return { valid: false, error: "Missing request body" } if payload.nil? || payload.empty?

    ts = timestamp.to_i
    return { valid: false, error: "Invalid webhook timestamp" } if ts == 0

    now = Time.now.to_i

    if now - ts > tolerance_secs
      return { valid: false, error: "Message timestamp too old" }
    end
    if ts > now + tolerance_secs
      return { valid: false, error: "Message timestamp too new" }
    end

    # Compute expected signature
    signed_content = "#{msg_id}.#{timestamp}.#{payload}"
    secret_bytes = decode_secret(secret)

    expected_sig = Base64.strict_encode64(
      OpenSSL::HMAC.digest("SHA256", secret_bytes, signed_content)
    )
    expected_full = "v1,#{expected_sig}"

    # Check each signature in the header (space-separated)
    signatures = signature_header.split(" ")
    verified = signatures.any? do |sig|
      sig_stripped = sig.strip
      next unless sig_stripped.start_with?("v1,")
      secure_compare(sig_stripped, expected_full)
    end

    unless verified
      return { valid: false, error: "Invalid webhook signature" }
    end

    # Parse the payload
    begin
      parsed = JSON.parse(payload)
      { valid: true, payload: parsed }
    rescue JSON::ParserError
      { valid: true, payload: payload }
    end
  end

  private_class_method def self.decode_secret(secret)
    stripped = secret.start_with?("whsec_") ? secret[6..] : secret
    # Add padding in case secret is unpadded base64
    Base64.strict_decode64(stripped + "==")
  rescue ArgumentError
    secret.bytes.pack("C*")
  end

  # Constant-time string comparison
  def self.secure_compare(a, b)
    return false if a.nil? || b.nil?
    return false if a.bytesize != b.bytesize

    result = 0
    a.bytes.zip(b.bytes) { |x, y| result |= x ^ y }
    result == 0
  end
end
