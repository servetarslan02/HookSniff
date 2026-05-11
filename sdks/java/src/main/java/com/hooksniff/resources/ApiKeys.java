package com.hooksniff.resources;

import com.hooksniff.ApiException;
import com.hooksniff.HookSniffConfig;
import com.hooksniff.Pagination;
import com.hooksniff.RequestHelper;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;

/**
 * API key management.
 */
public class ApiKeys {
    private static final Type MAP = new TypeToken<Map<String, Object>>(){}.getType();
    private static final Type LIST = new TypeToken<java.util.List<Map<String, Object>>>(){}.getType();

    private final HookSniffConfig config;

    public ApiKeys(HookSniffConfig config) {
        this.config = config;
    }

    /** List API keys */
    public java.util.List<Map<String, Object>> list() throws ApiException, IOException, InterruptedException {
        return list(null, null);
    }

    /** List API keys with pagination */
    public java.util.List<Map<String, Object>> list(Integer limit, Integer offset) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("GET", "/v1/api-keys");
        HashMap<String, Object> params = new HashMap<>();
        if (limit != null) params.put("limit", limit);
        if (offset != null) params.put("offset", offset);
        if (!params.isEmpty()) req.setQueryParams(params);
        return req.send(config, LIST);
    }

    /** Collect all API keys across all pages */
    @SuppressWarnings("unchecked")
    public java.util.List<Map<String, Object>> listAll() throws ApiException, IOException, InterruptedException {
        return listAll(Pagination.DEFAULT_LIMIT);
    }

    /** Collect all API keys across all pages with custom limit */
    @SuppressWarnings("unchecked")
    public java.util.List<Map<String, Object>> listAll(int limit) throws ApiException, IOException, InterruptedException {
        return Pagination.collectAll((l, o) -> {
            try {
                Map<String, Object> result = new HashMap<>();
                result.put("data", list(l, o));
                java.util.List<Map<String, Object>> data = (java.util.List<Map<String, Object>>) result.get("data");
                result.put("has_more", data != null && data.size() == l);
                return result;
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }, limit);
    }

    /** Create a new API key */
    public Map<String, Object> create(Map<String, Object> input) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("POST", "/v1/api-keys");
        req.setBody(input);
        return req.send(config, MAP);
    }

    /** Delete an API key */
    public void delete(String id) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("DELETE", "/v1/api-keys/{id}");
        req.setPathParam("id", id);
        req.sendVoid(config);
    }
}
