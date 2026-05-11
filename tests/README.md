# 🧪 HookSniff Test Guide

> Comprehensive testing documentation for the HookSniff webhook delivery platform.
>
> Last updated: 2026-05-12

---

## Table of Contents

1. [Unit Tests (Rust — cargo test)](#1-unit-tests-rust--cargo-test)
2. [Integration Tests](#2-integration-tests)
3. [Contract Tests (Schemathesis)](#3-contract-tests-schemathesis)
4. [Property Tests (proptest)](#4-property-tests-proptest)
5. [Frontend Unit Tests (Vitest)](#5-frontend-unit-tests-vitest)
6. [Accessibility Tests (axe-core)](#6-accessibility-tests-axe-core)
7. [Visual Regression Tests (Playwright)](#7-visual-regression-tests-playwright)
8. [Load Tests (k6)](#8-load-tests-k6)
9. [SDK Tests](#9-sdk-tests)
10. [CI Integration](#10-ci-integration)

---

## 1. Unit Tests (Rust — cargo test)

### What it tests
- API handler logic (request parsing, validation, response formatting)
- Database operations (queries, migrations, transactions)
- Authentication & authorization (JWT, API keys, OAuth)
- Webhook delivery logic (signing, retries, rate limiting)
- Worker background tasks (delivery queue, dead letter queue)
- Middleware (CORS, logging, error handling)
- SSRF protection, input sanitization

### How to run

```bash
# Run all API unit tests
cd api && cargo test --lib

# Run worker unit tests
cd worker && cargo test --lib

# Run with verbose output
cd api && cargo test --lib -- --nocapture

# Run specific test module
cd api && cargo test --lib db::tests

# Run with coverage (requires cargo-tarpaulin)
cd api && cargo tarpaulin --out Html --skip-clean
```

### Test count
- **API:** ~993 tests
- **Worker:** ~48 tests
- **Total:** ~1041 tests

### Key test files
- `api/src/db.rs` — Database layer (16+ tests)
- `api/src/auth.rs` — Authentication (JWT, API keys, OAuth)
- `api/src/routes/` — HTTP handlers
- `api/src/middleware/` — Request middleware
- `worker/src/delivery.rs` — Webhook delivery logic

---

## 2. Integration Tests

### What it tests
- End-to-end API request/response flows
- Database + Redis interaction
- Full webhook delivery pipeline (create → deliver → status)
- Multi-tenant isolation
- Rate limiting behavior
- Idempotency guarantees

### How to run

```bash
# Integration tests require a running database + Redis
# Set environment variables:
export DATABASE_URL="postgresql://..."
export REDIS_URL="redis://..."

# Run integration tests
cd api && cargo test --test '*'

# Or run specific integration test
cd api && cargo test --test integration_webhooks
```

### Prerequisites
- PostgreSQL database (local or Neon)
- Redis instance (local or Upstash)
- Valid `.env` file with credentials

---

## 3. Contract Tests (Schemathesis)

### What it tests
- API conformance to OpenAPI specification
- Request/response schema validation
- Edge cases (invalid inputs, boundary values)
- HTTP method coverage
- Content-type negotiation

### How to run

```bash
# Install schemathesis (Python)
pip install schemathesis

# Run contract tests against local API
schemathesis run http://localhost:3000/openapi.json \
  --checks all \
  --hypothesis-max-examples=100

# Run against production (read-only tests)
schemathesis run https://hooksniff-api-1046140057667.europe-west1.run.app/openapi.json \
  --checks all \
  --dry-run

# Generate report
schemathesis run http://localhost:3000/openapi.json \
  --junit-xml=contract-tests.xml
```

### What it validates
- ✅ All endpoints match their OpenAPI schema
- ✅ Response codes match documented values
- ✅ Required fields are present
- ✅ No undocumented 500 errors
- ✅ Content-type headers are correct

### OpenAPI Spec
- Located at: `docs/openapi.yaml` (3171 lines)
- Served at: `GET /openapi.json`

---

## 4. Property Tests (proptest)

### What it tests
- Webhook signature verification (any valid/invalid input)
- URL validation (SSRF protection)
- JSON serialization roundtrips
- Pagination boundary conditions
- Rate limiter counter correctness
- Input sanitization invariants

### How to run

```bash
# Property tests are included in cargo test
cd api && cargo test --lib proptest

# Run with more iterations (default: 256)
cd api && PROPTEST_CASES=10000 cargo test --lib proptest
```

### Key property tests
- `signature_proptest` — For any key+payload, valid sig verifies, invalid rejects
- `url_validation_proptest` — Private IPs, loopback, metadata endpoints blocked
- `pagination_proptest` — Any offset/limit returns correct slice
- `json_roundtrip_proptest` — Serialize → deserialize = identity

---

## 5. Frontend Unit Tests (Vitest)

### What it tests
- React component rendering
- State management (Zustand store)
- API client logic (fetch, retry, token refresh)
- User interactions (click, type, submit)
- Routing behavior
- Error boundaries
- Toast notifications
- i18n translation keys

### How to run

```bash
cd dashboard

# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- --testPathPattern=endpoints-page

# Run with coverage
npx vitest run --coverage
```

### Test count
- **60+ test files** covering all major pages and components
- Located in: `dashboard/src/__tests__/`

### Key test files
| File | What it tests |
|------|--------------|
| `dashboard-page-extended.test.tsx` | Dashboard home, stats, charts |
| `endpoints-page-extended.test.tsx` | CRUD, validation, bulk actions |
| `deliveries-page-extended.test.tsx` | List, filter, replay, pagination |
| `settings-page.test.tsx` | Settings form, theme toggle |
| `store-comprehensive.test.tsx` | Zustand store state management |
| `routing-extended.test.tsx` | Navigation, auth guards |
| `ErrorBoundary-ultra.test.tsx` | Error recovery, fallback UI |

### Test setup
- Uses **Vitest** (not Jest) for speed
- **jsdom** environment for DOM testing
- **@testing-library/react** for component testing
- Common mocks: `next-intl`, `@/lib/store`, `@/lib/api`, `recharts`

---

## 6. Accessibility Tests (axe-core)

### What it tests
- **WCAG 2.1 AA compliance** for all pages
- Color contrast ratios
- ARIA roles and attributes
- Form label associations
- Keyboard navigation support
- Image alt text
- Heading hierarchy
- Link text clarity
- Focus management

### How to run

```bash
cd dashboard

# Run a11y tests (included in main test suite)
npm test -- --testPathPattern=a11y

# Run only a11y tests
npx vitest run src/__tests__/a11y/
```

### Test file
- `dashboard/src/__tests__/a11y/accessibility.test.tsx`

### Pages tested
| Category | Pages |
|----------|-------|
| **Dashboard** | Home, Endpoints, Deliveries, Settings, Alerts, API Keys, Team, Health, Notifications, Logs, Analytics |
| **Admin** | Overview, Users, Revenue, System, Settings |
| **Public** | Landing, Pricing, Login, Status, FAQ, Contact |

### Dependencies
- `@axe-core/react` — Runtime a11y checker (development)
- `jest-axe` — Test matcher for axe-core results

### What gets flagged
- ❌ Missing `alt` attributes on images
- ❌ Insufficient color contrast (< 4.5:1 ratio)
- ❌ Missing form labels
- ❌ Invalid ARIA attributes
- ❌ Missing `lang` attribute
- ❌ Empty buttons/links
- ❌ Skipped heading levels

---

## 7. Visual Regression Tests (Playwright)

### What it tests
- **Pixel-level visual consistency** across deployments
- Layout correctness (spacing, alignment, sizing)
- Dark mode rendering
- Mobile responsive behavior
- Chart/graph rendering
- Font rendering
- Component states (loading, error, empty)

### How to run

```bash
cd dashboard

# Install Playwright browsers (first time)
npx playwright install

# Run visual tests
npm run test:visual

# Update baseline snapshots (after intentional UI changes)
npm run test:visual:update

# Run specific test
npx playwright test e2e/visual/dashboard.spec.ts

# Run on specific browser
npx playwright test --project=chromium-desktop

# View HTML report
npx playwright show-report
```

### Test file
- `dashboard/e2e/visual/dashboard.spec.ts`

### Screenshots captured
| Page | Light | Dark | Mobile |
|------|-------|------|--------|
| Dashboard Home | ✅ | ✅ | ✅ |
| Endpoints List | ✅ | ✅ | ✅ |
| Deliveries | ✅ | — | ✅ |
| Settings | ✅ | ✅ | ✅ |
| Admin Overview | ✅ | — | — |
| Admin Users | ✅ | — | — |
| Admin Revenue | ✅ | — | — |
| Landing Page | ✅ | ✅ | ✅ |
| Pricing | ✅ | — | — |
| Login | ✅ | — | — |

### Baseline management
- Baselines stored in: `dashboard/e2e/visual/__screenshots__/`
- Separate baselines per browser (chromium, firefox, webkit)
- Separate baselines per viewport (desktop, mobile)
- **Tolerance:** 2% pixel difference (desktop), 3% (mobile)

### When to update baselines
- After intentional UI changes (new components, style updates)
- After Tailwind config changes
- After font changes
- **Never** update baselines to hide regressions — investigate first!

---

## 8. Load Tests (k6)

### What it tests
- API throughput under load
- Response time percentiles (p50, p95, p99)
- Error rate under stress
- Concurrent webhook delivery performance
- Database connection pool behavior
- Redis cache hit rate
- Rate limiter effectiveness

### How to run

```bash
# Install k6
# macOS: brew install k6
# Linux: https://k6.io/docs/getting-started/installation/

# Run load test against local API
k6 run tests/load/api-load-test.js

# Run against production (careful!)
k6 run --env BASE_URL=https://hooksniff-api-*.europe-west1.run.app tests/load/api-load-test.js

# Run with custom parameters
k6 run --vus 50 --duration 5m tests/load/api-load-test.js

# Generate HTML report
k6 run --out json=results.json tests/load/api-load-test.js
```

### Key metrics
| Metric | Target |
|--------|--------|
| p50 response time | < 50ms |
| p95 response time | < 200ms |
| p99 response time | < 500ms |
| Error rate | < 0.1% |
| Throughput | > 1000 req/s |

### Test scenarios
1. **Ramp-up** — Gradually increase VUs from 0 to 100
2. **Steady state** — 50 VUs for 5 minutes
3. **Spike** — Sudden burst to 200 VUs
4. **Soak** — 20 VUs for 30 minutes (memory leaks)

---

## 9. SDK Tests

### What it tests
- 11 language SDKs: Node.js, Python, Go, Rust, Java, Ruby, Kotlin, PHP, C#, Elixir, Swift
- Webhook signature verification
- Model serialization/deserialization
- Pagination (single page, multi page, empty, max pages)
- Resource operations (list, get, delete)
- HTTP client behavior (auth, retries, error handling)

### How to run

```bash
# Run all SDK tests (requires language toolchains)
cd sdks && ./run-tests.sh

# Run specific SDK
cd sdks && make test-node    # Node.js (211 tests)
cd sdks && make test-python  # Python (77 tests)
cd sdks && make test-go      # Go (68 tests)

# Quick test (Node.js + Python only, no extra toolchains)
cd sdks && make test
```

### Test count
| SDK | Tests | Status |
|-----|-------|--------|
| Node.js | 211 | ✅ |
| Python | 77 | ✅ |
| Go | 68 | ✅ |
| Rust | 55 | ✅ |
| Java | 26 | ✅ |
| Ruby | 81 | ✅ |
| Kotlin | 23 | ✅ |
| PHP | 25 | ✅ |
| C# | 23 | ✅ |
| Elixir | 24 | ✅ |
| Swift | 24 | ✅ |
| **Total** | **~637** | |

---

## 10. CI Integration

### GitHub Actions

All test types run in CI:

```yaml
# .github/workflows/test.yml (simplified)
name: Tests
on: [push, pull_request]

jobs:
  rust-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd api && cargo test --lib
      - run: cd worker && cargo test --lib

  frontend-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd dashboard && npm ci && npm test

  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd dashboard && npm ci && npm test -- --testPathPattern=a11y

  visual:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd dashboard && npm ci && npx playwright install
      - run: cd dashboard && npm run test:visual

  contract:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install schemathesis
      - run: schemathesis run http://localhost:3000/openapi.json --checks all

  sdk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd sdks && make test
```

### Local CI Script

```bash
# Run the full local CI pipeline
./scripts/ci-local.sh

# This runs:
# 1. cargo clippy (lint)
# 2. cargo test --lib (unit tests)
# 3. npm test (frontend tests)
# 4. npm run test:visual (visual regression)
# 5. schemathesis (contract tests)
```

### Test Results

| Test Type | CI Status | Coverage |
|-----------|-----------|----------|
| Rust unit tests | ✅ Required | ~1041 tests |
| Frontend unit | ✅ Required | 60+ files |
| a11y tests | ✅ Required | 20 pages |
| Visual regression | ✅ Required | 20 screenshots |
| Contract tests | ✅ Required | All endpoints |
| SDK tests | ✅ Required | ~637 tests |
| Load tests | ⚠️ Manual | On-demand |

---

## Quick Reference

```bash
# ── Run Everything Locally ──
./scripts/ci-local.sh

# ── Rust ──
cd api && cargo test --lib          # API tests
cd worker && cargo test --lib       # Worker tests
cd api && cargo clippy              # Lint

# ── Frontend ──
cd dashboard && npm test            # Unit tests
cd dashboard && npm test -- --testPathPattern=a11y  # a11y tests
cd dashboard && npm run test:visual # Visual regression
cd dashboard && npm run test:visual:update  # Update baselines

# ── API Contract ──
schemathesis run http://localhost:3000/openapi.json --checks all

# ── SDKs ──
cd sdks && make test                # Node.js + Python
cd sdks && ./run-tests.sh           # All 11 SDKs

# ── Load ──
k6 run tests/load/api-load-test.js
```

---

## Writing New Tests

### Rust unit test
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_my_function() {
        let result = my_function("input");
        assert_eq!(result, "expected");
    }

    #[tokio::test]
    async fn test_async_function() {
        let result = async_function().await;
        assert!(result.is_ok());
    }
}
```

### Vitest component test
```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### a11y test
```tsx
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('has no a11y violations', async () => {
  const { container } = render(<MyPage />);
  expect(await axe(container)).toHaveNoViolations();
});
```

### Visual regression test
```tsx
import { test, expect } from '@playwright/test';

test('page screenshot matches', async ({ page }) => {
  await page.goto('/my-page');
  await expect(page).toHaveScreenshot('my-page.png', {
    maxDiffPixelRatio: 0.02,
  });
});
```
