import { type MessagePollerCursor, MessagePollerCursorSerializer } from "./messagePollerCursor";

export interface MessagePollerCommitResponse {
  cursor: MessagePollerCursor;
  committed: boolean;
}

export const MessagePollerCommitResponseSerializer = {
  _fromJsonObject(json: any): MessagePollerCommitResponse {
    return {
      cursor: MessagePollerCursorSerializer._fromJsonObject(json['cursor']),
      committed: json['committed'],
    };
  },

  _toJsonObject(instance: MessagePollerCommitResponse): any {
    return {
      'cursor': MessagePollerCursorSerializer._toJsonObject(instance.cursor),
      'committed': instance.committed,
    };
  },
};
