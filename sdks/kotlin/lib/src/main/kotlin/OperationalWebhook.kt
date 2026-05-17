package com.hooksniff.kotlin

class OperationalWebhook(private val client: HookSniffHttpClient) {
    fun list(): List<OperationalWebhookEndpointOut> = client.executeRequest("GET", "/api/v1/operational-webhooks")
    fun create(body: OperationalWebhookEndpointIn): OperationalWebhookEndpointOut = client.executeRequest("POST", "/api/v1/operational-webhooks", body)
    fun get(id: String): OperationalWebhookEndpointOut = client.executeRequest("GET", "/api/v1/operational-webhooks/$id")
    fun update(id: String, body: OperationalWebhookEndpointIn): OperationalWebhookEndpointOut = client.executeRequest("PUT", "/api/v1/operational-webhooks/$id", body)
    fun delete(id: String) { client.executeRequest<Any>("DELETE", "/api/v1/operational-webhooks/$id") }
    fun listDeliveries(id: String): List<OperationalWebhookDeliveryOut> = client.executeRequest("GET", "/api/v1/operational-webhooks/$id/deliveries")
}
