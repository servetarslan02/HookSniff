package com.hooksniff.resources;

import com.hooksniff.ApiException;
import com.hooksniff.HookSniffConfig;
import com.hooksniff.RequestHelper;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;

/**
 * Send, list, get, replay, and batch webhooks.
 */
public class Webhooks {
    private static final Type DELIVERY = new TypeToken<Map<String, Object>>(){}.getType();
    private static final Type DELIVERY_LIST = new TypeToken<Map<String, Object>>(){}.getType();
    private static final Type BATCH = new TypeToken<Map<String, Object>>(){}.getType();

    private final HookSniffConfig config;

    public Webhooks(HookSniffConfig config) {
        this.config = config;
    }

    /** Send a single webhook */
    public Map<String, Object> send(Map<String, Object> input) throws ApiException, IOException, InterruptedException {
        return send(input, null);
    }

    /** Send a single webhook with idempotency key */
    public Map<String, Object> send(Map<String, Object> input, String idempotencyKey) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("POST", "/v1/webhooks");
        if (idempotencyKey != null) req.setHeaderParam("idempotency-key", idempotencyKey);
        req.setBody(input);
        return req.send(config, DELIVERY);
    }

    /** Send batch webhooks */
    public Map<String, Object> batch(Map<String, Object> input) throws ApiException, IOException, InterruptedException {
        return batch(input, null);
    }

    /** Send batch webhooks with idempotency key */
    public Map<String, Object> batch(Map<String, Object> input, String idempotencyKey) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("POST", "/v1/webhooks/batch");
        if (idempotencyKey != null) req.setHeaderParam("idempotency-key", idempotencyKey);
        req.setBody(input);
        return req.send(config, BATCH);
    }

    /** List deliveries */
    public Map<String, Object> list() throws ApiException, IOException, InterruptedException {
        return list(null, null);
    }

    /** List deliveries with pagination */
    public Map<String, Object> list(Integer limit, Integer offset) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("GET", "/v1/webhooks");
        java.util.HashMap<String, Object> params = new java.util.HashMap<>();
        if (limit != null) params.put("limit", limit);
        if (offset != null) params.put("offset", offset);
        if (!params.isEmpty()) req.setQueryParams(params);
        return req.send(config, DELIVERY_LIST);
    }

    /** Get a specific delivery */
    public Map<String, Object> get(String id) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("GET", "/v1/webhooks/{id}");
        req.setPathParam("id", id);
        return req.send(config, DELIVERY);
    }

    /** Replay a delivery */
    public Map<String, Object> replay(String id) throws ApiException, IOException, InterruptedException {
        return replay(id, null);
    }

    /** Replay a delivery with idempotency key */
    public Map<String, Object> replay(String id, String idempotencyKey) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("POST", "/v1/webhooks/{id}/replay");
        req.setPathParam("id", id);
        if (idempotencyKey != null) req.setHeaderParam("idempotency-key", idempotencyKey);
        return req.send(config, DELIVERY);
    }
}
