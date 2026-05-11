using HookSniff.Model;

namespace HookSniff.Resources;

/// <summary>
/// Teams resource — list members, invite, remove.
/// </summary>
public class Teams
{
    private readonly RequestContext _ctx;

    internal Teams(RequestContext ctx) => _ctx = ctx;

    /// <summary>List team members.</summary>
    public async Task<List<TeamMember>> MembersAsync()
    {
        var req = new Request("GET", "/v1/teams/members");
        return (await req.SendAsync<List<TeamMember>>(_ctx)) ?? new List<TeamMember>();
    }

    /// <summary>Invite a team member.</summary>
    public async Task<object> InviteAsync(object body)
    {
        var req = new Request("POST", "/v1/teams/invite");
        req.SetBody(body);
        return (await req.SendAsync<object>(_ctx))!;
    }

    /// <summary>Remove a team member.</summary>
    public async Task RemoveMemberAsync(string memberId)
    {
        var req = new Request("DELETE", "/v1/teams/members/{member_id}");
        req.SetPathParam("member_id", memberId);
        await req.SendVoidAsync(_ctx);
    }
}
