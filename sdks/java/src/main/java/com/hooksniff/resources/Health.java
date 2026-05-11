package com.hooksniff.resources;

import com.hooksniff.ApiException;
import com.hooksniff.HookSniffConfig;
import com.hooksniff.RequestHelper;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.Map;

/**
 * API health check.
 */
public class Health {
    private static final Type MAP = new TypeToken<Map<String, Object>>(){}.getType();

    private final HookSniffConfig config;

    public Health(HookSniffConfig config) {
        this.config = config;
    }

    /** Health check */
    public Map<String, Object> check() throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("GET", "/health");
        return req.send(config, MAP);
    }
}
