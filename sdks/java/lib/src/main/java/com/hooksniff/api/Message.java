package com.hooksniff.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.hooksniff.HookSniffHttpClient;
import com.hooksniff.Utils;
import com.hooksniff.exceptions.ApiException;
import com.hooksniff.models.*;

import lombok.*;
import lombok.Getter;

import okhttp3.Headers;
import okhttp3.HttpUrl;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class Message {
    private final HookSniffHttpClient client;

    public Message(HookSniffHttpClient client) {
        this.client = client;
    }

    public ListResponseMessageOut list(final String appId) throws IOException, ApiException {
        return this.list(appId, new MessageListOptions());
    }

    public ListResponseMessageOut list(final String appId, final MessageListOptions options)
            throws IOException, ApiException {
        HttpUrl.Builder url =
                this.client.newUrlBuilder().encodedPath(String.format("/api/v1/app/%s/msg", appId));
        if (options.limit != null) {
            url.addQueryParameter("limit", Utils.serializeQueryParam(options.limit));
        }
        if (options.iterator != null) {
            url.addQueryParameter("iterator", options.iterator);
        }
        if (options.channel != null) {
            url.addQueryParameter("channel", options.channel);
        }
        if (options.before != null) {
            url.addQueryParameter("before", Utils.serializeQueryParam(options.before));
        }
        if (options.after != null) {
            url.addQueryParameter("after", Utils.serializeQueryParam(options.after));
        }
        if (options.withContent != null) {
            url.addQueryParameter("with_content", Utils.serializeQueryParam(options.withContent));
        }
        if (options.tag != null) {
            url.addQueryParameter("tag", options.tag);
        }
        if (options.eventTypes != null) {
            url.addQueryParameter("event_types", Utils.serializeQueryParam(options.eventTypes));
        }
        return this.client.executeRequest(
                "GET", url.build(), null, null, ListResponseMessageOut.class);
    }

    public MessageOut create(final String appId, final MessageIn messageIn)
            throws IOException, ApiException {
        return this.create(appId, messageIn, new MessageCreateOptions());
    }

    public MessageOut create(
            final String appId, final MessageIn messageIn, final MessageCreateOptions options)
            throws IOException, ApiException {
        HttpUrl.Builder url =
                this.client.newUrlBuilder().encodedPath(String.format("/api/v1/app/%s/msg", appId));
        if (options.withContent != null) {
            url.addQueryParameter("with_content", Utils.serializeQueryParam(options.withContent));
        }
        Map<String, String> headers = new HashMap<>();
        if (options.idempotencyKey != null) {
            headers.put("idempotency-key", options.idempotencyKey);
        }
        return this.client.executeRequest(
                "POST", url.build(), Headers.of(headers), messageIn, MessageOut.class);
    }

    public MessageOut get(final String appId, final String msgId) throws IOException, ApiException {
        return this.get(appId, msgId, new MessageGetOptions());
    }

    public MessageOut get(final String appId, final String msgId, final MessageGetOptions options)
            throws IOException, ApiException {
        HttpUrl.Builder url =
                this.client
                        .newUrlBuilder()
                        .encodedPath(String.format("/api/v1/app/%s/msg/%s", appId, msgId));
        if (options.withContent != null) {
            url.addQueryParameter("with_content", Utils.serializeQueryParam(options.withContent));
        }
        return this.client.executeRequest("GET", url.build(), null, null, MessageOut.class);
    }

    public void expungeContent(final String appId, final String msgId)
            throws IOException, ApiException {
        HttpUrl.Builder url =
                this.client
                        .newUrlBuilder()
                        .encodedPath(String.format("/api/v1/app/%s/msg/%s/content", appId, msgId));
        this.client.executeRequest("DELETE", url.build(), null, null, null);
    }

    public static MessageIn messageInRaw(final String payload) {
        MessageIn msg = new MessageIn();
        msg.setPayload("");
        msg.setTransformationsParams(Collections.singletonMap("rawPayload", payload));
        return msg;
    }

    public static MessageIn messageInRaw(final String payload, final String contentType) {
        HashMap<String, Object> trParam = new HashMap<>();
        trParam.put("rawPayload", payload);
        trParam.put("headers", Collections.singletonMap("content-type", contentType));
        MessageIn msg = new MessageIn();
        msg.setPayload("");
        msg.setTransformationsParams(trParam);
        return msg;
    }
}
