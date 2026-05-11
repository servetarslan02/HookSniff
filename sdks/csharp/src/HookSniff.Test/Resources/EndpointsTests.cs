using System;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;

namespace HookSniff.Test.Resources;

[Collection("ResourceTests")]
public class EndpointsTests : IDisposable
{
    private readonly MockHttpClient _mock;
    private readonly HookSniffClient _client;

    public EndpointsTests()
    {
        _mock = new MockHttpClient();
        _client = new HookSniffClient("test-api-key", baseUrl: "https://mock.api", numRetries: 0);
    }

    public void Dispose() => _mock.Dispose();

    private static string EndpointJson() => JsonSerializer.Serialize(new
    {
        id = Guid.NewGuid().ToString(),
        url = "https://example.com/hook",
        is_active = true,
        retry_policy = new { type = "fixed", interval_ms = 1000, max_retries = 3 },
        created_at = "2025-01-01T00:00:00Z",
        routing_strategy = "round-robin",
        avg_response_ms = 150,
        failure_streak = 0,
        format = "standard"
    });

    private static string EndpointListJson() => JsonSerializer.Serialize(new
    {
        data = new[]
        {
            new
            {
                id = Guid.NewGuid().ToString(),
                url = "https://example.com/hook",
                is_active = true,
                retry_policy = new { type = "fixed", interval_ms = 1000, max_retries = 3 },
                created_at = "2025-01-01T00:00:00Z",
                routing_strategy = "round-robin",
                avg_response_ms = 150,
                failure_streak = 0,
                format = "standard"
            }
        },
        total = 1,
        has_more = false
    });

    [Fact]
    public async Task ListAsync_SendsGetToEndpoints()
    {
        _mock.Handler.ResponseQueue.Enqueue((200, EndpointListJson()));

        var result = await _client.Endpoints.ListAsync();

        Assert.Single(result);
        var req = _mock.Handler.Requests[0];
        Assert.Equal("GET", req.Method);
        Assert.Equal("/v1/endpoints", req.Path);
    }

    [Fact]
    public async Task ListAsync_WithPagination_SendsQueryParams()
    {
        _mock.Handler.ResponseQueue.Enqueue((200, EndpointListJson()));

        var page = await _client.Endpoints.ListAsync(10, 20);

        Assert.Single(page.Data);
        Assert.False(page.HasMore);
        var req = _mock.Handler.Requests[0];
        Assert.Equal("GET", req.Method);
        Assert.Contains("limit=10", req.Query);
        Assert.Contains("offset=20", req.Query);
    }

    [Fact]
    public async Task CreateAsync_SendsPostWithBody()
    {
        _mock.Handler.ResponseQueue.Enqueue((200, EndpointJson()));

        var body = new HookSniff.Model.CreateEndpointRequest("https://new.example.com/hook");
        var result = await _client.Endpoints.CreateAsync(body);

        Assert.NotNull(result);
        var req = _mock.Handler.Requests[0];
        Assert.Equal("POST", req.Method);
        Assert.Equal("/v1/endpoints", req.Path);
        Assert.Contains("https://new.example.com/hook", req.Body);
    }

    [Fact]
    public async Task GetAsync_SendsGetWithPathParam()
    {
        var epId = "ep_abc123";
        _mock.Handler.ResponseQueue.Enqueue((200, EndpointJson()));

        var result = await _client.Endpoints.GetAsync(epId);

        Assert.NotNull(result);
        var req = _mock.Handler.Requests[0];
        Assert.Equal("GET", req.Method);
        Assert.Equal($"/v1/endpoints/{epId}", req.Path);
    }

    [Fact]
    public async Task DeleteAsync_SendsDelete()
    {
        var epId = "ep_to_delete";
        _mock.Handler.ResponseQueue.Enqueue((204, ""));

        await _client.Endpoints.DeleteAsync(epId);

        var req = _mock.Handler.Requests[0];
        Assert.Equal("DELETE", req.Method);
        Assert.Equal($"/v1/endpoints/{epId}", req.Path);
    }

    [Fact]
    public async Task RotateSecretAsync_SendsPost()
    {
        var epId = "ep_rotate";
        _mock.Handler.ResponseQueue.Enqueue((200, JsonSerializer.Serialize(new
        {
            signing_secret = "whsec_new_secret_123",
            message = "Secret rotated successfully"
        })));

        var result = await _client.Endpoints.RotateSecretAsync(epId);

        Assert.NotNull(result);
        Assert.Equal("whsec_new_secret_123", result.SigningSecret);
        var req = _mock.Handler.Requests[0];
        Assert.Equal("POST", req.Method);
        Assert.Equal($"/v1/endpoints/{epId}/rotate-secret", req.Path);
    }
}
