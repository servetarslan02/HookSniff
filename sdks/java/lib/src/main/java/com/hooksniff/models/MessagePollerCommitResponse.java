package com.hooksniff.models;

import com.google.gson.annotations.SerializedName;

public class MessagePollerCommitResponse {
    @SerializedName("cursor") private MessagePollerCursor cursor;
    @SerializedName("committed") private Boolean committed;

    public MessagePollerCursor getCursor() { return cursor; }
    public Boolean getCommitted() { return committed; }
}
