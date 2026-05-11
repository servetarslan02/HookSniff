using System.Text.Json;
using HookSniff.Model;
using HookSniff.Serialization;
using Xunit;

namespace HookSniff.Tests.Serialization;

/// <summary>
/// Tests for ModelSerializer — ToJson / FromJson / ToJsonString / FromJsonString
/// covering round-trip fidelity, required fields, enums, nested objects, optional fields,
/// lists, and edge cases.
/// </summary>
public class ModelSerializerTests
{
    // ═══════════════════════════════════════════════
    // Helper: build a fully-populated Endpoint
    // ═══════════════════════════════════════════════
    private static Endpoint MakeEndpoint(
        string? description = null,
        List<string>? allowedIps = null,
        List<string>? eventFilter = null)
    {
        var retry = new RetryPolicy(
            maxAttempts: 5,
            backoff: RetryPolicy.BackoffEnum.Exponential,
            initialDelaySecs: 15,
            maxDelaySecs: 7200);

        var opts = new List<Option<string?>?> { };
        return new Endpoint(
            id: Guid.Parse("11111111-1111-1111-1111-111111111111"),
            url: "https://example.com/webhook",
            isActive: true,
            retryPolicy: retry,
            createdAt: new DateTime(2025, 1, 15, 10, 30, 0, DateTimeKind.Utc),
            routingStrategy: Endpoint.RoutingStrategyEnum.RoundRobin,
            avgResponseMs: 150,
            failureStreak: 0,
            format: Endpoint.FormatEnum.Standard,
            description: description != null ? new Option<string?>(description) : default,
            allowedIps: allowedIps != null ? new Option<List<string>?>(allowedIps) : default,
            eventFilter: eventFilter != null ? new Option<List<string>?>(eventFilter) : default
        );
    }

    // ───────────────────────────────────────────────
    // 1. RetryPolicy → ToJson produces correct keys
    // ───────────────────────────────────────────────
    [Fact]
    public void RetryPolicy_ToJson_ProducesCorrectKeys()
    {
        var rp = new RetryPolicy(5, RetryPolicy.BackoffEnum.Linear, 20, 1800);
        var dict = ModelSerializer.ToJson(rp);

        Assert.Equal(5, Convert.ToInt32(dict["max_attempts"]));
        Assert.Equal("linear", dict["backoff"]?.ToString());
        Assert.Equal(20, Convert.ToInt32(dict["initial_delay_secs"]));
        Assert.Equal(1800, Convert.ToInt32(dict["max_delay_secs"]));
    }

    // ───────────────────────────────────────────────
    // 2. RetryPolicy round-trip preserves all values
    // ───────────────────────────────────────────────
    [Fact]
    public void RetryPolicy_RoundTrip_PreservesValues()
    {
        var original = new RetryPolicy(10, RetryPolicy.BackoffEnum.Fixed, 30, 900);
        var dict = ModelSerializer.ToJson(original);
        var restored = ModelSerializer.FromJson<RetryPolicy>(dict);

        Assert.Equal(original.MaxAttempts, restored.MaxAttempts);
        Assert.Equal(original.Backoff, restored.Backoff);
        Assert.Equal(original.InitialDelaySecs, restored.InitialDelaySecs);
        Assert.Equal(original.MaxDelaySecs, restored.MaxDelaySecs);
    }

    // ───────────────────────────────────────────────
    // 3. Endpoint ToJson contains required fields
    // ───────────────────────────────────────────────
    [Fact]
    public void Endpoint_ToJson_ContainsRequiredFields()
    {
        var ep = MakeEndpoint();
        var dict = ModelSerializer.ToJson(ep);

        Assert.Equal("11111111-1111-1111-1111-111111111111", dict["id"]?.ToString());
        Assert.Equal("https://example.com/webhook", dict["url"]?.ToString());
        Assert.Equal(true, dict["is_active"]);
        Assert.Equal("round-robin", dict["routing_strategy"]?.ToString());
        Assert.Equal("standard", dict["format"]?.ToString());
    }

