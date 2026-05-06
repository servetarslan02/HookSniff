package com.hookrelay;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Map;

/**
 * Webhook signature verification for HookRelay.
 *
 * <p>Supports both simple HMAC-SHA256 verification and Standard Webhooks
 * (Svix-compatible) verification with timestamp tolerance.</p>
 */
public class WebhookVerification {

    private static final int DEFAULT_TOLERANCE_SECS = 300;
    private static final Gson GSON = new Gson();

    /**
     * Verify a webhook signature using HMAC-SHA256.
     *
     * @param payload   The raw request body
     * @param signature The signature from the X-Hookrelay-Signature header
     * @param secret    The endpoint's signing secret (starts with "whsec_")
     * @return true if the signature is valid
     */
    public static boolean verifySignature(String payload, String signature, String secret) {
        if (payload == null || payload.isEmpty()) return false;
        if (signature == null || signature.isEmpty()) return false;
        if (secret == null || secret.isEmpty()) return false;

        String expectedHex = signature.startsWith("sha256=") ? signature.substring(7) : signature;

        try {
            String computed = hmacSha256Hex(secret, payload);
            return constantTimeEquals(computed, expectedHex);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Verify a webhook using Standard Webheaders headers (Svix-compatible).
     *
     * @param payload         The raw request body
     * @param msgId           The webhook-id header
     * @param timestamp       The webhook-timestamp header
     * @param signatureHeader The webhook-signature header
     * @param secret          The endpoint's signing secret
     * @return VerificationResult with valid flag and parsed payload
     */
    public static VerificationResult verifyWebhook(String payload, String msgId,
                                                    String timestamp, String signatureHeader,
                                                    String secret) {
        return verifyWebhook(payload, msgId, timestamp, signatureHeader, secret, DEFAULT_TOLERANCE_SECS);
    }

    /**
     * Verify a webhook using Standard Webheaders headers with custom tolerance.
     */
    public static VerificationResult verifyWebhook(String payload, String msgId,
                                                    String timestamp, String signatureHeader,
                                                    String secret, int toleranceSecs) {
        if (msgId == null || msgId.isEmpty()) {
            return VerificationResult.invalid("Missing webhook-id header");
        }
        if (timestamp == null || timestamp.isEmpty()) {
            return VerificationResult.invalid("Missing webhook-timestamp header");
        }
        if (signatureHeader == null || signatureHeader.isEmpty()) {
            return VerificationResult.invalid("Missing webhook-signature header");
        }
        if (payload == null || payload.isEmpty()) {
            return VerificationResult.invalid("Missing request body");
        }

        // Validate timestamp
        long ts;
        try {
            ts = Long.parseLong(timestamp);
        } catch (NumberFormatException e) {
            return VerificationResult.invalid("Invalid webhook timestamp");
        }

        long now = System.currentTimeMillis() / 1000;
        long age = Math.abs(now - ts);

        if (age > toleranceSecs) {
            return VerificationResult.invalid(
                String.format("Webhook timestamp expired: %ds old (tolerance: %ds)", age, toleranceSecs));
        }

        // Compute expected signature
        String signedContent = msgId + "." + timestamp + "." + payload;
        byte[] secretBytes = decodeSecret(secret);

        try {
            String expectedSig = Base64.getEncoder().encodeToString(hmacSha256(secretBytes, signedContent));
            String expectedFull = "v1," + expectedSig;

            // Check each signature in the header (space-separated)
            String[] signatures = signatureHeader.split(" ");
            boolean verified = false;

            for (String sig : signatures) {
                String trimmed = sig.trim();
                if (!trimmed.startsWith("v1,")) continue;

                if (constantTimeEquals(trimmed, expectedFull)) {
                    verified = true;
                    break;
                }
            }

            if (!verified) {
                return VerificationResult.invalid("Invalid webhook signature");
            }
        } catch (Exception e) {
            return VerificationResult.invalid("Signature computation failed");
        }

        // Parse payload
        try {
            JsonObject parsed = GSON.fromJson(payload, JsonObject.class);
            return VerificationResult.valid(parsed);
        } catch (Exception e) {
            return VerificationResult.valid(payload);
        }
    }

    // ==================== Helpers ====================

    private static String hmacSha256Hex(String key, String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return bytesToHex(hash);
    }

    private static byte[] hmacSha256(byte[] key, String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key, "HmacSHA256"));
        return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b & 0xff));
        }
        return sb.toString();
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        return MessageDigest.isEqual(
            a.getBytes(StandardCharsets.UTF_8),
            b.getBytes(StandardCharsets.UTF_8)
        );
    }

    private static byte[] decodeSecret(String secret) {
        String stripped = secret.startsWith("whsec_") ? secret.substring(6) : secret;
        try {
            return Base64.getDecoder().decode(stripped);
        } catch (IllegalArgumentException e) {
            return secret.getBytes(StandardCharsets.UTF_8);
        }
    }

    /**
     * Result of webhook verification.
     */
    public static class VerificationResult {
        private final boolean valid;
        private final Object payload;
        private final String error;

        private VerificationResult(boolean valid, Object payload, String error) {
            this.valid = valid;
            this.payload = payload;
            this.error = error;
        }

        static VerificationResult valid(Object payload) {
            return new VerificationResult(true, payload, null);
        }

        static VerificationResult invalid(String error) {
            return new VerificationResult(false, null, error);
        }

        public boolean isValid() { return valid; }
        public Object getPayload() { return payload; }
        public String getError() { return error; }
    }
}
