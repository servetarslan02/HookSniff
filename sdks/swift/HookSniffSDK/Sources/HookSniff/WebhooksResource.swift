import Foundation

/// Webhooks resource — send and test webhooks.
public final class WebhooksResource {
    private let client: HookSniff

    init(client: HookSniff) {
        self.client = client
    }

    /// Send a webhook event.
    public func send(_ params: [String: Any]) async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "POST", path: "/v1/webhooks/send", body: params)
        return JSONHelpers.dict(from: body)
    }

    /// Test a webhook endpoint.
    public func test(_ endpointId: String) async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "POST", path: "/v1/webhooks/test/\(endpointId)")
        return JSONHelpers.dict(from: body)
    }

    /// Batch send webhooks.
    public func batch(_ params: [String: Any]) async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "POST", path: "/v1/webhooks/batch", body: params)
        return JSONHelpers.dict(from: body)
    }
}
