/**
 * Typed webhook event payloads for HookSniff.
 *
 * These types represent the structure of webhook event data
 * that HookSniff sends to your endpoints.
 */

/** Base interface for all webhook events */
export interface WebhookEventBase {
  /** Unique message ID */
  id: string;
  /** Event type name (e.g., "endpoint.created") */
  eventType: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Event payload data */
  data: Record<string, unknown>;
}

/** Endpoint events */
export interface EndpointCreatedEvent extends WebhookEventBase {
  eventType: "endpoint.created";
  data: {
    appId: string;
    appUid?: string;
    endpointId: string;
  };
}

export interface EndpointUpdatedEvent extends WebhookEventBase {
  eventType: "endpoint.updated";
  data: {
    appId: string;
    appUid?: string;
    endpointId: string;
  };
}

export interface EndpointDeletedEvent extends WebhookEventBase {
  eventType: "endpoint.deleted";
  data: {
    appId: string;
    appUid?: string;
    endpointId: string;
  };
}

export interface EndpointEnabledEvent extends WebhookEventBase {
  eventType: "endpoint.enabled";
  data: {
    appId: string;
    appUid?: string;
    endpointId: string;
  };
}

export interface EndpointDisabledEvent extends WebhookEventBase {
  eventType: "endpoint.disabled";
  data: {
    appId: string;
    appUid?: string;
    endpointId: string;
    failSince?: string;
    trigger?: "none" | "first-failure" | "repeated-failure";
  };
}

/** Message attempt events */
export interface MessageAttemptExhaustedEvent extends WebhookEventBase {
  eventType: "message.attempt.exhausted";
  data: {
    appId: string;
    appUid?: string;
    msgId: string;
    lastAttempt: {
      id: string;
      timestamp: string;
      responseStatusCode: number;
    };
  };
}

export interface MessageAttemptFailingEvent extends WebhookEventBase {
  eventType: "message.attempt.failing";
  data: {
    appId: string;
    appUid?: string;
    msgId: string;
    attempt: {
      id: string;
      timestamp: string;
      responseStatusCode: number;
    };
  };
}

export interface MessageAttemptRecoveredEvent extends WebhookEventBase {
  eventType: "message.attempt.recovered";
  data: {
    appId: string;
    appUid?: string;
    msgId: string;
    attempt: {
      id: string;
      timestamp: string;
      responseStatusCode: number;
    };
  };
}

/** Union type for all webhook events */
export type WebhookEvent =
  | EndpointCreatedEvent
  | EndpointUpdatedEvent
  | EndpointDeletedEvent
  | EndpointEnabledEvent
  | EndpointDisabledEvent
  | MessageAttemptExhaustedEvent
  | MessageAttemptFailingEvent
  | MessageAttemptRecoveredEvent
  | WebhookEventBase;

/** Map of event type names to their typed payloads */
export interface WebhookEventMap {
  "endpoint.created": EndpointCreatedEvent;
  "endpoint.updated": EndpointUpdatedEvent;
  "endpoint.deleted": EndpointDeletedEvent;
  "endpoint.enabled": EndpointEnabledEvent;
  "endpoint.disabled": EndpointDisabledEvent;
  "message.attempt.exhausted": MessageAttemptExhaustedEvent;
  "message.attempt.failing": MessageAttemptFailingEvent;
  "message.attempt.recovered": MessageAttemptRecoveredEvent;
}

/**
 * Type-safe webhook event handler.
 *
 * Usage:
 * ```ts
 * const handler: WebhookEventHandler<"endpoint.created"> = (event) => {
 *   console.log(event.data.endpointId); // typed!
 * };
 * ```
 */
export type WebhookEventHandler<T extends keyof WebhookEventMap> = (
  event: WebhookEventMap[T]
) => void | Promise<void>;

/**
 * Verify and parse a webhook payload with typed event data.
 *
 * @param secret - The webhook signing secret
 * @param payload - The raw request body
 * @param headers - The request headers
 * @returns The parsed and typed webhook event
 */
export function verifyWebhookEvent<T extends keyof WebhookEventMap = keyof WebhookEventMap>(
  secret: string,
  payload: string,
  headers: Record<string, string>
): WebhookEventMap[T] {
  const { Webhook } = require("./webhook");
  const wh = new Webhook(secret);
  return wh.verify(payload, headers) as WebhookEventMap[T];
}
