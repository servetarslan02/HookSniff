using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Xunit;

namespace HookSniff.Test;

public class WebhookTests
{
    private readonly string _testSecret;
    private readonly string _testBody;
    private readonly string _testMsgId;
    private readonly long _testTimestamp;

    public WebhookTests()
    {
        _testSecret = "whsec_" + Convert.ToBase64String(Encoding.UTF8.GetBytes("test-secret-key-for-hmac-verify"));
        _testBody = "{\"event\":\"order.created\",\"data\":{\"order_id\":\"12345\"}}";
        _testMsgId = "msg_test123";
        _testTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
    }

    private string SignPayload(string secret, string msgId, long timestamp, string body)
    {
        var raw = secret.StartsWith("whsec_") ? secret[6..] : secret;
        byte[] decoded;
        try { decoded = Convert.FromBase64String(raw); }
        catch (FormatException) { decoded = Encoding.UTF8.GetBytes(raw); }

        var content = $"{msgId}.{timestamp}.{body}";
        using var hmac = new HMACSHA256(decoded);
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(content));
        return "v1," + Convert.ToBase64String(hash);
    }

    private Dictionary<string, string> ValidHeaders(string? msgId = null, long? timestamp = null)
    {
        var mid = msgId ?? _testMsgId;
        var ts = timestamp ?? _testTimestamp;
        return new Dictionary<string, string>
        {
            ["webhook-id"] = mid,
            ["webhook-timestamp"] = ts.ToString(),
            ["webhook-signature"] = SignPayload(_testSecret, mid, ts, _testBody)
        };
    }

    [Fact]
    public void ValidSignatureReturnsParsedJson()
    {
        var wh = new Webhook(_testSecret);
        var result = wh.Verify(_testBody, ValidHeaders());
        Assert.Equal("order.created", result.GetProperty("event").GetString());
        Assert.Equal("12345", result.GetProperty("data").GetProperty("order_id").GetString());
    }

    [Fact]
    public void InvalidSignatureThrowsError()
    {
        var wh = new Webhook(_testSecret);
        var headers = ValidHeaders();
        headers["webhook-signature"] = "v1,aW52YWxpZHNpZ25hdHVyZQ==";
        var ex = Assert.Throws<WebhookVerificationError>(() => wh.Verify(_testBody, headers));
        Assert.Contains("Invalid webhook signature", ex.Message);
    }

    [Fact]
    public void MissingWebhookIdThrowsError()
    {
        var wh = new Webhook(_testSecret);
        var headers = ValidHeaders();
        headers.Remove("webhook-id");
        var ex = Assert.Throws<WebhookVerificationError>(() => wh.Verify(_testBody, headers));
        Assert.Contains("Missing webhook-id", ex.Message);
    }

    [Fact]
    public void MissingWebhookTimestampThrowsError()
    {
        var wh = new Webhook(_testSecret);
        var headers = ValidHeaders();
        headers.Remove("webhook-timestamp");
        var ex = Assert.Throws<WebhookVerificationError>(() => wh.Verify(_testBody, headers));
        Assert.Contains("Missing webhook-timestamp", ex.Message);
    }

    [Fact]
    public void MissingWebhookSignatureThrowsError()
    {
        var wh = new Webhook(_testSecret);
        var headers = ValidHeaders();
        headers.Remove("webhook-signature");
        var ex = Assert.Throws<WebhookVerificationError>(() => wh.Verify(_testBody, headers));
        Assert.Contains("Missing webhook-signature", ex.Message);
    }

    [Fact]
    public void ExpiredTimestampThrowsError()
    {
        var wh = new Webhook(_testSecret);
        var oldTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds() - 600; // 10 min ago
        var headers = ValidHeaders(_testMsgId, oldTimestamp);
        var ex = Assert.Throws<WebhookVerificationError>(() => wh.Verify(_testBody, headers));
        Assert.Contains("too old or too new", ex.Message);
    }

    [Fact]
    public void SvixBrandedHeadersWork()
    {
        var wh = new Webhook(_testSecret);
        var sig = SignPayload(_testSecret, _testMsgId, _testTimestamp, _testBody);
        var headers = new Dictionary<string, string>
        {
            ["svix-id"] = _testMsgId,
            ["svix-timestamp"] = _testTimestamp.ToString(),
            ["svix-signature"] = sig
        };
        var result = wh.Verify(_testBody, headers);
        Assert.Equal("order.created", result.GetProperty("event").GetString());
    }

    [Fact]
    public void MultipleSignaturesWork()
    {
        var wh = new Webhook(_testSecret);
        var realSig = SignPayload(_testSecret, _testMsgId, _testTimestamp, _testBody);
        var headers = ValidHeaders();
        headers["webhook-signature"] = "v1,aW52YWxpZA==," + realSig;
        var result = wh.Verify(_testBody, headers);
        Assert.Equal("order.created", result.GetProperty("event").GetString());
    }

    [Fact]
    public void SignProducesVerifiableSignature()
    {
        var wh = new Webhook(_testSecret);
        var sig = wh.Sign(_testMsgId, _testTimestamp, _testBody);
        Assert.StartsWith("v1,", sig);

        var headers = new Dictionary<string, string>
        {
            ["webhook-id"] = _testMsgId,
            ["webhook-timestamp"] = _testTimestamp.ToString(),
            ["webhook-signature"] = sig
        };
        var result = wh.Verify(_testBody, headers);
        Assert.Equal("order.created", result.GetProperty("event").GetString());
    }

    [Fact]
    public void SecretWithAndWithoutWhsecPrefix()
    {
        var rawSecret = Convert.ToBase64String(Encoding.UTF8.GetBytes("test-secret-key-for-hmac-verify"));
        var prefixed = "whsec_" + rawSecret;

        var whPrefixed = new Webhook(prefixed);
        var whRaw = new Webhook(rawSecret);

        var sig = whRaw.Sign(_testMsgId, _testTimestamp, _testBody);
        var headers = new Dictionary<string, string>
        {
            ["webhook-id"] = _testMsgId,
            ["webhook-timestamp"] = _testTimestamp.ToString(),
            ["webhook-signature"] = sig
        };

        var result1 = whPrefixed.Verify(_testBody, headers);
        var result2 = whRaw.Verify(_testBody, headers);
        Assert.Equal("order.created", result1.GetProperty("event").GetString());
        Assert.Equal("order.created", result2.GetProperty("event").GetString());
    }

    [Fact]
    public void InvalidTimestampFormatThrowsError()
    {
        var wh = new Webhook(_testSecret);
        var headers = ValidHeaders();
        headers["webhook-timestamp"] = "not_a_number";
        var ex = Assert.Throws<WebhookVerificationError>(() => wh.Verify(_testBody, headers));
        Assert.Contains("Invalid webhook-timestamp", ex.Message);
    }

    [Fact]
    public void VerifyWithSecretStaticMethod()
    {
        var sig = SignPayload(_testSecret, _testMsgId, _testTimestamp, _testBody);
        var headers = new Dictionary<string, string>
        {
            ["webhook-id"] = _testMsgId,
            ["webhook-timestamp"] = _testTimestamp.ToString(),
            ["webhook-signature"] = sig
        };
        var result = Webhook.VerifyWithSecret(_testSecret, _testBody, headers);
        Assert.Equal("order.created", result.GetProperty("event").GetString());
    }
}
