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
 * Team management.
 */
public class Teams {
    private static final Type MAP = new TypeToken<Map<String, Object>>(){}.getType();
    private static final Type LIST = new TypeToken<java.util.List<Map<String, Object>>>(){}.getType();

    private final HookSniffConfig config;

    public Teams(HookSniffConfig config) {
        this.config = config;
    }

    /** List teams */
    public java.util.List<Map<String, Object>> list() throws ApiException, IOException, InterruptedException {
        return list(null, null);
    }

    /** List teams with pagination */
    public java.util.List<Map<String, Object>> list(Integer limit, Integer offset) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("GET", "/v1/teams");
        HashMap<String, Object> params = new HashMap<>();
        if (limit != null) params.put("limit", limit);
        if (offset != null) params.put("offset", offset);
        if (!params.isEmpty()) req.setQueryParams(params);
        return req.send(config, LIST);
    }

    /** Collect all teams across all pages */
    @SuppressWarnings("unchecked")
    public java.util.List<Map<String, Object>> listAll() throws ApiException, IOException, InterruptedException {
        return listAll(Pagination.DEFAULT_LIMIT);
    }

    /** Collect all teams across all pages with custom limit */
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

    /** Create team */
    public Map<String, Object> create(Map<String, Object> input) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("POST", "/v1/teams");
        req.setBody(input);
        return req.send(config, MAP);
    }

    /** Get team by ID */
    public Map<String, Object> get(String id) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("GET", "/v1/teams/{id}");
        req.setPathParam("id", id);
        return req.send(config, MAP);
    }

    /** Update team */
    public Map<String, Object> update(String id, Map<String, Object> input) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("PUT", "/v1/teams/{id}");
        req.setPathParam("id", id);
        req.setBody(input);
        return req.send(config, MAP);
    }

    /** Delete team */
    public void delete(String id) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("DELETE", "/v1/teams/{id}");
        req.setPathParam("id", id);
        req.sendVoid(config);
    }

    /** Invite member to team */
    public Map<String, Object> invite(String teamId, Map<String, Object> input) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("POST", "/v1/teams/{id}/members");
        req.setPathParam("id", teamId);
        req.setBody(input);
        return req.send(config, MAP);
    }
}
