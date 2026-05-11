package org.openapitools.client.model;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.URI;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Comprehensive serialization tests for OpenAPI model classes.
 * Tests toJson() / fromJson() round-trip across various model types.
 */
public class ModelSerializationTest {

    // ─── Error ─────────────────────────────────────────────────────────

    @Test
    public void testErrorToJson() {
        Error error = new Error();
        error.setError("Something went wrong");
        String json = error.toJson();
        assertTrue(json.contains("\"error\""));
        assertTrue(json.contains("Something went wrong"));
    }

    @Test
    public void testErrorFromJson() throws IOException {
        String json = "{\"error\":\"Not found\"}";
        Error error = Error.fromJson(json);
        assertEquals("Not found", error.getError());
    }

    @Test
    public void testErrorRoundTrip() throws IOException {
        Error original = new Error();
        original.setError("Rate limit exceeded");
        String json = original.toJson();
        Error restored = Error.fromJson(json);
        assertEquals(original.getError(), restored.getError());
        assertEquals(original, restored);
    }

    // ─── LoginRequest ──────────────────────────────────────────────────

    @Test
    public void testLoginRequestToJson() {
        LoginRequest req = new LoginRequest();
        req.setEmail("user@example.com");
        req.setPassword("secret123");
        String json = req.toJson();
        assertTrue(json.contains("\"email\""));
        assertTrue(json.contains("user@example.com"));
        assertTrue(json.contains("\"password\""));
    }

    @Test
    public void testLoginRequestFromJson() throws IOException {
        String json = "{\"email\":\"admin@test.com\",\"password\":\"p@ss\"}";
        LoginRequest req = LoginRequest.fromJson(json);
        assertEquals("admin@test.com", req.getEmail());
        assertEquals("p@ss", req.getPassword());
    }

    @Test
    public void testLoginRequestRoundTrip() throws IOException {
        LoginRequest original = new LoginRequest();
        original.setEmail("test@test.com");
        original.setPassword("mypassword");
        String json = original.toJson();
        LoginRequest restored = LoginRequest.fromJson(json);
        assertEquals(original.getEmail(), restored.getEmail());
        assertEquals(original.getPassword(), restored.getPassword());
        assertEquals(original, restored);
    }

    // ─── Team ──────────────────────────────────────────────────────────

    @Test
    public void testTeamToJson() {
        Team team = new Team();
        team.setId(UUID.randomUUID());
        team.setName("Engineering");
        team.setCreatedAt(OffsetDateTime.now());
        String json = team.toJson();
        assertTrue(json.contains("\"id\""));
        assertTrue(json.contains("\"name\""));
        assertTrue(json.contains("Engineering"));
        assertTrue(json.contains("\"created_at\""));
    }

    @Test
    public void testTeamFromJson() throws IOException {
        UUID id = UUID.randomUUID();
        String json = String.format(
            "{\"id\":\"%s\",\"name\":\"DevOps\",\"created_at\":\"2026-01-15T10:30:00Z\"}",
            id.toString()
        );
        Team team = Team.fromJson(json);
        assertEquals(id, team.getId());
        assertEquals("DevOps", team.getName());
        assertNotNull(team.getCreatedAt());
    }

    @Test
    public void testTeamRoundTrip() throws IOException {
        Team original = new Team();
        original.setId(UUID.fromString("550e8400-e29b-41d4-a716-446655440000"));
        original.setName("Platform Team");
        original.setCreatedAt(OffsetDateTime.parse("2026-03-20T14:00:00+00:00"));
        String json = original.toJson();
        Team restored = Team.fromJson(json);
        assertEquals(original.getId(), restored.getId());
        assertEquals(original.getName(), restored.getName());
        assertEquals(original, restored);
    }

    // ─── WebhookFilter ─────────────────────────────────────────────────

    @Test
    public void testWebhookFilterToJson() {
        WebhookFilter filter = new WebhookFilter();
        filter.setStatus(WebhookFilter.StatusEnum.DELIVERED);
        filter.setEndpointId(UUID.randomUUID());
        filter.setEventType("order.created");
        filter.setFromDate(OffsetDateTime.parse("2026-01-01T00:00:00Z"));
        filter.setToDate(OffsetDateTime.parse("2026-01-31T23:59:59Z"));
        filter.setPage(1);
        filter.setPerPage(20);
        String json = filter.toJson();
        assertTrue(json.contains("\"status\""));
        assertTrue(json.contains("delivered"));
        assertTrue(json.contains("order.created"));
        assertTrue(json.contains("\"page\""));
    }

    @Test
    public void testWebhookFilterFromJson() throws IOException {
        String json = "{\"status\":\"failed\",\"endpoint_id\":\"550e8400-e29b-41d4-a716-446655440000\"," +
            "\"event_type\":\"payment.refunded\",\"from_date\":\"2026-01-01T00:00:00Z\"," +
            "\"to_date\":\"2026-02-01T00:00:00Z\",\"page\":2,\"per_page\":50}";
        WebhookFilter filter = WebhookFilter.fromJson(json);
        assertEquals(WebhookFilter.StatusEnum.FAILED, filter.getStatus());
        assertEquals("payment.refunded", filter.getEventType());
        assertEquals(Integer.valueOf(2), filter.getPage());
        assertEquals(Integer.valueOf(50), filter.getPerPage());
    }

