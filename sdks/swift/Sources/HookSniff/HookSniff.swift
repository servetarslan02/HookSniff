import Foundation
import CommonCrypto

// MARK: - Error Types

/// HookSniff API error.
public struct HookSniffError: Error, LocalizedError {
    public let statusCode: Int?
    public let code: String?
    public let message: String

    public var errorDescription: String? { message }
}

// MARK: - Models

/// A webhook endpoint.
public struct Endpoint: Codable {
    public let id: String
    public let url: String
    public let description: String?
    public let isActive: Bool
    public let retryPolicy: RetryPolicy?
    public let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, url, description
        case isActive = "is_active"
        case retryPolicy = "retry_policy"
        case createdAt = "created_at"
    }
}

/// Retry policy for an endpoint.
public struct RetryPolicy: Codable {
    public let maxAttempts: Int?
    public let backoff: String?
    public let initialDelaySecs: Int?
    public let maxDelaySecs: Int?

    enum CodingKeys: String, CodingKey {
        case maxAttempts = "max_attempts"
        case backoff
        case initialDelaySecs = "initial_delay_secs"
        case maxDelaySecs = "max_delay_secs"
    }
}

/// A webhook delivery.
public struct Delivery: Codable {
    public let id: String
    public let endpointId: String?
    public let event: String?
    public let status: String?
    public let attemptCount: Int
    public let responseStatus: Int?
    public let replayCount: Int
    public let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id
        case endpointId = "endpoint_id"
        case event, status
        case attemptCount = "attempt_count"
        case responseStatus = "response_status"
        case replayCount = "replay_count"
        case createdAt = "created_at"
    }
}

/// A delivery attempt.
public struct DeliveryAttempt: Codable {
    public let id: String
    public let attemptNumber: Int
    public let statusCode: Int?
    public let responseBody: String?
    public let durationMs: Int?
    public let errorMessage: String?
    public let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id
        case attemptNumber = "attempt_number"
        case statusCode = "status_code"
        case responseBody = "response_body"
        case durationMs = "duration_ms"
        case errorMessage = "error_message"
        case createdAt = "created_at"
    }
}

/// Paginated delivery list.
public struct DeliveryList: Codable {
    public let deliveries: [Delivery]
    public let total: Int
    public let page: Int
    public let perPage: Int

    enum CodingKeys: String, CodingKey {
        case deliveries, total, page
        case perPage = "per_page"
    }
}

/// Batch send result.
public struct BatchResult: Codable {
    public let deliveries: [Delivery]
    public let errors: [String]
}

/// Platform statistics.
public struct Stats: Codable {
    public let totalDeliveries: Int
    public let delivered: Int
    public let failed: Int
    public let pending: Int
    public let successRate: Double
    public let endpointsCount: Int

    enum CodingKeys: String, CodingKey {
        case totalDeliveries = "total_deliveries"
        case delivered, failed, pending
        case successRate = "success_rate"
        case endpointsCount = "endpoints_count"
    }
}

// MARK: - HookSniff Client

/// Official Swift client for the HookSniff webhook delivery service.
///
/// Usage:
///     let client = HookSniff(apiKey: "hr_live_...")
///     let endpoint = try await client.endpoints.create(url: "https://myapp.com/webhook")
///     let delivery = try await client.webhooks.send(endpointId: endpoint.id, event: "order.created", data: ["order_id": "12345"])
public class HookSniff: @unchecked Sendable {
    private let apiKey: String
    private let baseUrl: String
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder
    private let maxRetries: Int

    public let endpoints: EndpointsResource
    public let webhooks: WebhooksResource

    public init(apiKey: String, baseUrl: String = "https://api.hooksniff.com/v1", timeout: TimeInterval = 30, maxRetries: Int = 3) {
        self.apiKey = apiKey
        self.baseUrl = baseUrl.hasSuffix("/") ? String(baseUrl.dropLast()) : baseUrl
        self.maxRetries = maxRetries

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = timeout
        config.timeoutIntervalForResource = timeout * 2
        self.session = URLSession(configuration: config)

        self.decoder = JSONDecoder()
        self.encoder = JSONEncoder()

        self.endpoints = EndpointsResource(client: self)
        self.webhooks = WebhooksResource(client: self)
    }

    private func isRetryable(_ statusCode: Int) -> Bool {
        return statusCode == 429 || statusCode >= 500
    }

    private func calculateBackoff(_ attempt: Int) -> UInt64 {
        return min(1000 * UInt64(1 << attempt), 30_000) // milliseconds
    }

    // MARK: - Internal API Request

