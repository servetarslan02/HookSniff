package com.hooksniff

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.google.gson.reflect.TypeToken
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.Closeable
import java.util.concurrent.TimeUnit
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec
import java.security.MessageDigest
import java.util.Base64

// ==================== Error Types ====================

open class HookSniffException(
    val statusCode: Int? = null,
    val code: String? = null,
    override val message: String
) : Exception(message)

class AuthenticationException(message: String) : HookSniffException(statusCode = 401, code = "UNAUTHORIZED", message = message)
class ValidationException(message: String) : HookSniffException(statusCode = 400, code = "BAD_REQUEST", message = message)
class NotFoundException(message: String) : HookSniffException(statusCode = 404, code = "NOT_FOUND", message = message)
class RateLimitException(message: String) : HookSniffException(statusCode = 429, code = "RATE_LIMIT", message = message)
class PayloadTooLargeException(message: String) : HookSniffException(statusCode = 413, code = "PAYLOAD_TOO_LARGE", message = message)

// ==================== Models ====================

data class Endpoint(
    val id: String,
    val url: String,
    val description: String? = null,
    @com.google.gson.annotations.SerializedName("is_active") val isActive: Boolean = false,
    @com.google.gson.annotations.SerializedName("retry_policy") val retryPolicy: RetryPolicy? = null,
    @com.google.gson.annotations.SerializedName("created_at") val createdAt: String? = null,
)

data class RetryPolicy(
    @com.google.gson.annotations.SerializedName("max_attempts") val maxAttempts: Int? = null,
    val backoff: String? = null,
    @com.google.gson.annotations.SerializedName("initial_delay_secs") val initialDelaySecs: Int? = null,
    @com.google.gson.annotations.SerializedName("max_delay_secs") val maxDelaySecs: Int? = null,
)

data class Delivery(
    val id: String,
    @com.google.gson.annotations.SerializedName("endpoint_id") val endpointId: String? = null,
    val event: String? = null,
    val status: String? = null,
    @com.google.gson.annotations.SerializedName("attempt_count") val attemptCount: Int = 0,
    @com.google.gson.annotations.SerializedName("response_status") val responseStatus: Int? = null,
    @com.google.gson.annotations.SerializedName("replay_count") val replayCount: Int = 0,
    @com.google.gson.annotations.SerializedName("created_at") val createdAt: String? = null,
)

data class DeliveryAttempt(
    val id: String,
    @com.google.gson.annotations.SerializedName("attempt_number") val attemptNumber: Int = 0,
    @com.google.gson.annotations.SerializedName("status_code") val statusCode: Int? = null,
    @com.google.gson.annotations.SerializedName("response_body") val responseBody: String? = null,
    @com.google.gson.annotations.SerializedName("duration_ms") val durationMs: Long? = null,
    @com.google.gson.annotations.SerializedName("error_message") val errorMessage: String? = null,
    @com.google.gson.annotations.SerializedName("created_at") val createdAt: String? = null,
)

data class DeliveryList(
    val deliveries: List<Delivery>,
    val total: Int = 0,
    val page: Int = 1,
    @com.google.gson.annotations.SerializedName("per_page") val perPage: Int = 20,
)

data class BatchResult(
    val deliveries: List<Delivery>,
    val errors: List<Any> = emptyList(),
)

data class Stats(
    @com.google.gson.annotations.SerializedName("total_deliveries") val totalDeliveries: Int = 0,
    val delivered: Int = 0,
    val failed: Int = 0,
    val pending: Int = 0,
    @com.google.gson.annotations.SerializedName("success_rate") val successRate: Double = 0.0,
    @com.google.gson.annotations.SerializedName("endpoints_count") val endpointsCount: Int = 0,
)

// ==================== Client ====================

/**
 * Official Kotlin client for the HookSniff webhook delivery service.
 *
 * Usage:
 *     val client = HookSniffClient("hr_live_...")
 *     val endpoint = client.endpoints().create(CreateEndpointRequest(url = "https://myapp.com/webhook"))
 *     val delivery = client.webhooks().send(SendWebhookRequest(endpointId = endpoint.id, event = "order.created", data = mapOf("order_id" to "12345")))
 */
