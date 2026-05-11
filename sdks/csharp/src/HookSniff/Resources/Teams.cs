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

    /// <summary>List teams with pagination parameters.</summary>
    public async Task<Page<Team>> ListAsync(int limit, int offset)
    {
        var req = new Request("GET", "/v1/teams");
        req.SetQueryParams(new Dictionary<string, object?>
        {
            ["limit"] = limit,
            ["offset"] = offset
        });
        var resp = await req.SendAsync<TeamListResponse>(_ctx);
        return new Page<Team>
        {
            Data = resp?.Data ?? new List<Team>(),
            HasMore = resp?.HasMore ?? false
        };
    }

    /// <summary>Collect all teams across all pages.</summary>
    public async Task<List<Team>> ListAllAsync(int limit = Pagination.DefaultLimit)
    {
        return await Pagination.CollectAllAsync<Team>(async (l, o) => await ListAsync(l, o), limit);
    }

    /// <summary>Get team details.</summary>
    public async Task<Team> GetAsync(string teamId)
    {
        var req = new Request("GET", "/v1/teams/{team_id}");
        req.SetPathParam("team_id", teamId);
        return (await req.SendAsync<Team>(_ctx))!;
    }
}