    func request<T: Decodable>(_ method: String, path: String, body: [String: Any]? = nil) async throws -> T {
        var lastError: Error?

        for attempt in 0...maxRetries {
            let url = URL(string: baseUrl + path)!
            var request = URLRequest(url: url)
            request.httpMethod = method
            request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue("hooksniff-swift/0.3.0", forHTTPHeaderField: "User-Agent")

            if let body = body, ["POST", "PUT", "PATCH"].contains(method) {
                request.httpBody = try JSONSerialization.data(withJSONObject: body)
            }

            let data: Data
            let response: URLResponse
            do {
                (data, response) = try await session.data(for: request)
            } catch {
                lastError = error
                if attempt < maxRetries {
                    try await Task.sleep(nanoseconds: calculateBackoff(attempt) * 1_000_000)
                    continue
                }
                throw HookSniffError(statusCode: 0, code: "NETWORK_ERROR", message: "Network error after \(attempt + 1) attempts: \(error.localizedDescription)")
            }

            let httpResponse = response as! HTTPURLResponse

            if httpResponse.statusCode >= 400 {
                let message: String
                if let errorJson = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let error = errorJson["error"] as? [String: Any],
                   let msg = error["message"] as? String {
                    message = msg
                } else {
                    message = "HTTP \(httpResponse.statusCode)"
                }

                // Retry on 429 (respect Retry-After) and 5xx
                if isRetryable(httpResponse.statusCode) && attempt < maxRetries {
                    let delayMs: UInt64
                    if httpResponse.statusCode == 429,
                       let retryAfter = httpResponse.value(forHTTPHeaderField: "Retry-After"),
                       let seconds = Int(retryAfter) {
                        delayMs = UInt64(seconds) * 1000
                    } else {
                        delayMs = calculateBackoff(attempt)
                    }
                    try await Task.sleep(nanoseconds: delayMs * 1_000_000)
                    continue
                }

                throw HookSniffError(statusCode: httpResponse.statusCode, code: nil, message: message)
            }

            return try decoder.decode(T.self, from: data)
        }

        throw lastError ?? HookSniffError(statusCode: 0, code: "MAX_RETRIES", message: "Request failed after \(maxRetries + 1) retries")
    }

    func requestData(_ method: String, path: String, body: [String: Any]? = nil) async throws -> Data {
        var lastError: Error?

        for attempt in 0...maxRetries {
            let url = URL(string: baseUrl + path)!
            var request = URLRequest(url: url)
            request.httpMethod = method
            request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue("hooksniff-swift/0.3.0", forHTTPHeaderField: "User-Agent")

            if let body = body, ["POST", "PUT", "PATCH"].contains(method) {
                request.httpBody = try JSONSerialization.data(withJSONObject: body)
            }

            let data: Data
            let response: URLResponse
            do {
                (data, response) = try await session.data(for: request)
            } catch {
                lastError = error
                if attempt < maxRetries {
                    try await Task.sleep(nanoseconds: calculateBackoff(attempt) * 1_000_000)
                    continue
                }
                throw HookSniffError(statusCode: 0, code: "NETWORK_ERROR", message: "Network error after \(attempt + 1) attempts: \(error.localizedDescription)")
            }

            let httpResponse = response as! HTTPURLResponse

            if httpResponse.statusCode >= 400 {
                let message: String
                if let errorJson = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let error = errorJson["error"] as? [String: Any],
                   let msg = error["message"] as? String {
                    message = msg
                } else {
                    message = "HTTP \(httpResponse.statusCode)"
                }

                if isRetryable(httpResponse.statusCode) && attempt < maxRetries {
                    let delayMs: UInt64
                    if httpResponse.statusCode == 429,
                       let retryAfter = httpResponse.value(forHTTPHeaderField: "Retry-After"),
                       let seconds = Int(retryAfter) {
                        delayMs = UInt64(seconds) * 1000
                    } else {
                        delayMs = calculateBackoff(attempt)
                    }
                    try await Task.sleep(nanoseconds: delayMs * 1_000_000)
                    continue
                }

                throw HookSniffError(statusCode: httpResponse.statusCode, code: nil, message: message)
            }

            return data
        }

        throw lastError ?? HookSniffError(statusCode: 0, code: "MAX_RETRIES", message: "Request failed after \(maxRetries + 1) retries")
    }

    func requestRaw(_ method: String, path: String, body: [String: Any]? = nil) async throws -> Any {
        let data = try await requestData(method, path: path, body: body)
        return try JSONSerialization.jsonObject(with: data)
    }
}

// MARK: - Endpoints Resource

