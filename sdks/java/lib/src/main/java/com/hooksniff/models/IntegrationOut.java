package com.hooksniff.models;

import java.util.List;
import java.util.Map;

public class IntegrationOut {
    public String id;
    public String customerId;
    public String name;
    public String description;
    public String connectorConfigId;
    public String connectorName;
    public String connectorDisplayName;
    public String endpointId;
    public String endpointUrl;
    public boolean enabled;
    public List<String> eventFilter;
    public String transformId;
    public Map<String, Object> retryPolicy;
    public Map<String, Object> metadata;
    public String lastTriggeredAt;
    public String lastSuccessAt;
    public String lastFailureAt;
    public int failureCount;
    public long totalDeliveries;
    public long totalFailures;
    public String healthStatus;
    public String createdAt;
    public String updatedAt;
}
