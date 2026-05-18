import { type EnvironmentVariableIn } from "./environmentVariableIn";

export interface EnvironmentVariableBulkUpsertIn {
  variables: EnvironmentVariableIn[];
}

export const EnvironmentVariableBulkUpsertInSerializer = {
  _fromJsonObject(object: any): EnvironmentVariableBulkUpsertIn {
    return {
      variables: object["variables"],
    };
  },

  _toJsonObject(self: EnvironmentVariableBulkUpsertIn): any {
    return {
      variables: self.variables,
    };
  },
};
