package com.hookrelay;

/**
 * Represents a webhook delivery.
 */
public class Delivery {
    private String id;
    private String endpointId;
    private String event;
    private String status;
    private int attemptCount;
    private Integer responseStatus;
    private int replayCount;
    private String createdAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEndpointId() { return endpointId; }
    public void setEndpointId(String endpointId) { this.endpointId = endpointId; }
    public String getEvent() { return event; }
    public void setEvent(String event) { this.event = event; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getAttemptCount() { return attemptCount; }
    public void setAttemptCount(int attemptCount) { this.attemptCount = attemptCount; }
    public Integer getResponseStatus() { return responseStatus; }
    public void setResponseStatus(Integer responseStatus) { this.responseStatus = responseStatus; }
    public int getReplayCount() { return replayCount; }
    public void setReplayCount(int replayCount) { this.replayCount = replayCount; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