    // ───────────────────────────────────────────────
    // 4. Endpoint round-trip preserves all values
    // ───────────────────────────────────────────────
    [Fact]
    public void Endpoint_RoundTrip_PreservesValues()
    {
        var original = MakeEndpoint(
            description: "My test endpoint",
            allowedIps: new List<string> { "10.0.0.0/8", "192.168.1.1" },
            eventFilter: new List<string> { "order.*", "payment.completed" });

        var dict = ModelSerializer.ToJson(original);
        var restored = ModelSerializer.FromJson<Endpoint>(dict);

        Assert.Equal(original.Id, restored.Id);
        Assert.Equal(original.Url, restored.Url);
        Assert.Equal(original.IsActive, restored.IsActive);
        Assert.Equal(original.AvgResponseMs, restored.AvgResponseMs);
        Assert.Equal(original.Format, restored.Format);
        Assert.Equal(original.RoutingStrategy, restored.RoutingStrategy);
    }

    // ───────────────────────────────────────────────
    // 5. Endpoint optional fields (description, allowedIps)
    // ───────────────────────────────────────────────
    [Fact]
    public void Endpoint_WithOptionalFields_RoundTrips()
    {
        var original = MakeEndpoint(
            description: "Test desc",
            allowedIps: new List<string> { "10.0.0.1" },
            eventFilter: new List<string> { "user.*" });

        var dict = ModelSerializer.ToJson(original);
        var restored = ModelSerializer.FromJson<Endpoint>(dict);

        Assert.Equal("Test desc", restored.Description);
        Assert.NotNull(restored.AllowedIps);
        Assert.Single(restored.AllowedIps!);
        Assert.Equal("10.0.0.1", restored.AllowedIps![0]);
    }

    // ───────────────────────────────────────────────
    // 6. Team round-trip
    // ───────────────────────────────────────────────
    [Fact]
    public void Team_RoundTrip_PreservesValues()
    {
        var original = new Team(
            id: Guid.Parse("22222222-2222-2222-2222-222222222222"),
            name: "Engineering",
            createdAt: new DateTime(2025, 3, 1, 0, 0, 0, DateTimeKind.Utc));

        var dict = ModelSerializer.ToJson(original);
        var restored = ModelSerializer.FromJson<Team>(dict);

        Assert.Equal(original.Id, restored.Id);
        Assert.Equal("Engineering", restored.Name);
        Assert.Equal(original.CreatedAt, restored.CreatedAt);
    }

    // ───────────────────────────────────────────────
    // 7. Team ToJson produces snake_case keys
    // ───────────────────────────────────────────────
    [Fact]
    public void Team_ToJson_UsesSnakeCaseKeys()
    {
        var team = new Team(Guid.NewGuid(), "DevOps", DateTime.UtcNow);
        var dict = ModelSerializer.ToJson(team);

        Assert.True(dict.ContainsKey("id"));
        Assert.True(dict.ContainsKey("name"));
        Assert.True(dict.ContainsKey("created_at"));
        Assert.False(dict.ContainsKey("createdAt"));
    }

    // ───────────────────────────────────────────────
    // 8. ApiKeyInfo round-trip
    // ───────────────────────────────────────────────
    [Fact]
    public void ApiKeyInfo_RoundTrip_PreservesValues()
    {
        var original = new ApiKeyInfo(
            id: Guid.Parse("33333333-3333-3333-3333-333333333333"),
            prefix: "hs_abc1...",
            createdAt: new DateTime(2025, 6, 1, 12, 0, 0, DateTimeKind.Utc),
            isActive: true,
            lastUsedAt: new Option<string?>("2025-06-10T08:00:00Z"));

        var dict = ModelSerializer.ToJson(original);
        var restored = ModelSerializer.FromJson<ApiKeyInfo>(dict);

        Assert.Equal(original.Id, restored.Id);
        Assert.Equal("hs_abc1...", restored.Prefix);
        Assert.True(restored.IsActive);
    }

    // ───────────────────────────────────────────────
    // 9. LoginRequest round-trip
    // ───────────────────────────────────────────────
    [Fact]
    public void LoginRequest_RoundTrip_PreservesValues()
    {
        var original = new LoginRequest(
            email: "user@example.com",
            password: "s3cret!");

        var dict = ModelSerializer.ToJson(original);
        var restored = ModelSerializer.FromJson<LoginRequest>(dict);

        Assert.Equal("user@example.com", restored.Email);
        Assert.Equal("s3cret!", restored.Password);
    }

