package com.hooksniff

import com.hooksniff.exceptions.ApiException

class Integration(private val client: HookSniffHttpClient) {
    fun list(): List<Map<String, Any?>> =
        client.request("GET", "/api/v1/integrations")

    fun get(id: String): Map<String, Any?> =
        client.request("GET", "/api/v1/integrations/$id")

    fun create(body: Map<String, Any?>): Map<String, Any?> =
        client.request("POST", "/api/v1/integrations", body)

    fun update(id: String, body: Map<String, Any?>): Map<String, Any?> =
        client.request("PUT", "/api/v1/integrations/$id", body)

    fun delete(id: String) =
        client.request<Void>("DELETE", "/api/v1/integrations/$id")

    fun test(id: String): Map<String, Any?> =
        client.request("POST", "/api/v1/integrations/$id/test")

    fun listEvents(id: String, params: Map<String, String> = emptyMap()): List<Map<String, Any?>> =
        client.request("GET", "/api/v1/integrations/$id/events", queryParams = params)

    fun getStats(id: String): Map<String, Any?> =
        client.request("GET", "/api/v1/integrations/$id/stats")
}