    @Test
    public void testWebhookFilterRoundTrip() throws IOException {
        WebhookFilter original = new WebhookFilter();
        original.setStatus(WebhookFilter.StatusEnum.PROCESSING);
        original.setEndpointId(UUID.fromString("550e8400-e29b-41d4-a716-446655440000"));
        original.setEventType("invoice.paid");
        original.setFromDate(OffsetDateTime.parse("2026-06-01T00:00:00Z"));
        original.setToDate(OffsetDateTime.parse("2026-06-30T23:59:59Z"));
        original.setPage(3);
        original.setPerPage(25);
        String json = original.toJson();
        WebhookFilter restored = WebhookFilter.fromJson(json);
        assertEquals(original.getStatus(), restored.getStatus());
        assertEquals(original.getEndpointId(), restored.getEndpointId());
        assertEquals(original.getEventType(), restored.getEventType());
        assertEquals(original.getPage(), restored.getPage());
        assertEquals(original.getPerPage(), restored.getPerPage());
        assertEquals(original, restored);
    }

    // ─── RetryPolicy ───────────────────────────────────────────────────

    @Test
    public void testRetryPolicyToJson() {
        RetryPolicy policy = new RetryPolicy();
        policy.setMaxAttempts(5);
        policy.setBackoff(RetryPolicy.BackoffEnum.EXPONENTIAL);
        policy.setInitialDelaySecs(10);
        policy.setMaxDelaySecs(3600);
        String json = policy.toJson();
        assertTrue(json.contains("\"max_attempts\""));
        assertTrue(json.contains("5"));
        assertTrue(json.contains("exponential"));
        assertTrue(json.contains("\"max_delay_secs\""));
    }

    @Test
    public void testRetryPolicyFromJson() throws IOException {
        String json = "{\"max_attempts\":10,\"backoff\":\"linear\",\"initial_delay_secs\":5,\"max_delay_secs\":600}";
        RetryPolicy policy = RetryPolicy.fromJson(json);
        assertEquals(Integer.valueOf(10), policy.getMaxAttempts());
        assertEquals(RetryPolicy.BackoffEnum.LINEAR, policy.getBackoff());
        assertEquals(Integer.valueOf(5), policy.getInitialDelaySecs());
        assertEquals(Integer.valueOf(600), policy.getMaxDelaySecs());
    }

    @Test
    public void testRetryPolicyRoundTrip() throws IOException {
        RetryPolicy original = new RetryPolicy();
        original.setMaxAttempts(7);
        original.setBackoff(RetryPolicy.BackoffEnum.FIXED);
        original.setInitialDelaySecs(15);
        original.setMaxDelaySecs(1800);
        String json = original.toJson();
        RetryPolicy restored = RetryPolicy.fromJson(json);
        assertEquals(original.getMaxAttempts(), restored.getMaxAttempts());
        assertEquals(original.getBackoff(), restored.getBackoff());
        assertEquals(original.getInitialDelaySecs(), restored.getInitialDelaySecs());
        assertEquals(original.getMaxDelaySecs(), restored.getMaxDelaySecs());
        assertEquals(original, restored);
    }

    // ─── Endpoint ──────────────────────────────────────────────────────

    @Test
    public void testEndpointFromJson() throws IOException {
        String json = "{\"id\":\"550e8400-e29b-41d4-a716-446655440000\"," +
            "\"url\":\"https://example.com/webhook\"," +
            "\"description\":\"Production endpoint\"," +
            "\"is_active\":true," +
            "\"retry_policy\":{\"max_attempts\":3,\"backoff\":\"exponential\",\"initial_delay_secs\":10,\"max_delay_secs\":3600}," +
            "\"created_at\":\"2026-01-15T10:00:00Z\"," +
            "\"routing_strategy\":\"round-robin\"," +
            "\"avg_response_ms\":150," +
            "\"failure_streak\":0," +
            "\"format\":\"standard\"}";
        Endpoint ep = Endpoint.fromJson(json);
        assertEquals(UUID.fromString("550e8400-e29b-41d4-a716-446655440000"), ep.getId());
        assertEquals(URI.create("https://example.com/webhook"), ep.getUrl());
        assertEquals("Production endpoint", ep.getDescription());
        assertTrue(ep.getIsActive());
        assertEquals(3, ep.getRetryPolicy().getMaxAttempts());
        assertEquals(Endpoint.RoutingStrategyEnum.ROUND_ROBIN, ep.getRoutingStrategy());
        assertEquals(Integer.valueOf(150), ep.getAvgResponseMs());
        assertEquals(Endpoint.FormatEnum.STANDARD, ep.getFormat());
    }

