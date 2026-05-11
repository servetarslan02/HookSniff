using HookSniff.Model;

namespace HookSniff.Resources;

/// <summary>
/// Alerts resource — manage alert rules and notifications.
/// </summary>
public class Alerts
{
    private readonly RequestContext _ctx;

    internal Alerts(RequestContext ctx) => _ctx = ctx;

    /// <summary>List alert rules.</summary>
    public async Task<List<AlertRule>> ListRulesAsync()
    {
        var req = new Request("GET", "/v1/alerts/rules");
        var resp = await req.SendAsync<AlertRuleListResponse>(_ctx);
        return resp?.Data ?? new List<AlertRule>();
    }

    /// <summary>Create an alert rule.</summary>
    public async Task<AlertRule> CreateRuleAsync(CreateAlertRuleRequest body)
    {
        var req = new Request("POST", "/v1/alerts/rules");
        req.SetBody(body);
        return (await req.SendAsync<AlertRule>(_ctx))!;
    }
}
