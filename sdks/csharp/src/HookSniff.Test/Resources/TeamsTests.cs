using System;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;

namespace HookSniff.Test.Resources;

public class TeamsTests : IDisposable
{
    private readonly MockServer _server;
    private readonly HookSniffClient _client;

    public TeamsTests()
    {
        _server = new MockServer();
        _client = new HookSniffClient("test-api-key", baseUrl: _server.BaseUrl, numRetries: 0);
    }

    public void Dispose() => _server.Dispose();

    private static string MemberListJson() => JsonSerializer.Serialize(new[]
    {
        new
        {
            id = Guid.NewGuid().ToString(),
            user_id = Guid.NewGuid().ToString(),
            email = "alice@example.com",
            role = "admin",
            joined_at = "2025-01-01T00:00:00Z",
            name = "Alice"
        },
        new
        {
            id = Guid.NewGuid().ToString(),
            user_id = Guid.NewGuid().ToString(),
            email = "bob@example.com",
            role = "member",
            joined_at = "2025-02-01T00:00:00Z",
            name = "Bob"
        }
    });

    [Fact]
    public async Task MembersAsync_SendsGetToTeamsMembers()
    {
        _server.ResponseQueue.Enqueue((200, MemberListJson()));

        var result = await _client.Teams.MembersAsync();

        Assert.Equal(2, result.Count);
        Assert.Equal("alice@example.com", result[0].Email);
        Assert.Equal("bob@example.com", result[1].Email);
        var req = _server.Requests[0];
        Assert.Equal("GET", req.Method);
        Assert.Equal("/v1/teams/members", req.Path);
    }

    [Fact]
    public async Task InviteAsync_SendsPostWithBody()
    {
        _server.ResponseQueue.Enqueue((200, JsonSerializer.Serialize(new
        {
            id = Guid.NewGuid().ToString(),
            email = "newuser@example.com",
            role = "member",
            status = "pending"
        })));

        var body = new { email = "newuser@example.com", role = "member" };
        var result = await _client.Teams.InviteAsync(body);

        Assert.NotNull(result);
        var req = _server.Requests[0];
        Assert.Equal("POST", req.Method);
        Assert.Equal("/v1/teams/invite", req.Path);
        Assert.Contains("newuser@example.com", req.Body);
    }

    [Fact]
    public async Task RemoveMemberAsync_SendsDeleteWithPathParam()
    {
        var memberId = "member_to_remove";
        _server.ResponseQueue.Enqueue((200, "{}"));

        await _client.Teams.RemoveMemberAsync(memberId);

        var req = _server.Requests[0];
        Assert.Equal("DELETE", req.Method);
        Assert.Equal($"/v1/teams/members/{memberId}", req.Path);
    }
}
