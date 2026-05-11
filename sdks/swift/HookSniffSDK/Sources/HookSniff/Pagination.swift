import Foundation

/// Pagination utility for collecting all items across multiple API pages.
public enum Pagination {
    public static let defaultLimit = 50
    public static let maxPages = 100

    public struct Page<T> {
        public let data: [T]
        public let hasMore: Bool

        public init(data: [T], hasMore: Bool) {
            self.data = data
            self.hasMore = hasMore
        }
    }

    /// Collect all items by repeatedly calling `fetchPage` until exhausted.
    ///
    /// - Parameters:
    ///   - limit: Number of items per page.
    ///   - fetchPage: Closure that fetches a page given (limit, offset).
    /// - Returns: All collected items.
    public static func collectAll<T>(
        limit: Int = defaultLimit,
        fetchPage: @escaping (Int, Int) async throws -> Page<T>
    ) async throws -> [T] {
        var all: [T] = []
        var offset = 0
        var pages = 0

        while pages < maxPages {
            let page = try await fetchPage(limit, offset)
            if page.data.isEmpty { break }
            all.append(contentsOf: page.data)
            if !page.hasMore { break }
            offset += page.data.count
            pages += 1
        }

        return all
    }
}
