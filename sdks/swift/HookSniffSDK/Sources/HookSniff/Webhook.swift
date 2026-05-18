import Foundation
#if canImport(CryptoKit)
import CryptoKit
#else
import Crypto
#endif

/// Webhook signature verification for incoming HookSniff webhooks.
///
/// Verifies HMAC-SHA256 signatures in Standard Webhooks format.
/// Supports `whsec_` prefixed secrets and replay protection (5-minute tolerance).
///
/// Usage:
///     let wh = try Webhook(secret: "whsec_...")
///     let payload = try wh.verify(payload: rawBody, headers: headers)
public final class Webhook {
    private let secret: Data

    /// Error type for webhook verification failures
    public struct VerificationError: Error, LocalizedConvertible {
        public let message: String
        public var errorDescription: String { message }
    }

    /// Create a new Webhook verifier.
    ///
    /// - Parameter secret: The endpoint's signing secret (e.g., "whsec_base64encoded...")
    public init(secret: String) throws {
        self.secret = try Self.decodeSecret(secret)
    }

    /// Verify a webhook payload against its signature headers.
    ///
    /// - Parameters:
    ///   - payload: The raw request body (String)
    ///   - headers: Dictionary containing webhook-id, webhook-timestamp, webhook-signature
    ///              (also accepts svix-id, svix-timestamp, svix-signature)
    /// - Returns: The parsed payload as a dictionary if verification succeeds
    /// - Throws: `VerificationError` if verification fails
    public func verify(payload: String, headers: [String: String]) throws -> [String: Any] {
        let normalized = Self.normalizeHeaders(headers)

        guard let msgId = getHeader(normalized, name: "webhook-id") else {
            throw VerificationError(message: "Missing webhook-id header")
        }
        guard let timestamp = getHeader(normalized, name: "webhook-timestamp") else {
            throw VerificationError(message: "Missing webhook-timestamp header")
        }
        guard let signature = getHeader(normalized, name: "webhook-signature") else {
            throw VerificationError(message: "Missing webhook-signature header")
        }

        // Validate timestamp
        guard let timestampNum = Int(timestamp) else {
            throw VerificationError(message: "Invalid webhook-timestamp header")
        }

        let now = Int(Date().timeIntervalSince1970)
        let tolerance = Self.timestampToleranceSeconds
        if abs(now - timestampNum) > tolerance {
            throw VerificationError(message: "Webhook timestamp is too old or too new (tolerance: \(tolerance)s)")
        }

        // Compute expected signature
        let content = "\(msgId).\(timestamp).\(payload)"
        let hmac = Self.computeHMAC(secret: secret, content: content)
        let expectedSig = "v1,\(hmac.base64EncodedString())"

        // Verify
        guard Self.verifySignature(expected: expectedSig, actual: signature) else {
            throw VerificationError(message: "Invalid webhook signature")
        }

        // Parse payload
        guard let data = payload.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return ["_raw": payload]
        }
        return json
    }

    /// Sign a payload (for testing or server-side webhook sending).
    ///
    /// - Parameters:
    ///   - msgId: The message ID
    ///   - timestamp: Unix timestamp
    ///   - payload: The payload string
    /// - Returns: Signature string in "v1,base64hmac" format
    public func sign(msgId: String, timestamp: Int, payload: String) -> String {
        let content = "\(msgId).\(timestamp).\(payload)"
        let hmac = Self.computeHMAC(secret: secret, content: content)
        return "v1,\(hmac.base64EncodedString())"
    }

    // MARK: - Constants

    private static let timestampToleranceSeconds = 5 * 60 // 5 minutes

    // MARK: - Private Helpers

    private static func decodeSecret(_ secret: String) throws -> Data {
        var raw = secret
        if raw.hasPrefix("whsec_") {
            raw = String(raw.dropFirst(6))
        }

        // Try base64 decode
        if let data = Data(base64Encoded: raw) {
            return data
        }
        // Fall back to UTF-8
        return Data(raw.utf8)
    }

    private static func normalizeHeaders(_ headers: [String: String]) -> [String: String] {
        var normalized: [String: String] = [:]
        for (key, value) in headers {
            normalized[key.lowercased()] = value
        }
        return normalized
    }

    private func getHeader(_ headers: [String: String], name: String) -> String? {
        let svixName = name.replacingOccurrences(of: "webhook-", with: "svix-")
        return headers[name] ?? headers[svixName]
    }

    private static func computeHMAC(secret: Data, content: String) -> Data {
        let key = SymmetricKey(data: secret)
        let contentData = Data(content.utf8)
        let authCode = HMAC<SHA256>.authenticationCode(for: contentData, using: key)
        return Data(authCode)
    }

    private static func verifySignature(expected: String, actual: String) -> Bool {
        // Handle comma-separated multiple signatures
        let signatures = actual.split(separator: ",").map { String($0).trimmingCharacters(in: .whitespaces) }

        for sig in signatures {
            // Strip version prefix
            let parts = sig.split(separator: ",", maxSplits: 1)
            let sigPart = parts.count > 1 ? String(parts[1]) : String(parts[0])

            let expectedParts = expected.split(separator: ",", maxSplits: 1)
            let expectedPart = expectedParts.count > 1 ? String(expectedParts[1]) : String(expectedParts[0])

            // Timing-safe comparison
            guard let expectedData = expectedPart.data(using: .utf8),
                  let sigData = sigPart.data(using: .utf8),
                  expectedData.count == sigData.count else {
                continue
            }

            if Data(expectedData).elementsEqual(Data(sigData)) {
                return true
            }
        }
        return false
    }
}
