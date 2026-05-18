import {
  type EnvironmentIn,
  EnvironmentInSerializer,
} from "../models/environmentIn";
import {
  type EnvironmentOut,
  EnvironmentOutSerializer,
} from "../models/environmentOut";
import {
  type EnvironmentPatch,
  EnvironmentPatchSerializer,
} from "../models/environmentPatch";
import {
  type EnvironmentVariableIn,
  EnvironmentVariableInSerializer,
} from "../models/environmentVariableIn";
import {
  type EnvironmentVariableOut,
  EnvironmentVariableOutSerializer,
} from "../models/environmentVariableOut";
import {
  type EnvironmentVariableBulkUpsertIn,
  EnvironmentVariableBulkUpsertInSerializer,
} from "../models/environmentVariableBulkUpsertIn";
import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/**
 * Manage environments (dev/staging/prod) and their variables.
 *
 * Environments allow you to organize endpoints and configuration
 * per environment. Each customer can have multiple environments,
 * each with its own set of variables.
 *
 * @example
 * ```ts
 * const hs = new HookSniff("hooksniff_xxx");
 *
 * // Create an environment
 * const env = await hs.environment.create({
 *   name: "Production",
 *   slug: "production",
 *   color: "#22c55e",
 *   isDefault: true,
 * });
 *
 * // List environments
 * const { data } = await hs.environment.list();
 *
 * // Add a variable
 * await hs.environment.createVariable(env.id, {
 *   key: "API_URL",
 *   value: "https://api.example.com",
 * });
 *
 * // Bulk upsert variables
 * await hs.environment.bulkUpsertVariables(env.id, {
 *   variables: [
 *     { key: "DB_HOST", value: "prod.db.example.com" },
 *     { key: "DB_PASSWORD", value: "secret", isSecret: true },
 *   ],
 * });
 * ```
 */
export class Environment {
  public constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /**
   * List all environments for the authenticated customer.
   */
  public list(): Promise<EnvironmentOut[]> {
    const request = new HookSniffRequest(HttpMethod.GET, "/api/v1/environments");
    return request.send(this.requestCtx, (arr: any[]) =>
      arr.map(EnvironmentOutSerializer._fromJsonObject)
    );
  }

  /**
   * Create a new environment.
   *
   * @param environmentIn - The environment configuration
   * @returns The created environment
   */
  public create(environmentIn: EnvironmentIn): Promise<EnvironmentOut> {
    const request = new HookSniffRequest(HttpMethod.POST, "/api/v1/environments");
    request.setBody(EnvironmentInSerializer._toJsonObject(environmentIn));
    return request.send(this.requestCtx, EnvironmentOutSerializer._fromJsonObject);
  }

  /**
   * Get an environment by ID.
   *
   * @param environmentId - The environment ID
   * @returns The environment details
   */
  public get(environmentId: string): Promise<EnvironmentOut> {
    const request = new HookSniffRequest(
      HttpMethod.GET,
      "/api/v1/environments/{environment_id}"
    );
    request.setPathParam("environment_id", environmentId);
    return request.send(this.requestCtx, EnvironmentOutSerializer._fromJsonObject);
  }

  /**
   * Update an environment.
   *
   * @param environmentId - The environment ID
   * @param environmentPatch - Fields to update
   * @returns The updated environment
   */
  public update(
    environmentId: string,
    environmentPatch: EnvironmentPatch
  ): Promise<EnvironmentOut> {
    const request = new HookSniffRequest(
      HttpMethod.PUT,
      "/api/v1/environments/{environment_id}"
    );
    request.setPathParam("environment_id", environmentId);
    request.setBody(EnvironmentPatchSerializer._toJsonObject(environmentPatch));
    return request.send(this.requestCtx, EnvironmentOutSerializer._fromJsonObject);
  }

  /**
   * Delete an environment.
   *
   * @param environmentId - The environment ID
   */
  public delete(environmentId: string): Promise<void> {
    const request = new HookSniffRequest(
      HttpMethod.DELETE,
      "/api/v1/environments/{environment_id}"
    );
    request.setPathParam("environment_id", environmentId);
    return request.sendNoResponseBody(this.requestCtx);
  }

