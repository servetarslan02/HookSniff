import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

public class IntegrationResource {
    private let client: HookSniff
    init(client: HookSniff) { self.client = client }

    /// List all integrations.
    public func list() async throws -> [[String: Any]] {
        try await client.request(method: "GET", path: "/api/v1/integrations")
    }

    /// Get integration details.
    public func get(_ id: String) async throws -> [String: Any] {
        try await client.request(method: "GET", path: "/api/v1/integrations/\(id)")
    }

    /// Create a new integration.
    public func create(_ body: [String: Any]) async throws -> [String: Any] {
        try await client.request(method: "POST", path: "/api/v1/integrations", body: body)
    }

    /// Update an integration.
    public func update(_ id: String, _ body: [String: Any]) async throws -> [String: Any] {
        try await client.request(method: "PUT", path: "/api/v1/integrations/\(id)", body: body)
    }

    /// Delete an integration.
    public func delete(_ id: String) async throws {
        try await client.requestVoid(method: "DELETE", path: "/api/v1/integrations/\(id)")
    }

    /// Send a test event.
    public func test(_ id: String) async throws -> [String: Any] {
        try await client.request(method: "POST", path: "/api/v1/integrations/\(id)/test")
    }

    /// List events for an integration.
    public func listEvents(_ id: String) async throws -> [[String: Any]] {
        try await client.request(method: "GET", path: "/api/v1/integrations/\(id)/events")
    }

    /// Get statistics for an integration.
    public func getStats(_ id: String) async throws -> [String: Any] {
        try await client.request(method: "GET", path: "/api/v1/integrations/\(id)/stats")
    }
}
