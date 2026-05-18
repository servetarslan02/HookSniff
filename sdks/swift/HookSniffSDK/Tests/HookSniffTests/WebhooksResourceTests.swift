import XCTest
@testable import HookSniff

final class WebhooksResourceTests: XCTestCase {

    private var mock: MockHookSniff!
    private var resource: WebhooksResource!

    override func setUp() {
        super.setUp()
        mock = MockHookSniff()
        resource = WebhooksResource(client: mock)
    }

    // MARK: - 1. send() sends POST to /v1/webhooks

    func testSendSendsPost() async throws {
        let params: [String: Any] = [
            "event_type": "order.created",
            "payload": ["order_id": "ord_123"]
        ]
        mock.stubbedBody = ["id": "wh_sent", "status": "queued"] as [String: Any]

        let result = try await resource.send(params)

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "POST")
        XCTAssertEqual(mock.requests[0].path, "/v1/webhooks")
        XCTAssertNotNil(mock.requests[0].body)
        XCTAssertEqual(mock.requests[0].body?["event_type"] as? String, "order.created")
        XCTAssertEqual(result["id"] as? String, "wh_sent")
    }

    // MARK: - 2. batch() sends POST to /v1/webhooks/batch

    func testBatchSendsPost() async throws {
        let params: [String: Any] = [
            "events": [
                ["event_type": "order.created", "payload": ["id": "1"]],
                ["event_type": "order.updated", "payload": ["id": "2"]]
            ]
        ]
        mock.stubbedBody = ["accepted": 2] as [String: Any]

        let result = try await resource.batch(params)

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "POST")
        XCTAssertEqual(mock.requests[0].path, "/v1/webhooks/batch")
        XCTAssertNotNil(mock.requests[0].body)
        XCTAssertEqual(result["accepted"] as? Int, 2)
    }

    // MARK: - 3. get() sends GET with id

    func testGetSendsGetWithId() async throws {
        mock.stubbedBody = ["id": "wh_abc", "status": "delivered"] as [String: Any]

        let result = try await resource.get("wh_abc")

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertEqual(mock.requests[0].path, "/v1/webhooks/wh_abc")
        XCTAssertNil(mock.requests[0].body)
        XCTAssertEqual(result["id"] as? String, "wh_abc")
    }

    // MARK: - 4. replay() sends POST

    func testReplaySendsPost() async throws {
        mock.stubbedBody = ["id": "wh_replay", "status": "replayed"] as [String: Any]

        let result = try await resource.replay("wh_replay")

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "POST")
        XCTAssertEqual(mock.requests[0].path, "/v1/webhooks/wh_replay/replay")
        XCTAssertNil(mock.requests[0].body)
        XCTAssertEqual(result["status"] as? String, "replayed")
    }
}
