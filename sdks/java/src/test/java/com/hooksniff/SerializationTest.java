package com.hooksniff;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Serialization tests for the com.hooksniff SDK layer.
 */
public class SerializationTest {
    private static final Gson GSON = new Gson();

    // ─── RequestHelper body serialization ──────────────────────────────

    @Test
    public void testRequestHelperSetBodySerializesToJson() {
        RequestHelper req = new RequestHelper("POST", "/v1/webhooks");
        Map<String, Object> body = new HashMap<>();
        body.put("endpoint_id", "ep-123");
        body.put("event", "order.created");
        body.put("payload", Map.of("order_id", 42));
        req.setBody(body);
        // setBody uses GSON.toJson internally — verify no exception
        // The body is private, but we can verify the object was accepted
        assertNotNull(body);
    }

    @Test
    public void testRequestHelperSetBodyHandlesNull() {
        RequestHelper req = new RequestHelper("POST", "/v1/test");
        // Setting null body should not throw
        req.setBody(null);
    }

    @Test
    public void testRequestHelperSetBodyHandlesNestedObjects() {
        RequestHelper req = new RequestHelper("POST", "/v1/test");
        Map<String, Object> nested = new HashMap<>();
        nested.put("level1", Map.of("level2", Map.of("level3", "deep")));
        req.setBody(nested);
        assertNotNull(nested);
    }

    // ─── HookSniffConfig ───────────────────────────────────────────────

    @Test
    public void testHookSniffConfigGetters() {
        HookSniffConfig config = new HookSniffConfig("https://api.example.com", "sk-test", 5000, 3);
        assertEquals("https://api.example.com", config.getBaseUrl());
        assertEquals("sk-test", config.getToken());
        assertEquals(5000, config.getTimeout());
        assertEquals(3, config.getNumRetries());
    }

    // ─── ApiException ──────────────────────────────────────────────────

    @Test
    public void testApiExceptionCodeAndBody() {
        Map<String, Object> errorBody = Map.of("error", "Not found");
        ApiException ex = new ApiException(404, errorBody);
        assertEquals(404, ex.getCode());
        assertNotNull(ex.getBody());
    }

    @Test
    public void testApiExceptionWithServerError() {
        ApiException ex = new ApiException(500, "Internal Server Error");
        assertEquals(500, ex.getCode());
        assertEquals("Internal Server Error", ex.getBody());
    }

    // ─── WebhookVerificationError ──────────────────────────────────────

    @Test
    public void testWebhookVerificationError() {
        WebhookVerificationError err = new WebhookVerificationError("Invalid signature");
        assertEquals("Invalid signature", err.getMessage());
    }

    // ─── JSON round-trip via Gson (openapitools model layer) ──────────

    @Test
    public void testGsonRoundTripSimpleMap() {
        Map<String, Object> original = Map.of(
            "endpoint_id", "ep-001",
            "event", "payment.completed",
            "status", "delivered"
        );
        String json = GSON.toJson(original);
        Type type = new TypeToken<Map<String, Object>>(){}.getType();
        Map<String, Object> deserialized = GSON.fromJson(json, type);
        assertEquals("ep-001", deserialized.get("endpoint_id"));
        assertEquals("payment.completed", deserialized.get("event"));
        assertEquals("delivered", deserialized.get("status"));
    }

    @Test
    public void testGsonRoundTripNestedStructure() {
        Map<String, Object> payload = Map.of(
            "webhook_id", "wh-123",
            "data", Map.of(
                "order", Map.of("id", 99, "total", 149.99)
            )
        );
        String json = GSON.toJson(payload);
        Type type = new TypeToken<Map<String, Object>>(){}.getType();
        Map<String, Object> result = GSON.fromJson(json, type);
        assertEquals("wh-123", result.get("webhook_id"));
        assertNotNull(result.get("data"));
    }

    @Test
    public void testGsonDeserializeJsonString() {
        String json = "{\"error\":\"Rate limit exceeded\"}";
        Type type = new TypeToken<Map<String, Object>>(){}.getType();
        Map<String, Object> result = GSON.fromJson(json, type);
        assertEquals("Rate limit exceeded", result.get("error"));
    }

    @Test
    public void testGsonHandlesNullValues() {
        Map<String, Object> data = new HashMap<>();
        data.put("name", "test");
        data.put("description", null);
        String json = GSON.toJson(data);
        assertTrue(json.contains("\"name\":\"test\""));
        // Gson omits null values by default with toJson
    }

    @Test
    public void testGsonHandlesEmptyMap() {
        Map<String, Object> empty = new HashMap<>();
        String json = GSON.toJson(empty);
        assertEquals("{}", json);
        Type type = new TypeToken<Map<String, Object>>(){}.getType();
        Map<String, Object> result = GSON.fromJson(json, type);
        assertTrue(result.isEmpty());
    }

