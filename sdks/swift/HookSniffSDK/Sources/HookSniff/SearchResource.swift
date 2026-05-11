import Foundation

/// Search resource — search deliveries and events.
public final class SearchResource {
    private let client: HookSniff

    init(client: HookSniff) {
        self.client = client
    }

    /// Search deliveries and events.
    public func search(_ params: [String: Any]) async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "POST", path: "/v1/search", body: params)
        return JSONHelpers.dict(from: body)
    }
}
