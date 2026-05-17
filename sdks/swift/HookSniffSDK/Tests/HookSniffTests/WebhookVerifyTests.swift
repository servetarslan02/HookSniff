import XCTest
@testable import HookSniff

final class WebhookTests: XCTestCase {
    let secret = "whsec_dGVzdA=="
    let msgId = "msg_test123"
    let timestamp = Int(Date().timeIntervalSince1970)
    let payload = #"{"event":"test"}"#

    func sign(secret: String, msgId: String, timestamp: Int, payload: String) -> String {
        let decoded = Data(base64Encoded: secret.replacingOccurrences(of: "whsec_", with: ""))!
        let toSign = "\(msgId).\(timestamp).\(payload)"
        let key = SymmetricKey(data: decoded)
        let sig = HMAC<SHA256>.authenticationCode(for: toSign.data(using: .utf8)!, using: key)
        return "v1,\(Data(sig).base64EncodedString())"
    }

    func testVerifyValidSignature() throws {
        let wh = Webhook(secret: secret)
        let sig = sign(secret: secret, msgId: msgId, timestamp: timestamp, payload: payload)
        let headers = [
            "webhook-id": msgId,
            "webhook-timestamp": String(timestamp),
            "webhook-signature": sig,
        ]
        let result = try wh.verify(payload: payload, headers: headers)
        XCTAssertNotNil(result)
    }

    func testRejectInvalidSignature() {
        let wh = Webhook(secret: secret)
        let headers = [
            "webhook-id": msgId,
            "webhook-timestamp": String(timestamp),
            "webhook-signature": "v1,invalid",
        ]
        XCTAssertThrowsError(try wh.verify(payload: payload, headers: headers))
    }

    func testSvixBrandedHeaders() throws {
        let wh = Webhook(secret: secret)
        let sig = sign(secret: secret, msgId: msgId, timestamp: timestamp, payload: payload)
        let headers = [
            "svix-id": msgId,
            "svix-timestamp": String(timestamp),
            "svix-signature": sig,
        ]
        let result = try wh.verify(payload: payload, headers: headers)
        XCTAssertNotNil(result)
    }
}
