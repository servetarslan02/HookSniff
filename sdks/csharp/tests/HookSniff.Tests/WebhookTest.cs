using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using HookSniff;
using Xunit;

namespace HookSniff.Tests;

public class WebhookTest
{
    // A known base64-encoded secret for testing
    private const string TestSecretBase64 = "dGVzdC1zZWNyZXQta2V5MTIzNDU2Nzg5MA==";
    private const string TestSecret = "whsec_" + TestSecretBase64;
    private const string MsgId = "msg_test123";
    private const string Payload = "{\"type\":\"order.created\",\"data\":{\"id\":1}}";

    /// <summary>
    /// Helper: decode secret bytes (strip whsec_ prefix, base64-decode).
    /// Mirrors the Webhook.DecodeSecret logic.
    /// </summary>
    private static byte[] DecodeSecret(string secret)
    {
        var raw = secret.StartsWith("whsec_") ? secret[6..] : secret;
        try { return Convert.FromBase64String(raw); }
        catch (FormatException) { return Encoding.UTF8.GetBytes(raw); }
    }

    /// <summary>
    /// Helper: compute HMAC-SHA256 signature string for a given secret, msgId, timestamp, payload.
    /// </summary>
    private static string ComputeSignature(string secret, string msgId, long timestamp, string payload)
    {
        var key = DecodeSecret(secret);
        var content = $"{msgId}.{timestamp}.{payload}";
        using var hmac = new HMACSHA256(key);
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(content));
        return $"v1,{Convert.ToBase64String(hash)}";
    }

    /// <summary>
    /// Helper: build a standard webhook headers dictionary.
    /// </summary>
    private static Dictionary<string, string> MakeHeaders(
        string msgId, long timestamp, string signature,
        string idKey = "webhook-id", string tsKey = "webhook-timestamp", string sigKey = "webhook-signature")
    {
        return new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            [idKey] = msgId,
            [tsKey] = timestamp.ToString(),
            [sigKey] = signature
        };
    }

    // ───────────────────────────────────────────────
    // 1. Valid signature verification succeeds
    // ───────────────────────────────────────────────
    [Fact]
    public void Verify_ValidSignature_ReturnsPayload()
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var sig = ComputeSignature(TestSecret, MsgId, timestamp, Payload);
        var headers = MakeHeaders(MsgId, timestamp, sig);

        var webhook = new Webhook(TestSecret);
        var result = webhook.Verify(Payload, headers);

        Assert.Equal(JsonValueKind.Object, result.ValueKind);
        Assert.Equal("order.created", result.GetProperty("type").GetString());
        Assert.Equal(1, result.GetProperty("data").GetProperty("id").GetInt32());
    }

    // ───────────────────────────────────────────────
    // 2. Invalid signature fails
    // ───────────────────────────────────────────────
    [Fact]
    public void Verify_InvalidSignature_ThrowsWebhookVerificationError()
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var badSig = "v1,aW52YWxpZC1zaWduYXR1cmU="; // "invalid-signature" base64
        var headers = MakeHeaders(MsgId, timestamp, badSig);

        var webhook = new Webhook(TestSecret);

        var ex = Assert.Throws<WebhookVerificationError>(() => webhook.Verify(Payload, headers));
        Assert.Contains("Invalid webhook signature", ex.Message);
    }

    // ───────────────────────────────────────────────
    // 3. Missing webhook-id header fails
    // ───────────────────────────────────────────────
    [Fact]
    public void Verify_MissingWebhookId_ThrowsWebhookVerificationError()
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var sig = ComputeSignature(TestSecret, MsgId, timestamp, Payload);
        var headers = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["webhook-timestamp"] = timestamp.ToString(),
            ["webhook-signature"] = sig
        };

        var webhook = new Webhook(TestSecret);

        var ex = Assert.Throws<WebhookVerificationError>(() => webhook.Verify(Payload, headers));
        Assert.Contains("Missing webhook-id", ex.Message);
    }

    // ───────────────────────────────────────────────
    // 4. Missing webhook-timestamp header fails
    // ───────────────────────────────────────────────
    [Fact]
    public void Verify_MissingWebhookTimestamp_ThrowsWebhookVerificationError()
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var sig = ComputeSignature(TestSecret, MsgId, timestamp, Payload);
        var headers = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["webhook-id"] = MsgId,
            ["webhook-signature"] = sig
        };

        var webhook = new Webhook(TestSecret);

        var ex = Assert.Throws<WebhookVerificationError>(() => webhook.Verify(Payload, headers));
        Assert.Contains("Missing webhook-timestamp", ex.Message);
    }

    // ───────────────────────────────────────────────
    // 5. Missing webhook-signature header fails
    // ───────────────────────────────────────────────
    [Fact]
    public void Verify_MissingWebhookSignature_ThrowsWebhookVerificationError()
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var headers = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["webhook-id"] = MsgId,
            ["webhook-timestamp"] = timestamp.ToString()
        };

        var webhook = new Webhook(TestSecret);

        var ex = Assert.Throws<WebhookVerificationError>(() => webhook.Verify(Payload, headers));
        Assert.Contains("Missing webhook-signature", ex.Message);
    }

    // ───────────────────────────────────────────────
    // 6. Expired timestamp (>5 min) fails
    // ───────────────────────────────────────────────
    [Fact]
    public void Verify_ExpiredTimestamp_ThrowsWebhookVerificationError()
    {
        // 10 minutes ago — well outside the 5-minute tolerance
        var oldTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds() - 600;
        var sig = ComputeSignature(TestSecret, MsgId, oldTimestamp, Payload);
        var headers = MakeHeaders(MsgId, oldTimestamp, sig);

        var webhook = new Webhook(TestSecret);

        var ex = Assert.Throws<WebhookVerificationError>(() => webhook.Verify(Payload, headers));
        Assert.Contains("too old or too new", ex.Message);
    }

    // ───────────────────────────────────────────────
    // 7. Svix-branded headers work
    // ───────────────────────────────────────────────
    [Fact]
    public void Verify_SvixBrandedHeaders_Succeeds()
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var sig = ComputeSignature(TestSecret, MsgId, timestamp, Payload);
        var headers = MakeHeaders(MsgId, timestamp, sig,
            idKey: "svix-id", tsKey: "svix-timestamp", sigKey: "svix-signature");

        var webhook = new Webhook(TestSecret);
        var result = webhook.Verify(Payload, headers);

        Assert.Equal("order.created", result.GetProperty("type").GetString());
    }

    // ───────────────────────────────────────────────
    // 8. Multiple comma-separated signatures work
    // ───────────────────────────────────────────────
    [Fact]
    public void Verify_MultipleSignatures_WithValidAmongThem_Succeeds()
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var validSig = ComputeSignature(TestSecret, MsgId, timestamp, Payload);
        var validSigPart = validSig.Split(',')[1];
        var fullMultiSig = $"v1,aW52YWxpZC1vbGUtc2ln,{validSigPart}";

        var headers = MakeHeaders(MsgId, timestamp, fullMultiSig);

        var webhook = new Webhook(TestSecret);
        var result = webhook.Verify(Payload, headers);

        Assert.Equal(JsonValueKind.Object, result.ValueKind);
    }

    // ───────────────────────────────────────────────
    // 9. sign() produces a verifiable signature
    // ───────────────────────────────────────────────
    [Fact]
    public void Sign_ProducesVerifiableSignature()
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var webhook = new Webhook(TestSecret);

        // Sign the payload
        var signature = webhook.Sign(MsgId, timestamp, Payload);

        // Build headers from the signature
        var headers = MakeHeaders(MsgId, timestamp, signature);

        // Verify should succeed with the signed data
        var result = webhook.Verify(Payload, headers);
        Assert.Equal("order.created", result.GetProperty("type").GetString());
    }

    // ───────────────────────────────────────────────
    // 10. Secret with and without whsec_ prefix works
    // ───────────────────────────────────────────────
    [Fact]
    public void Verify_SecretWithWhsecPrefix_Succeeds()
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        // Sign with the whsec_ prefixed secret
        var sig = ComputeSignature(TestSecret, MsgId, timestamp, Payload);
        var headers = MakeHeaders(MsgId, timestamp, sig);

        var webhook = new Webhook(TestSecret);
        var result = webhook.Verify(Payload, headers);

        Assert.Equal(JsonValueKind.Object, result.ValueKind);
    }

    [Fact]
    public void Verify_SecretWithoutWhsecPrefix_Succeeds()
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        // Sign using the raw secret (no whsec_ prefix)
        var rawSecret = TestSecretBase64;
        var sig = ComputeSignature(rawSecret, MsgId, timestamp, Payload);
        var headers = MakeHeaders(MsgId, timestamp, sig);

        // Verify using the prefixed secret — should still work since DecodeSecret strips the prefix
        var webhook = new Webhook(TestSecret);
        var result = webhook.Verify(Payload, headers);

        Assert.Equal(JsonValueKind.Object, result.ValueKind);
    }

    [Fact]
    public void Verify_SignedWithPrefixed_VerifyWithRaw_Succeeds()
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        // Sign with whsec_ prefix secret
        var sig = ComputeSignature(TestSecret, MsgId, timestamp, Payload);
        var headers = MakeHeaders(MsgId, timestamp, sig);

        // Verify with raw (no prefix) secret — both should decode to same bytes
        var webhook = new Webhook(TestSecretBase64);
        var result = webhook.Verify(Payload, headers);

        Assert.Equal("order.created", result.GetProperty("type").GetString());
    }

    // ───────────────────────────────────────────────
    // Bonus: VerifyWithSecret static convenience method
    // ───────────────────────────────────────────────
    [Fact]
    public void VerifyWithSecret_StaticMethod_Succeeds()
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var sig = ComputeSignature(TestSecret, MsgId, timestamp, Payload);
        var headers = MakeHeaders(MsgId, timestamp, sig);

        var result = Webhook.VerifyWithSecret(TestSecret, Payload, headers);

        Assert.Equal("order.created", result.GetProperty("type").GetString());
    }

    // ───────────────────────────────────────────────
    // Bonus: Header key casing is case-insensitive
    // ───────────────────────────────────────────────
    [Fact]
    public void Verify_MixedCaseHeaders_Succeeds()
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var sig = ComputeSignature(TestSecret, MsgId, timestamp, Payload);
        var headers = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["Webhook-Id"] = MsgId,
            ["Webhook-Timestamp"] = timestamp.ToString(),
            ["Webhook-Signature"] = sig
        };

        var webhook = new Webhook(TestSecret);
        var result = webhook.Verify(Payload, headers);

        Assert.Equal(JsonValueKind.Object, result.ValueKind);
    }

    // ───────────────────────────────────────────────
    // Bonus: Future timestamp fails
    // ───────────────────────────────────────────────
    [Fact]
    public void Verify_FutureTimestamp_ThrowsWebhookVerificationError()
    {
        var futureTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds() + 600;
        var sig = ComputeSignature(TestSecret, MsgId, futureTimestamp, Payload);
        var headers = MakeHeaders(MsgId, futureTimestamp, sig);

        var webhook = new Webhook(TestSecret);

        var ex = Assert.Throws<WebhookVerificationError>(() => webhook.Verify(Payload, headers));
        Assert.Contains("too old or too new", ex.Message);
    }
}
