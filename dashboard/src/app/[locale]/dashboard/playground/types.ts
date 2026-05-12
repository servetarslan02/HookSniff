export interface PlaygroundRequest {
  id: string;
  method: string;
  path: string;
  body: string;
  status: number | null;
  response: unknown;
  timestamp: string;
  duration_ms: number;
  headers?: Record<string, string>;
}

export const HISTORY_KEY = 'hooksniff_playground_history';
export const MAX_HISTORY = 10;
export const MAX_HISTORY_SIZE_BYTES = 500 * 1024; // 500KB limit for localStorage
