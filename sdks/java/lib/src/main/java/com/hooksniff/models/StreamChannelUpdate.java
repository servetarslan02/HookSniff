package com.hooksniff.models;

import java.util.List;

public class StreamChannelUpdate {
    public String name;
    public String description;
    public List<String> eventFilter;
    public Integer maxSubscribers;
    public Boolean enabled;
}
