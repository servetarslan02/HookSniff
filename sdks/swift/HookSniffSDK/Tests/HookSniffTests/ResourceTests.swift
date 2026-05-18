import XCTest
@testable import HookSniff

/// Tests for AuthResource, AnalyticsResource, ApiKeysResource, AlertsResource,
/// BillingResource, HealthResource, and SearchResource.
final class ResourceTests: XCTestCase {

    private var mock: MockHookSniff!

    override func setUp() {
        super.setUp()
        mock = MockHookSniff()
    }

    // MARK: - AuthResource

    func testAuthLoginSendsPost() async throws {
        mock.stubbedBody = ["token": "jwt_abc", "user": ["id": "u_1"]] as [String: Any]
        let resource = AuthResource(client: mock)

        let result = try await resource.login(email: "test@example.com", password: "secret123")

        XCTAssertEqual(mock.requests.count, 1)
        XCTAssertEqual(mock.requests[0].method, "POST")
        XCTAssertEqual(mock.requests[0].path, "/v1/auth/login")
        XCTAssertEqual(mock.requests[0].body?["email"] as? String, "test@example.com")
        XCTAssertEqual(mock.requests[0].body?["password"] as? String, "secret123")
        XCTAssertEqual(result["token"] as? String, "jwt_abc")
    }

    func testAuthRegisterSendsPost() async throws {
        mock.stubbedBody = ["id": "u_new", "email": "new@example.com"] as [String: Any]
        let resource = AuthResource(client: mock)

        let result = try await resource.register(email: "new@example.com", password: "pass123", name: "Alice")

        XCTAssertEqual(mock.requests[0].method, "POST")
        XCTAssertEqual(mock.requests[0].path, "/v1/auth/register")
        XCTAssertEqual(mock.requests[0].body?["email"] as? String, "new@example.com")
        XCTAssertEqual(mock.requests[0].body?["password"] as? String, "pass123")
        XCTAssertEqual(mock.requests[0].body?["name"] as? String, "Alice")
        XCTAssertEqual(result["id"] as? String, "u_new")
    }

    func testAuthRegisterWithoutName() async throws {
        mock.stubbedBody = ["id": "u_new"] as [String: Any]
        let resource = AuthResource(client: mock)

        _ = try await resource.register(email: "no-name@example.com", password: "pass123")

        XCTAssertNil(mock.requests[0].body?["name"])
        XCTAssertEqual(mock.requests[0].body?["email"] as? String, "no-name@example.com")
    }

    func testAuthChangePasswordSendsPost() async throws {
        mock.stubbedBody = ["status": "ok"] as [String: Any]
        let resource = AuthResource(client: mock)

        try await resource.changePassword(currentPassword: "old123", newPassword: "new456")

        XCTAssertEqual(mock.requests[0].method, "POST")
        XCTAssertEqual(mock.requests[0].path, "/v1/auth/change-password")
        XCTAssertEqual(mock.requests[0].body?["current_password"] as? String, "old123")
        XCTAssertEqual(mock.requests[0].body?["new_password"] as? String, "new456")
    }

    // MARK: - AnalyticsResource

    func testAnalyticsTrendsSendsGet() async throws {
        mock.stubbedBody = ["deliveries": 100, "success_rate": 0.95] as [String: Any]
        let resource = AnalyticsResource(client: mock)

        let result = try await resource.trends()

        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertEqual(mock.requests[0].path, "/v1/analytics/deliveries")
        XCTAssertNil(mock.requests[0].body)
        XCTAssertEqual(result["deliveries"] as? Int, 100)
    }

    func testAnalyticsTrendsWithDateRange() async throws {
        mock.stubbedBody = ["deliveries": 50] as [String: Any]
        let resource = AnalyticsResource(client: mock)

        _ = try await resource.trends(since: "2024-01-01", until: "2024-01-31")

        let path = mock.requests[0].path
        XCTAssertTrue(path.contains("since=2024-01-01"))
        XCTAssertTrue(path.contains("until=2024-01-31"))
    }

