package com.hooksniff.models;

import java.util.List;

public class StreamChannelIn {
    public String name;
    public String description;
    public String channelType;
    public List<String> eventFilter;
    public Integer maxSubscribers;
    public Boolean enabled;
}
