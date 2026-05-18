import Foundation

/// Billing resource — subscriptions, invoices, portal, upgrade.
public final class BillingResource {
    private let client: HookSniff

    init(client: HookSniff) {
        self.client = client
    }

    /// Get current subscription.
    public func getSubscription() async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "GET", path: "/v1/billing/subscription")
        return JSONHelpers.dict(from: body)
    }

    /// List invoices.
    public func listInvoices() async throws -> [[String: Any]] {
        let body = try await client.requestJSON(method: "GET", path: "/v1/billing/invoices")
        return JSONHelpers.dataArray(from: body)
    }

    /// Upgrade subscription.
    public func upgrade(_ params: [String: Any]) async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "POST", path: "/v1/billing/upgrade", body: params)
        return JSONHelpers.dict(from: body)
    }

    /// Open customer billing portal.
    public func portal() async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "POST", path: "/v1/billing/portal")
        return JSONHelpers.dict(from: body)
    }
}
