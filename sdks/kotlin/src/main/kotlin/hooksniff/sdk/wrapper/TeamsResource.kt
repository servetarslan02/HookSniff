package hooksniff.sdk.wrapper

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Team management.
 */
class TeamsResource(private val client: HookSniff) {

    private val gson = Gson()
    private val mapType = object : TypeToken<Map<String, Any?>>() {}.type
    private val listType = object : TypeToken<List<Map<String, Any?>>>() {}.type

    /** List teams. */
    fun list(): List<Map<String, Any?>> {
        val json = client.get("/v1/teams")
        return gson.fromJson(json, listType)
    }

    /** Create team. */
    fun create(input: Map<String, Any?>): Map<String, Any?> {
        val json = client.post("/v1/teams", gson.toJson(input))
        return gson.fromJson(json, mapType)
    }

    /** Get team by ID. */
    fun get(id: String): Map<String, Any?> {
        val json = client.get("/v1/teams/$id")
        return gson.fromJson(json, mapType)
    }

    /** Update team. */
    fun update(id: String, input: Map<String, Any?>): Map<String, Any?> {
        val json = client.put("/v1/teams/$id", gson.toJson(input))
        return gson.fromJson(json, mapType)
    }

    /** Delete team. */
    fun delete(id: String) {
        client.delete("/v1/teams/$id")
    }

    /** Invite member to team. */
    fun invite(teamId: String, input: Map<String, Any?>): Map<String, Any?> {
        val json = client.post("/v1/teams/$teamId/members", gson.toJson(input))
        return gson.fromJson(json, mapType)
    }
}
