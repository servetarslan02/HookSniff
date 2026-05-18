import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

public class InboundResource {
    private let client: HookSniff
    init(client: HookSniff) { self.client = client }

    /// List all inbound webhook configurations.
    public func listConfigs() async throws -> [[String: Any]] {
        try await client.request(method: "GET", path: "/api/v1/inbound/configs")
    }

    /// Create a new inbound webhook configuration.
    public func createConfig(_ body: [String: Any]) async throws -> [String: Any] {
        try await client.request(method: "POST", path: "/api/v1/inbound/configs", body: body)
    }

    /// Update an inbound webhook configuration.
    public func updateConfig(_ id: String, _ body: [String: Any]) async throws -> [String: Any] {
        try await client.request(method: "PUT", path: "/api/v1/inbound/configs/\(id)", body: body)
    }

    /// Delete an inbound webhook configuration.
    public func deleteConfig(_ id: String) async throws {
        try await client.requestVoid(method: "DELETE", path: "/api/v1/inbound/configs/\(id)")
    }
}
