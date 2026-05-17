package com.hooksniff.models;

import java.util.List;

public class StreamChannelOut {
    public String id;
    public String customerId;
    public String name;
    public String description;
    public String channelType;
    public List<String> eventFilter;
    public boolean enabled;
    public int maxSubscribers;
    public int currentSubscribers;
    public long totalMessages;
    public String createdAt;
    public String updatedAt;
}
