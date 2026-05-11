package hooksniff.sdk.wrapper

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * API key management.
 */
class ApiKeysResource(private val client: HookSniff) {

    private val gson = Gson()
    private val mapType = object : TypeToken<Map<String, Any?>>() {}.type
    private val listType = object : TypeToken<List<Map<String, Any?>>>() {}.type

    /** List API keys. */
    fun list(): List<Map<String, Any?>> {
        val json = client.get("/v1/api-keys")
        return gson.fromJson(json, listType)
    }

    /** Create a new API key. */
    fun create(input: Map<String, Any?>): Map<String, Any?> {
        val json = client.post("/v1/api-keys", gson.toJson(input))
        return gson.fromJson(json, mapType)
    }

    /** Delete an API key. */
    fun delete(id: String) {
        client.delete("/v1/api-keys/$id")
    }
}
