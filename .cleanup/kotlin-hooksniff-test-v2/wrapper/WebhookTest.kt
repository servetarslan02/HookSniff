package hooksniff.sdk.wrapper

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.util.Base64
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

class WebhookTest {

    companion object {
        // Base64-encoded test secret (raw 24 bytes)
        private const val TEST_SECRET_B64 = "dGVzdC1zZWNyZXQta2V5LTEyMzQ1Ng=="
        private const val TEST_SECRET = "whsec_$TEST_SECRET_B64"
        private const val MSG_ID = "msg_test123"
        private const val PAYLOAD = """{"event":"test","data":{"id":1}}"""
        private const val TOLERANCE = 5 * 60L // 5 minutes
    }

    private lateinit var webhook: Webhook
    private val secretBytes: ByteArray by lazy {
        Base64.getDecoder().decode(TEST_SECRET_B64)
    }

    @BeforeEach
    fun setUp() {
        webhook = Webhook(TEST_SECRET)
    }

    /**
     * Helper: compute HMAC-SHA256 signature in v1,<base64> format.
     */
    private fun computeSignature(msgId: String, timestamp: Long, payload: String, secret: ByteArray = secretBytes): String {
        val content = "$msgId.$timestamp.$payload"
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(secret, "HmacSHA256"))
        val result = mac.doFinal(content.toByteArray(Charsets.UTF_8))
        return "v1,${Base64.getEncoder().encodeToString(result)}"
    }

    /**
     * Helper: build standard webhook headers.
     */
    private fun buildHeaders(
        msgId: String = MSG_ID,
        timestamp: Long = System.currentTimeMillis() / 1000,
        signature: String? = null,
        payload: String = PAYLOAD,
        useSvixBranding: Boolean = false
    ): Map<String, String> {
        val sig = signature ?: computeSignature(msgId, timestamp, payload)
        return if (useSvixBranding) {
            mapOf(
                "svix-id" to msgId,
                "svix-timestamp" to timestamp.toString(),
                "svix-signature" to sig
            )
        } else {
            mapOf(
                "webhook-id" to msgId,
                "webhook-timestamp" to timestamp.toString(),
                "webhook-signature" to sig
            )
        }
    }

    // ──────────────────────────────────────────────
    // 1. Valid signature verification
    // ──────────────────────────────────────────────
    @Test
    fun `valid signature passes verification`() {
        val headers = buildHeaders()
        val result = webhook.verify(PAYLOAD, headers)
        assertNotNull(result)
        assertEquals("test", result["event"])
    }

    // ──────────────────────────────────────────────
    // 2. Invalid signature fails
    // ──────────────────────────────────────────────
    @Test
    fun `invalid signature throws WebhookVerificationError`() {
        val headers = buildHeaders(signature = "v1,aW52YWxpZC1zaWduYXR1cmU=")
        assertThrows<WebhookVerificationError> {
            webhook.verify(PAYLOAD, headers)
        }
    }

    // ──────────────────────────────────────────────
    // 3. Missing webhook-id header fails
    // ──────────────────────────────────────────────
    @Test
    fun `missing webhook-id header throws error`() {
        val ts = System.currentTimeMillis() / 1000
        val sig = computeSignature(MSG_ID, ts, PAYLOAD)
        val headers = mapOf(
            "webhook-timestamp" to ts.toString(),
            "webhook-signature" to sig
        )
        val ex = assertThrows<WebhookVerificationError> {
            webhook.verify(PAYLOAD, headers)
        }
        assertTrue(ex.message!!.contains("webhook-id"))
    }

    // ──────────────────────────────────────────────
    // 4. Missing webhook-timestamp header fails
    // ──────────────────────────────────────────────
    @Test
    fun `missing webhook-timestamp header throws error`() {
        val ts = System.currentTimeMillis() / 1000
        val sig = computeSignature(MSG_ID, ts, PAYLOAD)
        val headers = mapOf(
            "webhook-id" to MSG_ID,
            "webhook-signature" to sig
        )
        val ex = assertThrows<WebhookVerificationError> {
            webhook.verify(PAYLOAD, headers)
        }
        assertTrue(ex.message!!.contains("webhook-timestamp"))
    }

    // ──────────────────────────────────────────────
    // 5. Missing webhook-signature header fails
    // ──────────────────────────────────────────────
    @Test
    fun `missing webhook-signature header throws error`() {
        val ts = System.currentTimeMillis() / 1000
        val headers = mapOf(
            "webhook-id" to MSG_ID,
            "webhook-timestamp" to ts.toString()
        )
        val ex = assertThrows<WebhookVerificationError> {
            webhook.verify(PAYLOAD, headers)
        }
        assertTrue(ex.message!!.contains("webhook-signature"))
    }

    // ──────────────────────────────────────────────
    // 6. Expired timestamp (>5 min) fails
    // ──────────────────────────────────────────────
    @Test
    fun `expired timestamp older than 5 minutes throws error`() {
        val oldTimestamp = (System.currentTimeMillis() / 1000) - TOLERANCE - 60
        val sig = computeSignature(MSG_ID, oldTimestamp, PAYLOAD)
        val headers = mapOf(
            "webhook-id" to MSG_ID,
            "webhook-timestamp" to oldTimestamp.toString(),
            "webhook-signature" to sig
        )
        val ex = assertThrows<WebhookVerificationError> {
            webhook.verify(PAYLOAD, headers)
        }
        assertTrue(ex.message!!.contains("too old") || ex.message!!.contains("too new"))
    }

    @Test
    fun `future timestamp beyond tolerance throws error`() {
        val futureTimestamp = (System.currentTimeMillis() / 1000) + TOLERANCE + 60
        val sig = computeSignature(MSG_ID, futureTimestamp, PAYLOAD)
        val headers = mapOf(
            "webhook-id" to MSG_ID,
            "webhook-timestamp" to futureTimestamp.toString(),
            "webhook-signature" to sig
        )
        assertThrows<WebhookVerificationError> {
            webhook.verify(PAYLOAD, headers)
        }
    }

    // ──────────────────────────────────────────────
    // 7. Svix-branded headers work
    // ──────────────────────────────────────────────
    @Test
    fun `svix-branded headers are accepted`() {
        val headers = buildHeaders(useSvixBranding = true)
        val result = webhook.verify(PAYLOAD, headers)
        assertNotNull(result)
        assertEquals("test", result["event"])
    }

    // ──────────────────────────────────────────────
    // 8. Multiple comma-separated signatures work
    // ──────────────────────────────────────────────
    @Test
    fun `multiple comma-separated signatures verify when one matches`() {
        val ts = System.currentTimeMillis() / 1000
        val validSig = computeSignature(MSG_ID, ts, PAYLOAD)
        // Prepend a bogus signature; valid one is second
        val multiSig = "v1,aW52YWxpZC1ib2d1cy1zaWc=,$validSig"
        val headers = mapOf(
            "webhook-id" to MSG_ID,
            "webhook-timestamp" to ts.toString(),
            "webhook-signature" to multiSig
        )
        val result = webhook.verify(PAYLOAD, headers)
        assertNotNull(result)
    }

    @Test
    fun `multiple comma-separated signatures fail when none match`() {
        val ts = System.currentTimeMillis() / 1000
        val headers = mapOf(
            "webhook-id" to MSG_ID,
            "webhook-timestamp" to ts.toString(),
            "webhook-signature" to "v1,Ym9ndXMx,v1,Ym9ndXMy"
        )
        assertThrows<WebhookVerificationError> {
            webhook.verify(PAYLOAD, headers)
        }
    }

    // ──────────────────────────────────────────────
    // 9. sign() produces verifiable signature
    // ──────────────────────────────────────────────
    @Test
    fun `sign produces signature that passes verify`() {
        val ts = System.currentTimeMillis() / 1000
        val signed = webhook.sign(MSG_ID, ts, PAYLOAD)
        val headers = mapOf(
            "webhook-id" to MSG_ID,
            "webhook-timestamp" to ts.toString(),
            "webhook-signature" to signed
        )
        val result = webhook.verify(PAYLOAD, headers)
        assertNotNull(result)
        @Suppress("UNCHECKED_CAST")
        val data = result["data"] as Map<String, Any>
        assertEquals(1.0, data["id"])
    }

    // ──────────────────────────────────────────────
    // 10. Secret with and without whsec_ prefix works
    // ──────────────────────────────────────────────
    @Test
    fun `secret without whsec_ prefix verifies correctly`() {
        val webhookNoPrefix = Webhook(TEST_SECRET_B64)
        val ts = System.currentTimeMillis() / 1000
        val sig = computeSignature(MSG_ID, ts, PAYLOAD)
        val headers = mapOf(
            "webhook-id" to MSG_ID,
            "webhook-timestamp" to ts.toString(),
            "webhook-signature" to sig
        )
        val result = webhookNoPrefix.verify(PAYLOAD, headers)
        assertNotNull(result)
    }

    @Test
    fun `secret with whsec_ prefix verifies correctly`() {
        val ts = System.currentTimeMillis() / 1000
        val sig = computeSignature(MSG_ID, ts, PAYLOAD)
        val headers = mapOf(
            "webhook-id" to MSG_ID,
            "webhook-timestamp" to ts.toString(),
            "webhook-signature" to sig
        )
        val result = webhook.verify(PAYLOAD, headers)
        assertNotNull(result)
    }

    // ──────────────────────────────────────────────
    // Additional edge-case tests
    // ──────────────────────────────────────────────
    @Test
    fun `non-json payload returns raw string in map`() {
        val rawPayload = "not-json-at-all"
        val ts = System.currentTimeMillis() / 1000
        val sig = computeSignature(MSG_ID, ts, rawPayload)
        val headers = buildHeaders(timestamp = ts, signature = sig, payload = rawPayload)
        val result = webhook.verify(rawPayload, headers)
        assertEquals(rawPayload, result["_raw"])
    }

    @Test
    fun `timestamp at exact boundary of tolerance passes`() {
        val ts = (System.currentTimeMillis() / 1000) - TOLERANCE + 1
        val sig = computeSignature(MSG_ID, ts, PAYLOAD)
        val headers = mapOf(
            "webhook-id" to MSG_ID,
            "webhook-timestamp" to ts.toString(),
            "webhook-signature" to sig
        )
        assertDoesNotThrow {
            webhook.verify(PAYLOAD, headers)
        }
    }

    @Test
    fun `headers are case-insensitive`() {
        val ts = System.currentTimeMillis() / 1000
        val sig = computeSignature(MSG_ID, ts, PAYLOAD)
        val headers = mapOf(
            "Webhook-Id" to MSG_ID,
            "Webhook-Timestamp" to ts.toString(),
            "Webhook-Signature" to sig
        )
        val result = webhook.verify(PAYLOAD, headers)
        assertNotNull(result)
    }
}
