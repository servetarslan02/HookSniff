package com.hooksniff;

import com.google.gson.*;
import com.google.gson.reflect.TypeToken;

import java.io.*;
import java.lang.reflect.Type;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Official Java client for the HookSniff webhook delivery service.
 *
 * <pre>{@code
 * HookSniffClient client = new HookSniffClient("hr_live_...");
 *
 * // Create endpoint
 * Endpoint ep = client.endpoints().create("https://myapp.com/webhook", "Orders");
 *
 * // Send webhook
 * Map<String, Object> data = new HashMap<>();
 * data.put("orderId", "12345");
 * Delivery delivery = client.webhooks().send(ep.getId(), "order.created", data);
 * }</pre>
 */
public class HookSniffClient {

    private static final String DEFAULT_BASE_URL = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1";
    private static final int DEFAULT_TIMEOUT = 30000;

    private final String apiKey;
    private final String baseUrl;
    private final int timeout;
    private final Gson gson;

    private final Endpoints endpoints;
    private final Webhooks webhooks;

    /**
     * Create a new HookSniff client.
     *
     * @param apiKey Your HookSniff API key
     */
    public HookSniffClient(String apiKey) {
        this(apiKey, DEFAULT_BASE_URL, DEFAULT_TIMEOUT);
    }

    /**
     * Create a new HookSniff client with custom configuration.
     *
     * @param apiKey  Your HookSniff API key
     * @param baseUrl API base URL
     * @param timeout Request timeout in milliseconds
     */
    public HookSniffClient(String apiKey, String baseUrl, int timeout) {
        this.apiKey = apiKey;
        this.baseUrl = (baseUrl != null ? baseUrl : DEFAULT_BASE_URL).replaceAll("/+$", "");
        this.timeout = timeout > 0 ? timeout : DEFAULT_TIMEOUT;
        this.gson = new GsonBuilder().create();
        this.endpoints = new Endpoints();
        this.webhooks = new Webhooks();
    }

    /** Access the Endpoints resource. */
    public Endpoints endpoints() { return endpoints; }

    /** Access the Webhooks resource. */
    public Webhooks webhooks() { return webhooks; }

    /** Get platform statistics. */
    public Stats getStats() {
        JsonObject resp = request("GET", "/stats", null);
        Stats stats = new Stats();
        stats.setTotalDeliveries(resp.get("total_deliveries").getAsInt());
        stats.setDelivered(resp.get("delivered").getAsInt());
        stats.setFailed(resp.get("failed").getAsInt());
        stats.setPending(resp.get("pending").getAsInt());
        stats.setSuccessRate(resp.get("success_rate").getAsDouble());
        stats.setEndpointsCount(resp.get("endpoints_count").getAsInt());
        return stats;
    }

    // ==================== Endpoints Resource ====================

    public class Endpoints {
        /** Create a new endpoint. */
        public Endpoint create(String url, String description) {
            return create(url, description, null);
        }

        /** Create a new endpoint with retry policy. */
        public Endpoint create(String url, String description, RetryPolicy retryPolicy) {
            JsonObject body = new JsonObject();
            body.addProperty("url", url);
            if (description != null) body.addProperty("description", description);
            if (retryPolicy != null) {
                JsonObject rp = new JsonObject();
                if (retryPolicy.getMaxAttempts() != null) rp.addProperty("max_attempts", retryPolicy.getMaxAttempts());
                if (retryPolicy.getBackoff() != null) rp.addProperty("backoff", retryPolicy.getBackoff());
                if (retryPolicy.getInitialDelaySecs() != null) rp.addProperty("initial_delay_secs", retryPolicy.getInitialDelaySecs());
                if (retryPolicy.getMaxDelaySecs() != null) rp.addProperty("max_delay_secs", retryPolicy.getMaxDelaySecs());
                body.add("retry_policy", rp);
            }
            JsonObject resp = request("POST", "/endpoints", body);
            return mapEndpoint(resp);
        }

