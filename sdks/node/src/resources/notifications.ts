/**
 * HookSniff SDK — Notifications Resource
 */

import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";
import type {
  Notification,
  NotificationListResponse,
  NotificationPreferences,
  UpdateNotificationPreferences,
  RegisterDeviceRequest,
  DeviceTokenResponse,
} from "../models";

export class Notifications {
  constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /** List notifications. */
  public list(options?: { limit?: number; is_read?: boolean }): Promise<NotificationListResponse> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/notifications");
    request.setQueryParams({
      limit: options?.limit,
      is_read: options?.is_read,
    });
    return request.send(this.requestCtx, (json) => json as NotificationListResponse);
  }

  /** Get unread count. */
  public unreadCount(): Promise<{ count: number }> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/notifications/unread-count");
    return request.send(this.requestCtx, (json) => json as { count: number });
  }

  /** Mark a notification as read. */
  public markRead(notificationId: string): Promise<Notification> {
    const request = new HookSniffRequest(HttpMethod.PUT, "/v1/notifications/{id}/read");
    request.setPathParam("id", notificationId);
    return request.send(this.requestCtx, (json) => json as Notification);
  }

  /** Mark all notifications as read. */
  public markAllRead(): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.PUT, "/v1/notifications/read-all");
    return request.sendNoResponseBody(this.requestCtx);
  }

  /** Get notification preferences. */
  public getPreferences(): Promise<NotificationPreferences> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/notifications/preferences");
    return request.send(this.requestCtx, (json) => json as NotificationPreferences);
  }

  /** Update notification preferences. */
  public updatePreferences(body: UpdateNotificationPreferences): Promise<NotificationPreferences> {
    const request = new HookSniffRequest(HttpMethod.PUT, "/v1/notifications/preferences");
    request.setBody(body);
    return request.send(this.requestCtx, (json) => json as NotificationPreferences);
  }

  /** Register a device for push notifications. */
  public registerDevice(body: RegisterDeviceRequest): Promise<DeviceTokenResponse> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/devices");
    request.setBody(body);
    return request.send(this.requestCtx, (json) => json as DeviceTokenResponse);
  }
}
