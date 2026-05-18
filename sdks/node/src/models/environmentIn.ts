export interface EnvironmentIn {
  name: string;
  slug?: string | null;
  description?: string | null;
  isDefault?: boolean;
  color?: string | null;
}

export const EnvironmentInSerializer = {
  _fromJsonObject(object: any): EnvironmentIn {
    return {
      name: object["name"],
      slug: object["slug"],
      description: object["description"],
      isDefault: object["is_default"],
      color: object["color"],
    };
  },

  _toJsonObject(self: EnvironmentIn): any {
    return {
      name: self.name,
      slug: self.slug,
      description: self.description,
      is_default: self.isDefault,
      color: self.color,
    };
  },
};
