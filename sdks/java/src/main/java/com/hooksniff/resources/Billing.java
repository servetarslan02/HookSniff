package com.hooksniff.resources;

import com.hooksniff.ApiException;
import com.hooksniff.HookSniffConfig;
import com.hooksniff.RequestHelper;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.Map;

/**
 * Billing and subscription management.
 */
public class Billing {
    private static final Type MAP = new TypeToken<Map<String, Object>>(){}.getType();

    private final HookSniffConfig config;

    public Billing(HookSniffConfig config) {
        this.config = config;
    }

    /** Get current subscription */
    public Map<String, Object> subscription() throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("GET", "/v1/billing/subscription");
        return req.send(config, MAP);
    }

    /** Get billing portal URL */
    public Map<String, Object> portal() throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("POST", "/v1/billing/portal");
        return req.send(config, MAP);
    }

    /** Get invoices */
    public Map<String, Object> invoices() throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("GET", "/v1/billing/invoices");
        return req.send(config, MAP);
    }

    /** Upgrade subscription */
    public Map<String, Object> upgrade(Map<String, Object> input) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("POST", "/v1/billing/upgrade");
        req.setBody(input);
        return req.send(config, MAP);
    }

    /** Cancel subscription */
    public Map<String, Object> cancel(Map<String, Object> input) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("POST", "/v1/billing/cancel");
        req.setBody(input);
        return req.send(config, MAP);
    }
}
