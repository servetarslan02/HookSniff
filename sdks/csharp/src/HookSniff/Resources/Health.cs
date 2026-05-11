using HookSniff.Model;

namespace HookSniff.Resources;

/// <summary>
/// Health resource — system health check.
/// </summary>
public class Health
{
    private readonly RequestContext _ctx;

    internal Health(RequestContext ctx) => _ctx = ctx;

    /// <summary>Get system health status.</summary>
    public async Task<SystemStatus> CheckAsync()
    {
        var req = new Request("GET", "/health");
        return (await req.SendAsync<SystemStatus>(_ctx))!;
    }
}