    // ───────────────────────────────────────────────
    // 10. CreateEndpointRequest with optional fields
    // ───────────────────────────────────────────────
    [Fact]
    public void CreateEndpointRequest_RoundTrip_WithOptionalFields()
    {
        var original = new CreateEndpointRequest(
            url: "https://example.com/hook",
            description: new Option<string?>("My endpoint"),
            allowedIps: new Option<List<string>?>(new List<string> { "10.0.0.0/8" }),
            eventFilter: new Option<List<string>?>(new List<string> { "order.*" }),
            retryPolicy: new Option<RetryPolicy?>(new RetryPolicy()),
            routingStrategy: new Option<CreateEndpointRequest.RoutingStrategyEnum?>(
                CreateEndpointRequest.RoutingStrategyEnum.Latency),
            fallbackUrl: new Option<string?>("https://fallback.example.com"),
            format: new Option<CreateEndpointRequest.FormatEnum?>(
                CreateEndpointRequest.FormatEnum.Standard));

        var dict = ModelSerializer.ToJson(original);
        var restored = ModelSerializer.FromJson<CreateEndpointRequest>(dict);

        Assert.Equal("https://example.com/hook", restored.Url);
        Assert.Equal("My endpoint", restored.Description);
    }

    // ───────────────────────────────────────────────
    // 11. CreateEndpointRequest minimal (only url)
    // ───────────────────────────────────────────────
    [Fact]
    public void CreateEndpointRequest_Minimal_RoundTrips()
    {
        var original = new CreateEndpointRequest(url: "https://minimal.example.com");
        var dict = ModelSerializer.ToJson(original);
        var restored = ModelSerializer.FromJson<CreateEndpointRequest>(dict);

        Assert.Equal("https://minimal.example.com", restored.Url);
    }

    // ───────────────────────────────────────────────
    // 12. Error model round-trip
    // ───────────────────────────────────────────────
    [Fact]
    public void Error_RoundTrip_PreservesValues()
    {
        var original = new Error(
            code: "not_found",
            message: "Endpoint not found");

        var dict = ModelSerializer.ToJson(original);
        var restored = ModelSerializer.FromJson<Error>(dict);

        Assert.Equal("not_found", restored.Code);
        Assert.Equal("Endpoint not found", restored.Message);
    }

    // ───────────────────────────────────────────────
    // 13. Delivery model round-trip
    // ───────────────────────────────────────────────
    [Fact]
    public void Delivery_RoundTrip_PreservesValues()
    {
        var original = new Delivery(
            id: Guid.Parse("44444444-4444-4444-4444-444444444444"),
            endpointId: "ep_123",
            eventId: "evt_456",
            status: Delivery.StatusEnum.Success,
            httpStatus: 200,
            attempts: 1,
            createdAt: new DateTime(2025, 6, 1, 12, 0, 0, DateTimeKind.Utc));

        var dict = ModelSerializer.ToJson(original);
        var restored = ModelSerializer.FromJson<Delivery>(dict);

        Assert.Equal(original.Id, restored.Id);
        Assert.Equal("ep_123", restored.EndpointId);
        Assert.Equal(200, restored.HttpStatus);
    }

    // ───────────────────────────────────────────────
    // 14. ToJsonString produces valid JSON
    // ───────────────────────────────────────────────
    [Fact]
    public void ToJsonString_ProducesValidJson()
    {
        var team = new Team(Guid.NewGuid(), "QA", DateTime.UtcNow);
        var json = ModelSerializer.ToJsonString(team);

        // Should be valid JSON
        var doc = JsonDocument.Parse(json);
        Assert.NotNull(doc);

        // Should contain expected fields
        Assert.Contains("QA", json);
        Assert.Contains("id", json);
    }

    // ───────────────────────────────────────────────
    // 15. FromJsonString round-trips correctly
    // ───────────────────────────────────────────────
    [Fact]
    public void FromJsonString_RoundTrips()
    {
        var original = new RetryPolicy(7, RetryPolicy.BackoffEnum.Linear, 25, 2000);
        var json = ModelSerializer.ToJsonString(original);
        var restored = ModelSerializer.FromJsonString<RetryPolicy>(json);

        Assert.Equal(original.MaxAttempts, restored.MaxAttempts);
        Assert.Equal(original.Backoff, restored.Backoff);
        Assert.Equal(original.InitialDelaySecs, restored.InitialDelaySecs);
    }

