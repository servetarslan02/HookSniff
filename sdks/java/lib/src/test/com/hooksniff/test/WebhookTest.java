package com.hooksniff.test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;

import com.hooksniff.Webhook;
import com.hooksniff.exceptions.WebhookSigningException;
import com.hooksniff.exceptions.WebhookVerificationException;

import org.junit.Test;
import org.junit.function.ThrowingRunnable;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class WebhookTest {
    private static final int TOLERANCE_IN_MS = 5 * 60 * 1000;
    private static final int SECOND_IN_MS = 1000;

    @Test
    public void verifyValidPayloadAndheader() throws WebhookVerificationException {
        TestPayload testPayload = new TestPayload(System.currentTimeMillis());

        Webhook webhook = new Webhook(testPayload.secret);

        webhook.verify(testPayload.payload, testPayload.headers());
    }

    @Test
    public void verifyValidBrandlessPayloadAndheader() throws WebhookVerificationException {
        TestPayload testPayload = new TestPayload(System.currentTimeMillis());
        HashMap<String, ArrayList<String>> unbrandedHeaders =
                new HashMap<String, ArrayList<String>>();
        unbrandedHeaders.put("webhook-id", testPayload.headerMap.get("hooksniff-id"));
        unbrandedHeaders.put("webhook-timestamp", testPayload.headerMap.get("hooksniff-timestamp"));
        unbrandedHeaders.put("webhook-signature", testPayload.headerMap.get("hooksniff-signature"));
        testPayload.headerMap = unbrandedHeaders;

        Webhook webhook = new Webhook(testPayload.secret);

        webhook.verify(testPayload.payload, testPayload.headers());
    }

    @Test
    public void verifyValidPayloadWithMultipleSignaturesIsValid()
            throws WebhookVerificationException {
        TestPayload testPayload = new TestPayload(System.currentTimeMillis());
        String[] sigs =
                new String[] {
                    "v1,Ceo5qEr07ixe2NLpvHk3FH9bwy/WavXrAFQ/9tdO6mc=",
                    "v2,Ceo5qEr07ixe2NLpvHk3FH9bwy/WavXrAFQ/9tdO6mc=",
                    testPayload.headerMap.get("hooksniff-signature").get(0), // valid signature
                    "v1,Ceo5qEr07ixe2NLpvHk3FH9bwy/WavXrAFQ/9tdO6mc=",
                };
        testPayload.headerMap.put(
                "hooksniff-signature", new ArrayList<String>(Arrays.asList(String.join(" ", sigs))));

        Webhook webhook = new Webhook(testPayload.secret);

        webhook.verify(testPayload.payload, testPayload.headers());
    }

    @Test
    public void verifyMissingIdThrowsException() {
        TestPayload testPayload = new TestPayload(System.currentTimeMillis());
        testPayload.headerMap.remove("hooksniff-id");

        assertThrows(WebhookVerificationException.class, verify(testPayload));
    }

    @Test
    public void verifyMissingTimestampThrowsException() {
        TestPayload testPayload = new TestPayload(System.currentTimeMillis());
        testPayload.headerMap.remove("hooksniff-timestamp");

        assertThrows(WebhookVerificationException.class, verify(testPayload));
    }

    @Test
    public void verifyMissingSignatureThrowsException() {
        TestPayload testPayload = new TestPayload(System.currentTimeMillis());
        testPayload.headerMap.remove("hooksniff-signature");

        assertThrows(WebhookVerificationException.class, verify(testPayload));
    }

    @Test
    public void verifySignatureWithDifferentVersionThrowsException() {
        TestPayload testPayload = new TestPayload(System.currentTimeMillis());
        testPayload.headerMap.put(
                Webhook.HOOKSNIFF_MSG_ID_KEY,
                new ArrayList<String>(
                        Arrays.asList("v2,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE=")));

        assertThrows(WebhookVerificationException.class, verify(testPayload));
    }

    @Test
    public void verifyMissingPartsInSignatureThrowsException() {
        TestPayload testPayload = new TestPayload(System.currentTimeMillis());
        testPayload.headerMap.put(
                Webhook.HOOKSNIFF_MSG_ID_KEY, new ArrayList<String>(Arrays.asList("invalid_signature")));

        assertThrows(WebhookVerificationException.class, verify(testPayload));
    }

    @Test
    public void verifySignatureMismatchThrowsException() {
        TestPayload testPayload = new TestPayload(System.currentTimeMillis());
        testPayload.headerMap.put(
                Webhook.HOOKSNIFF_MSG_ID_KEY,
                new ArrayList<String>(Arrays.asList("v1,invalid_signature")));

        assertThrows(WebhookVerificationException.class, verify(testPayload));
    }

    @Test
    public void verifyOldTimestampThrowsException() {
        TestPayload testPayload =
                new TestPayload(System.currentTimeMillis() + TOLERANCE_IN_MS + SECOND_IN_MS);

        assertThrows(WebhookVerificationException.class, verify(testPayload));
    }

    @Test
    public void verifyNewTimestampThrowsException() {
        TestPayload testPayload =
                new TestPayload(System.currentTimeMillis() - TOLERANCE_IN_MS - SECOND_IN_MS);

        assertThrows(WebhookVerificationException.class, verify(testPayload));
    }

    @Test
    public void verifySecretWorksWithOrWithoutPrefix() throws WebhookVerificationException {
        TestPayload testPayload = new TestPayload(System.currentTimeMillis());

        Webhook webhook = new Webhook(testPayload.secret);
        webhook.verify(testPayload.payload, testPayload.headers());

        webhook = new Webhook(String.format("%s%s", Webhook.SECRET_PREFIX, testPayload.secret));
        webhook.verify(testPayload.payload, testPayload.headers());
    }

    @Test
    public void verifyWebhookSignWorks() throws WebhookSigningException {
        String key = "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw";
        String msgId = "msg_p5jXN8AQM9LWM0D4loKWxJek";
        final long timestamp = 1614265330;
        String payload = "{\"test\": 2432232314}";
        String expected = "v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE=";

        Webhook webhook = new Webhook(key);
        String signature = webhook.sign(msgId, timestamp, payload);
        assertEquals(signature, expected);
    }

    private ThrowingRunnable verify(final TestPayload testPayload) {
        return new ThrowingRunnable() {
            @Override
            public void run() throws WebhookVerificationException {
                Webhook webhook = new Webhook(testPayload.secret);
                webhook.verify(testPayload.payload, testPayload.headers());
            }
            ;
        };
    }

    private class TestPayload {
        private static final String DEFAULT_MSG_ID = "msg_p5jXN8AQM9LWM0D4loKWxJek";
        private static final String DEFAULT_SECRET = "MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw";
        private static final String DEFAULT_PAYLOAD = "{\"test\": 2432232314}";

        private String id;
        private String timestamp;
        private String payload;
        private String secret;
        private String signature;
        private HashMap<String, ArrayList<String>> headerMap;

        TestPayload(final long timestampInMS) {
            this.id = TestPayload.DEFAULT_MSG_ID;
            this.timestamp = String.valueOf(timestampInMS / SECOND_IN_MS);
            this.payload = TestPayload.DEFAULT_PAYLOAD;
            this.secret = TestPayload.DEFAULT_SECRET;

            try {
                String toSign = String.format("%s.%s.%s", this.id, this.timestamp, this.payload);
                Mac sha512Hmac = Mac.getInstance("HmacSHA256");
                SecretKeySpec keySpec =
                        new SecretKeySpec(Base64.getDecoder().decode(this.secret), "HmacSHA256");
                sha512Hmac.init(keySpec);
                byte[] macData = sha512Hmac.doFinal(toSign.getBytes(StandardCharsets.UTF_8));
                this.signature = Base64.getEncoder().encodeToString(macData);
            } catch (Exception e) {
                // pass
            }

            this.headerMap = new HashMap<String, ArrayList<String>>();
            headerMap.put("hooksniff-id", new ArrayList<String>(Arrays.asList(this.id)));
            headerMap.put("hooksniff-timestamp", new ArrayList<String>(Arrays.asList(this.timestamp)));
            headerMap.put(
                    "hooksniff-signature",
                    new ArrayList<String>(Arrays.asList(String.format("v1,%s", this.signature))));
        }

        public Map<String, List<String>> headers() {
            HashMap<String, List<String>> map = new HashMap<String, List<String>>();
            for (Map.Entry<String, ArrayList<String>> entry : this.headerMap.entrySet()) {
                map.put(entry.getKey(), entry.getValue());
            }
            return map;
        }
    }
}
