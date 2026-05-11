package com.hooksniff.resources;

import com.hooksniff.ApiException;
import com.hooksniff.HookSniffConfig;
import com.hooksniff.RequestHelper;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;

/**
 * Manage webhook endpoints — create, list, update, delete, rotate secrets.
 */
public class Endpoints {
    private static final Gson GSON = new Gson();
    private static final Type ENDPOINT_LIST = new TypeToken<List<Map<String, Object>>>(){}.getType();
    private static final Type ENDPOINT = new TypeToken<Map<String, Object>>(){}.getType();

    private final HookSniffConfig config;

    public Endpoints(HookSniffConfig config) {
        this.config = config;
    }

    /** List all endpoints */
    public List<Map<String, Object>> list() throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("GET", "/v1/endpoints");
        return req.send(config, ENDPOINT_LIST);
    }

    /** Create a new endpoint */
    public Map<String, Object> create(Map<String, Object> input) throws ApiException, IOException, InterruptedException {
        return create(input, null);
    }

    /** Create a new endpoint with idempotency key */
    public Map<String, Object> create(Map<String, Object> input, String idempotencyKey) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("POST", "/v1/endpoints");
        if (idempotencyKey != null) req.setHeaderParam("idempotency-key", idempotencyKey);
        req.setBody(input);
        return req.send(config, ENDPOINT);
    }

    /** Get an endpoint by ID */
    public Map<String, Object> get(String id) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("GET", "/v1/endpoints/{id}");
        req.setPathParam("id", id);
        return req.send(config, ENDPOINT);
    }

    /** Update an endpoint */
    public Map<String, Object> update(String id, Map<String, Object> input) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("PUT", "/v1/endpoints/{id}");
        req.setPathParam("id", id);
        req.setBody(input);
        return req.send(config, ENDPOINT);
    }

    /** Delete an endpoint */
    public void delete(String id) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("DELETE", "/v1/endpoints/{id}");
        req.setPathParam("id", id);
        req.sendVoid(config);
    }

    /** Rotate the signing secret for an endpoint */
    public Map<String, Object> rotateSecret(String id) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("POST", "/v1/endpoints/{id}/rotate-secret");
        req.setPathParam("id", id);
        return req.send(config, ENDPOINT);
    }
}
