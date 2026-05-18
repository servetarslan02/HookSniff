package com.hooksniff.kotlin

data class OperationalWebhookEndpointOut(
    val id: String, val customerId: String, val url: String,
    val description: String? = null, val isActive: Boolean,
    val eventTypes: List<String>? = null, val createdAt: String, val updatedAt: String
)
data class OperationalWebhookEndpointIn(
    val url: String, val description: String? = null,
    val isActive: Boolean? = null, val eventTypes: List<String>? = null
)
data class OperationalWebhookDeliveryOut(
    val id: String, val endpointId: String, val eventType: String,
    val payload: Map<String, Any>, val responseStatus: Int? = null,
    val attemptCount: Int, val status: String, val createdAt: String, val deliveredAt: String? = null
)
