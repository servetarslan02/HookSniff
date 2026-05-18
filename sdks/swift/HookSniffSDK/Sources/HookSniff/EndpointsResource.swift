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
        return JSONHelpers.dataArray(from: body)
    }

    /// List endpoints with explicit pagination.
    public func list(limit: Int, offset: Int) async throws -> Pagination.Page<[String: Any]> {
        let path = "/v1/endpoints?limit=\(limit)&offset=\(offset)"
        let body = try await client.requestJSON(method: "GET", path: path)
        return Pagination.Page(
            data: JSONHelpers.dataArray(from: body),
            hasMore: JSONHelpers.hasMore(from: body)
        )
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
        return JSONHelpers.dict(from: body)
    }

    /// Create a new endpoint.
    public func create(_ params: [String: Any]) async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "POST", path: "/v1/endpoints", body: params)
        return JSONHelpers.dict(from: body)
    }

    /// Update an endpoint.
    public func update(_ endpointId: String, params: [String: Any]) async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "PUT", path: "/v1/endpoints/\(endpointId)", body: params)
        return JSONHelpers.dict(from: body)
    }

    /// Delete an endpoint.
    public func delete(_ endpointId: String) async throws {
        _ = try await client.request(method: "DELETE", path: "/v1/endpoints/\(endpointId)")
    }

    /// Rotate the signing secret for an endpoint.
    public func rotateSecret(_ endpointId: String) async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "POST", path: "/v1/endpoints/\(endpointId)/rotate-secret")
        return JSONHelpers.dict(from: body)
    }
}