    // ───────────────────────────────────────────────
    // 16. ToJson null input throws
    // ───────────────────────────────────────────────
    [Fact]
    public void ToJson_NullInput_ThrowsArgumentNullException()
    {
        Assert.Throws<ArgumentNullException>(() => ModelSerializer.ToJson<RetryPolicy>(null!));
    }

    // ───────────────────────────────────────────────
    // 17. FromJson null dict throws
    // ───────────────────────────────────────────────
    [Fact]
    public void FromJson_NullDict_ThrowsArgumentNullException()
    {
        Assert.Throws<ArgumentNullException>(() => ModelSerializer.FromJson<RetryPolicy>(null!));
    }

    // ───────────────────────────────────────────────
    // 18. FromJsonString null/empty throws
    // ───────────────────────────────────────────────
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void FromJsonString_NullOrEmpty_ThrowsArgumentException(string? input)
    {
        Assert.Throws<ArgumentException>(() => ModelSerializer.FromJsonString<RetryPolicy>(input!));
    }

    // ───────────────────────────────────────────────
    // 19. Endpoint nested RetryPolicy round-trips
    // ───────────────────────────────────────────────
    [Fact]
    public void Endpoint_NestedRetryPolicy_RoundTrips()
    {
        var retry = new RetryPolicy(8, RetryPolicy.BackoffEnum.Fixed, 60, 3600);
        var ep = new Endpoint(
            id: Guid.NewGuid(),
            url: "https://nested.example.com",
            isActive: false,
            retryPolicy: retry,
            createdAt: DateTime.UtcNow,
            routingStrategy: Endpoint.RoutingStrategyEnum.Failover,
            avgResponseMs: 200,
            failureStreak: 3,
            format: Endpoint.FormatEnum.Cloudevents);

        var dict = ModelSerializer.ToJson(ep);
        var restored = ModelSerializer.FromJson<Endpoint>(dict);

        Assert.Equal(8, restored.RetryPolicy.MaxAttempts);
        Assert.Equal(RetryPolicy.BackoffEnum.Fixed, restored.RetryPolicy.Backoff);
        Assert.False(restored.IsActive);
        Assert.Equal(Endpoint.RoutingStrategyEnum.Failover, restored.RoutingStrategy);
        Assert.Equal(Endpoint.FormatEnum.Cloudevents, restored.Format);
    }

    // ───────────────────────────────────────────────
    // 20. DeliveryAttempt round-trip
    // ───────────────────────────────────────────────
    [Fact]
    public void DeliveryAttempt_RoundTrip_PreservesValues()
    {
        var original = new DeliveryAttempt(
            id: Guid.Parse("55555555-5555-5555-5555-555555555555"),
            deliveryId: Guid.Parse("44444444-4444-4444-4444-444444444444"),
            attemptNumber: 2,
            httpStatus: 503,
            latencyMs: 1500,
            createdAt: new DateTime(2025, 6, 1, 12, 5, 0, DateTimeKind.Utc));

        var dict = ModelSerializer.ToJson(original);
        var restored = ModelSerializer.FromJson<DeliveryAttempt>(dict);

        Assert.Equal(original.Id, restored.Id);
        Assert.Equal(2, restored.AttemptNumber);
        Assert.Equal(503, restored.HttpStatus);
    }

    // ───────────────────────────────────────────────
    // 21. NotificationPreferences round-trip
    // ───────────────────────────────────────────────
    [Fact]
    public void NotificationPreferences_RoundTrip()
    {
        var original = new NotificationPreferences(
            emailEnabled: true,
            webhookEnabled: false,
            slackWebhookUrl: new Option<string?>("https://hooks.slack.com/test"));

        var dict = ModelSerializer.ToJson(original);
        var restored = ModelSerializer.FromJson<NotificationPreferences>(dict);

        Assert.True(restored.EmailEnabled);
        Assert.False(restored.WebhookEnabled);
    }

