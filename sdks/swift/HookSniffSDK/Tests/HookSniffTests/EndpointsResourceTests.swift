import XCTest
@testable import HookSniff

// MARK: - Mock Client

/// Captures request details so tests can assert method/path/body.
final class MockHookSniff: HookSniff {

    struct CapturedRequest {
        let method: String
        let path: String
        let body: [String: Any]?
    }

    private(set) var requests: [CapturedRequest] = []

    /// Stub response returned by every request. Set before calling resource methods.
    var stubbedResponse: Any? = ["id": "ep_test", "url": "https://example.com"]

    init() {
        super.init(apiKey: "test-key", baseURL: "https://mock.hooksniff")
    }

    override func request(
        method: String,
        path: String,
        body: [String: Any]? = nil
    ) async throws -> (statusCode: Int, body: Any?) {
        requests.append(CapturedRequest(method: method, path: path, body: body))
        return (200, stubbedResponse)
    }

    override func requestJSON(
        method: String,
        path: String,
        body: [String: Any]? = nil
    ) async throws -> Any? {
        requests.append(CapturedRequest(method: method, path: path, body: body))
        return stubbedResponse
    }
}

// MARK: - EndpointsResource Tests

final class EndpointsResourceTests: XCTestCase {

    private var mock: MockHookSniff!
    private var resource: EndpointsResource!

    override func setUp() {
        super.setUp()
        mock = MockHookSniff()
        resource = EndpointsResource(client: mock)
    }

    // MARK: 1. list() sends GET to /v1/endpoints

    func testListSendsGETToEndpoints() async throws {
        mock.stubbedResponse = [["id": "ep_1"]]
        _ = try await resource.list()

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertEqual(mock.requests[0].path, "/v1/endpoints")
        XCTAssertNil(mock.requests[0].body)
    }

    // MARK: 2. list(limit:offset:) sends query params

    func testListWithPaginationSendsQueryParams() async throws {
        mock.stubbedResponse = ["data": [["id": "ep_1"]], "has_more": false]
        _ = try await resource.list(limit: 25, offset: 10)

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertEqual(mock.requests[0].path, "/v1/endpoints?limit=25&offset=10")
    }

    // MARK: 3. create() sends POST

    func testCreateSendsPOST() async throws {
        let params: [String: Any] = ["url": "https://example.com", "description": "test"]
        _ = try await resource.create(params)

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "POST")
        XCTAssertEqual(mock.requests[0].path, "/v1/endpoints")
        XCTAssertEqual(mock.requests[0].body?["url"] as? String, "https://example.com")
    }

    // MARK: 4. get() sends GET with id

    func testGetSendsGETWithId() async throws {
        _ = try await resource.get("ep_abc123")

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertEqual(mock.requests[0].path, "/v1/endpoints/ep_abc123")
    }

    // MARK: 5. delete() sends DELETE

    func testDeleteSendsDELETE() async throws {
        _ = try await resource.delete("ep_del")

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "DELETE")
        XCTAssertEqual(mock.requests[0].path, "/v1/endpoints/ep_del")
    }

    // MARK: 6. rotateSecret() sends POST

    func testRotateSecretSendsPOST() async throws {
        _ = try await resource.rotateSecret("ep_rotate")

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "POST")
        XCTAssertEqual(mock.requests[0].path, "/v1/endpoints/ep_rotate/rotate-secret")
    }

    // MARK: 7. listAll() method exists and can be called

    func testListAllExists() async throws {
        mock.stubbedResponse = ["data": [["id": "ep_1"]], "has_more": false]
        let results = try await resource.listAll()

        // Should have made at least one request
        XCTAssertGreaterThanOrEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertTrue(mock.requests[0].path.contains("/v1/endpoints"))
        XCTAssertEqual(results.count, 1)
    }
}
