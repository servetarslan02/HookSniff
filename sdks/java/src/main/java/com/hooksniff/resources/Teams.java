package com.hooksniff.resources;

import com.hooksniff.ApiException;
import com.hooksniff.HookSniffConfig;
import com.hooksniff.RequestHelper;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.Map;

/**
 * Team management — list members, invite, remove.
 */
public class Teams {
    private static final Type LIST = new TypeToken<java.util.List<Map<String, Object>>>(){}.getType();
    private static final Type MAP = new TypeToken<Map<String, Object>>(){}.getType();

    private final HookSniffConfig config;

    public Teams(HookSniffConfig config) {
        this.config = config;
    }

    /** List team members. */
    public java.util.List<Map<String, Object>> members() throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("GET", "/v1/teams/members");
        return req.send(config, LIST);
    }

    /** Invite a team member. */
    public Map<String, Object> invite(Map<String, Object> input) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("POST", "/v1/teams/invite");
        req.setBody(input);
        return req.send(config, MAP);
    }

    /** Remove a team member. */
    public void removeMember(String id) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("DELETE", "/v1/teams/members/{id}");
        req.setPathParam("id", id);
        req.sendVoid(config);
    }
}
