package hooksniff.sdk.wrapper

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Alert rules and notifications.
 */
class AlertsResource(private val client: HookSniff) {

    private val gson = Gson()
    private val mapType = object : TypeToken<Map<String, Any?>>() {}.type
    private val listType = object : TypeToken<List<Map<String, Any?>>>() {}.type

    /** List alert rules. */
    fun listRules(): List<Map<String, Any?>> {
        val json = client.get("/v1/alerts/rules")
        return gson.fromJson(json, listType)
    }

    /** Create alert rule. */
    fun createRule(input: Map<String, Any?>): Map<String, Any?> {
        val json = client.post("/v1/alerts/rules", gson.toJson(input))
        return gson.fromJson(json, mapType)
    }

    /** Update alert rule. */
    fun updateRule(id: String, input: Map<String, Any?>): Map<String, Any?> {
        val json = client.put("/v1/alerts/rules/$id", gson.toJson(input))
        return gson.fromJson(json, mapType)
    }

    /** Delete alert rule. */
    fun deleteRule(id: String) {
        client.delete("/v1/alerts/rules/$id")
    }

    /** List alert notifications. */
    fun listNotifications(): List<Map<String, Any?>> {
        val json = client.get("/v1/alerts/notifications")
        return gson.fromJson(json, listType)
    }
}
