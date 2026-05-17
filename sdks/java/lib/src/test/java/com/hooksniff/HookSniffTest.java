package com.hooksniff;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import com.hooksniff.webhooks.Webhook;
import com.hooksniff.webhooks.WebhookVerificationError;
import com.hooksniff.exceptions.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

class WebhookTest {

    private static final String SECRET = "whsec_dGVzdA==";
    private static final String MSG_ID = "msg_test123";
    private static final long TIMESTAMP = System.currentTimeMillis() / 1000;
    private static final String PAYLOAD = "{\"event\":\"test\"}";

    private String sign(String secret, String msgId, long timestamp, String payload) throws Exception {
        byte[] decoded = Base64.getDecoder().decode(secret.replace("whsec_", ""));
        String toSign = msgId + "." + timestamp + "." + payload;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(decoded, "HmacSHA256"));
        byte[] sig = mac.doFinal(toSign.getBytes());
        return "v1," + Base64.getEncoder().encodeToString(sig);
    }

    @Test
    void testVerifyValidSignature() throws Exception {
        Webhook wh = new Webhook(SECRET);
        String sig = sign(SECRET, MSG_ID, TIMESTAMP, PAYLOAD);
        Map<String, String> headers = new HashMap<>();
        headers.put("webhook-id", MSG_ID);
        headers.put("webhook-timestamp", String.valueOf(TIMESTAMP));
        headers.put("webhook-signature", sig);

        Object result = wh.verify(PAYLOAD, headers);
        assertNotNull(result);
    }

    @Test
    void testRejectInvalidSignature() {
        Webhook wh = new Webhook(SECRET);
        Map<String, String> headers = new HashMap<>();
        headers.put("webhook-id", MSG_ID);
        headers.put("webhook-timestamp", String.valueOf(TIMESTAMP));
        headers.put("webhook-signature", "v1,invalid");

        assertThrows(WebhookVerificationError.class, () -> wh.verify(PAYLOAD, headers));
    }

    @Test
    void testRejectOldTimestamp() throws Exception {
        Webhook wh = new Webhook(SECRET);
        long oldTs = System.currentTimeMillis() / 1000 - 600;
        String sig = sign(SECRET, MSG_ID, oldTs, PAYLOAD);
        Map<String, String> headers = new HashMap<>();
        headers.put("webhook-id", MSG_ID);
        headers.put("webhook-timestamp", String.valueOf(oldTs));
        headers.put("webhook-signature", sig);

        assertThrows(WebhookVerificationError.class, () -> wh.verify(PAYLOAD, headers));
    }

    @Test
    void testSvixBrandedHeaders() throws Exception {
        Webhook wh = new Webhook(SECRET);
        String sig = sign(SECRET, MSG_ID, TIMESTAMP, PAYLOAD);
        Map<String, String> headers = new HashMap<>();
        headers.put("svix-id", MSG_ID);
        headers.put("svix-timestamp", String.valueOf(TIMESTAMP));
        headers.put("svix-signature", sig);

        Object result = wh.verify(PAYLOAD, headers);
        assertNotNull(result);
    }
}

class ErrorTest {
    @Test
    void testCreateErrorFromStatus() {
        assertInstanceOf(BadRequestError.class, HookSniffException.fromStatusCode(400));
        assertInstanceOf(UnauthorizedError.class, HookSniffException.fromStatusCode(401));
        assertInstanceOf(ForbiddenError.class, HookSniffException.fromStatusCode(403));
        assertInstanceOf(NotFoundError.class, HookSniffException.fromStatusCode(404));
        assertInstanceOf(ConflictError.class, HookSniffException.fromStatusCode(409));
        assertInstanceOf(RateLimitError.class, HookSniffException.fromStatusCode(429));
        assertInstanceOf(InternalServerError.class, HookSniffException.fromStatusCode(500));
        assertInstanceOf(BadGatewayError.class, HookSniffException.fromStatusCode(502));
        assertInstanceOf(ServiceUnavailableError.class, HookSniffException.fromStatusCode(503));
        assertInstanceOf(GatewayTimeoutError.class, HookSniffException.fromStatusCode(504));
    }
}
