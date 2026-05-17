package com.hooksniff.models;

import com.google.gson.annotations.SerializedName;

public class MessagePollerCursor {
    @SerializedName("consumer_id") private String consumerId;
    @SerializedName("last_message_id") private String lastMessageId;
    @SerializedName("last_sequence_num") private Long lastSequenceNum;

    public String getConsumerId() { return consumerId; }
    public String getLastMessageId() { return lastMessageId; }
    public Long getLastSequenceNum() { return lastSequenceNum; }
}
