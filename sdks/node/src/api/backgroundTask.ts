import {
  type BackgroundTaskOut,
  BackgroundTaskOutSerializer,
} from "../models/backgroundTaskOut";
import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/**
 * Manage background tasks (async operations like bulk replay).
 *
 * Background tasks are created automatically by certain API operations.
 * Use this class to poll for status and cancel pending tasks.
 *
 * @example
 * ```ts
 * const hs = new HookSniff("hooksniff_xxx");
 *
 * // List all tasks
 * const tasks = await hs.backgroundTask.list();
 *
 * // Get a specific task
 * const task = await hs.backgroundTask.get("task_id");
 *
 * // Cancel a pending task
 * await hs.backgroundTask.cancel("task_id");
 * ```
 */
export class BackgroundTask {
  public constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /**
   * List all background tasks for the authenticated customer.
   */
  public list(): Promise<BackgroundTaskOut[]> {
    const request = new HookSniffRequest(HttpMethod.GET, "/api/v1/background-tasks");
    return request.send(this.requestCtx, (arr: any[]) =>
      arr.map(BackgroundTaskOutSerializer._fromJsonObject)
    );
  }

  /**
   * Get a background task by ID.
   *
   * @param taskId - The task ID
   */
  public get(taskId: string): Promise<BackgroundTaskOut> {
    const request = new HookSniffRequest(
      HttpMethod.GET,
      "/api/v1/background-tasks/{task_id}"
    );
    request.setPathParam("task_id", taskId);
    return request.send(this.requestCtx, BackgroundTaskOutSerializer._fromJsonObject);
  }

  /**
   * Cancel a pending or running background task.
   *
   * @param taskId - The task ID
   */
  public cancel(taskId: string): Promise<BackgroundTaskOut> {
    const request = new HookSniffRequest(
      HttpMethod.PUT,
      "/api/v1/background-tasks/{task_id}"
    );
    request.setPathParam("task_id", taskId);
    return request.send(this.requestCtx, BackgroundTaskOutSerializer._fromJsonObject);
  }
}
