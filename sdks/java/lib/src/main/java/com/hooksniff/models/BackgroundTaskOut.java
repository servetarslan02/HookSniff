package com.hooksniff.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public class BackgroundTaskOut {
    public String id;
    @JsonProperty("customer_id") public String customerId;
    @JsonProperty("task_type") public String taskType;
    public String status;
    public Object data;
    public Object result;
    public String error;
    public int progress;
    @JsonProperty("created_at") public String createdAt;
    @JsonProperty("started_at") public String startedAt;
    @JsonProperty("finished_at") public String finishedAt;
}
