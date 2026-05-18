package com.hooksniff.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EnvironmentVariableOut {
    public String id;
    @JsonProperty("environment_id") public String environmentId;
    public String key;
    public String value;
    @JsonProperty("is_secret") public boolean isSecret;
    @JsonProperty("created_at") public String createdAt;
    @JsonProperty("updated_at") public String updatedAt;
}
