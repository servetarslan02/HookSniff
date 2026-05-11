using HookSniff.Model;

namespace HookSniff.Resources;

/// <summary>
/// Analytics resource — delivery stats and trends.
/// </summary>
public class Analytics
{
    private readonly RequestContext _ctx;

    internal Analytics(RequestContext ctx) => _ctx = ctx;

    /// <summary>Get delivery trends.</summary>
    public async Task<DeliveryTrendResponse> DeliveryTrendsAsync(string? endpointId = null)
    {
        var req = new Request("GET", "/v1/analytics/delivery-trends");
        var qp = new Dictionary<string, object?>();
        if (endpointId != null) qp["endpoint_id"] = endpointId;
        req.SetQueryParams(qp);
        return (await req.SendAsync<DeliveryTrendResponse>(_ctx))!;
    }

    /// <summary>Get latency trends.</summary>
    public async Task<LatencyTrendResponse> LatencyTrendsAsync(string? endpointId = null)
    {
        var req = new Request("GET", "/v1/analytics/latency-trends");
        var qp = new Dictionary<string, object?>();
        if (endpointId != null) qp["endpoint_id"] = endpointId;
        req.SetQueryParams(qp);
        return (await req.SendAsync<LatencyTrendResponse>(_ctx))!;
    }

    /// <summary>Get success rate.</summary>
    public async Task<SuccessRateResponse> SuccessRateAsync(string? endpointId = null)
    {
        var req = new Request("GET", "/v1/analytics/success-rate");
        var qp = new Dictionary<string, object?>();
        if (endpointId != null) qp["endpoint_id"] = endpointId;
        req.SetQueryParams(qp);
        return (await req.SendAsync<SuccessRateResponse>(_ctx))!;
    }
}
