namespace HookSniff.Resources;

/// <summary>
/// Webhooks resource — send and test webhooks.
/// </summary>
public class Webhooks
{
    private readonly RequestContext _ctx;

    internal Webhooks(RequestContext ctx) => _ctx = ctx;

    /// <summary>Send a webhook event.</summary>
    public async Task<object> SendAsync(object body)
    {
        var req = new Request("POST", "/v1/webhooks/send");
        req.SetBody(body);
        return (await req.SendAsync<object>(_ctx))!;
    }

    /// <summary>Test a webhook endpoint.</summary>
    public async Task<object> TestAsync(string endpointId)
    {
        var req = new Request("POST", "/v1/webhooks/test/{endpoint_id}");
        req.SetPathParam("endpoint_id", endpointId);
        return (await req.SendAsync<object>(_ctx))!;
    }

    /// <summary>Batch send webhooks.</summary>
    public async Task<object> BatchAsync(object body)
    {
        var req = new Request("POST", "/v1/webhooks/batch");
        req.SetBody(body);
        return (await req.SendAsync<object>(_ctx))!;
    }
}
