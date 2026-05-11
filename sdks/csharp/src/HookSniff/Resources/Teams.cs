using HookSniff.Model;

namespace HookSniff.Resources;

/// <summary>
/// Teams resource — manage teams and members.
/// </summary>
public class Teams
{
    private readonly RequestContext _ctx;

    internal Teams(RequestContext ctx) => _ctx = ctx;

    /// <summary>List teams.</summary>
    public async Task<List<Team>> ListAsync()
    {
        var req = new Request("GET", "/v1/teams");
        var resp = await req.SendAsync<TeamListResponse>(_ctx);
        return resp?.Data ?? new List<Team>();
    }

    /// <summary>Get team details.</summary>
    public async Task<Team> GetAsync(string teamId)
    {
        var req = new Request("GET", "/v1/teams/{team_id}");
        req.SetPathParam("team_id", teamId);
        return (await req.SendAsync<Team>(_ctx))!;
    }
}