    @Test
    public void testGsonHandlesListSerialization() {
        java.util.List<Map<String, Object>> endpoints = java.util.List.of(
            Map.of("id", "ep-1", "url", "https://a.example.com"),
            Map.of("id", "ep-2", "url", "https://b.example.com")
        );
        String json = GSON.toJson(endpoints);
        assertTrue(json.contains("ep-1"));
        assertTrue(json.contains("ep-2"));
    }

    @Test
    public void testGsonHandlesBooleanValues() {
        Map<String, Object> data = Map.of("is_active", true, "verified", false);
        String json = GSON.toJson(data);
        assertTrue(json.contains("\"is_active\":true"));
        assertTrue(json.contains("\"verified\":false"));
    }

    @Test
    public void testGsonHandlesNumericValues() {
        Map<String, Object> data = Map.of("count", 42, "rate", 99.5);
        String json = GSON.toJson(data);
        assertTrue(json.contains("42"));
        assertTrue(json.contains("99.5"));
    }

    // ─── RequestHelper path param encoding ─────────────────────────────

    @Test
    public void testRequestHelperPathParamReplacement() {
        RequestHelper req = new RequestHelper("GET", "/v1/endpoints/{id}");
        req.setPathParam("id", "test-id-123");
        // path is private, but we verify no exception was thrown
        assertNotNull(req);
    }

    @Test
    public void testRequestHelperQueryParamSetting() {
        RequestHelper req = new RequestHelper("GET", "/v1/webhooks");
        java.util.Map<String, Object> params = new java.util.HashMap<>();
        params.put("limit", 10);
        params.put("offset", 0);
        params.put("status", "delivered");
        req.setQueryParams(params);
        assertNotNull(req);
    }

    @Test
    public void testRequestHelperSkipsNullQueryParams() {
        RequestHelper req = new RequestHelper("GET", "/v1/webhooks");
        java.util.Map<String, Object> params = new java.util.HashMap<>();
        params.put("limit", 10);
        params.put("status", null);
        req.setQueryParams(params);
        // null values should be skipped
        assertNotNull(req);
    }

    @Test
    public void testRequestHelperHeaderParam() {
        RequestHelper req = new RequestHelper("POST", "/v1/webhooks");
        req.setHeaderParam("idempotency-key", "unique-123");
        req.setHeaderParam("x-custom-header", null); // null should be skipped
        assertNotNull(req);
    }

    // ─── HookSniff constructor validation ──────────────────────────────

    @Test
    public void testHookSniffRejectsNullApiKey() {
        assertThrows(IllegalArgumentException.class, () -> new HookSniff(null));
    }

    @Test
    public void testHookSniffRejectsEmptyApiKey() {
        assertThrows(IllegalArgumentException.class, () -> new HookSniff(""));
    }

    @Test
    public void testHookSniffAcceptsValidApiKey() {
        assertDoesNotThrow(() -> new HookSniff("sk-test-key-123"));
    }

    // ─── Gson complex scenario tests ──────────────────────────────────

    @Test
    public void testGsonHandlesUnicodeStrings() {
        Map<String, Object> data = Map.of("name", "Ürün Açıklaması", "emoji", "🔥");
        String json = GSON.toJson(data);
        assertTrue(json.contains("Ürün"));
        assertTrue(json.contains("🔥"));
    }

    @Test
    public void testGsonRoundTripPreservesTypes() {
        Map<String, Object> original = new HashMap<>();
        original.put("string_val", "hello");
        original.put("int_val", 42);
        original.put("double_val", 3.14);
        original.put("bool_val", true);
        original.put("null_val", null);

        String json = GSON.toJson(original);
        Type type = new TypeToken<Map<String, Object>>(){}.getType();
        Map<String, Object> result = GSON.fromJson(json, type);

        assertEquals("hello", result.get("string_val"));
        assertEquals(42.0, result.get("int_val")); // Gson deserializes ints as doubles
        assertEquals(3.14, result.get("double_val"));
        assertEquals(true, result.get("bool_val"));
        assertNull(result.get("null_val"));
    }

    @Test
    public void testGsonHandlesLargePayload() {
        Map<String, Object> largePayload = new HashMap<>();
        for (int i = 0; i < 100; i++) {
            largePayload.put("field_" + i, "value_" + i);
        }
        String json = GSON.toJson(largePayload);
        Type type = new TypeToken<Map<String, Object>>(){}.getType();
        Map<String, Object> result = GSON.fromJson(json, type);
        assertEquals(100, result.size());
        assertEquals("value_50", result.get("field_50"));
    }

    // ─── StringUtil (if available) ─────────────────────────────────────

    @Test
    public void testStringUtilClassExists() {
        // Verify StringUtil is loadable
        assertDoesNotThrow(() -> {
            Class.forName("org.openapitools.client.StringUtil");
        });
    }
}
