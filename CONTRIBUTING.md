# Contributing to HookSniff

Thanks for your interest in contributing! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Prerequisites](#prerequisites)
- [Quick Setup](#quick-setup)
- [Project Structure](#project-structure)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Database Migrations](#database-migrations)
- [Adding API Endpoints](#adding-api-endpoints)
- [Adding Dashboard Pages](#adding-dashboard-pages)
- [Working with SDKs](#working-with-sdks)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Prerequisites

- [Rust](https://rustup.rs/) 1.82+
- [Node.js](https://nodejs.org/) 20+
- [Docker](https://docker.com/) & Docker Compose
- [protoc](https://grpc.io/docs/protoc-installation/) (for future gRPC delivery support)

## Quick Setup

```bash
git clone https://github.com/servetarslan02/HookSniff.git
cd HookSniff
cp .env.example .env
make local
```

- **API**: http://localhost:3000
- **Dashboard**: http://localhost:3001
- **Swagger UI**: http://localhost:3000/v1/docs

### Useful Make Commands

```bash
make local        # Start everything (PostgreSQL + API + Worker + Dashboard)
make stop         # Stop all services
make restart      # Restart all services
make reset        # Reset everything (including DB)
make logs         # Tail all logs
make logs-api     # API logs only
make logs-worker  # Worker logs only
make build        # Build Docker images
make status       # Show service status
```

## Project Structure

```
HookSniff/
├── api/                        # Rust API server (Axum) — 81 files, ~22K lines
│   └── src/
│       ├── main.rs             # Entry point, router setup, background jobs
│       ├── routes/             # 30 route modules (see below)
│       ├── middleware/          # Auth (JWT + API key), rate limiting, idempotency
│       ├── models/             # Customer, Endpoint, Delivery models
│       ├── billing/            # Polar.sh, iyzico, Stripe integrations
│       ├── signing.rs          # Standard Webhooks HMAC-SHA256
│       ├── ssrf.rs             # SSRF protection (private IP blocking)
│       ├── validation.rs       # Input validation (event type, URL, JSON depth)
│       ├── rate_limit.rs       # Sliding window rate limiter (in-memory + Redis)
│       ├── throttle/           # Per-endpoint throttling (token bucket)
│       ├── fifo/               # FIFO ordered delivery
│       ├── retry_policy/       # Exponential backoff with jitter
│       ├── transform/          # Payload transformation (templates, filters)
│       ├── schemas/            # JSON schema registry + validation
│       ├── events/             # CloudEvents v1.0 format
│       ├── ws/                 # WebSocket handler
│       ├── email.rs            # Gmail API client (GCP service account)
│       ├── telemetry.rs        # OpenTelemetry + trace ID middleware
│       ├── circuit_breaker.rs  # Circuit breaker for failing endpoints
│       ├── config.rs           # Environment variable configuration
│       └── db.rs               # Database pool + migrations
├── worker/                     # Rust delivery worker
│   └── src/
│       ├── main.rs             # PostgreSQL LISTEN/NOTIFY + polling
│       ├── delivery/           # HTTP delivery router
│       └── signing.rs          # Webhook signing for deliveries
├── dashboard/                  # Next.js 15 — 76 files, 41 pages
│   └── src/
│       ├── app/[locale]/       # App Router with i18n
│       │   ├── page.tsx        # Landing page (typewriter, particles, pricing)
│       │   ├── login/          # Auth pages
│       │   ├── dashboard/      # 20+ dashboard pages
│       │   ├── admin/          # Admin panel (users, revenue, system)
│       │   ├── docs/           # API docs, SDK docs
│       │   └── ...             # FAQ, status, about, contact, privacy, terms
│       ├── components/         # React components (StatCard, ChartCard, etc.)
│       ├── lib/                # API client, store, utilities
│       ├── i18n/               # Internationalization setup
│       └── hooks/              # Custom hooks (useDeliveryStream)
├── sdks/                       # 11 SDK packages
│   ├── node/                   # TypeScript (hooksniff-sdk)
│   ├── python/                 # Python (hooksniff)
│   ├── go/                     # Go (hooksniff-go)
│   ├── rust/                   # Rust (hooksniff)
│   ├── ruby/                   # Ruby (hooksniff)
│   ├── java/                   # Java (com.hooksniff)
│   ├── kotlin/                 # Kotlin (com.hooksniff)
│   ├── php/                    # PHP (hooksniff/hooksniff)
│   ├── csharp/                 # C# (HookSniff)
│   ├── elixir/                 # Elixir (hooksniff)
│   └── swift/                  # Swift (HookSniff)
├── cli/                        # CLI tool
├── portal/                     # Embeddable portal widget
├── docs/                       # Documentation
│   ├── openapi.yaml            # OpenAPI 3.0 spec
│   ├── api-reference.md        # API reference
│   ├── quickstart.md           # Quickstart guide
│   ├── ARCHITECTURE.md         # System architecture
│   ├── SECURITY.md             # Webhook signature verification
│   ├── CONTRIBUTING.md         # Contributing guide (detailed)
│   ├── DEPLOYMENT.md           # Deployment guide
│   └── SELF-HOST.md            # Self-hosting guide
├── migrations/                 # PostgreSQL migration scripts
├── monitoring/                 # Grafana + OpenTelemetry config
├── tests/                      # Integration + load tests
│   ├── integration/            # Integration test scripts
│   ├── load/                   # k6 load tests
│   └── fixtures/               # Test fixtures
├── scripts/                    # Utility scripts
├── docker-compose.yml          # Local development
├── Dockerfile.api              # API container (multi-stage Rust build)
├── Dockerfile.worker           # Worker container
├── Dockerfile.dashboard        # Dashboard container
├── Makefile                    # Common commands
└── .github/
    ├── workflows/
    │   ├── ci.yml              # Lint, test, build, security audit
    │   ├── deploy.yml          # Cloud Run deploy (triggered by CI)
    │   └── release.yml         # GHCR release on tags
    ├── dependabot.yml          # Cargo, npm, GitHub Actions
    ├── ISSUE_TEMPLATE/         # Bug report, feature request
    ├── PULL_REQUEST_TEMPLATE.md
    └── FUNDING.yml             # GitHub Sponsors
```

### API Route Modules (31 modules)

| Module | Endpoints | Description |
|--------|-----------|-------------|
| `auth` | `/v1/auth/*` | Register, login, 2FA, email verify, password reset, GDPR export/delete |
| `endpoints` | `/v1/endpoints/*` | CRUD, secret rotation, retry policy |
| `webhooks` | `/v1/webhooks/*` | Send, list, get, replay, batch, export |
| `billing` | `/v1/billing/*` | Subscription, upgrade, portal, usage, invoices |
| `admin` | `/v1/admin/*` | User management, plan changes, system stats, revenue |
| `analytics` | `/v1/analytics/*` | Delivery trends, success rates, latency (24h/7d/30d) |
| `search` | `/v1/search` | Full-text search across deliveries |
| `stream` | `/v1/stream/*` | SSE real-time delivery updates |
| `events` | `/v1/events` | Polling endpoint (alternative to SSE) |
| `alerts` | `/v1/alerts/*` | Alert rules with conditions and channels |
| `api_keys` | `/v1/api-keys/*` | CRUD, rotation |
| `playground` | `/v1/playground/*` | Test webhooks with sample payloads |
| `simulator` | `/v1/simulator` | Mock webhook delivery |
| `embed` | `/v1/embed/*` | Embeddable portal widget |
| `health_endpoints` | `/v1/endpoint-health/*` | Per-endpoint health metrics |
| `routing` | `/v1/routing/*` | Smart routing (round-robin, latency, failover) |
| `schemas` | `/v1/schemas/*` | JSON schema registry + validation |
| `templates` | `/v1/templates/*` | Webhook templates by industry |
| `transforms` | `/v1/endpoints/{id}/transforms/*` | Payload transformation rules |
| `teams` | `/v1/teams/*` | Team CRUD, invites, roles |
| `notifications` | `/v1/notifications/*` | In-app notifications |
| `devices` | `/v1/devices/*` | FCM push notification tokens |
| `contact` | `/v1/contact` | Contact form |
| `customer_portal` | `/v1/portal/*` | Self-service portal |
| `delivery_details` | `/v1/webhooks/{id}/details` | Detailed delivery info |
| `inbound` | `/v1/inbound/*` | Inbound webhook proxy (Stripe, GitHub, Shopify) |
| `outbound_ips` | `/v1/outbound-ips` | Static IP list for whitelisting |
| `docs` | `/v1/docs` | Swagger UI |

## Code Style

### Rust

- **Format**: `cargo fmt` (enforced in CI — `cargo fmt --check`)
- **Lint**: `cargo clippy -- -D warnings` (enforced in CI)
- **Logging**: `tracing` macros (`info!`, `warn!`, `error!`, `debug!`), not `println!`
- **Errors**: `anyhow::Result` for propagation, `thiserror` for custom `AppError` type
- **Async**: Tokio runtime, `async fn` everywhere
- **Docs**: `///` doc comments on public items

### TypeScript (Dashboard)

- **Format**: Prettier (included)
- **Lint**: ESLint (enforced in CI — `npm run lint`)
- **Components**: Functional components with hooks
- **TypeScript**: Strict mode
- **Styling**: Tailwind CSS with dark mode (`dark:` prefix)
- **i18n**: `next-intl` with `useTranslations()` hook
- **State**: Zustand store (`lib/store.tsx`)

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add webhook signature verification
fix: correct rate limit window reset
docs: update deployment guide
refactor: extract delivery logic into separate module
test: add integration tests for endpoint CRUD
chore: update dependencies
ci: add security audit step
perf: optimize database query for webhook listing
```

- Lowercase imperative mood
- Max 72 characters subject
- Reference issues: `fix: resolve null pointer (#123)`

## Pull Request Process

1. **Branch** from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```

2. **Make changes** following code style guidelines.

3. **Test locally**:
   ```bash
   cargo fmt --check
   cargo clippy -- -D warnings
   cargo test --workspace
   cd dashboard && npm run lint && npm run build
   ```

4. **Submit PR** with clear description, linked issue, screenshots for UI.

5. **Code review** — at least one approval required.

6. **Squash and merge** to `main`.

## Testing

```bash
# Unit tests
cargo test

# Specific test
cargo test test_name

# With output
cargo test -- --nocapture

# Integration tests (requires running infrastructure)
./tests/integration_test.sh

# Load tests
k6 run tests/load/k6_load_test.js
```

## Database Migrations

1. Create migration in `migrations/`:
   ```
   migrations/020_add_feature.sql
   ```

2. Write SQL (up migration only):
   ```sql
   ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS new_feature TEXT;
   CREATE INDEX IF NOT EXISTS idx_endpoints_feature ON endpoints(new_feature);
   ```

3. Migrations run automatically on API startup (`db.rs`).

4. Include the migration in your PR.

## Adding API Endpoints

1. Create handler in `api/src/routes/my_feature.rs`:
   ```rust
   use axum::{routing::get, Router};
   
   pub fn router() -> Router {
       Router::new().route("/", get(list_items))
   }
   
   async fn list_items() -> &'static str { "ok" }
   ```

2. Register in `api/src/routes/mod.rs`:
   ```rust
   pub mod my_feature;
   // In api_router():
   .nest("/my-feature", my_feature::router())
   ```

3. Choose auth layer:
   - Protected (JWT/API key): add to `protected` router
   - Public: add to top-level `Router::new()`
   - Admin only: add to `admin_routes`

4. Write tests.

5. Update `docs/openapi.yaml`.

## Adding Dashboard Pages

1. Create page in `dashboard/src/app/[locale]/dashboard/my-page/page.tsx`.

2. Add translations to `dashboard/messages/` (all 6 locale files).

3. Add navigation link in the sidebar component.

4. Use existing components: `StatCard`, `ChartCard`, `StatusBadge`, `LoadingSpinner`.

5. API calls go through `lib/api.ts`.

## Working with SDKs

Each SDK in `sdks/` is a standalone package. When updating:

1. Update the SDK source
2. Bump version in package manifest
3. Run tests
4. Update changelog

## Questions?

- [GitHub Discussions](https://github.com/servetarslan02/HookSniff/discussions)
- [Issues](https://github.com/servetarslan02/HookSniff/issues)

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
