using HookSniff.Model;

namespace HookSniff.Resources;

/// <summary>
/// Billing resource — subscriptions, invoices, portal.
/// </summary>
public class Billing
{
    private readonly RequestContext _ctx;

    internal Billing(RequestContext ctx) => _ctx = ctx;

    /// <summary>Get current subscription.</summary>
    public async Task<SubscriptionResponse> GetSubscriptionAsync()
    {
        var req = new Request("GET", "/v1/billing/subscription");
        return (await req.SendAsync<SubscriptionResponse>(_ctx))!;
    }

    /// <summary>List invoices.</summary>
    public async Task<List<InvoiceResponse>> ListInvoicesAsync()
    {
        var req = new Request("GET", "/v1/billing/invoices");
        var resp = await req.SendAsync<InvoiceListResponse>(_ctx);
        return resp?.Data ?? new List<InvoiceResponse>();
    }
}
