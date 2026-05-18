import XCTest
@testable import HookSniff

/// Tests for the HTTP request builder and MockHookSniff behavior.
final class RequestTests: XCTestCase {

    // MARK: - MockHookSniff request capture

    func testMockReturnsStubbedBody() async throws {
        let mock = MockHookSniff()
        mock.stubbedBody = ["status": "ok"]

        let result = try await mock.requestJSON(method: "GET", path: "/v1/test")
        let dict = result as? [String: Any]
        XCTAssertEqual(dict?["status"] as? String, "ok")
    }

    func testMockReturnsStubbedStatusCode() async throws {
        let mock = MockHookSniff()
        mock.stubbedStatusCode = 201

        let result = try await mock.request(method: "POST", path: "/v1/test")
        XCTAssertEqual(result.statusCode, 201)
    }

    func testMockCapturesGETMethod() async throws {
        let mock = MockHookSniff()
        _ = try await mock.request(method: "GET", path: "/v1/test")

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "GET")
    }

    func testMockCapturesPOSTMethod() async throws {
        let mock = MockHookSniff()
        _ = try await mock.request(method: "POST", path: "/v1/test", body: ["a": 1])

        XCTAssertEqual(mock.requests[0].method, "POST")
        XCTAssertNotNil(mock.requests[0].body)
    }

    func testMockCapturesPUTMethod() async throws {
        let mock = MockHookSniff()
        _ = try await mock.request(method: "PUT", path: "/v1/test", body: ["a": 1])

        XCTAssertEqual(mock.requests[0].method, "PUT")
    }

    func testMockCapturesDELETEMethod() async throws {
        let mock = MockHookSniff()
        _ = try await mock.request(method: "DELETE", path: "/v1/test")

        XCTAssertEqual(mock.requests[0].method, "DELETE")
        XCTAssertNil(mock.requests[0].body)
    }

    func testMockCapturesPath() async throws {
        let mock = MockHookSniff()
        _ = try await mock.request(method: "GET", path: "/v1/endpoints?limit=10&offset=0")

        XCTAssertEqual(mock.requests[0].path, "/v1/endpoints?limit=10&offset=0")
    }

    func testMockCapturesBody() async throws {
        let mock = MockHookSniff()
        let body: [String: Any] = ["url": "https://example.com", "events": ["order.created"]]
        _ = try await mock.request(method: "POST", path: "/v1/endpoints", body: body)

        XCTAssertEqual(mock.requests[0].body?["url"] as? String, "https://example.com")
    }

    func testMockCapturesNilBody() async throws {
        let mock = MockHookSniff()
        _ = try await mock.request(method: "GET", path: "/v1/test")

        XCTAssertNil(mock.requests[0].body)
    }

    // MARK: - Sequential mock for multi-request flows

    func testSequentialMockReturnsResponsesInOrder() async throws {
        let responses: [Any] = [
            ["data": [["id": "1"]] as [[String: Any]], "has_more": true] as [String: Any],
            ["data": [["id": "2"]] as [[String: Any]], "has_more": false] as [String: Any],
        ]
        let mock = SequentialMockHookSniff(responses: responses)

        let result1 = try await mock.requestJSON(method: "GET", path: "/v1/items")
        let result2 = try await mock.requestJSON(method: "GET", path: "/v1/items")

        let dict1 = result1 as? [String: Any]
        let dict2 = result2 as? [String: Any]

        XCTAssertEqual(mock.requests.count, 2)
        let data1 = dict1?["data"] as? [[String: Any]]
        XCTAssertEqual(data1?.first?["id"] as? String, "1")
        let data2 = dict2?["data"] as? [[String: Any]]
        XCTAssertEqual(data2?.first?["id"] as? String, "2")
    }

    func testSequentialMockReusesLastResponseWhenExhausted() async throws {
        let responses: [Any] = [
            ["id": "only"] as [String: Any],
        ]
        let mock = SequentialMockHookSniff(responses: responses)

        _ = try await mock.requestJSON(method: "GET", path: "/v1/test")
        let result2 = try await mock.requestJSON(method: "GET", path: "/v1/test")

        // Should return the last response again
        let dict = result2 as? [String: Any]
        XCTAssertEqual(dict?["id"] as? String, "only")
    }

    // MARK: - Multiple sequential requests

    func testMultipleRequestsAreTrackedInOrder() async throws {
        let mock = MockHookSniff()
        mock.stubbedBody = ["ok": true]

        _ = try await mock.request(method: "GET", path: "/v1/a")
        _ = try await mock.request(method: "POST", path: "/v1/b", body: ["x": 1])
        _ = try await mock.request(method: "DELETE", path: "/v1/c")

        XCTAssertEqual(mock.requests.count, 3)
        XCTAssertEqual(mock.requests[0].path, "/v1/a")
        XCTAssertEqual(mock.requests[1].path, "/v1/b")
        XCTAssertEqual(mock.requests[2].path, "/v1/c")
    }

    // MARK: - Query parameter encoding

    func testPathWithQueryParameters() async throws {
        let mock = MockHookSniff()
        _ = try await mock.request(method: "GET", path: "/v1/items?limit=25&offset=50&q=search+term")

        XCTAssertTrue(mock.requests[0].path.contains("limit=25"))
        XCTAssertTrue(mock.requests[0].path.contains("offset=50"))
    }

    func testPathWithSpecialCharacters() async throws {
        let mock = MockHookSniff()
        _ = try await mock.request(method: "GET", path: "/v1/items/msg_abc-123_def")

        XCTAssertEqual(mock.requests[0].path, "/v1/items/msg_abc-123_def")
    }
}
