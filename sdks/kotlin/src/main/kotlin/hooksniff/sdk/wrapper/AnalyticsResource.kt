package hooksniff.sdk.wrapper

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Delivery analytics and statistics.
 */
class AnalyticsResource(private val client: HookSniff) {

    private val gson = Gson()
    private val mapType = object : TypeToken<Map<String, Any?>>() {}.type

    /** Get delivery statistics. */
    fun stats(): Map<String, Any?> {
        val json = client.get("/v1/analytics/stats")
        return gson.fromJson(json, mapType)
    }

    /** Get delivery trends. */
    fun trends(): Map<String, Any?> {
        val json = client.get("/v1/analytics/trends")
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
