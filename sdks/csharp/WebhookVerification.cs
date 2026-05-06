using System;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace HookRelay
{
    /// <summary>
    /// Result of webhook verification.
    /// </summary>
    public class HookRelayVerificationResult
    {
        public bool Valid { get; set; }
        public object? Payload { get; set; }
        public string? Error { get; set; }

        public static HookRelayVerificationResult Invalid(string error) =>
            new HookRelayVerificationResult { Valid = false, Error = error };

        public static HookRelayVerificationResult ValidResult(object payload) =>
            new HookRelayVerificationResult { Valid = true, Payload = payload };
    }

    /// <summary>
    /// Webhook signature verification for HookRelay.
    ///
    /// Supports both simple HMAC-SHA256 verification and Standard Webheaders
    /// (Svix-compatible) verification with timestamp tolerance.
    /// Also supports Svix headers (svix-id, svix-signature, svix-timestamp) as fallback.
    /// </summary>
    public static class WebhookVerification
    {
        private const int DefaultToleranceSecs = 300;

        /// <summary>
        /// Verify a webhook from HTTP headers with automatic header detection.
        /// Supports both Standard Webhooks and Svix headers.
        /// </summary>
        public static HookRelayVerificationResult VerifyWebhookFromHeaders(
            string payload, System.Net.WebHeaderCollection headers, string secret, int toleranceSecs = DefaultToleranceSecs)
        {
            var msgId = headers["webhook-id"];
            var timestamp = headers["webhook-timestamp"];
            var signatureHeader = headers["webhook-signature"];

            if (string.IsNullOrEmpty(msgId) || string.IsNullOrEmpty(timestamp) || string.IsNullOrEmpty(signatureHeader))
            {
                msgId = msgId ?? headers["svix-id"];
                timestamp = timestamp ?? headers["svix-timestamp"];
                signatureHeader = signatureHeader ?? headers["svix-signature"];
            }

            return VerifyWebhook(payload, msgId, timestamp, signatureHeader, secret, toleranceSecs);
        }

        /// <summary>
        /// Verify a webhook signature using HMAC-SHA256.
        /// </summary>
        /// <param name="payload">The raw request body</param>
        /// <param name="signature">The signature from the X-Hookrelay-Signature header</param>
        /// <param name="secret">The endpoint's signing secret (starts with "whsec_")</param>
        /// <returns>true if the signature is valid</returns>
        public static bool VerifySignature(string payload, string signature, string secret)
        {
            if (string.IsNullOrEmpty(payload) || string.IsNullOrEmpty(signature) || string.IsNullOrEmpty(secret))
                return false;

            var expectedHex = signature.StartsWith("sha256=") ? signature[7..] : signature;

            try
            {
                using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
                var computed = Convert.ToHexString(hash).ToLowerInvariant();

                return CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(computed),
                    Encoding.UTF8.GetBytes(expectedHex));
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Verify a webhook using Standard Webheaders headers (Svix-compatible).
        /// </summary>
        public static HookRelayVerificationResult VerifyWebhook(
            string payload, string? msgId, string? timestamp,
            string? signatureHeader, string secret, int toleranceSecs = DefaultToleranceSecs)
        {
            if (string.IsNullOrEmpty(msgId))
                return HookRelayVerificationResult.Invalid("Missing webhook-id header");
            if (string.IsNullOrEmpty(timestamp))
                return HookRelayVerificationResult.Invalid("Missing webhook-timestamp header");
            if (string.IsNullOrEmpty(signatureHeader))
                return HookRelayVerificationResult.Invalid("Missing webhook-signature header");
            if (string.IsNullOrEmpty(payload))
                return HookRelayVerificationResult.Invalid("Missing request body");

            // Validate timestamp
            if (!long.TryParse(timestamp, out var ts))
                return HookRelayVerificationResult.Invalid("Invalid webhook timestamp");

            var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

            if (now - ts > toleranceSecs)
                return HookRelayVerificationResult.Invalid("Message timestamp too old");
            if (ts > now + toleranceSecs)
                return HookRelayVerificationResult.Invalid("Message timestamp too new");

            // Compute expected signature
            var signedContent = $"{msgId}.{timestamp}.{payload}";
            var secretBytes = DecodeSecret(secret);

            try
            {
                using var hmac = new HMACSHA256(secretBytes);
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(signedContent));
                var expectedSig = Convert.ToBase64String(hash);
                var expectedFull = $"v1,{expectedSig}";

                // Check each signature in the header (space-separated)
                var signatures = signatureHeader.Split(' ');
                var verified = false;

                foreach (var sig in signatures)
                {
                    var trimmed = sig.Trim();
                    if (!trimmed.StartsWith("v1,")) continue;

                    if (trimmed.Length == expectedFull.Length &&
                        CryptographicOperations.FixedTimeEquals(
                            Encoding.UTF8.GetBytes(trimmed),
                            Encoding.UTF8.GetBytes(expectedFull)))
                    {
                        verified = true;
                        break;
                    }
                }

                if (!verified)
                    return HookRelayVerificationResult.Invalid("Invalid webhook signature");
            }
            catch
            {
                return HookRelayVerificationResult.Invalid("Signature computation failed");
            }

            // Parse payload
            try
            {
                var parsed = JsonSerializer.Deserialize<JsonElement>(payload);
                return HookRelayVerificationResult.ValidResult(parsed);
            }
            catch
            {
                return HookRelayVerificationResult.ValidResult(payload);
            }
        }

        private static byte[] DecodeSecret(string secret)
        {
            var stripped = secret.StartsWith("whsec_") ? secret[6..] : secret;
            // Add padding in case secret is unpadded base64
            var padding = (4 - stripped.Length % 4) % 4;
            stripped += new string('=', padding);
            try
            {
                return Convert.FromBase64String(stripped);
            }
            catch
            {
                return Encoding.UTF8.GetBytes(secret);
            }
        }
    }
}
