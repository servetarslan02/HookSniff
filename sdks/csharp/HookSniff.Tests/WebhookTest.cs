using System;
using System.Security.Cryptography;
using System.Text;
using Xunit;
using HookSniff;

namespace HookSniff.Tests
{
    public class WebhookTest
    {
        private const string SECRET = "whsec_dGVzdA==";
        private const string MSG_ID = "msg_test123";
        private static readonly long TIMESTAMP = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        private const string PAYLOAD = "{\"event\":\"test\"}";

        private string Sign(string secret, string msgId, long timestamp, string payload)
        {
            var decoded = Convert.FromBase64String(secret.Replace("whsec_", ""));
            var toSign = $"{msgId}.{timestamp}.{payload}";
            using var hmac = new HMACSHA256(decoded);
            var sig = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(toSign)));
            return $"v1,{sig}";
        }

        [Fact]
        public void TestVerifyValidSignature()
        {
            var wh = new Webhook(SECRET);
            var sig = Sign(SECRET, MSG_ID, TIMESTAMP, PAYLOAD);
            var headers = new System.Collections.Generic.Dictionary<string, string>
            {
                { "webhook-id", MSG_ID },
                { "webhook-timestamp", TIMESTAMP.ToString() },
                { "webhook-signature", sig }
            };
            var result = wh.Verify(PAYLOAD, headers);
            Assert.NotNull(result);
        }

        [Fact]
        public void TestRejectInvalidSignature()
        {
            var wh = new Webhook(SECRET);
            var headers = new System.Collections.Generic.Dictionary<string, string>
            {
                { "webhook-id", MSG_ID },
                { "webhook-timestamp", TIMESTAMP.ToString() },
                { "webhook-signature", "v1,invalid" }
            };
            Assert.Throws<WebhookVerificationException>(() => wh.Verify(PAYLOAD, headers));
        }

        [Fact]
        public void TestSvixBrandedHeaders()
        {
            var wh = new Webhook(SECRET);
            var sig = Sign(SECRET, MSG_ID, TIMESTAMP, PAYLOAD);
            var headers = new System.Collections.Generic.Dictionary<string, string>
            {
                { "svix-id", MSG_ID },
                { "svix-timestamp", TIMESTAMP.ToString() },
                { "svix-signature", sig }
            };
            var result = wh.Verify(PAYLOAD, headers);
            Assert.NotNull(result);
        }
    }
}
