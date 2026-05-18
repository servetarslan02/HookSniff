package com.hooksniff.models;

import java.util.Map;

public class StreamMessageOut {
    public String id;
    public String channelId;
    public String eventType;
    public Map<String, Object> payload;
    public int deliveredCount;
    public String createdAt;
}
