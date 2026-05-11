package hooksniff.sdk.wrapper

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Team management — list members, invite, remove.
 */
class TeamsResource(private val client: HookSniff) {

    private val gson = Gson()
    private val mapType = object : TypeToken<Map<String, Any?>>() {}.type
    private val listType = object : TypeToken<List<Map<String, Any?>>>() {}.type

    /** List team members. Returns bare array. */
    fun members(): List<Map<String, Any?>> {
        val json = client.get("/v1/teams/members")
        return gson.fromJson(json, listType)
    }

    /** Invite a team member. */
    fun invite(input: Map<String, Any?>): Map<String, Any?> {
        val json = client.post("/v1/teams/invite", gson.toJson(input))
        return gson.fromJson(json, mapType)
    }

    /** Remove a team member. */
    fun removeMember(id: String) {
        client.delete("/v1/teams/members/$id")
    }
}
