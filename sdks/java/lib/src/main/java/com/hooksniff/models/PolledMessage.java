package com.hooksniff.models;

import com.google.gson.annotations.SerializedName;

public class PolledMessage {
    @SerializedName("id") private String id;
    @SerializedName("endpoint_id") private String endpointId;
    @SerializedName("event_type") private String eventType;
    @SerializedName("status") private String status;
    @SerializedName("attempt_count") private Integer attemptCount;
    @SerializedName("response_status") private Integer responseStatus;
    @SerializedName("created_at") private String createdAt;
    @SerializedName("payload") private Object payload;

    public String getId() { return id; }
    public String getEndpointId() { return endpointId; }
    public String getEventType() { return eventType; }
    public String getStatus() { return status; }
    public Integer getAttemptCount() { return attemptCount; }
    public Integer getResponseStatus() { return responseStatus; }
    public String getCreatedAt() { return createdAt; }
    public Object getPayload() { return payload; }
}
