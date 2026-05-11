using HookSniff.Model;

namespace HookSniff.Resources;

/// <summary>
/// Endpoints resource — manage webhook endpoints.
/// </summary>
public class Endpoints
{
    private readonly RequestContext _ctx;

    internal Endpoints(RequestContext ctx) => _ctx = ctx;

    /// <summary>List all endpoints.</summary>
    public async Task<List<Endpoint>> ListAsync()
    {
        var req = new Request("GET", "/v1/endpoints");
        var resp = await req.SendAsync<EndpointListResponse>(_ctx);
        return resp?.Data ?? new List<Endpoint>();
    }

    /// <summary>Get a single endpoint by ID.</summary>
    public async Task<Endpoint> GetAsync(string endpointId)
    {
        var req = new Request("GET", "/v1/endpoints/{endpoint_id}");
        req.SetPathParam("endpoint_id", endpointId);
        return (await req.SendAsync<Endpoint>(_ctx))!;
    }

    /// <summary>Create a new endpoint.</summary>
    public async Task<Endpoint> CreateAsync(CreateEndpointRequest body)
    {
        var req = new Request("POST", "/v1/endpoints");
        req.SetBody(body);
        return (await req.SendAsync<Endpoint>(_ctx))!;
    }

    /// <summary>Update an endpoint.</summary>
    public async Task<Endpoint> UpdateAsync(string endpointId, UpdateEndpointRequest body)
    {
        var req = new Request("PUT", "/v1/endpoints/{endpoint_id}");
        req.SetPathParam("endpoint_id", endpointId);
        req.SetBody(body);
        return (await req.SendAsync<Endpoint>(_ctx))!;
    }

    /// <summary>Delete an endpoint.</summary>
    public async Task DeleteAsync(string endpointId)
    {
        var req = new Request("DELETE", "/v1/endpoints/{endpoint_id}");
        req.SetPathParam("endpoint_id", endpointId);
        await req.SendVoidAsync(_ctx);
    }

    /// <summary>Rotate the signing secret for an endpoint.</summary>
    public async Task<EndpointsIdRotateSecretPost200Response> RotateSecretAsync(string endpointId)
    {
        var req = new Request("POST", "/v1/endpoints/{endpoint_id}/rotate-secret");
        req.SetPathParam("endpoint_id", endpointId);
        return (await req.SendAsync<EndpointsIdRotateSecretPost200Response>(_ctx))!;
    }
}
