package com.hooksniff.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EnvironmentVariableIn {
    public String key;
    public String value;
    @JsonProperty("is_secret") public Boolean isSecret;
}