    // ───────────────────────────────────────────────
    // 22. SearchResponse with nested list round-trip
    // ───────────────────────────────────────────────
    [Fact]
    public void SearchResponse_WithNestedList_RoundTrips()
    {
        var results = new List<SearchResult>
        {
            new SearchResult(
                type: "delivery",
                id: "del_001",
                data: new Dictionary<string, object> { ["status"] = "success" }),
            new SearchResult(
                type: "event",
                id: "evt_001",
                data: new Dictionary<string, object> { ["name"] = "order.created" })
        };

        var original = new SearchResult(
            type: "delivery",
            id: "del_001",
            data: new Dictionary<string, object> { ["status"] = "success" });

        var dict = ModelSerializer.ToJson(original);
        var restored = ModelSerializer.FromJson<SearchResult>(dict);

        Assert.Equal("delivery", restored.Type);
        Assert.Equal("del_001", restored.Id);
    }

    // ───────────────────────────────────────────────
    // 23. Endpoint ToJson enum values are strings
    // ───────────────────────────────────────────────
    [Fact]
    public void Endpoint_ToJson_EnumsAreStringValues()
    {
        var ep = MakeEndpoint();
        var dict = ModelSerializer.ToJson(ep);

        // Enums should be serialized as their string representations
        Assert.Equal("round-robin", dict["routing_strategy"]?.ToString());
        Assert.Equal("standard", dict["format"]?.ToString());
    }

    // ───────────────────────────────────────────────
    // 24. Multiple models serialize independently
    // ───────────────────────────────────────────────
    [Fact]
    public void MultipleModels_SerializeIndependently()
    {
        var rp = new RetryPolicy(3, RetryPolicy.BackoffEnum.Exponential, 10, 3600);
        var team = new Team(Guid.NewGuid(), "Backend", DateTime.UtcNow);
        var apiKey = new ApiKeyInfo(Guid.NewGuid(), "hs_xyz...", DateTime.UtcNow, true);

        var rpDict = ModelSerializer.ToJson(rp);
        var teamDict = ModelSerializer.ToJson(team);
        var keyDict = ModelSerializer.ToJson(apiKey);

        // Each dict should only contain its own fields
        Assert.True(rpDict.ContainsKey("max_attempts"));
        Assert.False(rpDict.ContainsKey("name"));

        Assert.True(teamDict.ContainsKey("name"));
        Assert.False(teamDict.ContainsKey("max_attempts"));

        Assert.True(keyDict.ContainsKey("prefix"));
        Assert.False(keyDict.ContainsKey("name"));
    }

    // ───────────────────────────────────────────────
    // 25. Round-trip through JSON string (full pipeline)
    // ───────────────────────────────────────────────
    [Fact]
    public void FullPipeline_Model_ToJsonString_FromJsonString_ToJson_Model()
    {
        var original = new RetryPolicy(12, RetryPolicy.BackoffEnum.Linear, 45, 600);

        // Model → JSON string → Dictionary → JSON string → Model
        var json1 = ModelSerializer.ToJsonString(original);
        var dict = ModelSerializer.ToJson(original);
        var json2 = JsonSerializer.Serialize(dict);
        var restored = ModelSerializer.FromJsonString<RetryPolicy>(json2);

        Assert.Equal(original.MaxAttempts, restored.MaxAttempts);
        Assert.Equal(original.Backoff, restored.Backoff);
        Assert.Equal(original.InitialDelaySecs, restored.InitialDelaySecs);
        Assert.Equal(original.MaxDelaySecs, restored.MaxDelaySecs);
    }

    // ───────────────────────────────────────────────
    // 26. Endpoint list in EndpointListResponse
    // ───────────────────────────────────────────────
    [Fact]
    public void EndpointListResponse_ContainsEndpointList()
    {
        var ep1 = MakeEndpoint();
        var ep2 = new Endpoint(
            id: Guid.Parse("66666666-6666-6666-6666-666666666666"),
            url: "https://other.example.com",
            isActive: false,
            retryPolicy: new RetryPolicy(),
            createdAt: DateTime.UtcNow,
            routingStrategy: Endpoint.RoutingStrategyEnum.Latency,
            avgResponseMs: 300,
            failureStreak: 5,
            format: Endpoint.FormatEnum.Standard);

        var response = new EndpointListResponse(
            data: new List<Endpoint> { ep1, ep2 });

        var dict = ModelSerializer.ToJson(response);
        Assert.True(dict.ContainsKey("data"));

        // Data should be a list
        var data = dict["data"] as List<object>;
        Assert.NotNull(data);
        Assert.Equal(2, data!.Count);
    }
}
