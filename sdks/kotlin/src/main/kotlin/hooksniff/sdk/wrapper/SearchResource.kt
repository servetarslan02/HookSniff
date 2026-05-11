package hooksniff.sdk.wrapper

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Search deliveries and events.
 */
class SearchResource(private val client: HookSniff) {

    private val gson = Gson()
    private val mapType = object : TypeToken<Map<String, Any?>>() {}.type

    /** Search deliveries. */
    fun query(input: Map<String, Any?>): Map<String, Any?> {
        val json = client.post("/v1/search", gson.toJson(input))
        return gson.fromJson(json, mapType)
    }
}
