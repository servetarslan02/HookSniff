import XCTest
@testable import HookSniff

final class PaginationTests: XCTestCase {

    // MARK: - 1. Single page returns all items

    func testCollectAllSinglePage() async throws {
        let items = ["a", "b", "c"]
        let page = Pagination.Page(data: items, hasMore: false)

        let result = try await Pagination.collectAll { limit, offset in
            return page
        }

        XCTAssertEqual(result, items)
    }

    // MARK: - 2. Multiple pages collects all items

    func testCollectAllMultiplePages() async throws {
        let pages: [Pagination.Page<Int>] = [
            Pagination.Page(data: [1, 2], hasMore: true),
            Pagination.Page(data: [3, 4], hasMore: true),
            Pagination.Page(data: [5], hasMore: false),
        ]

        var callCount = 0
        let result = try await Pagination.collectAll(limit: 2) { limit, offset in
            let page = pages[callCount]
            callCount += 1
            return page
        }

        XCTAssertEqual(result, [1, 2, 3, 4, 5])
    }

    // MARK: - 3. Empty result returns empty array

    func testCollectAllEmptyResult() async throws {
        let result: [String] = try await Pagination.collectAll { _, _ in
            return Pagination.Page(data: [], hasMore: false)
        }

        XCTAssertTrue(result.isEmpty)
    }

    // MARK: - 4. Passes limit to fetch closure

    func testCollectAllPassesLimit() async throws {
        var receivedLimit = 0

        let _: [Int] = try await Pagination.collectAll(limit: 25) { limit, _ in
            receivedLimit = limit
            return Pagination.Page(data: [1], hasMore: false)
        }

        XCTAssertEqual(receivedLimit, 25)
    }

    // MARK: - 5. Tracks offset correctly

    func testCollectAllTracksOffset() async throws {
        let pages: [Pagination.Page<Int>] = [
            Pagination.Page(data: [1, 2], hasMore: true),
            Pagination.Page(data: [3, 4], hasMore: true),
            Pagination.Page(data: [5], hasMore: false),
        ]

        var receivedOffsets: [Int] = []
        var callCount = 0

        let _ = try await Pagination.collectAll(limit: 2) { _, offset in
            receivedOffsets.append(offset)
            let page = pages[callCount]
            callCount += 1
            return page
        }

        XCTAssertEqual(receivedOffsets, [0, 2, 4])
    }

    // MARK: - 6. Stops on empty data even with hasMore true

    func testCollectAllStopsOnEmptyDataEvenWithHasMore() async throws {
        let result: [Int] = try await Pagination.collectAll { _, _ in
            return Pagination.Page(data: [], hasMore: true)
        }

        XCTAssertTrue(result.isEmpty)
    }

    // MARK: - 7. Default limit is 50

    func testDefaultLimitIs50() {
        XCTAssertEqual(Pagination.defaultLimit, 50)
    }

    // MARK: - 8. Max pages is 100

    func testMaxPagesIs100() {
        XCTAssertEqual(Pagination.maxPages, 100)
    }

    // MARK: - 9. Stops at max pages

    func testCollectAllStopsAtMaxPages() async throws {
        var pageCount = 0

        let result: [Int] = try await Pagination.collectAll(limit: 1) { _, _ in
            pageCount += 1
            return Pagination.Page(data: [pageCount], hasMore: true)
        }

        XCTAssertEqual(result.count, 100)
        XCTAssertEqual(pageCount, 100)
    }

    // MARK: - 10. Custom limit

    func testCollectAllCustomLimit() async throws {
        var receivedLimits: [Int] = []
        var callCount = 0

        let result: [Int] = try await Pagination.collectAll(limit: 10) { limit, _ in
            receivedLimits.append(limit)
            callCount += 1
            return Pagination.Page(data: [callCount], hasMore: callCount < 3)
        }

        XCTAssertEqual(result.count, 3)
        XCTAssertTrue(receivedLimits.allSatisfy { $0 == 10 })
    }

    // MARK: - 11. Error propagation from fetch closure

    func testCollectAllPropagatesError() async {
        struct FetchError: Error {}

        do {
            let _: [String] = try await Pagination.collectAll { _, _ in
                throw FetchError()
            }
            XCTFail("Expected error to be thrown")
        } catch {
            XCTAssertTrue(error is FetchError)
        }
    }

    // MARK: - 12. Single item across single page

    func testCollectAllSingleItem() async throws {
        let result: [String] = try await Pagination.collectAll { _, _ in
            return Pagination.Page(data: ["only"], hasMore: false)
        }

        XCTAssertEqual(result, ["only"])
    }
}
