export interface MessageIn {
  /** List of free-form identifiers that endpoints can filter by */
  channels?: string[] | null;
  /**
   * The date and time at which the message will be delivered.
   *
   * Note that this time is best-effort-only. Must be at least one minute and no more than 24 hours in the future.
   */
  deliverAt?: Date | null;
  /** Optional unique identifier for the message */
  eventId?: string | null;
  /** The event type's name */
  eventType: string;
  /**
   * JSON payload to send as the request body of the webhook.
   *
   * We also support sending non-JSON payloads. Please contact us for more information.
   */
  payload: any;
  /** Optional number of hours to retain the message payload. */
  payloadRetentionHours?: number | null;
  /** Optional number of days to retain the message payload. Defaults to 90. */
  payloadRetentionPeriod?: number | null;
  /** List of free-form tags that can be filtered by when listing messages */
  tags?: string[] | null;
  /** Extra parameters to pass to Transformations (for future use) */
  transformationsParams?: any | null;
}

export const MessageInSerializer = {
  _fromJsonObject(object: any): MessageIn {
    return {
      channels: object["channels"],
      deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null,
      eventId: object["eventId"],
      eventType: object["eventType"],
      payload: object["payload"],
      payloadRetentionHours: object["payloadRetentionHours"],
      payloadRetentionPeriod: object["payloadRetentionPeriod"],
      tags: object["tags"],
      transformationsParams: object["transformationsParams"],
    };
  },

  _toJsonObject(self: MessageIn): any {
    return {
      channels: self.channels,
      deliverAt: self.deliverAt,
      eventId: self.eventId,
      eventType: self.eventType,
      payload: self.payload,
      payloadRetentionHours: self.payloadRetentionHours,
      payloadRetentionPeriod: self.payloadRetentionPeriod,
      tags: self.tags,
      transformationsParams: self.transformationsParams,
    };
  },
};
