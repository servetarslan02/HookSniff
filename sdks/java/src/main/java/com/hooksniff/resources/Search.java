package com.hooksniff.resources;

import com.hooksniff.ApiException;
import com.hooksniff.HookSniffConfig;
import com.hooksniff.RequestHelper;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Search deliveries.
 */
public class Search {
    private static final Type MAP = new TypeToken<Map<String, Object>>(){}.getType();

    private final HookSniffConfig config;

    public Search(HookSniffConfig config) {
        this.config = config;
    }

    /** Search deliveries by query string. */
    public Map<String, Object> query(String q) throws ApiException, IOException, InterruptedException {
        return query(q, null);
    }

    /** Search deliveries by query string with limit. */
    public Map<String, Object> query(String q, Integer limit) throws ApiException, IOException, InterruptedException {
        String path = "/v1/search?q=" + URLEncoder.encode(q, StandardCharsets.UTF_8);
        if (limit != null) path += "&limit=" + limit;
        RequestHelper req = new RequestHelper("GET", path);
        return req.send(config, MAP);
    }
}
