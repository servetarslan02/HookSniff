import Foundation

/// Billing resource — subscriptions, invoices, portal.
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
}
