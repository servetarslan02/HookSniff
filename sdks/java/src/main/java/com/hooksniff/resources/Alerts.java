package com.hooksniff.resources;

import com.hooksniff.ApiException;
import com.hooksniff.HookSniffConfig;
import com.hooksniff.RequestHelper;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.Map;

/**
 * Alert rules and notifications.
 */
public class Alerts {
    private static final Type MAP = new TypeToken<Map<String, Object>>(){}.getType();
    private static final Type LIST = new TypeToken<java.util.List<Map<String, Object>>>(){}.getType();

    private final HookSniffConfig config;

    public Alerts(HookSniffConfig config) {
        this.config = config;
    }

    /** List alert rules */
    public java.util.List<Map<String, Object>> listRules() throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("GET", "/v1/alerts/rules");
        return req.send(config, LIST);
    }

    /** Create alert rule */
    public Map<String, Object> createRule(Map<String, Object> input) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("POST", "/v1/alerts/rules");
        req.setBody(input);
        return req.send(config, MAP);
    }

    /** Update alert rule */
    public Map<String, Object> updateRule(String id, Map<String, Object> input) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("PUT", "/v1/alerts/rules/{id}");
        req.setPathParam("id", id);
        req.setBody(input);
        return req.send(config, MAP);
    }

    /** Delete alert rule */
    public void deleteRule(String id) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("DELETE", "/v1/alerts/rules/{id}");
        req.setPathParam("id", id);
        req.sendVoid(config);
    }

    /** List alert notifications */
    public java.util.List<Map<String, Object>> listNotifications() throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("GET", "/v1/alerts/notifications");
        return req.send(config, LIST);
    }
}
