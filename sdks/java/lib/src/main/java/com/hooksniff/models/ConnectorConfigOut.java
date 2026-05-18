package com.hooksniff.models;

import com.google.gson.annotations.SerializedName;

public class ConnectorConfigOut {
    @SerializedName("id") private String id;
    @SerializedName("connector_id") private String connectorId;
    @SerializedName("connector_name") private String connectorName;
    @SerializedName("connector_display_name") private String connectorDisplayName;
    @SerializedName("name") private String name;
    @SerializedName("is_active") private Boolean isActive;
    @SerializedName("created_at") private String createdAt;

    public String getId() { return id; }
    public String getConnectorId() { return connectorId; }
    public String getConnectorName() { return connectorName; }
    public String getConnectorDisplayName() { return connectorDisplayName; }
    public String getName() { return name; }
    public Boolean getIsActive() { return isActive; }
    public String getCreatedAt() { return createdAt; }
}
