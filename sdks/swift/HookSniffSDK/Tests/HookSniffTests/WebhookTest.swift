import XCTest
import CryptoKit
@testable import HookSniff

final class WebhookTest: XCTestCase {

    // MARK: - Helpers

    /// Generate a random base64-encoded secret (raw, without whsec_ prefix).
    private func randomSecret() -> String {
        var bytes = [UInt8](repeating: 0, count: 24)
        _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
        return Data(bytes).base64EncodedString()
    }

    /// Sign a payload the same way the server would (HMAC-SHA256, base64).
    private func signPayload(secret: String, msgId: String, timestamp: Int, payload: String) -> String {
        var raw = secret
        if raw.hasPrefix("whsec_") { raw = String(raw.dropFirst(6)) }
        guard let secretData = Data(base64Encoded: raw) else {
            fatalError("Test secret is not valid base64")
        }
        let content = "\(msgId).\(timestamp).\(payload)"
        let key = SymmetricKey(data: secretData)
        let mac = HMAC<SHA256>.authenticationCode(for: Data(content.utf8), using: key)
        return "v1,\(Data(mac).base64EncodedString())"
    }

    private func currentTimestamp() -> Int {
        Int(Date().timeIntervalSince1970)
    }

    private func validHeaders(msgId: String = "msg_123", timestamp: Int? = nil, signature: String = "") -> [String: String] {
        let ts = String(timestamp ?? currentTimestamp())
        return [
            "webhook-id": msgId,
            "webhook-timestamp": ts,
            "webhook-signature": signature,
        ]
    }

    // MARK: - 1. Valid signature verification

    func testValidSignatureVerification() throws {
        let secret = randomSecret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"test\"}"
        let msgId = "msg_valid_001"
        let ts = currentTimestamp()
        let sig = signPayload(secret: secret, msgId: msgId, timestamp: ts, payload: payload)

        let headers = validHeaders(msgId: msgId, timestamp: ts, signature: sig)
        let result = try wh.verify(payload: payload, headers: headers)

        XCTAssertEqual(result["event"] as? String, "test")
    }

    // MARK: - 2. Invalid signature fails

    func testInvalidSignatureFails() throws {
        let secret = randomSecret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"test\"}"
        let msgId = "msg_invalid_002"
        let ts = currentTimestamp()
        let badSig = "v1,aW52YWxpZHNpZ25hdHVyZQ=="   // base64("invalidsignature")

        let headers = validHeaders(msgId: msgId, timestamp: ts, signature: badSig)

        XCTAssertThrowsError(try wh.verify(payload: payload, headers: headers)) { error in
            let msg = (error as! Webhook.VerificationError).message
            XCTAssertTrue(msg.contains("Invalid webhook signature"), "Unexpected error: \(msg)")
        }
    }

    // MARK: - 3. Missing webhook-id header fails

    func testMissingWebhookIdFails() throws {
        let secret = randomSecret()
        let wh = try Webhook(secret: secret)

        let headers: [String: String] = [
            "webhook-timestamp": String(currentTimestamp()),
            "webhook-signature": "v1,fakesig",
        ]

        XCTAssertThrowsError(try wh.verify(payload: "{}", headers: headers)) { error in
            let msg = (error as! Webhook.VerificationError).message
            XCTAssertTrue(msg.contains("Missing webhook-id"), "Unexpected error: \(msg)")
        }
    }

    // MARK: - 4. Missing webhook-timestamp header fails

    func testMissingWebhookTimestampFails() throws {
        let secret = randomSecret()
        let wh = try Webhook(secret: secret)

        let headers: [String: String] = [
            "webhook-id": "msg_123",
            "webhook-signature": "v1,fakesig",
        ]

        XCTAssertThrowsError(try wh.verify(payload: "{}", headers: headers)) { error in
            let msg = (error as! Webhook.VerificationError).message
            XCTAssertTrue(msg.contains("Missing webhook-timestamp"), "Unexpected error: \(msg)")
        }
    }

    // MARK: - 5. Missing webhook-signature header fails

    func testMissingWebhookSignatureFails() throws {
        let secret = randomSecret()
        let wh = try Webhook(secret: secret)

        let headers: [String: String] = [
            "webhook-id": "msg_123",
            "webhook-timestamp": String(currentTimestamp()),
        ]

        XCTAssertThrowsError(try wh.verify(payload: "{}", headers: headers)) { error in
            let msg = (error as! Webhook.VerificationError).message
            XCTAssertTrue(msg.contains("Missing webhook-signature"), "Unexpected error: \(msg)")
        }
    }

    // MARK: - 6. Expired timestamp (>5 min) fails

