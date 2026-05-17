package com.hooksniff.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EnvironmentModelOut {
    public String id;
    @JsonProperty("customer_id") public String customerId;
    public String name;
    public String slug;
    public String description;
    @JsonProperty("is_default") public boolean isDefault;
    public String color;
    @JsonProperty("created_at") public String createdAt;
    @JsonProperty("updated_at") public String updatedAt;
    @JsonProperty("variable_count") public Long variableCount;
}
