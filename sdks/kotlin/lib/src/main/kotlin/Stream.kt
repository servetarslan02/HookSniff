package com.hooksniff

class Stream(private val client: HookSniffHttpClient) {
    fun listChannels(): List<Map<String, Any?>> =
        client.request("GET", "/api/v1/stream/channels")

    fun getChannel(id: String): Map<String, Any?> =
        client.request("GET", "/api/v1/stream/channels/$id")

    fun createChannel(body: Map<String, Any?>): Map<String, Any?> =
        client.request("POST", "/api/v1/stream/channels", body)

    fun updateChannel(id: String, body: Map<String, Any?>): Map<String, Any?> =
        client.request("PUT", "/api/v1/stream/channels/$id", body)

    fun deleteChannel(id: String) =
        client.request<Void>("DELETE", "/api/v1/stream/channels/$id")

    fun listMessages(id: String, params: Map<String, String> = emptyMap()): List<Map<String, Any?>> =
        client.request("GET", "/api/v1/stream/channels/$id/messages", queryParams = params)

    fun listSubscriptions(): List<Map<String, Any?>> =
        client.request("GET", "/api/v1/stream/subscriptions")

    fun disconnectSubscription(id: String) =
        client.request<Void>("DELETE", "/api/v1/stream/subscriptions/$id")

    fun publish(body: Map<String, Any?>): Map<String, Any?> =
        client.request("POST", "/api/v1/stream/publish", body)
}
