package com.hooksniff

import com.hooksniff.infrastructure.HookSniffHttpClient
import kotlinx.serialization.Serializable

class MessagePoller(private val client: HookSniffHttpClient) {

    suspend fun poll(
        consumerId: String,
        limit: Int? = null,
        endpointId: String? = null,
        eventType: String? = null,
        includePayload: Boolean = true,
    ): MessagePollerPollResponse {
        val params = mutableListOf("consumer_id=$consumerId", "include_payload=$includePayload")
        limit?.let { params.add("limit=$it") }
        endpointId?.let { params.add("endpoint_id=$it") }
        eventType?.let { params.add("event_type=$it") }
        return client.get("/api/v1/message-poller/poll?${params.joinToString("&")}")
    }

    suspend fun seek(
        consumerId: String,
        messageId: String,
        endpointId: String? = null,
    ): MessagePollerCursorResponse {
        val body = mutableMapOf<String, Any?>(
            "consumer_id" to consumerId,
            "message_id" to messageId,
        )
        endpointId?.let { body["endpoint_id"] = it }
        return client.post("/api/v1/message-poller/seek", body)
    }

    suspend fun commit(
        consumerId: String,
        messageId: String,
        endpointId: String? = null,
    ): MessagePollerCommitResponse {
        val body = mutableMapOf<String, Any?>(
            "consumer_id" to consumerId,
            "message_id" to messageId,
        )
        endpointId?.let { body["endpoint_id"] = it }
        return client.post("/api/v1/message-poller/commit", body)
    }
}

@Serializable
data class PolledMessage(
    val id: String,
    val endpoint_id: String,
    val event_type: String? = null,
    val status: String,
    val attempt_count: Int,
    val response_status: Int? = null,
    val created_at: String,
    val payload: kotlinx.serialization.json.JsonElement? = null,
)

@Serializable
data class MessagePollerCursor(
    val consumer_id: String,
    val last_message_id: String? = null,
    val last_sequence_num: Long,
)

@Serializable
data class MessagePollerPollResponse(
    val messages: List<PolledMessage>,
    val cursor: MessagePollerCursor,
    val done: Boolean,
)

@Serializable
data class MessagePollerCursorResponse(
    val cursor: MessagePollerCursor,
)

@Serializable
data class MessagePollerCommitResponse(
    val cursor: MessagePollerCursor,
    val committed: Boolean,
)
