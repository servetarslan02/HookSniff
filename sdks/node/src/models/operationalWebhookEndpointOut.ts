export interface OperationalWebhookEndpointOut {
  id: string;
  customerId: string;
  url: string;
  description?: string | null;
  isActive: boolean;
  eventTypes?: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export const OperationalWebhookEndpointOutSerializer = {
  _fromJsonObject(object: any): OperationalWebhookEndpointOut {
    return {
      id: object["id"],
      customerId: object["customer_id"],
      url: object["url"],
      description: object["description"],
      isActive: object["is_active"],
      eventTypes: object["event_types"],
      createdAt: new Date(object["created_at"]),
      updatedAt: new Date(object["updated_at"]),
    };
  },
  _toJsonObject(self: OperationalWebhookEndpointOut): any {
    return {
      id: self.id, customer_id: self.customerId, url: self.url,
      description: self.description, is_active: self.isActive,
      event_types: self.eventTypes,
      created_at: self.createdAt.toISOString(), updated_at: self.updatedAt.toISOString(),
    };
  },
};