    func testAnalyticsTrendsWithOnlySince() async throws {
        mock.stubbedBody = ["deliveries": 50] as [String: Any]
        let resource = AnalyticsResource(client: mock)

        _ = try await resource.trends(since: "2024-01-01")

        XCTAssertTrue(mock.requests[0].path.contains("since=2024-01-01"))
        XCTAssertFalse(mock.requests[0].path.contains("until"))
    }

    func testAnalyticsSuccessRateSendsGet() async throws {
        mock.stubbedBody = ["rate": 0.98] as [String: Any]
        let resource = AnalyticsResource(client: mock)

        let result = try await resource.successRate()

        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertEqual(mock.requests[0].path, "/v1/analytics/success-rate")
        XCTAssertEqual(result["rate"] as? Double, 0.98)
    }

    func testAnalyticsLatencySendsGet() async throws {
        mock.stubbedBody = ["avg_ms": 150, "p99_ms": 500] as [String: Any]
        let resource = AnalyticsResource(client: mock)

        let result = try await resource.latency()

        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertEqual(mock.requests[0].path, "/v1/analytics/latency")
        XCTAssertEqual(result["avg_ms"] as? Int, 150)
    }

    // MARK: - ApiKeysResource

    func testApiKeysListSendsGet() async throws {
        mock.stubbedBody = [
            ["id": "key_1", "name": "Production"],
            ["id": "key_2", "name": "Development"],
        ] as [[String: Any]]
        let resource = ApiKeysResource(client: mock)

        let result = try await resource.list()

        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertEqual(mock.requests[0].path, "/v1/api-keys")
        XCTAssertEqual(result.count, 2)
        XCTAssertEqual(result[0]["name"] as? String, "Production")
    }

    func testApiKeysCreateWithName() async throws {
        mock.stubbedBody = ["id": "key_new", "name": "Staging", "key": "sk_live_abc"] as [String: Any]
        let resource = ApiKeysResource(client: mock)

        let result = try await resource.create(name: "Staging")

        XCTAssertEqual(mock.requests[0].method, "POST")
        XCTAssertEqual(mock.requests[0].path, "/v1/api-keys")
        XCTAssertEqual(mock.requests[0].body?["name"] as? String, "Staging")
        XCTAssertEqual(result["key"] as? String, "sk_live_abc")
    }

    func testApiKeysCreateWithoutName() async throws {
        mock.stubbedBody = ["id": "key_new", "key": "sk_live_xyz"] as [String: Any]
        let resource = ApiKeysResource(client: mock)

        _ = try await resource.create()

        // When name is nil, body should be nil
        XCTAssertNil(mock.requests[0].body)
    }

    func testApiKeysRevokeSendsDelete() async throws {
        mock.stubbedBody = ["status": "revoked"] as [String: Any]
        let resource = ApiKeysResource(client: mock)

        try await resource.revoke("key_to_revoke")

        XCTAssertEqual(mock.requests[0].method, "DELETE")
        XCTAssertEqual(mock.requests[0].path, "/v1/api-keys/key_to_revoke")
    }

    // MARK: - AlertsResource

    func testAlertsListRulesSendsGet() async throws {
        mock.stubbedBody = [
            ["id": "rule_1", "name": "High failure rate"],
        ] as [[String: Any]]
        let resource = AlertsResource(client: mock)

        let result = try await resource.listRules()

        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertEqual(mock.requests[0].path, "/v1/alerts/rules")
        XCTAssertEqual(result.count, 1)
        XCTAssertEqual(result[0]["name"] as? String, "High failure rate")
    }

    func testAlertsCreateRuleSendsPost() async throws {
        mock.stubbedBody = ["id": "rule_new", "name": "New rule"] as [String: Any]
        let resource = AlertsResource(client: mock)

        let params: [String: Any] = ["name": "New rule", "threshold": 0.9]
        let result = try await resource.createRule(params)

        XCTAssertEqual(mock.requests[0].method, "POST")
        XCTAssertEqual(mock.requests[0].path, "/v1/alerts/rules")
        XCTAssertEqual(mock.requests[0].body?["name"] as? String, "New rule")
        XCTAssertEqual(result["id"] as? String, "rule_new")
    }

    // MARK: - BillingResource

