using HookSniff.Model;

namespace HookSniff.Resources;

/// <summary>
/// Billing resource — plan, invoices, portal, upgrade.
/// </summary>
public class Billing
{
    private readonly RequestContext _ctx;

    internal Billing(RequestContext ctx) => _ctx = ctx;

    /// <summary>Get current plan info.</summary>
    public async Task<SubscriptionResponse> GetPlanAsync()
    {
        var req = new Request("GET", "/v1/billing/plan");
        return (await req.SendAsync<SubscriptionResponse>(_ctx))!;
    }

    /// <summary>List invoices.</summary>
    public async Task<List<InvoiceResponse>> ListInvoicesAsync()
    {
        var req = new Request("GET", "/v1/billing/invoices");
        var resp = await req.SendAsync<InvoiceListResponse>(_ctx);
        return resp?.Data ?? new List<InvoiceResponse>();
    }

    /// <summary>Upgrade subscription.</summary>
    public async Task<object> UpgradeAsync(object body)
    {
        var req = new Request("POST", "/v1/billing/upgrade");
        req.SetBody(body);
        return (await req.SendAsync<object>(_ctx))!;
    }

    /// <summary>Open customer billing portal.</summary>
    public async Task<BillingPortalResponse> PortalAsync()
    {
        var req = new Request("POST", "/v1/billing/portal");
        return (await req.SendAsync<BillingPortalResponse>(_ctx))!;
    }
}
