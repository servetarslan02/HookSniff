using HookSniff.Model;

namespace HookSniff.Resources;

/// <summary>
/// Search resource — search deliveries.
/// </summary>
public class Search
{
    private readonly RequestContext _ctx;

    internal Search(RequestContext ctx) => _ctx = ctx;

    /// <summary>Search deliveries by query string.</summary>
    public async Task<SearchResponse> QueryAsync(string q, int? limit = null)
    {
        var path = "/v1/search?q=" + Uri.EscapeDataString(q);
        if (limit != null) path += "&limit=" + limit;
        var req = new Request("GET", path);
        return (await req.SendAsync<SearchResponse>(_ctx))!;
    }
}
