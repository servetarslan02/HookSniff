package com.hooksniff.api;

import com.hooksniff.HookSniffHttpClient;
import com.hooksniff.Utils;
import com.hooksniff.exceptions.ApiException;
import com.hooksniff.models.EndpointHeadersIn;
import com.hooksniff.models.EndpointHeadersOut;
import com.hooksniff.models.EndpointHeadersPatchIn;
import com.hooksniff.models.EndpointIn;
import com.hooksniff.models.EndpointOut;
import com.hooksniff.models.EndpointPatch;
import com.hooksniff.models.EndpointSecretOut;
import com.hooksniff.models.EndpointSecretRotateIn;
import com.hooksniff.models.EndpointUpdate;
import com.hooksniff.models.EventExampleIn;
import com.hooksniff.models.ListResponseEndpointOut;
import com.hooksniff.models.MessageOut;

import okhttp3.Headers;
import okhttp3.HttpUrl;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class Endpoint {
    private final HookSniffHttpClient client;

    public Endpoint(HookSniffHttpClient client) {
        this.client = client;
    }

    public ListResponseEndpointOut list(final String appId) throws IOException, ApiException {
        return this.list(appId, new EndpointListOptions());
    }

    public ListResponseEndpointOut list(final String appId, final EndpointListOptions options)
            throws IOException, ApiException {
        HttpUrl.Builder url =
                this.client
                        .newUrlBuilder()
                        .encodedPath(String.format("/api/v1/app/%s/endpoint", appId));
        if (options.limit != null) {
            url.addQueryParameter("limit", Utils.serializeQueryParam(options.limit));
        }
        if (options.iterator != null) {
            url.addQueryParameter("iterator", options.iterator);
        }
        if (options.order != null) {
            url.addQueryParameter("order", Utils.serializeQueryParam(options.order));
        }
        return this.client.executeRequest(
                "GET", url.build(), null, null, ListResponseEndpointOut.class);
    }

    public EndpointOut create(final String appId, final EndpointIn endpointIn)
            throws IOException, ApiException {
        return this.create(appId, endpointIn, new EndpointCreateOptions());
    }

    public EndpointOut create(
            final String appId, final EndpointIn endpointIn, final EndpointCreateOptions options)
            throws IOException, ApiException {
        HttpUrl.Builder url =
                this.client
                        .newUrlBuilder()
                        .encodedPath(String.format("/api/v1/app/%s/endpoint", appId));
        Map<String, String> headers = new HashMap<>();
        if (options.idempotencyKey != null) {
            headers.put("idempotency-key", options.idempotencyKey);
        }
        return this.client.executeRequest(
                "POST", url.build(), Headers.of(headers), endpointIn, EndpointOut.class);
    }

    public EndpointOut get(final String appId, final String endpointId)
            throws IOException, ApiException {
        HttpUrl.Builder url =
                this.client
                        .newUrlBuilder()
                        .encodedPath(
                                String.format("/api/v1/app/%s/endpoint/%s", appId, endpointId));
        return this.client.executeRequest("GET", url.build(), null, null, EndpointOut.class);
    }

    public EndpointOut update(
            final String appId, final String endpointId, final EndpointUpdate endpointUpdate)
            throws IOException, ApiException {
        HttpUrl.Builder url =
                this.client
                        .newUrlBuilder()
                        .encodedPath(
                                String.format("/api/v1/app/%s/endpoint/%s", appId, endpointId));
        return this.client.executeRequest(
                "PUT", url.build(), null, endpointUpdate, EndpointOut.class);
    }

    public void delete(final String appId, final String endpointId)
            throws IOException, ApiException {
        HttpUrl.Builder url =
                this.client
                        .newUrlBuilder()
                        .encodedPath(
                                String.format("/api/v1/app/%s/endpoint/%s", appId, endpointId));
        this.client.executeRequest("DELETE", url.build(), null, null, null);
    }

    public EndpointOut patch(
            final String appId, final String endpointId, final EndpointPatch endpointPatch)
            throws IOException, ApiException {
        HttpUrl.Builder url =
                this.client
                        .newUrlBuilder()
                        .encodedPath(
                                String.format("/api/v1/app/%s/endpoint/%s", appId, endpointId));
        return this.client.executeRequest(
                "PATCH", url.build(), null, endpointPatch, EndpointOut.class);
    }

    public EndpointHeadersOut getHeaders(final String appId, final String endpointId)
            throws IOException, ApiException {
        HttpUrl.Builder url =
                this.client
                        .newUrlBuilder()
                        .encodedPath(
                                String.format(
                                        "/api/v1/app/%s/endpoint/%s/headers", appId, endpointId));
        return this.client.executeRequest("GET", url.build(), null, null, EndpointHeadersOut.class);
    }

    public void updateHeaders(
            final String appId, final String endpointId, final EndpointHeadersIn endpointHeadersIn)
            throws IOException, ApiException {
        HttpUrl.Builder url =
                this.client
                        .newUrlBuilder()
                        .encodedPath(
                                String.format(
                                        "/api/v1/app/%s/endpoint/%s/headers", appId, endpointId));
        this.client.executeRequest("PUT", url.build(), null, endpointHeadersIn, null);
    }

    public void patchHeaders(
            final String appId,
            final String endpointId,
            final EndpointHeadersPatchIn endpointHeadersPatchIn)
            throws IOException, ApiException {
        HttpUrl.Builder url =
                this.client
                        .newUrlBuilder()
                        .encodedPath(
                                String.format(
                                        "/api/v1/app/%s/endpoint/%s/headers", appId, endpointId));
        this.client.executeRequest("PATCH", url.build(), null, endpointHeadersPatchIn, null);
    }

    public EndpointSecretOut getSecret(final String appId, final String endpointId)
            throws IOException, ApiException {
        HttpUrl.Builder url =
                this.client
                        .newUrlBuilder()
                        .encodedPath(
                                String.format(
                                        "/api/v1/app/%s/endpoint/%s/secret", appId, endpointId));
        return this.client.executeRequest("GET", url.build(), null, null, EndpointSecretOut.class);
    }

    public void rotateSecret(
            final String appId,
            final String endpointId,
            final EndpointSecretRotateIn endpointSecretRotateIn)
            throws IOException, ApiException {
        this.rotateSecret(
                appId, endpointId, endpointSecretRotateIn, new EndpointRotateSecretOptions());
    }

    public void rotateSecret(
            final String appId,
            final String endpointId,
            final EndpointSecretRotateIn endpointSecretRotateIn,
            final EndpointRotateSecretOptions options)
            throws IOException, ApiException {
        HttpUrl.Builder url =
                this.client
                        .newUrlBuilder()
                        .encodedPath(
                                String.format(
                                        "/api/v1/app/%s/endpoint/%s/secret/rotate",
                                        appId, endpointId));
        Map<String, String> headers = new HashMap<>();
        if (options.idempotencyKey != null) {
            headers.put("idempotency-key", options.idempotencyKey);
        }
        this.client.executeRequest(
                "POST", url.build(), Headers.of(headers), endpointSecretRotateIn, null);
    }

    public MessageOut sendExample(
            final String appId, final String endpointId, final EventExampleIn eventExampleIn)
            throws IOException, ApiException {
        return this.sendExample(
                appId, endpointId, eventExampleIn, new EndpointSendExampleOptions());
    }

    public MessageOut sendExample(
            final String appId,
            final String endpointId,
            final EventExampleIn eventExampleIn,
            final EndpointSendExampleOptions options)
            throws IOException, ApiException {
        HttpUrl.Builder url =
                this.client
                        .newUrlBuilder()
                        .encodedPath(
                                String.format(
                                        "/api/v1/app/%s/endpoint/%s/send-example",
                                        appId, endpointId));
        Map<String, String> headers = new HashMap<>();
        if (options.idempotencyKey != null) {
            headers.put("idempotency-key", options.idempotencyKey);
        }
        return this.client.executeRequest(
                "POST", url.build(), Headers.of(headers), eventExampleIn, MessageOut.class);
    }
}
