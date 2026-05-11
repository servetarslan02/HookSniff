package hooksniff.sdk.wrapper

import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration

/**
 * HookSniff API Client
 *
 * Usage:
 *   val hs = HookSniff("your-api-key")
 *   val endpoints = hs.endpoints.list()
 */
class HookSniff(
    private val apiKey: String,
    private val baseUrl: String = DEFAULT_BASE_URL,
    private val timeout: Duration = Duration.ofSeconds(30),
    private val numRetries: Int = 2
) {
    val endpoints = EndpointsResource(this)
    val webhooks = WebhooksResource(this)
    val health = HealthResource(this)

    internal fun get(path: String): String = request("GET", path)
    internal fun post(path: String, body: String? = null): String = request("POST", path, body)
    internal fun put(path: String, body: String? = null): String = request("PUT", path, body)
    internal fun delete(path: String): String = request("DELETE", path)

    private fun request(method: String, path: String, body: String? = null): String {
        val client = HttpClient.newBuilder().connectTimeout(timeout).build()
        var lastException: Exception? = null

        for (attempt in 0..numRetries) {
            try {
                val builder = HttpRequest.newBuilder()
                    .uri(URI.create("$baseUrl$path"))
                    .timeout(timeout)
                    .header("Authorization", "Bearer $apiKey")
                    .header("User-Agent", "hooksniff-kotlin/0.4.0")
                    .header("Accept", "application/json")

                if (body != null) {
                    builder.header("Content-Type", "application/json")
                    builder.method(method, HttpRequest.BodyPublishers.ofString(body))
                } else {
                    builder.method(method, HttpRequest.BodyPublishers.noBody())
                }

                val response = client.send(builder.build(), HttpResponse.BodyHandlers.ofString())

                if (response.statusCode() >= 500 && attempt < numRetries) {
                    lastException = Exception("API Error ${response.statusCode()}: ${response.body()}")
                    Thread.sleep(50L * (1L shl attempt))
                    continue
                }

                if (response.statusCode() >= 400) {
                    throw Exception("API Error ${response.statusCode()}: ${response.body()}")
                }

                return response.body()
            } catch (e: Exception) {
                lastException = e
                if (attempt >= numRetries) throw e
                Thread.sleep(50L * (1L shl attempt))
            }
        }
        throw lastException ?: Exception("Request failed")
    }

    companion object {
        const val DEFAULT_BASE_URL = "https://hooksniff-api-1046140057667.europe-west1.run.app"
    }
}

class EndpointsResource(private val client: HookSniff) {
    fun list(): String = client.get("/v1/endpoints")
    fun create(body: String): String = client.post("/v1/endpoints", body)
    fun get(id: String): String = client.get("/v1/endpoints/$id")
    fun update(id: String, body: String): String = client.put("/v1/endpoints/$id", body)
    fun delete(id: String): String = client.delete("/v1/endpoints/$id")
    fun rotateSecret(id: String): String = client.post("/v1/endpoints/$id/rotate-secret")
}

class WebhooksResource(private val client: HookSniff) {
    fun send(body: String): String = client.post("/v1/webhooks", body)
    fun batch(body: String): String = client.post("/v1/webhooks/batch", body)
    fun list(limit: Int? = null, offset: Int? = null): String {
        val params = mutableListOf<String>()
        if (limit != null) params.add("limit=$limit")
        if (offset != null) params.add("offset=$offset")
        val query = if (params.isNotEmpty()) "?${params.joinToString("&")}" else ""
        return client.get("/v1/webhooks$query")
    }
    fun get(id: String): String = client.get("/v1/webhooks/$id")
    fun replay(id: String): String = client.post("/v1/webhooks/$id/replay")
}

class HealthResource(private val client: HookSniff) {
    fun check(): String = client.get("/health")
}
