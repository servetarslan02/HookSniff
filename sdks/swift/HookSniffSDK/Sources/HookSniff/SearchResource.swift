import Foundation

/// Search resource — search deliveries.
public final class SearchResource {
    private let client: HookSniff

    init(client: HookSniff) {
        self.client = client
    }

    /// Search deliveries by query string.
    public func search(query: String, limit: Int? = nil) async throws -> [String: Any] {
        var params = ["q=\(query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? query)"]
        if let l = limit { params.append("limit=\(l)") }
        let path = "/v1/search?" + params.joined(separator: "&")
        let body = try await client.requestJSON(method: "GET", path: path)
        return JSONHelpers.dict(from: body)
    }
}
