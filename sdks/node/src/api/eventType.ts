import {
  type EventTypeImportOpenApiIn,
  EventTypeImportOpenApiInSerializer,
} from "../models/eventTypeImportOpenApiIn";
import {
  type EventTypeImportOpenApiOut,
  EventTypeImportOpenApiOutSerializer,
} from "../models/eventTypeImportOpenApiOut";
import { type EventTypeIn, EventTypeInSerializer } from "../models/eventTypeIn";
import { type EventTypeOut, EventTypeOutSerializer } from "../models/eventTypeOut";
import { type EventTypePatch, EventTypePatchSerializer } from "../models/eventTypePatch";
import {
  type EventTypeUpdate,
  EventTypeUpdateSerializer,
} from "../models/eventTypeUpdate";
import {
  type ListResponseEventTypeOut,
  ListResponseEventTypeOutSerializer,
} from "../models/listResponseEventTypeOut";
import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** Options for listing event types */
export interface EventTypeListOptions {
  limit?: number;
  iterator?: string | null;
  order?: string;
  includeArchived?: boolean;
  withContent?: boolean;
}

/** Options for creating an event type */
export interface EventTypeCreateOptions {
  idempotencyKey?: string;
}

/** Options for importing event types from OpenAPI */
export interface EventTypeImportOpenapiOptions {
  idempotencyKey?: string;
}

/** Options for deleting an event type */
export interface EventTypeDeleteOptions {
  /** Also expunge the event type (permanent) */
  expunge?: boolean;
}

/**
 * Manage event types.
 *
 * Event types define the types of webhooks your application can send.
 * Endpoints can filter which event types they want to receive.
 *
 * @example
 * ```ts
 * const hs = new HookSniff("hooksniff_xxx");
 *
 * // Create an event type
 * await hs.eventType.create({
 *   name: "order.created",
 *   description: "Fired when a new order is created",
 *   schemas: {
 *     "1": {
 *       properties: {
 *         orderId: { type: "string" },
 *         total: { type: "number" },
 *       },
 *     },
 *   },
 * });
 *
 * // List all event types
 * const { data } = await hs.eventType.list();
 *
 * // Get a specific event type
 * const et = await hs.eventType.get("order.created");
 *
 * // Update event type
 * await hs.eventType.update("order.created", {
 *   description: "Updated description",
 * });
 *
 * // Delete (archive) event type
 * await hs.eventType.delete("old.event");
 * ```
 */
export class EventType {
  public constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /**
   * List all event types.
   *
   * @param options - Filtering and pagination options
   * @returns A paginated list of event types
   */
  public list(options?: EventTypeListOptions): Promise<ListResponseEventTypeOut> {
    const request = new HookSniffRequest(HttpMethod.GET, "/api/v1/event-type");

    request.setQueryParams({
      limit: options?.limit,
      iterator: options?.iterator,
      order: options?.order,
      include_archived: options?.includeArchived,
      with_content: options?.withContent,
    });

    return request.send(
      this.requestCtx,
      ListResponseEventTypeOutSerializer._fromJsonObject
    );
  }

  /**
   * Create a new event type.
   *
   * If an archived event type with the same name exists, it will be unarchived.
   *
   * @param eventTypeIn - The event type configuration
   * @param options - Request options
   * @returns The created event type
   */
  public create(
    eventTypeIn: EventTypeIn,
    options?: EventTypeCreateOptions
  ): Promise<EventTypeOut> {
    const request = new HookSniffRequest(HttpMethod.POST, "/api/v1/event-type");

    request.setHeaderParam("idempotency-key", options?.idempotencyKey);
    request.setBody(EventTypeInSerializer._toJsonObject(eventTypeIn));

    return request.send(this.requestCtx, EventTypeOutSerializer._fromJsonObject);
  }

  /**
   * Import event types from an OpenAPI specification.
   *
   * This creates or updates event types based on the `webhooks` or
   * `x-webhooks` sections of the spec.
   *
   * @param eventTypeImportOpenApiIn - The OpenAPI spec to import
   * @param options - Request options
   * @returns Import result with created/updated event types
   */
  public importOpenapi(
    eventTypeImportOpenApiIn: EventTypeImportOpenApiIn,
    options?: EventTypeImportOpenapiOptions
  ): Promise<EventTypeImportOpenApiOut> {
    const request = new HookSniffRequest(
      HttpMethod.POST,
      "/api/v1/event-type/import/openapi"
    );

    request.setHeaderParam("idempotency-key", options?.idempotencyKey);
    request.setBody(EventTypeImportOpenApiInSerializer._toJsonObject(eventTypeImportOpenApiIn));

    return request.send(
      this.requestCtx,
      EventTypeImportOpenApiOutSerializer._fromJsonObject
    );
  }

  /**
   * Get an event type by name.
   *
   * @param eventTypeName - The event type name (e.g., "order.created")
   * @returns The event type details
   */
  public get(eventTypeName: string): Promise<EventTypeOut> {
    const request = new HookSniffRequest(
      HttpMethod.GET,
      "/api/v1/event-type/{event_type_name}"
    );

    request.setPathParam("event_type_name", eventTypeName);

    return request.send(this.requestCtx, EventTypeOutSerializer._fromJsonObject);
  }

  /**
   * Update an event type.
   *
   * @param eventTypeName - The event type name
   * @param eventTypeUpdate - The updated configuration
   * @returns The updated event type
   */
  public update(
    eventTypeName: string,
    eventTypeUpdate: EventTypeUpdate
  ): Promise<EventTypeOut> {
    const request = new HookSniffRequest(
      HttpMethod.PUT,
      "/api/v1/event-type/{event_type_name}"
    );

    request.setPathParam("event_type_name", eventTypeName);
    request.setBody(EventTypeUpdateSerializer._toJsonObject(eventTypeUpdate));

    return request.send(this.requestCtx, EventTypeOutSerializer._fromJsonObject);
  }

  /**
   * Delete (archive) an event type.
   *
   * Archived event types cannot be used for new messages, but existing
   * endpoints continue to receive them. Use `create` to unarchive.
   *
   * @param eventTypeName - The event type name
   * @param options - Delete options
   */
  public delete(
    eventTypeName: string,
    options?: EventTypeDeleteOptions
  ): Promise<void> {
    const request = new HookSniffRequest(
      HttpMethod.DELETE,
      "/api/v1/event-type/{event_type_name}"
    );

    request.setPathParam("event_type_name", eventTypeName);
    request.setQueryParams({
      expunge: options?.expunge,
    });

    return request.sendNoResponseBody(this.requestCtx);
  }

  /**
   * Partially update an event type.
   *
   * @param eventTypeName - The event type name
   * @param eventTypePatch - Fields to update
   * @returns The updated event type
   */
  public patch(
    eventTypeName: string,
    eventTypePatch: EventTypePatch
  ): Promise<EventTypeOut> {
    const request = new HookSniffRequest(
      HttpMethod.PATCH,
      "/api/v1/event-type/{event_type_name}"
    );

    request.setPathParam("event_type_name", eventTypeName);
    request.setBody(EventTypePatchSerializer._toJsonObject(eventTypePatch));

    return request.send(this.requestCtx, EventTypeOutSerializer._fromJsonObject);
  }
}
