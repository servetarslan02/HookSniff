import Foundation

/// Endpoints resource — manage webhook endpoints.
public final class EndpointsResource {
    private let client: HookSniff

    init(client: HookSniff) {
        self.client = client
    }

    // MARK: - List

    /// List all endpoints (first page, default limit).
    public func list() async throws -> [[String: Any]] {
        let body = try await client.requestJSON(method: "GET", path: "/v1/endpoints")
        return extractDataArray(from: body)
    }

    /// List endpoints with explicit pagination.
    public func list(limit: Int, offset: Int) async throws -> Pagination.Page<[String: Any]> {
        let path = "/v1/endpoints?limit=\(limit)&offset=\(offset)"
        let body = try await client.requestJSON(method: "GET", path: path)
        let data = extractDataArray(from: body)
        let hasMore = extractHasMore(from: body)
        return Pagination.Page(data: data, hasMore: hasMore)
    }

    /// Collect all endpoints across all pages.
    public func listAll(limit: Int = Pagination.defaultLimit) async throws -> [[String: Any]] {
        return try await Pagination.collectAll(limit: limit) { l, o in
            try await self.list(limit: l, offset: o)
        }
    }

    // MARK: - CRUD

    /// Get a single endpoint by ID.
    public func get(_ endpointId: String) async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "GET", path: "/v1/endpoints/\(endpointId)")
        return (body as? [String: Any]) ?? [:]
    }

    /// Create a new endpoint.
    public func create(_ params: [String: Any]) async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "POST", path: "/v1/endpoints", body: params)
        return (body as? [String: Any]) ?? [:]
    }

    /// Update an endpoint.
    public func update(_ endpointId: String, params: [String: Any]) async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "PUT", path: "/v1/endpoints/\(endpointId)", body: params)
        return (body as? [String: Any]) ?? [:]
    }

    /// Delete an endpoint.
    public func delete(_ endpointId: String) async throws {
        _ = try await client.request(method: "DELETE", path: "/v1/endpoints/\(endpointId)")
    }

    /// Rotate the signing secret for an endpoint.
    public func rotateSecret(_ endpointId: String) async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "POST", path: "/v1/endpoints/\(endpointId)/rotate-secret")
        return (body as? [String: Any]) ?? [:]
    }

    // MARK: - Helpers

    private func extractDataArray(from body: Any?) -> [[String: Any]] {
        if let dict = body as? [String: Any], let data = dict["data"] as? [[String: Any]] {
            return data
        }
        if let arr = body as? [[String: Any]] {
            return arr
        }
        return []
    }

    private func extractHasMore(from body: Any?) -> Bool {
        if let dict = body as? [String: Any], let hasMore = dict["has_more"] as? Bool {
            return hasMore
        }
        return false
    }
}
