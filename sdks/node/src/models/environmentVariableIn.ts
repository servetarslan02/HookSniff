export interface EnvironmentVariableIn {
  key: string;
  value: string;
  isSecret?: boolean;
}

export const EnvironmentVariableInSerializer = {
  _fromJsonObject(object: any): EnvironmentVariableIn {
    return {
      key: object["key"],
      value: object["value"],
      isSecret: object["is_secret"],
    };
  },

  _toJsonObject(self: EnvironmentVariableIn): any {
    return {
      key: self.key,
      value: self.value,
      is_secret: self.isSecret,
    };
  },
};