class HookSniffClient(
    private val apiKey: String,
    private val baseUrl: String = DEFAULT_BASE_URL,
    private val timeout: Long = DEFAULT_TIMEOUT,
) : Closeable {

    companion object {
        private const val DEFAULT_BASE_URL = "https://api.hooksniff.com/v1"
        private const val DEFAULT_TIMEOUT = 30L
    }

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(timeout, TimeUnit.SECONDS)
        .readTimeout(timeout, TimeUnit.SECONDS)
        .writeTimeout(timeout, TimeUnit.SECONDS)
        .build()

    private val gson: Gson = GsonBuilder().create()
    private val endpointsResource = EndpointsResource()
    private val webhooksResource = WebhooksResource()

    fun endpoints(): EndpointsResource = endpointsResource
    fun webhooks(): WebhooksResource = webhooksResource

    fun getStats(): Stats {
        return request("GET", "/stats")
    }

    override fun close() {
        httpClient.dispatcher.executorService.shutdown()
        httpClient.connectionPool.evictAll()
    }

    internal fun <T> request(method: String, path: String, body: Any? = null): T {
        val url = "$baseUrl$path"
        val mediaType = "application/json".toMediaType()

        val requestBuilder = Request.Builder()
            .url(url)
            .header("Authorization", "Bearer $apiKey")
            .header("Content-Type", "application/json")
            .header("User-Agent", "hooksniff-kotlin/0.2.0")

        when (method) {
            "POST", "PUT", "PATCH" -> {
                val jsonBody = if (body != null) gson.toJson(body) else "{}"
                requestBuilder.method(method, jsonBody.toRequestBody(mediaType))
            }
            "GET" -> requestBuilder.get()
            "DELETE" -> requestBuilder.delete()
        }

        val response = httpClient.newCall(requestBuilder.build()).execute()
        val responseBody = response.body?.string() ?: ""

        if (!response.isSuccessful) {
            val message = try {
                val errorMap = gson.fromJson<Map<*, *>>(responseBody, Map::class.java)
                @Suppress("UNCHECKED_CAST")
                val error = errorMap["error"] as? Map<String, Any>
                error?.get("message") as? String ?: "HTTP ${response.code}"
            } catch (_: Exception) {
                "HTTP ${response.code}"
            }

            throw when (response.code) {
                400 -> ValidationException(message)
                401 -> AuthenticationException(message)
                404 -> NotFoundException(message)
                413 -> PayloadTooLargeException(message)
                429 -> RateLimitException(message)
                else -> HookSniffException(response.code, "UNKNOWN", message)
            }
        }

        return gson.fromJson(responseBody, object : TypeToken<T>() {}.type)
    }

    // ==================== Endpoints Resource ====================

    inner class EndpointsResource {
        fun create(url: String, description: String? = null, retryPolicy: Map<String, Any>? = null): Endpoint {
            val body = mutableMapOf<String, Any>("url" to url)
            description?.let { body["description"] = it }
            retryPolicy?.let { body["retry_policy"] = it }
            return request("POST", "/endpoints", body)
        }

        fun get(endpointId: String): Endpoint {
            return request("GET", "/endpoints/$endpointId")
        }

        fun list(page: Int = 1, perPage: Int = 20): List<Endpoint> {
            return request("GET", "/endpoints?page=$page&per_page=$perPage")
        }

        fun delete(endpointId: String): Boolean {
            val result: Map<String, Boolean> = request("DELETE", "/endpoints/$endpointId")
            return result["deleted"] ?: true
        }

        fun rotateSecret(endpointId: String): Map<String, Any> {
            return request("POST", "/endpoints/$endpointId/rotate-secret")
        }
    }

    // ==================== Webhooks Resource ====================

    inner class WebhooksResource {
        fun send(endpointId: String, event: String? = null, data: Map<String, Any>): Delivery {
            val body = mutableMapOf<String, Any>("endpoint_id" to endpointId, "data" to data)
            event?.let { body["event"] = it }
            return request("POST", "/webhooks", body)
        }

        fun get(deliveryId: String): Delivery {
            return request("GET", "/webhooks/$deliveryId")
        }

        fun list(status: String? = null, page: Int = 1, perPage: Int = 20): DeliveryList {
            var params = "page=$page&per_page=$perPage"
            status?.let { params += "&status=$it" }
            return request("GET", "/webhooks?$params")
        }

        fun replay(deliveryId: String): Delivery {
            return request("POST", "/webhooks/$deliveryId/replay")
        }

        fun batch(webhooks: List<Map<String, Any>>): BatchResult {
            return request("POST", "/webhooks/batch", mapOf("webhooks" to webhooks))
        }

        fun attempts(deliveryId: String): List<DeliveryAttempt> {
            return request("GET", "/webhooks/$deliveryId/attempts")
        }

        fun export(
            format: String? = null,
            status: String? = null,
            dateFrom: String? = null,
            dateTo: String? = null
        ): Any {
            val params = mutableListOf<String>()
            format?.let { params.add("format=$it") }
            status?.let { params.add("status=$it") }
            dateFrom?.let { params.add("date_from=$it") }
            dateTo?.let { params.add("date_to=$it") }
            val qs = if (params.isNotEmpty()) "?${params.joinToString("&")}" else ""
            return request("GET", "/webhooks/export$qs")
        }
    }

    inner class SearchResource {
        fun search(
            query: String? = null,
            event: String? = null,
            status: String? = null,
            endpointId: String? = null,
            page: Int = 1,
            perPage: Int = 20
        ): Map<String, Any> {
            val params = mutableListOf("page=$page", "per_page=$perPage")
            query?.let { params.add("q=$it") }
            event?.let { params.add("event=$it") }
            status?.let { params.add("status=$it") }
            endpointId?.let { params.add("endpoint_id=$it") }
            val qs = params.joinToString("&")
            return request("GET", "/search?$qs")
        }
    }

    val search = SearchResource()

// ==================== Webhook Verification ====================

data class VerificationResult(
    val valid: Boolean,
    val payload: Any? = null,
    val error: String? = null,
)

/**
 * Webhook signature verification for HookSniff.
 *
 * Supports both Standard Webhooks headers (webhook-id, webhook-signature, webhook-timestamp)
 * and Svix headers (svix-id, svix-signature, svix-timestamp) as fallback.
 */
class WebhookVerifier(
    private val secret: String,
    private val toleranceSecs: Int = DEFAULT_TOLERANCE_SECS,
) {
    companion object {
        private const val DEFAULT_TOLERANCE_SECS = 300
        private const val HMAC_SHA256 = "HmacSHA256"
    }

    private val key: ByteArray = run {
        val stripped = if (secret.startsWith("whsec_")) secret.substring(6) else secret
        // Add padding in case secret is unpadded base64
        val padded = stripped + "=".repeat((4 - stripped.length % 4) % 4)
        try { Base64.getDecoder().decode(padded) } catch (_: Exception) { secret.toByteArray() }
    }

    /**
     * Verify a webhook request using Standard Webhooks headers.
     */
    fun verify(body: String, msgId: String?, timestamp: String?, signatureHeader: String?): VerificationResult {
        if (msgId.isNullOrEmpty()) return VerificationResult(valid = false, error = "Missing webhook-id header")
        if (timestamp.isNullOrEmpty()) return VerificationResult(valid = false, error = "Missing webhook-timestamp header")
        if (signatureHeader.isNullOrEmpty()) return VerificationResult(valid = false, error = "Missing webhook-signature header")
        if (body.isEmpty()) return VerificationResult(valid = false, error = "Missing request body")

        val ts = timestamp.toLongOrNull() ?: return VerificationResult(valid = false, error = "Invalid webhook timestamp")
        val now = System.currentTimeMillis() / 1000
        if (now - ts > toleranceSecs) {
            return VerificationResult(valid = false, error = "Message timestamp too old")
        }
        if (ts > now + toleranceSecs) {
            return VerificationResult(valid = false, error = "Message timestamp too new")
        }

        // Compute expected signature
        val signedContent = "$msgId.$timestamp.$body"
        val mac = Mac.getInstance(HMAC_SHA256)
        mac.init(SecretKeySpec(key, HMAC_SHA256))
        val expectedSig = "v1,${Base64.getEncoder().encodeToString(mac.doFinal(signedContent.toByteArray(Charsets.UTF_8)))}"

        // Check each signature
        val signatures = signatureHeader.split(" ")
        val verified = signatures.any { sig ->
            val trimmed = sig.trim()
            trimmed.startsWith("v1,") && MessageDigest.isEqual(trimmed.toByteArray(), expectedSig.toByteArray())
        }

        if (!verified) return VerificationResult(valid = false, error = "Invalid webhook signature")

        // Parse payload
        return try {
            val gson = Gson()
            val parsed = gson.fromJson(body, Any::class.java)
            VerificationResult(valid = true, payload = parsed)
        } catch (_: Exception) {
            VerificationResult(valid = true, payload = body)
        }
    }

    /**
     * Verify a webhook from a headers map with automatic header detection.
     * Supports both Standard Webhooks and Svix headers.
     */
    fun verifyFromHeaders(body: String, headers: Map<String, String>): VerificationResult {
        val normalized = headers.mapKeys { it.key.lowercase() }

        var msgId = normalized["webhook-id"]
        var timestamp = normalized["webhook-timestamp"]
        var signatureHeader = normalized["webhook-signature"]

        if (msgId == null || timestamp == null || signatureHeader == null) {
            msgId = msgId ?: normalized["svix-id"]
            timestamp = timestamp ?: normalized["svix-timestamp"]
            signatureHeader = signatureHeader ?: normalized["svix-signature"]
        }

        return verify(body, msgId, timestamp, signatureHeader)
    }
}
}
