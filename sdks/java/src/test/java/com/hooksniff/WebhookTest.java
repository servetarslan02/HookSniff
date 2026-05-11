package com.hooksniff;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class WebhookTest {

    private static final String SECRET_BASE64 = Base64.getEncoder().encodeToString("test-secret-key-for-hmac".getBytes(StandardCharsets.UTF_8));
    private static final String SECRET = "whsec_" + SECRET_BASE64;
    private static final String MSG_ID = "msg_test123";
    private static final String PAYLOAD = "{\"type\":\"order.created\",\"data\":{\"id\":1}}";

    private Webhook webhook;

    @BeforeEach
    void setUp() {
        webhook = new Webhook(SECRET);
    }

    /**
     * Helper: compute HMAC-SHA256 signature matching Webhook.sign() format.
     */
    private static String computeSignature(String secret, String msgId, long timestamp, String payload) throws Exception {
        // Strip whsec_ and base64-decode to get raw key bytes
        String raw = secret.startsWith("whsec_") ? secret.substring(6) : secret;
        byte[] key = Base64.getDecoder().decode(raw);

        String content = msgId + "." + timestamp + "." + payload;
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec keySpec = new SecretKeySpec(key, "HmacSHA256");
        mac.init(keySpec);
        byte[] result = mac.doFinal(content.getBytes(StandardCharsets.UTF_8));
        String base64Sig = Base64.getEncoder().encodeToString(result);
        return "v1," + base64Sig;
    }

    private static long currentTimestamp() {
        return System.currentTimeMillis() / 1000;
    }

    private static Map<String, String> buildHeaders(String msgId, String timestamp, String signature) {
        Map<String, String> headers = new HashMap<>();
        headers.put("webhook-id", msgId);
        headers.put("webhook-timestamp", timestamp);
        headers.put("webhook-signature", signature);
        return headers;
    }

    // ---------- Tests ----------

    @Test
    void validSignatureVerification() throws Exception {
        long ts = currentTimestamp();
        String sig = computeSignature(SECRET, MSG_ID, ts, PAYLOAD);
        Map<String, String> headers = buildHeaders(MSG_ID, String.valueOf(ts), sig);

        Map<String, Object> result = webhook.verify(PAYLOAD, headers);

        assertNotNull(result);
        assertEquals("order.created", result.get("type"));
    }

    @Test
    void invalidSignatureFails() {
        long ts = currentTimestamp();
        Map<String, String> headers = buildHeaders(MSG_ID, String.valueOf(ts), "v1,invalidsignature");

        WebhookVerificationError ex = assertThrows(WebhookVerificationError.class,
                () -> webhook.verify(PAYLOAD, headers));
        assertTrue(ex.getMessage().contains("Invalid webhook signature"));
    }

    @Test
    void missingWebhookIdHeaderFails() throws Exception {
        long ts = currentTimestamp();
        String sig = computeSignature(SECRET, MSG_ID, ts, PAYLOAD);
        Map<String, String> headers = new HashMap<>();
        headers.put("webhook-timestamp", String.valueOf(ts));
        headers.put("webhook-signature", sig);

        WebhookVerificationError ex = assertThrows(WebhookVerificationError.class,
                () -> webhook.verify(PAYLOAD, headers));
        assertTrue(ex.getMessage().contains("Missing webhook-id"));
    }

    @Test
    void missingWebhookTimestampHeaderFails() throws Exception {
        long ts = currentTimestamp();
        String sig = computeSignature(SECRET, MSG_ID, ts, PAYLOAD);
        Map<String, String> headers = new HashMap<>();
        headers.put("webhook-id", MSG_ID);
        headers.put("webhook-signature", sig);

        WebhookVerificationError ex = assertThrows(WebhookVerificationError.class,
                () -> webhook.verify(PAYLOAD, headers));
        assertTrue(ex.getMessage().contains("Missing webhook-timestamp"));
    }

    @Test
    void missingWebhookSignatureHeaderFails() {
        long ts = currentTimestamp();
        Map<String, String> headers = new HashMap<>();
        headers.put("webhook-id", MSG_ID);
        headers.put("webhook-timestamp", String.valueOf(ts));

        WebhookVerificationError ex = assertThrows(WebhookVerificationError.class,
                () -> webhook.verify(PAYLOAD, headers));
        assertTrue(ex.getMessage().contains("Missing webhook-signature"));
    }

    @Test
    void expiredTimestampFails() throws Exception {
        long oldTs = currentTimestamp() - 6 * 60; // 6 minutes ago
        String sig = computeSignature(SECRET, MSG_ID, oldTs, PAYLOAD);
        Map<String, String> headers = buildHeaders(MSG_ID, String.valueOf(oldTs), sig);

        WebhookVerificationError ex = assertThrows(WebhookVerificationError.class,
                () -> webhook.verify(PAYLOAD, headers));
        assertTrue(ex.getMessage().contains("too old"));
    }

    @Test
    void svixBrandedHeadersWork() throws Exception {
        long ts = currentTimestamp();
        String sig = computeSignature(SECRET, MSG_ID, ts, PAYLOAD);

        Map<String, String> headers = new HashMap<>();
        headers.put("svix-id", MSG_ID);
        headers.put("svix-timestamp", String.valueOf(ts));
        headers.put("svix-signature", sig);

        Map<String, Object> result = webhook.verify(PAYLOAD, headers);
        assertNotNull(result);
        assertEquals("order.created", result.get("type"));
    }

    @Test
    void multipleCommaSeparatedSignaturesWork() throws Exception {
        long ts = currentTimestamp();
        String validSig = computeSignature(SECRET, MSG_ID, ts, PAYLOAD);
        // validSig is "v1,<base64>" — use Svix format: comma-separated complete signatures
        // Simulate two signatures: first bogus, second valid
        String validSigBase64 = validSig.split(",", 2)[1];
        String multiSig = "v1,bogus, v1," + validSigBase64;

        Map<String, String> headers = buildHeaders(MSG_ID, String.valueOf(ts), multiSig);

        Map<String, Object> result = webhook.verify(PAYLOAD, headers);
        assertNotNull(result);
        assertEquals("order.created", result.get("type"));
    }

    @Test
    void signProducesVerifiableSignature() throws Exception {
        long ts = currentTimestamp();
        String signed = webhook.sign(MSG_ID, ts, PAYLOAD);

        Map<String, String> headers = buildHeaders(MSG_ID, String.valueOf(ts), signed);

        Map<String, Object> result = webhook.verify(PAYLOAD, headers);
        assertNotNull(result);
        assertEquals("order.created", result.get("type"));
    }

    @Test
    void secretWithAndWithoutPrefixWorks() throws Exception {
        long ts = currentTimestamp();

        // Sign with whsec_ prefixed secret
        Webhook whPrefixed = new Webhook(SECRET);
        String sig = whPrefixed.sign(MSG_ID, ts, PAYLOAD);

        // Verify with raw base64 secret (no whsec_ prefix)
        Webhook whRaw = new Webhook(SECRET_BASE64);
        Map<String, String> headers = buildHeaders(MSG_ID, String.valueOf(ts), sig);

        Map<String, Object> result = whRaw.verify(PAYLOAD, headers);
        assertNotNull(result);
        assertEquals("order.created", result.get("type"));
    }

    @Test
    void tamperedPayloadFails() throws Exception {
        long ts = currentTimestamp();
        String sig = computeSignature(SECRET, MSG_ID, ts, PAYLOAD);
        String tamperedPayload = "{\"type\":\"order.created\",\"data\":{\"id\":999}}";
        Map<String, String> headers = buildHeaders(MSG_ID, String.valueOf(ts), sig);

        WebhookVerificationError ex = assertThrows(WebhookVerificationError.class,
                () -> webhook.verify(tamperedPayload, headers));
        assertTrue(ex.getMessage().contains("Invalid webhook signature"));
    }
}
