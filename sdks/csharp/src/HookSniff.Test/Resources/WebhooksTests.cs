using System;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;

namespace HookSniff.Test.Resources;

public class WebhooksTests : IDisposable
{
    private readonly MockServer _server;
    private readonly HookSniffClient _client;

    public WebhooksTests()
    {
        _server = new MockServer();
        _client = new HookSniffClient("test-api-key", baseUrl: _server.BaseUrl, numRetries: 0);
    }

    public void Dispose() => _server.Dispose();

    private static string DeliveryJson() => JsonSerializer.Serialize(new
    {
        id = "dlv_abc123",
        endpoint_id = "ep_001",
        event_type = "order.created",
        status = "success",
        created_at = "2025-01-01T00:00:00Z"
    });

    [Fact]
    public async Task SendAsync_SendsPostToWebhooks()
    {
        _server.ResponseQueue.Enqueue((200, DeliveryJson()));

        var body = new { endpoint_id = "ep_001", @event = "order.created", data = new { order_id = "12345" } };
        var result = await _client.Webhooks.SendAsync(body);

        Assert.NotNull(result);
        var req = _server.Requests[0];
        Assert.Equal("POST", req.Method);
        Assert.Equal("/v1/webhooks", req.Path);
        Assert.Contains("order.created", req.Body);
    }

    [Fact]
    public async Task BatchAsync_SendsPostToWebhooksBatch()
    {
        _server.ResponseQueue.Enqueue((200, JsonSerializer.Serialize(new { accepted = 3, batch_id = "batch_001" })));

        var body = new
        {
            webhooks = new[]
            {
                new { endpoint_id = "ep_001", @event = "order.created", data = new { order_id = "1" } },
                new { endpoint_id = "ep_002", @event = "order.updated", data = new { order_id = "2" } },
                new { endpoint_id = "ep_003", @event = "order.deleted", data = new { order_id = "3" } }
            }
        };
        var result = await _client.Webhooks.BatchAsync(body);

        Assert.NotNull(result);
        var req = _server.Requests[0];
        Assert.Equal("POST", req.Method);
        Assert.Equal("/v1/webhooks/batch", req.Path);
    }

    [Fact]
    public async Task GetAsync_SendsGetWithPathParam()
    {
        var deliveryId = "dlv_xyz789";
        _server.ResponseQueue.Enqueue((200, DeliveryJson()));

        var result = await _client.Webhooks.GetAsync(deliveryId);

        Assert.NotNull(result);
        var req = _server.Requests[0];
        Assert.Equal("GET", req.Method);
        Assert.Equal($"/v1/webhooks/{deliveryId}", req.Path);
    }

    [Fact]
    public async Task ReplayAsync_SendsPostWithPathParam()
    {
        var deliveryId = "dlv_replay_me";
        _server.ResponseQueue.Enqueue((200, DeliveryJson()));

        var result = await _client.Webhooks.ReplayAsync(deliveryId);

        Assert.NotNull(result);
        var req = _server.Requests[0];
        Assert.Equal("POST", req.Method);
        Assert.Equal($"/v1/webhooks/{deliveryId}/replay", req.Path);
    }
}
