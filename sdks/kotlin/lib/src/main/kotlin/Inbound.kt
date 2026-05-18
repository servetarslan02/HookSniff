package com.hooksniff

import com.hooksniff.infrastructure.HookSniffHttpClient
import kotlinx.serialization.Serializable

class Inbound(private val client: HookSniffHttpClient) {

    suspend fun listConfigs(): List<InboundConfigOut> {
        return client.get("/api/v1/inbound/configs")
    }

    suspend fun createConfig(body: InboundConfigIn): InboundConfigOut {
        return client.post("/api/v1/inbound/configs", body)
    }

    suspend fun updateConfig(id: String, body: InboundConfigIn): InboundConfigOut {
        return client.put("/api/v1/inbound/configs/$id", body)
    }

    suspend fun deleteConfig(id: String) {
        client.delete("/api/v1/inbound/configs/$id")
    }
}

@Serializable
data class InboundConfigOut(
    val id: String,
    val customer_id: String,
    val provider: String,
    val secret: String,
    val endpoint_id: String? = null,
    val enabled: Boolean,
    val created_at: String,
)

@Serializable
data class InboundConfigIn(
    val provider: String,
    val secret: String,
    val endpoint_id: String? = null,
    val enabled: Boolean? = null,
)
