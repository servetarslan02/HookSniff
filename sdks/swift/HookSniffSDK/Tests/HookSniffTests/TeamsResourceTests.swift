import XCTest
@testable import HookSniff

final class TeamsResourceTests: XCTestCase {

    private var mock: MockHookSniff!
    private var resource: TeamsResource!

    override func setUp() {
        super.setUp()
        mock = MockHookSniff()
        resource = TeamsResource(client: mock)
    }

    // MARK: - 1. members() sends GET to /v1/teams/members

    func testMembersSendsGet() async throws {
        mock.stubbedBody = [
            ["id": "mem_1", "email": "alice@example.com", "role": "admin"],
            ["id": "mem_2", "email": "bob@example.com", "role": "member"]
        ] as [[String: Any]]

        let result = try await resource.members()

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertEqual(mock.requests[0].path, "/v1/teams/members")
        XCTAssertNil(mock.requests[0].body)
        XCTAssertEqual(result.count, 2)
        XCTAssertEqual(result[0]["email"] as? String, "alice@example.com")
    }

    // MARK: - 2. invite() sends POST with body

    func testInviteSendsPost() async throws {
        let params: [String: Any] = [
            "email": "newuser@example.com",
            "role": "member"
        ]
        mock.stubbedBody = ["id": "inv_1", "email": "newuser@example.com", "status": "pending"] as [String: Any]

        let result = try await resource.invite(params)

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "POST")
        XCTAssertEqual(mock.requests[0].path, "/v1/teams/invite")
        XCTAssertNotNil(mock.requests[0].body)
        XCTAssertEqual(mock.requests[0].body?["email"] as? String, "newuser@example.com")
        XCTAssertEqual(result["status"] as? String, "pending")
    }

    // MARK: - 3. removeMember() sends DELETE

    func testRemoveMemberSendsDelete() async throws {
        try await resource.removeMember("mem_xyz")

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "DELETE")
        XCTAssertEqual(mock.requests[0].path, "/v1/teams/members/mem_xyz")
        XCTAssertNil(mock.requests[0].body)
    }
}
