// this file is @generated
package com.hooksniff.kotlin

import com.hooksniff.kotlin.models.EndpointHeadersIn
import com.hooksniff.kotlin.models.EndpointHeadersOut
import com.hooksniff.kotlin.models.EndpointHeadersPatchIn
import com.hooksniff.kotlin.models.EndpointIn
import com.hooksniff.kotlin.models.EndpointOut
import com.hooksniff.kotlin.models.EndpointPatch
import com.hooksniff.kotlin.models.EndpointSecretOut
import com.hooksniff.kotlin.models.EndpointSecretRotateIn
import com.hooksniff.kotlin.models.EndpointUpdate
import com.hooksniff.kotlin.models.EventExampleIn
import com.hooksniff.kotlin.models.ListResponseEndpointOut
import com.hooksniff.kotlin.models.MessageOut
import com.hooksniff.kotlin.models.Ordering
import okhttp3.Headers

data class EndpointListOptions(
    /** Limit the number of returned items */
    val limit: ULong? = null,
    /** The iterator returned from a prior invocation */
    val iterator: String? = null,
    /** The sorting order of the returned items */
    val order: Ordering? = null,
)

data class EndpointCreateOptions(val idempotencyKey: String? = null)

data class EndpointRotateSecretOptions(val idempotencyKey: String? = null)

data class EndpointSendExampleOptions(val idempotencyKey: String? = null)

class Endpoint(private val client: HookSniffHttpClient) {
    /** List the application's endpoints. */
    suspend fun list(
        appId: String,
        options: EndpointListOptions = EndpointListOptions(),
    ): ListResponseEndpointOut {
        val url = client.newUrlBuilder().encodedPath("/api/v1/app/$appId/endpoint")
        options.limit?.let { url.addQueryParameter("limit", serializeQueryParam(it)) }
        options.iterator?.let { url.addQueryParameter("iterator", it) }
        options.order?.let { url.addQueryParameter("order", serializeQueryParam(it)) }
        return client.executeRequest<Any, ListResponseEndpointOut>("GET", url.build())
    }

    /**
     * Create a new endpoint for the application.
     *
     * When `secret` is `null` the secret is automatically generated (recommended).
     */
    suspend fun create(
        appId: String,
        endpointIn: EndpointIn,
        options: EndpointCreateOptions = EndpointCreateOptions(),
    ): EndpointOut {
        val url = client.newUrlBuilder().encodedPath("/api/v1/app/$appId/endpoint")
        val headers = Headers.Builder()
        options.idempotencyKey?.let { headers.add("idempotency-key", it) }

        return client.executeRequest<EndpointIn, EndpointOut>(
            "POST",
            url.build(),
            headers = headers.build(),
            reqBody = endpointIn,
        )
    }

    /** Get an endpoint. */
    suspend fun get(appId: String, endpointId: String): EndpointOut {
        val url = client.newUrlBuilder().encodedPath("/api/v1/app/$appId/endpoint/$endpointId")
        return client.executeRequest<Any, EndpointOut>("GET", url.build())
    }

    /** Update an endpoint. */
    suspend fun update(
        appId: String,
        endpointId: String,
        endpointUpdate: EndpointUpdate,
    ): EndpointOut {
        val url = client.newUrlBuilder().encodedPath("/api/v1/app/$appId/endpoint/$endpointId")

        return client.executeRequest<EndpointUpdate, EndpointOut>(
            "PUT",
            url.build(),
            reqBody = endpointUpdate,
        )
    }

    /** Delete an endpoint. */
    suspend fun delete(appId: String, endpointId: String) {
        val url = client.newUrlBuilder().encodedPath("/api/v1/app/$appId/endpoint/$endpointId")
        client.executeRequest<Any, Boolean>("DELETE", url.build())
    }

    /** Partially update an endpoint. */
    suspend fun patch(
        appId: String,
        endpointId: String,
        endpointPatch: EndpointPatch,
    ): EndpointOut {
        val url = client.newUrlBuilder().encodedPath("/api/v1/app/$appId/endpoint/$endpointId")

        return client.executeRequest<EndpointPatch, EndpointOut>(
            "PATCH",
            url.build(),
            reqBody = endpointPatch,
        )
    }

    /** Get the additional headers to be sent with the webhook. */
    suspend fun getHeaders(appId: String, endpointId: String): EndpointHeadersOut {
        val url =
            client.newUrlBuilder().encodedPath("/api/v1/app/$appId/endpoint/$endpointId/headers")
        return client.executeRequest<Any, EndpointHeadersOut>("GET", url.build())
    }

    /** Set the additional headers to be sent with the webhook. */
    suspend fun updateHeaders(
        appId: String,
        endpointId: String,
        endpointHeadersIn: EndpointHeadersIn,
    ) {
        val url =
            client.newUrlBuilder().encodedPath("/api/v1/app/$appId/endpoint/$endpointId/headers")

        client.executeRequest<EndpointHeadersIn, Boolean>(
            "PUT",
            url.build(),
            reqBody = endpointHeadersIn,
        )
    }

    /** Partially set the additional headers to be sent with the webhook. */
    suspend fun patchHeaders(
        appId: String,
        endpointId: String,
        endpointHeadersPatchIn: EndpointHeadersPatchIn,
    ) {
        val url =
            client.newUrlBuilder().encodedPath("/api/v1/app/$appId/endpoint/$endpointId/headers")

        client.executeRequest<EndpointHeadersPatchIn, Boolean>(
            "PATCH",
            url.build(),
            reqBody = endpointHeadersPatchIn,
        )
    }

    /**
     * Get the endpoint's signing secret.
     *
     * This is used to verify the authenticity of the webhook. For more information please refer to
     * [the consuming webhooks docs](https://docs.hooksniff.com/consuming-webhooks/).
     */
    suspend fun getSecret(appId: String, endpointId: String): EndpointSecretOut {
        val url =
            client.newUrlBuilder().encodedPath("/api/v1/app/$appId/endpoint/$endpointId/secret")
        return client.executeRequest<Any, EndpointSecretOut>("GET", url.build())
    }

    /**
     * Rotates the endpoint's signing secret.
     *
     * The previous secret will remain valid for the next 24 hours.
     */
    suspend fun rotateSecret(
        appId: String,
        endpointId: String,
        endpointSecretRotateIn: EndpointSecretRotateIn,
        options: EndpointRotateSecretOptions = EndpointRotateSecretOptions(),
    ) {
        val url =
            client
                .newUrlBuilder()
                .encodedPath("/api/v1/app/$appId/endpoint/$endpointId/secret/rotate")
        val headers = Headers.Builder()
        options.idempotencyKey?.let { headers.add("idempotency-key", it) }

        client.executeRequest<EndpointSecretRotateIn, Boolean>(
            "POST",
            url.build(),
            headers = headers.build(),
            reqBody = endpointSecretRotateIn,
        )
    }

    /** Send an example message for an event. */
    suspend fun sendExample(
        appId: String,
        endpointId: String,
        eventExampleIn: EventExampleIn,
        options: EndpointSendExampleOptions = EndpointSendExampleOptions(),
    ): MessageOut {
        val url =
            client
                .newUrlBuilder()
                .encodedPath("/api/v1/app/$appId/endpoint/$endpointId/send-example")
        val headers = Headers.Builder()
        options.idempotencyKey?.let { headers.add("idempotency-key", it) }

        return client.executeRequest<EventExampleIn, MessageOut>(
            "POST",
            url.build(),
            headers = headers.build(),
            reqBody = eventExampleIn,
        )
    }
}