    @Test
    public void testEndpointRoundTrip() throws IOException {
        Endpoint original = new Endpoint();
        original.setId(UUID.fromString("550e8400-e29b-41d4-a716-446655440000"));
        original.setUrl(URI.create("https://hooks.example.com/recv"));
        original.setDescription("Test endpoint");
        original.setIsActive(true);
        RetryPolicy policy = new RetryPolicy();
        policy.setMaxAttempts(3);
        policy.setBackoff(RetryPolicy.BackoffEnum.EXPONENTIAL);
        policy.setInitialDelaySecs(10);
        policy.setMaxDelaySecs(3600);
        original.setRetryPolicy(policy);
        original.setCreatedAt(OffsetDateTime.parse("2026-05-01T12:00:00Z"));
        original.setRoutingStrategy(Endpoint.RoutingStrategyEnum.LATENCY);
        original.setAvgResponseMs(200);
        original.setFailureStreak(0);
        original.setFormat(Endpoint.FormatEnum.STANDARD);

        String json = original.toJson();
        Endpoint restored = Endpoint.fromJson(json);
        assertEquals(original.getId(), restored.getId());
        assertEquals(original.getUrl(), restored.getUrl());
        assertEquals(original.getDescription(), restored.getDescription());
        assertEquals(original.getIsActive(), restored.getIsActive());
        assertEquals(original.getRoutingStrategy(), restored.getRoutingStrategy());
        assertEquals(original.getAvgResponseMs(), restored.getAvgResponseMs());
        assertEquals(original.getFormat(), restored.getFormat());
    }

    // ─── Endpoint enums ────────────────────────────────────────────────

    @Test
    public void testEndpointRoutingStrategyEnumValues() {
        assertEquals("round-robin", Endpoint.RoutingStrategyEnum.ROUND_ROBIN.getValue());
        assertEquals("latency", Endpoint.RoutingStrategyEnum.LATENCY.getValue());
        assertEquals("failover", Endpoint.RoutingStrategyEnum.FAILOVER.getValue());
    }

    @Test
    public void testEndpointRoutingStrategyEnumFromValue() {
        assertEquals(Endpoint.RoutingStrategyEnum.ROUND_ROBIN, Endpoint.RoutingStrategyEnum.fromValue("round-robin"));
        assertEquals(Endpoint.RoutingStrategyEnum.LATENCY, Endpoint.RoutingStrategyEnum.fromValue("latency"));
        assertThrows(IllegalArgumentException.class, () -> Endpoint.RoutingStrategyEnum.fromValue("invalid"));
    }

    @Test
    public void testEndpointFormatEnumValues() {
        assertEquals("standard", Endpoint.FormatEnum.STANDARD.getValue());
        assertEquals("cloudevents", Endpoint.FormatEnum.CLOUDEVENTS.getValue());
    }

    // ─── WebhookFilter enums ───────────────────────────────────────────

    @Test
    public void testWebhookFilterStatusEnumValues() {
        assertEquals("pending", WebhookFilter.StatusEnum.PENDING.getValue());
        assertEquals("processing", WebhookFilter.StatusEnum.PROCESSING.getValue());
        assertEquals("delivered", WebhookFilter.StatusEnum.DELIVERED.getValue());
        assertEquals("failed", WebhookFilter.StatusEnum.FAILED.getValue());
    }

    @Test
    public void testWebhookFilterStatusEnumFromValue() {
        assertEquals(WebhookFilter.StatusEnum.DELIVERED, WebhookFilter.StatusEnum.fromValue("delivered"));
        assertThrows(IllegalArgumentException.class, () -> WebhookFilter.StatusEnum.fromValue("unknown"));
    }

    // ─── AlertRule ──────────────────────────────────────────────────────

    @Test
    public void testAlertRuleConditionEnumValues() {
        assertEquals("failure_rate", AlertRule.ConditionEnum.FAILURE_RATE.getValue());
        assertEquals("latency", AlertRule.ConditionEnum.LATENCY.getValue());
        assertEquals("consecutive_failures", AlertRule.ConditionEnum.CONSECUTIVE_FAILURES.getValue());
    }

    // ─── DeliveryStatus enum (via Delivery) ────────────────────────────

    @Test
    public void testDeliveryStatusEnumFromValue() {
        assertEquals(Delivery.StatusEnum.PENDING, Delivery.StatusEnum.fromValue("pending"));
        assertEquals(Delivery.StatusEnum.DELIVERED, Delivery.StatusEnum.fromValue("delivered"));
        assertEquals(Delivery.StatusEnum.FAILED, Delivery.StatusEnum.fromValue("failed"));
        assertThrows(IllegalArgumentException.class, () -> Delivery.StatusEnum.fromValue("bogus"));
    }

    // ─── JSON utility class ────────────────────────────────────────────

    @Test
    public void testJsonSerialize() {
        LoginRequest req = new LoginRequest();
        req.setEmail("a@b.com");
        req.setPassword("pw");
        String json = org.openapitools.client.JSON.serialize(req);
        assertTrue(json.contains("a@b.com"));
    }

    @Test
    public void testJsonDeserialize() {
        String json = "{\"error\":\"bad request\"}";
        Error error = org.openapitools.client.JSON.deserialize(json, Error.class);
        assertEquals("bad request", error.getError());
    }
}
