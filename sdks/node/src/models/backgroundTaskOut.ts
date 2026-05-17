export interface BackgroundTaskOut {
  id: string;
  customerId: string;
  taskType: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  data?: Record<string, any> | null;
  result?: Record<string, any> | null;
  error?: string | null;
  progress: number;
  createdAt: Date;
  startedAt?: Date | null;
  finishedAt?: Date | null;
}

export const BackgroundTaskOutSerializer = {
  _fromJsonObject(object: any): BackgroundTaskOut {
    return {
      id: object["id"],
      customerId: object["customer_id"],
      taskType: object["task_type"],
      status: object["status"],
      data: object["data"],
      result: object["result"],
      error: object["error"],
      progress: object["progress"] ?? 0,
      createdAt: new Date(object["created_at"]),
      startedAt: object["started_at"] ? new Date(object["started_at"]) : null,
      finishedAt: object["finished_at"] ? new Date(object["finished_at"]) : null,
    };
  },

  _toJsonObject(self: BackgroundTaskOut): any {
    return {
      id: self.id,
      customer_id: self.customerId,
      task_type: self.taskType,
      status: self.status,
      data: self.data,
      result: self.result,
      error: self.error,
      progress: self.progress,
      created_at: self.createdAt.toISOString(),
      started_at: self.startedAt?.toISOString(),
      finished_at: self.finishedAt?.toISOString(),
    };
  },
};
