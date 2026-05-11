package com.hooksniff.resources;

import com.hooksniff.HookSniffConfig;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.*;

import java.io.IOException;
import java.io.OutputStream;
import java.lang.reflect.Type;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for Endpoints resource — verifies correct HTTP method, path, query params, and body.
 * Uses a lightweight JDK HttpServer to capture real HTTP requests.
 */
public class EndpointsTest {

    private static final Gson GSON = new Gson();
    private static final Type MAP_TYPE = new TypeToken<Map<String, Object>>(){}.getType();

    private HttpServer server;
    private String baseUrl;
    private HookSniffConfig config;

    /** Last captured request details */
    private String lastMethod;
    private String lastPath;
    private String lastBody;
    private Map<String, String> lastHeaders;
    private Map<String, String> lastQueryParams;

    @BeforeEach
    void setUp() throws IOException {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        int port = server.getAddress().getPort();
        baseUrl = "http://localhost:" + port;

        config = new HookSniffConfig(baseUrl, "sk-test-token", 5000, 0);

        server.createContext("/", this::handleRequest);
        server.start();
    }

    @AfterEach
    void tearDown() {
        if (server != null) server.stop(0);
    }

    private void handleRequest(HttpExchange exchange) throws IOException {
        lastMethod = exchange.getRequestMethod();
        lastPath = exchange.getRequestURI().getPath();
        lastHeaders = new HashMap<>();
        for (var entry : exchange.getRequestHeaders().entrySet()) {
            if (!entry.getValue().isEmpty()) {
                lastHeaders.put(entry.getKey().toLowerCase(), entry.getValue().get(0));
            }
        }

        // Parse query string
        lastQueryParams = new HashMap<>();
        String query = exchange.getRequestURI().getQuery();
        if (query != null) {
            for (String param : query.split("&")) {
                String[] kv = param.split("=", 2);
                if (kv.length == 2) {
                    lastQueryParams.put(
                            java.net.URLDecoder.decode(kv[0], StandardCharsets.UTF_8),
                            java.net.URLDecoder.decode(kv[1], StandardCharsets.UTF_8));
                }
            }
        }

        // Read body
        byte[] bodyBytes = exchange.getRequestBody().readAllBytes();
        lastBody = bodyBytes.length > 0 ? new String(bodyBytes, StandardCharsets.UTF_8) : null;

        // Build response
        String responseBody;
        if (lastMethod.equals("DELETE")) {
            responseBody = "{}";
        } else if (lastPath.equals("/v1/endpoints") && lastMethod.equals("GET")) {
            // List response
            List<Map<String, Object>> items = List.of(
                    Map.of("id", "ep-1", "url", "https://a.example.com"),
                    Map.of("id", "ep-2", "url", "https://b.example.com"));
            responseBody = GSON.toJson(items);
        } else {
            // Single item response (create, get, update)
            Map<String, Object> item = new HashMap<>();
            item.put("id", "ep-test-123");
            item.put("url", "https://example.com/webhook");
            responseBody = GSON.toJson(item);
        }

        byte[] responseBytes = responseBody.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(200, responseBytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(responseBytes);
        }
    }

    // ─── list() ────────────────────────────────────────────────────────

    @Test
    void listSendsGetRequest() throws Exception {
        Endpoints ep = new Endpoints(config);
        ep.list();

        assertEquals("GET", lastMethod);
        assertEquals("/v1/endpoints", lastPath);
    }

    @Test
    void listReturnsEndpoints() throws Exception {
        Endpoints ep = new Endpoints(config);
        List<Map<String, Object>> result = ep.list();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("ep-1", result.get(0).get("id"));
        assertEquals("ep-2", result.get(1).get("id"));
    }

    @Test
    void listWithPaginationSendsQueryParams() throws Exception {
        Endpoints ep = new Endpoints(config);
        ep.list(10, 20);

        assertEquals("GET", lastMethod);
        assertEquals("/v1/endpoints", lastPath);
        assertEquals("10", lastQueryParams.get("limit"));
        assertEquals("20", lastQueryParams.get("offset"));
    }

    @Test
    void listWithoutPaginationSendsNoQueryParams() throws Exception {
        Endpoints ep = new Endpoints(config);
        ep.list();

        assertTrue(lastQueryParams == null || lastQueryParams.isEmpty(),
                "Expected no query params for list() without pagination args");
    }

