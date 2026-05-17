export interface EnvironmentPatch {
  name?: string | null;
  description?: string | null;
  isDefault?: boolean;
  color?: string | null;
}

export const EnvironmentPatchSerializer = {
  _fromJsonObject(object: any): EnvironmentPatch {
    return {
      name: object["name"],
      description: object["description"],
      isDefault: object["is_default"],
      color: object["color"],
    };
  },

  _toJsonObject(self: EnvironmentPatch): any {
    return {
      name: self.name,
      description: self.description,
      is_default: self.isDefault,
      color: self.color,
    };
  },
};
