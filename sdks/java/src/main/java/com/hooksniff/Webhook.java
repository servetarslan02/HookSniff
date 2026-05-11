package com.hooksniff;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Map;

/**
 * Webhook signature verification for incoming webhooks.
 *
 * Verifies HMAC-SHA256 signatures in Standard Webhooks format.
 * Supports whsec_ prefixed secrets and replay protection (5-minute tolerance).
 *
 * Usage:
 *   Webhook wh = new Webhook("whsec_...");
 *   Object payload = wh.verify(rawBody, headers);
 */
public class Webhook {
    private static final long TIMESTAMP_TOLERANCE_SECONDS = 5 * 60; // 5 minutes
    private final byte[] secret;

    /**
     * Create a new Webhook verifier.
     *
     * @param secret The endpoint's signing secret (e.g., "whsec_base64encoded...")
     */
    public Webhook(String secret) {
        this.secret = decodeSecret(secret);
    }

    /**
     * Verify a webhook payload against its signature headers.
     *
     * @param payload The raw request body
     * @param headers Map containing webhook-id, webhook-timestamp, webhook-signature
     * @return The parsed payload as a Map if verification succeeds
     * @throws WebhookVerificationError if verification fails
     */
    public Map<String, Object> verify(String payload, Map<String, String> headers) throws WebhookVerificationError {
        // Normalize headers to lowercase
        Map<String, String> normalized = new java.util.HashMap<>();
        for (Map.Entry<String, String> entry : headers.entrySet()) {
            normalized.put(entry.getKey().toLowerCase(), entry.getValue());
        }

        // Support both svix- and webhook- prefixed headers
        String msgId = getHeader(normalized, "svix-id", "webhook-id");
        String timestamp = getHeader(normalized, "svix-timestamp", "webhook-timestamp");
        String signature = getHeader(normalized, "svix-signature", "webhook-signature");

        if (msgId == null) {
            throw new WebhookVerificationError("Missing webhook-id header");
        }
        if (timestamp == null) {
            throw new WebhookVerificationError("Missing webhook-timestamp header");
        }
        if (signature == null) {
            throw new WebhookVerificationError("Missing webhook-signature header");
        }

        // Validate timestamp (prevent replay attacks)
        long timestampNum;
        try {
            timestampNum = Long.parseLong(timestamp);
        } catch (NumberFormatException e) {
            throw new WebhookVerificationError("Invalid webhook-timestamp header");
        }

        long now = System.currentTimeMillis() / 1000;
        if (Math.abs(now - timestampNum) > TIMESTAMP_TOLERANCE_SECONDS) {
            throw new WebhookVerificationError(
                    "Webhook timestamp is too old or too new (tolerance: " + TIMESTAMP_TOLERANCE_SECONDS + "s)");
        }

        // Compute expected signature
        String content = msgId + "." + timestamp + "." + payload;
        String expectedSig = computeHmacSha256(secret, content);
        String expected = "v1," + expectedSig;

        // Timing-safe comparison
        if (!verifySignature(expected, signature)) {
            throw new WebhookVerificationError("Invalid webhook signature");
        }

        // Parse and return payload
        try {
            com.google.gson.Gson gson = new com.google.gson.Gson();
            java.lang.reflect.Type type = new com.google.gson.reflect.TypeToken<Map<String, Object>>(){}.getType();
            return gson.fromJson(payload, type);
        } catch (Exception e) {
            throw new WebhookVerificationError("Failed to parse payload as JSON");
        }
    }

    /**
     * Sign a payload (for testing or server-side webhook sending).
     *
     * @param msgId    The message ID
     * @param timestamp The timestamp in seconds since epoch
     * @param payload  The payload to sign
     * @return The signature string (e.g., "v1,base64hmac")
     */
    public String sign(String msgId, long timestamp, String payload) {
        String content = msgId + "." + timestamp + "." + payload;
        String hmac = computeHmacSha256(secret, content);
        return "v1," + hmac;
    }

    // --- Private helpers ---

    private static String getHeader(Map<String, String> headers, String primary, String fallback) {
        String value = headers.get(primary);
        if (value == null) value = headers.get(fallback);
        return value;
    }

    private static byte[] decodeSecret(String secret) {
        // Strip whsec_ prefix if present
        String raw = secret.startsWith("whsec_") ? secret.substring(6) : secret;

        // Try base64 decode
        try {
            return Base64.getDecoder().decode(raw);
        } catch (IllegalArgumentException e) {
            return raw.getBytes(StandardCharsets.UTF_8);
        }
    }

    private static String computeHmacSha256(byte[] key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(key, "HmacSHA256");
            mac.init(keySpec);
            byte[] result = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(result);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("HMAC-SHA256 computation failed", e);
        }
    }

    /**
     * Timing-safe signature comparison.
     * Supports multiple comma-separated signatures.
     */
    private static boolean verifySignature(String expected, String actual) {
        String[] signatures = actual.split(",");
        String[] expectedParts = expected.split(",", 2);
        String expectedSig = expectedParts.length > 1 ? expectedParts[1] : expectedParts[0];

        for (String sig : signatures) {
            String trimmed = sig.trim();
            String[] parts = trimmed.split(",", 2);
            String signaturePart = parts.length > 1 ? parts[1] : parts[0];

            if (MessageDigest.isEqual(
                    expectedSig.getBytes(StandardCharsets.UTF_8),
                    signaturePart.getBytes(StandardCharsets.UTF_8))) {
                return true;
            }
        }
        return false;
    }
}