    func testBillingGetSubscriptionSendsGet() async throws {
        mock.stubbedBody = ["plan": "pro", "status": "active"] as [String: Any]
        let resource = BillingResource(client: mock)

        let result = try await resource.getSubscription()

        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertEqual(mock.requests[0].path, "/v1/billing/subscription")
        XCTAssertEqual(result["plan"] as? String, "pro")
    }

    func testBillingListInvoicesSendsGet() async throws {
        mock.stubbedBody = [
            ["id": "inv_1", "amount": 2900],
            ["id": "inv_2", "amount": 2900],
        ] as [[String: Any]]
        let resource = BillingResource(client: mock)

        let result = try await resource.listInvoices()

        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertEqual(mock.requests[0].path, "/v1/billing/invoices")
        XCTAssertEqual(result.count, 2)
    }

    func testBillingUpgradeSendsPost() async throws {
        mock.stubbedBody = ["status": "upgraded", "plan": "enterprise"] as [String: Any]
        let resource = BillingResource(client: mock)

        let params: [String: Any] = ["plan": "enterprise"]
        let result = try await resource.upgrade(params)

        XCTAssertEqual(mock.requests[0].method, "POST")
        XCTAssertEqual(mock.requests[0].path, "/v1/billing/upgrade")
        XCTAssertEqual(mock.requests[0].body?["plan"] as? String, "enterprise")
        XCTAssertEqual(result["status"] as? String, "upgraded")
    }

    func testBillingPortalSendsPost() async throws {
        mock.stubbedBody = ["url": "https://billing.stripe.com/session_123"] as [String: Any]
        let resource = BillingResource(client: mock)

        let result = try await resource.portal()

        XCTAssertEqual(mock.requests[0].method, "POST")
        XCTAssertEqual(mock.requests[0].path, "/v1/billing/portal")
        XCTAssertNil(mock.requests[0].body)
        XCTAssertEqual(result["url"] as? String, "https://billing.stripe.com/session_123")
    }

    // MARK: - HealthResource

    func testHealthGetStatusSendsGet() async throws {
        mock.stubbedBody = ["status": "healthy", "uptime": 99.99] as [String: Any]
        let resource = HealthResource(client: mock)

        let result = try await resource.getStatus()

        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertEqual(mock.requests[0].path, "/health")
        XCTAssertNil(mock.requests[0].body)
        XCTAssertEqual(result["status"] as? String, "healthy")
    }

    // MARK: - SearchResource

    func testSearchSendsGetWithQuery() async throws {
        mock.stubbedBody = ["results": [["id": "d_1"]], "total": 1] as [String: Any]
        let resource = SearchResource(client: mock)

        let result = try await resource.search(query: "order failed")

        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertTrue(mock.requests[0].path.hasPrefix("/v1/search?"))
        XCTAssertTrue(mock.requests[0].path.contains("q="))
        XCTAssertEqual(result["total"] as? Int, 1)
    }

    func testSearchWithLimit() async throws {
        mock.stubbedBody = ["results": [] as [[String: Any]], "total": 0] as [String: Any]
        let resource = SearchResource(client: mock)

        _ = try await resource.search(query: "test", limit: 5)

        XCTAssertTrue(mock.requests[0].path.contains("limit=5"))
    }

    func testSearchWithoutLimit() async throws {
        mock.stubbedBody = ["results": [] as [[String: Any]], "total": 0] as [String: Any]
        let resource = SearchResource(client: mock)

        _ = try await resource.search(query: "test")

        XCTAssertFalse(mock.requests[0].path.contains("limit="))
    }

    // MARK: - Edge cases

    func testResourceHandlesEmptyResponseBody() async throws {
        mock.stubbedBody = [:] as [String: Any]
        let resource = AuthResource(client: mock)

        let result = try await resource.login(email: "test@test.com", password: "pass")
        XCTAssertTrue(result.isEmpty)
    }

    func testResourceHandlesNilResponseBody() async throws {
        mock.stubbedBody = nil
        let resource = AuthResource(client: mock)

        let result = try await resource.login(email: "test@test.com", password: "pass")
        XCTAssertTrue(result.isEmpty)
    }

