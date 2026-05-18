import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

public class ConnectorResource {
    private let client: HookSniff
    init(client: HookSniff) { self.client = client }

    /// List available connectors.
    public func list() async throws -> [[String: Any]] {
        try await client.request(method: "GET", path: "/api/v1/connectors")
    }

    /// Get connector details.
    public func get(_ id: String) async throws -> [String: Any] {
        try await client.request(method: "GET", path: "/api/v1/connectors/\(id)")
    }

    /// List customer's connector configs.
    public func listConfigs() async throws -> [[String: Any]] {
        try await client.request(method: "GET", path: "/api/v1/connectors/configs")
    }

    /// Create connector config.
    public func createConfig(_ body: [String: Any]) async throws -> [String: Any] {
        try await client.request(method: "POST", path: "/api/v1/connectors/configs", body: body)
    }

    /// Update connector config.
    public func updateConfig(_ id: String, _ body: [String: Any]) async throws -> [String: Any] {
        try await client.request(method: "PUT", path: "/api/v1/connectors/configs/\(id)", body: body)
    }

    /// Delete connector config.
    public func deleteConfig(_ id: String) async throws {
        try await client.requestVoid(method: "DELETE", path: "/api/v1/connectors/configs/\(id)")
    }
}
