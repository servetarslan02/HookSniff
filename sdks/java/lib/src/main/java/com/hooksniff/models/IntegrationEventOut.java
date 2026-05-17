package com.hooksniff.models;

import java.util.Map;

public class IntegrationEventOut {
    public String id;
    public String integrationId;
    public String eventType;
    public String sourceEventId;
    public Map<String, Object> payload;
    public String status;
    public String deliveryId;
    public String errorMessage;
    public int attempts;
    public Integer durationMs;
    public String createdAt;
    public String processedAt;
}
