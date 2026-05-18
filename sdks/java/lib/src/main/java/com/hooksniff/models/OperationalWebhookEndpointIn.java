package com.hooksniff.models;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class OperationalWebhookEndpointIn {
    public String url;
    public String description;
    @JsonProperty("is_active") public Boolean isActive;
    @JsonProperty("event_types") public List<String> eventTypes;
}
