package com.hooksniff.kotlin

import org.junit.Test
import org.junit.Assert.*
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec
import java.net.http.HttpHeaders
import java.util.Base64

class WebhookTest {

    companion object {
        private const val SECRET = "whsec_dGVzdA=="
        private const val MSG_ID = "msg_test123"
        private val TIMESTAMP = System.currentTimeMillis() / 1000
        private const val PAYLOAD = """{"event":"test"}"""
    }

    private fun sign(secret: String, msgId: String, timestamp: Long, payload: String): String {
        val decoded = Base64.getDecoder().decode(secret.removePrefix("whsec_"))
        val toSign = "$msgId.$timestamp.$payload"
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(decoded, "HmacSHA256"))
        val sig = Base64.getEncoder().encodeToString(mac.doFinal(toSign.toByteArray()))
        return "v1,$sig"
    }

    private fun buildHeaders(vararg pairs: Pair<String, String>): HttpHeaders {
        val map = pairs.toList().groupBy { it.first }.mapValues { (_, v) -> v.map { it.second } }
        return HttpHeaders.of(map) { true }
    }

    @Test
    fun testVerifyValidSignature() {
        val wh = Webhook(SECRET)
        val sig = sign(SECRET, MSG_ID, TIMESTAMP, PAYLOAD)
        val headers = buildHeaders(
            "webhook-id" to MSG_ID,
            "webhook-timestamp" to TIMESTAMP.toString(),
            "webhook-signature" to sig
        )
        wh.verify(PAYLOAD, headers)
    }

    @Test(expected = WebhookVerificationException::class)
    fun testRejectInvalidSignature() {
        val wh = Webhook(SECRET)
        val headers = buildHeaders(
            "webhook-id" to MSG_ID,
            "webhook-timestamp" to TIMESTAMP.toString(),
            "webhook-signature" to "v1,invalid"
        )
        wh.verify(PAYLOAD, headers)
    }

    @Test(expected = WebhookVerificationException::class)
    fun testRejectOldTimestamp() {
        val wh = Webhook(SECRET)
        val oldTs = System.currentTimeMillis() / 1000 - 600
        val sig = sign(SECRET, MSG_ID, oldTs, PAYLOAD)
        val headers = buildHeaders(
            "webhook-id" to MSG_ID,
            "webhook-timestamp" to oldTs.toString(),
            "webhook-signature" to sig
        )
        wh.verify(PAYLOAD, headers)
    }

    @Test
    fun testHookSniffBrandedHeaders() {
        val wh = Webhook(SECRET)
        val sig = sign(SECRET, MSG_ID, TIMESTAMP, PAYLOAD)
        val headers = buildHeaders(
            "hooksniff-id" to MSG_ID,
            "hooksniff-timestamp" to TIMESTAMP.toString(),
            "hooksniff-signature" to sig
        )
        wh.verify(PAYLOAD, headers)
    }
}
