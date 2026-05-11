import XCTest
@testable import HookSniff

final class EndpointsResourceTests: XCTestCase {

    private var mock: MockHookSniff!
    private var resource: EndpointsResource!

    override func setUp() {
        super.setUp()
        mock = MockHookSniff()
        resource = EndpointsResource(client: mock)
    }

    // MARK: - 1. list() sends GET to /v1/endpoints

    func testListSendsGetToEndpoints() async throws {
        mock.stubbedBody = ["data": [["id": "ep_1", "url": "https://example.com"]]]

        let result = try await resource.list()

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertEqual(mock.requests[0].path, "/v1/endpoints")
        XCTAssertNil(mock.requests[0].body)
        XCTAssertEqual(result.count, 1)
        XCTAssertEqual(result[0]["id"] as? String, "ep_1")
    }

    // MARK: - 2. list(limit:offset:) sends query params

    func testListWithPaginationSendsQueryParams() async throws {
        mock.stubbedBody = [
            "data": [["id": "ep_1"]],
            "has_more": false
        ] as [String: Any]

        let page = try await resource.list(limit: 25, offset: 10)

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertEqual(mock.requests[0].path, "/v1/endpoints?limit=25&offset=10")
        XCTAssertNil(mock.requests[0].body)
        XCTAssertEqual(page.data.count, 1)
        XCTAssertFalse(page.hasMore)
    }

    // MARK: - 3. create() sends POST with body

    func testCreateSendsPost() async throws {
        let params: [String: Any] = [
            "url": "https://example.com/hook",
            "description": "Test endpoint"
        ]
        mock.stubbedBody = ["id": "ep_new", "url": "https://example.com/hook"] as [String: Any]

        let result = try await resource.create(params)

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "POST")
        XCTAssertEqual(mock.requests[0].path, "/v1/endpoints")
        XCTAssertNotNil(mock.requests[0].body)
        XCTAssertEqual(mock.requests[0].body?["url"] as? String, "https://example.com/hook")
        XCTAssertEqual(result["id"] as? String, "ep_new")
    }

    // MARK: - 4. get() sends GET with id in path

    func testGetSendsGetWithId() async throws {
        mock.stubbedBody = ["id": "ep_abc", "url": "https://example.com"] as [String: Any]

        let result = try await resource.get("ep_abc")

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertEqual(mock.requests[0].path, "/v1/endpoints/ep_abc")
        XCTAssertNil(mock.requests[0].body)
        XCTAssertEqual(result["id"] as? String, "ep_abc")
    }

    // MARK: - 5. delete() sends DELETE

    func testDeleteSendsDelete() async throws {
        try await resource.delete("ep_del_123")

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "DELETE")
        XCTAssertEqual(mock.requests[0].path, "/v1/endpoints/ep_del_123")
        XCTAssertNil(mock.requests[0].body)
    }

    // MARK: - 6. rotateSecret() sends POST

    func testRotateSecretSendsPost() async throws {
        mock.stubbedBody = ["id": "ep_rot", "key": "whsec_new123"] as [String: Any]

        let result = try await resource.rotateSecret("ep_rot")

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "POST")
        XCTAssertEqual(mock.requests[0].path, "/v1/endpoints/ep_rot/rotate-secret")
        XCTAssertNil(mock.requests[0].body)
        XCTAssertEqual(result["key"] as? String, "whsec_new123")
    }

    // MARK: - 7. listAll() method exists and works

    func testListAllExistsAndWorks() async throws {
        // First page: has_more = true, second page: has_more = false
        let page1: [String: Any] = [
            "data": [["id": "ep_1"], ["id": "ep_2"]],
            "has_more": true
        ]
        let page2: [String: Any] = [
            "data": [["id": "ep_3"]],
            "has_more": false
        ]

        var callCount = 0
        // Override requestJSON to return different pages
        // We need to replace the mock's behavior per call
        // Since MockHookSniff uses a single stubbedBody, let's use a custom approach

        // Actually, listAll calls list(limit:offset:) which calls requestJSON.
        // We need sequential responses. Let's create a custom mock for this.
        let seqMock = SequentialMockHookSniff(responses: [page1, page2])
        let seqResource = EndpointsResource(client: seqMock)

        let all = try await seqResource.listAll(limit: 2)

        XCTAssertEqual(all.count, 3)
        XCTAssertEqual(all[0]["id"] as? String, "ep_1")
        XCTAssertEqual(all[2]["id"] as? String, "ep_3")
        // Should have made 2 requests (two pages)
        XCTAssertEqual(seqMock.requests.count, 2)
    }
}

// MARK: - Sequential Mock (returns different responses per call)

/// Mock that returns responses in sequence, useful for testing pagination.
final class SequentialMockHookSniff: HookSniff {

    struct CapturedRequest {
        let method: String
        let path: String
        let body: [String: Any]?
    }

    private(set) var requests: [CapturedRequest] = []
    private var responses: [Any]
    private var responseIndex = 0

    init(responses: [Any]) {
        self.responses = responses
        super.init(apiKey: "test-key-sk_mock", baseURL: "https://mock.hooksniff.test")
    }

    override func request(
        method: String,
        path: String,
        body: [String: Any]? = nil
    ) async throws -> (statusCode: Int, body: Any?) {
        requests.append(CapturedRequest(method: method, path: path, body: body))
        let resp = responses[responseIndex]
        responseIndex = min(responseIndex + 1, responses.count - 1)
        return (200, resp)
    }

    override func requestJSON(
        method: String,
        path: String,
        body: [String: Any]? = nil
    ) async throws -> Any? {
        requests.append(CapturedRequest(method: method, path: path, body: body))
        let resp = responses[responseIndex]
        responseIndex = min(responseIndex + 1, responses.count - 1)
        return resp
    }
}
