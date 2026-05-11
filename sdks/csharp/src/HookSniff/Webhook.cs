using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace HookSniff;

/// <summary>
/// Webhook Verification Error
/// </summary>
public class WebhookVerificationError : Exception
{
    public WebhookVerificationError(string message) : base(message) { }
}

/// <summary>
/// HookSniff Webhook Signature Verification
///
/// Verifies incoming webhook signatures using HMAC-SHA256.
/// Compatible with Standard Webhooks format (whsec_ prefix secrets).
///
/// Usage:
///   var payload = Webhook.Verify("whsec_...", rawBody, headers);
/// </summary>
public class Webhook
{
    private const int TimestampToleranceSeconds = 5 * 60; // 5 minutes

    private readonly byte[] _secret;

    /// <summary>
    /// Create a new Webhook verifier.
    /// </summary>
    /// <param name="secret">The endpoint's signing secret (e.g., "whsec_base64encoded...")</param>
    public Webhook(string secret)
    {
        _secret = DecodeSecret(secret);
    }

    /// <summary>
    /// Verify a webhook payload against its signature headers.
    /// </summary>
    /// <param name="payload">The raw request body</param>
    /// <param name="headers">The request headers containing webhook-id, webhook-timestamp, webhook-signature</param>
    /// <returns>The parsed payload (JsonElement) if verification succeeds</returns>
    /// <exception cref="WebhookVerificationError">Thrown if verification fails</exception>
    public JsonElement Verify(string payload, Dictionary<string, string> headers)
    {
        // Normalize headers to lowercase
        var normalized = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var (key, value) in headers)
        {
            normalized[key.ToLowerInvariant()] = value;
        }

        // Support both svix- and webhook- prefixed headers
        var msgId = normalized.GetValueOrDefault("svix-id") ?? normalized.GetValueOrDefault("webhook-id");
        var timestamp = normalized.GetValueOrDefault("svix-timestamp") ?? normalized.GetValueOrDefault("webhook-timestamp");
        var signature = normalized.GetValueOrDefault("svix-signature") ?? normalized.GetValueOrDefault("webhook-signature");

        if (msgId == null)
            throw new WebhookVerificationError("Missing webhook-id header");
        if (timestamp == null)
            throw new WebhookVerificationError("Missing webhook-timestamp header");
        if (signature == null)
            throw new WebhookVerificationError("Missing webhook-signature header");

        // Validate timestamp (prevent replay attacks)
        if (!long.TryParse(timestamp, out var timestampNum))
            throw new WebhookVerificationError("Invalid webhook-timestamp header");

        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        if (Math.Abs(now - timestampNum) > TimestampToleranceSeconds)
            throw new WebhookVerificationError(
                $"Webhook timestamp is too old or too new (tolerance: {TimestampToleranceSeconds}s)");

        // Compute expected signature
        var content = $"{msgId}.{timestamp}.{payload}";
        var expectedSig = ComputeHmacBase64(_secret, content);
        var expected = $"v1,{expectedSig}";

        // Timing-safe comparison
        if (!VerifySignature(expected, signature))
            throw new WebhookVerificationError("Invalid webhook signature");

        // Parse and return payload
        return JsonSerializer.Deserialize<JsonElement>(payload);
    }

    /// <summary>
    /// Sign a payload (for testing or server-side webhook sending).
    /// </summary>
    /// <param name="msgId">The message ID</param>
    /// <param name="timestamp">Unix timestamp</param>
    /// <param name="payload">The payload to sign</param>
    /// <returns>The signature string (e.g., "v1,base64hmac")</returns>
    public string Sign(string msgId, long timestamp, string payload)
    {
        var content = $"{msgId}.{timestamp}.{payload}";
        var hmac = ComputeHmacBase64(_secret, content);
        return $"v1,{hmac}";
    }

    /// <summary>
    /// Static convenience method for one-shot verification.
    /// </summary>
    public static JsonElement VerifyWithSecret(string secret, string payload, Dictionary<string, string> headers)
    {
        var wh = new Webhook(secret);
        return wh.Verify(payload, headers);
    }

    /// <summary>
    /// Decode a whsec_ prefixed secret to raw bytes.
    /// </summary>
    private static byte[] DecodeSecret(string secret)
    {
        // Strip whsec_ prefix if present
        var raw = secret.StartsWith("whsec_") ? secret[6..] : secret;

        // Try base64 decode
        try
        {
            return Convert.FromBase64String(raw);
        }
        catch (FormatException)
        {
            return Encoding.UTF8.GetBytes(raw);
        }
    }

    /// <summary>
    /// Compute HMAC-SHA256 and return base64 string.
    /// </summary>
    private static string ComputeHmacBase64(byte[] key, string content)
    {
        using var hmac = new HMACSHA256(key);
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(content));
        return Convert.ToBase64String(hash);
    }

    /// <summary>
    /// Verify that a signature matches using timing-safe comparison.
    /// </summary>
    private static bool VerifySignature(string expected, string actual)
    {
        // Each signature can be comma-separated (v1 sig1, v1 sig2, ...)
        var signatures = actual.Split(',').Select(s => s.Trim());

        foreach (var sig in signatures)
        {
            // Strip version prefix
            var parts = sig.Split(',', 2);
            var signaturePart = parts.Length > 1 ? parts[1] : parts[0];

            // Strip version prefix from expected too
            var expectedParts = expected.Split(',', 2);
            var expectedSig = expectedParts.Length > 1 ? expectedParts[1] : expectedParts[0];

            // Length check before timing-safe compare
            if (expectedSig.Length != signaturePart.Length) continue;

            // Timing-safe comparison using byte-level comparison
            if (TimingSafeEquals(expectedSig, signaturePart))
                return true;
        }

        return false;
    }

    /// <summary>
    /// Timing-safe string comparison to prevent timing attacks.
    /// </summary>
    private static bool TimingSafeEquals(string a, string b)
    {
        if (a.Length != b.Length) return false;

        var result = 0;
        for (var i = 0; i < a.Length; i++)
        {
            result |= a[i] ^ b[i];
        }
        return result == 0;
    }
}
