import Foundation
@testable import HookSniff

/// Mock HookSniff client that captures requests for assertion.
/// Subclasses HookSniff and overrides request methods to avoid network calls.
final class MockHookSniff: HookSniff {

    struct CapturedRequest {
        let method: String
        let path: String
        let body: [String: Any]?
    }

    /// All requests made through this mock, in order.
    private(set) var requests: [CapturedRequest] = []

    /// Stubbed response body returned by all requests.
    var stubbedBody: Any? = [:]

    /// Stubbed status code (default 200).
    var stubbedStatusCode: Int = 200

    init() {
        super.init(apiKey: "test-key-sk_mock", baseURL: "https://mock.hooksniff.test")
    }

    /// Reset captured state between tests if reusing the same mock.
    func reset() {
        requests.removeAll()
        stubbedBody = [:]
        stubbedStatusCode = 200
    }

    override func request(
        method: String,
        path: String,
        body: [String: Any]? = nil
    ) async throws -> (statusCode: Int, body: Any?) {
        requests.append(CapturedRequest(method: method, path: path, body: body))
        return (stubbedStatusCode, stubbedBody)
    }

    override func requestJSON(
        method: String,
        path: String,
        body: [String: Any]? = nil
    ) async throws -> Any? {
        requests.append(CapturedRequest(method: method, path: path, body: body))
        return stubbedBody
    }
}
