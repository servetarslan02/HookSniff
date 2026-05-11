package hooksniff.sdk.wrapper

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Delivery analytics — trends, success rate, latency.
 */
class AnalyticsResource(private val client: HookSniff) {

    private val gson = Gson()
    private val mapType = object : TypeToken<Map<String, Any?>>() {}.type

    /** Get delivery trends. */
    fun trends(since: String? = null, until: String? = null): Map<String, Any?> {
        val params = mutableListOf<String>()
        if (since != null) params.add("since=$since")
        if (until != null) params.add("until=$until")
        val query = if (params.isNotEmpty()) "?${params.joinToString("&")}" else ""
        val json = client.get("/v1/analytics/deliveries$query")
        return gson.fromJson(json, mapType)
    }

    /** Get success rate. */
    fun successRate(): Map<String, Any?> {
        val json = client.get("/v1/analytics/success-rate")
        return gson.fromJson(json, mapType)
    }

    /** Get latency data. */
    fun latency(): Map<String, Any?> {
        val json = client.get("/v1/analytics/latency")
        return gson.fromJson(json, mapType)
    }
}
