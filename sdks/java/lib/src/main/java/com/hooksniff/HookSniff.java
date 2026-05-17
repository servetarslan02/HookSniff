package com.hooksniff;

import com.hooksniff.api.*;

import lombok.Getter;

import okhttp3.HttpUrl;

import java.util.HashMap;
import java.util.Map;

@Getter
public class HookSniff {
    private final HookSniffHttpClient httpClient;
    private final Authentication authentication;
    private final Endpoint endpoint;
    private final EventType eventType;
    private final Health health;
    private final Message message;
    private final MessageAttempt messageAttempt;
    private final Statistics statistics;
    private final Environment environment;
    private final BackgroundTask backgroundTask;
    private final OperationalWebhook operationalWebhook;
    private final MessagePoller messagePoller;

    public HookSniff(String token) {
        this(token, new HookSniffOptions());
    }

    public HookSniff(String token, HookSniffOptions options) {
        if (options.getServerUrl() == null) {
            options.setServerUrl(HookSniffOptions.DEFAULT_URL);
        }

        HttpUrl parsedUrl = HttpUrl.parse(options.getServerUrl());
        if (parsedUrl == null) {
            throw new IllegalArgumentException("Invalid base url");
        }

        Map<String, String> defaultHeaders = new HashMap<>();
        defaultHeaders.put("User-Agent", "hooksniff-libs/" + Version.VERSION + "/java");
        defaultHeaders.put("Authorization", "Bearer " + token);

        this.httpClient = new HookSniffHttpClient(parsedUrl, defaultHeaders, options.getRetrySchedule());

        this.authentication = new Authentication(this.httpClient);
        this.endpoint = new Endpoint(this.httpClient);
        this.eventType = new EventType(this.httpClient);
        this.health = new Health(this.httpClient);
        this.message = new Message(this.httpClient);
        this.messageAttempt = new MessageAttempt(this.httpClient);
        this.statistics = new Statistics(this.httpClient);
        this.environment = new Environment(this.httpClient);
        this.backgroundTask = new BackgroundTask(this.httpClient);
        this.operationalWebhook = new OperationalWebhook(this.httpClient);
        this.messagePoller = new MessagePoller(this.httpClient);
    }
}