public class EndpointsResource: @unchecked Sendable {
    private let client: HookSniff

    init(client: HookSniff) { self.client = client }

    public func create(url: String, description: String? = nil, retryPolicy: [String: Any]? = nil) async throws -> Endpoint {
        var body: [String: Any] = ["url": url]
        if let description = description { body["description"] = description }
        if let retryPolicy = retryPolicy { body["retry_policy"] = retryPolicy }
        return try await client.request("POST", path: "/endpoints", body: body)
    }

    public func get(_ endpointId: String) async throws -> Endpoint {
        return try await client.request("GET", path: "/endpoints/\(endpointId)")
    }

    public func list(page: Int = 1, perPage: Int = 20) async throws -> [Endpoint] {
        return try await client.request("GET", path: "/endpoints?page=\(page)&per_page=\(perPage)")
    }

    public func delete(_ endpointId: String) async throws -> Bool {
        let result: [String: Bool] = try await client.request("DELETE", path: "/endpoints/\(endpointId)")
        return result["deleted"] ?? true
    }

    public func rotateSecret(_ endpointId: String) async throws -> [String: Any] {
        let data = try await client.requestData("POST", path: "/endpoints/\(endpointId)/rotate-secret")
        return (try JSONSerialization.jsonObject(with: data) as? [String: Any]) ?? [:]
    }
}

// MARK: - Webhooks Resource

public class WebhooksResource: @unchecked Sendable {
    private let client: HookSniff

    init(client: HookSniff) { self.client = client }

    public func send(endpointId: String, event: String? = nil, data: [String: Any]) async throws -> Delivery {
        var body: [String: Any] = ["endpoint_id": endpointId, "data": data]
        if let event = event { body["event"] = event }
        return try await client.request("POST", path: "/webhooks", body: body)
    }

    public func get(_ deliveryId: String) async throws -> Delivery {
        return try await client.request("GET", path: "/webhooks/\(deliveryId)")
    }

    public func list(status: String? = nil, page: Int = 1, perPage: Int = 20) async throws -> DeliveryList {
        var params = "page=\(page)&per_page=\(perPage)"
        if let status = status { params += "&status=\(status)" }
        return try await client.request("GET", path: "/webhooks?\(params)")
    }

    public func replay(_ deliveryId: String) async throws -> Delivery {
        return try await client.request("POST", path: "/webhooks/\(deliveryId)/replay")
    }

    public func batch(_ webhooks: [[String: Any]]) async throws -> BatchResult {
        return try await client.request("POST", path: "/webhooks/batch", body: ["webhooks": webhooks])
    }

    public func attempts(_ deliveryId: String) async throws -> [DeliveryAttempt] {
        return try await client.request("GET", path: "/webhooks/\(deliveryId)/attempts")
    }

    public func export(format: String? = nil, status: String? = nil, dateFrom: String? = nil, dateTo: String? = nil) async throws -> Any {
        var params: [String] = []
        if let f = format { params.append("format=\(f)") }
        if let s = status { params.append("status=\(s)") }
        if let df = dateFrom { params.append("date_from=\(df)") }
        if let dt = dateTo { params.append("date_to=\(dt)") }
        let qs = params.isEmpty ? "" : "?\(params.joined(separator: "&"))"
        return try await client.requestRaw("GET", path: "/webhooks/export\(qs)")
    }
}

// MARK: - Search Resource
public class SearchResource {
    private let client: HookSniff

    init(client: HookSniff) {
        self.client = client
    }

    public func search(query: String? = nil, event: String? = nil, status: String? = nil, endpointId: String? = nil, page: Int = 1, perPage: Int = 20) async throws -> [String: Any] {
        var params = ["page=\(page)", "per_page=\(perPage)"]
        if let q = query { params.append("q=\(q)") }
        if let e = event { params.append("event=\(e)") }
        if let s = status { params.append("status=\(s)") }
        if let eid = endpointId { params.append("endpoint_id=\(eid)") }
        let qs = params.joined(separator: "&")
        let result: Any = try await client.requestRaw("GET", path: "/search?\(qs)")
        guard let dict = result as? [String: Any] else {
            throw NSError(domain: "HookSniff", code: -1, userInfo: [NSLocalizedDescriptionKey: "Unexpected response type"])
        }
        return dict
    }
}

// MARK: - Webhook Verification

/// Result of webhook verification.
public struct VerificationResult {
    public let valid: Bool
    public let payload: Any?
    public let error: String?
}

/// Webhook signature verification for HookSniff.
///
/// Supports both Standard Webhooks headers (webhook-id, webhook-signature, webhook-timestamp)
/// and Svix headers (svix-id, svix-signature, svix-timestamp) as fallback.
public class WebhookVerifier {
    private let secret: Data
    private let toleranceSecs: Int

