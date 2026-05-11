package com.hooksniff.resources;

import com.hooksniff.ApiException;
import com.hooksniff.HookSniffConfig;
import com.hooksniff.RequestHelper;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.Map;

/**
 * Search deliveries and events.
 */
public class Search {
    private static final Type MAP = new TypeToken<Map<String, Object>>(){}.getType();

    private final HookSniffConfig config;

    public Search(HookSniffConfig config) {
        this.config = config;
    }

    /** Search deliveries */
    public Map<String, Object> query(Map<String, Object> input) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("POST", "/v1/search");
        req.setBody(input);
        return req.send(config, MAP);
    }
}
