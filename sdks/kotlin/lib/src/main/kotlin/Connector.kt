package com.hooksniff

import com.hooksniff.infrastructure.HookSniffHttpClient
import kotlinx.serialization.Serializable

class Connector(private val client: HookSniffHttpClient) {

    suspend fun list(): List<ConnectorOut> {
        return client.get("/api/v1/connectors")
    }

    suspend fun get(id: String): ConnectorOut {
        return client.get("/api/v1/connectors/$id")
    }

    suspend fun listConfigs(): List<ConnectorConfigOut> {
        return client.get("/api/v1/connectors/configs")
    }

    suspend fun createConfig(body: ConnectorConfigIn): ConnectorConfigOut {
        return client.post("/api/v1/connectors/configs", body)
    }

    suspend fun updateConfig(id: String, body: ConnectorConfigIn): ConnectorConfigOut {
        return client.put("/api/v1/connectors/configs/$id", body)
    }

    suspend fun deleteConfig(id: String) {
        client.delete("/api/v1/connectors/configs/$id")
    }
}

@Serializable
data class ConnectorOut(
    val id: String,
    val name: String,
    val display_name: String,
    val description: String? = null,
    val supported_events: List<String>? = null,
    val is_active: Boolean,
    val created_at: String,
)

@Serializable
data class ConnectorConfigOut(
    val id: String,
    val connector_id: String,
    val connector_name: String,
    val connector_display_name: String,
    val name: String,
    val is_active: Boolean,
    val created_at: String,
)

@Serializable
data class ConnectorConfigIn(
    val connector_id: String,
    val name: String,
    val config: kotlinx.serialization.json.JsonElement? = null,
    val credentials: kotlinx.serialization.json.JsonElement? = null,
    val is_active: Boolean? = null,
)
