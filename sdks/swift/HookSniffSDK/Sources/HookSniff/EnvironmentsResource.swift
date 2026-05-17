import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

/// Manage environments (dev/staging/prod) and their variables.
public class EnvironmentsResource {
    private let client: HookSniff

    init(client: HookSniff) {
        self.client = client
    }

    /// List all environments for the authenticated customer.
    public func list() async throws -> [[String: Any]] {
        return try await client.request(method: "GET", path: "/api/v1/environments")
    }

    /// Create a new environment.
    public func create(_ body: [String: Any]) async throws -> [String: Any] {
        return try await client.request(method: "POST", path: "/api/v1/environments", body: body)
    }

    /// Get an environment by ID.
    public func get(_ environmentId: String) async throws -> [String: Any] {
        return try await client.request(method: "GET", path: "/api/v1/environments/\(environmentId)")
    }

    /// Update an environment.
    public func update(_ environmentId: String, _ body: [String: Any]) async throws -> [String: Any] {
        return try await client.request(method: "PUT", path: "/api/v1/environments/\(environmentId)", body: body)
    }

    /// Delete an environment.
    public func delete(_ environmentId: String) async throws {
        try await client.requestVoid(method: "DELETE", path: "/api/v1/environments/\(environmentId)")
    }

    /// List all variables in an environment.
    public func listVariables(_ environmentId: String) async throws -> [[String: Any]] {
        return try await client.request(method: "GET", path: "/api/v1/environments/\(environmentId)/variables")
    }

    /// Get a single variable.
    public func getVariable(_ environmentId: String, _ variableId: String) async throws -> [String: Any] {
        return try await client.request(method: "GET", path: "/api/v1/environments/\(environmentId)/variables/\(variableId)")
    }

    /// Create a variable in an environment.
    public func createVariable(_ environmentId: String, _ body: [String: Any]) async throws -> [String: Any] {
        return try await client.request(method: "POST", path: "/api/v1/environments/\(environmentId)/variables", body: body)
    }

    /// Update a variable.
    public func updateVariable(_ environmentId: String, _ variableId: String, _ body: [String: Any]) async throws -> [String: Any] {
        return try await client.request(method: "PUT", path: "/api/v1/environments/\(environmentId)/variables/\(variableId)", body: body)
    }

    /// Delete a variable.
    public func deleteVariable(_ environmentId: String, _ variableId: String) async throws {
        try await client.requestVoid(method: "DELETE", path: "/api/v1/environments/\(environmentId)/variables/\(variableId)")
    }

    /// Bulk upsert variables (create or update multiple at once).
    public func bulkUpsertVariables(_ environmentId: String, _ body: [String: Any]) async throws -> [[String: Any]] {
        return try await client.request(method: "POST", path: "/api/v1/environments/\(environmentId)/variables/bulk", body: body)
    }
}
