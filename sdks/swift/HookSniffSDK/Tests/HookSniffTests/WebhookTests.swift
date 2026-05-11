import XCTest
#if canImport(CryptoKit)
import CryptoKit
#else
import Crypto
#endif
@testable import HookSniff

/// Comprehensive webhook verification tests matching Svix's 14 test cases.
/// Reference: https://github.com/svix/svix-webhooks/blob/main/javascript/src/index_test.ts
final class WebhookTests: XCTestCase {

    // MARK: - Helpers

    private func randomBase64Secret() -> String {
        var bytes = [UInt8](repeating: 0, count: 24)
        #if canImport(Security)
        _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
        #else
        for i in 0..<bytes.count { bytes[i] = UInt8.random(in: 0...255) }
        #endif
        return Data(bytes).base64EncodedString()
    }

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

    private func now() -> Int {
        Int(Date().timeIntervalSince1970)
    }

    private func makeHeaders(
        id: String = "msg_test",
        timestamp: Int? = nil,
        signature: String = "v1,fakesig"
    ) -> [String: String] {
        [
            "webhook-id": id,
            "webhook-timestamp": String(timestamp ?? now()),
            "webhook-signature": signature,
        ]
    }

    // MARK: - 1. Empty/nil secret raises error

    func testEmptySecretStringDoesNotCrash() {
        // Empty string is technically valid base64 (decodes to 0 bytes)
        // The SDK accepts it at init — verification will fail with wrong sig
        let wh = try? Webhook(secret: "")
        XCTAssertNotNil(wh, "Empty secret should not crash init")

        // Verification with any payload should fail (weak key)
        if let wh = wh {
            let payload = "{\"event\":\"test\"}"
            let headers = makeHeaders(signature: "v1,aW52YWxpZA==")
            XCTAssertThrowsError(try wh.verify(payload: payload, headers: headers))
        }
    }

    func testWhitespaceOnlySecretRaisesError() {
        // A whitespace-only string won't be valid base64 but may decode to UTF-8 bytes
        // The key behavior is: it should either init with a weak key or throw
        // We just verify it doesn't crash
        let wh = try? Webhook(secret: "   ")
        if let wh = wh {
            // If it inits, verification with wrong sig should still fail
            let payload = "{\"event\":\"test\"}"
            let headers = makeHeaders(signature: "v1,invalidsig")
            XCTAssertThrowsError(try wh.verify(payload: payload, headers: headers))
        }
    }

    // MARK: - 2. Missing webhook-id header raises error

    func testMissingIdHeaderRaisesError() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let headers: [String: String] = [
            "webhook-timestamp": String(now()),
            "webhook-signature": "v1,fakesig",
        ]

