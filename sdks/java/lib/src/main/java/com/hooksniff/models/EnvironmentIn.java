package com.hooksniff.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EnvironmentIn {
    public String name;
    public String slug;
    public String description;
    @JsonProperty("is_default") public Boolean isDefault;
    public String color;
}
