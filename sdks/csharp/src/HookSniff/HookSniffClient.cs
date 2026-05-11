using HookSniff.Resources;

namespace HookSniff;

/// <summary>
/// HookSniff SDK — Main Entry Point
///
/// Usage:
///   var hs = new HookSniffClient("your-api-key");
///
///   // List endpoints
///   var endpoints = await hs.Endpoints.ListAsync();
///
///   // Send a webhook
///   var delivery = await hs.Webhooks.SendAsync(new { endpoint_id = "ep_123", @event = "order.created", data = new { order_id = "12345" } });
///
///   // Verify incoming webhook signature
///   var payload = Webhook.Verify("whsec_...", rawBody, headers);
/// </summary>
public class HookSniffClient
{
    private const string DefaultBaseUrl = "https://hooksniff-api-1046140057667.europe-west1.run.app";

    internal readonly RequestContext Ctx;

    public Endpoints Endpoints { get; }
    public Webhooks Webhooks { get; }
    public Auth Auth { get; }
    public Analytics Analytics { get; }
    public ApiKeys ApiKeys { get; }
    public Alerts Alerts { get; }
    public Teams Teams { get; }
    public Search Search { get; }
    public Billing Billing { get; }
    public Health Health { get; }

    /// <summary>
    /// Create a new HookSniff client.
    /// </summary>
    /// <param name="apiKey">Your API key (JWT token or API key)</param>
    /// <param name="baseUrl">Base URL of the HookSniff API</param>
    /// <param name="timeout">Request timeout in milliseconds</param>
    /// <param name="numRetries">Number of retries for 5xx errors</param>
    public HookSniffClient(
        string apiKey,
        string? baseUrl = null,
        int timeout = 30000,
        int numRetries = 2)
    {
        if (string.IsNullOrEmpty(apiKey))
            throw new ArgumentException("HookSniff: apiKey is required", nameof(apiKey));

        Ctx = new RequestContext(
            (baseUrl ?? DefaultBaseUrl).TrimEnd('/'),
            apiKey,
            TimeSpan.FromMilliseconds(timeout),
            numRetries
        );

        Endpoints = new Endpoints(Ctx);
        Webhooks = new Webhooks(Ctx);
        Auth = new Auth(Ctx);
        Analytics = new Analytics(Ctx);
        ApiKeys = new ApiKeys(Ctx);
        Alerts = new Alerts(Ctx);
        Teams = new Teams(Ctx);
        Search = new Search(Ctx);
        Billing = new Billing(Ctx);
        Health = new Health(Ctx);
    }
}