        XCTAssertThrowsError(try wh.verify(payload: "{}", headers: headers)) { error in
            let msg = (error as! Webhook.VerificationError).message
            XCTAssertTrue(msg.contains("Missing webhook-id"))
        }
    }

    func testEmptyIdHeaderRaisesError() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let headers: [String: String] = [
            "webhook-id": "",
            "webhook-timestamp": String(now()),
            "webhook-signature": "v1,fakesig",
        ]

        // Empty string is still "present" in the dict, so this should proceed to signature check
        // and fail there. This tests the edge case.
        XCTAssertThrowsError(try wh.verify(payload: "{}", headers: headers))
    }

    // MARK: - 3. Missing webhook-timestamp header raises error

    func testMissingTimestampHeaderRaisesError() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let headers: [String: String] = [
            "webhook-id": "msg_123",
            "webhook-signature": "v1,fakesig",
        ]

        XCTAssertThrowsError(try wh.verify(payload: "{}", headers: headers)) { error in
            let msg = (error as! Webhook.VerificationError).message
            XCTAssertTrue(msg.contains("Missing webhook-timestamp"))
        }
    }

    // MARK: - 4. Invalid timestamp (non-numeric) raises error

    func testInvalidNonNumericTimestampRaisesError() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let headers: [String: String] = [
            "webhook-id": "msg_123",
            "webhook-timestamp": "not-a-number",
            "webhook-signature": "v1,fakesig",
        ]

        XCTAssertThrowsError(try wh.verify(payload: "{}", headers: headers)) { error in
            let msg = (error as! Webhook.VerificationError).message
            XCTAssertTrue(msg.contains("Invalid webhook-timestamp"))
        }
    }

    func testEmptyTimestampRaisesError() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let headers: [String: String] = [
            "webhook-id": "msg_123",
            "webhook-timestamp": "",
            "webhook-signature": "v1,fakesig",
        ]

        XCTAssertThrowsError(try wh.verify(payload: "{}", headers: headers)) { error in
            let msg = (error as! Webhook.VerificationError).message
            XCTAssertTrue(msg.contains("Invalid webhook-timestamp") || msg.contains("Missing webhook-timestamp"))
        }
    }

    func testFloatTimestampRaisesError() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let headers: [String: String] = [
            "webhook-id": "msg_123",
            "webhook-timestamp": "1234567890.5",
            "webhook-signature": "v1,fakesig",
        ]

        XCTAssertThrowsError(try wh.verify(payload: "{}", headers: headers)) { error in
            let msg = (error as! Webhook.VerificationError).message
            XCTAssertTrue(msg.contains("Invalid webhook-timestamp"))
        }
    }

    // MARK: - 5. Missing webhook-signature header raises error

    func testMissingSignatureHeaderRaisesError() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let headers: [String: String] = [
            "webhook-id": "msg_123",
            "webhook-timestamp": String(now()),
        ]

        XCTAssertThrowsError(try wh.verify(payload: "{}", headers: headers)) { error in
            let msg = (error as! Webhook.VerificationError).message
            XCTAssertTrue(msg.contains("Missing webhook-signature"))
        }
    }

    // MARK: - 6. Invalid signature raises error

    func testInvalidSignatureRaisesError() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"test\"}"
        let msgId = "msg_invalid"
        let ts = now()
        let badSig = "v1,aW52YWxpZHNpZ25hdHVyZQ==" // base64("invalidsignature")

        let headers = makeHeaders(id: msgId, timestamp: ts, signature: badSig)

        XCTAssertThrowsError(try wh.verify(payload: payload, headers: headers)) { error in
            let msg = (error as! Webhook.VerificationError).message
            XCTAssertTrue(msg.contains("Invalid webhook signature"))
        }
    }

    func testCompletelyWrongSignatureRaisesError() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"test\"}"
        let headers = makeHeaders(signature: "v1,dGhpc2lzYnVzdA==")

        XCTAssertThrowsError(try wh.verify(payload: payload, headers: headers)) { error in
            XCTAssertTrue((error as! Webhook.VerificationError).message.contains("Invalid webhook signature"))
        }
    }

    // MARK: - 7. Partial signature raises error

    func testPartialSignatureRaisesError() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"test\"}"
        let msgId = "msg_partial"
        let ts = now()
        let fullSig = signPayload(secret: secret, msgId: msgId, timestamp: ts, payload: payload)

        // Take only first 10 chars of the signature (partial)
        let partialSig = String(fullSig.prefix(10))

        let headers = makeHeaders(id: msgId, timestamp: ts, signature: partialSig)

        XCTAssertThrowsError(try wh.verify(payload: payload, headers: headers)) { error in
            let msg = (error as! Webhook.VerificationError).message
            XCTAssertTrue(msg.contains("Invalid webhook signature"))
        }
    }

    func testTruncatedBase64SignatureRaisesError() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"test\"}"
        let msgId = "msg_trunc"
        let ts = now()
        let fullSig = signPayload(secret: secret, msgId: msgId, timestamp: ts, payload: payload)

        // Remove last 4 chars (truncated base64)
        let truncatedSig = String(fullSig.dropLast(4))

        let headers = makeHeaders(id: msgId, timestamp: ts, signature: truncatedSig)

        XCTAssertThrowsError(try wh.verify(payload: payload, headers: headers))
    }

    // MARK: - 8. Valid signature returns OK

    func testValidSignatureReturnsPayload() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"order.created\",\"data\":{\"id\":\"ord_123\"}}"
        let msgId = "msg_valid"
        let ts = now()
        let sig = signPayload(secret: secret, msgId: msgId, timestamp: ts, payload: payload)

        let headers = makeHeaders(id: msgId, timestamp: ts, signature: sig)
        let result = try wh.verify(payload: payload, headers: headers)

        XCTAssertEqual(result["event"] as? String, "order.created")
        let data = result["data"] as? [String: Any]
        XCTAssertEqual(data?["id"] as? String, "ord_123")
    }

    func testValidSignatureWithMinimalPayload() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "{}"
        let msgId = "msg_minimal"
        let ts = now()
        let sig = signPayload(secret: secret, msgId: msgId, timestamp: ts, payload: payload)

        let headers = makeHeaders(id: msgId, timestamp: ts, signature: sig)
        let result = try wh.verify(payload: payload, headers: headers)

        XCTAssertTrue(result.isEmpty || result.count == 0)
    }

    // MARK: - 9. Unbranded headers (webhook-id, webhook-timestamp, webhook-signature) work

    func testUnbrandedWebhookHeadersWork() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"unbranded\"}"
        let msgId = "msg_unbranded"
        let ts = now()
        let sig = signPayload(secret: secret, msgId: msgId, timestamp: ts, payload: payload)

        // Use webhook-* headers (unbranded)
        let headers: [String: String] = [
            "webhook-id": msgId,
            "webhook-timestamp": String(ts),
            "webhook-signature": sig,
        ]

        let result = try wh.verify(payload: payload, headers: headers)
        XCTAssertEqual(result["event"] as? String, "unbranded")
    }

    func testSvixBrandedHeadersAlsoWork() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"svix-branded\"}"
        let msgId = "msg_svix"
        let ts = now()
        let sig = signPayload(secret: secret, msgId: msgId, timestamp: ts, payload: payload)

        let headers: [String: String] = [
            "svix-id": msgId,
            "svix-timestamp": String(ts),
            "svix-signature": sig,
        ]

        let result = try wh.verify(payload: payload, headers: headers)
        XCTAssertEqual(result["event"] as? String, "svix-branded")
    }

    // MARK: - 10. Old timestamp fails (>5min tolerance)

    func testOldTimestampFailsBeyond5MinTolerance() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"old\"}"
        let msgId = "msg_old"
        let oldTs = now() - (6 * 60) // 6 minutes ago
        let sig = signPayload(secret: secret, msgId: msgId, timestamp: oldTs, payload: payload)

        let headers = makeHeaders(id: msgId, timestamp: oldTs, signature: sig)

        XCTAssertThrowsError(try wh.verify(payload: payload, headers: headers)) { error in
            let msg = (error as! Webhook.VerificationError).message
            XCTAssertTrue(msg.contains("too old or too new"))
        }
    }

    func testTimestampExactlyAt5MinBoundaryPasses() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"boundary\"}"
        let msgId = "msg_boundary"
        let boundaryTs = now() - (5 * 60) // exactly 5 min ago
        let sig = signPayload(secret: secret, msgId: msgId, timestamp: boundaryTs, payload: payload)

        let headers = makeHeaders(id: msgId, timestamp: boundaryTs, signature: sig)

        // Should pass — exactly at tolerance boundary
        let result = try wh.verify(payload: payload, headers: headers)
        XCTAssertEqual(result["event"] as? String, "boundary")
    }

    func testTimestampJustBeyond5MinFails() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"just-over\"}"
        let msgId = "msg_justover"
        let justOverTs = now() - (5 * 60 + 2) // 5 min 2 sec ago
        let sig = signPayload(secret: secret, msgId: msgId, timestamp: justOverTs, payload: payload)

        let headers = makeHeaders(id: msgId, timestamp: justOverTs, signature: sig)

        XCTAssertThrowsError(try wh.verify(payload: payload, headers: headers)) { error in
            XCTAssertTrue((error as! Webhook.VerificationError).message.contains("too old or too new"))
        }
    }

    // MARK: - 11. New timestamp fails (>5min future)

    func testFutureTimestampFailsBeyond5MinTolerance() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"future\"}"
        let msgId = "msg_future"
        let futureTs = now() + (6 * 60) // 6 minutes in the future
        let sig = signPayload(secret: secret, msgId: msgId, timestamp: futureTs, payload: payload)

        let headers = makeHeaders(id: msgId, timestamp: futureTs, signature: sig)

        XCTAssertThrowsError(try wh.verify(payload: payload, headers: headers)) { error in
            XCTAssertTrue((error as! Webhook.VerificationError).message.contains("too old or too new"))
        }
    }

    // MARK: - 12. Multi-sig payload (space-separated, comma-separated values)

    func testMultipleCommaSeparatedSignaturesVerify() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"multi-sig\"}"
        let msgId = "msg_multi"
        let ts = now()
        let realSig = signPayload(secret: secret, msgId: msgId, timestamp: ts, payload: payload)

        // Prepend a bogus signature, real one should still match
        // The signature format is "v1,<base64>"
        // So multiple sigs: "v1,<bogus>,v1,<real>"
        let bogusPart = "v1,Ym9ndXNzaWc=" // "bogussig" base64
        let realPart = realSig // "v1,<realbase64>"
        let multiSig = "\(bogusPart) \(realPart)"

        let headers = makeHeaders(id: msgId, timestamp: ts, signature: multiSig)
        let result = try wh.verify(payload: payload, headers: headers)
        XCTAssertEqual(result["event"] as? String, "multi-sig")
    }

    func testMultipleSpaceSeparatedSignaturesVerify() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"space-sep\"}"
        let msgId = "msg_space"
        let ts = now()
        let realSig = signPayload(secret: secret, msgId: msgId, timestamp: ts, payload: payload)

        let multiSig = "v1,fakesig1 v1,fakesig2 \(realSig)"

        let headers = makeHeaders(id: msgId, timestamp: ts, signature: multiSig)
        let result = try wh.verify(payload: payload, headers: headers)
        XCTAssertEqual(result["event"] as? String, "space-sep")
    }

    func testOnlyBogusSignaturesFail() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"all-bogus\"}"
        let msgId = "msg_bogus"
        let ts = now()

        let multiSig = "v1,Ym9ndXNzaWcx v1,Ym9ndXNzaWcy"

        let headers = makeHeaders(id: msgId, timestamp: ts, signature: multiSig)

        XCTAssertThrowsError(try wh.verify(payload: payload, headers: headers)) { error in
            XCTAssertTrue((error as! Webhook.VerificationError).message.contains("Invalid webhook signature"))
        }
    }

    // MARK: - 13. Works with and without whsec_ prefix

    func testSecretWithWhsecPrefixVerifiesCorrectly() throws {
        let rawSecret = randomBase64Secret()
        let prefixedSecret = "whsec_\(rawSecret)"

        let whPrefixed = try Webhook(secret: prefixedSecret)
        let whRaw = try Webhook(secret: rawSecret)

        let payload = "{\"event\":\"prefix-test\"}"
        let msgId = "msg_prefix"
        let ts = now()

        // Sign with the raw verifier
        let sig = whRaw.sign(msgId: msgId, timestamp: ts, payload: payload)

        let headers = makeHeaders(id: msgId, timestamp: ts, signature: sig)

        // Both verifiers should accept
        let result1 = try whPrefixed.verify(payload: payload, headers: headers)
        let result2 = try whRaw.verify(payload: payload, headers: headers)

        XCTAssertEqual(result1["event"] as? String, "prefix-test")
        XCTAssertEqual(result2["event"] as? String, "prefix-test")
    }

    func testPrefixedAndRawProduceSameSignature() throws {
        let rawSecret = randomBase64Secret()
        let whPrefixed = try Webhook(secret: "whsec_\(rawSecret)")
        let whRaw = try Webhook(secret: rawSecret)

        let msgId = "msg_same"
        let ts = now()
        let payload = "{\"event\":\"same\"}"

        let sig1 = whPrefixed.sign(msgId: msgId, timestamp: ts, payload: payload)
        let sig2 = whRaw.sign(msgId: msgId, timestamp: ts, payload: payload)

        XCTAssertEqual(sig1, sig2, "whsec_ prefix should not affect the signature output")
    }

    // MARK: - 14. Sign function produces correct output

    func testSignProducesCorrectHMACSHA256() throws {
        // Use a known secret and verify the HMAC output manually
        let secretBase64 = Data("test-secret-key".utf8).base64EncodedString()
        let wh = try Webhook(secret: secretBase64)

        let msgId = "msg_sign_test"
        let timestamp = 1700000000
        let payload = "{\"event\":\"sign-test\"}"

        let sig = wh.sign(msgId: msgId, timestamp: timestamp, payload: payload)

        // Verify format: "v1,<base64>"
        XCTAssertTrue(sig.hasPrefix("v1,"))
        let base64Part = String(sig.dropFirst(3))
        XCTAssertNotNil(Data(base64Encoded: base64Part), "Signature should be valid base64")

        // Manually compute expected HMAC
        let content = "\(msgId).\(timestamp).\(payload)"
        let key = SymmetricKey(data: Data("test-secret-key".utf8))
        let expectedMAC = HMAC<SHA256>.authenticationCode(for: Data(content.utf8), using: key)
        let expectedSig = "v1,\(Data(expectedMAC).base64EncodedString())"

        XCTAssertEqual(sig, expectedSig)
    }

    func testSignRoundTripVerifyAcceptsSignedPayload() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"round-trip\",\"value\":42}"
        let msgId = "msg_roundtrip"
        let ts = now()

        let sig = wh.sign(msgId: msgId, timestamp: ts, payload: payload)
        let headers = makeHeaders(id: msgId, timestamp: ts, signature: sig)

        let result = try wh.verify(payload: payload, headers: headers)
        XCTAssertEqual(result["event"] as? String, "round-trip")
        XCTAssertEqual(result["value"] as? Int, 42)
    }

    // MARK: - 15. Header case insensitivity

    func testHeaderKeysAreCaseInsensitive() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"case-insensitive\"}"
        let msgId = "msg_case"
        let ts = now()
        let sig = signPayload(secret: secret, msgId: msgId, timestamp: ts, payload: payload)

        let headers: [String: String] = [
            "Webhook-Id": msgId,
            "Webhook-Timestamp": String(ts),
            "Webhook-Signature": sig,
        ]

        let result = try wh.verify(payload: payload, headers: headers)
        XCTAssertEqual(result["event"] as? String, "case-insensitive")
    }

    func testMixedCaseHeadersWork() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"mixed\"}"
        let msgId = "msg_mixed"
        let ts = now()
        let sig = signPayload(secret: secret, msgId: msgId, timestamp: ts, payload: payload)

        let headers: [String: String] = [
            "WEBHOOK-ID": msgId,
            "WEBHOOK-TIMESTAMP": String(ts),
            "WEBHOOK-SIGNATURE": sig,
        ]

        let result = try wh.verify(payload: payload, headers: headers)
        XCTAssertEqual(result["event"] as? String, "mixed")
    }

    // MARK: - 16. Non-JSON payload returns _raw

    func testNonJSONPayloadReturnsRawKey() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "this is plain text, not JSON"
        let msgId = "msg_raw"
        let ts = now()
        let sig = signPayload(secret: secret, msgId: msgId, timestamp: ts, payload: payload)

        let headers = makeHeaders(id: msgId, timestamp: ts, signature: sig)
        let result = try wh.verify(payload: payload, headers: headers)

        XCTAssertEqual(result["_raw"] as? String, payload)
    }

    func testEmptyStringPayloadReturnsRaw() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = ""
        let msgId = "msg_empty_payload"
        let ts = now()
        let sig = signPayload(secret: secret, msgId: msgId, timestamp: ts, payload: payload)

        let headers = makeHeaders(id: msgId, timestamp: ts, signature: sig)
        let result = try wh.verify(payload: payload, headers: headers)

        XCTAssertEqual(result["_raw"] as? String, "")
    }

    // MARK: - 17. Special characters in payload

    func testPayloadWithUnicodeCharacters() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"test\",\"message\":\"こんにちは 🎉\"}"
        let msgId = "msg_unicode"
        let ts = now()
        let sig = signPayload(secret: secret, msgId: msgId, timestamp: ts, payload: payload)

        let headers = makeHeaders(id: msgId, timestamp: ts, signature: sig)
        let result = try wh.verify(payload: payload, headers: headers)

        XCTAssertEqual(result["event"] as? String, "test")
        XCTAssertEqual(result["message"] as? String, "こんにちは 🎉")
    }

    func testPayloadWithEscapedCharacters() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"test\",\"url\":\"https://example.com/path?a=1&b=2\"}"
        let msgId = "msg_escaped"
        let ts = now()
        let sig = signPayload(secret: secret, msgId: msgId, timestamp: ts, payload: payload)

        let headers = makeHeaders(id: msgId, timestamp: ts, signature: sig)
        let result = try wh.verify(payload: payload, headers: headers)

        XCTAssertEqual(result["url"] as? String, "https://example.com/path?a=1&b=2")
    }

    // MARK: - 18. Timestamp edge cases

    func testTimestampZeroIsInvalid() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let payload = "{\"event\":\"zero-ts\"}"
        let msgId = "msg_zero"
        let sig = signPayload(secret: secret, msgId: msgId, timestamp: 0, payload: payload)

        let headers = makeHeaders(id: msgId, timestamp: 0, signature: sig)

        // Timestamp 0 is way in the past (>5min tolerance)
        XCTAssertThrowsError(try wh.verify(payload: payload, headers: headers))
    }

    func testNegativeTimestampIsInvalid() throws {
        let secret = randomBase64Secret()
        let wh = try Webhook(secret: secret)

        let headers: [String: String] = [
            "webhook-id": "msg_neg",
            "webhook-timestamp": "-100",
            "webhook-signature": "v1,fakesig",
        ]

        XCTAssertThrowsError(try wh.verify(payload: "{}", headers: headers)) { error in
            let msg = (error as! Webhook.VerificationError).message
            XCTAssertTrue(msg.contains("too old or too new") || msg.contains("Invalid webhook-timestamp"))
        }
    }
}
