package hooksniff.sdk.wrapper

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Billing and subscription management.
 */
class BillingResource(private val client: HookSniff) {

    private val gson = Gson()
    private val mapType = object : TypeToken<Map<String, Any?>>() {}.type

    /** Get current subscription. */
    fun subscription(): Map<String, Any?> {
        val json = client.get("/v1/billing/subscription")
        return gson.fromJson(json, mapType)
    }

    /** Get billing portal URL. */
    fun portal(): Map<String, Any?> {
        val json = client.post("/v1/billing/portal")
        return gson.fromJson(json, mapType)
    }

    /** Get invoices. */
    fun invoices(): Map<String, Any?> {
        val json = client.get("/v1/billing/invoices")
        return gson.fromJson(json, mapType)
    }

    /** Upgrade subscription. */
    fun upgrade(input: Map<String, Any?>): Map<String, Any?> {
        val json = client.post("/v1/billing/upgrade", gson.toJson(input))
        return gson.fromJson(json, mapType)
    }

    /** Cancel subscription. */
    fun cancel(input: Map<String, Any?>): Map<String, Any?> {
        val json = client.post("/v1/billing/cancel", gson.toJson(input))
        return gson.fromJson(json, mapType)
    }
}
