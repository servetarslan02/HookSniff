import Foundation

/// Analytics resource — delivery stats and trends.
public final class AnalyticsResource {
    private let client: HookSniff

    init(client: HookSniff) {
        self.client = client
    }

    /// Get delivery trends.
    public func deliveryTrends(endpointId: String? = nil) async throws -> [String: Any] {
        var path = "/v1/analytics/delivery-trends"
        if let id = endpointId { path += "?endpoint_id=\(id)" }
        let body = try await client.requestJSON(method: "GET", path: path)
        return JSONHelpers.dict(from: body)
    }

    /// Get latency trends.
    public func latencyTrends(endpointId: String? = nil) async throws -> [String: Any] {
        var path = "/v1/analytics/latency-trends"
        if let id = endpointId { path += "?endpoint_id=\(id)" }
        let body = try await client.requestJSON(method: "GET", path: path)
        return JSONHelpers.dict(from: body)
    }

    /// Get success rate.
    public func successRate(endpointId: String? = nil) async throws -> [String: Any] {
        var path = "/v1/analytics/success-rate"
        if let id = endpointId { path += "?endpoint_id=\(id)" }
        let body = try await client.requestJSON(method: "GET", path: path)
        return JSONHelpers.dict(from: body)
    }
}
