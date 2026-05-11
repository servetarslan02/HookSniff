package hooksniff.sdk.wrapper

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Send, list, get, replay, and batch webhooks.
 */
class WebhooksResource(private val client: HookSniff) {

    private val gson = Gson()
    private val mapType = object : TypeToken<Map<String, Any?>>() {}.type

    /** Send a single webhook. */
    fun send(input: Map<String, Any?>): Map<String, Any?> {
        val json = client.post("/v1/webhooks", gson.toJson(input))
        return gson.fromJson(json, mapType)
    }

    /** Send batch webhooks. */
    fun batch(input: Map<String, Any?>): Map<String, Any?> {
        val json = client.post("/v1/webhooks/batch", gson.toJson(input))
        return gson.fromJson(json, mapType)
    }

    /** List deliveries. */
    fun list(): Map<String, Any?> {
        val json = client.get("/v1/webhooks")
        return gson.fromJson(json, mapType)
    }

    /** List deliveries with pagination. */
    fun list(limit: Int?, offset: Int?): Map<String, Any?> {
        val params = mutableListOf<String>()
        if (limit != null) params.add("limit=$limit")
        if (offset != null) params.add("offset=$offset")
        val query = if (params.isNotEmpty()) "?${params.joinToString("&")}" else ""
        val json = client.get("/v1/webhooks$query")
        return gson.fromJson(json, mapType)
    }

    /** Get a specific delivery. */
    fun get(id: String): Map<String, Any?> {
        val json = client.get("/v1/webhooks/$id")
        return gson.fromJson(json, mapType)
    }

    /** Replay a delivery. */
    fun replay(id: String): Map<String, Any?> {
        val json = client.post("/v1/webhooks/$id/replay")
        return gson.fromJson(json, mapType)
    }
}
