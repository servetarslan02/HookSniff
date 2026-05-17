package com.hooksniff

class Authentication(private val client: HookSniffHttpClient) {
    fun logout(idempotencyKey: String? = null) {
        val headers = mutableMapOf<String, String>()
        if (idempotencyKey != null) headers["idempotency-key"] = idempotencyKey
        client.executeRequest("POST", "/api/v1/auth/logout", headers, null, null)
    }
}
