package com.hooksniff;

import com.hooksniff.resources.*;

/**
 * HookSniff Java SDK — Main Entry Point
 *
 * Usage:
 *   HookSniff hs = new HookSniff("your-api-key");
 *   var endpoints = hs.endpoints().list();
 */
public class HookSniff {
    private static final String DEFAULT_BASE_URL = "https://hooksniff-api-1046140057667.europe-west1.run.app";

    private final HookSniffConfig config;
    private final Endpoints endpoints;
    private final Webhooks webhooks;
    private final Auth auth;
    private final Analytics analytics;
    private final ApiKeys apiKeys;
    private final Alerts alerts;
    private final Teams teams;
    private final Search search;
    private final Billing billing;
    private final Health health;

    public HookSniff(String apiKey) {
        this(apiKey, DEFAULT_BASE_URL, 30000, 2);
    }

    public HookSniff(String apiKey, String baseUrl) {
        this(apiKey, baseUrl, 30000, 2);
    }

    public HookSniff(String apiKey, String baseUrl, int timeout) {
        this(apiKey, baseUrl, timeout, 2);
    }

    public HookSniff(String apiKey, String baseUrl, int timeout, int numRetries) {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalArgumentException("HookSniff: apiKey is required");
        }
        String normalizedUrl = baseUrl == null ? DEFAULT_BASE_URL : baseUrl.replaceAll("/+$", "");
        this.config = new HookSniffConfig(normalizedUrl, apiKey, timeout, numRetries);

        this.endpoints = new Endpoints(config);
        this.webhooks = new Webhooks(config);
        this.auth = new Auth(config);
        this.analytics = new Analytics(config);
        this.apiKeys = new ApiKeys(config);
        this.alerts = new Alerts(config);
        this.teams = new Teams(config);
        this.search = new Search(config);
        this.billing = new Billing(config);
        this.health = new Health(config);
    }

    /** Webhook endpoints management */
    public Endpoints endpoints() { return endpoints; }

    /** Webhook send, list, replay */
    public Webhooks webhooks() { return webhooks; }

    /** Authentication (register, login, 2FA) */
    public Auth auth() { return auth; }

    /** Delivery analytics */
    public Analytics analytics() { return analytics; }

    /** API key management */
    public ApiKeys apiKeys() { return apiKeys; }

    /** Alert rules and notifications */
    public Alerts alerts() { return alerts; }

    /** Team management */
    public Teams teams() { return teams; }

    /** Search deliveries */
    public Search search() { return search; }

    /** Billing and subscription */
    public Billing billing() { return billing; }

    /** API health check */
    public Health health() { return health; }
}
