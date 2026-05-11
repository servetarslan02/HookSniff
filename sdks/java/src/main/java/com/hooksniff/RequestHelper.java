package com.hooksniff;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Internal HTTP request helper for the HookSniff SDK.
 */
public class RequestHelper {
    private static final String LIB_VERSION = "0.4.0";
    private static final String USER_AGENT = "hooksniff-sdk/" + LIB_VERSION + "/java";
    private static final Gson GSON = new Gson();

    private String method;
    private String path;
    private String body;
    private final Map<String, String> queryParams = new HashMap<>();
    private final Map<String, String> headerParams = new HashMap<>();
    private boolean autoIdempotency = true;

    public RequestHelper(String method, String path) {
        this.method = method;
        this.path = path;
    }

    public void setPathParam(String name, String value) {
        this.path = this.path.replace("{" + name + "}", URLEncoder.encode(value, StandardCharsets.UTF_8));
    }

    public void setQueryParams(Map<String, Object> params) {
        for (Map.Entry<String, Object> entry : params.entrySet()) {
            if (entry.getValue() != null) {
                queryParams.put(entry.getKey(), String.valueOf(entry.getValue()));
            }
        }
    }

    public void setHeaderParam(String name, String value) {
        if (value != null) {
            headerParams.put(name, value);
        }
    }

    public void setBody(Object value) {
        this.body = GSON.toJson(value);
    }

    public <T> T send(HookSniffConfig ctx, Type responseType) throws ApiException, IOException, InterruptedException {
        String responseText = sendRaw(ctx);
        return GSON.fromJson(responseText, responseType);
    }

    public String sendRaw(HookSniffConfig ctx) throws ApiException, IOException, InterruptedException {
        String url = ctx.getBaseUrl() + path;
        if (!queryParams.isEmpty()) {
            String query = queryParams.entrySet().stream()
                    .map(e -> URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8) + "=" +
                              URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                    .collect(Collectors.joining("&"));
            url += "?" + query;
        }

        // Auto idempotency key for POST
        if (autoIdempotency && "POST".equals(method) && !headerParams.containsKey("idempotency-key")) {
            headerParams.put("idempotency-key", "auto_" + UUID.randomUUID().toString());
        }

        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofMillis(ctx.getTimeout()))
                .header("Accept", "application/json")
                .header("Authorization", "Bearer " + ctx.getToken())
                .header("User-Agent", USER_AGENT);

        for (Map.Entry<String, String> entry : headerParams.entrySet()) {
            builder.header(entry.getKey(), entry.getValue());
        }

        if (body != null) {
            builder.header("Content-Type", "application/json");
            builder.method(method, HttpRequest.BodyPublishers.ofString(body));
        } else if ("POST".equals(method) || "PUT".equals(method)) {
            builder.method(method, HttpRequest.BodyPublishers.noBody());
        } else {
            builder.method(method, HttpRequest.BodyPublishers.noBody());
        }

        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(ctx.getTimeout()))
                .build();

        int maxRetries = ctx.getNumRetries();
        Exception lastError = null;

        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() >= 400) {
                    Object parsed;
                    try {
                        parsed = GSON.fromJson(response.body(), Object.class);
                    } catch (Exception e) {
                        parsed = response.body();
                    }
                    throw new ApiException(response.statusCode(), parsed);
                }

                return response.body();
            } catch (ApiException e) {
                if (e.getCode() < 500) throw e;
                lastError = e;
            } catch (IOException | InterruptedException e) {
                lastError = e;
            }

            if (attempt < maxRetries) {
                try {
                    Thread.sleep(50L * (1L << attempt));
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw ie;
                }
            }
        }

        if (lastError instanceof ApiException) throw (ApiException) lastError;
        if (lastError instanceof IOException) throw (IOException) lastError;
        throw (InterruptedException) lastError;
    }

    public void sendVoid(HookSniffConfig ctx) throws ApiException, IOException, InterruptedException {
        sendRaw(ctx);
    }
}
