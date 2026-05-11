import Foundation

/// Webhooks resource — send, list, get, replay, and batch webhooks.
public final class WebhooksResource {
    private let client: HookSniff

    init(client: HookSniff) {
        self.client = client
    }

    /// Send a single webhook event.
    public func send(_ params: [String: Any]) async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "POST", path: "/v1/webhooks", body: params)
        return JSONHelpers.dict(from: body)
    }

    /// Send batch webhooks.
    public func batch(_ params: [String: Any]) async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "POST", path: "/v1/webhooks/batch", body: params)
        return JSONHelpers.dict(from: body)
    }

    /// List deliveries.
    public func list() async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "GET", path: "/v1/webhooks")
        return JSONHelpers.dict(from: body)
    }

    /// List deliveries with pagination.
    public func list(limit: Int, offset: Int) async throws -> [String: Any] {
        let path = "/v1/webhooks?limit=\(limit)&offset=\(offset)"
        let body = try await client.requestJSON(method: "GET", path: path)
        return JSONHelpers.dict(from: body)
    }

    /// Get a specific delivery by ID.
    public func get(_ id: String) async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "GET", path: "/v1/webhooks/\(id)")
        return JSONHelpers.dict(from: body)
    }

    /// Replay a delivery.
    public func replay(_ id: String) async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "POST", path: "/v1/webhooks/\(id)/replay")
        return JSONHelpers.dict(from: body)
    }
}
