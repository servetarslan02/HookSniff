using HookSniff.Model;

namespace HookSniff.Resources;

/// <summary>
/// ApiKeys resource — manage API keys.
/// </summary>
public class ApiKeys
{
    private readonly RequestContext _ctx;

    internal ApiKeys(RequestContext ctx) => _ctx = ctx;

    /// <summary>List API keys.</summary>
    public async Task<List<ApiKeyInfo>> ListAsync()
    {
        var req = new Request("GET", "/v1/api-keys");
        var resp = await req.SendAsync<List<ApiKeyInfo>>(_ctx);
        return resp ?? new List<ApiKeyInfo>();
    }

    /// <summary>Collect all API keys. This endpoint is not paginated; this method exists for consistency.</summary>
    public async Task<List<ApiKeyInfo>> ListAllAsync()
    {
        return await ListAsync();
    }

    /// <summary>Create a new API key.</summary>
    public async Task<CreateApiKeyResponse> CreateAsync(string? name = null)
    {
        var req = new Request("POST", "/v1/api-keys");
        if (name != null) req.SetBody(new { name });
        return (await req.SendAsync<CreateApiKeyResponse>(_ctx))!;
    }

    /// <summary>Revoke an API key.</summary>
    public async Task RevokeAsync(string keyId)
    {
        var req = new Request("DELETE", "/v1/api-keys/{key_id}");
        req.SetPathParam("key_id", keyId);
        await req.SendVoidAsync(_ctx);
    }
}
