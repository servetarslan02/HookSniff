import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

public class OperationalWebhooksResource {
    private let client: HookSniff
    init(client: HookSniff) { self.client = client }
    public func list() async throws -> [[String: Any]] { try await client.request(method: "GET", path: "/api/v1/operational-webhooks") }
    public func create(_ body: [String: Any]) async throws -> [String: Any] { try await client.request(method: "POST", path: "/api/v1/operational-webhooks", body: body) }
    public func get(_ id: String) async throws -> [String: Any] { try await client.request(method: "GET", path: "/api/v1/operational-webhooks/\(id)") }
    public func update(_ id: String, _ body: [String: Any]) async throws -> [String: Any] { try await client.request(method: "PUT", path: "/api/v1/operational-webhooks/\(id)", body: body) }
    public func delete(_ id: String) async throws { try await client.requestVoid(method: "DELETE", path: "/api/v1/operational-webhooks/\(id)") }
    public func listDeliveries(_ id: String) async throws -> [[String: Any]] { try await client.request(method: "GET", path: "/api/v1/operational-webhooks/\(id)/deliveries") }
}
