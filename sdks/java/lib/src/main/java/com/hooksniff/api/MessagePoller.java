package com.hooksniff.api;

import com.hooksniff.HookSniffHttpClient;
import com.hooksniff.Utils;
import com.hooksniff.exceptions.ApiException;
import com.hooksniff.models.*;

import java.io.IOException;

public class MessagePoller {
    private final HookSniffHttpClient client;

    public MessagePoller(HookSniffHttpClient client) {
        this.client = client;
    }

    public MessagePollerPollResponse poll(String consumerId, Integer limit, String endpointId, String eventType, Boolean includePayload) throws IOException, ApiException {
        var builder = client.newUrlBuilder()
            .encodedPath("/api/v1/message-poller/poll")
            .queryParam("consumer_id", consumerId);
        if (limit != null) builder.queryParam("limit", limit.toString());
        if (endpointId != null) builder.queryParam("endpoint_id", endpointId);
        if (eventType != null) builder.queryParam("event_type", eventType);
        if (includePayload != null) builder.queryParam("include_payload", includePayload.toString());
        return client.executeRequest("GET", builder.build(), null, null, MessagePollerPollResponse.class);
    }

    public MessagePollerCursorResponse seek(String consumerId, String messageId, String endpointId) throws IOException, ApiException {
        var body = new java.util.HashMap<String, Object>();
        body.put("consumer_id", consumerId);
        body.put("message_id", messageId);
        if (endpointId != null) body.put("endpoint_id", endpointId);
        return client.executeRequest("POST", client.newUrlBuilder().encodedPath("/api/v1/message-poller/seek").build(), body, null, MessagePollerCursorResponse.class);
    }

    public MessagePollerCommitResponse commit(String consumerId, String messageId, String endpointId) throws IOException, ApiException {
        var body = new java.util.HashMap<String, Object>();
        body.put("consumer_id", consumerId);
        body.put("message_id", messageId);
        if (endpointId != null) body.put("endpoint_id", endpointId);
        return client.executeRequest("POST", client.newUrlBuilder().encodedPath("/api/v1/message-poller/commit").build(), body, null, MessagePollerCommitResponse.class);
    }
}
