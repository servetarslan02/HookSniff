using HookSniff.Model;

namespace HookSniff.Resources;

/// <summary>
/// Health resource — system health and status.
/// </summary>
public class Health
{
    private readonly RequestContext _ctx;

    internal Health(RequestContext ctx) => _ctx = ctx;

    /// <summary>Get system health status.</summary>
    public async Task<SystemStatus> GetStatusAsync()
    {
        var req = new Request("GET", "/v1/health");
        return (await req.SendAsync<SystemStatus>(_ctx))!;
    }
}
