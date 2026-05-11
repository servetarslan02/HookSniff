import XCTest
@testable import HookSniff

/// Tests for HookSniff client initialization and configuration.
final class HookSniffTests: XCTestCase {

    // MARK: - 1. Basic initialization with API key

    func testInitWithApiKey() {
        let client = HookSniff(apiKey: "sk_test_123")
        XCTAssertEqual(client.apiKey, "sk_test_123")
    }

    // MARK: - 2. Default base URL

    func testDefaultBaseURL() {
        let client = HookSniff(apiKey: "sk_test")
        XCTAssertEqual(client.baseURL, "https://hooksniff-api-1046140057667.europe-west1.run.app")
    }

    // MARK: - 3. Custom base URL

    func testCustomBaseURL() {
        let client = HookSniff(apiKey: "sk_test", baseURL: "https://custom.api.com")
        XCTAssertEqual(client.baseURL, "https://custom.api.com")
    }

    // MARK: - 4. Custom base URL with trailing slash is trimmed

    func testTrailingSlashIsTrimmed() {
        let client = HookSniff(apiKey: "sk_test", baseURL: "https://custom.api.com/")
        XCTAssertEqual(client.baseURL, "https://custom.api.com")
    }

    func testMultipleTrailingSlashesAreTrimmed() {
        let client = HookSniff(apiKey: "sk_test", baseURL: "https://custom.api.com///")
        XCTAssertEqual(client.baseURL, "https://custom.api.com")
    }

    // MARK: - 5. Default timeout is 30 seconds

    func testDefaultTimeout() {
        let client = HookSniff(apiKey: "sk_test")
        XCTAssertEqual(client.timeout, 30)
    }

    // MARK: - 6. Custom timeout

    func testCustomTimeout() {
        let client = HookSniff(apiKey: "sk_test", timeout: 60)
        XCTAssertEqual(client.timeout, 60)
    }

    func testZeroTimeout() {
        let client = HookSniff(apiKey: "sk_test", timeout: 0)
        XCTAssertEqual(client.timeout, 0)
    }

    // MARK: - 7. Default retries is 2

    func testDefaultRetries() {
        let client = HookSniff(apiKey: "sk_test")
        XCTAssertEqual(client.numRetries, 2)
    }

    // MARK: - 8. Custom retries

    func testCustomRetries() {
        let client = HookSniff(apiKey: "sk_test", numRetries: 5)
        XCTAssertEqual(client.numRetries, 5)
    }

    func testZeroRetries() {
        let client = HookSniff(apiKey: "sk_test", numRetries: 0)
        XCTAssertEqual(client.numRetries, 0)
    }

    // MARK: - 9. Resource accessors are lazily initialized

    func testEndpointsResourceExists() {
        let client = HookSniff(apiKey: "sk_test")
        let endpoints = client.endpoints
        XCTAssertNotNil(endpoints)
    }

    func testWebhooksResourceExists() {
        let client = HookSniff(apiKey: "sk_test")
        XCTAssertNotNil(client.webhooks)
    }

    func testAuthResourceExists() {
        let client = HookSniff(apiKey: "sk_test")
        XCTAssertNotNil(client.auth)
    }

    func testAnalyticsResourceExists() {
        let client = HookSniff(apiKey: "sk_test")
        XCTAssertNotNil(client.analytics)
    }

    func testApiKeysResourceExists() {
        let client = HookSniff(apiKey: "sk_test")
        XCTAssertNotNil(client.apiKeys)
    }

    func testAlertsResourceExists() {
        let client = HookSniff(apiKey: "sk_test")
        XCTAssertNotNil(client.alerts)
    }

    func testTeamsResourceExists() {
        let client = HookSniff(apiKey: "sk_test")
        XCTAssertNotNil(client.teams)
    }

    func testSearchResourceExists() {
        let client = HookSniff(apiKey: "sk_test")
        XCTAssertNotNil(client.search)
    }

    func testBillingResourceExists() {
        let client = HookSniff(apiKey: "sk_test")
        XCTAssertNotNil(client.billing)
    }

    func testHealthResourceExists() {
        let client = HookSniff(apiKey: "sk_test")
        XCTAssertNotNil(client.health)
    }

    // MARK: - 10. Empty API key is accepted (server will reject)

    func testEmptyApiKeyIsAccepted() {
        let client = HookSniff(apiKey: "")
        XCTAssertEqual(client.apiKey, "")
    }

    // MARK: - 11. API key with special characters

    func testApiKeyWithSpecialCharacters() {
        let key = "sk_test-abc_123.def~ghi"
        let client = HookSniff(apiKey: key)
        XCTAssertEqual(client.apiKey, key)
    }

    // MARK: - 12. All parameters together

    func testInitWithAllParameters() {
        let client = HookSniff(
            apiKey: "sk_full",
            baseURL: "https://my.api.com",
            timeout: 45,
            numRetries: 3
        )
        XCTAssertEqual(client.apiKey, "sk_full")
        XCTAssertEqual(client.baseURL, "https://my.api.com")
        XCTAssertEqual(client.timeout, 45)
        XCTAssertEqual(client.numRetries, 3)
    }

    // MARK: - 13. ApiError description

    func testApiErrorDescription() {
        let error = HookSniff.ApiError(statusCode: 404, body: ["error": "not found"])
        XCTAssertTrue(error.errorDescription.contains("404"))
    }

    func testApiErrorWithNilBody() {
        let error = HookSniff.ApiError(statusCode: 500, body: nil)
        XCTAssertTrue(error.errorDescription.contains("500"))
    }

    // MARK: - 14. MockHookSniff captures requests correctly

    func testMockCapturesMultipleRequests() async throws {
        let mock = MockHookSniff()
        _ = try await mock.request(method: "GET", path: "/v1/test1")
        _ = try await mock.request(method: "POST", path: "/v1/test2", body: ["key": "val"])

        XCTAssertEqual(mock.requests.count, 2)
        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertEqual(mock.requests[0].path, "/v1/test1")
        XCTAssertNil(mock.requests[0].body)
        XCTAssertEqual(mock.requests[1].method, "POST")
        XCTAssertEqual(mock.requests[1].path, "/v1/test2")
        XCTAssertEqual(mock.requests[1].body?["key"] as? String, "val")
    }

    func testMockReset() async throws {
        let mock = MockHookSniff()
        _ = try await mock.request(method: "GET", path: "/v1/test")
        XCTAssertEqual(mock.requests.count, 1)

        mock.reset()
        XCTAssertEqual(mock.requests.count, 0)
        XCTAssertEqual(mock.stubbedStatusCode, 200)
    }

    func testMockCustomStatusCode() async throws {
        let mock = MockHookSniff()
        mock.stubbedStatusCode = 201
        let result = try await mock.request(method: "POST", path: "/v1/test")
        XCTAssertEqual(result.statusCode, 201)
    }
}