        /** Get an endpoint by ID. */
        public Endpoint get(String endpointId) {
            JsonObject resp = request("GET", "/endpoints/" + endpointId, null);
            return mapEndpoint(resp);
        }

        /** List all endpoints with pagination. */
        public EndpointList list(int page, int perPage) {
            JsonObject resp = request("GET", "/endpoints?page=" + page + "&per_page=" + perPage, null);
            EndpointList list = new EndpointList();
            if (resp.has("endpoints")) {
                list.setEndpoints(gson.fromJson(resp.getAsJsonArray("endpoints"),
                        new TypeToken<List<Endpoint>>(){}.getType()));
            }
            if (resp.has("total")) list.setTotal(resp.get("total").getAsInt());
            if (resp.has("page")) list.setPage(resp.get("page").getAsInt());
            if (resp.has("per_page")) list.setPerPage(resp.get("per_page").getAsInt());
            return list;
        }

        /** Rotate the signing secret for an endpoint. */
        public JsonObject rotateSecret(String endpointId) {
            return request("POST", "/endpoints/" + endpointId + "/rotate-secret", null);
        }

        /** Delete an endpoint. */
        public boolean delete(String endpointId) {
            JsonObject resp = request("DELETE", "/endpoints/" + endpointId, null);
            return !resp.has("deleted") || resp.get("deleted").getAsBoolean();
        }

        private Endpoint mapEndpoint(JsonObject data) {
            Endpoint ep = new Endpoint();
            ep.setId(data.get("id").getAsString());
            ep.setUrl(data.get("url").getAsString());
            if (data.has("description") && !data.get("description").isJsonNull()) {
                ep.setDescription(data.get("description").getAsString());
            }
            if (data.has("is_active")) ep.setActive(data.get("is_active").getAsBoolean());
            if (data.has("retry_policy") && !data.get("retry_policy").isJsonNull()) {
                JsonObject rp = data.getAsJsonObject("retry_policy");
                RetryPolicy policy = new RetryPolicy();
                if (rp.has("max_attempts")) policy.setMaxAttempts(rp.get("max_attempts").getAsInt());
                if (rp.has("backoff")) policy.setBackoff(rp.get("backoff").getAsString());
                if (rp.has("initial_delay_secs")) policy.setInitialDelaySecs(rp.get("initial_delay_secs").getAsInt());
                if (rp.has("max_delay_secs")) policy.setMaxDelaySecs(rp.get("max_delay_secs").getAsInt());
                ep.setRetryPolicy(policy);
            }
            if (data.has("created_at")) ep.setCreatedAt(data.get("created_at").getAsString());
            return ep;
        }
    }

    // ==================== Webhooks Resource ====================

    public class Webhooks {
        /** Send a webhook. */
        public Delivery send(String endpointId, String event, Map<String, Object> data) {
            JsonObject body = new JsonObject();
            body.addProperty("endpoint_id", endpointId);
            body.add("data", gson.toJsonTree(data));
            if (event != null) body.addProperty("event", event);
            JsonObject resp = request("POST", "/webhooks", body);
            return mapDelivery(resp);
        }

        /** Get a delivery by ID. */
        public Delivery get(String deliveryId) {
            JsonObject resp = request("GET", "/webhooks/" + deliveryId, null);
            return mapDelivery(resp);
        }

        /** List deliveries with optional filters. */
        public DeliveryList list(String status, int page, int perPage) {
            StringBuilder path = new StringBuilder("/webhooks?page=" + page + "&per_page=" + perPage);
            if (status != null) path.append("&status=").append(status);
            JsonObject resp = request("GET", path.toString(), null);
            DeliveryList list = new DeliveryList();
            if (resp.has("deliveries")) {
                list.setDeliveries(gson.fromJson(resp.getAsJsonArray("deliveries"),
                        new TypeToken<List<Delivery>>(){}.getType()));
            }
            if (resp.has("total")) list.setTotal(resp.get("total").getAsInt());
            if (resp.has("page")) list.setPage(resp.get("page").getAsInt());
            if (resp.has("per_page")) list.setPerPage(resp.get("per_page").getAsInt());
            return list;
        }

