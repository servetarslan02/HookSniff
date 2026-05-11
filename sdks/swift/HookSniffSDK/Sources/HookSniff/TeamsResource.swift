import Foundation

/// Teams resource — manage teams and members.
public final class TeamsResource {
    private let client: HookSniff

    init(client: HookSniff) {
        self.client = client
    }

    // MARK: - List

    /// List teams (first page, default limit).
    public func list() async throws -> [[String: Any]] {
        let body = try await client.requestJSON(method: "GET", path: "/v1/teams")
        return JSONHelpers.dataArray(from: body)
    }

    /// List teams with explicit pagination.
    public func list(limit: Int, offset: Int) async throws -> Pagination.Page<[String: Any]> {
        let path = "/v1/teams?limit=\(limit)&offset=\(offset)"
        let body = try await client.requestJSON(method: "GET", path: path)
        return Pagination.Page(
            data: JSONHelpers.dataArray(from: body),
            hasMore: JSONHelpers.hasMore(from: body)
        )
    }

    /// Collect all teams across all pages.
    public func listAll(limit: Int = Pagination.defaultLimit) async throws -> [[String: Any]] {
        return try await Pagination.collectAll(limit: limit) { l, o in
            try await self.list(limit: l, offset: o)
        }
    }

    // MARK: - CRUD

    /// Get team details.
    public func get(_ teamId: String) async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "GET", path: "/v1/teams/\(teamId)")
        return JSONHelpers.dict(from: body)
    }
}
