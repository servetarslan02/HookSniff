package com.hooksniff.models;

import com.google.gson.annotations.SerializedName;

public class ConnectorConfigIn {
    @SerializedName("connector_id") private String connectorId;
    @SerializedName("name") private String name;
    @SerializedName("config") private Object config;
    @SerializedName("credentials") private Object credentials;
    @SerializedName("is_active") private Boolean isActive;

    public ConnectorConfigIn(String connectorId, String name) {
        this.connectorId = connectorId;
        this.name = name;
    }

    public ConnectorConfigIn setConfig(Object config) { this.config = config; return this; }
    public ConnectorConfigIn setCredentials(Object credentials) { this.credentials = credentials; return this; }
    public ConnectorConfigIn setIsActive(Boolean isActive) { this.isActive = isActive; return this; }
}
