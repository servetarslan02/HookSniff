import { type MessagePollerCursor, MessagePollerCursorSerializer } from "./messagePollerCursor";

export interface MessagePollerCursorResponse {
  cursor: MessagePollerCursor;
}

export const MessagePollerCursorResponseSerializer = {
  _fromJsonObject(json: any): MessagePollerCursorResponse {
    return {
      cursor: MessagePollerCursorSerializer._fromJsonObject(json['cursor']),
    };
  },

  _toJsonObject(instance: MessagePollerCursorResponse): any {
    return {
      'cursor': MessagePollerCursorSerializer._toJsonObject(instance.cursor),
    };
  },
};
