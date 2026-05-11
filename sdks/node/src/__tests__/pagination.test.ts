/**
 * HookSniff SDK — Pagination Tests
 *
 * Tests for async pagination iterator.
 */

import { paginate, collectAll, type Page } from "../pagination";

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

// ─── Helpers ────────────────────────────────────────────────────────────────

function mockPages<T>(pages: Array<Page<T>>) {
  let callCount = 0;
  const fn = async (params: { limit: number; offset: number }): Promise<Page<T>> => {
    const page = pages[Math.min(callCount, pages.length - 1)];
    callCount++;
    return page;
  };
  return { fn, getCallCount: () => callCount };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

async function testSinglePage() {
  console.log("Single page (no more pages):");
  const { fn } = mockPages([
    { data: [1, 2, 3], has_more: false },
  ]);

  const results: number[] = [];
  for await (const item of paginate(fn)) {
    results.push(item);
  }

  assertEqual(results.length, 3, "Fetched all 3 items");
  assertEqual(results[0], 1, "First item correct");
  assertEqual(results[2], 3, "Last item correct");
}

async function testMultiplePages() {
  console.log("\nMultiple pages:");
  const { fn, getCallCount } = mockPages([
    { data: [1, 2], has_more: true },
    { data: [3, 4], has_more: true },
    { data: [5], has_more: false },
  ]);

  const results: number[] = [];
  for await (const item of paginate(fn, { limit: 2 })) {
    results.push(item);
  }

  assertEqual(results.length, 5, "Fetched all 5 items across 3 pages");
  assertEqual(results.join(","), "1,2,3,4,5", "Items in correct order");
  assertEqual(getCallCount(), 3, "Made 3 page requests");
}

async function testMaxItems() {
  console.log("\nMaxItems limit:");
  const { fn, getCallCount } = mockPages([
    { data: [1, 2, 3], has_more: true },
    { data: [4, 5, 6], has_more: true },
    { data: [7, 8, 9], has_more: false },
  ]);

  const results: number[] = [];
  for await (const item of paginate(fn, { limit: 3, maxItems: 5 })) {
    results.push(item);
  }

  assertEqual(results.length, 5, "Stopped at maxItems=5");
  assertEqual(results.join(","), "1,2,3,4,5", "Correct items before limit");
  assertEqual(getCallCount(), 2, "Only fetched 2 pages (not all)");
}

async function testEmptyFirstPage() {
  console.log("\nEmpty first page:");
  const { fn } = mockPages([
    { data: [], has_more: false },
  ]);

  const results: number[] = [];
  for await (const item of paginate(fn)) {
    results.push(item);
  }

  assertEqual(results.length, 0, "No items from empty page");
}

async function testEmptyMiddlePage() {
  console.log("\nEmpty middle page (safety check):");
  const { fn } = mockPages([
    { data: [1, 2], has_more: true },
    { data: [], has_more: true },  // Empty but has_more=true — should stop
    { data: [3, 4], has_more: false },
  ]);

  const results: number[] = [];
  for await (const item of paginate(fn, { limit: 2 })) {
    results.push(item);
  }

  assertEqual(results.length, 2, "Stopped at empty page (safety)");
  assertEqual(results.join(","), "1,2", "Only items before empty page");
}

async function testCollectAll() {
  console.log("\ncollectAll helper:");
  const { fn } = mockPages([
    { data: ["a", "b"], has_more: true },
    { data: ["c"], has_more: false },
  ]);

  const results = await collectAll(fn, { limit: 2 });

  assertEqual(results.length, 3, "Collected all items");
  assertEqual(results.join(","), "a,b,c", "Items in correct order");
}

async function testCollectAllEmpty() {
  console.log("\ncollectAll with empty result:");
  const { fn } = mockPages([
    { data: [], has_more: false },
  ]);

  const results = await collectAll(fn);

  assertEqual(results.length, 0, "Empty result");
}

async function testCollectAllMaxItems() {
  console.log("\ncollectAll with maxItems:");
  const { fn } = mockPages([
    { data: [1, 2, 3], has_more: true },
    { data: [4, 5, 6], has_more: false },
  ]);

  const results = await collectAll(fn, { limit: 3, maxItems: 4 });

  assertEqual(results.length, 4, "Stopped at maxItems");
  assertEqual(results.join(","), "1,2,3,4", "Correct items");
}

async function testDefaultLimit() {
  console.log("\nDefault limit (50):");
  let receivedLimit = 0;
  const fn = async (params: { limit: number; offset: number }): Promise<Page<number>> => {
    receivedLimit = params.limit;
    return { data: [1], has_more: false };
  };

  for await (const _ of paginate(fn)) {
    // consume
  }

  assertEqual(receivedLimit, 50, "Default limit is 50");
}

async function testCustomLimit() {
  console.log("\nCustom limit:");
  let receivedLimit = 0;
  const fn = async (params: { limit: number; offset: number }): Promise<Page<number>> => {
    receivedLimit = params.limit;
    return { data: [1], has_more: false };
  };

  for await (const _ of paginate(fn, { limit: 25 })) {
    // consume
  }

  assertEqual(receivedLimit, 25, "Custom limit passed through");
}

async function testOffsetTracking() {
  console.log("\nOffset tracking:");
  const offsets: number[] = [];
  let callNum = 0;

  const fn = async (params: { limit: number; offset: number }): Promise<Page<number>> => {
    offsets.push(params.offset);
    callNum++;
    if (callNum === 1) return { data: [1, 2], has_more: true };
    if (callNum === 2) return { data: [3, 4], has_more: true };
    return { data: [5], has_more: false };
  };

  const results: number[] = [];
  for await (const item of paginate(fn, { limit: 2 })) {
    results.push(item);
  }

  assertEqual(offsets.join(","), "0,2,4", "Offsets: 0, 2, 4");
  assertEqual(results.length, 5, "All items fetched");
}

async function testSingleItemPages() {
  console.log("\nSingle item per page:");
  const { fn, getCallCount } = mockPages([
    { data: [1], has_more: true },
    { data: [2], has_more: true },
    { data: [3], has_more: true },
    { data: [4], has_more: false },
  ]);

  const results: number[] = [];
  for await (const item of paginate(fn, { limit: 1 })) {
    results.push(item);
  }

  assertEqual(results.length, 4, "4 single-item pages");
  assertEqual(getCallCount(), 4, "4 requests made");
}

async function testMaxItemsExactPageBoundary() {
  console.log("\nMaxItems at exact page boundary:");
  const { fn, getCallCount } = mockPages([
    { data: [1, 2], has_more: true },
    { data: [3, 4], has_more: true },
  ]);

  const results: number[] = [];
  for await (const item of paginate(fn, { limit: 2, maxItems: 2 })) {
    results.push(item);
  }

  assertEqual(results.length, 2, "Stopped exactly at maxItems");
  assertEqual(getCallCount(), 1, "Only 1 page fetched");
}

async function testWithObjectItems() {
  console.log("\nWith object items (real-world pattern):");
  const pages: Array<Page<{ id: string; name: string }>> = [
    { data: [{ id: "1", name: "a" }, { id: "2", name: "b" }], has_more: true },
    { data: [{ id: "3", name: "c" }], has_more: false },
  ];
  const { fn } = mockPages(pages);

  const results: Array<{ id: string; name: string }> = [];
  for await (const item of paginate(fn, { limit: 2 })) {
    results.push(item);
  }

  assertEqual(results.length, 3, "3 object items");
  assertEqual(results[0].id, "1", "First object id");
  assertEqual(results[2].name, "c", "Last object name");
}

async function testYieldSyntax() {
  console.log("\nyield* syntax (generator delegation):");
  // Verify paginate returns a proper AsyncGenerator
  const { fn } = mockPages([{ data: [1, 2, 3], has_more: false }]);
  const gen = paginate(fn);

  assert(typeof gen.next === "function", "Has next() method");
  assert(typeof gen[Symbol.asyncIterator] === "function", "Is async iterable");

  const result = await gen.next();
  assertEqual(result.value, 1, "First yield returns 1");
  assertEqual(result.done, false, "Not done after first yield");
}

// ─── Run all ────────────────────────────────────────────────────────────────

async function runAll() {
  console.log("🪝 HookSniff SDK — Pagination Tests\n");

  await testSinglePage();
  await testMultiplePages();
  await testMaxItems();
  await testEmptyFirstPage();
  await testEmptyMiddlePage();
  await testCollectAll();
  await testCollectAllEmpty();
  await testCollectAllMaxItems();
  await testDefaultLimit();
  await testCustomLimit();
  await testOffsetTracking();
  await testSingleItemPages();
  await testMaxItemsExactPageBoundary();
  await testWithObjectItems();
  await testYieldSyntax();

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
