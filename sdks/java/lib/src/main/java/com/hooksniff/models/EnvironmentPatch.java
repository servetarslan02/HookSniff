package com.hooksniff.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EnvironmentPatch {
    public String name;
    public String description;
    @JsonProperty("is_default") public Boolean isDefault;
    public String color;
}