    public init(secret: String, toleranceSecs: Int = 300) {
        let stripped = secret.hasPrefix("whsec_") ? String(secret.dropFirst(6)) : secret
        self.secret = Data(base64Encoded: stripped) ?? Data(stripped.utf8)
        self.toleranceSecs = toleranceSecs
    }

    /// Verify a webhook request using Standard Webhooks headers.
    public func verify(body: String, msgId: String?, timestamp: String?, signatureHeader: String?) -> VerificationResult {
        guard let msgId = msgId, !msgId.isEmpty else {
            return VerificationResult(valid: false, payload: nil, error: "Missing webhook-id header")
        }
        guard let timestamp = timestamp, !timestamp.isEmpty else {
            return VerificationResult(valid: false, payload: nil, error: "Missing webhook-timestamp header")
        }
        guard let signatureHeader = signatureHeader, !signatureHeader.isEmpty else {
            return VerificationResult(valid: false, payload: nil, error: "Missing webhook-signature header")
        }
        guard !body.isEmpty else {
            return VerificationResult(valid: false, payload: nil, error: "Missing request body")
        }

        guard let ts = Int(timestamp) else {
            return VerificationResult(valid: false, payload: nil, error: "Invalid webhook timestamp")
        }

        let now = Int(Date().timeIntervalSince1970)
        if now - ts > toleranceSecs {
            return VerificationResult(valid: false, payload: nil, error: "Message timestamp too old")
        }
        if ts > now + toleranceSecs {
            return VerificationResult(valid: false, payload: nil, error: "Message timestamp too new")
        }

        // Compute expected signature
        let signedContent = "\(msgId).\(timestamp).\(body)"
        let hmacData = hmacSHA256(key: secret, data: Data(signedContent.utf8))
        let expectedSig = "v1,\(hmacData.base64EncodedString())"

        // Check each signature
        let signatures = signatureHeader.split(separator: " ").map(String.init)
        var verified = false

        for sig in signatures {
            let trimmed = sig.trimmingCharacters(in: .whitespaces)
            guard trimmed.hasPrefix("v1,") else { continue }
            // Constant-time comparison (XOR-based)
            let sigPart = String(trimmed.dropFirst(3))
            if constantTimeCompare(sigPart, expectedSig) {
                verified = true
                break
            }
        }

        if !verified {
            return VerificationResult(valid: false, payload: nil, error: "Invalid webhook signature")
        }

        // Parse payload
        if let data = body.data(using: .utf8),
           let parsed = try? JSONSerialization.jsonObject(with: data) {
            return VerificationResult(valid: true, payload: parsed, error: nil)
        }
        return VerificationResult(valid: true, payload: body, error: nil)
    }

    /// Verify a webhook from headers with automatic header detection.
    /// Supports both Standard Webhooks and Svix headers.
    public func verifyFromHeaders(body: String, headers: [String: String]) -> VerificationResult {
        let normalized = Dictionary(uniqueKeysWithValues: headers.map { ($0.key.lowercased(), $0.value) })

        var msgId = normalized["webhook-id"]
        var timestamp = normalized["webhook-timestamp"]
        var signatureHeader = normalized["webhook-signature"]

        if msgId == nil || timestamp == nil || signatureHeader == nil {
            msgId = msgId ?? normalized["svix-id"]
            timestamp = timestamp ?? normalized["svix-timestamp"]
            signatureHeader = signatureHeader ?? normalized["svix-signature"]
        }

        return verify(body: body, msgId: msgId, timestamp: timestamp, signatureHeader: signatureHeader)
    }

    private func constantTimeCompare(_ a: String, _ b: String) -> Bool {
        let aBytes = Array(a.utf8)
        let bBytes = Array(b.utf8)
        guard aBytes.count == bBytes.count else { return false }
        var result: UInt8 = 0
        for i in 0..<aBytes.count {
            result |= aBytes[i] ^ bBytes[i]
        }
        return result == 0
    }

    private func hmacSHA256(key: Data, data: Data) -> Data {
        var hmac = [UInt8](repeating: 0, count: Int(CC_SHA256_DIGEST_LENGTH))
        data.withUnsafeBytes { dataBytes in
            key.withUnsafeBytes { keyBytes in
                CCHmac(CCHmacAlgorithm(kCCHmacAlgSHA256), keyBytes.baseAddress, key.count, dataBytes.baseAddress, data.count, &hmac)
            }
        }
        return Data(hmac)
    }
}
