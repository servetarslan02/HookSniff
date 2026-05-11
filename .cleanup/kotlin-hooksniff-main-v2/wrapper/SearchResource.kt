package hooksniff.sdk.wrapper

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Search deliveries and events.
 */
class SearchResource(private val client: HookSniff) {

    private val gson = Gson()
    private val mapType = object : TypeToken<Map<String, Any?>>() {}.type

    /** Search deliveries by query string. */
    fun query(q: String, limit: Int? = null): Map<String, Any?> {
        val params = mutableListOf("q=${java.net.URLEncoder.encode(q, "UTF-8")}")
        if (limit != null) params.add("limit=$limit")
        val json = client.get("/v1/search?${params.joinToString("&")}")
        return gson.fromJson(json, mapType)
    }
}
