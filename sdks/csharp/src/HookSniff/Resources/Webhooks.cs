namespace HookSniff.Resources;

/// <summary>
/// Webhooks resource — send, list, get, replay, and batch webhooks.
/// </summary>
public class Webhooks
{
    private readonly RequestContext _ctx;

    internal Webhooks(RequestContext ctx) => _ctx = ctx;

    /// <summary>Send a single webhook event.</summary>
    public async Task<object> SendAsync(object body)
    {
        var req = new Request("POST", "/v1/webhooks");
        req.SetBody(body);
        return (await req.SendAsync<object>(_ctx))!;
    }

    /// <summary>Batch send webhooks.</summary>
    public async Task<object> BatchAsync(object body)
    {
        var req = new Request("POST", "/v1/webhooks/batch");
        req.SetBody(body);
        return (await req.SendAsync<object>(_ctx))!;
    }

    /// <summary>List deliveries.</summary>
    public async Task<object> ListAsync()
    {
        var req = new Request("GET", "/v1/webhooks");
        return (await req.SendAsync<object>(_ctx))!;
    }

    /// <summary>Get a specific delivery.</summary>
    public async Task<object> GetAsync(string id)
    {
        var req = new Request("GET", "/v1/webhooks/{id}");
        req.SetPathParam("id", id);
        return (await req.SendAsync<object>(_ctx))!;
    }

    /// <summary>Replay a delivery.</summary>
    public async Task<object> ReplayAsync(string id)
    {
        var req = new Request("POST", "/v1/webhooks/{id}/replay");
        req.SetPathParam("id", id);
        return (await req.SendAsync<object>(_ctx))!;
    }
}