    func testExpiredTimestampFails() throws {
        let secret = randomSecret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"expired\"}"
        let msgId = "msg_expired_006"
        let oldTimestamp = currentTimestamp() - 6 * 60  // 6 minutes ago
        let sig = signPayload(secret: secret, msgId: msgId, timestamp: oldTimestamp, payload: payload)

        let headers = validHeaders(msgId: msgId, timestamp: oldTimestamp, signature: sig)

        XCTAssertThrowsError(try wh.verify(payload: payload, headers: headers)) { error in
            let msg = (error as! Webhook.VerificationError).message
            XCTAssertTrue(msg.contains("too old or too new"), "Unexpected error: \(msg)")
        }
    }

    // MARK: - 7. Svix-branded headers work

    func testSvixBrandedHeadersWork() throws {
        let secret = randomSecret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"svix\"}"
        let msgId = "msg_svix_007"
        let ts = currentTimestamp()
        let sig = signPayload(secret: secret, msgId: msgId, timestamp: ts, payload: payload)

        let headers: [String: String] = [
            "svix-id": msgId,
            "svix-timestamp": String(ts),
            "svix-signature": sig,
        ]

        let result = try wh.verify(payload: payload, headers: headers)
        XCTAssertEqual(result["event"] as? String, "svix")
    }

    // MARK: - 8. Multiple comma-separated signatures work

    func testMultipleSignaturesWork() throws {
        let secret = randomSecret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"multi\"}"
        let msgId = "msg_multi_008"
        let ts = currentTimestamp()
        let realSig = signPayload(secret: secret, msgId: msgId, timestamp: ts, payload: payload)

        // Prepend a bogus signature — the real one should still match
        let combinedSig = "v1,aW52YWxpZA==,\(realSig)"

        let headers = validHeaders(msgId: msgId, timestamp: ts, signature: combinedSig)
        let result = try wh.verify(payload: payload, headers: headers)
        XCTAssertEqual(result["event"] as? String, "multi")
    }

    // MARK: - 9. sign() produces verifiable signature

    func testSignProducesVerifiableSignature() throws {
        let secret = randomSecret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"sign\"}"
        let msgId = "msg_sign_009"
        let ts = currentTimestamp()

        let sig = wh.sign(msgId: msgId, timestamp: ts, payload: payload)

        // The signature from sign() should be accepted by verify()
        let headers = validHeaders(msgId: msgId, timestamp: ts, signature: sig)
        let result = try wh.verify(payload: payload, headers: headers)
        XCTAssertEqual(result["event"] as? String, "sign")
    }

    // MARK: - 10. Secret with and without whsec_ prefix works

    func testSecretWithWhsecPrefix() throws {
        let rawSecret = randomSecret()
        let prefixed = "whsec_\(rawSecret)"

        let whPrefixed = try Webhook(secret: prefixed)
        let whRaw = try Webhook(secret: rawSecret)

        let payload = "{\"event\":\"prefix\"}"
        let msgId = "msg_prefix_010"
        let ts = currentTimestamp()

        // Sign with raw-secret verifier
        let sig = whRaw.sign(msgId: msgId, timestamp: ts, payload: payload)

        // Both verifiers should accept the same signature
        let headers = validHeaders(msgId: msgId, timestamp: ts, signature: sig)
        let result1 = try whPrefixed.verify(payload: payload, headers: headers)
        let result2 = try whRaw.verify(payload: payload, headers: headers)

        XCTAssertEqual(result1["event"] as? String, "prefix")
        XCTAssertEqual(result2["event"] as? String, "prefix")
    }

    // MARK: - 11. Header keys are case-insensitive

    func testHeaderKeysAreCaseInsensitive() throws {
        let secret = randomSecret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"case\"}"
        let msgId = "msg_case_011"
        let ts = currentTimestamp()
        let sig = signPayload(secret: secret, msgId: msgId, timestamp: ts, payload: payload)

        let headers: [String: String] = [
            "Webhook-Id": msgId,
            "Webhook-Timestamp": String(ts),
            "Webhook-Signature": sig,
        ]

        let result = try wh.verify(payload: payload, headers: headers)
        XCTAssertEqual(result["event"] as? String, "case")
    }

    // MARK: - 12. Non-JSON payload returns _raw key

    func testNonJSONPayloadReturnsRaw() throws {
        let secret = randomSecret()
        let wh = try Webhook(secret: secret)

        let payload = "not json at all"
        let msgId = "msg_raw_012"
        let ts = currentTimestamp()
        let sig = signPayload(secret: secret, msgId: msgId, timestamp: ts, payload: payload)

        let headers = validHeaders(msgId: msgId, timestamp: ts, signature: sig)
        let result = try wh.verify(payload: payload, headers: headers)

        XCTAssertEqual(result["_raw"] as? String, payload)
    }
}
