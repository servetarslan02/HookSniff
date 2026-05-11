import Foundation

/// ApiKeys resource — manage API keys.
public final class ApiKeysResource {
    private let client: HookSniff

    init(client: HookSniff) {
        self.client = client
    }

    /// List API keys.
    public func list() async throws -> [[String: Any]] {
        let body = try await client.requestJSON(method: "GET", path: "/v1/api-keys")
        return JSONHelpers.list(from: body)
    }

    /// Create a new API key.
    public func create(name: String? = nil) async throws -> [String: Any] {
        var params: [String: Any] = [:]
        if let name = name { params["name"] = name }
        let body = try await client.requestJSON(method: "POST", path: "/v1/api-keys", body: params.isEmpty ? nil : params)
        return JSONHelpers.dict(from: body)
    }

    /// Revoke an API key.
    public func revoke(_ keyId: String) async throws {
        _ = try await client.request(method: "DELETE", path: "/v1/api-keys/\(keyId)")
    }
}
