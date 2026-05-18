export interface OperationalWebhookDeliveryOut {
  id: string;
  endpointId: string;
  eventType: string;
  payload: Record<string, any>;
  responseStatus?: number | null;
  attemptCount: number;
  status: string;
  createdAt: Date;
  deliveredAt?: Date | null;
}

export const OperationalWebhookDeliveryOutSerializer = {
  _fromJsonObject(object: any): OperationalWebhookDeliveryOut {
    return {
      id: object["id"], endpointId: object["endpoint_id"],
      eventType: object["event_type"], payload: object["payload"],
      responseStatus: object["response_status"], attemptCount: object["attempt_count"],
      status: object["status"], createdAt: new Date(object["created_at"]),
      deliveredAt: object["delivered_at"] ? new Date(object["delivered_at"]) : null,
    };
  },
  _toJsonObject(self: OperationalWebhookDeliveryOut): any {
    return {
      id: self.id, endpoint_id: self.endpointId, event_type: self.eventType,
      payload: self.payload, response_status: self.responseStatus,
      attempt_count: self.attemptCount, status: self.status,
      created_at: self.createdAt.toISOString(), delivered_at: self.deliveredAt?.toISOString(),
    };
  },
};
