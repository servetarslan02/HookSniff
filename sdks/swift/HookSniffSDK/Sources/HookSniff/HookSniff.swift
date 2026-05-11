import Foundation

/// HookSniff SDK — Main entry point.
///
/// Usage:
///     let hs = HookSniff(apiKey: "your-api-key")
///     let endpoints = try await hs.endpoints.list()
///
public class HookSniff {
    private static let defaultBaseURL = "https://hooksniff-api-1046140057667.europe-west1.run.app"

    public let apiKey: String
    public let baseURL: String
    public let timeout: TimeInterval
    public let numRetries: Int

    // Resource accessors
    public lazy var endpoints = EndpointsResource(client: self)
    public lazy var webhooks = WebhooksResource(client: self)
    public lazy var auth = AuthResource(client: self)
    public lazy var analytics = AnalyticsResource(client: self)
    public lazy var apiKeys = ApiKeysResource(client: self)
    public lazy var alerts = AlertsResource(client: self)
    public lazy var teams = TeamsResource(client: self)
    public lazy var search = SearchResource(client: self)
    public lazy var billing = BillingResource(client: self)
    public lazy var health = HealthResource(client: self)

    /// Create a new HookSniff client.
    ///
    /// - Parameters:
    ///   - apiKey: Your API key or JWT token.
    ///   - baseURL: Base URL of the HookSniff API (default: production).
    ///   - timeout: Request timeout in seconds (default: 30).
    ///   - numRetries: Number of retries for 5xx errors (default: 2).
    public init(
        apiKey: String,
        baseURL: String? = nil,
        timeout: TimeInterval = 30,
        numRetries: Int = 2
    ) {
        self.apiKey = apiKey
        self.baseURL = (baseURL ?? Self.defaultBaseURL).replacingOccurrences(of: "/+$", with: "", options: .regularExpression)
        self.timeout = timeout
        self.numRetries = numRetries
    }

    // MARK: - HTTP Client (overridable for testing)

    /// Make an HTTP request to the HookSniff API.
    func request(
        method: String,
        path: String,
        body: [String: Any]? = nil
    ) async throws -> (statusCode: Int, body: Any?) {
        let url = URL(string: baseURL + path)!
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = method
        urlRequest.timeoutInterval = timeout

        // Headers
        urlRequest.setValue("application/json", forHTTPHeaderField: "Accept")
        urlRequest.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        urlRequest.setValue("hooksniff-sdk/1.0.0/swift", forHTTPHeaderField: "User-Agent")
        urlRequest.setValue(autoIdempotencyKey(), forHTTPHeaderField: "Idempotency-Key")

        // Body
        if let body = body {
            urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
            urlRequest.httpBody = try JSONSerialization.data(withJSONObject: body)
        }

        var lastError: Error?

        for attempt in 0...numRetries {
            if attempt > 0 {
                // Exponential backoff: 50ms, 100ms, 200ms, ...
                let delay = UInt64(50 * Int(pow(2.0, Double(attempt - 1)))) * 1_000_000
                try await Task.sleep(nanoseconds: delay)
            }

            do {
                let (data, response) = try await URLSession.shared.data(for: urlRequest)
                let httpResponse = response as! HTTPURLResponse
                let statusCode = httpResponse.statusCode

                // Don't retry on 4xx
                if statusCode < 500 {
                    let parsedBody: Any?
                    if let json = try? JSONSerialization.jsonObject(with: data) {
                        parsedBody = json
                    } else {
                        parsedBody = String(data: data, encoding: .utf8)
                    }

                    if statusCode >= 400 {
                        throw ApiError(statusCode: statusCode, body: parsedBody)
                    }
                    return (statusCode, parsedBody)
                }

                // 5xx — will retry
                let bodyText = String(data: data, encoding: .utf8)
                lastError = ApiError(statusCode: statusCode, body: bodyText)
            } catch let error as ApiError where error.statusCode < 500 {
                throw error
            } catch {
                lastError = error
            }
        }

        throw lastError ?? NSError(domain: "HookSniff", code: -1, userInfo: [NSLocalizedDescriptionKey: "Request failed after retries"])
    }

    /// Convenience: request and parse JSON response
    func requestJSON(
        method: String,
        path: String,
        body: [String: Any]? = nil
    ) async throws -> Any? {
        let result = try await request(method: method, path: path, body: body)
        return result.body
    }

    private func autoIdempotencyKey() -> String {
        "auto_\(UUID().uuidString.lowercased())"
    }
}

// MARK: - API Error

extension HookSniff {
    /// API error type
    public struct ApiError: Error, LocalizedConvertible {
        public let statusCode: Int
        public let body: Any?

        public var errorDescription: String {
            "HookSniff API Error \(statusCode): \(String(describing: body))"
        }
    }
}

// MARK: - Helper Protocol

/// Protocol for localized error descriptions
public protocol LocalizedConvertible: Error {
    var errorDescription: String { get }
}
