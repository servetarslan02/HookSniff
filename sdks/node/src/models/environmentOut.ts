export interface EnvironmentOut {
  id: string;
  customerId: string;
  name: string;
  slug: string;
  description?: string | null;
  isDefault: boolean;
  color?: string | null;
  createdAt: Date;
  updatedAt: Date;
  variableCount?: number | null;
}

export const EnvironmentOutSerializer = {
  _fromJsonObject(object: any): EnvironmentOut {
    return {
      id: object["id"],
      customerId: object["customer_id"],
      name: object["name"],
      slug: object["slug"],
      description: object["description"],
      isDefault: object["is_default"],
      color: object["color"],
      createdAt: new Date(object["created_at"]),
      updatedAt: new Date(object["updated_at"]),
      variableCount: object["variable_count"],
    };
  },

  _toJsonObject(self: EnvironmentOut): any {
    return {
      id: self.id,
      customer_id: self.customerId,
      name: self.name,
      slug: self.slug,
      description: self.description,
      is_default: self.isDefault,
      color: self.color,
      created_at: self.createdAt.toISOString(),
      updated_at: self.updatedAt.toISOString(),
      variable_count: self.variableCount,
    };
  },
};
