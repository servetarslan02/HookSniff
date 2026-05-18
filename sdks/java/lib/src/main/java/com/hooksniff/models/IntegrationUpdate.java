package com.hooksniff.models;

import java.util.List;
import java.util.Map;

public class IntegrationUpdate {
    public String name;
    public String description;
    public String endpointId;
    public List<String> eventFilter;
    public String transformId;
    public Map<String, Object> retryPolicy;
    public Map<String, Object> metadata;
    public Boolean enabled;
}
