import XCTest
@testable import HookSniff

// MARK: - TeamsResource Tests

final class TeamsResourceTests: XCTestCase {

    private var mock: MockHookSniff!
    private var resource: TeamsResource!

    override func setUp() {
        super.setUp()
        mock = MockHookSniff()
        resource = TeamsResource(client: mock)
    }

    // MARK: 1. members() sends GET to /v1/teams/members

    func testMembersSendsGET() async throws {
        mock.stubbedResponse = [["id": "mem_1", "email": "a@b.com"]]
        _ = try await resource.members()

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertEqual(mock.requests[0].path, "/v1/teams/members")
    }

    // MARK: 2. invite() sends POST

    func testInviteSendsPOST() async throws {
        let params: [String: Any] = ["email": "new@member.com", "role": "admin"]
        _ = try await resource.invite(params)

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "POST")
        XCTAssertEqual(mock.requests[0].path, "/v1/teams/invite")
        XCTAssertEqual(mock.requests[0].body?["email"] as? String, "new@member.com")
    }

    // MARK: 3. removeMember() sends DELETE

    func testRemoveMemberSendsDELETE() async throws {
        _ = try await resource.removeMember("mem_xyz")

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "DELETE")
        XCTAssertEqual(mock.requests[0].path, "/v1/teams/members/mem_xyz")
    }
}