        /** Replay a delivery. */
        public Delivery replay(String deliveryId) {
            JsonObject resp = request("POST", "/webhooks/" + deliveryId + "/replay", null);
            return mapDelivery(resp);
        }

        /** Send multiple webhooks in a batch. */
        public BatchResult batch(List<Map<String, Object>> webhooks) {
            JsonObject body = new JsonObject();
            body.add("webhooks", gson.toJsonTree(webhooks));
            JsonObject resp = request("POST", "/webhooks/batch", body);
            BatchResult result = new BatchResult();
            if (resp.has("deliveries")) {
                result.setDeliveries(gson.fromJson(resp.getAsJsonArray("deliveries"),
                        new TypeToken<List<Delivery>>(){}.getType()));
            }
            if (resp.has("errors")) {
                result.setErrors(gson.fromJson(resp.getAsJsonArray("errors"),
                        new TypeToken<List<JsonObject>>(){}.getType()));
            }
            return result;
        }

        /** Get delivery attempts. */
        public List<DeliveryAttempt> attempts(String deliveryId) {
            JsonArray resp = requestArray("GET", "/webhooks/" + deliveryId + "/attempts", null);
            return gson.fromJson(resp, new TypeToken<List<DeliveryAttempt>>(){}.getType());
        }

        /** Export deliveries as JSON or CSV. */
        public String exportRaw(String format, String status, String dateFrom, String dateTo) {
            StringBuilder path = new StringBuilder("/webhooks/export?");
            if (format != null) path.append("format=").append(format).append("&");
            if (status != null) path.append("status=").append(status).append("&");
            if (dateFrom != null) path.append("date_from=").append(dateFrom).append("&");
            if (dateTo != null) path.append("date_to=").append(dateTo).append("&");
            JsonObject resp = request("GET", path.toString(), null);
            return resp != null ? resp.toString() : "";
        }

        /** Export deliveries as JSON. */
        public List<Delivery> export(String format, String status, String dateFrom, String dateTo) {
            StringBuilder path = new StringBuilder("/webhooks/export?");
            if (format != null) path.append("format=").append(format).append("&");
            if (status != null) path.append("status=").append(status).append("&");
            if (dateFrom != null) path.append("date_from=").append(dateFrom).append("&");
            if (dateTo != null) path.append("date_to=").append(dateTo).append("&");
            if ("csv".equals(format)) {
                throw new UnsupportedOperationException("Use exportRaw() for CSV format");
            }
            JsonArray resp = requestArray("GET", path.toString(), null);
            return gson.fromJson(resp, new TypeToken<List<Delivery>>(){}.getType());
        }

        /** Search deliveries with filters. */
        public String search(String query, String event, String status, String endpointId, int page, int perPage) {
            StringBuilder path = new StringBuilder("/search?");
            if (query != null) path.append("q=").append(query).append("&");
            if (event != null) path.append("event=").append(event).append("&");
            if (status != null) path.append("status=").append(status).append("&");
            if (endpointId != null) path.append("endpoint_id=").append(endpointId).append("&");
            path.append("page=").append(page).append("&");
            path.append("per_page=").append(perPage);
            JsonObject resp = request("GET", path.toString(), null);
            return resp != null ? resp.toString() : "{}";
        }

        private Delivery mapDelivery(JsonObject data) {
            Delivery d = new Delivery();
            d.setId(data.get("id").getAsString());
            if (data.has("endpoint_id")) d.setEndpointId(data.get("endpoint_id").getAsString());
            if (data.has("event") && !data.get("event").isJsonNull()) d.setEvent(data.get("event").getAsString());
            if (data.has("status")) d.setStatus(data.get("status").getAsString());
            if (data.has("attempt_count")) d.setAttemptCount(data.get("attempt_count").getAsInt());
            if (data.has("response_status") && !data.get("response_status").isJsonNull())
                d.setResponseStatus(data.get("response_status").getAsInt());
            d.setReplayCount(data.has("replay_count") ? data.get("replay_count").getAsInt() : 0);
            if (data.has("created_at")) d.setCreatedAt(data.get("created_at").getAsString());
            return d;
        }
    }

