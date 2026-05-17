package com.hooksniff.models;

import com.google.gson.annotations.SerializedName;

public class InboundConfigIn {
    @SerializedName("provider") private String provider;
    @SerializedName("secret") private String secret;
    @SerializedName("endpoint_id") private String endpointId;
    @SerializedName("enabled") private Boolean enabled;

    public InboundConfigIn(String provider, String secret) {
        this.provider = provider;
        this.secret = secret;
    }

    public InboundConfigIn setEndpointId(String endpointId) { this.endpointId = endpointId; return this; }
    public InboundConfigIn setEnabled(Boolean enabled) { this.enabled = enabled; return this; }
}
