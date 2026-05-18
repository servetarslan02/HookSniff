export interface MessagePollerCursor {
  consumerId: string;
  lastMessageId?: string | null;
  lastSequenceNum: number;
}

export const MessagePollerCursorSerializer = {
  _fromJsonObject(json: any): MessagePollerCursor {
    return {
      consumerId: json['consumer_id'],
      lastMessageId: json['last_message_id'] ?? null,
      lastSequenceNum: json['last_sequence_num'],
    };
  },

  _toJsonObject(instance: MessagePollerCursor): any {
    return {
      'consumer_id': instance.consumerId,
      'last_message_id': instance.lastMessageId,
      'last_sequence_num': instance.lastSequenceNum,
    };
  },
};
