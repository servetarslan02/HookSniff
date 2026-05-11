import Foundation

/// Alerts resource — manage alert rules and notifications.
public final class AlertsResource {
    private let client: HookSniff

    init(client: HookSniff) {
        self.client = client
    }

    /// List alert rules.
    public func listRules() async throws -> [[String: Any]] {
        let body = try await client.requestJSON(method: "GET", path: "/v1/alerts/rules")
        return JSONHelpers.dataArray(from: body)
    }

    /// Create an alert rule.
    public func createRule(_ params: [String: Any]) async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "POST", path: "/v1/alerts/rules", body: params)
        return JSONHelpers.dict(from: body)
    }
}
