package com.hooksniff.models;
import com.fasterxml.jackson.annotation.JsonProperty;

public class OperationalWebhookDeliveryOut {
    public String id;
    @JsonProperty("endpoint_id") public String endpointId;
    @JsonProperty("event_type") public String eventType;
    public Object payload;
    @JsonProperty("response_status") public Integer responseStatus;
    @JsonProperty("attempt_count") public int attemptCount;
    public String status;
    @JsonProperty("created_at") public String createdAt;
    @JsonProperty("delivered_at") public String deliveredAt;
}
