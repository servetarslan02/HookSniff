import Foundation

/// Teams resource — list members, invite, remove.
public final class TeamsResource {
    private let client: HookSniff

    init(client: HookSniff) {
        self.client = client
    }

    // MARK: - Members

    /// List team members. Returns bare array.
    public func members() async throws -> [[String: Any]] {
        let body = try await client.requestJSON(method: "GET", path: "/v1/teams/members")
        return JSONHelpers.dataArray(from: body)
    }

    /// Invite a team member.
    public func invite(_ params: [String: Any]) async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "POST", path: "/v1/teams/invite", body: params)
        return JSONHelpers.dict(from: body)
    }

    /// Remove a team member.
    public func removeMember(_ memberId: String) async throws {
        _ = try await client.request(method: "DELETE", path: "/v1/teams/members/\(memberId)")
    }
}
