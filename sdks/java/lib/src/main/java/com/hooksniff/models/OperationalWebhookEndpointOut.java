package com.hooksniff.models;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class OperationalWebhookEndpointOut {
    public String id;
    @JsonProperty("customer_id") public String customerId;
    public String url;
    public String description;
    @JsonProperty("is_active") public boolean isActive;
    @JsonProperty("event_types") public List<String> eventTypes;
    @JsonProperty("created_at") public String createdAt;
    @JsonProperty("updated_at") public String updatedAt;
}
