package com.hooksniff.models;

import com.google.gson.annotations.SerializedName;

public class InboundConfigOut {
    @SerializedName("id") private String id;
    @SerializedName("customer_id") private String customerId;
    @SerializedName("provider") private String provider;
    @SerializedName("secret") private String secret;
    @SerializedName("endpoint_id") private String endpointId;
    @SerializedName("enabled") private Boolean enabled;
    @SerializedName("created_at") private String createdAt;

    public String getId() { return id; }
    public String getCustomerId() { return customerId; }
    public String getProvider() { return provider; }
    public String getSecret() { return secret; }
    public String getEndpointId() { return endpointId; }
    public Boolean getEnabled() { return enabled; }
    public String getCreatedAt() { return createdAt; }
}
