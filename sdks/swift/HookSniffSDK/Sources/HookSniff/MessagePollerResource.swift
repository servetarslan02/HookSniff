import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

public class MessagePollerResource {
    private let client: HookSniff
    init(client: HookSniff) { self.client = client }

    /// Poll for new messages since the consumer's cursor.
    public func poll(
        consumerId: String,
        limit: Int? = nil,
        endpointId: String? = nil,
        eventType: String? = nil,
        includePayload: Bool = true
    ) async throws -> [String: Any] {
        var params = ["consumer_id": consumerId, "include_payload": "\(includePayload)"]
        if let l = limit { params["limit"] = "\(l)" }
        if let ep = endpointId { params["endpoint_id"] = ep }
        if let et = eventType { params["event_type"] = et }
        let query = params.map { "\($0.key)=\($0.value)" }.joined(separator: "&")
        return try await client.request(method: "GET", path: "/api/v1/message-poller/poll?\(query)")
    }

    /// Seek cursor to a specific message.
    public func seek(
        consumerId: String,
        messageId: String,
        endpointId: String? = nil
    ) async throws -> [String: Any] {
        var body: [String: Any] = [
            "consumer_id": consumerId,
            "message_id": messageId,
        ]
        if let ep = endpointId { body["endpoint_id"] = ep }
        return try await client.request(method: "POST", path: "/api/v1/message-poller/seek", body: body)
    }

    /// Commit cursor — advance past a processed message.
    public func commit(
        consumerId: String,
        messageId: String,
        endpointId: String? = nil
    ) async throws -> [String: Any] {
        var body: [String: Any] = [
            "consumer_id": consumerId,
            "message_id": messageId,
        ]
        if let ep = endpointId { body["endpoint_id"] = ep }
        return try await client.request(method: "POST", path: "/api/v1/message-poller/commit", body: body)
    }
}