    // ─── create() ──────────────────────────────────────────────────────

    @Test
    void createSendsPostRequest() throws Exception {
        Endpoints ep = new Endpoints(config);
        Map<String, Object> input = new HashMap<>();
        input.put("url", "https://example.com/webhook");
        input.put("description", "Test endpoint");

        ep.create(input);

        assertEquals("POST", lastMethod);
        assertEquals("/v1/endpoints", lastPath);
    }

    @Test
    void createSendsBodyJson() throws Exception {
        Endpoints ep = new Endpoints(config);
        Map<String, Object> input = new HashMap<>();
        input.put("url", "https://example.com/webhook");
        input.put("description", "Test endpoint");

        ep.create(input);

        assertNotNull(lastBody);
        Map<String, Object> parsed = GSON.fromJson(lastBody, MAP_TYPE);
        assertEquals("https://example.com/webhook", parsed.get("url"));
        assertEquals("Test endpoint", parsed.get("description"));
    }

    @Test
    void createWithIdempotencyKeySendsHeader() throws Exception {
        Endpoints ep = new Endpoints(config);
        Map<String, Object> input = Map.of("url", "https://example.com/webhook");

        ep.create(input, "idem-key-123");

        assertEquals("idem-key-123", lastHeaders.get("idempotency-key"));
    }

    @Test
    void createReturnsSingleObject() throws Exception {
        Endpoints ep = new Endpoints(config);
        Map<String, Object> result = ep.create(Map.of("url", "https://example.com/webhook"));

        assertNotNull(result);
        assertEquals("ep-test-123", result.get("id"));
    }

    // ─── get() ─────────────────────────────────────────────────────────

    @Test
    void getSendsGetWithPathParam() throws Exception {
        Endpoints ep = new Endpoints(config);
        ep.get("ep-abc-123");

        assertEquals("GET", lastMethod);
        assertEquals("/v1/endpoints/ep-abc-123", lastPath);
    }

    @Test
    void getReturnsEndpoint() throws Exception {
        Endpoints ep = new Endpoints(config);
        Map<String, Object> result = ep.get("ep-abc-123");

        assertNotNull(result);
        assertEquals("ep-test-123", result.get("id"));
    }

    // ─── delete() ──────────────────────────────────────────────────────

    @Test
    void deleteSendsDeleteWithPathParam() throws Exception {
        Endpoints ep = new Endpoints(config);
        ep.delete("ep-abc-123");

        assertEquals("DELETE", lastMethod);
        assertEquals("/v1/endpoints/ep-abc-123", lastPath);
    }

    @Test
    void deleteReturnsVoid() throws Exception {
        Endpoints ep = new Endpoints(config);
        // Should not throw
        assertDoesNotThrow(() -> ep.delete("ep-abc-123"));
    }

    // ─── Auth header ───────────────────────────────────────────────────

    @Test
    void requestsIncludeBearerToken() throws Exception {
        Endpoints ep = new Endpoints(config);
        ep.list();

        assertNotNull(lastHeaders.get("authorization"));
        assertTrue(lastHeaders.get("authorization").startsWith("Bearer sk-test-token"));
    }

    // ─── update() ──────────────────────────────────────────────────────

    @Test
    void updateSendsPutWithPathParam() throws Exception {
        Endpoints ep = new Endpoints(config);
        Map<String, Object> input = Map.of("url", "https://updated.example.com");
        ep.update("ep-abc-123", input);

        assertEquals("PUT", lastMethod);
        assertEquals("/v1/endpoints/ep-abc-123", lastPath);
        assertNotNull(lastBody);
        Map<String, Object> parsed = GSON.fromJson(lastBody, MAP_TYPE);
        assertEquals("https://updated.example.com", parsed.get("url"));
    }

    // ─── rotateSecret() ────────────────────────────────────────────────

    @Test
    void rotateSecretSendsPostWithPathParam() throws Exception {
        Endpoints ep = new Endpoints(config);
        ep.rotateSecret("ep-abc-123");

        assertEquals("POST", lastMethod);
        assertEquals("/v1/endpoints/ep-abc-123/rotate-secret", lastPath);
    }
}
