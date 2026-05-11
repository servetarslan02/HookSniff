package hooksniff.sdk.wrapper

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * API health check.
 */
class HealthResource(private val client: HookSniff) {

    private val gson = Gson()
    private val mapType = object : TypeToken<Map<String, Any?>>() {}.type

    /** Health check. */
    fun check(): Map<String, Any?> {
        val json = client.get("/v1/health")
        return gson.fromJson(json, mapType)
    }
}
