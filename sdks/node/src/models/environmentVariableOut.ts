export interface EnvironmentVariableOut {
  id: string;
  environmentId: string;
  key: string;
  value: string;
  isSecret: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const EnvironmentVariableOutSerializer = {
  _fromJsonObject(object: any): EnvironmentVariableOut {
    return {
      id: object["id"],
      environmentId: object["environment_id"],
      key: object["key"],
      value: object["value"],
      isSecret: object["is_secret"],
      createdAt: new Date(object["created_at"]),
      updatedAt: new Date(object["updated_at"]),
    };
  },

  _toJsonObject(self: EnvironmentVariableOut): any {
    return {
      id: self.id,
      environment_id: self.environmentId,
      key: self.key,
      value: self.value,
      is_secret: self.isSecret,
      created_at: self.createdAt.toISOString(),
      updated_at: self.updatedAt.toISOString(),
    };
  },
};
