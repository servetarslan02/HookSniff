package com.hooksniff.resources;

import com.hooksniff.ApiException;
import com.hooksniff.HookSniffConfig;
import com.hooksniff.RequestHelper;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.Map;

/**
 * Delivery analytics and statistics.
 */
public class Analytics {
    private static final Type MAP = new TypeToken<Map<String, Object>>(){}.getType();

    private final HookSniffConfig config;

    public Analytics(HookSniffConfig config) {
        this.config = config;
    }

    /** Get delivery statistics */
    public Map<String, Object> stats() throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("GET", "/v1/analytics/stats");
        return req.send(config, MAP);
    }

    /** Get delivery trends */
    public Map<String, Object> trends() throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("GET", "/v1/analytics/trends");
        return req.send(config, MAP);
    }

    /** Get success rate */
    public Map<String, Object> successRate() throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("GET", "/v1/analytics/success-rate");
        return req.send(config, MAP);
    }

    /** Get latency data */
    public Map<String, Object> latency() throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("GET", "/v1/analytics/latency");
        return req.send(config, MAP);
    }
}
