package com.hooksniff.models;

import java.util.List;
import java.util.Map;

public class StreamSubscriptionOut {
    public String id;
    public String channelId;
    public String customerId;
    public String connectionType;
    public String clientId;
    public List<String> eventFilter;
    public String connectedAt;
    public String lastHeartbeatAt;
    public long messagesSent;
    public Map<String, Object> metadata;
}
