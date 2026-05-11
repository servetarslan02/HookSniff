import XCTest
@testable import HookSniff

/// Tests for JSONHelpers utility functions.
final class SerializationTests: XCTestCase {

    // MARK: - dataArray(from:)

    func testExtractsDataArrayFromEnvelope() {
        let body: Any = ["data": [["id": "1"], ["id": "2"]] as [[String: Any]]]
        let result = JSONHelpers.dataArray(from: body)
        XCTAssertEqual(result.count, 2)
        XCTAssertEqual(result[0]["id"] as? String, "1")
        XCTAssertEqual(result[1]["id"] as? String, "2")
    }

    func testExtractsDataArrayFromRawArray() {
        let body: Any = [["id": "a"], ["id": "b"]] as [[String: Any]]
        let result = JSONHelpers.dataArray(from: body)
        XCTAssertEqual(result.count, 2)
        XCTAssertEqual(result[0]["id"] as? String, "a")
    }

    func testReturnsEmptyArrayForNil() {
        let result = JSONHelpers.dataArray(from: nil)
        XCTAssertTrue(result.isEmpty)
    }

    func testReturnsEmptyArrayForStringBody() {
        let result = JSONHelpers.dataArray(from: "not json")
        XCTAssertTrue(result.isEmpty)
    }

    func testReturnsEmptyArrayForDictWithoutData() {
        let body: Any = ["error": "not found"] as [String: Any]
        let result = JSONHelpers.dataArray(from: body)
        XCTAssertTrue(result.isEmpty)
    }

    func testReturnsEmptyArrayForEmptyDataArray() {
        let body: Any = ["data": [] as [[String: Any]]]
        let result = JSONHelpers.dataArray(from: body)
        XCTAssertTrue(result.isEmpty)
    }

    func testReturnsEmptyArrayForIntBody() {
        let result = JSONHelpers.dataArray(from: 42)
        XCTAssertTrue(result.isEmpty)
    }

    // MARK: - hasMore(from:)

    func testExtractsHasMoreTrue() {
        let body: Any = ["has_more": true]
        XCTAssertTrue(JSONHelpers.hasMore(from: body))
    }

    func testExtractsHasMoreFalse() {
        let body: Any = ["has_more": false]
        XCTAssertFalse(JSONHelpers.hasMore(from: body))
    }

    func testDefaultsToFalseWhenMissing() {
        let body: Any = ["data": []]
        XCTAssertFalse(JSONHelpers.hasMore(from: body))
    }

    func testDefaultsToFalseForNil() {
        XCTAssertFalse(JSONHelpers.hasMore(from: nil))
    }

    func testDefaultsToFalseForStringBody() {
        XCTAssertFalse(JSONHelpers.hasMore(from: "string"))
    }

    func testDefaultsToFalseForWrongType() {
        let body: Any = ["has_more": "yes"]
        XCTAssertFalse(JSONHelpers.hasMore(from: body))
    }

    // MARK: - dict(from:)

    func testCastsBodyToDict() {
        let body: Any = ["key": "value"] as [String: Any]
        let result = JSONHelpers.dict(from: body)
        XCTAssertEqual(result["key"] as? String, "value")
    }

    func testReturnsEmptyDictForNil() {
        let result = JSONHelpers.dict(from: nil)
        XCTAssertTrue(result.isEmpty)
    }

    func testReturnsEmptyDictForArray() {
        let body: Any = [["key": "value"]] as [[String: Any]]
        let result = JSONHelpers.dict(from: body)
        XCTAssertTrue(result.isEmpty)
    }

    func testReturnsEmptyDictForString() {
        let result = JSONHelpers.dict(from: "string")
        XCTAssertTrue(result.isEmpty)
    }

    func testReturnsEmptyDictForInt() {
        let result = JSONHelpers.dict(from: 123)
        XCTAssertTrue(result.isEmpty)
    }

    // MARK: - list(from:)

    func testListExtractsFromEnvelope() {
        let body: Any = ["data": [["id": "1"], ["id": "2"]] as [[String: Any]]]
        let result = JSONHelpers.list(from: body)
        XCTAssertEqual(result.count, 2)
    }

    func testListExtractsFromRawArray() {
        let body: Any = [["id": "a"]] as [[String: Any]]
        let result = JSONHelpers.list(from: body)
        XCTAssertEqual(result.count, 1)
    }

    func testListReturnsEmptyForNil() {
        let result = JSONHelpers.list(from: nil)
        XCTAssertTrue(result.isEmpty)
    }

    func testListReturnsEmptyForString() {
        let result = JSONHelpers.list(from: "string")
        XCTAssertTrue(result.isEmpty)
    }

    func testListReturnsEmptyForDictWithoutData() {
        let body: Any = ["items": [["id": "1"]] as [[String: Any]]]
        let result = JSONHelpers.list(from: body)
        XCTAssertTrue(result.isEmpty)
    }

    // MARK: - Edge cases

    func testNestedDataStructure() {
        let body: Any = [
            "data": [
                ["id": "1", "nested": ["key": "val"] as [String: Any]] as [String: Any],
                ["id": "2", "tags": ["a", "b"]] as [String: Any],
            ] as [[String: Any]]
        ]
        let result = JSONHelpers.dataArray(from: body)
        XCTAssertEqual(result.count, 2)
        let nested = result[0]["nested"] as? [String: Any]
        XCTAssertEqual(nested?["key"] as? String, "val")
    }

    func testEmptyEnvelope() {
        let body: Any = [String: Any]()
        let result = JSONHelpers.dataArray(from: body)
        XCTAssertTrue(result.isEmpty)
        XCTAssertFalse(JSONHelpers.hasMore(from: body))
        XCTAssertTrue(JSONHelpers.dict(from: body).isEmpty)
    }

    func testBoolBody() {
        let result = JSONHelpers.dataArray(from: true)
        XCTAssertTrue(result.isEmpty)
    }
}
