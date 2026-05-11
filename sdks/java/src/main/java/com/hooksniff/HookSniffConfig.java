package com.hooksniff;

/**
 * Configuration context for the HookSniff SDK.
 */
public class HookSniffConfig {
    private final String baseUrl;
    private final String token;
    private final int timeout;
    private final int numRetries;

    public HookSniffConfig(String baseUrl, String token, int timeout, int numRetries) {
        this.baseUrl = baseUrl;
        this.token = token;
        this.timeout = timeout;
        this.numRetries = numRetries;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public String getToken() {
        return token;
    }

    public int getTimeout() {
        return timeout;
    }

    public int getNumRetries() {
        return numRetries;
    }
}
