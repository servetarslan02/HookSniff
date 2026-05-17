package com.hooksniff.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class MessagePollerPollResponse {
    @SerializedName("messages") private List<PolledMessage> messages;
    @SerializedName("cursor") private MessagePollerCursor cursor;
    @SerializedName("done") private Boolean done;

    public List<PolledMessage> getMessages() { return messages; }
    public MessagePollerCursor getCursor() { return cursor; }
    public Boolean getDone() { return done; }
}
