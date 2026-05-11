using HookSniff.Model;

namespace HookSniff.Resources;

/// <summary>
/// Search resource — search deliveries and events.
/// </summary>
public class Search
{
    private readonly RequestContext _ctx;

    internal Search(RequestContext ctx) => _ctx = ctx;

    /// <summary>Search deliveries and events.</summary>
    public async Task<SearchResponse> SearchAsync(SearchRequest body)
    {
        var req = new Request("POST", "/v1/search");
        req.SetBody(body);
        return (await req.SendAsync<SearchResponse>(_ctx))!;
    }
}
