/**
 * HookSniff SDK — Utility types and error handling

 * Adapted for HookSniff API.
 */

export interface PostOptions {
  idempotencyKey?: string;
}

export class ApiException<T = unknown> extends Error {
  public headers: Record<string, string> = {};

  public constructor(
    public code: number,
    public body: T,
    headers: Headers
  ) {
    super(`HTTP-Code: ${code}\nBody: ${typeof body === "string" ? body : JSON.stringify(body)}`);

    headers.forEach((value: string, name: string) => {
      this.headers[name] = value;
    });
  }
}

/**
 * XOR type helper — forces exactly one of two options.
 */
export type XOR<T, U> =
  | (T & { [K in keyof U]?: never })
  | (U & { [K in keyof T]?: never });
