package com.hooksniff.kotlin

class Authentication(private val client: HookSniffHttpClient) {
    /** Logout the currently authenticated user. */
    suspend fun logout(idempotencyKey: String? = null) {
        val headers = okhttp3.Headers.Builder()
        if (idempotencyKey != null) headers.add("idempotency-key", idempotencyKey)
        client.executeRequest<Any, Boolean>("POST", client.newUrlBuilder().encodedPath("/api/v1/auth/logout").build(), headers = headers.build())
    }
}