    // ==================== HTTP Layer ====================

    JsonObject request(String method, String path, JsonObject body) {
        try {
            URL url = new URL(baseUrl + path);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod(method);
            conn.setRequestProperty("Authorization", "Bearer " + apiKey);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("User-Agent", "hooksniff-java/0.1.0");
            conn.setConnectTimeout(timeout);
            conn.setReadTimeout(timeout);

            if (body != null && ("POST".equals(method) || "PUT".equals(method))) {
                conn.setDoOutput(true);
                try (OutputStream os = conn.getOutputStream()) {
                    os.write(body.toString().getBytes(StandardCharsets.UTF_8));
                }
            }

            int statusCode = conn.getResponseCode();

            if (statusCode >= 200 && statusCode < 300) {
                String contentType = conn.getContentType();
                if (contentType != null && contentType.contains("text/csv")) {
                    return null; // CSV not supported as JsonObject
                }
                String responseBody = readStream(conn.getInputStream());
                return JsonParser.parseString(responseBody).getAsJsonObject();
            }

            String errBody = readStream(conn.getErrorStream());
            String message = "HTTP " + statusCode;
            try {
                JsonObject err = JsonParser.parseString(errBody).getAsJsonObject();
                message = err.getAsJsonObject("error").get("message").getAsString();
            } catch (Exception ignored) {}

            switch (statusCode) {
                case 400: throw new HookSniffException.ValidationException(message);
                case 401: throw new HookSniffException.AuthenticationException(message);
                case 404: throw new HookSniffException.NotFoundException(message);
                case 413: throw new HookSniffException.PayloadTooLargeException(message);
                case 429: throw new HookSniffException.RateLimitException(message);
                default: throw new HookSniffException(message, statusCode, "UNKNOWN");
            }
        } catch (HookSniffException e) {
            throw e;
        } catch (Exception e) {
            throw new HookSniffException("Request failed: " + e.getMessage(), 0, "NETWORK_ERROR");
        }
    }

    JsonArray requestArray(String method, String path, JsonObject body) {
        try {
            URL url = new URL(baseUrl + path);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod(method);
            conn.setRequestProperty("Authorization", "Bearer " + apiKey);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("User-Agent", "hooksniff-java/0.1.0");
            conn.setConnectTimeout(timeout);
            conn.setReadTimeout(timeout);

            if (body != null && ("POST".equals(method) || "PUT".equals(method))) {
                conn.setDoOutput(true);
                try (OutputStream os = conn.getOutputStream()) {
                    os.write(body.toString().getBytes(StandardCharsets.UTF_8));
                }
            }

            int statusCode = conn.getResponseCode();

            if (statusCode >= 200 && statusCode < 300) {
                String responseBody = readStream(conn.getInputStream());
                return JsonParser.parseString(responseBody).getAsJsonArray();
            }

            String errBody = readStream(conn.getErrorStream());
            String message = "HTTP " + statusCode;
            try {
                JsonObject err = JsonParser.parseString(errBody).getAsJsonObject();
                message = err.getAsJsonObject("error").get("message").getAsString();
            } catch (Exception ignored) {}

            switch (statusCode) {
                case 400: throw new HookSniffException.ValidationException(message);
                case 401: throw new HookSniffException.AuthenticationException(message);
                case 404: throw new HookSniffException.NotFoundException(message);
                case 413: throw new HookSniffException.PayloadTooLargeException(message);
                case 429: throw new HookSniffException.RateLimitException(message);
                default: throw new HookSniffException(message, statusCode, "UNKNOWN");
            }
        } catch (HookSniffException e) {
            throw e;
        } catch (Exception e) {
            throw new HookSniffException("Request failed: " + e.getMessage(), 0, "NETWORK_ERROR");
        }
    }

    private String readStream(InputStream stream) throws IOException {
        if (stream == null) return "";
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        }
    }
}
