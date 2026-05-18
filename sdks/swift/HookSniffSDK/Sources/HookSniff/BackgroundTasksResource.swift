import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

/// Manage background tasks (async operations like bulk replay).
public class BackgroundTasksResource {
    private let client: HookSniff

    init(client: HookSniff) {
        self.client = client
    }

    /// List all background tasks for the authenticated customer.
    public func list() async throws -> [[String: Any]] {
        return try await client.request(method: "GET", path: "/api/v1/background-tasks")
    }

    /// Get a background task by ID.
    public func get(_ taskId: String) async throws -> [String: Any] {
        return try await client.request(method: "GET", path: "/api/v1/background-tasks/\(taskId)")
    }

    /// Cancel a pending or running background task.
    public func cancel(_ taskId: String) async throws -> [String: Any] {
        return try await client.request(method: "PUT", path: "/api/v1/background-tasks/\(taskId)")
    }
}
