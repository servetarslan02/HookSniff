import Foundation

/// Analytics resource — delivery stats, trends, success rate, latency.
public final class AnalyticsResource {
    private let client: HookSniff

    init(client: HookSniff) {
        self.client = client
    }

    /// Get delivery trends.
    public func trends(since: String? = nil, until: String? = nil) async throws -> [String: Any] {
        var path = "/v1/analytics/deliveries"
        var params: [String] = []
        if let s = since { params.append("since=\(s)") }
        if let u = until { params.append("until=\(u)") }
        if !params.isEmpty { path += "?" + params.joined(separator: "&") }
        let body = try await client.requestJSON(method: "GET", path: path)
        return JSONHelpers.dict(from: body)
    }

    /// Get success rate.
    public func successRate() async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "GET", path: "/v1/analytics/success-rate")
        return JSONHelpers.dict(from: body)
    }

    /// Get latency stats.
    public func latency() async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "GET", path: "/v1/analytics/latency")
        return JSONHelpers.dict(from: body)
    }
}