    func testResourceHandlesArrayResponseBody() async throws {
        // When stubbedBody is an array, dict(from:) returns empty dict
        mock.stubbedBody = [["id": "1"]] as [[String: Any]]
        let resource = HealthResource(client: mock)

        let result = try await resource.getStatus()
        XCTAssertTrue(result.isEmpty)
    }

    // MARK: - WebhooksResource additional tests

    func testWebhooksListSendsGet() async throws {
        mock.stubbedBody = ["data": [["id": "d_1"]] as [[String: Any]]] as [String: Any]
        let resource = WebhooksResource(client: mock)

        let result = try await resource.list()

        XCTAssertEqual(mock.requests[0].method, "GET")
        XCTAssertEqual(mock.requests[0].path, "/v1/webhooks")
        let data = result["data"] as? [[String: Any]]
        XCTAssertEqual(data?.first?["id"] as? String, "d_1")
    }

    func testWebhooksListWithPagination() async throws {
        mock.stubbedBody = ["data": [["id": "d_1"]]] as [String: Any]
        let resource = WebhooksResource(client: mock)

        _ = try await resource.list(limit: 10, offset: 5)

        XCTAssertEqual(mock.requests[0].path, "/v1/webhooks?limit=10&offset=5")
    }

    // MARK: - EndpointsResource additional tests

    func testEndpointsUpdateSendsPut() async throws {
        mock.stubbedBody = ["id": "ep_1", "url": "https://updated.com"] as [String: Any]
        let resource = EndpointsResource(client: mock)

        let params: [String: Any] = ["url": "https://updated.com"]
        let result = try await resource.update("ep_1", params: params)

        XCTAssertEqual(mock.requests[0].method, "PUT")
        XCTAssertEqual(mock.requests[0].path, "/v1/endpoints/ep_1")
        XCTAssertEqual(mock.requests[0].body?["url"] as? String, "https://updated.com")
        XCTAssertEqual(result["url"] as? String, "https://updated.com")
    }

    func testEndpointsListAllSinglePage() async throws {
        mock.stubbedBody = [
            "data": [["id": "ep_1"], ["id": "ep_2"]] as [[String: Any]],
            "has_more": false,
        ] as [String: Any]
        let resource = EndpointsResource(client: mock)

        let all = try await resource.listAll()

        XCTAssertEqual(all.count, 2)
        XCTAssertEqual(all[0]["id"] as? String, "ep_1")
    }

    func testEndpointsListAllMultiplePages() async throws {
        let page1: [String: Any] = [
            "data": [["id": "ep_1"]] as [[String: Any]],
            "has_more": true,
        ]
        let page2: [String: Any] = [
            "data": [["id": "ep_2"]] as [[String: Any]],
            "has_more": false,
        ]
        let seqMock = SequentialMockHookSniff(responses: [page1, page2])
        let resource = EndpointsResource(client: seqMock)

        let all = try await resource.listAll(limit: 1)

        XCTAssertEqual(all.count, 2)
        XCTAssertEqual(seqMock.requests.count, 2)
    }

    func testEndpointsListAllEmpty() async throws {
        mock.stubbedBody = [
            "data": [] as [[String: Any]],
            "has_more": false,
        ] as [String: Any]
        let resource = EndpointsResource(client: mock)

        let all = try await resource.listAll()

        XCTAssertTrue(all.isEmpty)
    }

    // MARK: - TeamsResource additional tests

    func testTeamsMembersReturnsArray() async throws {
        mock.stubbedBody = [
            ["id": "m_1", "email": "a@b.com"],
            ["id": "m_2", "email": "c@d.com"],
            ["id": "m_3", "email": "e@f.com"],
        ] as [[String: Any]]
        let resource = TeamsResource(client: mock)

        let members = try await resource.members()

        XCTAssertEqual(members.count, 3)
        XCTAssertEqual(members[2]["email"] as? String, "e@f.com")
    }

    func testTeamsMembersEmpty() async throws {
        mock.stubbedBody = [] as [[String: Any]]
        let resource = TeamsResource(client: mock)

        let members = try await resource.members()

        XCTAssertTrue(members.isEmpty)
    }
}
