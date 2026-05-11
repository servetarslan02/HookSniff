package hooksniff.sdk.wrapper

import java.util.Base64
import java.util.Locale
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec
import java.security.MessageDigest

/**
 * Webhook signature verification for incoming HookSniff webhooks.
 *
 * Verifies HMAC-SHA256 signatures in Standard Webhooks format.
 * Supports whsec_ prefixed secrets and replay protection (5-minute tolerance).
 *
 * Usage:
 *   val wh = Webhook("whsec_...")
 *   val payload = wh.verify(rawBody, headers)
 */
class WebhookVerificationError(message: String) : Exception(message)

class Webhook(secret: String) {

    private val secret: ByteArray = decodeSecret(secret)

    /**
     * Verify a webhook payload against its signature headers.
     *
     * @param payload The raw request body
     * @param headers Map containing webhook-id, webhook-timestamp, webhook-signature
     * @return The parsed payload as a Map if verification succeeds
     * @throws WebhookVerificationError if verification fails
     */
    fun verify(payload: String, headers: Map<String, String>): Map<String, Any> {
        val normalized = headers.mapKeys { it.key.lowercase(Locale.ROOT) }

        val msgId = normalized["svix-id"] ?: normalized["webhook-id"]
            ?: throw WebhookVerificationError("Missing webhook-id header")
        val timestamp = normalized["svix-timestamp"] ?: normalized["webhook-timestamp"]
            ?: throw WebhookVerificationError("Missing webhook-timestamp header")
        val signature = normalized["svix-signature"] ?: normalized["webhook-signature"]
            ?: throw WebhookVerificationError("Missing webhook-signature header")

        // Validate timestamp
        val timestampNum = timestamp.toLongOrNull()
            ?: throw WebhookVerificationError("Invalid webhook-timestamp header")

        val now = System.currentTimeMillis() / 1000
        if (kotlin.math.abs(now - timestampNum) > TIMESTAMP_TOLERANCE_SECONDS) {
            throw WebhookVerificationError(
                "Webhook timestamp is too old or too new (tolerance: ${TIMESTAMP_TOLERANCE_SECONDS}s)"
            )
        }

        // Compute expected signature
        val content = "$msgId.$timestamp.$payload"
        val expectedSig = computeHmacBase64(secret, content)
        val expected = "v1,$expectedSig"

        // Timing-safe comparison
        if (!verifySignature(expected, signature)) {
            throw WebhookVerificationError("Invalid webhook signature")
        }

        // Parse payload
        return try {
            @Suppress("UNCHECKED_CAST")
            com.google.gson.Gson().fromJson(payload, Map::class.java) as Map<String, Any>
        } catch (e: Exception) {
            mapOf("_raw" to payload)
        }
    }

    /**
     * Sign a payload (for testing or server-side webhook sending).
     */
    fun sign(msgId: String, timestamp: Long, payload: String): String {
        val content = "$msgId.$timestamp.$payload"
        val hmac = computeHmacBase64(secret, content)
        return "v1,$hmac"
    }

    companion object {
        private const val TIMESTAMP_TOLERANCE_SECONDS = 5 * 60L // 5 minutes

        private fun decodeSecret(secret: String): ByteArray {
            val raw = if (secret.startsWith("whsec_")) secret.substring(6) else secret
            return try {
                Base64.getDecoder().decode(raw)
            } catch (e: IllegalArgumentException) {
                raw.toByteArray(Charsets.UTF_8)
            }
        }

        private fun computeHmacBase64(key: ByteArray, data: String): String {
            val mac = Mac.getInstance("HmacSHA256")
            mac.init(SecretKeySpec(key, "HmacSHA256"))
            val result = mac.doFinal(data.toByteArray(Charsets.UTF_8))
            return Base64.getEncoder().encodeToString(result)
        }

        private fun verifySignature(expected: String, actual: String): Boolean {
            val signatures = actual.split(",").map { it.trim() }
            val expectedParts = expected.split(",", limit = 2)
            val expectedSig = if (expectedParts.size > 1) expectedParts[1] else expectedParts[0]

            for (sig in signatures) {
                val parts = sig.split(",", limit = 2)
                val signaturePart = if (parts.size > 1) parts[1] else parts[0]

                if (expectedSig.length != signaturePart.length) continue

                if (MessageDigest.isEqual(
                        expectedSig.toByteArray(Charsets.UTF_8),
                        signaturePart.toByteArray(Charsets.UTF_8)
                    )
                ) {
                    return true
                }
            }
            return false
        }
    }
}
