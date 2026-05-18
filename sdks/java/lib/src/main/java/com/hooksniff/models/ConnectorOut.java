package com.hooksniff.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class ConnectorOut {
    @SerializedName("id") private String id;
    @SerializedName("name") private String name;
    @SerializedName("display_name") private String displayName;
    @SerializedName("description") private String description;
    @SerializedName("supported_events") private List<String> supportedEvents;
    @SerializedName("is_active") private Boolean isActive;
    @SerializedName("created_at") private String createdAt;

    public String getId() { return id; }
    public String getName() { return name; }
    public String getDisplayName() { return displayName; }
    public String getDescription() { return description; }
    public List<String> getSupportedEvents() { return supportedEvents; }
    public Boolean getIsActive() { return isActive; }
    public String getCreatedAt() { return createdAt; }
}
