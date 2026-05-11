package com.hooksniff.resources;

import com.hooksniff.ApiException;
import com.hooksniff.HookSniffConfig;
import com.hooksniff.RequestHelper;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.Map;

/**
 * Authentication — register, login, 2FA, password management.
 */
public class Auth {
    private static final Type MAP = new TypeToken<Map<String, Object>>(){}.getType();

    private final HookSniffConfig config;

    public Auth(HookSniffConfig config) {
        this.config = config;
    }

    /** Register a new user */
    public Map<String, Object> register(Map<String, Object> input) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("POST", "/v1/auth/register");
        req.setBody(input);
        return req.send(config, MAP);
    }

    /** Login */
    public Map<String, Object> login(Map<String, Object> input) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("POST", "/v1/auth/login");
        req.setBody(input);
        return req.send(config, MAP);
    }

    /** Get current user profile */
    public Map<String, Object> me() throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("GET", "/v1/auth/me");
        return req.send(config, MAP);
    }

    /** Logout */
    public void logout() throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("POST", "/v1/auth/logout");
        req.sendVoid(config);
    }

    /** Change password */
    public void changePassword(Map<String, Object> input) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("POST", "/v1/auth/change-password");
        req.setBody(input);
        req.sendVoid(config);
    }

    /** Forgot password */
    public void forgotPassword(Map<String, Object> input) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("POST", "/v1/auth/forgot-password");
        req.setBody(input);
        req.sendVoid(config);
    }

    /** Reset password */
    public void resetPassword(Map<String, Object> input) throws ApiException, IOException, InterruptedException {
        RequestHelper req = new RequestHelper("POST", "/v1/auth/reset-password");
        req.setBody(input);
        req.sendVoid(config);
    }
}
