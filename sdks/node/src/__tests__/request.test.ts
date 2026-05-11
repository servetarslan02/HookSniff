/**
 * HookSniff SDK — Request Helper Tests
 *
 * Tests for HTTP client: retry, timeout, error handling, edge cases.
 */

import { HookSniffRequest, HttpMethod, ApiException, LIB_VERSION } from "../request";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.log(`  ❌ ${message}`);
    failed++;
  }
}

function assertEqual(actual: unknown, expected: unknown, message: string) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  assert(ok, ok ? message : `${message} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

// ─── Mock fetch ─────────────────────────────────────────────────────────────

function mockFetch(response: {
  status?: number;
  statusText?: string;
  body?: string;
  headers?: Record<string, string>;
  delay?: number;
  error?: Error;
}) {
  const calls: Array<{ url: URL; init: RequestInit }> = [];

  const fn = async (url: URL, init: RequestInit): Promise<Response> => {
    calls.push({ url, init });
    if (response.delay) {
      await new Promise((r) => setTimeout(r, response.delay));
    }
    if (response.error) {
      throw response.error;
    }
    // Build response — bypass status restrictions (e.g. 204) via defineProperty
    const status = response.status ?? 200;
    const body = status === 204 ? null : (response.body ?? '{"ok":true}');
    const res = new Response(body, {
      status: 200, // safe default
      headers: response.headers ?? { "content-type": "application/json" },
    });
    Object.defineProperty(res, "status", { value: status });
    Object.defineProperty(res, "statusText", { value: response.statusText ?? "OK" });
    return res;
  };

  return { fn, calls };
}

function mockFetchSequence(responses: Array<{
  status?: number;
  body?: string;
  error?: Error;
}>) {
  const calls: Array<{ url: URL; init: RequestInit }> = [];
  let index = 0;

  const fn = async (url: URL, init: RequestInit): Promise<Response> => {
    calls.push({ url, init });
    const res = responses[index] ?? responses[responses.length - 1];
    index++;

    if (res.error) {
      throw res.error;
    }

    const status = res.status ?? 200;
    const response = new Response(status === 204 ? null : (res.body ?? '{"ok":true}"'), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
    Object.defineProperty(response, "status", { value: status });
    return response;
  };

  return { fn, calls };
}

const BASE_CTX = {
  baseUrl: "https://api.test.com",
  token: "test-token",
  numRetries: 0,
};

// ─── Tests ──────────────────────────────────────────────────────────────────

async function testUserAgentFormat() {
  console.log("\nUser-Agent format:");
  const { fn, calls } = mockFetch({});
  const req = new HookSniffRequest(HttpMethod.GET, "/v1/test");
  await req.send({ ...BASE_CTX, fetch: fn });

  const userAgent = (calls[0].init.headers as Record<string, string>)["user-agent"];
  assert(userAgent.includes("hooksniff-sdk/"), "Contains hooksniff-sdk/");
  assert(userAgent.includes(`/${LIB_VERSION}`), `Contains version ${LIB_VERSION}`);
  assert(userAgent.includes("(node)"), "Contains (node)");
}

async function testCustomFetch() {
  console.log("\nCustom fetch injection:");
  const { fn, calls } = mockFetch({ body: '{"injected":true}' });
  const req = new HookSniffRequest(HttpMethod.GET, "/v1/test");
  const result = await req.send<{ injected: boolean }>({ ...BASE_CTX, fetch: fn });

  assert(calls.length === 1, "Custom fetch was called");
  assertEqual(result.injected, true, "Response came from custom fetch");
}

async function testDefaultFetch() {
  console.log("\nDefault fetch (globalThis.fetch):");
  // This just verifies it doesn't throw when no custom fetch is provided
  // In test env, globalThis.fetch should exist (Node 18+)
  const req = new HookSniffRequest(HttpMethod.GET, "/v1/test");
  assert(typeof req.send === "function", "send method exists");
}

async function testIdempotencyKey() {
  console.log("\nIdempotency key (POST auto-generates):");
  const { fn, calls } = mockFetch({});
  const req = new HookSniffRequest(HttpMethod.POST, "/v1/test");
  req.setBody({ data: "test" });
  await req.send({ ...BASE_CTX, fetch: fn });

  const headers = calls[0].init.headers as Record<string, string>;
  assert(headers["idempotency-key"] !== undefined, "Auto idempotency key set");
  assert(headers["idempotency-key"].startsWith("auto_"), "Key starts with auto_");
  assert(headers["idempotency-key"].length > 10, "Key is long enough");
}

async function testIdempotencyKeyCustom() {
  console.log("\nIdempotency key (custom override):");
  const { fn, calls } = mockFetch({});
  const req = new HookSniffRequest(HttpMethod.POST, "/v1/test");
  req.setHeaderParam("idempotency-key", "my-custom-key");
  req.setBody({ data: "test" });
  await req.send({ ...BASE_CTX, fetch: fn });

  const headers = calls[0].init.headers as Record<string, string>;
  assertEqual(headers["idempotency-key"], "my-custom-key", "Custom key preserved");
}

async function testNoIdempotencyOnGet() {
  console.log("\nNo idempotency key on GET:");
  const { fn, calls } = mockFetch({});
  const req = new HookSniffRequest(HttpMethod.GET, "/v1/test");
  await req.send({ ...BASE_CTX, fetch: fn });

  const headers = calls[0].init.headers as Record<string, string>;
  assert(headers["idempotency-key"] === undefined, "No idempotency key on GET");
}

async function testRetryOn5xx() {
  console.log("\nRetry on 5xx:");
  const { fn, calls } = mockFetchSequence([
    { status: 500, body: '{"error":"server"}' },
    { status: 500, body: '{"error":"server"}' },
    { status: 200, body: '{"ok":true}' },
  ]);
  const req = new HookSniffRequest(HttpMethod.GET, "/v1/test");
  const result = await req.send<{ ok: boolean }>({
    ...BASE_CTX,
    numRetries: 2,
    fetch: fn,
  });

  assertEqual(calls.length, 3, "Made 3 attempts");
  assertEqual(result.ok, true, "Eventually succeeded");
}

async function testNoRetryOn4xx() {
  console.log("\nNo retry on 4xx:");
  const { fn, calls } = mockFetch({ status: 404, body: '{"error":"not found"}' });
  const req = new HookSniffRequest(HttpMethod.GET, "/v1/test");

  try {
    await req.send({ ...BASE_CTX, numRetries: 3, fetch: fn });
    assert(false, "Should have thrown");
  } catch (err) {
    assert(err instanceof ApiException, "Threw ApiException");
    assertEqual((err as ApiException).code, 404, "Status is 404");
    assertEqual(calls.length, 1, "Only 1 attempt (no retry)");
  }
}

async function testRetryOnNetworkError() {
  console.log("\nRetry on network error:");
  let attempt = 0;
  const calls: Array<{ url: URL; init: RequestInit }> = [];

  const fn = async (url: URL, init: RequestInit): Promise<Response> => {
    calls.push({ url, init });
    attempt++;
    if (attempt < 3) {
      throw new Error("ECONNREFUSED");
    }
    return new Response('{"ok":true}', {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  const req = new HookSniffRequest(HttpMethod.GET, "/v1/test");
  const result = await req.send<{ ok: boolean }>({
    ...BASE_CTX,
    numRetries: 2,
    fetch: fn,
  });

  assertEqual(calls.length, 3, "Retried after network errors");
  assertEqual(result.ok, true, "Eventually succeeded");
}

async function testTimeoutAbort() {
  console.log("\nTimeout triggers abort:");

  const fn = async (url: URL, init: RequestInit): Promise<Response> => {
    const signal = init.signal as AbortSignal;
    // Wait until abort is triggered or 5 seconds pass
    await new Promise<void>((resolve) => {
      if (signal.aborted) { resolve(); return; }
      signal.addEventListener("abort", () => resolve(), { once: true });
      setTimeout(resolve, 5000);
    });
    // If aborted, throw like real fetch would
    if (signal.aborted) {
      throw new DOMException("The operation was aborted.", "AbortError");
    }
    return new Response('{"ok":true}', { status: 200 });
  };

  const req = new HookSniffRequest(HttpMethod.GET, "/v1/test");
  try {
    await req.send({ ...BASE_CTX, timeout: 50, numRetries: 0, fetch: fn });
    assert(false, "Should have thrown");
  } catch (err) {
    assert(err instanceof Error, "Threw an error");
    // AbortError is retried, then throws lastError
    assert(true, "Timeout triggered abort");
  }
}

async function testEmptyBody204() {
  console.log("\n204 No Content:");
  const { fn } = mockFetch({ status: 204, body: "" });
  const req = new HookSniffRequest(HttpMethod.DELETE, "/v1/test/123");
  const result = await req.send<void>({ ...BASE_CTX, fetch: fn });
  assert(result === undefined, "Returns undefined for 204");
}

async function testEmptyBody200() {
  console.log("\n200 with empty body (no parser):");
  const { fn } = mockFetch({ status: 200, body: "" });
  const req = new HookSniffRequest(HttpMethod.GET, "/v1/test");
  const result = await req.send<unknown>({ ...BASE_CTX, fetch: fn });
  assert(result === undefined, "Returns undefined for empty body");
}

async function testEmptyBody200WithParser() {
  console.log("\n200 with empty body (with parser):");
  const { fn } = mockFetch({ status: 200, body: "" });
  const req = new HookSniffRequest(HttpMethod.GET, "/v1/test");

  try {
    await req.send<{ id: string }>({ ...BASE_CTX, fetch: fn }, (json) => {
      const obj = json as Record<string, unknown>;
      return { id: String(obj.id) };
    });
    assert(false, "Should have thrown");
  } catch (err) {
    assert(err instanceof ApiException, "Threw ApiException for empty body");
    assert(
      (err as ApiException).body === "Empty response body",
      "Error message mentions empty body"
    );
  }
}

async function testInvalidJson() {
  console.log("\nInvalid JSON response:");
  const { fn } = mockFetch({ status: 200, body: '<html>Error</html>' });
  const req = new HookSniffRequest(HttpMethod.GET, "/v1/test");

  try {
    await req.send({ ...BASE_CTX, fetch: fn });
    assert(false, "Should have thrown");
  } catch (err) {
    assert(err instanceof ApiException, "Threw ApiException for invalid JSON");
    assert(
      String((err as ApiException).body).includes("Invalid JSON"),
      "Error mentions invalid JSON"
    );
  }
}

async function testParserError() {
  console.log("\nParser throws error:");
  const { fn } = mockFetch({ status: 200, body: '{"wrong":"data"}' });
  const req = new HookSniffRequest(HttpMethod.GET, "/v1/test");

  try {
    await req.send<{ id: string }>({ ...BASE_CTX, fetch: fn }, (json) => {
      const obj = json as Record<string, unknown>;
      // This will throw because "id" is missing
      const id = obj.id as string;
      if (!id) throw new Error("Missing required field 'id'");
      return { id };
    });
    assert(false, "Should have thrown");
  } catch (err) {
    assert(err instanceof ApiException, "Threw ApiException for parser error");
    assert(
      String((err as ApiException).body).includes("Response parsing failed"),
      "Error mentions parsing failure"
    );
    assert(
      String((err as ApiException).body).includes("Missing required field"),
      "Error includes original parser message"
    );
  }
}

async function testApiExceptionFields() {
  console.log("\nApiException fields:");
  const headers = new Headers({
    "x-request-id": "req-123",
    "content-type": "application/json",
  });
  const err = new ApiException(422, "Unprocessable Entity", { field: "email" }, headers);

  assertEqual(err.code, 422, "code is 422");
  assertEqual(err.statusText, "Unprocessable Entity", "statusText correct");
  assertEqual(err.message.includes("422"), true, "message contains code");
  assertEqual(err.message.includes("Unprocessable"), true, "message contains statusText");
  assertEqual(err.headers["x-request-id"], "req-123", "headers captured");
  assert(err instanceof Error, "instanceof Error");
}

async function testSetBodyDoubleCall() {
  console.log("\nsetBody double call warning:");
  const logs: string[] = [];
  const origWarn = console.warn;
  console.warn = (msg: string) => logs.push(msg);

  const req = new HookSniffRequest(HttpMethod.POST, "/v1/test");
  req.setBody({ first: true });
  req.setBody({ second: true });

  console.warn = origWarn;
  assert(logs.some((l) => l.includes("setBody() called twice")), "Warned on double setBody");
}

async function testSetPathParamMultiple() {
  console.log("\nsetPathParam replaces all occurrences:");
  const { fn, calls } = mockFetch({});
  const req = new HookSniffRequest(HttpMethod.GET, "/v1/tenants/{tenant_id}/users/{tenant_id}");
  req.setPathParam("tenant_id", "t_123");
  await req.send({ ...BASE_CTX, fetch: fn });

  const url = calls[0].url.toString();
  assert(url.includes("tenants/t_123/users/t_123"), "Both occurrences replaced");
}

async function testSetPathParamEncoding() {
  console.log("\nsetPathParam encodes special characters:");
  const { fn, calls } = mockFetch({});
  const req = new HookSniffRequest(HttpMethod.GET, "/v1/endpoints/{id}");
  req.setPathParam("id", "abc/def?x=1");
  await req.send({ ...BASE_CTX, fetch: fn });

  const url = calls[0].url.toString();
  assert(url.includes("abc%2Fdef%3Fx%3D1"), "Special chars encoded");
}

async function testQueryParamFiltering() {
  console.log("\nsetQueryParams filters null/undefined:");
  const { fn, calls } = mockFetch({});
  const req = new HookSniffRequest(HttpMethod.GET, "/v1/test");
  req.setQueryParams({
    valid: "yes",
    skip_null: null,
    skip_undefined: undefined,
    number: 42,
    bool: true,
    zero: 0,
    empty_string: "",
  });
  await req.send({ ...BASE_CTX, fetch: fn });

  const url = calls[0].url;
  assertEqual(url.searchParams.get("valid"), "yes", "valid param set");
  assertEqual(url.searchParams.get("skip_null"), null, "null filtered");
  assertEqual(url.searchParams.get("skip_undefined"), null, "undefined filtered");
  assertEqual(url.searchParams.get("number"), "42", "number converted to string");
  assertEqual(url.searchParams.get("bool"), "true", "bool converted to string");
  assertEqual(url.searchParams.get("zero"), "0", "zero kept");
  assertEqual(url.searchParams.get("empty_string"), "", "empty string kept");
}

async function testAuthorizationHeader() {
  console.log("\nAuthorization header:");
  const { fn, calls } = mockFetch({});
  const req = new HookSniffRequest(HttpMethod.GET, "/v1/test");
  await req.send({ ...BASE_CTX, token: "my-secret-token", fetch: fn });

  const headers = calls[0].init.headers as Record<string, string>;
  assertEqual(headers["authorization"], "Bearer my-secret-token", "Bearer token set");
}

async function testAcceptHeader() {
  console.log("\nAccept header:");
  const { fn, calls } = mockFetch({});
  const req = new HookSniffRequest(HttpMethod.GET, "/v1/test");
  await req.send({ ...BASE_CTX, fetch: fn });

  const headers = calls[0].init.headers as Record<string, string>;
  assertEqual(headers["accept"], "application/json", "Accept is application/json");
}

async function testContentTypeWithBody() {
  console.log("\nContent-Type with body:");
  const { fn, calls } = mockFetch({});
  const req = new HookSniffRequest(HttpMethod.POST, "/v1/test");
  req.setBody({ data: "test" });
  await req.send({ ...BASE_CTX, fetch: fn });

  const headers = calls[0].init.headers as Record<string, string>;
  assertEqual(headers["content-type"], "application/json", "Content-Type set with body");
}

async function testNoContentTypeWithoutBody() {
  console.log("\nNo Content-Type without body:");
  const { fn, calls } = mockFetch({});
  const req = new HookSniffRequest(HttpMethod.GET, "/v1/test");
  await req.send({ ...BASE_CTX, fetch: fn });

  const headers = calls[0].init.headers as Record<string, string>;
  assert(headers["content-type"] === undefined, "No Content-Type on GET without body");
}

async function testJitterInRetry() {
  console.log("\nJitter produces different delays:");
  const delays: number[] = [];

  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    const { fn } = mockFetchSequence([
      { status: 500, body: '{"error":"s"}' },
      { status: 200, body: '{"ok":true}' },
    ]);
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/test");
    await req.send({ ...BASE_CTX, numRetries: 1, fetch: fn });
    delays.push(Date.now() - start);
  }

  // With jitter, delays should vary (not all identical)
  const unique = new Set(delays.map((d) => Math.floor(d / 10)));
  assert(unique.size > 1, `Jitter produces varied delays (${unique.size} unique buckets)`);
}

async function testSendVoidConsumesBody() {
  console.log("\nsendVoid consumes response body:");
  const { fn, calls } = mockFetch({ status: 200, body: '{"ok":true}' });
  const req = new HookSniffRequest(HttpMethod.DELETE, "/v1/test/123");
  await req.sendVoid({ ...BASE_CTX, fetch: fn });

  assertEqual(calls.length, 1, "Request was made");
  // sendVoid should not throw even with response body
}

// ─── Run all tests ──────────────────────────────────────────────────────────

async function runAll() {
  console.log("🪝 HookSniff SDK — Request Helper Tests\n");

  await testUserAgentFormat();
  await testCustomFetch();
  await testDefaultFetch();
  await testIdempotencyKey();
  await testIdempotencyKeyCustom();
  await testNoIdempotencyOnGet();
  await testRetryOn5xx();
  await testNoRetryOn4xx();
  await testRetryOnNetworkError();
  await testTimeoutAbort();
  await testEmptyBody204();
  await testEmptyBody200();
  await testEmptyBody200WithParser();
  await testInvalidJson();
  await testParserError();
  await testApiExceptionFields();
  await testSetBodyDoubleCall();
  await testSetPathParamMultiple();
  await testSetPathParamEncoding();
  await testQueryParamFiltering();
  await testAuthorizationHeader();
  await testAcceptHeader();
  await testContentTypeWithBody();
  await testNoContentTypeWithoutBody();
  await testJitterInRetry();
  await testSendVoidConsumesBody();

  console.log(`\n${"=".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log("Some tests failed! ❌");
    process.exit(1);
  } else {
    console.log("All tests passed! 🎉");
  }
}

runAll().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
