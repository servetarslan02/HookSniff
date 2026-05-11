import XCTest
@testable import HookSniff

// MARK: - WebhooksResource Tests

final class WebhooksResourceTests: XCTestCase {

    private var mock: MockHookSniff!
    private var resource: WebhooksResource!

    override func setUp() {
        super.setUp()
        mock = MockHookSniff()
        resource = WebhooksResource(client: mock)
    }

    // MARK: 1. send() sends POST

    func testSendSendsPOST() async throws {
        let params: [String: Any] = ["event": "order.created", "data": ["id": "ord_1"]]
        _ = try await resource.send(params)

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "POST")
        XCTAssertEqual(mock.requests[0].path, "/v1/webhooks")
        XCTAssertEqual(mock.requests[0].body?["event"] as? String, "order.created")
    }

    // MARK: 2. batch() sends POST

    func testBatchSendsPOST() async throws {
        let params: [String: Any] = ["events": [["event": "a"], ["event": "b"]]]
        _ = try await resource.batch(params)

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "POST")
        XCTAssertEqual(mock.requests[0].path, "/v1/webhooks/batch")
    }

    // MARK: 3. get() sends GET

    func testGetSendsGET() async throws {
        _ = try await resource.get("wh_abc")

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertEqual(mock.requests[0].path, "/v1/webhooks/wh_abc")
    }

    // MARK: 4. replay() sends POST

    func testReplaySendsPOST() async throws {
        _ = try await resource.replay("wh_replay")

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "POST")
        XCTAssertEqual(mock.requests[0].path, "/v1/webhooks/wh_replay/replay")
    }
}
