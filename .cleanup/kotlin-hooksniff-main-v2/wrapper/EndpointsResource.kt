package hooksniff.sdk.wrapper

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Manage webhook endpoints — create, list, update, delete, rotate secrets.
 */
class EndpointsResource(private val client: HookSniff) {

    private val gson = Gson()
    private val mapType = object : TypeToken<Map<String, Any?>>() {}.type

    /** List endpoints (paginated). Returns raw API response with data, has_more, total. */
    fun list(limit: Int? = null, offset: Int? = null): Map<String, Any?> {
        val params = mutableListOf<String>()
        if (limit != null) params.add("limit=$limit")
        if (offset != null) params.add("offset=$offset")
        val query = if (params.isNotEmpty()) "?${params.joinToString("&")}" else ""
        val json = client.get("/v1/endpoints$query")
        return gson.fromJson(json, mapType)
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
            val result = list(pageLimit, offset)
            @Suppress("UNCHECKED_CAST")
            val data = result["data"] as? List<Map<String, Any?>> ?: emptyList()
            val hasMore = result["has_more"] as? Boolean ?: false
            Pair(data, hasMore)
        }
    }
}
