package hooksniff.sdk.wrapper

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Manage webhook endpoints — create, list, update, delete, rotate secrets.
 */
class EndpointsResource(private val client: HookSniff) {

    private val gson = Gson()
    private val mapType = object : TypeToken<Map<String, Any?>>() {}.type
    private val listType = object : TypeToken<List<Map<String, Any?>>>() {}.type

    /** List all endpoints. */
    fun list(): List<Map<String, Any?>> {
        val json = client.get("/v1/endpoints")
        return gson.fromJson(json, listType)
    }

    /** Create a new endpoint. */
    fun create(input: Map<String, Any?>): Map<String, Any?> {
        val json = client.post("/v1/endpoints", gson.toJson(input))
        return gson.fromJson(json, mapType)
    }

    /** Get an endpoint by ID. */
    fun get(id: String): Map<String, Any?> {
        val json = client.get("/v1/endpoints/$id")
        return gson.fromJson(json, mapType)
    }

    /** Update an endpoint. */
    fun update(id: String, input: Map<String, Any?>): Map<String, Any?> {
        val json = client.put("/v1/endpoints/$id", gson.toJson(input))
        return gson.fromJson(json, mapType)
    }

    /** Delete an endpoint. */
    fun delete(id: String) {
        client.delete("/v1/endpoints/$id")
    }

    /** Rotate the signing secret for an endpoint. */
    fun rotateSecret(id: String): Map<String, Any?> {
        val json = client.post("/v1/endpoints/$id/rotate-secret")
        return gson.fromJson(json, mapType)
    }

    /** List all endpoints with automatic pagination. */
    fun listAll(limit: Int = Pagination.DEFAULT_LIMIT): List<Map<String, Any?>> {
        return Pagination.collectAll(limit) { pageLimit, offset ->
            val params = mutableListOf("limit=$pageLimit", "offset=$offset")
            val json = client.get("/v1/endpoints?${params.joinToString("&")}")
            val resultMap: Map<String, Any?> = gson.fromJson(json, mapType)
            @Suppress("UNCHECKED_CAST")
            val data = resultMap["data"] as? List<Map<String, Any?>> ?: emptyList()
            val total = (resultMap["total"] as? Number)?.toInt() ?: 0
            val hasMore = offset + data.size < total
            Pair(data, hasMore)
        }
    }
}