  // ── Variables ──────────────────────────────────────────

  /**
   * List all variables in an environment.
   *
   * @param environmentId - The environment ID
   * @returns List of variables (secrets are masked)
   */
  public listVariables(environmentId: string): Promise<EnvironmentVariableOut[]> {
    const request = new HookSniffRequest(
      HttpMethod.GET,
      "/api/v1/environments/{environment_id}/variables"
    );
    request.setPathParam("environment_id", environmentId);
    return request.send(this.requestCtx, (arr: any[]) =>
      arr.map(EnvironmentVariableOutSerializer._fromJsonObject)
    );
  }

  /**
   * Get a single variable.
   *
   * @param environmentId - The environment ID
   * @param variableId - The variable ID
   * @returns The variable details
   */
  public getVariable(environmentId: string, variableId: string): Promise<EnvironmentVariableOut> {
    const request = new HookSniffRequest(
      HttpMethod.GET,
      "/api/v1/environments/{environment_id}/variables/{var_id}"
    );
    request.setPathParam("environment_id", environmentId);
    request.setPathParam("var_id", variableId);
    return request.send(this.requestCtx, EnvironmentVariableOutSerializer._fromJsonObject);
  }

  /**
   * Create a variable in an environment.
   *
   * @param environmentId - The environment ID
   * @param variableIn - The variable configuration
   * @returns The created variable
   */
  public createVariable(
    environmentId: string,
    variableIn: EnvironmentVariableIn
  ): Promise<EnvironmentVariableOut> {
    const request = new HookSniffRequest(
      HttpMethod.POST,
      "/api/v1/environments/{environment_id}/variables"
    );
    request.setPathParam("environment_id", environmentId);
    request.setBody(EnvironmentVariableInSerializer._toJsonObject(variableIn));
    return request.send(this.requestCtx, EnvironmentVariableOutSerializer._fromJsonObject);
  }

  /**
   * Update a variable.
   *
   * @param environmentId - The environment ID
   * @param variableId - The variable ID
   * @param variableIn - The updated variable configuration
   * @returns The updated variable
   */
  public updateVariable(
    environmentId: string,
    variableId: string,
    variableIn: EnvironmentVariableIn
  ): Promise<EnvironmentVariableOut> {
    const request = new HookSniffRequest(
      HttpMethod.PUT,
      "/api/v1/environments/{environment_id}/variables/{var_id}"
    );
    request.setPathParam("environment_id", environmentId);
    request.setPathParam("var_id", variableId);
    request.setBody(EnvironmentVariableInSerializer._toJsonObject(variableIn));
    return request.send(this.requestCtx, EnvironmentVariableOutSerializer._fromJsonObject);
  }

  /**
   * Delete a variable.
   *
   * @param environmentId - The environment ID
   * @param variableId - The variable ID
   */
  public deleteVariable(environmentId: string, variableId: string): Promise<void> {
    const request = new HookSniffRequest(
      HttpMethod.DELETE,
      "/api/v1/environments/{environment_id}/variables/{var_id}"
    );
    request.setPathParam("environment_id", environmentId);
    request.setPathParam("var_id", variableId);
    return request.sendNoResponseBody(this.requestCtx);
  }

  /**
   * Bulk upsert variables (create or update multiple at once).
   *
   * @param environmentId - The environment ID
   * @param bulkIn - The variables to upsert
   * @returns The upserted variables
   */
  public bulkUpsertVariables(
    environmentId: string,
    bulkIn: EnvironmentVariableBulkUpsertIn
  ): Promise<EnvironmentVariableOut[]> {
    const request = new HookSniffRequest(
      HttpMethod.POST,
      "/api/v1/environments/{environment_id}/variables/bulk"
    );
    request.setPathParam("environment_id", environmentId);
    request.setBody(EnvironmentVariableBulkUpsertInSerializer._toJsonObject(bulkIn));
    return request.send(this.requestCtx, (arr: any[]) =>
      arr.map(EnvironmentVariableOutSerializer._fromJsonObject)
    );
  }
}
