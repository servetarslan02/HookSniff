using HookSniff.Model;

namespace HookSniff.Resources;

/// <summary>
/// Analytics resource — delivery trends, success rate, latency.
/// </summary>
public class Analytics
{
    private readonly RequestContext _ctx;

    internal Analytics(RequestContext ctx) => _ctx = ctx;

    /// <summary>Get delivery trends.</summary>
    public async Task<DeliveryTrendResponse> TrendsAsync(string? since = null, string? until = null)
    {
        var req = new Request("GET", "/v1/analytics/deliveries");
        var qp = new Dictionary<string, object?>();
        if (since != null) qp["since"] = since;
        if (until != null) qp["until"] = until;
        req.SetQueryParams(qp);
        return (await req.SendAsync<DeliveryTrendResponse>(_ctx))!;
    }

    /// <summary>Get success rate.</summary>
    public async Task<SuccessRateResponse> SuccessRateAsync()
    {
        var req = new Request("GET", "/v1/analytics/success-rate");
        return (await req.SendAsync<SuccessRateResponse>(_ctx))!;
    }

    /// <summary>Get latency data.</summary>
    public async Task<LatencyResponse> LatencyAsync()
    {
        var req = new Request("GET", "/v1/analytics/latency");
        return (await req.SendAsync<LatencyResponse>(_ctx))!;
    }
}
