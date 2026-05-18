import Foundation

/// Health resource — system health and status.
public final class HealthResource {
    private let client: HookSniff

    init(client: HookSniff) {
        self.client = client
    }

    /// Get system health status.
    public func getStatus() async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "GET", path: "/health")
        return JSONHelpers.dict(from: body)
    }
}
