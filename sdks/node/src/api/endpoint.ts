import {
  type EndpointHeadersIn,
  EndpointHeadersInSerializer,
} from "../models/endpointHeadersIn";
import {
  type EndpointHeadersOut,
  EndpointHeadersOutSerializer,
} from "../models/endpointHeadersOut";
import {
  type EndpointHeadersPatchIn,
  EndpointHeadersPatchInSerializer,
} from "../models/endpointHeadersPatchIn";
import { type EndpointIn, EndpointInSerializer } from "../models/endpointIn";
import { type EndpointOut, EndpointOutSerializer } from "../models/endpointOut";
import { type EndpointPatch, EndpointPatchSerializer } from "../models/endpointPatch";
import {
  type EndpointSecretOut,
  EndpointSecretOutSerializer,
} from "../models/endpointSecretOut";
import {
  type EndpointSecretRotateIn,
  EndpointSecretRotateInSerializer,
} from "../models/endpointSecretRotateIn";
import {
  type EndpointUpdate,
  EndpointUpdateSerializer,
} from "../models/endpointUpdate";
import {
  type ListResponseEndpointOut,
  ListResponseEndpointOutSerializer,
} from "../models/listResponseEndpointOut";
import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

export interface EndpointListOptions {
  limit?: number;
  iterator?: string | null;
  order?: string;
}

export interface EndpointCreateOptions {
  idempotencyKey?: string;
}

export interface EndpointRotateSecretOptions {
  idempotencyKey?: string;
}

export class Endpoint {
  public constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /** List endpoints. */
  public list(options?: EndpointListOptions): Promise<ListResponseEndpointOut> {
    const request = new HookSniffRequest(HttpMethod.GET, "/api/v1/endpoint");

    request.setQueryParams({
      limit: options?.limit,
      iterator: options?.iterator,
      order: options?.order,
    });

    return request.send(
      this.requestCtx,
      ListResponseEndpointOutSerializer._fromJsonObject
    );
  }

  /** Create a new endpoint. */
  public create(
    endpointIn: EndpointIn,
    options?: EndpointCreateOptions
  ): Promise<EndpointOut> {
    const request = new HookSniffRequest(HttpMethod.POST, "/api/v1/endpoint");

    request.setHeaderParam("idempotency-key", options?.idempotencyKey);
    request.setBody(EndpointInSerializer._toJsonObject(endpointIn));

    return request.send(this.requestCtx, EndpointOutSerializer._fromJsonObject);
  }

  /** Get an endpoint. */
  public get(endpointId: string): Promise<EndpointOut> {
    const request = new HookSniffRequest(
      HttpMethod.GET,
      "/api/v1/endpoint/{endpoint_id}"
    );

    request.setPathParam("endpoint_id", endpointId);

    return request.send(this.requestCtx, EndpointOutSerializer._fromJsonObject);
  }

  /** Update an endpoint. */
  public update(
    endpointId: string,
    endpointUpdate: EndpointUpdate
  ): Promise<EndpointOut> {
    const request = new HookSniffRequest(
      HttpMethod.PUT,
      "/api/v1/endpoint/{endpoint_id}"
    );

    request.setPathParam("endpoint_id", endpointId);
    request.setBody(EndpointUpdateSerializer._toJsonObject(endpointUpdate));

    return request.send(this.requestCtx, EndpointOutSerializer._fromJsonObject);
  }

  /** Delete an endpoint. */
  public delete(endpointId: string): Promise<void> {
    const request = new HookSniffRequest(
      HttpMethod.DELETE,
      "/api/v1/endpoint/{endpoint_id}"
    );

    request.setPathParam("endpoint_id", endpointId);

    return request.sendNoResponseBody(this.requestCtx);
  }

  /** Partially update an endpoint. */
  public patch(
    endpointId: string,
    endpointPatch: EndpointPatch
  ): Promise<EndpointOut> {
    const request = new HookSniffRequest(
      HttpMethod.PATCH,
      "/api/v1/endpoint/{endpoint_id}"
    );

    request.setPathParam("endpoint_id", endpointId);
    request.setBody(EndpointPatchSerializer._toJsonObject(endpointPatch));

    return request.send(this.requestCtx, EndpointOutSerializer._fromJsonObject);
  }

  /** Get the additional headers to be sent with the webhook. */
  public getHeaders(endpointId: string): Promise<EndpointHeadersOut> {
    const request = new HookSniffRequest(
      HttpMethod.GET,
      "/api/v1/endpoint/{endpoint_id}/headers"
    );

    request.setPathParam("endpoint_id", endpointId);

    return request.send(this.requestCtx, EndpointHeadersOutSerializer._fromJsonObject);
  }

  /** Set the additional headers to be sent with the webhook. */
  public updateHeaders(
    endpointId: string,
    endpointHeadersIn: EndpointHeadersIn
  ): Promise<void> {
    const request = new HookSniffRequest(
      HttpMethod.PUT,
      "/api/v1/endpoint/{endpoint_id}/headers"
    );

    request.setPathParam("endpoint_id", endpointId);
    request.setBody(EndpointHeadersInSerializer._toJsonObject(endpointHeadersIn));

    return request.sendNoResponseBody(this.requestCtx);
  }

  /** Partially set the additional headers to be sent with the webhook. */
  public patchHeaders(
    endpointId: string,
    endpointHeadersPatchIn: EndpointHeadersPatchIn
  ): Promise<void> {
    const request = new HookSniffRequest(
      HttpMethod.PATCH,
      "/api/v1/endpoint/{endpoint_id}/headers"
    );

    request.setPathParam("endpoint_id", endpointId);
    request.setBody(EndpointHeadersPatchInSerializer._toJsonObject(endpointHeadersPatchIn));

    return request.sendNoResponseBody(this.requestCtx);
  }

  /** Get the endpoint's signing secret. */
  public getSecret(endpointId: string): Promise<EndpointSecretOut> {
    const request = new HookSniffRequest(
      HttpMethod.GET,
      "/api/v1/endpoint/{endpoint_id}/secret"
    );

    request.setPathParam("endpoint_id", endpointId);

    return request.send(this.requestCtx, EndpointSecretOutSerializer._fromJsonObject);
  }

  /** Rotate the endpoint's signing secret. */
  public rotateSecret(
    endpointId: string,
    endpointSecretRotateIn: EndpointSecretRotateIn,
    options?: EndpointRotateSecretOptions
  ): Promise<void> {
    const request = new HookSniffRequest(
      HttpMethod.POST,
      "/api/v1/endpoint/{endpoint_id}/secret/rotate"
    );

    request.setPathParam("endpoint_id", endpointId);
    request.setHeaderParam("idempotency-key", options?.idempotencyKey);
    request.setBody(EndpointSecretRotateInSerializer._toJsonObject(endpointSecretRotateIn));

    return request.sendNoResponseBody(this.requestCtx);
  }
}
