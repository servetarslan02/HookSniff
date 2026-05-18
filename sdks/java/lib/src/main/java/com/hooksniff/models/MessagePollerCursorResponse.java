package com.hooksniff.models;

import com.google.gson.annotations.SerializedName;

public class MessagePollerCursorResponse {
    @SerializedName("cursor") private MessagePollerCursor cursor;
    public MessagePollerCursor getCursor() { return cursor; }
}
