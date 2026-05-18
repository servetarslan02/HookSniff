export interface OperationalWebhookEndpointIn {
  url: string;
  description?: string | null;
  isActive?: boolean;
  eventTypes?: string[] | null;
}

export const OperationalWebhookEndpointInSerializer = {
  _fromJsonObject(object: any): OperationalWebhookEndpointIn {
    return {
      url: object["url"], description: object["description"],
      isActive: object["is_active"], eventTypes: object["event_types"],
    };
  },
  _toJsonObject(self: OperationalWebhookEndpointIn): any {
    return {
      url: self.url, description: self.description,
      is_active: self.isActive, event_types: self.eventTypes,
    };
  },
};
